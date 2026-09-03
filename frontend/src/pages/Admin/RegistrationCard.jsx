// =============================================================
// REGISTRATION CARD
// =============================================================

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../components/useAuth";
import { getAuthHeaders } from "../../utils/authHeaders";
import RosterModal from "./RosterModal";
import "./rosterModal.css";

const DEFAULT_TOURNAMENT_LOGO =
    "https://ybnzezsvnqdzbszjfuku.supabase.co/storage/v1/object/public/bdx-bucket/defaults/default-profile.png";

function formatDateTime(date) {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
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


export function RegistrationCard({
    registration,
    submitting,
    onStatusChange,
    onRosterLock,
    onRosterUnlock,
}) {
    const team =
        registration.teamId;
    const { currentUser } = useAuth();
    const [rosterModalOpen, setRosterModalOpen] = useState(false);
    const [selectedRoster, setSelectedRoster] = useState(null);
    const [loadingRoster, setLoadingRoster] = useState(false);
    const [rosterError, setRosterError] = useState("");
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const handleViewRoster = async (registration) => {
        try {
            setSelectedRegistration(registration);
            setRosterModalOpen(true);
            setLoadingRoster(true);
            setRosterError("");
            setSelectedRoster(null);

            const headers = await getAuthHeaders(currentUser);

            const res = await fetch(
                `/api/tournaments/${registration.tournamentId}/registrations/${registration._id}/roster`,
                {
                    method: "GET",
                    headers,
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to load roster."
                );
            }

            setSelectedRoster(data.roster);

        } catch (error) {
            console.error("View roster failed:", error);
            setRosterError(error.message);
        } finally {
            setLoadingRoster(false);
        }
    };

    return (
        <div className="tm-registration-card">
            <div className="tm-registration-team">
                <Link to={`/teams/info/${team._id}`} className="tm-registration-link">
                    <img
                        src={team.logo ||
                            DEFAULT_TOURNAMENT_LOGO}
                        alt={`${team.name} logo`}
                        className="tm-registration-logo"
                    />

                    <div className="tm-registration-team-info">
                        <div className="tm-registration-name">
                            <strong>{team.name}</strong>

                            {team.teamTag && (
                                <span>
                                    [{team.teamTag}]
                                </span>
                            )}
                        </div>
                        <div className="">
                            <span className="tm-registration-meta">
                                {registration.reason}
                            </span>
                        </div>


                        <div className="tm-registration-meta">
                            {team.country && (
                                <span>
                                    <span className="material-symbols-outlined">
                                        public
                                    </span>
                                    {team.country}
                                </span>
                            )}

                            <span>
                                <span className="material-symbols-outlined">
                                    schedule
                                </span>

                                Registered{" "}
                                {formatDateTime(
                                    registration.createdAt
                                )}
                            </span>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="tm-registration-right">
                <StatusBadge
                    status={registration.status}
                />

                {registration.status ===
                    "REJECTED" &&
                    registration.rejectionReason && (
                        <span className="tm-rejection-reason">
                            {registration.rejectionReason}
                        </span>
                    )}

                {registration.status === "PENDING" && (
                    <div className="tm-registration-actions">
                        <button
                            className="tm-reject-button"
                            disabled={submitting}
                            onClick={() =>
                                onStatusChange(
                                    registration,
                                    "REJECTED"
                                )
                            }
                        >
                            <span className="material-symbols-outlined">
                                close
                            </span>
                            Reject
                        </button>

                        <button
                            className="tm-approve-button"
                            disabled={submitting}
                            onClick={() =>
                                onStatusChange(
                                    registration,
                                    "APPROVED"
                                )
                            }
                        >
                            <span className="material-symbols-outlined">
                                check
                            </span>
                            Approve
                        </button>
                    </div>
                )}

                {registration.status === "APPROVED" && (
                    <div className="tm-registration-actions">

                        <button
                            className="tm-roster-button"
                            onClick={() => handleViewRoster(registration)}
                            disabled={!registration.rosterLocked}
                        >
                            <span className="material-symbols-outlined">
                                groups
                            </span>

                            View Roster
                        </button>

                        {registration.rosterLocked ? (
                            <button
                                className="tm-unlock-roster-button"
                                disabled={submitting}
                                onClick={() =>
                                    onRosterUnlock(registration)
                                }
                            >
                                <span className="material-symbols-outlined">
                                    lock_open
                                </span>

                                Unlock Roster
                            </button>
                        ) : (
                            <button
                                className="tm-lock-roster-button"
                                disabled={submitting}
                                onClick={() =>
                                    onRosterLock(registration)
                                }
                            >
                                <span className="material-symbols-outlined">
                                    lock
                                </span>

                                Lock Roster
                            </button>
                        )}

                        <button
                            className="tm-small-danger-button"
                            disabled={submitting}
                            onClick={() =>
                                onStatusChange(
                                    registration,
                                    "REJECTED"
                                )
                            }
                        >
                            Reject
                        </button>

                    </div>
                )}

                {registration.status ===
                    "REJECTED" && (
                        <button
                            className="tm-small-approve-button"
                            disabled={submitting}
                            onClick={() =>
                                onStatusChange(
                                    registration,
                                    "APPROVED"
                                )
                            }
                        >
                            Re-approve
                        </button>
                    )}
            </div>
            <RosterModal
                isOpen={rosterModalOpen}
                onClose={() => setRosterModalOpen(false)}
                registration={selectedRegistration}
                roster={selectedRoster}
                loading={loadingRoster}
                error={rosterError}
            />
        </div>
    );
}