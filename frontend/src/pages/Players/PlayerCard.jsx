import React from "react";
import defaultProfile from "../../assets/default-profile.png";
import { Link } from "react-router-dom";
import "./playerCard.css";

export function PlayerCard({ player }) {
    return (
        <div className="player-card">
            <div className="player-card-image">
                <img
                    src={ defaultProfile}
                    alt={player.name}
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = defaultProfile;
                    }}
                />
            </div>

            <div className="player-card-content">
                <div className="team-logo">
                    <img src={player.teamLogo} alt={player.team} />
                </div>
                <Link to={`/player-info`}>
                    <h3 className="player-name-wrap">
                        <span className="player-name">
                            {player.name}
                        </span>
                    </h3>
                </Link>
                <div className="player-info">
                    <div className="player-team-wrap">
                        <div className="player-team-label">
                            <span>Team</span>
                        </div>
                        <p className="player-team">
                            {player.team}
                        </p>
                    </div>
                    <div className="player-nationality-wrap">
                        <div className="player-team-label">
                            <span>Nationality</span>
                        </div>
                        <p className="player-team">
                            {player.nationality}
                        </p>
                    </div>


                </div>

            </div>
        </div>
    );
};