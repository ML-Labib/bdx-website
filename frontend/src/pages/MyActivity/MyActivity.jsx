import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SubHeader } from "../../components/SubHeader";
import { useAuth } from "../../components/useAuth";
import { ProfileTab } from "./ProfileTab";
import { TeamsTab } from "./TeamsTab";
import { TournamentsTab } from "./TournamentsTab";
import { getAuthHeaders } from "../../utils/authHeaders";

import "./myActivity.css";

const validTabs = ["profile", "team", "tournaments"];

export function MyActivity() {
    const { currentUser } = useAuth();

    const [activeTab, setActiveTab] = useState("profile");
    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');

    const [profile, setProfile] = useState(null);
    const [headers, setHeaders] = useState({});
    const [team, setTeam] = useState(null);
    const [members, setMembers] = useState([]);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setActiveTab(validTabs.includes(tabParam) ? tabParam : "profile");
    }, [tabParam]);

    const loadActivityData = async () => {
        try {
            setLoading(true);
            const headers = await getAuthHeaders(currentUser);
            setHeaders(headers);

            const profileRes = await fetch(`/api/profile/user`, { headers, });
            if (!profileRes.ok) {
                setProfile(null);
                setTeam(null);
                return;
            }

            const profileData = await profileRes.json();
            setProfile(profileData);

            const teamRes = await fetch(`/api/teams/user/`, { headers, });
            if (teamRes.ok) {
                const teamData = await teamRes.json();
                setTeam(teamData.team);
                const managerMember = teamData.members.filter(member => member.role === "manager");
                setManagers(managerMember || []);
                setMembers(teamData.members.filter(member => member.role !== "manager"));

            } else {
                setTeam(null);
                setMembers([]);
                setManagers([]);
            }
        } catch (error) {
            console.error("Failed to load My Activity data", error);
            setProfile(null);
            setTeam(null);
            setMembers([]);
            setManagers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.uid) {
            loadActivityData(currentUser.uid);
        } else {
            setProfile(null);
            setTeam(null);
            setMembers([]);
            setLoading(false);
        }
    }, [currentUser]);

    const tabs = [
        { id: "profile", label: "Profile", component: ProfileTab },
        { id: "team", label: "Team", component: TeamsTab },
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
                        {activeTab === "profile" && (
                            <ProfileTab
                                profile={profile}
                                setProfile={setProfile}
                                loading={loading}
                            />
                        )}
                        {activeTab === "team" && (
                            <TeamsTab
                                profile={profile}
                                team={team}
                                members={members}
                                managers={managers}
                                loading={loading}
                                headers={headers}
                                onNavigateToProfile={() => setActiveTab("profile")}
                                reloadActivityData={() => currentUser?.uid && loadActivityData(currentUser.uid)}
                            />
                        )}
                        {activeTab === "tournaments" && <TournamentsTab />}
                    </div>
                </div>

            </div>
        </>
    );
}