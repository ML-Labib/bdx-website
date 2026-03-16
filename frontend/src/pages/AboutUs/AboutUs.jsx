import { Header } from "../../components/Header"
import { SubHeader } from "../../components/SubHeader"

import "./AboutUs.css";


export function AboutUs() {

    return (
        <>
        <Header />
        <SubHeader subTitle="ABOUT US" />
        <div className="about-us">
            <h1>About Us</h1>
        </div>
        </>
    );
}