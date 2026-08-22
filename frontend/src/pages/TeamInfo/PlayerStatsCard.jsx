import React from "react";
import "./playerStatsCard.css";
import defaultProfile from "../../assets/default-profile.png";
import { Link } from "react-router";

export function PlayerStatsCard({ player }) {
    return (
        <article className="player-stats-card">
            <div className="player-stats-image">
                <img src={player.user?.picture || defaultProfile} alt={player.user?.ign} />
            </div>

            <div className="player-stat-group">


                <div className="player-stats-meta">
                    <Link to={`/player-info/${player.user?.pubgId}`}>
                        <h3>{player.user?.ign || "No IGN"}</h3>
                    </Link>
                    <p>{player.user?.displayName || "No Display Name"}</p>
                </div>
                <div className="player-stats-body">
                    <div className="player-stats-row">
                        <span>AVG.KILL</span>
                        <strong>{player?.avgKill || "-"}</strong>
                    </div>
                    <div className="player-stats-row">
                        <span>AVG.DAMAGE</span>
                        <strong>{player?.avgDamage || "-"}</strong>
                    </div>
                    <div className="player-stats-row">
                        <span>AVG.SURVIVAL TIME</span>
                        <strong>{player?.avgSurvivalTime || "-"}</strong>
                    </div>
                </div>
            </div>
        </article>
    );
}
