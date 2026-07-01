import { Header } from "../../components/Header"
import { SubHeader } from "../../components/SubHeader"
import { PersonCard } from "./PersonCard.jsx"

import "./aboutUs.css";


export function AboutUs() {
    const leaderData = [
        {
            id: 1,
            name: "SAiNT-ViLLAiN",
            team: "BDX OBSIDIAN",
            nationality: "Bangladesh",
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
        }
    ]

    return (
        <>
            <Header />
            <SubHeader subTitle="ABOUT US" />
            <div className="about-us-container">
                <div className="title-bar">
                    <svg
                        className="section-icon"
                        width="32"
                        height="16"
                        viewBox="0 0 32 16"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <path d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z" fill="#EFF923" />
                        <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000" />
                    </svg>
                    <h2> Supreme Leaders of BD-EXTREME</h2>
                </div>
                <div className="supreme-leaders-container">
                    {leaderData.map((player) => (
                        <PersonCard key={player.id} player={player} />
                    ))}
                </div>

                <div className="title-bar">
                    <svg
                        className="section-icon"
                        width="32"
                        height="16"
                        viewBox="0 0 32 16"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <path d="M32 0 16.79 16H8.095L8 15.899 23.114 0H32Z" fill="#EFF923" />
                        <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000" />
                    </svg>
                    <h2> Admins of BD-EXTREME</h2>
                </div>
            </div>
        </>
    );
}