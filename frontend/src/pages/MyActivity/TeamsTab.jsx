import React, { useState, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import { Loader } from "../../components/Loader";
import { useAuth } from "../../components/useAuth";
import { getAuthHeaders } from "../../utils/authHeaders";
import { uploadAvatarToSupabase } from "../../utils/supabaseClient";
import { getCroppedImg } from "../../utils/cropUtils";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import "./teamsTab.css";

const DEFAULT_TEAM_LOGO =
    "https://ybnzezsvnqdzbszjfuku.supabase.co/storage/v1/object/public/bdx-bucket/defaults/default-profile.png";

export function TeamsTab({ onNavigateToProfile, profile, team, members = [], managers = [], loading = false, reloadActivityData }) {
    const { currentUser } = useAuth();
    const [role, setRole] = useState("player");
    const isOwner = team && team.owner_id === currentUser?.uid;

    // Modals State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateLogoModalOpen, setIsUpdateLogoModalOpen] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    // Image Cropper State
    const [imageToCrop, setImageToCrop] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const fileInputRef = useRef(null);

    // Search & Add Member State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [addMemberSuccessMessage, setAddMemberSuccessMessage] = useState("");

    // General State
    const [selectedNewOwner, setSelectedNewOwner] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Invitations State
    const [incomingInvitations, setIncomingInvitations] = useState([]);
    const [outgoingInvitations, setOutgoingInvitations] = useState([]);

    // Refresh Data
    const refreshActivityData = async () => {
        if (reloadActivityData) {
            await reloadActivityData();
        }
        fetchInvitations();
    };

    // ==========================================
    // INVITATION FETCHING (Matches your Router)
    // ==========================================
    const fetchInvitations = async () => {
        try {
            const headers = await getAuthHeaders(currentUser);

            // If player has NO team, fetch /received
            if (!team) {
                const incRes = await fetch(`/api/invitations/received`, { headers });
                if (incRes.ok) {
                    const data = await incRes.json();
                    setIncomingInvitations(data || []);
                }
            }

            // If player IS an owner, fetch /sent
            if (team && isOwner) {
                // Passing teamId just in case your requireTeamOwnership needs it in query/body
                const outRes = await fetch(`/api/invitations/sent?teamId=${team.id}`, { headers });
                if (outRes.ok) {
                    const data = await outRes.json();
                    setOutgoingInvitations(data || []);
                }
            }
        } catch (error) {
            console.error("Failed to fetch invitations:", error);
        }
    };

    useEffect(() => {
        if (currentUser?.uid && profile) {
            fetchInvitations();
        }
    }, [currentUser, profile, team, isOwner]);

    // ==========================================
    // INVITATION HANDLERS (Matches your Router)
    // ==========================================
    const handleAcceptInvitation = async (invId) => {
        setSubmitting(true);
        try {
            const headers = await getAuthHeaders(currentUser);
            const res = await fetch(`/api/invitations/${invId}/accept`, { method: "PUT", headers });
            if (!res.ok) throw new Error("Failed to accept invitation");
            await refreshActivityData();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRejectInvitation = async (invId) => {
        setSubmitting(true);
        try {
            const headers = await getAuthHeaders(currentUser);
            const res = await fetch(`/api/invitations/${invId}/reject`, { method: "PUT", headers });
            if (!res.ok) throw new Error("Failed to reject invitation");
            await refreshActivityData();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelInvitation = async (invId) => {
        setSubmitting(true);
        try {
            const headers = await getAuthHeaders(currentUser);
            const res = await fetch(`/api/invitations/${invId}/cancel`, {
                method: "PUT",
                headers,
                body: JSON.stringify({ teamId: team.id })
            });
            if (!res.ok) throw new Error("Failed to cancel invitation");
            await refreshActivityData();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendInvitation = async (player) => {
        setSubmitting(true);
        setErrorMessage("");
        setAddMemberSuccessMessage("");
        try {
            const headers = await getAuthHeaders(currentUser);
            // Matches POST "/" -> sendInvitation controller
            const res = await fetch(`/api/invitations`, {
                method: "POST",
                headers,
                body: JSON.stringify({
                    teamId: team.id,
                    receiverId: player.user,
                    role
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Could not send invitation.");
            }

            await refreshActivityData();
            setSearchQuery("");
            setSearchResults((prev) => prev.filter((p) => p.user !== player.user));
            setAddMemberSuccessMessage(`Invitation sent to ${player.ign} successfully!`);
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ==========================================
    // TEAM & MEMBER LOGIC
    // ==========================================
    const teamSchema = yup.object({
        name: yup.string().required("Team name is required").max(50),
        teamTag: yup.string().required("Team tag is required").min(2).max(4).uppercase(),
        country: yup.string().required("Country is required").max(50),
    });

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(teamSchema),
        mode: "onBlur",
    });

    const resetCropper = () => {
        setImageToCrop(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
    };

    const handleImageFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener("load", () => setImageToCrop(reader.result));
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const processImageUpload = async (teamName) => {
        if (imageToCrop && croppedAreaPixels) {
            const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            return await uploadAvatarToSupabase(croppedBlob, `team-${teamName}-${Date.now()}`, 'teams');
        }
        return DEFAULT_TEAM_LOGO;
    };

    const handleCreateTeam = async (data) => {
        setSubmitting(true);
        setErrorMessage("");
        try {
            const headers = await getAuthHeaders(currentUser);
            const logoUrl = await processImageUpload(data.name.trim());
            const payload = {
                name: data.name.trim(),
                teamTag: data.teamTag.trim().toUpperCase(),
                country: data.country.trim(),
                logo: logoUrl,
            };

            const res = await fetch("/api/teams", {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.message || "Failed to create team.");
            }

            await refreshActivityData();
            setIsCreateModalOpen(false);
            resetCropper();
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateLogo = async (e) => {
        e.preventDefault();
        if (!imageToCrop) return;
        setSubmitting(true);
        setErrorMessage("");

        try {
            const logoUrl = await processImageUpload(team.name);
            const headers = await getAuthHeaders(currentUser);
            const res = await fetch(`/api/teams/${team.id}/logo`, {
                method: "PUT",
                headers,
                body: JSON.stringify({ logo: logoUrl }),
            });

            if (!res.ok) throw new Error("Failed to update logo.");
            await refreshActivityData();
            setIsUpdateLogoModalOpen(false);
            resetCropper();
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSearchPlayer = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        const headers = await getAuthHeaders(currentUser);
        setAddMemberSuccessMessage("");
        setErrorMessage("");
        try {
            const res = await fetch(`/api/profile/search?query=${encodeURIComponent(searchQuery)}`, { headers });
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data);
            } else {
                setSearchResults([]);
            }
        } catch {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleTransferOwnership = async (e) => {
        e.preventDefault();
        if (!selectedNewOwner) return;

        const confirm = window.confirm("Are you sure you want to transfer ownership of this team? This action is permanent.");
        if (!confirm) return;

        setSubmitting(true);
        setErrorMessage("");
        try {
            const headers = await getAuthHeaders(currentUser);
            const res = await fetch(`/api/teams/${team.id}/transfer`, {
                method: "PUT",
                headers,
                body: JSON.stringify({ newOwnerId: selectedNewOwner }),
            });

            if (!res.ok) throw new Error("Failed to transfer ownership.");
            await refreshActivityData();
            setIsTransferModalOpen(false);
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDisbandTeam = async () => {
        const confirm = window.confirm("Are you sure you want to disband this team? This action is permanent.");
        if (!confirm) return;

        setSubmitting(true);
        try {
            const headers = await getAuthHeaders(currentUser);
            const res = await fetch(`/api/teams/${team.id}`, {
                method: "DELETE",
                headers,
                body: JSON.stringify({ ownerId: currentUser.uid }),
            });
            if (!res.ok) throw new Error("Failed to disband team.");
            await refreshActivityData();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveMember = async (memberId, memberName) => {
        const confirm = window.confirm(`Are you sure you want to remove ${memberName}?`);
        if (!confirm) return;

        setSubmitting(true);
        try {
            const headers = await getAuthHeaders(currentUser);
            const res = await fetch(`/api/teams/${team.id}/members/${memberId}`, {
                method: "DELETE",
                headers,
            });
            if (!res.ok) throw new Error("Failed to remove player.");
            await refreshActivityData();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLeaveTeam = async () => {
        const confirm = window.confirm("Are you sure you want to leave this team?");
        if (!confirm) return;

        setSubmitting(true);
        try {
            const headers = await getAuthHeaders(currentUser);
            const res = await fetch(`/api/teams/${team.id}/leave`, {
                method: "DELETE",
                headers,
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to leave team.");
            }
            await refreshActivityData();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ==========================================
    // RENDER LOGIC
    // ==========================================
    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading-state"><Loader /></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="profile-container">
                <div className="activity-title-bar">
                    <svg className="section-icon" width="32" height="16" viewBox="0 0 32 16">
                        <path d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z" fill="#EFF923" />
                        <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000000" />
                    </svg>
                    <h2>Team Details</h2>
                </div>
                <div className="no-profile-card">
                    <h3>Player Profile Required</h3>
                    <p className="team-subtext">You must set up your player profile before creating or joining a team.</p>
                    <button className="edit-profile primary" type="button" onClick={onNavigateToProfile}>
                        Go To Profile Tab
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="activity-title-bar">
                <svg className="section-icon" width="32" height="16" viewBox="0 0 32 16">
                    <path d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z" fill="#EFF923" />
                    <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000000" />
                </svg>
                <h2>Team Details</h2>

                {team && isOwner && (
                    <div className="team-header-actions">
                        <button className="edit-profile" type="button" onClick={() => {
                            setErrorMessage("");
                            resetCropper();
                            setIsUpdateLogoModalOpen(true);
                        }}>
                            <span className="material-symbols-outlined">image</span> Update Logo
                        </button>
                    </div>
                )}
            </div>

            {!team ? (
                <div className="no-profile-card">
                    
                    <h3>No Active Team Found</h3>
                    <p className="team-subtext">Create a team and lead your squad to victory.</p>
                    <button className="edit-profile primary" type="button" onClick={() => {
                        setErrorMessage("");
                        resetCropper();
                        setIsCreateModalOpen(true);
                    }}>
                        <span className="material-symbols-outlined">add</span> Create Team Now
                    </button>
                </div>
            ) : (
                <div className="team-view-stack">
                    <div className="profile-hero-card">
                        <div className="profile-avatar-frame team-logo-frame">
                            <img src={team.logo || DEFAULT_TEAM_LOGO} alt={`${team.name} logo`} />
                        </div>

                        <div className="profile-info-body">
                            <div className="profile-header-meta">
                                <div className="team-owner-container">
                                    <h3>{team.name} ({team.teamTag})</h3>
                                    <span className="team-owner-badge">Owner: {isOwner ? "You" : team.owner_name}</span>
                                </div>
                                <span className="profile-country-chip">{team.country}</span>
                            </div>

                            {isOwner ? (
                                <div className="team-owner-controls">
                                    {members.length < 6 && (
                                        <button className="profile-action-button secondary" onClick={() => {
                                            setRole("player");
                                            setErrorMessage("");
                                            setAddMemberSuccessMessage("");
                                            setSearchQuery("");
                                            setSearchResults([]);
                                            setIsAddMemberModalOpen(true);
                                        }}>
                                            <span className="material-symbols-outlined">person_add</span> Invite Player
                                        </button>
                                    )}

                                    <button className="profile-action-button secondary" onClick={() => {
                                        setErrorMessage("");
                                        setSelectedNewOwner("");
                                        setIsTransferModalOpen(true);
                                    }}>
                                        <span className="material-symbols-outlined">swap_horiz</span> Transfer Ownership
                                    </button>
                                    <button className="profile-action-button danger" onClick={handleDisbandTeam}>
                                        <span className="material-symbols-outlined">delete</span> Disband Team
                                    </button>
                                </div>
                            ) : (
                                <div className="team-owner-controls">
                                    <button className="profile-action-button danger" onClick={handleLeaveTeam}>
                                        <span className="material-symbols-outlined">logout</span> Leave Team
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="team-roster-section">
                        <div className="roster-header">
                            <div className="activity-title-bar">
                                <svg className="section-icon" width="32" height="16" viewBox="0 0 32 16">
                                    <path d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z" fill="#EFF923" />
                                    <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000000" />
                                </svg>
                                <h2>Active Roster ({members.length}/6)</h2>
                            </div>
                        </div>

                        <div className="roster-grid">
                            {members.map((member) => (
                                <div key={member.user_id} className="roster-card">
                                    <div className="roster-user-info">
                                        <img src={member.picture || DEFAULT_TEAM_LOGO} alt={member.displayName} className="roster-avatar" />
                                        <div className="roster-meta">
                                            <strong>{member.ign || member.displayName}</strong>
                                            <span className="roster-role">{member.role}</span>
                                        </div>
                                    </div>
                                    {isOwner && member.role !== "owner" && (
                                        <button className="kick-button" onClick={() => handleRemoveMember(member.user_id, member.ign || member.displayName)} title="Remove Player">
                                            <span className="material-symbols-outlined">person_remove</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="manager-section">
                            <div className="activity-title-bar">
                                <svg className="section-icon" width="32" height="16" viewBox="0 0 32 16">
                                    <path d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z" fill="#EFF923" />
                                    <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000000" />
                                </svg>
                                <h2>Managers ({managers.length}/2)</h2>

                                {isOwner && managers.length < 2 && (
                                    <div className="team-header-actions">
                                        <button className="profile-action-button secondary" onClick={() => {
                                            setRole("manager");
                                            setErrorMessage("");
                                            setAddMemberSuccessMessage("");
                                            setSearchQuery("");
                                            setSearchResults([]);
                                            setIsAddMemberModalOpen(true);
                                        }}>
                                            <span className="material-symbols-outlined">person_add</span>
                                            Invite
                                        </button>
                                    </div>
                                )}
                            </div>

                            {managers.length === 0 ? (
                                <div className="empty-state">
                                    <p>No managers found.</p>
                                </div>
                            ) : (
                                <div className="roster-grid">
                                    {managers.map(manager => (
                                        <div key={manager.user_id} className="roster-card">
                                            <div className="roster-user-info">
                                                <img src={manager.picture || DEFAULT_TEAM_LOGO} alt={manager.displayName} className="roster-avatar" />
                                                <div className="roster-meta">
                                                    <strong>{manager.ign || manager.displayName}</strong>
                                                    <span className="roster-role">{manager.role}</span>
                                                </div>
                                            </div>
                                            {isOwner && manager.role !== "owner" && (
                                                <button className="kick-button" onClick={() => handleRemoveMember(manager.user_id, manager.ign || manager.displayName)} title="Remove Manager">
                                                    <span className="material-symbols-outlined">person_remove</span>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )
                            }



                        </div>

                        {/* OUTGOING INVITATIONS */}
                        {isOwner && outgoingInvitations.length > 0 && (
                            <div className="manager-section">
                                <div className="activity-title-bar">
                                    <svg className="section-icon" width="32" height="16" viewBox="0 0 32 16">
                                        <path d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z" fill="#EFF923" />
                                        <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000000" />
                                    </svg>
                                    <h2>Sent Invitations ({outgoingInvitations.length})</h2>
                                </div>
                                <div className="roster-grid">
                                    {outgoingInvitations.map(inv => (
                                        <div key={inv._id || inv.id} className="roster-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div className="roster-user-info">
                                                <img src={inv.picture || DEFAULT_TEAM_LOGO} alt={inv.displayName} className="roster-avatar" />
                                                <div className="roster-meta">
                                                    <strong>{inv.receiver?.ign || "Player"}</strong>
                                                    <span className="roster-role">Invited as: {inv.role}</span>
                                                </div>
                                            </div>
                                            <button className="kick-button" onClick={() => handleCancelInvitation(inv._id || inv.id)} title="Cancel Invitation" disabled={submitting}>
                                                <span className="material-symbols-outlined">cancel</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ==========================================
                MODALS RESTORED HERE 
                ========================================== */}

            {/* 1. Create Team Modal */}
            {isCreateModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Create New Team</h3>
                            <button type="button" className="modal-close" onClick={() => setIsCreateModalOpen(false)}>
                                &times;
                            </button>
                        </div>
                        {errorMessage && <div className="error-banner">{errorMessage}</div>}
                        <form onSubmit={handleSubmit(handleCreateTeam)} className="modal-form">
                            <div className="form-group">
                                <label className="profile-label">Team Logo (Square PNG/JPG)</label>
                                {imageToCrop ? (
                                    <div className="cropper-wrapper">
                                        <div className="cropper-container">
                                            <Cropper image={imageToCrop} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />
                                        </div>
                                        <div className="zoom-controls">
                                            <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="zoom-slider" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="avatar-picker-box">
                                        <div className="avatar-placeholder-circle">
                                            <span className="material-symbols-outlined">file_upload</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="profile-action-button secondary"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Upload Team Logo
                                        </button>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleImageFileSelect}
                                    style={{ display: "none" }}
                                />
                            </div>
                            <div className="form-group">
                                <label className="profile-label">Team Name</label>
                                <input type="text" className={`profile-input ${errors.name ? "input-error" : ""}`} {...register("name")} />
                                {errors.name && <p className="form-error">{errors.name.message}</p>}
                            </div>
                            <div className="form-group">
                                <label className="profile-label">Team Tag</label>
                                <input type="text" className={`profile-input ${errors.teamTag ? "input-error" : ""}`} {...register("teamTag")} />
                                {errors.teamTag && <p className="form-error">{errors.teamTag.message}</p>}
                            </div>
                            <div className="form-group">
                                <label className="profile-label">Country</label>
                                <input type="text" className={`profile-input ${errors.country ? "input-error" : ""}`} {...register("country")} />
                                {errors.country && <p className="form-error">{errors.country.message}</p>}
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="profile-action-button danger" onClick={() => setIsCreateModalOpen(false)} disabled={submitting}>Cancel</button>
                                <button type="submit" className="profile-action-button primary" disabled={submitting}>{submitting ? "Creating..." : "Create Team"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="team-section">
                {!team && incomingInvitations.length > 0 && (
                    <>
                    <div className="activity-title-bar">
                        <svg className="section-icon" width="32" height="16" viewBox="0 0 32 16">
                            <path d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z" fill="#EFF923" />
                            <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000000" />
                        </svg>
                        <h2>Pending Invitations ({incomingInvitations.length})</h2>

                        {team && isOwner && (
                            <div className="team-header-actions">
                                <button className="edit-profile" type="button" onClick={() => {
                                    setErrorMessage("");
                                    resetCropper();
                                    setIsUpdateLogoModalOpen(true);
                                }}>
                                    <span className="material-symbols-outlined">image</span> Update Logo
                                </button>
                            </div>
                        )}
                    </div>


               

                <div className="roster-grid invitations-grid">
                    {incomingInvitations.map((inv) => (
                        <div key={inv._id || inv.id} className="roster-card">
                            <div className="roster-meta">
                                <strong>{inv.team?.name || "Unknown Team"}</strong>
                                <span className="roster-role">Role: {inv.role}</span>
                            </div>
                            <div className="invitation-actions">
                                <button
                                    className="profile-action-button danger"
                                    onClick={() => handleRejectInvitation(inv._id || inv.id)}
                                    disabled={submitting}
                                >Reject</button>
                                <button
                                    className="profile-action-button primary"
                                    onClick={() => handleAcceptInvitation(inv._id || inv.id)}
                                    disabled={submitting}
                                >Accept</button>
                            </div>
                        </div>
                    ))}
                </div>
                    </>
 )}
            </div>


            {/* 2. Update Logo Modal */}
            {isUpdateLogoModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Update Team Logo</h3>
                            <button type="button" className="modal-close" onClick={() => setIsUpdateLogoModalOpen(false)}>&times;</button>
                        </div>
                        {errorMessage && <div className="error-banner">{errorMessage}</div>}
                        <form onSubmit={handleUpdateLogo} className="modal-form">
                            <div className="form-group">
                                <label className="profile-label">Select New Logo</label>
                                {imageToCrop ? (
                                    <div className="cropper-wrapper">
                                        <div className="cropper-container">
                                            <Cropper
                                                image={imageToCrop}
                                                crop={crop}
                                                zoom={zoom}
                                                aspect={1}
                                                onCropChange={setCrop}
                                                onCropComplete={onCropComplete}
                                                onZoomChange={setZoom}
                                            />
                                        </div>
                                        <div className="zoom-controls">
                                            <input
                                                type="range"
                                                value={zoom}
                                                min={1} max={3}
                                                step={0.1}
                                                onChange={(e) => setZoom(e.target.value)}
                                                className="zoom-slider" />
                                        </div>
                                    </div>
                                ) :
                                    (
                                        <div className="avatar-picker-box">
                                            <button
                                                type="button"
                                                className="profile-action-button secondary"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                Choose New Image
                                            </button>
                                        </div>
                                    )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleImageFileSelect}
                                    style={{ display: "none" }}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="profile-action-button danger" onClick={() => setIsUpdateLogoModalOpen(false)} disabled={submitting}>Cancel</button>
                                <button type="submit" className="profile-action-button primary" disabled={submitting || !imageToCrop}>{submitting ? "Updating..." : "Update Logo"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. Add Member / Send Invitation Modal */}
            {isAddMemberModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Invite {role === "manager" ? "Manager" : "Player"}</h3>
                            <button type="button" className="modal-close"
                                onClick={() => setIsAddMemberModalOpen(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">

                            {errorMessage && <div className="error-banner">{errorMessage}</div>}
                            {addMemberSuccessMessage && <div className="success-banner">{addMemberSuccessMessage}</div>}

                            <div className="form-group">
                                <label className="profile-label">Search Player by IGN or Name</label>
                                <div className="ign-input-group">
                                    <input
                                        type="text"
                                        className="modal-input"
                                        placeholder="Enter IGN..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setAddMemberSuccessMessage("");
                                        }}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearchPlayer()}
                                    />
                                    <button
                                        type="button"
                                        className="verify-button"
                                        onClick={handleSearchPlayer}
                                        disabled={isSearching || !searchQuery.trim()}
                                    >
                                        {isSearching ? "Searching..." : "Search"}
                                    </button>
                                </div>
                            </div>

                            <div className="search-results-list">
                                {searchResults.length > 0 ? (
                                    searchResults.map((player) => (
                                        <div key={player.user} className="search-result-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#111', borderRadius: '4px', marginBottom: '10px' }}>
                                            <div className="result-user">
                                                <img
                                                    src={player.picture || DEFAULT_TEAM_LOGO}
                                                    alt={player.ign}
                                                />
                                                <div>
                                                    <strong>{player.ign}</strong>
                                                    <span>({player.displayName})</span>
                                                    {/* Show their current team status if they have one */}
                                                    {player.currentTeam && (
                                                        <div style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "2px" }}>
                                                            Already in: {player.currentTeam}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                // className="profile-action-button secondary"
                                                className="edit-profile primary compact"
                                                onClick={() => handleSendInvitation(player)}
                                                disabled={submitting || !!player.currentTeam}
                                            >
                                                Invite
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    searchQuery && !isSearching && <p style={{ color: '#aaa' }}>No players found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Transfer Ownership Modal */}
            {isTransferModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Transfer Team Ownership</h3>
                            <button type="button" className="modal-close" onClick={() => setIsTransferModalOpen(false)}>&times;</button>
                        </div>
                        {errorMessage && <div className="error-banner">{errorMessage}</div>}
                        <form onSubmit={handleTransferOwnership} className="modal-form">
                            <div className="form-group">
                                <label className="profile-label">Select New Owner</label>
                                <select
                                    className="profile-input"
                                    value={selectedNewOwner}
                                    onChange={(e) => setSelectedNewOwner(e.target.value)}
                                    style={{ backgroundColor: '#111', color: '#fff' }}
                                >
                                    <option value="">-- Choose a teammate --</option>
                                    {members
                                        .filter((m) => m.role === "player")
                                        .map(m => (
                                            <option key={m.user_id} value={m.user_id}>{m.ign || m.displayName}</option>
                                        ))}
                                </select>
                                <p className="team-subtext" style={{ marginTop: '10px', color: '#ff5252' }}>Warning: This action cannot be undone. You will become a standard player.</p>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="profile-action-button danger" onClick={() => setIsTransferModalOpen(false)} disabled={submitting}>Cancel</button>
                                <button type="submit" className="profile-action-button primary" disabled={submitting || !selectedNewOwner}>Confirm Transfer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}