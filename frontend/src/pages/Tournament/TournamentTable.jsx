import { tournaments } from './TournamentData';
import './tournamentTable.css';

export function TournamentTable() {

    return (
        <div className="page-container">
            {/* --- The Table --- */}
            <div className="pc-view">


                <table className="t-table">
                    <thead>
                        <tr>
                            <th className="th-left">TOURNAMENT</th>
                            <th>PRIZE</th>
                            <th className="th-sortable">
                                SCHEDULE
                            </th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tournaments.map((item) => (
                            <tr key={item.id} className="tr-tournament">
                                {/* Column 1: Logo + Text */}
                                <td className="td-tournament">
                                    <div className="t-info">
                                        <img src={item.logo} alt="logo" className="t-logo" />
                                        <span className="t-name">
                                            {item.name}
                                        </span>
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


            <div className="mobile-view">
                <table className='t-table'>
                    <thead>
                        <tr>
                            <th>
                                TOURNAMENT
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {tournaments.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <div className="t-info">
                                        <img src={item.logo} alt="logo" className="t-logo" />
                                        <span className="t-name">{item.name}</span>
                                        <span className={`status-badge ${item.status.toLowerCase()}`}>
                                            {item.status}
                                        </span>
                                        <div className="row-details">
                                            <div className="price-details">
                                                <span className="label">Prize:</span>
                                                <span className="value">{item.prize}</span>
                                            </div>
                                            <div className="schedule-details">
                                                <span className="label">Schedule:</span>
                                                <span className="value">
                                                    {item.schedule.split('\n').map((date, i) => (
                                                        <div key={i}>{date}</div>
                                                    ))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="show-more">
                <button className="show-more-btn">
                    <span className="material-symbols-outlined">
                        keyboard_arrow_down
                    </span>
                    <span>
                        More
                    </span>
                </button>
            </div>
        </div>

    );
}