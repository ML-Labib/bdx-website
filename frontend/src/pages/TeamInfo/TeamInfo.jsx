import { Header } from "../../components/Header";
import { SubHeader } from "../../components/SubHeader"
import { PlayerStatsCard } from "./PlayerStatsCard";
import './teamInfo.css'

const teamPlayers = [
    {
        id: 1,
        name: "KerakTMz",
        realName: "Jhonny Alex Vieira Moura",
        avgKill: "0.83",
        avgDamage: "178.26",
        avgSurvivalTime: "20:37",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png"
    },
    {
        id: 2,
        name: "ps1co",
        realName: "Andrei Gonçalves de Carvalho",
        avgKill: "1.38",
        avgDamage: "219.59",
        avgSurvivalTime: "21:42",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png"
    },
    {
        id: 3,
        name: "rnzeera",
        realName: "Renan Rosa do Nascimento",
        avgKill: "1.31",
        avgDamage: "203.79",
        avgSurvivalTime: "21:42",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png"
    },
    {
        id: 4,
        name: "Toxic",
        realName: "Alison Fernando de Carvalho",
        avgKill: "-",
        avgDamage: "-",
        avgSurvivalTime: "-",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png"
    },
    {
        id: 5,
        name: "Echo",
        realName: "Leonardo Silva",
        avgKill: "1.05",
        avgDamage: "195.20",
        avgSurvivalTime: "22:10",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png"
    },
    {
        id: 6,
        name: "Nova",
        realName: "Thiago Santos",
        avgKill: "1.22",
        avgDamage: "210.18",
        avgSurvivalTime: "21:50",
        playerImage: "https://bd-extreme.com/wp-content/uploads/2025/09/Labib.png"
    }
];

export const TeamInfo = () => {
    return (
        <>
            <Header />
            <SubHeader subTitle="" />

            <div className="team-info-container">
                <section className="team-hero">
                    <div className="team-hero-inner">
                        <div className="hero-logo-block">
                            <div className="team-page-logo">
                                <img src="https://wstatic-prod-boc.krafton.com/common/team/20250317/aZIXMx7n/55.png" alt="Team Logo" className="hero-team-logo" />
                            </div>
                        </div>
                        <div className="team-hero-details">
                            <div className="team-name-wrapper">

                            <h3 className="team-name">BDX Obsidian</h3>
                            </div>

                            <div className="team-summary-stats">
                                <div className="stat-card">
                                    <span className="stat-label">Latest Tournament</span>
                                    <strong>PUBG Americas Series 6</strong>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Avg. Kill</span>
                                    <strong>4.12</strong>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Avg. Damage</span>
                                    <strong>739.88</strong>
                                </div>
                                <div className="stat-card">
                                    <span className="stat-label">Avg. Survival Time</span>
                                    <strong>26:01</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <div className="team-info-bar">
                    <div className="team-info-bar-inner">
                        <span className="team-info-bar-text">TEAM INFO</span>
                    </div>
                </div>
                <section className="team-section players-section">
                    <div className="section-header">
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
                            <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000"></path>
                        </svg>
                        <h2>Players</h2>
                    </div>
                    <div className="team-player-grid">
                        {teamPlayers.map((player) => (
                            <PlayerStatsCard key={player.id} player={player} />
                        ))}
                    </div>
                </section>

                <section className="team-section coach-section">
                    <div className="coach-section-wrapper">
                    <div className="section-header">
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
                            <path d="M24 0 8.79 16H.095L0 15.899 15.114 0H24Z" fill="#000"></path>
                        </svg>
                        <h2>Coach</h2>
                    </div>
                    <div className="coach-card-list">
                        <div className="coach-card">
                            <div>
                                <h3>cadu</h3>
                                <p>Carlos Eduardo Simoni Cunha</p>
                            </div>
                        </div>

                    </div>
                    </div>
                </section>
            </div>
        </>
    );
}