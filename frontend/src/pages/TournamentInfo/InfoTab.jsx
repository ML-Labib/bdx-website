import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TeamCard } from "../Teams/TeamCard";
import { useAuth } from "../../components/useAuth.jsx";
import "./infoTab.css";

export function InfoTab({ tournament }) {
    const { currentUser } = useAuth();
    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [transactionId, setTransactionId] = useState("");
    const [showValidationError, setShowValidationError] = useState(false);
    const [acceptedRegistration, setAcceptedRegistration] = useState([]);
    const alreadyRegistered = false;
    const registrationStatus = "Registered";
    const hasTeam = true;
    const hasPlayer = 7;
    const isRegistrationClosed = () => {
        if (!tournament?.registrationEndDate) return false;
        const today = new Date();
        const deadline = new Date(tournament.registrationEndDate);
        return today > deadline;
    };

    const handleRegisterCardClick = () => {
        if (!currentUser || alreadyRegistered || !hasTeam || isRegistrationClosed() || hasPlayer < 3) {
            return;
        }



        setShowTransactionForm(true);
    };

    const handleTransactionSubmit = (event) => {
        event.preventDefault();

        if (!transactionId.trim()) {
            setShowValidationError(true);
            return;
        }

        setTransactionId("");
        setShowTransactionForm(false);
        setShowValidationError(false);
    };

    const fetchRegisteredTeams = async () => {
        try {
            const response = await fetch(`/api/tournaments/${tournament._id}/registrations`);
            if (!response.ok) {
                throw new Error("Failed to fetch registered teams");
            }
            const data = await response.json();

            return data;
        } catch (error) {
            console.error("Error fetching registrations:", error);
            return [];
        }
    };

    useEffect(() => {
        const getRegisteredTeams = async () => {
            const teams = await fetchRegisteredTeams();
            setAcceptedRegistration(teams);
        };
        getRegisteredTeams();
    }, [tournament._id]);


    return (
        <div className="info-tab-container">
            <section className="info-tab-section">
                <div className="section-header">
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
                        <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000"></path>
                    </svg>
                    <h2>Secure your team's spot</h2>

                </div>
                <div className="info-tab-grid">
                    <div className="info-tab-card">
                        <h4> Registration Deadline</h4>
                        <p>{tournament?.registrationStartDate && tournament?.registrationEndDate ? `${new Date(tournament.registrationStartDate).toLocaleDateString()} - ${new Date(tournament.registrationEndDate).toLocaleDateString()}` : 'TBD'}</p>
                    </div>
                    <div className="info-tab-card">
                        <h4>Entry fee</h4>
                        <p>{tournament?.entryFee || 'TBD'}</p>
                    </div>
                    <div className="info-tab-card">
                        <h4> Match Time</h4>
                        <p>{tournament?.matchTime || 'TBD'}</p>
                    </div>
                    <div className="info-tab-card">
                        <h4> Game Mode</h4>
                        <p>{tournament?.gameMode || 'TBD'}</p>
                    </div>
                    <div className="info-tab-card">
                        <h4> Teams</h4>
                        <p>{tournament?.totalTeams ? `${tournament.totalTeams} Teams` : 'TBD'}</p>
                    </div>
                    <div className="info-tab-card">
                        <h4>Roster Lock</h4>
                        <p>{tournament?.rosterLocked ? 'Roster locked' : 'Roster open until registration deadline ends'}</p>
                    </div>
                    <div className="info-tab-card">
                        <h4>Rules</h4>
                        <p>Click here</p>
                    </div>
                    <div className="info-tab-card">
                        <h4>Payment Method</h4>
                        <p>Send money via Bkash: 01712345678</p>
                    </div>

                    {!isRegistrationClosed() ? (
                        <>
                            <div
                                className={`info-tab-card register-card ${showTransactionForm ? "active" : ""}`}
                                onClick={handleRegisterCardClick}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        handleRegisterCardClick();
                                    }
                                }}
                            >
                                {currentUser ? (
                                    alreadyRegistered ? (
                                        <h4>{registrationStatus}</h4>
                                    ) : (
                                        <>
                                            <h4>Register Now</h4>
                                            {!hasTeam ? (
                                                <p className="team-status-message">Create or join a team.</p>
                                            ) : hasPlayer < 4 ? (
                                                <p className="team-status-message">Minimum 4 players needed in a team.</p>
                                            ) : null}
                                        </>
                                    )
                                ) : (
                                    <Link to="/login" className="login-link">
                                        <h4>Login to register</h4>
                                    </Link>
                                )}

                                {showTransactionForm ? (
                                    <form className="register-form" onSubmit={handleTransactionSubmit} onClick={(event) => event.stopPropagation()}>
                                        <input
                                            type="text"
                                            value={transactionId}
                                            onChange={(event) => {
                                                setTransactionId(event.target.value);
                                                if (showValidationError) {
                                                    setShowValidationError(false);
                                                }
                                            }}
                                            placeholder="Transaction ID"
                                            className={`transaction-input ${showValidationError ? "input-error" : ""}`}
                                        />
                                        {showValidationError ? <p className="validation-error">Transaction ID is required</p> : null}
                                        <button type="submit" className="register-submit-button">
                                            Submit
                                        </button>
                                    </form>
                                ) : null}
                            </div>
                        </>
                    ) : null}
                </div>
            </section>

            <section className="tournament-info-section">
                <div className="section-header">
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
                        <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000"></path>
                    </svg>
                    <h2>Registered Teams</h2>
                    <p>{acceptedRegistration.length}/{tournament?.totalTeams} Teams</p>
                </div>
                <div className="team-section">
                    <div className="team-grid">
                        {acceptedRegistration.map((registration) => (
                            <TeamCard key={registration.teamId._id} team={registration.teamId} className="team-card-info" />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}