import { useCallback, useEffect, useRef, useState } from 'react';
import { PlayerCard } from "./PlayerCard";
import { SubHeader } from "../../components/SubHeader";
import { Loader } from '../../components/Loader';
import './playerGrid.css';

const ITEMS_PER_PAGE = 12;

export function PlayerGrid() {
    const [searchTerm, setSearchTerm] = useState("");
    const [teamFilter, setTeamFilter] = useState("all");
    const [players, setPlayers] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const abortControllerRef = useRef(null);

    const fetchPlayers = useCallback(async (pageToFetch, search, filter) => {
        // Cancel ongoing previous request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                page: pageToFetch,
                limit: ITEMS_PER_PAGE,
            });

            if (search) params.append("search", search);
            if (filter !== "all") params.append("filter", filter);

            const response = await fetch(`/api/profile?${params.toString()}`, {
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

            const data = await response.json();
            const fetchedProfiles = data.profiles || [];

            setPlayers((prev) => (pageToFetch === 1 ? fetchedProfiles : [...prev, ...fetchedProfiles]));
            setHasMore(pageToFetch < (data.totalPages || 1));
            setPage(pageToFetch);

        } catch (err) {
            if (err.name === 'AbortError') return; // Request was aborted, ignore
            console.error('Failed to fetch players:', err);
            setError('Unable to load players right now. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle Search and Filter changes (Debounced)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPlayers(1, searchTerm, teamFilter);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, teamFilter, fetchPlayers]);

    const handleShowMore = () => {
        if (!hasMore || loading) return;
        fetchPlayers(page + 1, searchTerm, teamFilter);
    };

    return (
        <>
            <SubHeader subTitle="PLAYERS" />
            
            <div className="search-filters">
                <div className="search-wrap">
                    {/* Search Input */}
                    <div className="search-group">
                        <input
                            type="text"
                            placeholder="Search with name, ign, country"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="material-symbols-outlined">search</span>
                    </div>

                    {/* Team Filter Dropdown */}
                    <select
                        value={teamFilter}
                        onChange={(e) => setTeamFilter(e.target.value)}
                    >
                        <option value="all">All Players</option>
                        <option value="has_team">In a Team</option>
                        <option value="no_team">Free Agents</option>
                    </select>
                </div>
            </div>

            <div className="page">
                <div className="page-content">
                    <div className="page-section">
                        {error && <p style={{ color: 'red' }}>{error}</p>}

                        {players.length === 0 && !loading ? (
                            <div className="empty-state">
                                <p>No player found.</p>
                            </div>
                        ) : (
                            <div className="player-grid">
                                {players.map((player) => (
                                    <PlayerCard key={player._id} player={player} />
                                ))}
                            </div>
                        )}
                    </div>

                    {!loading && hasMore && (
                        <div className="show-more">
                            <button className="show-more-btn" onClick={handleShowMore}>
                                <span className="material-symbols-outlined">keyboard_arrow_down</span>
                                <span>More</span>
                            </button>
                        </div>
                    )}

                    {loading && (
                        <div className="bottom-loading">
                            <Loader />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}