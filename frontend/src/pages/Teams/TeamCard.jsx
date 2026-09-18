
import { Link } from "react-router-dom";
import "./teamCard.css";

export function TeamCard({ team }) {
    return (
        <div className="card team">
            <div className="card-image team">
                <img src={team.logo} alt={team.name} />
            </div>

            <div className="card-content">
                <div className="card-title">
                    <Link 
                    to={`/teams/info/${team._id}`}>
                        <span className="name">{team.name}</span>
                    </Link>
                </div>

                <p>{team.country}</p>
            </div>
        </div>
    );
};

