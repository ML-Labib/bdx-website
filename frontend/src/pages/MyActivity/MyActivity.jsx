import { useState } from "react";
import { Header } from "../../components/Header";
import { SubHeader } from "../../components/SubHeader";
import { ProfileTab } from "./ProfileTab";
import { TeamsTab } from "./TeamsTab";
import { TournamentsTab } from "./TournamentsTab";

import "./myActivity.css";

export function MyActivity() {
    const [activeTab, setActiveTab] = useState("profile");

    const tabs = [
        { id: "profile", label: "Profile", component: ProfileTab },
        { id: "teams", label: "Teams", component: TeamsTab },
        { id: "tournaments", label: "Tournaments", component: TournamentsTab },
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

    return (
        <div className="my-activity-page">
            <Header />
            <SubHeader subTitle="My Activities" />
            <div className="content">
                <div className="tabs-container">
                    <div className="tabs-header">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="tab-content">
                        {ActiveComponent && <ActiveComponent />}
                    </div>
                </div>
            </div>
        </div>
    );
}