

import { useState, useRef } from "react";
import "./teamsTab.css";

const initialTeam = {
    teamName: "BDX OBSIDIAN",
    teamLogo: "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-OBSIDIAN.webp",
};

const initialMembers = [
    {
        id: 1,
        name: "Alice Nguyen",
        ign: "BlazeQueen",
        profilePic: "https://i.pravatar.cc/80?img=25",
        nationality: "Vietnam",
    },
    {
        id: 2,
        name: "John Carter",
        ign: "JetStream",
        profilePic: "https://i.pravatar.cc/80?img=47",
        nationality: "USA",
    },
];

export function TeamsTab() {
    const [team, setTeam] = useState(initialTeam);
    const [members, setMembers] = useState(initialMembers);
    const [isEditingTeam, setIsEditingTeam] = useState(false);
    const [editTeamName, setEditTeamName] = useState(initialTeam.teamName);
    const [editTeamLogo, setEditTeamLogo] = useState(initialTeam.teamLogo);
    const [newMember, setNewMember] = useState({ name: "", ign: "", profilePic: "", nationality: "" });
    const [isAddPlayerPanelOpen, setIsAddPlayerPanelOpen] = useState(false);
    const [editingMemberId, setEditingMemberId] = useState(null);
    const [editMemberData, setEditMemberData] = useState({ id: null, name: "", ign: "", profilePic: "", nationality: "" });
    const [addMemberDraft, setAddMemberDraft] = useState({ name: "", ign: "", profilePic: "", nationality: "" });
    const logoInputRef = useRef(null);
    const memberFileInputRef = useRef(null);

    const handleLogoInputClick = () => {
        if (logoInputRef.current) {
            logoInputRef.current.click();
        }
    };

    const handleTeamLogoUpload = event => {
        const file = event.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setEditTeamLogo(imageUrl);
        }
    };

    const [isCreating, setIsCreating] = useState(false);
    const [createTeamName, setCreateTeamName] = useState("");
    const [createTeamLogo, setCreateTeamLogo] = useState("");

    const handleStartEditing = () => {
        setEditTeamName(team.teamName);
        setEditTeamLogo(team.teamLogo);
        setIsEditingTeam(true);
    };

    const handleSaveTeam = () => {
        setTeam(prev => ({ ...prev, teamName: editTeamName, teamLogo: editTeamLogo }));
        setIsEditingTeam(false);
    };

    const handleCancelEdit = () => {
        setEditTeamName(team.teamName);
        setEditTeamLogo(team.teamLogo);
        setIsEditingTeam(false);
    };

    const handleAddMember = event => {
        event.preventDefault();
        const source = isAddPlayerPanelOpen ? addMemberDraft : newMember;
        if (!source.name.trim() || !source.ign.trim()) return;
        const nextMember = {
            ...source,
            id: members.length ? Math.max(...members.map(m => m.id)) + 1 : 1,
            profilePic: source.profilePic || "https://i.pravatar.cc/80?img=65",
        };
        setMembers(prev => [...prev, nextMember]);
        setNewMember({ name: "", ign: "", profilePic: "", nationality: "" });
        setAddMemberDraft({ name: "", ign: "", profilePic: "", nationality: "" });
        setIsAddPlayerPanelOpen(false);
    };

    const handleRemoveMember = id => {
        setMembers(prev => prev.filter(member => member.id !== id));
    };

    const startEditMember = member => {
        setEditingMemberId(member.id);
        setEditMemberData({ ...member });
    };

    const cancelEditMember = () => {
        setEditingMemberId(null);
        setEditMemberData({ id: null, name: "", ign: "", profilePic: "", nationality: "" });
    };

    const saveMemberEdits = () => {
        setMembers(prev => prev.map(member => (member.id === editingMemberId ? { ...editMemberData } : member)));
        cancelEditMember();
    };

    const handleEditMemberUpload = event => {
        const file = event.target.files?.[0];
        if (file) {
            setEditMemberData(prev => ({ ...prev, profilePic: URL.createObjectURL(file) }));
        }
    };

    const handleAddPlayerImageUpload = event => {
        const file = event.target.files?.[0];
        if (file) {
            setAddMemberDraft(prev => ({ ...prev, profilePic: URL.createObjectURL(file) }));
        }
    };


    const handleCreateTeam = () => {
        if (!createTeamName.trim()) return;
        const created = {
            teamName: createTeamName,
            teamLogo: createTeamLogo || "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-OBSIDIAN.webp",
        };
        setTeam(created);
        setMembers([]);
        setIsCreating(false);
        setCreateTeamName("");
        setCreateTeamLogo("");
    };

    return (
        <div className="team-container">
            {team ? (
                <>
                    <div className="team-wrap">
                        <h1>Main Team</h1>
                        <div className="team-info">
                            <button className="team-edit-icon" type="button" onClick={handleStartEditing}>
                                ✎
                            </button>
                            <div className="team-logo-wrap" onClick={isEditingTeam ? handleLogoInputClick : undefined}>
                                <img src={isEditingTeam ? editTeamLogo : team.teamLogo} alt="Team Logo" />
                                {isEditingTeam && <span className="logo-overlay">Change Logo</span>}
                            </div>
                            <input
                                ref={logoInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleTeamLogoUpload}
                            />

                            <div className="team-details">
                                {isEditingTeam ? (
                                    <input
                                        className="teamNameInput"
                                        value={editTeamName}
                                        onChange={e => setEditTeamName(e.target.value)}
                                    />
                                ) : (
                                    <p className="teamName">{team.teamName}</p>
                                )}
                            </div>

                            {isEditingTeam && (
                                <div className="team-edit-actions">
                                    <button className="btn" type="button" onClick={handleSaveTeam}>
                                        Save
                                    </button>
                                    <button className="btn secondary" type="button" onClick={handleCancelEdit}>
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        <section className="members-section">
                            <h2>Team Members</h2>
                            <div className="member-list grid">
                                {members.map(member => (
                                    <article key={member.id} className="member-card-square">
                                        {editingMemberId === member.id ? (
                                            <>
                                                <div className="member-avatar-wrap" onClick={() => memberFileInputRef.current?.click()}>
                                                    <img src={editMemberData.profilePic || "https://i.pravatar.cc/120?img=65"} alt={editMemberData.name} />
                                                    <span className="logo-overlay">Upload Image</span>
                                                </div>
                                                <input
                                                    ref={memberFileInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: "none" }}
                                                    onChange={handleEditMemberUpload}
                                                />
                                                <input
                                                    value={editMemberData.name}
                                                    onChange={e => setEditMemberData(prev => ({ ...prev, name: e.target.value }))}
                                                    placeholder="Name"
                                                />
                                                <input
                                                    value={editMemberData.ign}
                                                    onChange={e => setEditMemberData(prev => ({ ...prev, ign: e.target.value }))}
                                                    placeholder="IGN"
                                                />
                                                <input
                                                    value={editMemberData.nationality}
                                                    onChange={e => setEditMemberData(prev => ({ ...prev, nationality: e.target.value }))}
                                                    placeholder="Nationality"
                                                />
                                                <div className="member-actions">
                                                    <button className="btn" type="button" onClick={saveMemberEdits}>
                                                        Save
                                                    </button>
                                                    <button className="btn secondary" type="button" onClick={cancelEditMember}>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="member-avatar-wrap">
                                                    <img src={member.profilePic} alt={member.name} />
                                                </div>
                                                <div className="member-summary">
                                                    <strong>{member.ign}</strong>
                                                    <span>{member.name}</span>
                                                    <span>{member.nationality || "Unknown"}</span>
                                                </div>
                                                <div className="member-actions">
                                                    <button className="btn small" onClick={() => startEditMember(member)}>
                                                        Edit
                                                    </button>
                                                    <button className="btn danger small" onClick={() => handleRemoveMember(member.id)}>
                                                        Remove
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </article>
                                ))}

                                <article className="member-card-square add-card" onClick={() => setIsAddPlayerPanelOpen(true)}>
                                    <span className="add-icon">+</span>
                                    <span>Add Player</span>
                                </article>
                            </div>

                            {isAddPlayerPanelOpen && (
                                <form className="add-member-form card-form" onSubmit={handleAddMember}>
                                    <h3>Add Player</h3>
                                    <div className="member-avatar-wrap" onClick={() => memberFileInputRef.current?.click()}>
                                        <img
                                            src={addMemberDraft.profilePic || "https://i.pravatar.cc/120?img=68"}
                                            alt="New Player"
                                        />
                                        <span className="logo-overlay">Upload Image</span>
                                    </div>
                                    <input
                                        ref={memberFileInputRef}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={handleAddPlayerImageUpload}
                                    />
                                    <input
                                        placeholder="Name"
                                        value={addMemberDraft.name}
                                        onChange={e => setAddMemberDraft(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                    <input
                                        placeholder="IGN"
                                        value={addMemberDraft.ign}
                                        onChange={e => setAddMemberDraft(prev => ({ ...prev, ign: e.target.value }))}
                                    />
                                    <input
                                        placeholder="Nationality"
                                        value={addMemberDraft.nationality}
                                        onChange={e => setAddMemberDraft(prev => ({ ...prev, nationality: e.target.value }))}
                                    />
                                    <div className="member-actions">
                                        <button className="btn" type="submit">
                                            Add
                                        </button>
                                        <button className="btn secondary" type="button" onClick={() => setIsAddPlayerPanelOpen(false)}>
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </section>
                    </div>
                </>
            ) : (
                <div className="no-team-wrap">
                    <h2>No team found</h2>
                    {isCreating ? (
                        <div className="team-create-panel">
                            <input
                                placeholder="Team Name"
                                value={createTeamName}
                                onChange={e => setCreateTeamName(e.target.value)}
                            />
                            <input
                                placeholder="Team Logo URL"
                                value={createTeamLogo}
                                onChange={e => setCreateTeamLogo(e.target.value)}
                            />
                            <div className="create-buttons">
                                <button className="btn" onClick={handleCreateTeam}>
                                    Create
                                </button>
                                <button className="btn secondary" onClick={() => setIsCreating(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button className="btn" onClick={() => setIsCreating(true)}>
                            Create Team
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
