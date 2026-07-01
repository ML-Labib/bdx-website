import React from "react";
import defaultProfile from "../../assets/default-profile.png";
import { Link } from "react-router-dom";
import "./personCard.css";

export function PersonCard({ player }) {
    return (
        <div className="person-card">
            <div className="person-card-image">
                <img
                    src={player.playerImage || defaultProfile}
                    alt={player.name}
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = defaultProfile;
                    }}
                />
            </div>

            <div className="person-card-content">
                <div className="team-logo">
                    <img src={player.teamLogo} alt={player.team} />
                </div>
                <Link to={`/person-info`}>
                    <h3 className="person-name-wrap">
                        <span className="person-name">
                            {player.name}
                        </span>
                    </h3>
                </Link>
                <div className="person-info">
                    <div className="person-team-wrap">
                        <div className="person-team-label">
                            <span>Team</span>
                        </div>
                        <p className="person-team">
                            {player.team}
                        </p>
                    </div>
                    <div className="person-nationality-wrap">
                        <div className="person-team-label">
                            <span>Nationality</span>
                        </div>
                        <p className="person-team">
                            {player.nationality}
                        </p>
                    </div>


                </div>

            </div>
        </div>
    );
};