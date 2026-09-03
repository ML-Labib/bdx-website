import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TeamCard } from "../Teams/TeamCard";
import { useAuth } from "../../components/useAuth.jsx";
import { getAuthHeaders } from "../../utils/authHeaders";
import { formatDate } from "../../utils/formantDateTime";
import "./infoTab.css";

export function InfoTab({ tournament }) {
    const { currentUser, profile } = useAuth();
    const [registration, setRegistration] = useState(null);
    const [teamMemberCount, setTeamMemberCount] = useState(0);
    const [acceptedRegistration, setAcceptedRegistration] = useState([]);

    const [registering, setRegistering] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);

    const [registrationError, setRegistrationError] = useState("");
    const [registrationMessage, setRegistrationMessage] = useState("");

    /*
     * --------------------------------------------------
     * TEAM
     * --------------------------------------------------
     */

    const userTeam = profile?.membership?.team;
    const hasTeam = !!userTeam;

    const hasMinimumPlayers = teamMemberCount >= 4;

    /*
     * --------------------------------------------------
     * DATE / REGISTRATION STATUS
     * --------------------------------------------------
     */

    const now = new Date();

    const registrationStarted =
        tournament?.registrationStartDate &&
        now >= new Date(tournament.registrationStartDate);

    const registrationOpen =
        tournament?.registrationStartDate &&
        tournament?.registrationEndDate &&
        now >= new Date(tournament.registrationStartDate) &&
        now < new Date(tournament.registrationEndDate);

    const tournamentEnded =
        tournament?.endDate &&
        now >= new Date(tournament.endDate);

    /*
     * --------------------------------------------------
     * FETCH USER TEAM REGISTRATION
     * --------------------------------------------------
     */

    const fetchUserTeamRegistration = async () => {
        if (!currentUser || !tournament?._id || !profile?.membership?.team?._id) {
            setRegistration(null);
            return null;
        }

        try {
            const headers = await getAuthHeaders(currentUser);
            const teamId = profile.membership.team._id;

            const response = await fetch(
                `/api/tournaments/${tournament._id}/team/${teamId}/registration`,
                { headers }
            );

            // ✅ Handle 404 explicitly as "Not Registered" instead of throwing an error
            if (response.status === 404) {
                setRegistration(null);
                return null;
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const userRegistration = data;

            setRegistration(userRegistration);
            return userRegistration;

        } catch (error) {
            console.error("Error fetching team registration:", error);
            setRegistration(null);
            return null;
        }
    };

    /*
     * --------------------------------------------------
     * FETCH TEAM MEMBER COUNT
     * --------------------------------------------------
     */

    const fetchTeamMemberCount = async () => {
        const teamId =
            profile?.membership?.team?._id;

        if (!teamId) {
            setTeamMemberCount(0);
            return;
        }

        const headers = await getAuthHeaders(currentUser);

        try {
            const response = await fetch(
                `/api/teams/${teamId}/members/count`,
                {
                    headers
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch team member count."
                );
            }

            const data = await response.json();

            setTeamMemberCount(
                data.count || 0
            );

        } catch (error) {
            console.error(
                "Error fetching team member count:",
                error
            );

            setTeamMemberCount(0);
        }
    };

    /*
     * --------------------------------------------------
     * FETCH ACCEPTED TEAMS
     * --------------------------------------------------
     */

    const fetchRegisteredTeams = async () => {
        if (!tournament?._id) {
            return [];
        }

        try {
            const response = await fetch(
                `/api/tournaments/${tournament._id}/registrations`
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to fetch registered teams."
                );
            }

            const data = await response.json();

            return data;

        } catch (error) {
            console.error(
                "Error fetching registrations:",
                error
            );

            return [];
        }
    };

    /*
     * --------------------------------------------------
     * LOAD DATA
     * --------------------------------------------------
     */

    useEffect(() => {
        if (!tournament?._id) {
            return;
        }

        const loadData = async () => {
            const teams =
                await fetchRegisteredTeams();

            setAcceptedRegistration(teams);

            await fetchUserTeamRegistration();

            if (currentUser) {
                await fetchTeamMemberCount();
            } else {
                setTeamMemberCount(0);
            }
        };

        loadData();

    }, [
        tournament?._id,
        currentUser,
        profile?.membership?.team?._id
    ]);

    /*
     * --------------------------------------------------
     * REGISTER TEAM
     * --------------------------------------------------
     */

    const handleRegister = async () => {
        if (!currentUser || !userTeam) {
            return;
        }

        if (!registrationOpen) {
            setRegistrationError(
                "Tournament registration is closed."
            );
            return;
        }

        if (!hasMinimumPlayers) {
            setRegistrationError(
                "Your team must have at least 4 members."
            );
            return;
        }

        try {
            setRegistering(true);

            setRegistrationError("");
            setRegistrationMessage("");

            const headers =
                await getAuthHeaders(currentUser);

            const response = await fetch(
                `/api/tournaments/${tournament._id}/register`,
                {
                    method: "POST",
                    headers
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to register team."
                );
            }

            setRegistrationMessage(
                "Your team has been registered successfully."
            );

            await fetchUserTeamRegistration();

            const teams =
                await fetchRegisteredTeams();

            setAcceptedRegistration(teams);

        } catch (error) {
            console.error(
                "Tournament registration failed:",
                error
            );

            setRegistrationError(
                error.message
            );

        } finally {
            setRegistering(false);
        }
    };

    /*
     * --------------------------------------------------
     * WITHDRAW TEAM
     * --------------------------------------------------
     */

    const handleWithdraw = async () => {
        if (!registration?._id) {
            return;
        }

        let reason = null;
        reason = window.prompt(
            "Please provide a reason for withdrawing your registration (required):"
        );

        if (!reason || reason.trim() === "") {
            return;
        }



        if (
            !tournament?.registrationEndDate ||
            new Date() >=
            new Date(tournament.registrationEndDate)
        ) {
            setRegistrationError(
                "The withdrawal deadline has passed."
            );
            return;
        }

        try {
            setWithdrawing(true);

            setRegistrationError("");
            setRegistrationMessage("");

            const headers =
                await getAuthHeaders(currentUser);

            const response = await fetch(
                `/api/tournaments/registrations/${tournament._id}/${registration._id}`,
                {
                    method: "PUT",
                    headers,
                    body: JSON.stringify({ reason })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Failed to withdraw registration."
                );
            }

            setRegistrationMessage(
                "Your team has been withdrawn from the tournament."
            );

            await fetchUserTeamRegistration();

            const teams =
                await fetchRegisteredTeams();

            setAcceptedRegistration(teams);

        } catch (error) {
            console.error(
                "Tournament withdrawal failed:",
                error
            );

            setRegistrationError(
                error.message
            );

        } finally {
            setWithdrawing(false);
        }
    };

    /*
     * --------------------------------------------------
     * STATUS DISPLAY
     * --------------------------------------------------
     */

    const getStatusLabel = (status) => {
        switch (status) {
            case "PENDING":
                return "Pending";

            case "APPROVED":
                return "Approved";

            case "REJECTED":
                return "Rejected";

            case "WITHDRAWN":
                return "Withdrawn";

            default:
                return status;
        }
    };

    /*
     * --------------------------------------------------
     * RENDER
     * --------------------------------------------------
     */

    if (!tournament) {
        return null;
    }


    return (
        <div className="info-tab-container">

            {/* ==========================================
                REGISTRATION / DESCRIPTION
            ========================================== */}

            <section className="info-tab-section">

                <div className="section-header">
                    <svg
                        className="section-icon"
                        width="32"
                        height="16"
                        viewBox="0 0 32 16"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path
                            d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z"
                            fill="#EFF923"
                        />

                        <path
                            d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z"
                            fill="#000"
                        />
                    </svg>

                    <h2>
                        Details
                    </h2>
                </div>

                <div className="info-tab-content">
                    <div className="tab-content">
                        <div className="registration-date">
                            <h4>
                                Registration Deadline:
                            </h4>
                            <p >
                                {tournament.registrationStartDate &&
                                    tournament.registrationEndDate
                                    ? `${formatDate(
                                        tournament.registrationStartDate
                                    )} - ${formatDate(
                                        tournament.registrationEndDate
                                    )}`
                                    : "-"}
                            </p>
                        </div>
                        <div className="description">
                            <p>
                                {tournament.description ||
                                    "No description available."}
                            </p>
                        </div>

                        <div className="rules">
                            <h4>Rules:</h4>

                            <a
                                href={"https://drive.google.com/file/d/195-OENDUTzclf1vGA-z01UAM_m3nHLrI/view?usp=sharing"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rules-pdf-link"
                            >
                                RULE SET
                            </a>
                        </div>

                    </div>

                    {/* REGISTRATION */}

                    <div className="registration">


                        {/* =================================
                            NOT LOGGED IN
                        ================================= */}

                        {!currentUser ? (

                            <div className="registration-login">

                                <h4>
                                    Ready to compete?
                                </h4>

                                <Link
                                    to="/login"
                                    className="registration-button"
                                >
                                    Login to Register
                                </Link>

                            </div>

                        ) : tournamentEnded ? (

                            /* =================================
                               TOURNAMENT ENDED
                            ================================= */

                            <div className="registration-closed">

                                <span className="material-symbols-outlined">
                                    event_busy
                                </span>

                                <h4>
                                    Tournament Ended
                                </h4>

                            </div>

                        ) : registration ? (

                            /* =================================
                               ALREADY REGISTERED
                            ================================= */

                            <div className="registration-status">

                                <div className="registration-status-top">

                                    <div>
                                        <h4>
                                            Registration Status:
                                        </h4>

                                        {registration.teamId?.name && (
                                            <p className="registered-team-name">
                                                {
                                                    registration
                                                        .teamId
                                                        .name
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <span
                                        className={`registration-badge ${registration.status.toLowerCase()}`}
                                    >
                                        {getStatusLabel(
                                            registration.status
                                        )}
                                    </span>

                                </div>

                                {registration.status ===
                                    "REJECTED" &&
                                    registration.reason && (
                                        <div className="registration-reason">
                                            <strong>
                                                Reason:
                                            </strong>

                                            <p>
                                                {
                                                    registration.reason
                                                }
                                            </p>
                                        </div>
                                    )}

                                {/* WITHDRAW */}

                                {registration.status ==
                                    "PENDING" &&
                                    !tournamentEnded &&
                                    new Date() <
                                    new Date(
                                        tournament.registrationEndDate
                                    ) && (

                                        <button
                                            type="button"
                                            className="withdraw-button"
                                            onClick={
                                                handleWithdraw
                                            }
                                            disabled={
                                                withdrawing || registration.status === "WITHDRAWN"
                                            }
                                        >
                                            {withdrawing
                                                ? "Withdrawing..."
                                                : "Withdraw Registration"}
                                        </button>
                                    )}

                                {registration.status !==
                                    "WITHDRAWN" &&
                                    new Date() >=
                                    new Date(
                                        tournament.registrationEndDate
                                    ) && (

                                        <p className="withdraw-closed">
                                            Withdrawal is no longer
                                            available after the
                                            registration deadline.
                                        </p>
                                    )}

                            </div>

                        ) : !registrationStarted ? (

                            /* =================================
                               REGISTRATION NOT STARTED
                            ================================= */

                            <div className="registration-closed">

                                <span className="material-symbols-outlined">
                                    schedule
                                </span>

                                <h4>
                                    Registration hasn't started
                                </h4>

                                <p>
                                    Registration opens on{" "}
                                    <strong>
                                        {formatDate(
                                            tournament.registrationStartDate
                                        )}
                                    </strong>
                                </p>

                            </div>

                        ) : !registrationOpen ? (

                            /* =================================
                               REGISTRATION CLOSED
                            ================================= */

                            <div className="registration-closed">

                                <span className="material-symbols-outlined">
                                    lock
                                </span>

                                <h4>
                                    Registration Closed
                                </h4>

                                <p>
                                    Registration is no longer
                                    available.
                                </p>

                            </div>

                        ) : !hasTeam ? (

                            /* =================================
                               NO TEAM
                            ================================= */

                            <div className="registration-action">

                                <p className="team-status-warning">
                                    You need to create or join
                                    a team before registering.
                                </p>

                                <Link
                                    to="/teams"
                                    className="registration-button"
                                >
                                    Create or Join Team
                                </Link>

                            </div>

                        ) : !hasMinimumPlayers ? (

                            /* =================================
                               NOT ENOUGH PLAYERS
                            ================================= */

                            <div className="registration-action">

                                <p className="registered-team-name">
                                    {userTeam.name}
                                    <label>
                                        Members: {teamMemberCount}/4
                                    </label>
                                </p>


                                <p className="team-status-warning">

                                    Your team needs{" "}

                                    <strong>
                                        {4 -
                                            teamMemberCount}
                                    </strong>{" "}

                                    more{" "}

                                    {4 -
                                        teamMemberCount ===
                                        1
                                        ? "player"
                                        : "players"}{" "}
                                    to register.

                                </p>

                                <button
                                    type="button"
                                    className="registration-button disabled"
                                    disabled
                                >
                                    Register Now
                                </button>

                            </div>

                        ) : (

                            /* =================================
                               READY TO REGISTER
                            ================================= */

                            <div className="registration-action">

                                <p className="registered-team-name">
                                    {userTeam.name}
                                    <label>
                                        Members: {teamMemberCount}/4
                                    </label>
                                </p>

                                <button
                                    type="button"
                                    className="registration-button"
                                    onClick={
                                        handleRegister
                                    }
                                    disabled={
                                        registering || !!registration
                                    }
                                >
                                    {registering
                                        ? "Registering..."
                                        : "Register Now"}
                                </button>

                            </div>
                        )}

                        {/* ERROR */}

                        {registrationError && (
                            <div className="registration-alert error">
                                {registrationError}
                            </div>
                        )}

                        {/* SUCCESS */}

                        {registrationMessage && (
                            <div className="registration-alert success">
                                {registrationMessage}
                            </div>
                        )}


                    </div>

                </div>
            </section>


            {/* ==========================================
                REGISTERED TEAMS
            ========================================== */}

            <section className="tournament-info-section">

                <div className="section-header">

                    <svg
                        className="section-icon"
                        width="32"
                        height="16"
                        viewBox="0 0 32 16"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path
                            d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z"
                            fill="#EFF923"
                        />

                        <path
                            d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z"
                            fill="#000"
                        />
                    </svg>

                    <h2>
                        Approve Teams
                    </h2>

                    <p>
                        {acceptedRegistration.length}
                        /
                        {tournament.totalTeams}
                        {" "}Teams
                    </p>

                    <div className="roster-lock">

                        <label>
                            Roster
                        </label>

                        <span
                            className="material-symbols-outlined"
                            title={
                                tournament.rosterLocked
                                    ? "Roster locked"
                                    : "Roster unlocked"
                            }
                        >
                            {tournament.rosterLocked
                                ? "lock"
                                : "lock_open_right"}
                        </span>

                    </div>

                </div>

                <div className="team-section">

                    {acceptedRegistration.length ===
                        0 ? (

                        <div className="empty-team-state">

                            <span className="material-symbols-outlined">
                                groups
                            </span>

                            <h4>
                                No teams approved yet
                            </h4>

                            <p>
                                Approved teams will
                                appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="team-grid">

                            {acceptedRegistration.map(
                                (registration) => (
                                    <TeamCard
                                        key={
                                            registration
                                                .teamId
                                                ._id
                                        }
                                        team={
                                            registration.teamId
                                        }
                                        className="team-card-info"
                                    />
                                )
                            )}

                        </div>
                    )}

                </div>

            </section>

        </div>
    );
}