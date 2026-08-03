import { SubHeader } from "../../components/SubHeader"
import { Loader } from "../../components/Loader"
import { lazy, Suspense } from "react"
import './players.css'

const PlayerGrid = lazy(() => import("./PlayerGrid").then(m => ({ default: m.PlayerGrid })));
export function Players() {
    return (
        <>
            <SubHeader subTitle="Players" />
            <Suspense fallback={<Loader />}>
                <div className="tournament-page">
                    <PlayerGrid />
                </div>
            </Suspense>
        </>
    );
}