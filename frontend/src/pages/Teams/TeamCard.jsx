import React from "react";
import { Link } from "react-router-dom";
import "./teamCard.css";

export function TeamCard({ team }) {
    return (
        <div className="team-card">
            <div className="team-card-image">
                <img src={team.logo} alt={team.name} />
            </div>

            <div className="team-card-content">
                <h3>
                    <Link 
                    to={`/teams/info/${team._id}`}>
                        <span className="team-name">{team.name}</span>
                    </Link>
                </h3>
                <p>{team.country}</p>
            </div>
        </div>
    );
};

