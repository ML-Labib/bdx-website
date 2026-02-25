import { Header } from "../../components/Header"
import { SubHeader } from "../../components/SubHeader"

export function Teams() {
    return (
        <>
        <Header />
        <SubHeader subTitle="Teams" />
        <div className="teams-page">
            <h1>BDX Teams</h1>
            <p>Details about the teams will be announced soon. Stay tuned!</p>
        </div>
        </>
    );
}