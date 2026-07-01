import { useEffect, useRef, useState } from "react";
import { Header } from "../../components/Header";
import { SubHeader } from "../../components/SubHeader";
import { Link } from "react-router-dom";
import "./playerInfo.css";

const playerExperience = [
    {
        id: 1,
        year: "2025",
        tournament: "PUBG Americas Series 6",
        team: "BDX Obsidian",
        matches: 42,
        killsHS: "35(7)",
        dmg: "7487.04",
        assists: 23,
        avgDmg: "178.26",
        longestKill: "34",
        logo: "https://wstatic-prod-boc.krafton.com/common/team/20250317/aZIXMx7n/55.png",
    },
    {
        id: 2,
        year: "2025",
        tournament: "Esports World Cup AM Qualifier",
        team: "BDX Obsidian",
        matches: 24,
        killsHS: "17(5)",
        dmg: "4705.24",
        assists: 15,
        avgDmg: "196.05",
        longestKill: "51",
        logo: "https://wstatic-prod-boc.krafton.com/common/team/20250317/aZIXMx7n/55.png",
    },
    {
        id: 3,
        year: "2024",
        tournament: "PUBG Americas Series 4",
        team: "BDX Obsidian",
        matches: 30,
        killsHS: "23(5)",
        dmg: "6669.24",
        assists: 24,
        avgDmg: "222.31",
        longestKill: "31",
        logo: "https://wstatic-prod-boc.krafton.com/common/team/20250317/aZIXMx7n/55.png",
    },
    {
        id: 4,
        year: "2024",
        tournament: "Esports World Cup AM Qualifier",
        team: "BDX Obsidian",
        matches: 24,
        killsHS: "15(4)",
        dmg: "3020.05",
        assists: 6,
        avgDmg: "125.84",
        longestKill: "32",
        logo: "https://wstatic-prod-boc.krafton.com/common/team/20250317/aZIXMx7n/55.png",
    },
    {
        id: 5,
        year: "2024",
        tournament: "PUBG Americas Series 3",
        team: "BDX Obsidian",
        matches: 30,
        killsHS: "26(2)",
        dmg: "5484.82",
        assists: 15,
        avgDmg: "182.83",
        longestKill: "60",
        logo: "https://wstatic-prod-boc.krafton.com/common/team/20250317/aZIXMx7n/55.png",
    },


    {
        id: 6,
        year: "2025",
        tournament: "PUBG Americas Series 6",
        team: "BDX Obsidian",
        matches: 42,
        killsHS: "35(7)",
        dmg: "7487.04",
        assists: 23,
        avgDmg: "178.26",
        longestKill: "34",
        logo: "https://wstatic-prod-boc.krafton.com/common/team/20250317/aZIXMx7n/55.png",
    },
    {
        id: 7,
        year: "2025",
        tournament: "Esports World Cup AM Qualifier",
        team: "BDX Obsidian",
        matches: 24,
        killsHS: "17(5)",
        dmg: "4705.24",
        assists: 15,
        avgDmg: "196.05",
        longestKill: "51",
        logo: "https://wstatic-prod-boc.krafton.com/common/team/20250317/aZIXMx7n/55.png",
    },
    {
        id: 8,
        year: "2024",
        tournament: "PUBG Americas Series 4",
        team: "BDX Obsidian",
        matches: 30,
        killsHS: "23(5)",
        dmg: "6669.24",
        assists: 24,
        avgDmg: "222.31",
        longestKill: "31",
        logo: "https://wstatic-prod-boc.krafton.com/common/team/20250317/aZIXMx7n/55.png",
    },
    {
        id: 9,
        year: "2024",
        tournament: "Esports World Cup AM Qualifier",
        team: "BDX Obsidian",
        matches: 24,
        killsHS: "15(4)",
        dmg: "3020.05",
        assists: 6,
        avgDmg: "125.84",
        longestKill: "32",
        logo: "https://wstatic-prod-boc.krafton.com/common/team/20250317/aZIXMx7n/55.png",
    },
    {
        id: 10,
        year: "2024",
        tournament: "PUBG Americas Series 3",
        team: "BDX Obsidian",
        matches: 30,
        killsHS: "26(2)",
        dmg: "5484.82",
        assists: 15,
        avgDmg: "182.83",
        longestKill: "60",
        logo: "https://wstatic-prod-boc.krafton.com/common/team/20250317/aZIXMx7n/55.png",
    },
];

export const PlayerInfo = () => {
    const tableRef = useRef(null);
    const dragState = useRef({ active: false, startX: 0, startScroll: 0 });
    const [sliderValue, setSliderValue] = useState(0);
    const [sliderMax, setSliderMax] = useState(0);

    useEffect(() => {
        const updateMax = () => {
            if (!tableRef.current) return;
            const max = tableRef.current.scrollWidth - tableRef.current.clientWidth;
            const rounded = Math.max(0, Math.round(max));
            setSliderMax(rounded);
            setSliderValue(Math.round(tableRef.current.scrollLeft));
        };

        updateMax();
        window.addEventListener("resize", updateMax);

        // re-calculate when images inside the table finish loading
        const imgs = tableRef.current ? Array.from(tableRef.current.querySelectorAll('img')) : [];
        imgs.forEach((img) => img.addEventListener('load', updateMax));

        return () => {
            window.removeEventListener("resize", updateMax);
            imgs.forEach((img) => img.removeEventListener('load', updateMax));
        };
    }, []);

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

    const stopDragging = (event) => {
        stopDraggingGlobal(event);
    };

    return (
        <>
            <Header />
            <SubHeader subTitle="" />
            <div className="player-info-container">
                <section className="player-hero">
                    <div className="player-hero-inner">

                        <div className="player-hero-details">

                            <div className="hero-avatar-block">
                                <div className="player-avatar">
                                    <img
                                        src="https://wstatic-prod-boc.krafton.com/entry/player/20240319/sSSzcylR.png"
                                        alt="KerakTMz"
                                    />
                                </div>
                            </div>

                            <div className="player-data">

                                <div className="player-title-row">
                                    <div className="player-name-wrapper">
                                        <Link to="/team-info">
                                        <div className="player-team-logo-wrapper">
                                        <img src="https://wstatic-prod-boc.krafton.com/common/team/20250317/aZIXMx7n/55.png" alt="" className="player-team-logo" />
                                        </div>
                                        </Link>
                                        <h2 className="player-ign">SAiNT ViLLAiN</h2>
                                    </div>
                                </div>

                                <div className="player-details">

                                    <div className="stat-card">
                                        <span className="stat-label">Name/Country</span>

                                        <strong >ML Labib / Bangladesh</strong>

                                    </div>
                                    <div className="stat-card">

                                        <span className="stat-label">Latest Tournament</span>
                                        <strong>PUBG Americas Series 6</strong>
                                    </div>
                                </div>

                                <div className="player-summary-stats">

                                    <div className="stat-card">
                                        <span className="stat-label">Avg. Kill</span>
                                        <strong>0.83</strong>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-label">Avg. Damage</span>
                                        <strong>178.26</strong>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-label">Avg. Survival Time</span>
                                        <strong>20:37</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="player-info-bar">
                    <div className="player-info-bar-inner">
                        <span className="player-info-bar-text">PLAYER INFO</span>
                    </div>
                </div>

                <section className="player-section experience-section">
                    <div className="section-header">
                        <svg
                            className="section-icon"
                            width="32"
                            height="16"
                            viewBox="0 0 32 16"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <path d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z" fill="#EFF923" />
                            <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000" />
                        </svg>
                        <h2>Experiences</h2>
                    </div>

                    <div className="experience-table-card">
                        <div
                            className="experience-table-wrapper"
                            ref={tableRef}
                            onScroll={handleScroll}
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMoveGlobal}
                            onPointerUp={stopDragging}
                            onPointerCancel={stopDragging}
                            onPointerLeave={stopDragging}
                        >
                            <table className="experience-table">
                                <thead>
                                    <tr>
                                        <th>YEAR</th>
                                        <th>Team / Tournament</th>
                                        <th>MATCHES</th>
                                        <th>KILLS(HS)</th>
                                        <th>DMG DEALT</th>
                                        <th>ASSISTS</th>
                                        <th>AVG.DMG DEALT</th>
                                        <th>LONGEST KILL</th>
                                        <th>Avg Time Survived</th>
                                        <th>AVG DIST Moved</th>

                                    </tr>
                                </thead>
                                <tbody>
                                    {playerExperience.map((row) => (
                                        <tr key={row.id}>
                                            <td>{row.year}</td>
                                            <td>
                                                <div className="team-cell">
                                                    <div className="experience-team-logo">
                                                        <img src={row.logo} alt={row.team} />
                                                    </div>
                                                    <div className="team-copy">
                                                        <strong>{row.tournament}</strong>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{row.matches}</td>
                                            <td>{row.killsHS}</td>
                                            <td>{row.dmg}</td>
                                            <td>{row.assists}</td>
                                            <td>{row.avgDmg}</td>
                                            <td>{row.longestKill}</td>
                                            <td>{row.matches}</td>
                                            <td>{row.killsHS}</td>

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
                                aria-label="Scroll experience table"
                            />
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};
