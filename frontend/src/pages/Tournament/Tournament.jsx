import { Header } from "../../components/Header"
import { SubHeader } from "../../components/SubHeader"
import { TournamentTable } from "./TournamentTable"

export function Tournament() {
    return (
        <>
 
        <SubHeader subTitle="Tournaments" />
        <div className="tournament-page">
            <TournamentTable />
        </div>
        </>
    );
}