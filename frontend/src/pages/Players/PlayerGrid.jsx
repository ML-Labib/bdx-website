import { useCallback, useEffect, useRef, useState } from 'react';
import { PlayerCard } from "./PlayerCard";
import { Loader } from '../../components/Loader';
import './playerGrid.css'

const ITEMS_PER_PAGE = 12;

export function PlayerGrid() {
    const [searchTerm, setSearchTerm] = useState("");
    const [teamFilter, setTeamFilter] = useState("all"); // 'all', 'has_team', 'no_team'
    const [players, setPlayers] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isFetchingRef = useRef(false);
    const currentPageRef = useRef(1); // Track current page safely without triggering re-renders
    const abortControllerRef = useRef(null); // Used to cancel stale requests

    const fetchPlayers = useCallback(async (pageToFetch = 1, currentSearch = "", currentFilter = "all") => {
        if (isFetchingRef.current) return;

        // Cancel any ongoing previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        isFetchingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            let url = `/api/profile?page=${pageToFetch}&limit=${ITEMS_PER_PAGE}`;
            if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;
            if (currentFilter !== "all") url += `&filter=${currentFilter}`;

            const response = await fetch(url, { signal: abortControllerRef.current.signal });

            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

            const data = await response.json();

            setPlayers((prev) => {
                if (pageToFetch === 1) return data.profiles || [];
                return [...prev, ...(data.profiles || [])];
            });

            // Update page ref and hasMore flag based on backend response
            currentPageRef.current = pageToFetch;
            setHasMore(pageToFetch < (data.totalPages || 1));

        } catch (error) {
            if (error.name === 'AbortError') {
                // Request was intentionally cancelled, ignore error
                return;
            }
            console.error('Failed to fetch players:', error);
            setError('Unable to load players right now. Please try again later.');
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, []);

    // Effect for handling Search and Filter changes (with Debounce)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            currentPageRef.current = 1; // Reset page reference on new search/filter
            fetchPlayers(1, searchTerm, teamFilter);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, teamFilter, fetchPlayers]);

    const handleShowMore = () => {
        if (!hasMore || isFetchingRef.current) return;
        const nextPage = currentPageRef.current + 1;
        fetchPlayers(nextPage, searchTerm, teamFilter);
    };

    return (
        <div className="player-page">
            <div className="team-filters">
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

                    {/* Team Status Filter */}
                    <select
                        value={teamFilter}
                        onChange={(e) => setTeamFilter(e.target.value)}
                    >
                        <option id="all" value="all">All Players</option>
                        <option id="has_team" value="has_team">In a Team</option>
                        <option id="no_team" value="no_team">Free Agents</option>
                    </select>

                </div>
            </div>

            <div className="player-section-wrap">
                <div className="player-section">
                    {error && <p style={{ color: 'red' }}>{error}</p>}

                    {(players.length === 0 && !loading) ? (
                        <div className="empty-state">
                            <p>No player found.</p>
                        </div>
                    ) :
                        (
                            <div className="player-grid">
                                {players.map((player) => (
                                    <PlayerCard key={player._id} player={player} />
                                ))}
                            </div>
                        )}

                    {/*                     

                    {players.length === 0 && !loading && (
                        <div className="empty-state">
                            <p>No player found.</p>
                        </div>
                    )} */}
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
    );
}