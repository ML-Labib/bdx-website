import { useEffect, useState } from "react";
import { useAuth } from "../../components/useAuth";
import { getAuthHeaders } from "../../utils/authHeaders";
import { CreateStageModal } from "./components/CreateStageModal.jsx";
import { CreateGroupModal } from "./components/CreateGroupModal.jsx";
import { CreateMatchModal } from "./components/CreateMatchModal.jsx";
import { StageSidebar } from "./components/StageSidebar.jsx";
import { GroupTabs } from "./components/GroupTabs.jsx";
import { ParticipantManagement } from "./components/ParticipantManagement.jsx";
import { MatchManagement } from "./components/MatchManagement.jsx";
import { AddTeamModal } from "./components/AddTeamModal.jsx";
import { MatchPreviewModal } from "./components/MatchPreviewModal.jsx";
import "./manageLeaderboards.css";

const API_BASE_URL = "/api";

export const ManageLeaderboards = () => {
    const { currentUser } = useAuth();

    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);

    const [stages, setStages] = useState([]);
    const [selectedStage, setSelectedStage] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const [matches, setMatches] = useState([]);
    const [stageParticipants, setStageParticipants] = useState([]);
    const [registeredTeams, setRegisteredTeams] = useState([]);

    const [loadingTournaments, setLoadingTournaments] = useState(true);
    const [loadingStages, setLoadingStages] = useState(false);
    const [loadError, setLoadError] = useState("");

    const [showStageModal, setShowStageModal] = useState(false);
    const [editingStage, setEditingStage] = useState(null);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [showAddTeamModal, setShowAddTeamModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const [selectedMatch, setSelectedMatch] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    
    const selectedContext = selectedGroup || (
        selectedStage && !selectedStage.hasGroups
            ? { _id: null, name: selectedStage.name, participants: stageParticipants }
            : null
    );

    /*
     * ---------------------------------------------------------
     * LOAD TOURNAMENTS
     * ---------------------------------------------------------
     */
    useEffect(() => {
        const loadTournaments = async () => {
            try {
                setLoadingTournaments(true);
                const headers = await getAuthHeaders(currentUser);
                const res = await fetch(`${API_BASE_URL}/tournaments`, { headers });

                if (!res.ok) throw new Error("Failed to load tournaments");

                const data = await res.json();
                const tournamentList = Array.isArray(data) ? data : data.tournaments || [];
                setTournaments(tournamentList);

                if (tournamentList.length > 0) {
                    setSelectedTournament(tournamentList[0]);
                }
            } catch (error) {
                console.error(error);
                setLoadError(error.message);
            } finally {
                setLoadingTournaments(false);
            }
        };

        if (currentUser) {
            loadTournaments();
        }
    }, [currentUser]);

    /*
     * ---------------------------------------------------------
     * LOAD STAGES & GROUPS (COMBINED)
     * ---------------------------------------------------------
     */
    useEffect(() => {
        if (!selectedTournament?._id) {
            setStages([]);
            setSelectedStage(null);
            setSelectedGroup(null);
            return;
        }

        let cancelled = false;

        const loadStagesAndGroups = async () => {
            try {
                setLoadingStages(true);
                setLoadError("");
                setSelectedStage(null);
                setSelectedGroup(null);

                const headers = await getAuthHeaders(currentUser);
                
                // Using your new populated endpoint
                const res = await fetch(
                    `${API_BASE_URL}/leaderboard/tournament/${selectedTournament._id}/stages-and-groups`,
                    { headers }
                );

                if (!res.ok) throw new Error("Failed to load stages and groups");

                const data = await res.json();
                const tournamentStages = Array.isArray(data) ? data : [];

                if (cancelled) return;
                
                setStages(tournamentStages);

                // Auto-select the first stage and its first group
                if (tournamentStages.length > 0) {
                    const firstStage = tournamentStages[0];
                    setSelectedStage(firstStage);
                    
                    if (firstStage.hasGroups && firstStage.groups?.length > 0) {
                        setSelectedGroup(firstStage.groups[0]);
                    }
                }
            } catch (error) {
                console.error(error);
                if (cancelled) return;
                setStages([]);
                setLoadError(error.message);
            } finally {
                setLoadingStages(false);
            }
        };

        loadStagesAndGroups();

        return () => {
            cancelled = true;
        };
    }, [currentUser, selectedTournament]);

    /*
     * ---------------------------------------------------------
     * LOAD REGISTERED TEAMS
     * ---------------------------------------------------------
     */
    useEffect(() => {
        if (!selectedTournament?._id) return;

        const loadRegisteredTeams = async () => {
            try {
                const headers = await getAuthHeaders(currentUser);
                const response = await fetch(`${API_BASE_URL}/tournaments/${selectedTournament._id}/registrations`, { headers });
                if (!response.ok) throw new Error("Failed to load registered teams");
                const registrations = await response.json();
                setRegisteredTeams(registrations.map((registration) => registration.teamId).filter(Boolean));
            } catch (error) {
                setLoadError(error.message);
            }
        };

        loadRegisteredTeams();
    }, [currentUser, selectedTournament?._id]);

    /*
     * ---------------------------------------------------------
     * LOAD STAGE PARTICIPANTS & MATCHES
     * ---------------------------------------------------------
     */
    useEffect(() => {
        if (!selectedTournament?._id || !selectedStage?._id) {
            setMatches([]);
            setStageParticipants([]);
            return;
        }

        const loadStageData = async () => {
            try {
                const headers = await getAuthHeaders(currentUser);
                const query = new URLSearchParams({
                    tournamentId: selectedTournament._id,
                    stageId: selectedStage._id,
                });
                if (selectedGroup?._id) query.set("groupId", selectedGroup._id);

                const [matchesResponse, participantsResponse] = await Promise.all([
                    fetch(`${API_BASE_URL}/leaderboard/matches?${query}`, { headers }),
                    fetch(`${API_BASE_URL}/leaderboard/tournament/${selectedTournament._id}/stage/${selectedStage._id}/participants`, { headers }),
                ]);
                
                if (!matchesResponse.ok) throw new Error("Failed to load matches");
                if (!participantsResponse.ok) throw new Error("Failed to load participants");
                
                setMatches(await matchesResponse.json());
                setStageParticipants(await participantsResponse.json());
            } catch (error) {
                setLoadError(error.message);
            }
        };

        loadStageData();
    }, [currentUser, selectedTournament?._id, selectedStage?._id, selectedGroup?._id]);

    // ... [Rest of your selection handlers (handleTournamentSelect, handleStageSelect, etc) remain exactly the same]

    const handleTournamentSelect = (tournament) => {
        setSelectedTournament(tournament);
    };

    const handleStageSelect = (stage) => {
        setSelectedStage(stage);
        setSelectedGroup(stage.hasGroups ? stage.groups?.[0] || null : null);
    };

    const handleGroupSelect = (group) => {
        setSelectedGroup(group);
    };

    const handleAddTeam = async ({ teamId, lobbySlot }) => {
        try {
            const headers = await getAuthHeaders(currentUser);
            const response = await fetch(`${API_BASE_URL}/leaderboard/participants`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    tournamentId: selectedTournament._id,
                    stageId: selectedStage._id,
                    groupId: selectedGroup?._id || null,
                    teamId,
                    lobbyNumber: lobbySlot,
                }),
            });

            if (!response.ok) throw new Error("Failed to add team");
            const participant = await response.json();

            if (selectedGroup) {
                const updatedGroup = {
                    ...selectedGroup,
                    participants: [...(selectedGroup.participants || []), participant],
                };
                setSelectedGroup(updatedGroup);

                setStages((prevStages) =>
                    prevStages.map((stage) => {
                        if (stage._id !== selectedStage._id) return stage;
                        const updatedGroups = (stage.groups || []).map((group) =>
                            group._id === selectedGroup._id ? updatedGroup : group
                        );
                        return { ...stage, groups: updatedGroups };
                    })
                );

                setSelectedStage((prevStage) => ({
                    ...prevStage,
                    groups: (prevStage.groups || []).map((group) =>
                        group._id === selectedGroup._id ? updatedGroup : group
                    ),
                }));
            } else {
                setStageParticipants((prev) => [...prev, participant]);
            }

            setShowAddTeamModal(false);
        } catch (error) {
            console.error(error);
            setLoadError(error.message);
        }
    };

    const handlePreviewMatch = async (match, lookup) => {
        setSelectedMatch({ ...match, hostIgn: lookup.hostIgn });
        setPreviewData(null);
        setPreviewError("");
        setPreviewLoading(true);
        setShowPreviewModal(true);
        try {
            const headers = await getAuthHeaders(currentUser);
            const response = await fetch(`${API_BASE_URL}/leaderboard/match/preview/${lookup.hostIgn}/${lookup.index ?? 0}`, {
                method: "GET",
                headers,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to load PUBG match data");
            setPreviewData(data);
        } catch (error) {
            setPreviewError(error.message);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleSaveMatchData = async (data) => {
        try {
            setIsSaving(true);
            const headers = await getAuthHeaders(currentUser);
            const response = await fetch(`${API_BASE_URL}/leaderboard/match/save`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    matchId: selectedMatch._id,
                    tournamentId: selectedTournament._id,
                    stageId: selectedStage._id,
                    groupId: selectedGroup?._id || null,
                    pubgMatchId: data.pubgMatchId,
                    mapName: data.mapName,
                    gameMode: data.gameMode,
                    teamResults: data.teamResults,
                    playerResults: data.playerResults,
                    hostIgn: selectedMatch.hostIgn,
                    status: "COMPLETED",
                }),
            });
            if (!response.ok){
                const errorData = await response.json();
                setPreviewError(errorData.message || "Failed to save match data");
                throw new Error(errorData.message || "Failed to save match data");
            }
            
            setMatches((previous) => previous.map((match) => match._id === selectedMatch._id ? { ...match, status: "COMPLETED", matchId: data.pubgMatchId } : match));
            setShowPreviewModal(false);
            setIsSaving(false);
        } catch (error) {
            console.error(error);
            setPreviewError(error.message);
            setIsSaving(false);
        }
    };

    const handleCreateStage = async ({ name, order, hasGroups }) => {
        const headers = await getAuthHeaders(currentUser);
        const res = await fetch(
            editingStage
                ? `${API_BASE_URL}/leaderboard/stages/${editingStage._id}`
                : `${API_BASE_URL}/leaderboard/stages`,
            {
                method: editingStage ? "PUT" : "POST",
                headers,
                body: JSON.stringify({
                    tournamentId: selectedTournament._id,
                    name,
                    order,
                    hasGroups,
                }),
            });

        if (!res.ok) throw new Error(editingStage ? "Failed to update stage" : "Failed to create stage");

        const newStage = { ...(await res.json()), groups: [] };
        setStages((previousStages) => editingStage
            ? previousStages.map((stage) => stage._id === newStage._id ? { ...stage, ...newStage } : stage)
            : [...previousStages, newStage]);
        setSelectedStage(newStage);
        setSelectedGroup(null);
        setShowStageModal(false);
        setEditingStage(null);
    };

    const handleCreateGroup = async ({ name, order }) => {
        if (!selectedTournament || !selectedStage) return;

        const headers = await getAuthHeaders(currentUser);
        const res = await fetch(`${API_BASE_URL}/leaderboard/groups`, {
            method: "POST",
            headers,
            body: JSON.stringify({
                tournamentId: selectedTournament._id,
                stageId: selectedStage._id,
                name,
                order,
            }),
        });

        if (!res.ok) throw new Error("Failed to create group");

        const newGroup = { ...(await res.json()), participants: [] };
        const groups = [...(selectedStage.groups || []), newGroup];
        setStages((previousStages) => previousStages.map((stage) =>
            stage._id === selectedStage._id ? { ...stage, groups } : stage
        ));
        setSelectedStage((previousStage) => ({ ...previousStage, groups }));
        setSelectedGroup(newGroup);
        setShowGroupModal(false);
    };

    if (loadingTournaments) {
        return (
            <div className="leaderboard-page">
                <div className="leaderboard-loading">
                    Loading tournaments...
                </div>
            </div>
        );
    }

    return (
        <div className="leaderboard-page">
            <div className="leaderboard-page-header">
                <div>
                    <div className="leaderboard-title-row">
                        <span className="leaderboard-title-mark" />
                        <h1>Leaderboard Management</h1>
                    </div>
                    <p>Manage stages, groups, participants and match results.</p>
                </div>
            </div>

            <div className="leaderboard-layout">
                <StageSidebar
                    tournaments={tournaments}
                    selectedTournament={selectedTournament}
                    onTournamentChange={handleTournamentSelect}
                    stages={stages}
                    selectedStage={selectedStage}
                    onStageChange={handleStageSelect}
                    onCreateStage={() => setShowStageModal(true)}
                    onEditStage={(stage) => {
                        setEditingStage(stage);
                        setShowStageModal(true);
                    }}
                    loading={loadingStages}
                />

                <main className="leaderboard-main">
                    {loadError && (
                        <div className="leaderboard-error" role="alert">
                            {loadError}
                        </div>
                    )}

                    {selectedTournament && loadingStages ? (
                        <div className="leaderboard-loading">
                            Loading stages & groups...
                        </div>
                    ) : !selectedTournament ? (
                        <div className="leaderboard-empty-state">
                            <div className="empty-icon">◈</div>
                            <h2>Select a Tournament</h2>
                            <p>Select a tournament from the left panel to start managing its leaderboard.</p>
                        </div>
                    ) : !selectedStage ? (
                        <div className="leaderboard-empty-state">
                            <div className="empty-icon">◈</div>
                            <h2>No Stage Created</h2>
                            <p>Create a stage before adding groups and participants.</p>
                            <button className="primary-button" onClick={() => setShowStageModal(true)}>
                                + Create Stage
                            </button>
                        </div>
                    ) : (
                        <>
                            <section className="selected-tournament-card">
                                <div className="selected-tournament-left">
                                    <img src={selectedTournament.logo || "/default-tournament.png"} alt="" />
                                    <div>
                                        <span className="tier-badge">TIER {selectedTournament.tier}</span>
                                        <h2>{selectedTournament.title}</h2>
                                        <p>{selectedTournament.format} · {selectedTournament.mode}</p>
                                    </div>
                                </div>
                            </section>

                            <section className="stage-header-card">
                                <div>
                                    <span className="section-label">CURRENT STAGE</span>
                                    <h2>{selectedStage.name}</h2>
                                </div>
                                <div className="stage-actions">
                                    <button className="secondary-button" onClick={() => setShowGroupModal(true)}>
                                        + Add Group
                                    </button>
                                </div>
                            </section>

                            {selectedStage.hasGroups && (
                                <section className="groups-section">
                                    <div className="section-heading">
                                        <div>
                                            <h2>Groups</h2>
                                            <p>Select a group to manage its participants and matches.</p>
                                        </div>
                                    </div>
                                    <GroupTabs
                                        groups={selectedStage.groups || []}
                                        selectedGroup={selectedGroup}
                                        onGroupChange={handleGroupSelect}
                                        onCreateGroup={() => setShowGroupModal(true)}
                                    />
                                </section>
                            )}

                            {selectedContext && (
                                <ParticipantManagement
                                    participants={selectedContext.participants || []}
                                    selectedGroup={selectedContext}
                                    onAddTeam={() => setShowAddTeamModal(true)}
                                />
                            )}

                            {selectedContext && (
                                <MatchManagement
                                    matches={matches}
                                    selectedGroup={selectedContext}
                                    onCreateMatch={() => setShowMatchModal(true)}
                                    onPreviewMatch={handlePreviewMatch}
                                />
                            )}
                        </>
                    )}
                </main>
            </div>

            {/* Modals remain mostly unchanged */}
            {showStageModal && (
                <CreateStageModal
                    onClose={() => setShowStageModal(false)}
                    onSubmit={handleCreateStage}
                    stageCount={stages.length}
                    stage={editingStage}
                />
            )}

            {showGroupModal && (
                <CreateGroupModal
                    onClose={() => setShowGroupModal(false)}
                    onSubmit={handleCreateGroup}
                    groupCount={selectedStage?.groups?.length || 0}
                />
            )}

            {showMatchModal && (
                <CreateMatchModal
                    stage={selectedStage}
                    group={selectedContext}
                    onClose={() => setShowMatchModal(false)}
                    onSubmit={async (matchData) => {
                        const headers = await getAuthHeaders(currentUser);
                        const response = await fetch(`${API_BASE_URL}/leaderboard/match/create`, {
                            method: "POST",
                            headers,
                            body: JSON.stringify({
                                tournamentId: selectedTournament._id,
                                stageId: selectedStage._id,
                                groupId: selectedGroup?._id || null,
                                ...matchData,
                            }),
                        });
                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || "Failed to create match");
                        }
                        const createdMatch = await response.json();
                        setMatches((previous) => [...previous, createdMatch]);
                        setShowMatchModal(false);
                    }}
                    existingMatches={matches}
                />
            )}

            {showAddTeamModal && selectedContext && (
                <AddTeamModal
                    participants={selectedContext.participants || []}
                    teams={registeredTeams}
                    onClose={() => setShowAddTeamModal(false)}
                    onSubmit={handleAddTeam}
                />
            )}

            {showPreviewModal && (
                <MatchPreviewModal
                    match={selectedMatch}
                    data={previewData}
                    loading={previewLoading}
                    error={previewError}
                    saving={isSaving}
                    onClose={() => setShowPreviewModal(false)}
                    onSave={handleSaveMatchData}
                />
            )}
        </div>
    );
};