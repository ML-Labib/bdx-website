import React, { useState } from 'react';
import { tournaments } from './TournamentData';
import './tournamentTable.css';

export function TournamentTable() {
    const [year, setYear] = useState('2025');

    return (
        <div className="page-container">

                {/* --- Filter Section --- */}
                <div className="filter-bar">
                    <div className="select-wrapper">
                        <select value={year} onChange={(e) => setYear(e.target.value)}>
                            <option value="All">All</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                    </div>
                    <button className="refresh-btn" aria-label="Refresh">
                        ↻
                    </button>
                </div>

                {/* --- The Table --- */}
                <table className="t-table">
                    <thead>
                        <tr>
                            <th className="th-left">TOURNAMENT</th>
                            <th>PRIZE</th>
                            <th className="th-sortable">
                                SCHEDULE
                                <span className="sort-arrows">
                                    <i className="arrow-up"></i>
                                    <i className="arrow-down"></i>
                                </span>
                            </th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tournaments.map((item) => (
                            <tr key={item.id}>
                                {/* Column 1: Logo + Text */}
                                <td className="td-tournament">
                                    <div className="t-info">
                                        <img src={item.logo} alt="logo" className="t-logo" />
                                        <span className="t-name">{item.name}</span>
                                    </div>
                                </td>

                                {/* Column 2: Prize */}
                                <td className="td-prize">{item.prize}</td>

                                {/* Column 3: Schedule (Multiline) */}
                                <td className="td-schedule">
                                    {item.schedule.split('\n').map((date, i) => (
                                        <div key={i}>{date}</div>
                                    ))}
                                </td>

                                {/* Column 4: Status Badge */}
                                <td className="td-status">
                                    <span className={`status-badge ${item.status.toLowerCase()}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

    );
}