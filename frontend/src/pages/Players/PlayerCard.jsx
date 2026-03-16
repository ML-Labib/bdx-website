import React from "react";
import "./playerCard.css";

export function PlayerCard({ player }) {
    return (
        <div className="player-card">
            <div className="player-card-image">
                <img src={player.playerImage} alt={player.name} />
            </div>

            <div className="player-card-content">
                <div className="team-logo">
                    <img src={player.teamLogo} alt={player.team} />
                </div>
                <h3>
                    <span className="player-name">
                        {player.name}
                    </span>
                </h3>
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