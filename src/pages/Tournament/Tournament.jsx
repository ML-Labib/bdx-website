import { Header } from "../../components/Header"
import { SubHeader } from "../../components/SubHeader"
import { TournamentTable } from "./TournamentTable"

export function Tournament() {
    return (
        <>
        <Header />
        <SubHeader subTitle="Tournament" />
        <div className="tournament-page">
            <TournamentTable />
        </div>
        </>
    );
}