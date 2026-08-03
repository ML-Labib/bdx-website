import { useState } from "react";
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
        <>
            <SubHeader subTitle="My Activities" />
            <div className="my-activity-page">
                    <div className="profile-tabs-container">
                        <div className="profile-tabs-header">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="tab-content">
                            {ActiveComponent && <ActiveComponent />}
                        </div>
                    </div>

            </div>
        </>
    );
}