import { Header } from "../../components/Header";
import { SubHeader } from "../../components/SubHeader";


import "./MyActivity.css";

export function MyActivity() { 
    return (
        <div className="my-activity-page">
            <Header />
            <SubHeader subTitle="My Activities" />
            <div className="content">
                <p>This is the My Activity page.</p>
            </div>
        </div>
    );
 }