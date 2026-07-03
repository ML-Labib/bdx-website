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

                        <div className="player-hero-details">

                            <div className="hero-avatar-block">
                                <div className="player-avatar">
                                    <img
                                        src="https://ybnzezsvnqdzbszjfuku.supabase.co/storage/v1/object/sign/bdx-bucket/players/Labib-no-bg.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hMTQ4YmE3Ni05ZTM1LTQ0N2ItYjdlZS0yNmQ5M2Y2NWFlZjEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJiZHgtYnVja2V0L3BsYXllcnMvTGFiaWItbm8tYmcucG5nIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4MzAzNzI2MCwiZXhwIjoyMDk4Mzk3MjYwfQ.d6zF6czgzQ3-tK7FKKmW8-99TpAN2WtJWEviVOHjkhU"
                                        alt="KerakTMz"
                                    />
                                </div>
                            </div>

                            <div className="player-data">

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
                                {tab.label}
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
