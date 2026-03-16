import { useState } from "react";
import { Header } from "../../components/Header"
import { SubHeader } from "../../components/SubHeader"
import { PlayerCard } from "./PlayerCard";
import './playerGrid.css'
const playersData = [
    {
        id: 1,
        name: "04NB",
        team: "Petrichor Road",
        nationality: "China",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png",
        teamLogo: "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-OBSIDIAN.webp"
    },
    {
        id: 2,
        name: "10trip",
        team: "Happie SQUAD",
        nationality: "Philippines",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png",
        teamLogo: "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-OBSIDIAN.webp"
    },
    {
        id: 3,
        name: "16KK",
        team: "NEWHAPPY-ESPORTS",
        nationality: "China",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png",
        teamLogo: "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-VIPER.webp"
    },
    {
        id: 4,
        name: "2baeMaster",
        team: "Mercedes",
        nationality: "Korea (Republic of)",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png",
        teamLogo: "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-OBSIDIAN.webp"
    },
    {
        id: 5,
        name: "2EZ",
        team: "Green Tea",
        nationality: "Korea (Republic of)",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png",
        teamLogo: "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-OBSIDIAN.webp"
    },
    {
        id: 6,
        name: "2hAns",
        team: "Game Start Win",
        nationality: "China",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png",
        teamLogo: "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-OBSIDIAN.webp"
    },
    {
        id: 7,
        name: "3Thee",
        team: "Armory Gaming",
        nationality: "-",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png",
        teamLogo: "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-OBSIDIAN.webp"
    },
    {
        id: 8,
        name: "4EARTH",
        team: "Collector",
        nationality: "-",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png",
        teamLogo: "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-OBSIDIAN.webp"
    },

    // Additional mock players
    {
        id: 9,
        name: "ShadowX",
        team: "BDX Elite",
        nationality: "Bangladesh",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png",
        teamLogo: "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-OBSIDIAN.webp"
    },
    {
        id: 10,
        name: "Blaze",
        team: "Inferno Squad",
        nationality: "Indonesia",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png",
        teamLogo: "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-OBSIDIAN.webp"
    },
    {
        id: 11,
        name: "NightWolf",
        team: "Dark Hunters",
        nationality: "Thailand",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png",
        teamLogo: "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-OBSIDIAN.webp"
    },
    {
        id: 12,
        name: "SniperZ",
        team: "Falcon Force",
        nationality: "Malaysia",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png",
        teamLogo: "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-OBSIDIAN.webp"
    },
    {
        id: 13,
        name: "Vortex",
        team: "Storm Breakers",
        nationality: "Vietnam",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png",
        teamLogo: "https://bd-extreme.com/wp-content/uploads/2026/02/BDX-OBSIDIAN.webp"
    }
];

export function PlayerGrid() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTeams = playersData.filter((player) => {

        const matchesSearch = player.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        return matchesSearch;
    });
    return (
        <>
            <Header />
            <SubHeader subTitle="Players" />
            <div className="player-page">
                <div className="team-filters">
                    <div className="search-wrap">
                        <div className="search-group">
                            <input
                                type="text"
                                placeholder="Player name"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}

                            />
                            <span className="material-symbols-outlined">
                                search
                            </span>
                        </div>
                    </div>
                </div>
                <div className="player-section-wrap">
                    <div className="player-section">
                        <div className="player-grid">

                            {filteredTeams.map((player) => (
                                <PlayerCard key={player.id} player={player} />
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
                </div></div>
        </>
    );
}