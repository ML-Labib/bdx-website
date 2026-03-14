import React from "react";
import "./teamCard.css";

export function TeamCard ({ team }){
    return (
        <div className="team-card">
            <div className="team-card-image">
                <img src={team.logo} alt={team.name} />
            </div>

            <div className="team-card-content">
                <h3>{team.name}</h3>
                <p>{team.region}</p>
            </div>
        </div>
    );
};

