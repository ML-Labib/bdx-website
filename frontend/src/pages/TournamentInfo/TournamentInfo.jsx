import React, { useEffect, useState } from "react";
import { MatchesTab } from "./MatchesTab.jsx";
import { RankingTab } from "./RankingTab.jsx";
import { StatsTab } from "./StatsTab.jsx";
import { InfoTab } from "./InfoTab.jsx";
import { SubHeader } from "../../components/SubHeader.jsx";
import { useLocation, useParams } from "react-router-dom";
import { Loader } from "../../components/Loader.jsx";
import { formatDate } from "../../utils/formantDateTime";
import defaulteamtLogo from '../../assets/default-team-logo.png'; // Import your default logo image

import "./tournamentInfo.css";


export function TournamentInfo() {

    const location = useLocation();
    const { id } = useParams();
    const [tournament, setTournament] = useState(location.state?.tournament || null);
    const [status, setStatus] = useState(location.state?.status || "Upcoming");
    const [loading, setLoading] = useState(Boolean(id) && !location.state?.tournament);
    const [stages, setStages] = useState([]);
    const [activeTab, _setActiveTab] = useState("Info");

    const getTournamentStatus = (item) => {
        const now = new Date();
        const registrationStart = item?.registrationStartDate ? new Date(item.registrationStartDate) : null;
        const registrationEnd = item?.registrationEndDate ? new Date(item.registrationEndDate) : null;
        const start = item?.startDate ? new Date(item.startDate) : null;
        const end = item?.endDate ? new Date(item.endDate) : null;

        if (registrationStart && registrationEnd && now >= registrationStart && now <= registrationEnd) {
            return "Registration Open";
        }

        if (start && end && now >= start && now <= end) {
            return "Ongoing";
        }

        if (end && now > end) {
            return "Ended";
        }

        return "Upcoming";
    };

    useEffect(() => {
        if (!id) {
            setTournament(location.state?.tournament || null);
            setStatus(location.state?.status || "Upcoming");
            setLoading(false);
            return;
        }

        const stateTournament = location.state?.tournament;
        if (stateTournament && (stateTournament._id === id || stateTournament.id === id)) {
            setTournament(stateTournament);
            setStatus(location.state?.status || getTournamentStatus(stateTournament));
            setLoading(false);
            return;
        }

        const fetchTournament = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/tournaments/${id}`);
                if (!response.ok) {
                    throw new Error("Tournament not found");
                }

                const data = await response.json();
                setTournament(data);
                setStatus(getTournamentStatus(data));
            } catch (error) {
                console.error("Failed to fetch tournament details:", error);
                setTournament(null);
                setStatus("Upcoming");
            } finally {
                setLoading(false);
            }
        };

        fetchTournament();
    }, [id, location.state?.tournament, location.state?.status]);

    useEffect(() => {
        const tournamentId = tournament?._id || tournament?.id || id;
        if (!tournamentId) {
            setStages([]);
            return;
        }

        let cancelled = false;

        const fetchStages = async () => {
            try {
                const response = await fetch(`/api/leaderboard/tournament/${tournamentId}/stages-and-groups`);
                if (!response.ok) {
                    throw new Error("Failed to fetch tournament stages");
                }

                const data = await response.json();
                if (!cancelled) {
                    setStages(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.error("Failed to fetch tournament stages:", error);
                if (!cancelled) {
                    setStages([]);
                }
            }
        };

        fetchStages();

        return () => {
            cancelled = true;
        };
    }, [id, tournament?._id, tournament?.id]);


    const tabs = [
        { id: "Info", label: "Tournament Info", component: InfoTab },
        { id: "Matches", label: "Matches", component: MatchesTab },
        { id: "Ranking", label: "Ranking", component: RankingTab },
        { id: "Stats", label: "Stats", component: StatsTab },
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

    if (loading) {
        return (
            <>
                <div className="tournament-info-container">
                    < Loader />
                </div>
            </>
        );
    }

    if (!tournament) {
        return (
            <>
                <div className="empty-state-container">
                    <p className="error-state "
                    >Tournament not found.</p>
                </div>
            </>
        );
    }

    return (
        <>
            <SubHeader subTitle="" />
            <div className="page-info-container">
                <section className="page-info-hero">
                    <div className="hero-inner">
                        <div className="hero-details">
                            <div className="hero-avatar">
                                <div className="avatar player">
                                    <img
                                        src={tournament?.logo || defaulteamtLogo}
                                        alt="logo"
                                    />
                                </div>
                            </div>

                            <div className="hero-data">
                                <div className="hero-title-row">
                                    <div className="hero-title">
                                        <h2 className="hero-title-value">{tournament?.title || "Player Name"}</h2>
                                        <span className={`status-badge upcoming info`}>
                                            Tier {tournament?.tier || '-'}
                                        </span>
                                    </div>
                                </div>

                                <ul className="stats-grid">
                                    <li className="stat-card">
                                        <span className="stat-label">Schedule</span>
                                        <strong className="stat-value">
                                            {tournament?.startDate && tournament?.endDate ? `${formatDate(tournament.startDate)} - ${formatDate(tournament.endDate)}` : '-'}
                                        </strong>
                                    </li>

                                    <li className="stat-card">
                                        <span className="stat-label">Prize</span>
                                        <strong className="stat-value">
                                            {tournament?.prize || '-'}
                                        </strong>
                                    </li>


                                    <li className="stat-card">
                                        <span className={`stat-label`}>
                                            Status
                                        </span>
                                        <strong className={`stat-value ${status.toLowerCase() === "ended" ? "ended" : ""}`}>
                                            {status}
                                        </strong>
                                    </li>

                                    <li className="stat-card">
                                        <span className="stat-label">Participating Region</span>
                                        <strong className="stat-value">
                                            {tournament?.participatingRegion || '-'}
                                        </strong>
                                    </li>

                                    <li className="stat-card">
                                        <span className="stat-label">Mode</span>
                                        <strong className="stat-value">
                                            {tournament?.mode || tournament?.GameMode || '-'}
                                        </strong>
                                    </li>

                                    <li className="stat-card">
                                        <span className="stat-label">Match Time</span>
                                        <strong className="stat-value">
                                            {tournament?.matchTime || '-'}
                                        </strong>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>


                <div className="tournament-info-bar">
                    <div className="tournament-tabs-header">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                                onClick={() => _setActiveTab(tab.id)}
                            >
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="tournament-tab-content">
                    {ActiveComponent && (
                        <ActiveComponent
                            tournament={tournament}
                            status={status}
                            tournamentId={tournament?._id || tournament?.id || id}
                            stages={stages}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
