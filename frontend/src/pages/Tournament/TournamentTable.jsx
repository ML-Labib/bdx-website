import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader } from '../../components/Loader'; // Import your Loader component
import defaulteamLogo from '../../assets/default-team-logo.png'; // Import your default logo image
import './tournamentTable.css';

const ITEMS_PER_PAGE = 10;

export function TournamentTable() {
    const [tournaments, setTournaments] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isFetchingRef = useRef(false);

    const fetchTournaments = useCallback(async (nextPage = 1) => {
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;
        setLoading(true);
        setError(null);
        try {


            const response = await fetch(`/api/tournaments?page=${nextPage}&limit=${ITEMS_PER_PAGE}`);

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const data = await response.json();

            setTournaments((prev) => {
                if (nextPage === 1) {
                    return data.tournaments || [];

                }
                return [...prev, ...(data.tournaments || [])];
            });

            setHasMore(nextPage < (data.totalPages || 1));
        } catch (error) {
            console.error('Failed to fetch tournaments:', error);
            setError(error.message || 'An error occurred while fetching tournaments.');
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, []);

    useEffect(() => {
        fetchTournaments(1);
    }, [fetchTournaments]);

    const handleShowMore = () => {
        fetchTournaments((tournaments.length / ITEMS_PER_PAGE) + 1);
    };

    const formatSchedule = (item) => {
        if (item.schedule) {
            return item.schedule.split('\n');
        }

        if (item.startDate && item.endDate) {
            const start = new Date(item.startDate).toLocaleDateString();
            const end = new Date(item.endDate).toLocaleDateString();
            return [`${start} - ${end}`];
        }

        return ['-'];
    };

    const getTournamentStatus = (item) => {
        const now = new Date();
        const registrationStart = item.registrationStartDate ? new Date(item.registrationStartDate) : null;
        const registrationEnd = item.registrationEndDate ? new Date(item.registrationEndDate) : null;
        const start = item.startDate ? new Date(item.startDate) : null;
        const end = item.endDate ? new Date(item.endDate) : null;

        if (end && now > end) {
            return 'Ended';
        }

        if (start && end && now >= start && now <= end) {
            return 'Ongoing';
        }

        // Between registration closing and tournament match start
        if (registrationEnd && start && now > registrationEnd && now < start) {
            return 'In Preparation'; // Or 'Prep Phase'
        }

        if (registrationStart && registrationEnd && now >= registrationStart && now <= registrationEnd) {
            return 'Registration Open';
        }

        return 'Upcoming';
    };

    return (
        <div className="page-content">
            {/* Desktop View */}
            <div className="pc-view">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="th-left">TOURNAMENT</th>
                            <th>MODE</th>
                            <th>PRIZE</th>
                            <th className="th-sortable">SCHEDULE</th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && tournaments.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="table-state-cell">
                                    <Loader />
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan="5" className="table-state-cell table-state-error">
                                    {error}
                                </td>
                            </tr>
                        ) : tournaments.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="empty-state-row">
                                    <div className="empty-state">
                                        <span className="material-symbols-outlined">
                                            trophy
                                        </span>
                                        <p> No tournaments available </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            tournaments.map((item) => {
                                const status = getTournamentStatus(item);
                                const scheduleLines = formatSchedule(item);
                                return (
                                    <tr key={item._id || item.id} className="tr-tournament">
                                        <td className="td-tournament">
                                            <Link
                                                to={`/tournament-info/${item._id || item.id}`}
                                                state={{ tournament: item, status: status }}
                                                className="t-name-link"
                                            >
                                                <div className="t-info">
                                                    <img src={item.logo || defaulteamLogo} alt="logo" className="t-logo" />
                                                    <span className="t-name">{item?.title || '-'}</span>
                                                </div>
                                            </Link>
                                        </td>

                                        <td className="td-prize">{item?.gameMode || item?.mode}</td>
                                        <td className="td-prize">{item?.prize || '-'}</td>

                                        <td className="td-schedule">
                                            {scheduleLines.map((date, i) => (
                                                <div key={i}>{date}</div>
                                            ))}
                                        </td>


                                        <td className="td-status">
                                            <Link to={`/tournament-info/${item._id || item.id}`} state={{ tournament: item, status: status }} className="status-link">
                                                <span className={`status-badge ${status.toLowerCase().replace(/\s+/g, '-')}`}>
                                                    {status}
                                                </span>
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="mobile-view">
                <table className="table">
                    <thead>
                        <tr>
                            <th>TOURNAMENT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && tournaments.length === 0 ? (
                            <tr>
                                <td className="table-state-cell">
                                    <Loader />
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td className="table-state-cell table-state-error">
                                    {error}
                                </td>
                            </tr>
                        ) : tournaments.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="empty-state-row">
                                    <div className="empty-state">
                                        <span className="material-symbols-outlined">
                                            trophy
                                        </span>
                                        <p> No tournaments available </p>
                                    </div>
                                </td>
                            </tr>

                        ) : (
                            tournaments.map((item) => {
                                const title = item.title || item.name || 'Untitled Tournament';
                                const prize = item.prize || '-';
                                const status = getTournamentStatus(item);
                                const scheduleLines = formatSchedule(item);

                                return (
                                    <tr key={item._id}>
                                        <td>
                                            <div className="t-info">
                                                <img src={item.logo || defaulteamLogo} alt="logo" className="t-logo" />
                                                <Link
                                                    to={`/tournament-info/${item._id || item.id}`}
                                                    state={{ tournament: item, status: status }}
                                                    className="t-name-link"
                                                >
                                                    <span className="t-name">{title}</span>
                                                </Link>
                                                <span className="badge primary">{item.gameMode || item.mode || '-'} {item.format}</span>
                                                <span className={`status-badge ${status.toLowerCase().replace(/\s+/g, '-')}`}>
                                                    {status}
                                                </span>
                                                <div className="row-details">
                                                    <div className="details">
                                                        <span className="label">Prize:</span>
                                                        <span className="value">{prize}</span>
                                                    </div>
                                                    <div className="details">
                                                        <span className="label">Schedule:</span>
                                                        <span className="value">
                                                            {scheduleLines.map((date, i) => (
                                                                <div key={i}>{date}</div>
                                                            ))}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>


            {/* Bottom Loader when fetching additional pages ("More" button click) */}
            {!error && !loading && hasMore && (
                <div className="show-more">
                    <button className="show-more-btn" onClick={handleShowMore}>
                        <span className="material-symbols-outlined">keyboard_arrow_down</span>
                        <span>More</span>
                    </button>
                </div>
            )}
        </div>
    );
}