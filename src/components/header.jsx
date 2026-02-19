import { useState } from "react";

import "./header.css";
import bdxLogo from "../assets/BDX_EXTREME.svg"
import bdxTextLogo from "../assets/bd-extreme-text.svg"
import bdxTextShortLogo from "../assets/bdx-text.svg"
export function Header() {

    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="header">
            <div className="left-section">
                <div className="all-logo-container">
                    <img src={bdxTextLogo} alt="BD-Extreme" className="bdx-text-logo" />
                    <img src={bdxTextShortLogo} alt="BD-Extreme" className="bdx-short-text-logo" />
                    <div className="logo-container">
                        <img src={bdxLogo} alt="" className="bdx-logo" />
                    </div>
                
                
                </div>
                {!isOpen ? (
                    <div className="menu" onClick={() => setIsOpen(true)}>
                        <span className="material-symbols-outlined">menu</span>
                    </div>
                ) : (
                    <div className="close-menu" onClick={() => setIsOpen(false)}>
                        <span className="material-symbols-outlined">close</span>
                    </div>
                )}

            </div>

            <div className="right-section">
                <div className="links">
                    <a href="#" className="s-links"><span className="link-text">HOME</span></a>
                    <a href="#" className="s-links"><span className="link-text">TOURNAMENT</span></a>
                    <a href="#" className="s-links"><span className="link-text">TEAMS</span></a>
                    <a href="#" className="s-links"><span className="link-text">PLAYERS</span></a>
                </div>
                <div className="login-container">
                    <a href="#" className="l-links">
                        <span className="material-symbols-outlined">account_circle</span>
                        Log-in
                    </a>
                </div>
            </div>

            <div className={`side-bar${isOpen ? "-open" : ""}`}>
                <div className="side-bar-links">
                    <button href="#" >Log-in</button>
                    <a href="#" ><span >HOME</span></a>
                    <a href="#" ><span >TOURNAMENT</span></a>
                    <a href="#" ><span >TEAMS</span></a>
                    <a href="#" ><span >PLAYERS</span></a>
                </div>
            </div>
        </nav>
    )
}