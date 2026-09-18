import { SubHeader } from "../../components/SubHeader"
import { lazy, Suspense } from "react"
import { Loader } from "../../components/Loader"
const TournamentTable = lazy(() => import("./TournamentTable").then(m => ({ default: m.TournamentTable })));

// import { TournamentTable } from "./TournamentTable"

export function Tournament() {
    return (
        <>
        <SubHeader subTitle="Tournaments" />
        <Suspense fallback={<Loader />}>
            <div className="page">
                <TournamentTable />
            </div>
        </Suspense>
        </>
    );
}