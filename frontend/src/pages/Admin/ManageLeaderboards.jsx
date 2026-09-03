import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getAuthHeaders } from "../../utils/authHeaders";
import "./manageLeaderboards.css";

import {
    fetchTournaments,
    fetchStages,
    fetchGroups,
    fetchParticipants,
    fetchMatches,
    createStage,
    createGroup,
    addParticipant,
    createMatch,
    previewMatchData,
    saveMatchResults,
} from "./services/leaderboardApi";

import StageSidebar from "./components/StageSidebar";
import GroupTabs from "./components/GroupTabs";
import ParticipantManagement from "./components/ParticipantManagement";
import MatchManagement from "./components/MatchManagement";

import CreateStageModal from "./components/CreateStageModal";
import CreateGroupModal from "./components/CreateGroupModal";
import AddTeamModal from "./components/AddTeamModal";
import CreateMatchModal from "./components/CreateMatchModal";
import MatchPreviewModal from "./components/MatchPreviewModal";

import "./ManageLeaderboards.css";

export const ManageLeaderboards = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    /* =========================
       Tournament
    ========================= */

    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);

    /* =========================
       Stages
    ========================= */

    const [stages, setStages] = useState([]);
    const [selectedStage, setSelectedStage] = useState(null);

    /* =========================
       Groups
    ========================= */

    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);

    /* =========================
       Participants / Matches
    ========================= */

    const [participants, setParticipants] = useState([]);
    const [matches, setMatches] = useState([]);

    /* =========================
       UI
    ========================= */

    const [activeSection, setActiveSection] = useState("participants");

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    /* =========================
       Modals
    ========================= */

    const [showStageModal, setShowStageModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showAddTeamModal, setShowAddTeamModal] = useState(false);
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const [selectedMatch, setSelectedMatch] = useState(null);
    const [previewData, setPreviewData] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [savingResults, setSavingResults] = useState(false);

    /* =========================================================
       LOAD TOURNAMENTS
    ========================================================= */

    useEffect(() => {
        loadTournaments();
    }, []);

    const loadTournaments = async () => {
        try {
            setLoading(true);

            const headers = await getAuthHeaders(currentUser);

            const data = await fetchTournaments(headers);

            setTournaments(data);

            if (data.length > 0) {
                setSelectedTournament(data[0]);
            }
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    /* =========================================================
       TOURNAMENT CHANGE
    ========================================================= */

    useEffect(() => {
        if (!selectedTournament?._id) return;

        loadStages();
    }, [selectedTournament?._id]);

    const loadStages = async () => {
        try {
            setLoading(true);
            clearMessages();

            const headers = await getAuthHeaders(currentUser);

            const data = await fetchStages(
                selectedTournament._id,
                headers
            );

            setStages(data);

            if (data.length > 0) {
                setSelectedStage(data[0]);
            } else {
                setSelectedStage(null);
            }
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    /* =========================================================
       STAGE CHANGE
    ========================================================= */

    useEffect(() => {
        if (!selectedStage?._id) {
            setGroups([]);
            setSelectedGroup(null);
            return;
        }

        loadGroups();
    }, [selectedStage?._id]);

    const loadGroups = async () => {
        try {
            const headers = await getAuthHeaders(currentUser);

            const data = await fetchGroups(
                selectedTournament._id,
                selectedStage._id,
                headers
            );

            setGroups(data);

            if (data.length > 0) {
                setSelectedGroup(data[0]);
            } else {
                setSelectedGroup(null);
            }
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    /* =========================================================
       GROUP CHANGE
    ========================================================= */

    useEffect(() => {
        if (!selectedStage?._id) return;

        loadParticipants();
        loadMatches();
    }, [
        selectedStage?._id,
        selectedGroup?._id,
    ]);

    const loadParticipants = async () => {
        try {
            const headers = await getAuthHeaders(currentUser);

            const data = await fetchParticipants({
                tournamentId: selectedTournament._id,
                stageId: selectedStage._id,
                groupId: selectedGroup?._id || null,
                headers,
            });

            setParticipants(data);
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const loadMatches = async () => {
        try {
            const headers = await getAuthHeaders(currentUser);

            const data = await fetchMatches({
                tournamentId: selectedTournament._id,
                stageId: selectedStage._id,
                groupId: selectedGroup?._id || null,
                headers,
            });

            setMatches(data);
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    /* =========================================================
       CREATE STAGE
    ========================================================= */

    const handleCreateStage = async (stageData) => {
        try {
            const headers = await getAuthHeaders(currentUser);

            const newStage = await createStage(
                selectedTournament._id,
                stageData,
                headers
            );

            setStages((prev) => [...prev, newStage]);
            setSelectedStage(newStage);

            setShowStageModal(false);
            showSuccess("Stage created successfully.");
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    /* =========================================================
       CREATE GROUP
    ========================================================= */

    const handleCreateGroup = async (groupData) => {
        try {
            const headers = await getAuthHeaders(currentUser);

            const newGroup = await createGroup(
                selectedTournament._id,
                selectedStage._id,
                groupData,
                headers
            );

            setGroups((prev) => [...prev, newGroup]);
            setSelectedGroup(newGroup);

            setShowGroupModal(false);
            showSuccess("Group created successfully.");
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    /* =========================================================
       ADD TEAM
    ========================================================= */

    const handleAddTeam = async (teamData) => {
        try {
            const headers = await getAuthHeaders(currentUser);

            await addParticipant(
                {
                    tournamentId: selectedTournament._id,
                    stageId: selectedStage._id,
                    groupId: selectedGroup?._id || null,
                    ...teamData,
                },
                headers
            );

            await loadParticipants();

            setShowAddTeamModal(false);

            showSuccess("Team added to the group.");
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    /* =========================================================
       CREATE MATCH
    ========================================================= */

    const handleCreateMatch = async (matchData) => {
        try {
            const headers = await getAuthHeaders(currentUser);

            await createMatch(
                {
                    tournamentId: selectedTournament._id,
                    stageId: selectedStage._id,
                    groupId: selectedGroup?._id || null,
                    ...matchData,
                },
                headers
            );

            await loadMatches();

            setShowMatchModal(false);

            showSuccess("Match scheduled successfully.");
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    /* =========================================================
       PREVIEW MATCH DATA
    ========================================================= */

    const handlePreviewMatch = async (match) => {
        try {
            setSelectedMatch(match);
            setPreviewData(null);
            setShowPreviewModal(true);
            setPreviewLoading(true);

            const headers = await getAuthHeaders(currentUser);

            const data = await previewMatchData(
                match._id,
                headers
            );

            setPreviewData(data);
        } catch (error) {
            setErrorMessage(error.message);
            setShowPreviewModal(false);
        } finally {
            setPreviewLoading(false);
        }
    };

    /* =========================================================
       SAVE MATCH RESULTS
    ========================================================= */

    const handleSaveMatchResults = async (data) => {
        try {
            setSavingResults(true);

            const headers = await getAuthHeaders(currentUser);

            await saveMatchResults(
                selectedMatch._id,
                data,
                headers
            );

            setShowPreviewModal(false);

            await loadMatches();

            showSuccess("Match results saved successfully.");
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setSavingResults(false);
        }
    };

    /* =========================================================
       HELPERS
    ========================================================= */

    const clearMessages = () => {
        setErrorMessage("");
        setSuccessMessage("");
    };

    const showSuccess = (message) => {
        setErrorMessage("");
        setSuccessMessage(message);

        setTimeout(() => {
            setSuccessMessage("");
        }, 3000);
    };

    return (
        <div className="manage-leaderboards">

            {/* ============================================
                PAGE HEADER
            ============================================ */}

            <div className="leaderboard-page-header">

                <div className="leaderboard-title">
                    <span className="title-mark"></span>

                    <div>
                        <h1>Leaderboard Management</h1>
                        <p>
                            Manage stages, groups, participants and match results.
                        </p>
                    </div>
                </div>

                <button
                    className="back-tournament-button"
                    onClick={() =>
                        navigate("/admin/tournaments")
                    }
                >
                    <span className="material-symbols-outlined">
                        arrow_back
                    </span>

                    Tournament Management
                </button>
            </div>

            {/* ============================================
                MESSAGES
            ============================================ */}

            {errorMessage && (
                <div className="management-message error">
                    <span className="material-symbols-outlined">
                        error
                    </span>

                    {errorMessage}

                    <button onClick={() => setErrorMessage("")}>
                        ×
                    </button>
                </div>
            )}

            {successMessage && (
                <div className="management-message success">
                    <span className="material-symbols-outlined">
                        check_circle
                    </span>

                    {successMessage}
                </div>
            )}

            {/* ============================================
                MAIN LAYOUT
            ============================================ */}

            <div className="leaderboard-layout">

                {/* ========================================
                    TOURNAMENT / STAGE SIDEBAR
                ======================================== */}

                <StageSidebar
                    tournaments={tournaments}
                    selectedTournament={selectedTournament}
                    onTournamentChange={setSelectedTournament}
                    stages={stages}
                    selectedStage={selectedStage}
                    onStageChange={setSelectedStage}
                    onCreateStage={() => {
                        clearMessages();
                        setShowStageModal(true);
                    }}
                    loading={loading}
                />

                {/* ========================================
                    CONTENT
                ======================================== */}

                <main className="leaderboard-content">

                    {!selectedTournament ? (
                        <div className="empty-management">
                            <span className="material-symbols-outlined">
                                emoji_events
                            </span>

                            <h2>No Tournament Selected</h2>

                            <p>
                                Select a tournament to start managing
                                its leaderboard.
                            </p>
                        </div>
                    ) : !selectedStage ? (
                        <div className="empty-management">
                            <span className="material-symbols-outlined">
                                account_tree
                            </span>

                            <h2>No Stage Created</h2>

                            <p>
                                Create a stage before adding groups
                                and participants.
                            </p>

                            <button
                                className="primary-button"
                                onClick={() =>
                                    setShowStageModal(true)
                                }
                            >
                                <span className="material-symbols-outlined">
                                    add
                                </span>

                                Create Stage
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* =================================
                                TOURNAMENT HEADER
                            ================================= */}

                            <section className="competition-header">

                                <div className="competition-logo">
                                    {selectedTournament.logo ? (
                                        <img
                                            src={selectedTournament.logo}
                                            alt=""
                                        />
                                    ) : (
                                        <span className="material-symbols-outlined">
                                            emoji_events
                                        </span>
                                    )}
                                </div>

                                <div className="competition-header-info">

                                    <div className="competition-badge">
                                        TIER {selectedTournament.tier}
                                    </div>

                                    <h2>
                                        {selectedTournament.title}
                                    </h2>

                                    <p>
                                        Competition & Leaderboard
                                        Management
                                    </p>

                                </div>

                            </section>

                            {/* =================================
                                STAGE HEADER
                            ================================= */}

                            <section className="stage-management-header">

                                <div>
                                    <span className="small-label">
                                        CURRENT STAGE
                                    </span>

                                    <h2>
                                        {selectedStage.name}
                                    </h2>
                                </div>

                                <div className="stage-header-actions">

                                    <button
                                        className="secondary-button"
                                        onClick={() =>
                                            setShowGroupModal(true)
                                        }
                                    >
                                        <span className="material-symbols-outlined">
                                            create_new_folder
                                        </span>

                                        Create Group
                                    </button>

                                    <button
                                        className="primary-button"
                                        onClick={() =>
                                            setShowAddTeamModal(true)
                                        }
                                        disabled={
                                            !selectedGroup
                                        }
                                    >
                                        <span className="material-symbols-outlined">
                                            group_add
                                        </span>

                                        Add Team
                                    </button>

                                </div>

                            </section>

                            {/* =================================
                                GROUP TABS
                            ================================= */}

                            <GroupTabs
                                groups={groups}
                                selectedGroup={selectedGroup}
                                onGroupChange={setSelectedGroup}
                                onCreateGroup={() =>
                                    setShowGroupModal(true)
                                }
                            />

                            {/* =================================
                                SECTION TABS
                            ================================= */}

                            {selectedGroup && (
                                <div className="management-tabs">

                                    <button
                                        className={
                                            activeSection ===
                                            "participants"
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setActiveSection(
                                                "participants"
                                            )
                                        }
                                    >
                                        <span className="material-symbols-outlined">
                                            groups
                                        </span>

                                        Participants

                                        <span className="tab-count">
                                            {participants.length}
                                        </span>
                                    </button>

                                    <button
                                        className={
                                            activeSection ===
                                            "matches"
                                                ? "active"
                                                : ""
                                        }
                                        onClick={() =>
                                            setActiveSection(
                                                "matches"
                                            )
                                        }
                                    >
                                        <span className="material-symbols-outlined">
                                            sports_esports
                                        </span>

                                        Matches

                                        <span className="tab-count">
                                            {matches.length}
                                        </span>
                                    </button>

                                </div>
                            )}

                            {/* =================================
                                CONTENT
                            ================================= */}

                            {!selectedGroup ? (
                                <div className="no-group-state">

                                    <span className="material-symbols-outlined">
                                        folder_open
                                    </span>

                                    <h3>No Group Selected</h3>

                                    <p>
                                        Create a group and assign
                                        registered teams to it.
                                    </p>

                                </div>
                            ) : activeSection ===
                              "participants" ? (

                                <ParticipantManagement
                                    participants={participants}
                                    selectedGroup={selectedGroup}
                                    onAddTeam={() =>
                                        setShowAddTeamModal(true)
                                    }
                                />

                            ) : (

                                <MatchManagement
                                    matches={matches}
                                    selectedGroup={selectedGroup}
                                    onCreateMatch={() =>
                                        setShowMatchModal(true)
                                    }
                                    onPreviewMatch={
                                        handlePreviewMatch
                                    }
                                />

                            )}

                        </>
                    )}

                </main>

            </div>

            {/* ============================================
                MODALS
            ============================================ */}

            {showStageModal && (
                <CreateStageModal
                    onClose={() =>
                        setShowStageModal(false)
                    }
                    onSubmit={handleCreateStage}
                    stageCount={stages.length}
                />
            )}

            {showGroupModal && (
                <CreateGroupModal
                    onClose={() =>
                        setShowGroupModal(false)
                    }
                    onSubmit={handleCreateGroup}
                    groupCount={groups.length}
                />
            )}

            {showAddTeamModal && (
                <AddTeamModal
                    tournamentId={
                        selectedTournament?._id
                    }
                    stageId={selectedStage?._id}
                    groupId={selectedGroup?._id}
                    participants={participants}
                    onClose={() =>
                        setShowAddTeamModal(false)
                    }
                    onSubmit={handleAddTeam}
                />
            )}

            {showMatchModal && (
                <CreateMatchModal
                    selectedGroup={selectedGroup}
                    existingMatches={matches}
                    onClose={() =>
                        setShowMatchModal(false)
                    }
                    onSubmit={handleCreateMatch}
                />
            )}

            {showPreviewModal && (
                <MatchPreviewModal
                    match={selectedMatch}
                    data={previewData}
                    loading={previewLoading}
                    saving={savingResults}
                    onClose={() =>
                        setShowPreviewModal(false)
                    }
                    onSave={handleSaveMatchResults}
                />
            )}

        </div>
    );
};

