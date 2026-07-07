import { useState } from "react";
import { Link } from "react-router-dom";
import { TeamCard } from "../Teams/TeamCard";
import { useAuth } from "../../components/useAuth.jsx";
import "./infoTab.css";
export function InfoTab() {
    const { currentUser } = useAuth();
    const [showTransactionForm, setShowTransactionForm] = useState(false);
    const [transactionId, setTransactionId] = useState("");
    const [showValidationError, setShowValidationError] = useState(false);
    const alreadyRegistered = true; // Set this to true if the user has already registered, false otherwise
    const registrationStatus = "Registration Rejected";// Set this to "Registered" or "Not Registered" based on the user's registration status 
    const registrationDeadline = "2026-12-07"; // Set this to the actual registration deadline date
    const hasTeam = true; // Set this to true if the user has a team, false otherwise
    const hasPlayer = 7;
    const isRegistrationClosed = () => {
        const today = new Date();
        const deadline = new Date(`${registrationDeadline}T23:59:59`);
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

    const RegisteredTeamsData = [
        {
            id: 1,
            name: "+55 e-Sports",
            region: "AMERICAS",
            slot: "1",
            logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
        },
        {
            id: 2,
            name: "010 Esports",
            region: "EMEA",
            slot: "2",
            logo: "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-ZFORCE-TPNG.webp",
        },
        {
            id: 3,
            name: "17Gaming",
            region: "ASIA",
            slot: "3",
            logo: "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-VIPER.webp",
        },
        {
            id: 4,
            name: "4DOGZ",
            region: "AMERICAS",
            slot: "4",
            logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
        },
        {
            id: 5,
            name: "7Royal",
            region: "ASIA",
            slot: "5",
            logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
        },
        {
            id: 6,
            name: "Acend",
            region: "EMEA",
            slot: "6",
            logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
        },
        {
            id: 7,
            name: "AlQadsiah",
            region: "AMERICAS",
            slot: "7",
            logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
        },
        {
            id: 8,
            name: "Alter Ego",
            region: "APAC",
            slot: "8",
            logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
        },
        {
            id: 9,
            name: "Anyone's Legend",
            region: "APAC",
            slot: "9",
            logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
        },
        {
            id: 10,
            name: "Armory Gaming",
            region: "APAC",
            slot: "10",
            logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
        },
    ];
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
                        <p>12-06-2026 ~ 12-07-2026</p>
                    </div>
                    <div className="info-tab-card">
                        <h4>Entry fee</h4>
                        <p>400tk and Refundable</p>
                    </div>
                    <div className="info-tab-card">
                        <h4> Match Time</h4>
                        <p>8:00 PM (UTC+6)</p>
                    </div>
                    <div className="info-tab-card">
                        <h4> Game Mode</h4>
                        <p>TPP SQUAD</p>
                    </div>
                    <div className="info-tab-card">
                        <h4> Teams</h4>
                        <p>16 Teams</p>
                    </div>
                    <div className="info-tab-card">
                        <h4>Roster Lock</h4>
                        <p>After registration deadline ends</p>
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
                    <p>10/16 Teams</p>
                </div>
                <div className="team-section">
                    <div className="team-grid">
                        {RegisteredTeamsData.map((team) => (
                            <TeamCard key={team.id} team={team} className="team-card-info" />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}