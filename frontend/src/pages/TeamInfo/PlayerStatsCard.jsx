import React from "react";
import "./playerStatsCard.css";
import defaultProfile from "../../assets/default-profile.png";

export function PlayerStatsCard({ player }) {
    return (
        <article className="player-stats-card">
            <div className="player-stats-image">
                <img src={player?.avatar || defaultProfile} alt={player.name} />
            </div>
            <div className="player-stats-meta">
                <h3>{player.name}</h3>
                <p>{player.realName}</p>
            </div>
            <div className="player-stats-body">
                <div className="player-stats-row">
                    <span>AVG.KILL</span>
                    <strong>{player.avgKill}</strong>
                </div>
                <div className="player-stats-row">
                    <span>AVG.DAMAGE</span>
                    <strong>{player.avgDamage}</strong>
                </div>
                <div className="player-stats-row">
                    <span>AVG.SURVIVAL TIME</span>
                    <strong>{player.avgSurvivalTime}</strong>
                </div>
            </div>
        </article>
    );
}
