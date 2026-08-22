import React, { useState, useRef } from "react";
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

export function TeamsTab({ onNavigateToProfile, profile, team, members, managers, loading = false, reloadActivityData }) {
    const { currentUser } = useAuth();
    const [role, setRole] = useState("player");
    const isOwner = team && team.owner_id === currentUser?.uid;


    const refreshActivityData = async () => {
        if (reloadActivityData) {
            await reloadActivityData();
        }
    };

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateLogoModalOpen, setIsUpdateLogoModalOpen] = useState(false);
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);


    // Image Cropper State
    const [imageToCrop, setImageToCrop] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // Player Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Operational State
    const [selectedNewOwner, setSelectedNewOwner] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [addMemberSuccessMessage, setAddMemberSuccessMessage] = useState("");

    const fileInputRef = useRef(null);


    // demo invitation

    const teamSchema = yup.object({
        name: yup
            .string()
            .required("Team name is required")
            .max(50, "Team name cannot exceed 50 characters"),
        teamTag: yup
            .string()
            .required("Team tag is required")
            .min(2, "Team tag must be at least 2 characters")
            .max(4, "Team tag cannot exceed 4 characters")
            .uppercase(),
        country: yup
            .string()
            .required("Country is required")
            .max(50, "Country name cannot exceed 50 characters"),
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(teamSchema),
        mode: "onBlur",
    });

    // Handlers for Cropper
    const handleImageFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setImageToCrop(reader.result);
            });
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    // Process & Upload Cropped Image
    const processImageUpload = async () => {
        if (imageToCrop && croppedAreaPixels) {
            const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
            return await uploadAvatarToSupabase(croppedBlob, `team-${team.name}-${Date.now()}`, 'teams');
        }
        return DEFAULT_TEAM_LOGO;
    };

    // 1. Create Team (Pattern 1: DB First -> Upload Logo Second)
    const handleCreateTeam = async (data) => {
        // data.preventDefault();
        setSubmitting(true);
        setErrorMessage("");

        try {
            const headers = await getAuthHeaders(currentUser);

            // STEP 1: Send text payload first to create the team record in the DB
            const payload = {
                name: data.name.trim(),
                teamTag: data.teamTag.trim().toUpperCase(),
                country: data.country.trim(),
                logo: "", // Logo is optional here; can pass "" or leave it out so backend defaults it

            };

            const res = await fetch("api/teams", {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
            });

            // If backend validation fails (e.g., name taken, already in a team),
            // it throws an error HERE before processImageUpload() ever runs!
            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(error.message || "Failed to create team.");
            }

            // Get the newly created team object from backend response
            const newTeam = await res.json();
            const teamId = newTeam._id || newTeam.id;

            // STEP 2: Only process and upload image if the user selected one
            if (imageToCrop) {
                const logoUrl = await processImageUpload();

                // STEP 3: Update the newly created team's logo using your logo endpoint
                const logoRes = await fetch(`/api/teams/${teamId}/logo`, {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({ logo: logoUrl }),
                });

                if (!logoRes.ok) {
                    throw new Error("Team created, but failed to set team logo.");
                }
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

    // 2. Update Team Logo ONLY
    const handleUpdateLogo = async (e) => {
        e.preventDefault();
        if (!imageToCrop) return;

        setSubmitting(true);
        setErrorMessage("");

        try {
            const logoUrl = await processImageUpload();

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

    // 3. Search and Add Players
    const handleSearchPlayer = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        const headers = await getAuthHeaders(currentUser);
        setAddMemberSuccessMessage("");
        try {
            const res = await fetch(
                `/api/profile/search?query=${encodeURIComponent(
                    searchQuery
                )}`, { headers, }
            );
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data);
            }
        } catch {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddMember = async (player) => {
        setSubmitting(true);
        setErrorMessage("");
        try {
            const headers = await getAuthHeaders(currentUser);
            const res = await fetch(`/api/teams/${team.id}/members`, {
                method: "POST",
                headers,
                body: JSON.stringify({ userId: player.user, role }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.message || "Could not add player.");
            }
            await refreshActivityData();
            setSearchQuery("");
            setSearchResults((prev) => prev.filter((p) => p.user !== player.user));
            setAddMemberSuccessMessage(`${player.ign} added successfully`);
        } catch (err) {
            setAddMemberSuccessMessage("");
            setErrorMessage(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // 4. Transfer Ownership
    const handleTransferOwnership = async (e) => {
        const confirm = window.confirm("Are you sure you want to transfer ownership of this team? This action is permanent.");
        if (!confirm) return;

        e.preventDefault();
        if (!selectedNewOwner) return;

        setSubmitting(true);
        try {
            const headers = await getAuthHeaders(currentUser);
            const res = await fetch(`/api/teams/${team.id}/transfer`, {
                method: "PUT",
                headers,
                body: JSON.stringify({
                    newOwnerId: selectedNewOwner,
                }),
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

    // 5. Disband Team
    const handleDisbandTeam = async () => {
        const confirm = window.confirm(
            "Are you sure you want to disband this team? This action is permanent."
        );
        if (!confirm) return;

        try {
            setSubmitting(true);
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

    // 6. Remove (Kick) Member
    const handleRemoveMember = async (memberId, memberName) => {
        const confirm = window.confirm(`Are you sure you want to remove ${memberName} from the team? This action is permanent.`);
        if (!confirm) return;

        try {
            setSubmitting(true);
            const headers = await getAuthHeaders(currentUser);
            const res = await fetch(`/api/teams/${team.id}/members/${memberId}`, {
                method: "DELETE",
                headers,
            });

            if (!res.ok) throw new Error("Failed to remove player.");
            await refreshActivityData(); // Refresh roster
        } catch (err) {
            alert(err.message);
            setSubmitting(false);
        } finally {
            setSubmitting(false);
        }
    };

    // 7. Leave Team (For Non-Owners)
    const handleLeaveTeam = async () => {
        const confirm = window.confirm("Are you sure you want to leave this team? This action is permanent.");
        if (!confirm) return;

        try {
            setSubmitting(true);
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

    const resetCropper = () => {
        setImageToCrop(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
    };


    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading-state">
                    <Loader />
                </div>
            </div>
        );
    }

    // STATE A: No Profile Created Yet
    if (!profile) {
        return (
            <div className="profile-container">
                <div className="activity-title-bar">
                    <svg className="section-icon" width="32" height="16" viewBox="0 0 32 16">
                        <path d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z" fill="#EFF923" />
                        <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000000" />
                    </svg>
                    <div>
                        <h2>Team Details</h2>
                    </div>
                </div>

                <div className="no-profile-card">
                    <h3>Player Profile Required</h3>
                    <p className="team-subtext">
                        You must set up your player profile before creating or joining a team.
                    </p>
                    <button
                        className="edit-profile primary"
                        type="button"
                        onClick={onNavigateToProfile}
                    >
                        Go To Profile Tab
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            {/* Title Bar */}
            <div className="activity-title-bar">
                <svg className="section-icon" width="32" height="16" viewBox="0 0 32 16">
                    <path d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z" fill="#EFF923" />
                    <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000000" />
                </svg>
                <div>
                    <h2>Team Details</h2>
                </div>

                {team && isOwner && (
                    <div className="team-header-actions">
                        <button
                            className="edit-profile"
                            type="button"
                            onClick={() => {
                                setErrorMessage("");
                                setIsUpdateLogoModalOpen(true);
                            }}
                        >
                            <span className="material-symbols-outlined">image</span>
                            Update Logo
                        </button>
                    </div>
                )}
            </div>

            {/* STATE B: Has Profile, No Team */}
            {!team ? (
                <div className="no-profile-card">
                    <h3>No Active Team Found</h3>
                    <p className="team-subtext">Create a team and lead your squad to victory.</p>
                    <button
                        className="edit-profile primary"
                        type="button"
                        onClick={() => {
                            setErrorMessage("");
                            resetCropper();
                            setIsCreateModalOpen(true);
                        }}
                    >
                        <span className="material-symbols-outlined">add</span>
                        Create Team Now
                    </button>
                </div>
            ) : (
                /* STATE C: Has Active Team */
                <div className="team-view-stack">
                    {/* Hero Banner Card */}
                    <div className="profile-hero-card">
                        <div className="profile-avatar-frame team-logo-frame">
                            <img src={team.logo || DEFAULT_TEAM_LOGO} alt={`${team.name} logo`} />
                        </div>

                        <div className="profile-info-body">
                            <div className="profile-header-meta">
                                <div className="team-owner-container">
                                    <h3>{team.name}</h3>
                                    <span className="team-owner-badge">
                                        Owner: {isOwner ? "You" : team.owner_name}
                                    </span>
                                </div>
                                <span className="profile-country-chip">{team.country}</span>
                            </div>

                            {/* Quick Actions Bar */}
                            {isOwner ? (
                                <div className="team-owner-controls">
                                    {members.length < 6 && (
                                        <button className="profile-action-button secondary" onClick={() => { setRole("player"); setErrorMessage(""); setAddMemberSuccessMessage(""); setSearchQuery(""); setSearchResults([]); setIsAddMemberModalOpen(true); }}>
                                            <span className="material-symbols-outlined">person_add</span>
                                            Add Player
                                        </button>
                                    )}

                                    <button className="profile-action-button secondary" onClick={() => { setErrorMessage(""); setSelectedNewOwner(""); setIsTransferModalOpen(true); }}>
                                        <span className="material-symbols-outlined">swap_horiz</span>
                                        Transfer Ownership
                                    </button>
                                    <button className="profile-action-button danger" onClick={handleDisbandTeam}>
                                        <span className="material-symbols-outlined">delete</span>
                                        Disband Team
                                    </button>
                                </div>
                            ) : (
                                <div className="team-owner-controls">
                                    <button className="profile-action-button danger" onClick={handleLeaveTeam}>
                                        <span className="material-symbols-outlined">logout</span>
                                        Leave Team
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Roster Section */}
                    <div className="team-roster-section">
                        <div className="roster-header">
                            <div className="activity-title-bar">
                                <svg className="section-icon" width="32" height="16" viewBox="0 0 32 16">
                                    <path d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z" fill="#EFF923" />
                                    <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000000" />
                                </svg>
                                <div>
                                    <h2>Active Roster ({members.length}/6)</h2>
                                </div>
                            </div>
                        </div>

                        <div className="roster-grid">
                            {members.map((member) => (
                                <div key={member.user_id} className="roster-card">
                                    <div className="roster-user-info">
                                        <img
                                            src={member.picture || DEFAULT_TEAM_LOGO}
                                            alt={member.displayName}
                                            className="roster-avatar"
                                        />
                                        <div className="roster-meta">
                                            <strong>{member.ign || member.displayName}</strong>
                                            <span className="roster-role">
                                                {member.role}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Show Kick Button ONLY if current user is owner AND the member is not the owner themselves */}
                                    {isOwner && member.role !== "owner" && (
                                        <button
                                            className="kick-button"
                                            onClick={() => handleRemoveMember(member.user_id, member.ign || member.displayName)}
                                            title="Remove Player"
                                        >
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
                                <div>
                                    <h2>Team Manager ({managers.length}/2)</h2>
                                </div>

                                {team && isOwner && (managers.length < 2) && (
                                    <div className="team-header-actions">
                                        <button className="profile-action-button secondary" onClick={() => { setRole("manager"); setErrorMessage(""); setAddMemberSuccessMessage(""); setSearchQuery(""); setSearchResults([]); setIsAddMemberModalOpen(true); }}>
                                            <span className="material-symbols-outlined">person_add</span>
                                            Add Manager
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="roster-grid">
                                {managers.map(manager => (
                                    <div key={manager.user_id} className="roster-card">
                                        <div className="roster-user-info">
                                            <img
                                                src={manager.picture || DEFAULT_TEAM_LOGO}
                                                alt={manager.displayName}
                                                className="roster-avatar"
                                            />
                                            <div className="roster-meta">
                                                <strong>{manager.ign || manager.displayName}</strong>
                                                <span className="roster-role">
                                                    {manager.role}
                                                </span>
                                            </div>
                                        </div>

                                        {isOwner && manager.role !== "owner" && (
                                            <button
                                                className="kick-button"
                                                onClick={() => handleRemoveMember(manager.user_id, manager.ign || manager.displayName)}
                                                title="Remove Player"
                                            >
                                                <span className="material-symbols-outlined">person_remove</span>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </ div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 1: Create Team Modal */}
            {isCreateModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Create New Team</h3>
                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => setIsCreateModalOpen(false)}>
                                &times;
                            </button>
                        </div>

                        {errorMessage && <div className="error-banner">{errorMessage}</div>}

                        <form onSubmit={handleSubmit(handleCreateTeam)} className="modal-form">
                            {/* Cropper Section */}
                            <div className="form-group">
                                <label className="profile-label">Team Logo (Square PNG/JPG)</label>
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
                                                min={1}
                                                max={3}
                                                step={0.1}
                                                onChange={(e) => setZoom(Number(e.target.value))}
                                            />
                                            <button
                                                type="button"
                                                className="profile-action-button secondary compact"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                Change Image
                                            </button>
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
                                <input {...register("name")} placeholder="Team Name" className="modal-input" />
                                {errors.name && <span className="form-error">{errors.name.message}</span>}
                            </div>

                            <div className="form-group">
                                <label className="profile-label">Team Tag</label>
                                <input {...register("teamTag")} placeholder="Team Tag (e.g., BDX)" className="modal-input" />
                                {errors.teamTag && <span className="form-error">{errors.teamTag.message}</span>}

                            </div>

                            <div className="form-group">
                                <label className="profile-label">Country</label>
                                <input {...register("country")} placeholder="Country" className="modal-input" />
                                {errors.country && <span className="form-error">{errors.country.message}</span>}
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="profile-action-button secondary"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="edit-profile submit-btn"
                                    disabled={submitting}
                                >
                                    {submitting ? "Creating..." : "Create Team"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: Update Logo ONLY Modal */}
            {isUpdateLogoModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Update Team Logo</h3>
                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => setIsUpdateLogoModalOpen(false)}
                            >
                                &times;
                            </button>
                        </div>

                        {errorMessage && <div className="error-banner">{errorMessage}</div>}

                        <form onSubmit={handleUpdateLogo} className="modal-form">
                            <div className="form-group">
                                <label className="profile-label">Select New Team Logo</label>
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
                                                min={1}
                                                max={3}
                                                step={0.1}
                                                onChange={(e) => setZoom(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                ) : (
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
                                <button
                                    type="button"
                                    className="profile-action-button secondary"
                                    onClick={() => setIsUpdateLogoModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="edit-profile submit-btn"
                                    disabled={submitting || !imageToCrop}
                                >
                                    {submitting ? "Saving..." : "Save Logo"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: Add Member (Search Player) */}
            {isAddMemberModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add Team Member</h3>
                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => {
                                    setIsAddMemberModalOpen(false);
                                    setAddMemberSuccessMessage("");
                                }}
                            >
                                &times;
                            </button>
                        </div>

                        {errorMessage && <div className="error-banner">{errorMessage}</div>}
                        {addMemberSuccessMessage && <div className="success-banner">{addMemberSuccessMessage}</div>}

                        <div className="modal-form">
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

                            {/* Search Results List */}
                            <div className="search-results-list">
                                {searchResults.map((player) => (
                                    <div key={player.user} className="search-result-item">
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
                                            className="edit-profile primary compact"
                                            onClick={() => handleAddMember(player)}
                                            // Disable button if submitting OR if player is already in a team
                                            disabled={submitting || !!player.currentTeam}
                                        >
                                            {player.currentTeam ? "Unavailable" : "Add"}
                                        </button>
                                    </div>
                                ))}

                                {/* Show a message if no results found after a search */}
                                {searchResults.length === 0 && !isSearching && searchQuery && (
                                    <div style={{ color: "#9ca3af", fontSize: "0.9rem", textAlign: "center", padding: "10px" }}>
                                        No players found matching "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 4: Transfer Ownership */}
            {isTransferModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Transfer Team Ownership</h3>
                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => setIsTransferModalOpen(false)}
                            >
                                &times;
                            </button>
                        </div>

                        {errorMessage && <div className="error-banner">{errorMessage}</div>}

                        <form onSubmit={handleTransferOwnership} className="modal-form">
                            <div className="form-group">
                                <label className="profile-label">Select New Owner</label>
                                <select
                                    className="modal-input"
                                    value={selectedNewOwner}
                                    onChange={(e) => setSelectedNewOwner(e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose a teammate --</option>
                                    {members
                                        .filter((m) => m.role === "player")
                                        .map((m) => (
                                            <option key={m.user_id} value={m.user_id}>
                                                {m.ign || m.displayName}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="profile-action-button secondary"
                                    onClick={() => setIsTransferModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="edit-profile submit-btn"
                                    disabled={submitting || !selectedNewOwner}
                                >
                                    Confirm Transfer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}