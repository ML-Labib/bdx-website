import { useEffect, useMemo, useState } from "react";
import { Loader } from "../../components/Loader";
import { useAuth } from "../../components/useAuth";
import { getAuthHeaders } from "../../utils/authHeaders";
import { RegistrationCard } from "./RegistrationCard";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../../utils/cropUtils";
import { uploadAvatarToSupabase } from "../../utils/supabaseClient";

import "./manageTournaments.css";


const DEFAULT_TOURNAMENT_LOGO =
    "https://ybnzezsvnqdzbszjfuku.supabase.co/storage/v1/object/public/bdx-bucket/defaults/default-profile.png";

const EMPTY_FORM = {
    title: "",
    description: "",
    registrationStartDate: "",
    registrationEndDate: "",
    startDate: "",
    endDate: "",
    logo: "",
    prize: "",
    participatingRegion: "",
    tier: "A",
    totalTeams: 16,
    mode: "TPP",
    format: "Squad",
    matchTime: "",
    entryFee: "",
    rosterLocked: false,
};

const STATUS_CONFIG = {
    PENDING: {
        label: "Pending",
        icon: "pending",
        className: "pending",
    },
    APPROVED: {
        label: "Approved",
        icon: "check_circle",
        className: "approved",
    },
    REJECTED: {
        label: "Rejected",
        icon: "cancel",
        className: "rejected",
    },
    WITHDRAWN: {
        label: "Withdrawn",
        icon: "undo",
        className: "withdrawn",
    },
};

function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function toDateTimeLocal(date) {
    if (!date) return "";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return "";

    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60000);

    return localDate.toISOString().slice(0, 16);
}

function StatusBadge({ status }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

    return (
        <span className={`tournament-status ${config.className}`}>
            <span className="material-symbols-outlined">
                {config.icon}
            </span>
            {config.label}
        </span>
    );
}

function SectionTitle({ title, count }) {
    return (
        <div className="tm-section-title">
            <div className="tm-section-title-left">
                <svg
                    className="tm-section-icon"
                    width="32"
                    height="16"
                    viewBox="0 0 32 16"
                >
                    <path
                        d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z"
                        fill="#EFF923"
                    />
                    <path
                        d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z"
                        fill="#000000"
                    />
                </svg>

                <h2>{title}</h2>
            </div>

            {count !== undefined && (
                <span className="tm-section-count">{count}</span>
            )}
        </div>
    );
}

export function ManageTournaments() {
    const { currentUser } = useAuth();

    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const [isCropOpen, setIsCropOpen] = useState(false);


    const handleLogoSelect = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setErrorMessage("Please select an image file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage("Logo must be smaller than 5MB.");
            return;
        }

        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));

        setCrop({ x: 0, y: 0 });
        setZoom(1);

        setIsCropOpen(true);

        e.target.value = "";
    };

    const handleCropComplete = (_, croppedPixels) => {
        setCroppedAreaPixels(croppedPixels);
    };

    const handleLogoCrop = async () => {
        if (!logoPreview || !croppedAreaPixels) return;

        try {
            const croppedImage = await getCroppedImg(
                logoPreview,
                croppedAreaPixels
            );

            setLogoFile(croppedImage);
            setLogoPreview(URL.createObjectURL(croppedImage));

            setIsCropOpen(false);
        } catch (error) {
            console.error("Logo crop failed:", error);
            setErrorMessage("Failed to crop tournament logo.");
        }
    };

    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);

    const [registrations, setRegistrations] = useState({
        PENDING: [],
        APPROVED: [],
        REJECTED: [],
        WITHDRAWN: [],
    });

    const [activeStatus, setActiveStatus] = useState("PENDING");

    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [registrationsLoading, setRegistrationsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTournament, setEditingTournament] = useState(null);

    const [form, setForm] = useState(EMPTY_FORM);

    // =========================================================
    // FETCH TOURNAMENTS
    // =========================================================

    const fetchTournaments = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const headers = await getAuthHeaders(currentUser);

            const res = await fetch("/api/tournaments", {
                headers,
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(
                    error.message || "Failed to fetch tournaments."
                );
            }

            const data = await res.json();

            const tournamentList = Array.isArray(data)
                ? data
                : data.tournaments || [];

            setTournaments(tournamentList);

            // Select first tournament if nothing is selected
            if (tournamentList.length > 0 && !selectedTournament) {
                setSelectedTournament(tournamentList[0]);
            }
        } catch (error) {
            console.error("Failed to fetch tournaments:", error);
            setErrorMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // FETCH TOURNAMENT DETAILS
    // =========================================================

    const fetchTournamentDetails = async (tournamentId) => {
        if (!tournamentId) return;

        try {
            setDetailsLoading(true);

            const headers = await getAuthHeaders(currentUser);

            const res = await fetch(
                `/api/tournaments/${tournamentId}`,
                { headers }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(
                    error.message || "Failed to fetch tournament."
                );
            }

            const data = await res.json();

            const tournament = data.tournament || data;

            setSelectedTournament(tournament);

            setTournaments((prev) =>
                prev.map((item) =>
                    String(item._id || item.id) ===
                        String(tournament._id || tournament.id)
                        ? tournament
                        : item
                )
            );
        } catch (error) {
            console.error("Failed to fetch tournament:", error);
            setErrorMessage(error.message);
        } finally {
            setDetailsLoading(false);
        }
    };

    // =========================================================
    // FETCH REGISTRATIONS
    // =========================================================

    const fetchRegistrations = async (tournamentId) => {
        if (!tournamentId) return;

        try {
            setRegistrationsLoading(true);

            const headers = await getAuthHeaders(currentUser);

            const res = await fetch(
                `/api/tournaments/${tournamentId}/all-registrations`,
                { headers }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));
                throw new Error(
                    error.message || "Failed to fetch registrations."
                );
            }

            const data = await res.json();

            const list = data.registrations || data || [];

            const grouped = {
                PENDING: [],
                APPROVED: [],
                REJECTED: [],
                WITHDRAWN: [],
            };

            list.forEach((registration) => {
                if (grouped[registration.status]) {
                    grouped[registration.status].push(registration);
                }
            });

            setRegistrations(grouped);

        } catch (error) {
            console.error("Failed to fetch registrations:", error);
            setErrorMessage(error.message);
        } finally {
            setRegistrationsLoading(false);
        }
    };



    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        if (currentUser?.uid) {
            fetchTournaments();
        }
    }, [currentUser]);

    // =========================================================
    // WHEN TOURNAMENT CHANGES
    // =========================================================

    useEffect(() => {
        const tournamentId =
            selectedTournament?._id || selectedTournament?.id;

        if (!tournamentId || !currentUser) return;

        fetchRegistrations(tournamentId);
    }, [selectedTournament?._id, selectedTournament?.id, currentUser]);

    // =========================================================
    // SELECT TOURNAMENT
    // =========================================================

    const handleSelectTournament = async (tournament) => {
        setErrorMessage("");
        setSuccessMessage("");
        setActiveStatus("PENDING");

        setSelectedTournament(tournament);

        await fetchTournamentDetails(
            tournament._id || tournament.id
        );
    };



    // =========================================================
    // FORM
    // =========================================================

    const openCreateModal = () => {
        setEditingTournament(null);
        setForm(EMPTY_FORM);

        setLogoFile(null);
        setLogoPreview(null);

        setErrorMessage("");
        setSuccessMessage("");

        setIsModalOpen(true);
    };

    const openEditModal = () => {
        if (!selectedTournament) return;

        setEditingTournament(selectedTournament);

        setLogoFile(null);
        setLogoPreview(null);

        setForm({
            title: selectedTournament.title || "",
            description: selectedTournament.description || "",

            registrationStartDate: toDateTimeLocal(
                selectedTournament.registrationStartDate
            ),

            registrationEndDate: toDateTimeLocal(
                selectedTournament.registrationEndDate
            ),

            startDate: toDateTimeLocal(
                selectedTournament.startDate
            ),

            endDate: toDateTimeLocal(
                selectedTournament.endDate
            ),

            logo: selectedTournament.logo || "",
            prize: selectedTournament.prize || "",
            participatingRegion:
                selectedTournament.participatingRegion || "",

            tier: selectedTournament.tier || "A",
            totalTeams: selectedTournament.totalTeams || 16,
            mode: selectedTournament.mode || "TPP",
            format: selectedTournament.format || "Squad",
            matchTime: selectedTournament.matchTime || "",
            entryFee: selectedTournament.entryFee || "",
            rosterLocked:
                selectedTournament.rosterLocked || false,
        });

        setIsModalOpen(true);
    };


    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // =========================================================
    // CREATE / UPDATE
    // =========================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSubmitting(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const headers = await getAuthHeaders(currentUser);

            let logoUrl = form.logo;

            if (logoFile) {
                const uploadedLogo = await uploadAvatarToSupabase(
                    logoFile,
                    `${form.title}`,
                    "tournaments"
                );

                logoUrl = uploadedLogo;
            }

            const payload = {
                ...form,
                logo: logoUrl,
                totalTeams: Number(form.totalTeams),
            };

            const tournamentId =
                editingTournament?._id ||
                editingTournament?.id;

            const url = editingTournament
                ? `/api/tournaments/${tournamentId}`
                : "/api/tournaments";

            const method = editingTournament ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));

                throw new Error(
                    error.message ||
                    `Failed to ${editingTournament ? "update" : "create"
                    } tournament.`
                );
            }

            const data = await res.json();

            const tournament =
                data.tournament || data;

            setSuccessMessage(
                editingTournament
                    ? "Tournament updated successfully."
                    : "Tournament created successfully."
            );

            setIsModalOpen(false);

            await fetchTournaments();

            if (tournament?._id || tournament?.id) {
                await fetchTournamentDetails(
                    tournament._id || tournament.id
                );
            }
        } catch (error) {
            console.error("Tournament save failed:", error);
            setErrorMessage(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================
    // REGISTRATION STATUS
    // =========================================================

    const handleRegistrationStatus = async (
        registration,
        newStatus
    ) => {

        let reason = null;

        if (newStatus === "REJECTED") {
            reason = window.prompt(
                "Enter rejection reason:"
            );

            if (!reason || reason.trim() === "") {
                return;
            }
        }

        try {
            setSubmitting(true);
            setErrorMessage("");
            setSuccessMessage("");

            const headers = await getAuthHeaders(currentUser);

            const res = await fetch(
                `/api/tournaments/registrations/${registration.tournamentId}/${registration._id}/status`,
                {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({
                        status: newStatus,
                        reason,
                        title: selectedTournament?.title || "-",
                    }),
                }
            );

            if (!res.ok) {
                const error = await res.json().catch(() => ({}));

                throw new Error(
                    error.message ||
                    error.error ||
                    "Failed to update registration status."
                );
            }

            setSuccessMessage(
                `Registration ${newStatus.toLowerCase()}.`
            );

            await fetchRegistrations(
                selectedTournament._id ||
                selectedTournament.id
            );
        } catch (error) {
            console.error(error.error || "Registration status update failed:", error);

            setErrorMessage(error.error || error.message || "Failed to update registration status.");
        } finally {
            setSubmitting(false);
        }
    };

    // ROSTER LOCK UNLOCK
    const handleRosterLock = async (registration) => {

        try {
            setSubmitting(true);
            setErrorMessage("");
            setSuccessMessage("");

            const headers = await getAuthHeaders(currentUser);
            // console.log("Locking roster for registration:", registration);
            const res = await fetch(
                `/api/tournaments/${selectedTournament._id}/registrations/${registration._id}/lock-roster`,
                {
                    method: "POST",
                    headers,
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to lock roster."
                );
            }

            setSuccessMessage(
                `${registration.teamId.name} roster locked successfully.`
            );

            await fetchRegistrations(
                selectedTournament._id
            );

        } catch (error) {
            console.error(
                "Roster lock failed:",
                error
            );

            setErrorMessage(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRosterUnlock = async (registration) => {
        try {
            setSubmitting(true);
            setErrorMessage("");
            setSuccessMessage("");

            const headers =
                await getAuthHeaders(currentUser);

            const res = await fetch(
                `/api/tournaments/${selectedTournament._id}/registrations/${registration._id}/unlock-roster`,
                {
                    method: "DELETE",
                    headers,
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to unlock roster."
                );
            }

            setSuccessMessage(
                "Roster unlocked successfully."
            );

            await fetchRegistrations(
                selectedTournament._id
            );

        } catch (error) {
            console.error(
                "Roster unlock failed:",
                error
            );

            setErrorMessage(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================
    // COUNTS
    // =========================================================

    const registrationCounts = useMemo(
        () => ({
            PENDING: registrations.PENDING.length,
            APPROVED: registrations.APPROVED.length,
            REJECTED: registrations.REJECTED.length,
            WITHDRAWN: registrations.WITHDRAWN.length,
        }),
        [registrations]
    );

    const currentRegistrations =
        registrations[activeStatus] || [];

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="tm-page">
                <div className="tm-loading">
                    <Loader />
                </div>
            </div>
        );
    }

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="tm-page">
            <div className="tm-header">
                <div className="tm-title-wrap">
                    <svg
                        className="tm-section-icon"
                        width="32"
                        height="16"
                        viewBox="0 0 32 16"
                    >
                        <path
                            d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z"
                            fill="#EFF923"
                        />
                        <path
                            d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z"
                            fill="#000000"
                        />
                    </svg>

                    <h1>Tournament Management</h1>
                </div>

                <button
                    className="tm-primary-button"
                    onClick={openCreateModal}
                >
                    <span className="material-symbols-outlined">
                        add
                    </span>
                    Create Tournament
                </button>
            </div>

            {errorMessage && (
                <div className="tm-alert tm-alert-error">
                    <span className="material-symbols-outlined">
                        error
                    </span>
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className="tm-alert tm-alert-success">
                    <span className="material-symbols-outlined">
                        check_circle
                    </span>
                    {successMessage}
                </div>
            )}

            <div className="tm-layout">
                {/* =================================================
                    LEFT TOURNAMENT LIST
                ================================================== */}

                <aside className="tm-sidebar">
                    <div className="tm-sidebar-header">
                        <div>
                            <span className="tm-sidebar-label">
                                TOURNAMENTS
                            </span>

                            <strong>
                                {tournaments.length}
                            </strong>
                        </div>

                        <button
                            className="tm-icon-button"
                            title="Refresh"
                            onClick={fetchTournaments}
                        >
                            <span className="material-symbols-outlined">
                                refresh
                            </span>
                        </button>
                    </div>

                    <div className="tm-tournament-list">
                        {tournaments.length === 0 ? (
                            <div className="tm-empty-sidebar">
                                <span className="material-symbols-outlined">
                                    emoji_events
                                </span>

                                <p>No tournaments yet.</p>

                                <button
                                    className="tm-secondary-button"
                                    onClick={openCreateModal}
                                >
                                    Create Tournament
                                </button>
                            </div>
                        ) : (
                            tournaments.map((tournament) => {
                                const id =
                                    tournament._id ||
                                    tournament.id;

                                const selectedId =
                                    selectedTournament?._id ||
                                    selectedTournament?.id;

                                const isSelected =
                                    String(id) ===
                                    String(selectedId);

                                return (
                                    <button
                                        key={id}
                                        className={`tm-tournament-item ${isSelected
                                            ? "selected"
                                            : ""
                                            }`}
                                        onClick={() =>
                                            handleSelectTournament(
                                                tournament
                                            )
                                        }
                                    >
                                        <img
                                            src={
                                                tournament.logo ||
                                                DEFAULT_TOURNAMENT_LOGO
                                            }
                                            alt=""
                                            className="tm-list-logo"
                                        />

                                        <div className="tm-list-info">
                                            <strong>
                                                {tournament.title}
                                            </strong>

                                            <span>
                                                {formatDate(
                                                    tournament.startDate
                                                )}
                                            </span>

                                            <div className="tm-list-meta">
                                                <span>
                                                    {
                                                        tournament.format
                                                    }
                                                </span>

                                                <span>
                                                    {
                                                        tournament.mode
                                                    }
                                                </span>

                                                <span>
                                                    Tier{" "}
                                                    {
                                                        tournament.tier
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        <span className="material-symbols-outlined tm-list-arrow">
                                            chevron_right
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* =================================================
                    RIGHT DETAILS
                ================================================== */}

                <main className="tm-content">
                    {!selectedTournament ? (
                        <div className="tm-no-selection">
                            <span className="material-symbols-outlined">
                                emoji_events
                            </span>

                            <h2>Select a tournament</h2>

                            <p>
                                Select a tournament from the left
                                to manage its registrations.
                            </p>
                        </div>
                    ) : detailsLoading ? (
                        <div className="tm-loading">
                            <Loader />
                        </div>
                    ) : (
                        <>
                            {/* Tournament Hero */}

                            <div className="tm-tournament-card">
                                <div className="tm-tournament-main">
                                    <img
                                        src={
                                            selectedTournament.logo ||
                                            DEFAULT_TOURNAMENT_LOGO
                                        }
                                        alt={
                                            selectedTournament.title
                                        }
                                        className="tm-tournament-logo"
                                    />

                                    <div className="tm-tournament-info">
                                        <div className="tm-title-row">
                                            <div>
                                                <span className="tm-tier-badge">
                                                    TIER{" "}
                                                    {
                                                        selectedTournament.tier
                                                    }
                                                </span>

                                                <h2>
                                                    {
                                                        selectedTournament.title
                                                    }
                                                </h2>
                                            </div>

                                            <button
                                                className="tm-secondary-button"
                                                onClick={
                                                    openEditModal
                                                }
                                            >
                                                <span className="material-symbols-outlined">
                                                    edit
                                                </span>
                                                Edit Tournament
                                            </button>
                                        </div>

                                        <p className="tm-description">
                                            {
                                                selectedTournament.description
                                            }
                                        </p>

                                        <div className="tm-info-grid">
                                            <div>
                                                <span>
                                                    Registration
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        selectedTournament.registrationStartDate
                                                    )}{" "}
                                                    —{" "}
                                                    {formatDate(
                                                        selectedTournament.registrationEndDate
                                                    )}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Tournament Dates
                                                </span>

                                                <strong>
                                                    {formatDate(
                                                        selectedTournament.startDate
                                                    )}{" "}
                                                    —{" "}
                                                    {formatDate(
                                                        selectedTournament.endDate
                                                    )}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Format</span>

                                                <strong>
                                                    {
                                                        selectedTournament.format
                                                    }{" "}
                                                    •{" "}
                                                    {
                                                        selectedTournament.mode
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Region
                                                </span>

                                                <strong>
                                                    {
                                                        selectedTournament.participatingRegion
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Prize
                                                </span>

                                                <strong>
                                                    {
                                                        selectedTournament.prize
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Entry Fee
                                                </span>

                                                <strong>
                                                    {
                                                        selectedTournament.entryFee
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Match Time
                                                </span>

                                                <strong>
                                                    {
                                                        selectedTournament.matchTime
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Team Capacity
                                                </span>

                                                <strong>
                                                    {
                                                        selectedTournament.totalTeams
                                                    }{" "}
                                                    Teams
                                                </strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Registration Statistics */}

                            <SectionTitle title="Registration Management" />

                            <div className="tm-stat-grid">
                                {Object.entries(
                                    STATUS_CONFIG
                                ).map(
                                    ([status, config]) => (
                                        <button
                                            key={status}
                                            className={`tm-stat-card ${activeStatus ===
                                                status
                                                ? "active"
                                                : ""
                                                } ${config.className}`}
                                            onClick={() =>
                                                setActiveStatus(
                                                    status
                                                )
                                            }
                                        >
                                            <div className="tm-stat-icon">
                                                <span className="material-symbols-outlined">
                                                    {
                                                        config.icon
                                                    }
                                                </span>
                                            </div>

                                            <div>
                                                <strong>
                                                    {
                                                        registrationCounts[
                                                        status
                                                        ]
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        config.label
                                                    }
                                                </span>
                                            </div>
                                        </button>
                                    )
                                )}
                            </div>

                            {/* Registration List */}

                            <div className="tm-registration-section">
                                <div className="tm-registration-header">
                                    <div>
                                        <h2>
                                            {
                                                STATUS_CONFIG[
                                                    activeStatus
                                                ].label
                                            }{" "}
                                            Registrations
                                        </h2>

                                        <p>
                                            Teams currently in this
                                            registration status.
                                        </p>
                                    </div>

                                    <span className="tm-registration-count">
                                        {
                                            currentRegistrations.length
                                        }
                                    </span>
                                </div>

                                {registrationsLoading ? (
                                    <div className="tm-small-loader">
                                        <Loader />
                                    </div>
                                ) : currentRegistrations.length ===
                                    0 ? (
                                    <div className="tm-empty-state">
                                        <span className="material-symbols-outlined">
                                            inbox
                                        </span>

                                        <h3>
                                            No{" "}
                                            {
                                                STATUS_CONFIG[
                                                    activeStatus
                                                ].label
                                            }{" "}
                                            Registrations
                                        </h3>

                                        <p>
                                            There are currently no
                                            teams in this category.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="tm-registration-list">
                                        {currentRegistrations.map(
                                            (registration) => (
                                                <RegistrationCard
                                                    key={registration._id || registration.id}
                                                    registration={registration}
                                                    submitting={submitting}
                                                    onStatusChange={handleRegistrationStatus}
                                                    onRosterLock={handleRosterLock}
                                                    onRosterUnlock={handleRosterUnlock}
                                                />
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* =====================================================
                CREATE / EDIT MODAL
            ====================================================== */}

            {isModalOpen && (
                <div
                    className="tm-modal-overlay"
                    onMouseDown={(e) => {
                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            setIsModalOpen(false);
                        }
                    }}
                >
                    <div className="tm-modal">
                        <div className="tm-modal-header">
                            <div>
                                <span className="tm-modal-label">
                                    TOURNAMENT
                                </span>

                                <h2>
                                    {editingTournament
                                        ? "Edit Tournament"
                                        : "Create Tournament"}
                                </h2>
                            </div>

                            <button
                                className="tm-modal-close"
                                onClick={() =>
                                    setIsModalOpen(false)
                                }
                            >
                                <span className="material-symbols-outlined">
                                    close
                                </span>
                            </button>
                        </div>

                        <form
                            className="tm-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="tm-form-section">
                                <SectionTitle title="Basic Information" />

                                <div className="tm-form-grid">
                                    <FormField
                                        label="Tournament Title"
                                        name="title"
                                        value={form.title}
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                        className="full"
                                    />

                                    <div className="tm-form-group tm-full">
                                        <label>
                                            Description
                                        </label>

                                        <textarea
                                            name="description"
                                            value={
                                                form.description
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            rows="4"
                                            required
                                        />
                                    </div>

                                    {/* <FormField
                                        label="Logo URL"
                                        name="logo"
                                        value={form.logo}
                                        onChange={
                                            handleFormChange
                                        }
                                    /> */}

                                    <div className="tm-form-group tm-full">
                                        <label>Tournament Logo</label>

                                        <div className="tm-logo-upload">
                                            <img
                                                src={
                                                    logoPreview ||
                                                    form.logo ||
                                                    DEFAULT_TOURNAMENT_LOGO
                                                }
                                                alt="Tournament logo"
                                                className="tm-logo-preview"
                                            />

                                            <div className="tm-logo-upload-content">
                                                <strong>Upload Tournament Logo</strong>

                                                <span>
                                                    PNG, JPG or WEBP · Max 5MB
                                                </span>

                                                <label className="tm-upload-button">
                                                    <span className="material-symbols-outlined">
                                                        upload
                                                    </span>
                                                    Choose Image

                                                    <input
                                                        type="file"
                                                        accept="image/png,image/jpeg,image/webp"
                                                        onChange={handleLogoSelect}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <FormField
                                        label="Prize"
                                        name="prize"
                                        value={form.prize}
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    />

                                    <FormField
                                        label="Participating Region"
                                        name="participatingRegion"
                                        value={
                                            form.participatingRegion
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    />

                                    <FormField
                                        label="Entry Fee"
                                        name="entryFee"
                                        value={form.entryFee}
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="tm-form-section">
                                <SectionTitle title="Tournament Settings" />

                                <div className="tm-form-grid">
                                    <SelectField
                                        label="Tier"
                                        name="tier"
                                        value={form.tier}
                                        onChange={
                                            handleFormChange
                                        }
                                        options={[
                                            "A",
                                            "B",
                                            "C",
                                            "D",
                                        ]}
                                    />

                                    <SelectField
                                        label="Mode"
                                        name="mode"
                                        value={form.mode}
                                        onChange={
                                            handleFormChange
                                        }
                                        options={[
                                            "TPP",
                                            "FPP",
                                        ]}
                                    />

                                    <SelectField
                                        label="Format"
                                        name="format"
                                        value={form.format}
                                        onChange={
                                            handleFormChange
                                        }
                                        options={[
                                            "Solo",
                                            "Duo",
                                            "Squad",
                                        ]}
                                    />

                                    <FormField
                                        label="Total Teams"
                                        name="totalTeams"
                                        type="number"
                                        min="1"
                                        value={
                                            form.totalTeams
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    />

                                    <FormField
                                        label="Match Time"
                                        name="matchTime"
                                        value={
                                            form.matchTime
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="e.g. 8:00 PM BST"
                                        required
                                    />
                                </div>

                                <label className="tm-toggle">
                                    <input
                                        type="checkbox"
                                        name="rosterLocked"
                                        checked={
                                            form.rosterLocked
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                    />

                                    <span className="tm-toggle-track">
                                        <span />
                                    </span>

                                    <span>
                                        Lock team rosters
                                    </span>
                                </label>
                            </div>

                            <div className="tm-form-section">
                                <SectionTitle title="Registration Period" />

                                <div className="tm-form-grid">
                                    <FormField
                                        label="Registration Starts"
                                        name="registrationStartDate"
                                        type="datetime-local"
                                        value={
                                            form.registrationStartDate
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    />

                                    <FormField
                                        label="Registration Ends"
                                        name="registrationEndDate"
                                        type="datetime-local"
                                        value={
                                            form.registrationEndDate
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="tm-form-section">
                                <SectionTitle title="Tournament Schedule" />

                                <div className="tm-form-grid">
                                    <FormField
                                        label="Tournament Starts"
                                        name="startDate"
                                        type="datetime-local"
                                        value={
                                            form.startDate
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    />

                                    <FormField
                                        label="Tournament Ends"
                                        name="endDate"
                                        type="datetime-local"
                                        value={
                                            form.endDate
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="tm-modal-actions">
                                <button
                                    type="button"
                                    className="tm-cancel-button"
                                    onClick={() =>
                                        setIsModalOpen(false)
                                    }
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="tm-primary-button"
                                    disabled={submitting}
                                >
                                    <span className="material-symbols-outlined">
                                        {
                                            submitting
                                                ? "progress_activity"
                                                : "save"
                                        }
                                    </span>

                                    {submitting
                                        ? "Saving..."
                                        : editingTournament
                                            ? "Save Changes"
                                            : "Create Tournament"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isCropOpen && logoPreview && (
                <div className="tm-modal-overlay">
                    <div className="tm-crop-modal">
                        <div className="tm-modal-header">
                            <div>
                                <span className="tm-modal-label">
                                    TOURNAMENT LOGO
                                </span>

                                <h2>Crop Logo</h2>
                            </div>

                            <button
                                className="tm-modal-close"
                                onClick={() => setIsCropOpen(false)}
                            >
                                <span className="material-symbols-outlined">
                                    close
                                </span>
                            </button>
                        </div>

                        <div className="tm-crop-container">
                            <Cropper
                                image={logoPreview}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                cropShape="rect"
                                showGrid={true}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={handleCropComplete}
                            />
                        </div>

                        <div className="tm-crop-controls">
                            <span className="material-symbols-outlined">
                                zoom_out
                            </span>

                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e) =>
                                    setZoom(Number(e.target.value))
                                }
                            />

                            <span className="material-symbols-outlined">
                                zoom_in
                            </span>
                        </div>

                        <div className="tm-modal-actions">
                            <button
                                type="button"
                                className="tm-cancel-button"
                                onClick={() =>
                                    setIsCropOpen(false)
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="tm-primary-button"
                                onClick={handleLogoCrop}
                            >
                                <span className="material-symbols-outlined">
                                    crop
                                </span>
                                Apply Crop
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// =============================================================
// FORM COMPONENTS
// =============================================================

function FormField({
    label,
    name,
    value,
    onChange,
    type = "text",
    required = false,
    placeholder = "",
    className = "",
    min,
}) {
    return (
        <div className={`tm-form-group ${className}`}>
            <label>
                {label}
                {required && <span>*</span>}
            </label>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                min={min}
            />
        </div>
    );
}

function SelectField({
    label,
    name,
    value,
    onChange,
    options,
}) {
    return (
        <div className="tm-form-group">
            <label>{label}</label>

            <select
                name={name}
                value={value}
                onChange={onChange}
            >
                {options.map((option) => (
                    <option
                        key={option}
                        value={option}
                    >
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

