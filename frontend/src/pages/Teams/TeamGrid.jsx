import { useState, useEffect, useRef, useCallback } from "react";
import { SubHeader } from "../../components/SubHeader"
import { Loader } from '../../components/Loader';
import { TeamCard } from "./TeamCard";
import './teamGrid.css'


const ITEMS_PER_PAGE = 15; // Number of items to fetch per page

export function TeamGrid() {
    const [teams, setTeams] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isFetchingRef = useRef(false);
    const currentPageRef = useRef(1); // Track current page safely without triggering re-renders
    const abortControllerRef = useRef(null); // Used to cancel stale requests


    const fetchTeams = useCallback(async (pageToFetch = 1, currentSearch = "") => {
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
            let url = `/api/teams?page=${pageToFetch}&limit=${ITEMS_PER_PAGE}`;
            if (currentSearch) url += `&search=${encodeURIComponent(currentSearch)}`;

            const response = await fetch(url, { signal: abortControllerRef.current.signal });

            if (!response.ok) throw new Error(`Request failed with status ${response.status}`);

            const data = await response.json();

            setTeams((prev) => {
                if (pageToFetch === 1) return data.teams || [];
                return [...prev, ...(data.teams || [])];
            });

            // Update page ref and hasMore flag based on backend response
            currentPageRef.current = pageToFetch;
            setHasMore(pageToFetch < (data.totalPages || 1));

        } catch (error) {
            if (error.name === 'AbortError') {
                // Request was intentionally cancelled, ignore error
                return;
            }
            console.error('Failed to fetch teams:', error);
            setError('Unable to load teams right now. Please try again later.');
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, []);

    // Effect for handling Search and Filter changes (with Debounce)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            currentPageRef.current = 1;
            fetchTeams(1, searchTerm);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, fetchTeams]);

    const handleShowMore = () => {
        if (!hasMore || isFetchingRef.current) return;
        const nextPage = currentPageRef.current + 1;
        fetchTeams(nextPage, searchTerm);
    };

    return (
        <>
            <SubHeader subTitle="TEAMS" />
            <section className="team-page">

                <div className="team-filters">
                    <div className="search-wrap">
                        <div className="search-group">
                            <input
                                type="text"
                                placeholder="Search with Team name/tag or Country"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}

                            />
                            <span className="material-symbols-outlined">
                                search
                            </span>
                        </div>
                    </div>
                </div>
                <div className="team-section-wrap">
                    <div className="team-section">

                        {error ? (
                            <div className="error-state">
                                <p style={{ color: 'red' }}>{error}</p>
                            </div>
                        ) : !loading && teams.length === 0 ? (
                            <div className="empty-state">
                                <p>No teams found.</p>
                            </div>
                        ) : (
                            <div className="team-grid">

                                {teams.map((team) => (
                                    <TeamCard key={team._id} team={team} />
                                ))}
                            </div>

                        )}


                    </div>
                    {/* Bottom Loader when fetching additional pages ("More" button click) */}
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

            </section>
        </>

    );
}