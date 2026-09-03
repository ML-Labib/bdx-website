import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DataTable } from '../../components/DataTable'; // adjust import path as needed
import { SubHeader } from '../../components/SubHeader'; // adjust import path as needed
import './playerInfo.css'; // adjust import path as needed


const playerExperience = [
    {
        id: 1,
        year: 2025,
        tournament: "PUBG Americas Series 6",
        team: "BDX Obsidian",
        matches: 42,
        kills: 35,
        dmg: 7487.04,
        assists: 23,
        avgDmg: 178.26,
        longestKill: 34,
        avgTimeSurvived: 59829,
        avgDistMoved: 200535,
        logo: "https://wstatic-prod-boc.krafton.com/common/team/20250317/aZIXMx7n/55.png",
    },
    {
        id: 2,
        year: 2025,
        tournament: "Esports World Cup AM Qualifier",
        team: "BDX Obsidian",
        matches: 24,
        kills: 17,
        dmg: 4705.24,
        assists: 15,
        avgDmg: 196.05,
        longestKill: 51,
        avgTimeSurvived: 2000,
        avgDistMoved: 13475,
        logo: "https://wstatic-prod-boc.krafton.com/common/team/20250317/aZIXMx7n/55.png",
    },
    {
        id: 3,
        year: 2024,
        tournament: "PUBG Americas Series 4",
        team: "BDX Obsidian",
        matches: 30,
        kills: 23,
        dmg: 6669.24,
        assists: 24,
        avgDmg: 222.31,
        longestKill: 31,
        avgTimeSurvived: 10000,
        avgDistMoved: 2500645,
        logo: "https://wstatic-prod-boc.krafton.com/common/team/20250317/aZIXMx7n/55.png",
    },
]



// const playerExperience = []

export const PlayerInfo = () => {
    const { pubgId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [playerInfo, setPlayerInfo] = useState(null);

    const fetchPlayerInfo = useCallback(async () => {
        if (!pubgId) return;

        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/profile/pubg/${pubgId}`);

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                throw new Error(`Server returned non-JSON response: ${text.slice(0, 80)}...`);
            }

            if (!response.ok) {
                throw new Error("Failed to fetch player info");
            }

            const data = await response.json();
            setPlayerInfo(data);
        } catch (err) {
            console.error("Error fetching player info:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [pubgId]);

    useEffect(() => {
        fetchPlayerInfo();
    }, [fetchPlayerInfo]);

    // Table Column Definitions
    const experienceColumns = [
        { header: "YEAR", accessor: "year" },
        {
            header: "Team / Tournament",
            accessor: "tournament",
            cell: (row) => (
                <div className="team-cell">
                    <div className="experience-team-logo">
                        <img src={row.logo} alt={row.team} />
                    </div>
                    <div className="team-copy">
                        <strong>{row.tournament}</strong>
                    </div>
                </div>
            ),
        },
        { header: "MATCHES", accessor: "matches" },
        { header: "KILLS(HS)", accessor: "kills" },
        { header: "DMG DEALT", accessor: "dmg" },
        { header: "ASSISTS", accessor: "assists" },
        { header: "AVG.DMG DEALT", accessor: "avgDmg" },
        { header: "LONGEST KILL", accessor: "longestKill" },
        { header: "Avg Time Survived", accessor: "avgTimeSurvived" },
        { header: "AVG DIST Moved", accessor: "avgDistMoved" },
    ];

    if (loading) {
        return <div className="loading-state">Loading player information...</div>;
    }
    if (error) {
        return <div className="error-state">Error: {error}</div>;
    }

    return (
        <>
            <SubHeader subTitle="" />
            <div className="player-info-container">
                <section className="player-hero">
                    <div className="player-hero-inner">
                        <div className="player-hero-details">
                            <div className="hero-avatar-block">
                                <div className="player-avatar">
                                    <img
                                        src={playerInfo?.picture}
                                        alt={playerInfo?.ign || "Player Avatar"}
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
                                        <h2 className="player-ign">{playerInfo?.ign || "Player Name"}</h2>
                                    </div>
                                </div>

                                <div className="player-details">
                                    <div className="stat-card">
                                        <span className="stat-label">Name/Country</span>
                                        <strong>{playerInfo?.displayName || "-----"} / {playerInfo?.country || "Unknown"}</strong>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-label">Latest Tournament</span>
                                        <strong>{playerInfo?.latestTournament || "-----"}</strong>
                                    </div>
                                </div>

                                <div className="player-summary-stats">
                                    <div className="stat-card">
                                        <span className="stat-label">Avg. Kill</span>
                                        <strong>{playerInfo?.avgKills || "-----"}</strong>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-label">Avg. Damage</span>
                                        <strong>{playerInfo?.avgDamage || "-----"}</strong>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-label">Avg. Survival Time</span>
                                        <strong>{playerInfo?.avgSurvivalTime || "-----"}</strong>
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
                        <svg className="section-icon" width="32" height="16" viewBox="0 0 32 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                            <path d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z" fill="#EFF923" />
                            <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000" />
                        </svg>
                        <h2>Experiences</h2>
                    </div>

                    {/* Reusable Data Table */}

                    {playerExperience.length === 0 ? (
                        <div className="empty-team-state">

                            <span className="material-symbols-outlined">
                                history
                            </span>

                            <h4>
                                No tournaments
                            </h4>

                            <p>
                                Played tournaments will be displayed here once the player has participated in any official matches.
                            </p>

                        </div>
                    ) :
                        <DataTable
                            columns={experienceColumns}
                            data={playerInfo?.experiences || playerExperience}
                        />
                    }
                </section>
            </div>
        </>
    );
};