import React, { useState, useEffect, useRef } from "react";
import Cropper from "react-easy-crop";
import { Loader } from "../../components/Loader";
import { useAuth } from "../../components/useAuth";
import { uploadAvatarToSupabase } from "../../utils/supabaseClient";
import { fetchPubgData } from "../../utils/pubgApi";
import { getCroppedImg } from "../../utils/cropUtils";
import "./profileTab.css";

const API_BASE_URL = "/api/profile";
const DEFAULT_PROFILE_PICTURE =
    "https://ybnzezsvnqdzbszjfuku.supabase.co/storage/v1/object/public/bdx-bucket/defaults/default-profile.png";

export function ProfileTab() {
    const { currentUser } = useAuth();

    // Profile and UI state
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        displayName: "",
        ign: "",
        discordUsername: "",
        pubgId: "",
        country: "",
        picture: "",
    });

    // Image & Interactive Cropper State
    const [imageToCrop, setImageToCrop] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    // Modal operational states
    const [isIgnVerified, setIsIgnVerified] = useState(false);
    const [verifyingIgn, setVerifyingIgn] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const fileInputRef = useRef(null);

    // Fetch user profile on load
    useEffect(() => {
        if (currentUser?.uid) {
            fetchProfile(currentUser.uid);
        } else {
            setLoading(false);
        }
    }, [currentUser]);

    const fetchProfile = async (userId) => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/user/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            } else {
                setProfile(null);
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        setFormData({
            displayName: currentUser?.displayName || "",
            ign: "",
            discordUsername: "",
            pubgId: "",
            country: "",
            picture: DEFAULT_PROFILE_PICTURE,
        });
        setPreviewUrl(DEFAULT_PROFILE_PICTURE);
        setImageToCrop(null);
        setIsIgnVerified(false);
        setErrorMessage("");
        setIsModalOpen(true);
    };

    const handleOpenUpdateModal = () => {
        if (!profile) return;
        setIsEditMode(true);
        setFormData({
            displayName: profile.displayName || "",
            ign: profile.ign || "",
            discordUsername: profile.discordUsername || "",
            pubgId: profile.pubgId || "",
            country: profile.country || "",
            picture: profile.picture || DEFAULT_PROFILE_PICTURE,
        });
        setPreviewUrl(profile.picture || DEFAULT_PROFILE_PICTURE);
        setImageToCrop(null);
        setIsIgnVerified(true);
        setErrorMessage("");
        setIsModalOpen(true);
    };

    // File Picker Handler
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

    // Real PUBG lookup plus duplicate PUBG-ID check
    const verifyIgnApi = async (ign) => {
        if (!ign.trim()) throw new Error("IGN is required");

        const pubgResponse = await fetchPubgData(ign);
        const pubgPlayer = pubgResponse?.data?.[0];

        if (!pubgPlayer?.id) {
            throw new Error("No PUBG account found for this IGN.");
        }

        return pubgPlayer.id;
    };

    const checkPubgIdRegistered = async (pubgId) => {
        const res = await fetch(`${API_BASE_URL}/pubg/${encodeURIComponent(pubgId)}`);

        if (res.status === 404) {
            return null;
        }

        if (!res.ok) {
            throw new Error("Failed to check PUBG ID registration.");
        }

        return res.json();
    };

    const handleIgnChange = (e) => {
        const newIgn = e.target.value;
        setFormData((prev) => ({ ...prev, ign: newIgn }));

        if (isEditMode && newIgn === profile?.ign) {
            setIsIgnVerified(true);
        } else {
            setIsIgnVerified(false);
        }
    };

    const handleVerifyIgn = async () => {
        if (!formData.ign.trim()) return;
        setVerifyingIgn(true);
        setErrorMessage("");

        try {
            const retrievedPubgId = await verifyIgnApi(formData.ign);
            if (isEditMode && retrievedPubgId !== profile?.pubgId) {
                setErrorMessage(
                    "PUBG ACCOUNT change forbidden: This IGN resolves to a different PUBG ID."
                );
                setIsIgnVerified(false);
                return;
            }

            const registeredProfile = await checkPubgIdRegistered(retrievedPubgId);
            if (registeredProfile && registeredProfile.user !== currentUser?.uid) {
                setErrorMessage("PUBG ID has already been registered");
                setIsIgnVerified(false);
                return;
            }


            setFormData((prev) => ({ ...prev, pubgId: retrievedPubgId }));
            setIsIgnVerified(true);
        } catch {
            setErrorMessage("Failed to verify IGN. Please check spelling.");
            setIsIgnVerified(false);
        } finally {
            setVerifyingIgn(false);
        }
    };

    // Submit Handler (PNG Crop + Supabase Upload + DB Save)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isIgnVerified) return;

        setSubmitting(true);
        setErrorMessage("");

        try {
            let finalPictureUrl = formData.picture || DEFAULT_PROFILE_PICTURE;

            if (imageToCrop && croppedAreaPixels) {
                const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
                finalPictureUrl = await uploadAvatarToSupabase(
                    croppedBlob,
                    currentUser.uid
                );
            }

            const payload = {
                uid: currentUser.uid,
                user: currentUser.uid,
                displayName: formData.displayName,
                ign: formData.ign,
                discordUsername: formData.discordUsername,
                pubgId: formData.pubgId,
                country: formData.country,
                picture: finalPictureUrl,
            };

            const url = isEditMode
                ? `${API_BASE_URL}/user/${currentUser.uid}`
                : API_BASE_URL;
            const method = isEditMode ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to save profile on backend.");
            }

            const savedProfile = await res.json();
            setProfile(savedProfile);
            setIsModalOpen(false);
        } catch (err) {
            setErrorMessage(err.message || "An error occurred while saving profile.");
        } finally {
            setSubmitting(false);
        }
    };

    const isFormValid =
        formData.displayName.trim() !== "" &&
        formData.ign.trim() !== "" &&
        formData.discordUsername.trim() !== "" &&
        formData.country.trim() !== "" &&
        isIgnVerified;

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading-state">
                            <Loader />
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            {/* Title Bar - Keeps exact SVG layout, button changes based on profile presence */}
            <div className="activity-title-bar">
                <svg
                    className="section-icon"
                    width="32"
                    height="16"
                    viewBox="0 0 32 16"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z" fill="#EFF923" />
                    <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000000" />
                </svg>
                <div>
                    <h2>Informations</h2>
                </div>

                {profile && (
                    <button
                        className="edit-profile"
                        type="button"
                        onClick={handleOpenUpdateModal}
                    >
                        <span className="material-symbols-outlined">edit</span>
                        Update profile
                    </button>
                )}
            </div>

            {/* Main View Area */}
            {!profile ? (
                <div className="no-profile-card">
                    <h3>No Player Profile Found</h3>    
                    <button
                        className="edit-profile primary"
                        type="button"
                        onClick={handleOpenCreateModal}
                    >
                        <span className="material-symbols-outlined">add</span>
                        Create Profile Now
                    </button>
                </div>
            ) : (
                <div className="profile-hero-card">
                    <div className="profile-avatar-frame">
                        <img
                            src={profile.picture || DEFAULT_PROFILE_PICTURE}
                            alt={`${profile.displayName} avatar`}
                        />
                    </div>

                    <div className="profile-info-body">
                        <div className="profile-header-meta">
                            <div>

                                <h3>{profile.displayName}</h3>
                            </div>
                            <span className="profile-country-chip">{profile.country}</span>
                        </div>

                        <div className="profile-stats-grid">
                            <div className="stat-card">
                                <span className="stat-label">In-Game Name (IGN)</span>
                                <strong className="stat-value highlight">{profile.ign}</strong>
                            </div>
                            <div className="stat-card">
                                <span className="stat-label">Discord</span>
                                <strong className="stat-value">{profile.discordUsername}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Dialog */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{isEditMode ? "Update Player Profile" : "Create Player Profile"}</h3>
                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => setIsModalOpen(false)}
                            >
                                &times;
                            </button>
                        </div>

                        {errorMessage && <div className="error-banner">{errorMessage}</div>}

                        <form onSubmit={handleSubmit} className="modal-form">
                            {/* Interactive Cropper Section */}
                            <div className="form-group">
                                <label className="profile-label">300x300 Square PNG WITH NO BACKGROUND</label>

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
                                            <span className="material-symbols-outlined">zoom_in</span>
                                            <input
                                                type="range"
                                                value={zoom}
                                                min={1}
                                                max={3}
                                                step={0.1}
                                                aria-label="Zoom"
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
                                        {previewUrl ? (
                                            <div className="avatar-preview-circle">
                                                <img src={previewUrl} alt="Preview" />
                                            </div>
                                        ) : (
                                            <div className="avatar-placeholder-circle">
                                                <span className="material-symbols-outlined">file_upload</span>
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            className="profile-action-button secondary"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {previewUrl ? "Choose New Image" : "Upload Image to Crop"}
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
                                <label className="profile-label">Display Name</label>
                                <input
                                    type="text"
                                    required
                                    className="modal-input"
                                    placeholder="Your display name"
                                    value={formData.displayName}
                                    onChange={(e) =>
                                        setFormData({ ...formData, displayName: e.target.value })
                                    }
                                />
                            </div>

                            {/* IGN & Verification */}
                            <div className="form-group">
                                <label className="profile-label">In-Game Name (IGN)</label>
                                <span className="profile-label warning">Note: Once a PUBG ID is verified, the PUBG ID cannot be changed but the IGN can be updated.</span>
                                <div className="ign-input-group">
                                    <input
                                        type="text"
                                        required
                                        className="modal-input"
                                        placeholder="Enter IGN"
                                        value={formData.ign}
                                        onChange={handleIgnChange}
                                    />
                                    <button
                                        type="button"
                                        className={`verify-button ${isIgnVerified ? "verified" : ""}`}
                                        disabled={
                                            verifyingIgn || !formData.ign.trim() || isIgnVerified
                                        }
                                        onClick={handleVerifyIgn}
                                    >
                                        {verifyingIgn
                                            ? "Verifying..."
                                            : isIgnVerified
                                                ? "Verified ✓"
                                                : "Verify IGN"}
                                    </button>
                                </div>
                            </div>

                            {formData.pubgId && (
                                <div className="form-group">
                                    <label className="profile-label">PUBG ID (Auto-verified)</label>
                                    <input
                                        type="text"
                                        disabled
                                        className="modal-input disabled"
                                        value={formData.pubgId}
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label className="profile-label">Discord Username</label>
                                <input
                                    type="text"
                                    required
                                    className="modal-input"
                                    placeholder="username#0000"
                                    value={formData.discordUsername}
                                    onChange={(e) =>
                                        setFormData({ ...formData, discordUsername: e.target.value })
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <label className="profile-label">Country</label>
                                <input
                                    type="text"
                                    required
                                    className="modal-input"
                                    placeholder="Country"
                                    value={formData.country}
                                    onChange={(e) =>
                                        setFormData({ ...formData, country: e.target.value })
                                    }
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="profile-action-button secondary"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="edit-profile submit-btn"
                                    disabled={!isFormValid || submitting}
                                >
                                    {submitting ? "Saving..." : "Save Profile"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}