import React, { useEffect, useState } from "react";
import { MatchesTab } from "./MatchesTab";
import { RankingTab } from "./RankingTab";
import { StatsTab } from "./StatsTab";
import { InfoTab } from "./InfoTab";

import { SubHeader } from "../../components/SubHeader";
import { useLocation, useParams } from "react-router-dom";
import "./tournamentInfo.css";


export function TournamentInfo() {

    const location = useLocation();
    const { id } = useParams();
    const [tournament, setTournament] = useState(location.state?.tournament || null);
    const [status, setStatus] = useState(location.state?.status || "Upcoming");
    const [loading, setLoading] = useState(Boolean(id) && !location.state?.tournament);
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
                const response = await fetch(`http://localhost:8080/api/tournaments/${id}`);
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


    const tabs = [
        { id: "Info", label: "Tournament Info", component: InfoTab },
        { id: "Matches", label: "Matches", component: MatchesTab },
        { id: "Ranking", label: "Ranking", component: RankingTab },
        { id: "Stats", label: "Statistics", component: StatsTab },
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

    if (loading) {
        return (
            <>
                <SubHeader subTitle="" />
                <div className="tournament-info-container">
                    <p>Loading tournament information...</p>
                </div>
            </>
        );
    }

    if (!tournament) {
        return (
            <>
                <SubHeader subTitle="" />
                <div className="tournament-info-container">
                    <p>Tournament not found.</p>
                </div>
            </>
        );
    }

    return (
        <>
            <SubHeader subTitle="" />
            <div className="tournament-info-container">
                <section className="tournament-hero">
                    <div className="player-hero-inner">

                        <div className="tournament-hero-details">

                            <div className="tournament-logo-block">
                                <div className="tournament-page-logo">
                                    <img src={tournament?.logo} alt="Team Logo" className="hero-team-logo" />
                                </div>
                            </div>

                            <div className="tournament-data">

                                <div className="tournament-title-row">
                                    <div className="tournament-name-wrapper">
                                        <h2 className="tournament-name">{tournament?.title || 'Tournament'}</h2>
                                    </div>
                                </div>

                                <div className="tournament-details-info">

                                    <div className="stat-card">
                                        <span className="stat-label">Schedule</span>

                                        <strong>{tournament?.startDate && tournament?.endDate ? `${new Date(tournament.startDate).toLocaleDateString()} - ${new Date(tournament.endDate).toLocaleDateString()}` : 'TBD'}</strong>

                                    </div>
                                    <div className="stat-card">

                                        <span className="stat-label">Price</span>
                                        <strong>{tournament?.prize || 'TBD'}</strong>
                                    </div>

                                    <div className="stat-card">

                                        <span className="stat-label">Status</span>
                                        <strong>{status}</strong>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-label">Participating Region</span>
                                        <strong>{tournament?.participatingRegion || 'Global'}</strong>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-label">Place</span>
                                        <strong>{tournament?.eventPlace || 'TBD'}</strong>
                                    </div>
                                </div>


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
                <div className="tab-content">
                    {ActiveComponent && <ActiveComponent tournament={tournament} status={status} />}
                </div>
            </div>
        </>
    );
}
