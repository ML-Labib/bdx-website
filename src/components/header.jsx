import { useState, useEffect } from "react";
import { NavLink } from "react-router"
import "./header.css";
import bdxLogo from "../assets/BDX_EXTREME.svg"
import bdxTextLogo from "../assets/bd-extreme-text.svg"
import bdxTextShortLogo from "../assets/bdx-text.svg"

export function Header() {

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia('(min-width: 1025px)');
        const handle = (e) => {
            if (e.matches) setIsOpen(false);
        };
        // perform initial check asynchronously to avoid synchronous setState inside effect
        const initTimeout = mq.matches ? setTimeout(() => setIsOpen(false), 0) : null;
        if (mq.addEventListener) mq.addEventListener('change', handle);
        else mq.addListener(handle);
        return () => {
            if (initTimeout) clearTimeout(initTimeout);
            if (mq.removeEventListener) mq.removeEventListener('change', handle);
            else mq.removeListener(handle);
        };
    }, []);

    useEffect(() => {
        if (!isOpen || window.innerWidth >= 1024) return;
        
        const handleClickOutside = (e) => {
            if (e.target.closest('.header') === null) {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    const handleSidebarClick = (e) => {
        if (e.target === e.currentTarget) {
            setIsOpen(false);
        }
    };

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
                    <NavLink to="/" className="s-links"><span className="link-text">HOME</span></NavLink>
                    <NavLink to="/tournament" className="s-links"><span className="link-text">TOURNAMENT</span></NavLink>
                    <NavLink to="/teams" className="s-links"><span className="link-text">TEAMS</span></NavLink>
                    <NavLink to="/players" className="s-links"><span className="link-text">PLAYERS</span></NavLink>
                </div>
                <div className="login-container">
                    <a href="#" className="l-links">
                        <span className="material-symbols-outlined">account_circle</span>
                        Log-in
                    </a>
                </div>
            </div>


                <div className={`side-bar ${isOpen ? "open" : ""}`} onClick={handleSidebarClick}>
                    <div className="side-bar-links">
                        <button href="#" >Log-in</button>
                        <NavLink to="/" className="side-bar-link"><span >HOME</span></NavLink>
                        <NavLink to="/tournament" className="side-bar-link"><span >TOURNAMENT</span></NavLink>
                        <NavLink to="/teams" className="side-bar-link"><span >TEAMS</span></NavLink>
                        <NavLink to="/players" className="side-bar-link"><span >PLAYERS</span></NavLink>
                    </div>
                </div>

        </nav>
    )
}