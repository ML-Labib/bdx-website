import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Header } from "../../components/Header";
import { SubHeader } from "../../components/SubHeader";
import { PlayerStatsCard } from "./PlayerStatsCard";
import './teamInfo.css';

export const TeamInfo = () => {
    const { teamId } = useParams();
    const [teamInfo, setTeamInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [members, setMembers] = useState([]);
    const [managers, setManagers] = useState([]);

    const fetchTeamInfo = useCallback(async () => {
        if (!teamId) return;

        try {
            setLoading(true);
            setError(null);

            // Added leading slash so it targets the root /api proxy/server correctly
            const response = await fetch(`/api/teams/${teamId}/info`);

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                const text = await response.text();
                throw new Error(`Server returned non-JSON response: ${text.slice(0, 80)}...`);
            }

            if (!response.ok) {
                throw new Error("Failed to fetch team info");
            }

            const data = await response.json();

            setTeamInfo(data.team);
            setMembers(data.members.filter(member => member.role !== "manager"));
            setManagers(data.members.filter(member => member.role === "manager"));
        } catch (err) {
            console.error("Error fetching team info:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchTeamInfo();
    }, [fetchTeamInfo]);

    if (loading) {
        return <div className="loading-state">Loading team information...</div>;
    }

    if (error) {
        return <div className="error-state">Error: {error}</div>;
    }

    return (
        <>
            <SubHeader subTitle="" />

            <div className="team-info-container">
                <section className="team-hero">
                    <div className="team-hero-inner">
                        <div className="hero-logo-block">
                            <div className="team-page-logo">
                                <img src={teamInfo?.logo} alt="Team Logo" className="hero-team-logo" />
                            </div>
                        </div>
                        <div className="team-hero-details">
                            <div className="team-name-wrapper">
                                <h3 className="team-name">{teamInfo?.name || "No Name"} ({teamInfo?.teamTag || "No Tag"})</h3>
                            </div>

                            <div className="team-summary-stats">
                                <div className="stat-card">
                                    <span className="stat-label">Latest Tournament</span>
                                    <strong>{teamInfo?.latestTournament || "-----"}</strong>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Avg. Kill</span>
                                    <strong>{teamInfo?.avgKill || "-----"}  </strong>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Avg. Damage</span>
                                    <strong>{teamInfo?.avgDamage || "-----"}</strong>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Avg. Survival Time</span>
                                    <strong>{teamInfo?.avgSurvivalTime || "-----"}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <div className="team-info-bar">
                <div className="team-info-bar-inner">
                    <span>TEAM INFO</span>
                </div>
            </div>

            <div className="team-info-container">
                <section className="team-section players-section">
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
                            <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000"></path>
                        </svg>
                        <h2>Players</h2>
                    </div>
                    <div className="team-player-grid">
                        {members.map((player) => (
                            <PlayerStatsCard key={player._id} player={player} />
                        ))}
                    </div>
                </section>

                <section className="team-section coach-section">
                    <div className="coach-section-wrapper">
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
                                <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000"></path>
                            </svg>
                            <h2>Managers</h2>
                        </div>
                        <div className="coach-card-list">
                            {managers.length === 0 && <p className="empty-state">No managers found for this team.</p>}
                            {managers.map((manager) => (
                                <div className="coach-card" key={manager._id}>
                                    <div>
                                        <h3>{manager.user.ign}</h3>
                                        <p>{manager.user.displayName}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};