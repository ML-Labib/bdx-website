import React from "react";
import defaultProfile from "../../assets/default-profile.png";
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
  

                    <h3 className="person-name-wrap">
                        <span className="person-name">
                            {player.name}
                        </span>
                    </h3>
               
                <div className="person-info">
                    <div className="person-team-wrap">
                        <div className="person-team-label">
                            <span>Code</span>
                        </div>
                        <p className="person-team">
                            {player.code}
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