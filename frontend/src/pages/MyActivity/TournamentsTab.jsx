import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../components/useAuth";
import { getAuthHeaders } from "../../utils/authHeaders";
import { Loader } from "../../components/Loader";

import "./tournamentTab.css";

const statusLabels = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    WITHDRAWN: "Withdrawn",
};

const formatDate = (date) => {
    if (!date) return "TBD";
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export function TournamentsTab({ team }) {
    const { currentUser } = useAuth();
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchRegistrations = async () => {
            if (!currentUser?.uid || !team) {
                setRegistrations([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError("");

            try {
                const headers = await getAuthHeaders(currentUser);
                const tournamentsResponse = await fetch("/api/tournaments", { headers });

                if (!tournamentsResponse.ok) {
                    throw new Error("Unable to load tournaments");
                }

                const tournaments = await tournamentsResponse.json();
                const tournamentList = Array.isArray(tournaments)
                    ? tournaments
                    : tournaments.tournaments || tournaments.data || [];
                const teamId = team._id || team.id;

                const registrationResults = await Promise.all(
                    tournamentList.map(async (tournament) => {
                        const tournamentId = tournament._id || tournament.id;
                        if (!tournamentId) return null;

                        const response = await fetch(
                            `/api/tournaments/${tournamentId}/team/${teamId}/registration`,
                            { headers }
                        );

                        if (response.status === 404) return null;
                        if (!response.ok) return null;

                        const registration = await response.json();
                        return { registration, tournament };
                    })
                );

                if (!cancelled) {
                    setRegistrations(registrationResults.filter(Boolean));
                }
            } catch (fetchError) {
                console.error("Failed to load tournament registrations:", fetchError);
                if (!cancelled) {
                    setRegistrations([]);
                    setError("Unable to load tournament registrations.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchRegistrations();

        return () => {
            cancelled = true;
        };
    }, [currentUser, team]);

    if (loading) {
        return <div className="tournament-registrations-state"><Loader /></div>;
    }

    return (
        <div className="tournament-registrations">
            {error && <p className="tournament-registrations-message error">{error}</p>}

            {!team && !error && (
                <p className="tournament-registrations-message">
                    Join a team to view tournament registrations.
                </p>
            )}

            {team && !error && registrations.length === 0 && (
                <p className="tournament-registrations-message">
                    Your team has no tournament registrations.
                </p>
            )}

            {registrations.map(({ registration, tournament }) => {
                const tournamentId = tournament._id || tournament.id;
                const status = registration.status?.toUpperCase() || "PENDING";

                return (
                    <article className="tournament-registration-card" key={registration._id}>
                        <div className="tournament-registration-logo">
                            <img src={tournament.logo || "/default-tournament.png"} alt="" />
                        </div>
                        <div className="tournament-registration-details">
                            <div className="tournament-registration-heading">
                                <h2>{tournament.title || "Untitled Tournament"}</h2>
                                <span className={`registration-status status-${status.toLowerCase()}`}>
                                    {statusLabels[status] || status}
                                </span>
                            </div>
                            <p className="tournament-registration-date">
                                {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                            </p>
                            {registration.reason && (
                                <p className="tournament-registration-reason">{registration.reason}</p>
                            )}
                            <Link to={`/tournament-info/${tournamentId}`} className="tournament-registration-link">
                                View tournament
                            </Link>
                        </div>
                    </article>
                );
            })}
        </div>
    );
}