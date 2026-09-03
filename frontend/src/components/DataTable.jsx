import { useRef, useState, useEffect, useCallback, useMemo } from 'react';

import './dataTable.css'; // adjust import path as needed

const parseNumericValue = (val) => {
    if (val == null || val === '' || val === '-') return -Infinity;
    if (typeof val === 'number') return val;

    const str = String(val).trim();

    // Convert time strings like "15m 30s" into total seconds (930) for accurate sorting
    if (str.includes('m') || str.includes('s')) {
        const minMatch = str.match(/(\d+)m/);
        const secMatch = str.match(/(\d+)s/);
        const min = minMatch ? parseInt(minMatch[1], 10) : 0;
        const sec = secMatch ? parseInt(secMatch[1], 10) : 0;
        return min * 60 + sec;
    }

    // Handles "35(7)" -> 35, "2005m" -> 2005, "7487.04" -> 7487.04
    const cleanStr = str.split('(')[0].replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? -Infinity : num;
};


export const DataTable = ({ columns, data = [] }) => {
    const tableRef = useRef(null);
    const dragState = useRef({ active: false, startX: 0, startScroll: 0 });
    const [sliderValue, setSliderValue] = useState(0);
    const [sliderMax, setSliderMax] = useState(0);

    // Sorting State: { key: string|null, direction: 'desc' | 'asc' | null }
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    // 3-Step Toggle: 1st -> 'desc' (Big to Small), 2nd -> 'asc' (Small to Big), 3rd -> null (Default)
    const handleSort = (columnKey) => {
        let nextDirection = 'desc';
        if (sortConfig.key === columnKey) {
            if (sortConfig.direction === 'desc') {
                nextDirection = 'asc';
            } else if (sortConfig.direction === 'asc') {
                nextDirection = null;
            }
        }

        setSortConfig({
            key: nextDirection ? columnKey : null,
            direction: nextDirection,
        });
    };

    // Numeric sort execution
    const sortedData = useMemo(() => {
        if (!sortConfig.key || !sortConfig.direction) return data;

        const col = columns.find((c) => (c.key || c.accessor) === sortConfig.key);
        if (!col) return data;

        return [...data].sort((a, b) => {
            const rawA = col.sortValue ? col.sortValue(a) : a[col.accessor];
            const rawB = col.sortValue ? col.sortValue(b) : b[col.accessor];

            const aNum = parseNumericValue(rawA);
            const bNum = parseNumericValue(rawB);

            if (aNum < bNum) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aNum > bNum) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, sortConfig, columns]);

    const updateMax = useCallback(() => {
        if (!tableRef.current) return;
        const max = tableRef.current.scrollWidth - tableRef.current.clientWidth;
        setSliderMax(Math.max(0, Math.round(max)));
        setSliderValue(Math.round(tableRef.current.scrollLeft));
    }, []);

    useEffect(() => {
        const container = tableRef.current;
        if (!container) return;

        updateMax();
        const resizeObserver = new ResizeObserver(() => updateMax());
        resizeObserver.observe(container);

        const imgs = Array.from(container.querySelectorAll('img'));
        imgs.forEach((img) => img.addEventListener('load', updateMax));

        return () => {
            resizeObserver.disconnect();
            imgs.forEach((img) => img.removeEventListener('load', updateMax));
        };
    }, [data, updateMax]);

    const handleScroll = () => {
        if (!tableRef.current) return;
        setSliderValue(tableRef.current.scrollLeft);
    };

    const handleSliderChange = (event) => {
        const value = Math.round(Number(event.target.value));
        if (!tableRef.current) return;
        tableRef.current.scrollLeft = value;
        setSliderValue(value);
    };

    const handlePointerMoveGlobal = (event) => {
        if (!dragState.current.active || !tableRef.current) return;
        event.preventDefault();
        const offset = event.clientX - dragState.current.startX;
        const nextScroll = dragState.current.startScroll - offset;
        const max = tableRef.current.scrollWidth - tableRef.current.clientWidth;
        const clamped = Math.max(0, Math.min(nextScroll, Math.max(0, Math.round(max))));
        tableRef.current.scrollLeft = clamped;
        setSliderValue(Math.round(clamped));
    };

    const stopDraggingGlobal = (event) => {
        if (!dragState.current.active) return;
        dragState.current.active = false;
        window.removeEventListener("pointermove", handlePointerMoveGlobal);
        window.removeEventListener("pointerup", stopDraggingGlobal);
        window.removeEventListener("pointercancel", stopDraggingGlobal);
        if (event?.currentTarget?.releasePointerCapture) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        if (tableRef.current) {
            tableRef.current.classList.remove("dragging");
        }
    };

    const handlePointerDown = (event) => {
        if (!tableRef.current) return;

        // FIX: If the user is clicking a table header (th) or the slider (input), 
        // exit early so we don't block the click event.
        if (event.target.closest('th') || event.target.tagName === 'INPUT') {
            return;
        }

        // 2. Ignore the first two columns (Index 0 and 1) 
        // This allows mobile users to touch these columns to scroll the page vertically
        const closestTd = event.target.closest('td');
        if (closestTd && (closestTd.cellIndex === 0 || closestTd.cellIndex === 1)) {
            return;
        }

        event.preventDefault();
        dragState.current = {
            active: true,
            startX: event.clientX,
            startScroll: tableRef.current.scrollLeft,
        };
        tableRef.current.classList.add("dragging");
        window.addEventListener("pointermove", handlePointerMoveGlobal);
        window.addEventListener("pointerup", stopDraggingGlobal);
        window.addEventListener("pointercancel", stopDraggingGlobal);
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    return (
        <div className="experience-table-card">
            <div
                className="experience-table-wrapper"
                ref={tableRef}
                onScroll={handleScroll}
                onPointerDown={handlePointerDown}
            >
                <table className="experience-table">
                    <thead>
                        <tr>
                            {columns.map((col, index) => {
                                const colKey = col.accessor;
                                // Disable sorting on the first 2 columns (index 0 & 1)
                                const isSortable = index >= 2 && col.sortable !== false;
                                const isSortedKey = sortConfig.key === colKey;

                                return (
                                    <th
                                        key={colKey}
                                        onClick={() => isSortable && handleSort(colKey)}
                                        className={`${isSortable ? 'sortable-header' : ''} ${isSortedKey ? 'active-header' : ''}`}
                                    >
                                        <div className="header-cell-content">
                                            <span className="header-title">{col.header}</span>
                                            {isSortable && (
                                                <div className="sort-arrows-box">
                                                    <div className={`sort-arrow-half up ${isSortedKey && sortConfig.direction === 'asc' ? 'active' : ''}`}>
                                                        ▲
                                                    </div>
                                                    <div className={`sort-arrow-half down ${isSortedKey && sortConfig.direction === 'desc' ? 'active' : ''}`}>
                                                        ▼
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map((row) => (
                            <tr key={row.id}>
                                {columns.map((col, colIndex) => {
                                    const colKey = col.key || col.accessor || colIndex;
                                    const isSortedCol = sortConfig.key === colKey;

                                    return (
                                        <td
                                            key={colKey}
                                            className={isSortedCol ? 'sorted-column-cell' : ''}
                                        >
                                            {col.cell ? col.cell(row) : row[col.accessor]}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="slider-container bottom-slider">
                <input
                    className="scroll-slider"
                    type="range"
                    min="0"
                    max={sliderMax}
                    value={sliderValue}
                    step={1}
                    onChange={handleSliderChange}
                    aria-label="Scroll table"
                />
            </div>
        </div>
    );
};