import React, { useState } from "react";
import { MatchesTab } from "./MatchesTab";
import { RankingTab } from "./RankingTab";
import { StatsTab } from "./StatsTab";
import { InfoTab } from "./InfoTab";

import { SubHeader } from "../../components/SubHeader";
import { Link } from "react-router-dom";
import "./tournamentInfo.css";


export function TournamentInfo() {

    const [activeTab, _setActiveTab] = useState("Info");


    const tabs = [
        { id: "Info", label: "Tournament Info", component: InfoTab },
        { id: "Matches", label: "Matches", component: MatchesTab },
        { id: "Ranking", label: "Ranking", component: RankingTab },
        { id: "Stats", label: "Statistics", component: StatsTab },
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

    return (
        <>
            <SubHeader subTitle="" />
            <div className="tournament-info-container">
                <section className="tournament-hero">
                    <div className="player-hero-inner">

                        <div className="tournament-hero-details">

                            <div className="tournament-logo-block">
                                <div className="tournament-page-logo">
                                    <img src="https://wstatic-prod-boc.krafton.com/common/team/20250317/aZIXMx7n/55.png" alt="Team Logo" className="hero-team-logo" />
                                </div>
                            </div>

                            <div className="tournament-data">

                                <div className="tournament-title-row">
                                    <div className="tournament-name-wrapper">
                                        <h2 className="tournament-name">Very long tournament name</h2>
                                    </div>
                                </div>

                                <div className="tournament-details-info">

                                    <div className="stat-card">
                                        <span className="stat-label">Schedule</span>

                                        <strong >07-06-2026 ~ 11-06-2026</strong>

                                    </div>
                                    <div className="stat-card">

                                        <span className="stat-label">Price</span>
                                        <strong>$1000</strong>
                                    </div>

                                    <div className="stat-card">

                                        <span className="stat-label">Status</span>
                                        <strong>Ended</strong>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-label">Participating Region</span>
                                        <strong>Global</strong>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-label">Place</span>
                                        <strong>Dhaka, Bangladesh</strong>
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
                    {ActiveComponent && <ActiveComponent />}
                </div>
            </div>
        </>
    );
}
