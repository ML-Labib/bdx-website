import defaultProfile from "../../assets/default-profile.png";
import { Link } from "react-router-dom";
import "./playerCard.css";

export function PlayerCard({ player }) {
    return (
        <div className="card player">
            <div className="card-image player">
                <img
                    src={player.picture || defaultProfile}
                    alt={player.displayName}
                    onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = defaultProfile;
                    }}
                />
            </div>

            <div className="card-content">
                {player.membership?.team?._id && (

                    <Link to={`/team-info/${player.membership?.team?._id}`}>
                        <div className="team-logo">
                            <img src={player.membership?.team?.logo} alt={"No team"} />
                        </div>
                    </Link>
                )
                }
                <div className="card-title player">
                    <Link to={`/player-info/${player.pubgId}`}>
                        <span className="name">
                            {player.ign}
                        </span>
                    </Link>
                </div>
                <ul className="card-info">
                    <li>
                        <span className="card-info-label">Team</span>
                        <span className="card-info-value">
                            {player.teamName || "Free Agent"}
                        </span>
                    </li>

                    <li>
                        <span className="card-info-label">Role</span>
                        <span className="card-info-value role">
                            {player.membership?.role || "-"}
                        </span>
                    </li>

                    <li>
                        <span className="card-info-label">Nationality</span>
                        <span className="card-info-value">
                            {player.country || "-"}
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    );
};