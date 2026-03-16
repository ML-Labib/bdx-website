import { useState } from "react";
import { Header } from "../../components/Header"
import { SubHeader } from "../../components/SubHeader"
import { TeamCard } from "./TeamCard";
import './teamGrid.css'

const teamsData = [
    {
        id: 1,
        name: "+55 e-Sports",
        region: "AMERICAS",
        logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
    },
    {
        id: 2,
        name: "010 Esports",
        region: "EMEA",
        logo: "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-ZFORCE-TPNG.webp",
    },
    {
        id: 3,
        name: "17Gaming",
        region: "ASIA",
        logo: "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-VIPER.webp",
    },
    {
        id: 4,
        name: "4DOGZ",
        region: "AMERICAS",
        logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
    },
    {
        id: 5,
        name: "7Royal",
        region: "ASIA",
        logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
    },
    {
        id: 6,
        name: "Acend",
        region: "EMEA",
        logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
    },
    {
        id: 7,
        name: "AlQadsiah",
        region: "AMERICAS",
        logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
    },
    {
        id: 8,
        name: "Alter Ego",
        region: "APAC",
        logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
    },
    {
        id: 9,
        name: "Anyone's Legend",
        region: "APAC",
        logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
    },
    {
        id: 10,
        name: "Armory Gaming",
        region: "APAC",
        logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
    },
    {
        id: 11,
        name: "Aurora",
        region: "APAC",
        logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
    },
    {
        id: 12,
        name: "BGP",
        region: "ASIA",
        logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
    },
    {
        id: 13,
        name: "BGT",
        region: "EMEA",
        logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
    },
    {
        id: 14,
        name: "BB",
        region: "AMERICAS",
        logo: "https://bd-extreme.com/wp-content/uploads/2025/08/BDX-EXTREME-png.png",
    },
];
export function TeamGrid() {


    const [searchTerm, setSearchTerm] = useState("");

    const filteredTeams = teamsData.filter((team) => {

        const matchesSearch = team.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        return matchesSearch;
    });
    return (
        <>
            <Header />
            <SubHeader subTitle="TEAMS" />
            <section className="team-page">
                
                <div className="team-filters">
                    <div className="search-wrap">
                        <div className="search-group">
                            <input
                                type="text"
                                placeholder="Team's name"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}

                            />
                            <span className="material-symbols-outlined">
                                search
                            </span>
                        </div>
                    </div>
                </div>
                <div className="team-section-wrap">
                <div className="team-section">


                    <div className="team-grid">

                        {filteredTeams.map((team) => (
                            <TeamCard key={team.id} team={team} />
                        ))}
                    </div>

                </div>
                <div className="show-more">
                    <button className="show-more-btn">
                        <span className="material-symbols-outlined">
                            keyboard_arrow_down
                        </span>
                        <span>
                            More
                        </span>
                    </button>
                </div>
                </div>

            </section>
        </>

    );
}