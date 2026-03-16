import { Header } from "../../components/Header"
import { SubHeader } from "../../components/SubHeader"

export function Players() {
    return (
        <>
        <Header />
        <SubHeader subTitle="Players" />
        <div className="player-page">
            <h1>BDX Players</h1>
            <p>Details about the players will be announced soon. Stay tuned!</p>
        </div>
        </>
    );
}