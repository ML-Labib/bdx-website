import { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom"
import "./header.css";
import bdxLogo from "../assets/BDX_EXTREME.svg"
import bdxTextLogo from "../assets/bd-extreme-text.svg"
import bdxTextShortLogo from "../assets/bdx-text.svg"

export function Header() {
    const user = { username: "Mahir Labib" }; // Placeholder for user authentication state
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sidebarDropdownOpen, setSidebarDropdownOpen] = useState(false);
    const dropdownRef = useRef();
    const sidebarDropdownRef = useRef();

    const handleLogout = () => {
        // Implement logout functionality here
        console.log("User logged out");
    }

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


    useEffect(() => {
        function handleClick(e) {
            // Close navbar dropdown if click is outside
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }

            // Close sidebar dropdown if click is outside
            if (sidebarDropdownRef.current && !sidebarDropdownRef.current.contains(e.target)) {
                setSidebarDropdownOpen(false);
            }
        }

        document.addEventListener("pointerdown", handleClick);
        return () => document.removeEventListener("pointerdown", handleClick);
    }, []);

    return (
        <nav className="header">
            <div className="left-section">
                <NavLink to="/" className="logo-link">
                    <div className="all-logo-container">
                        <img src={bdxTextLogo} alt="BD-Extreme" className="bdx-text-logo" />
                        <img src={bdxTextShortLogo} alt="BD-Extreme" className="bdx-short-text-logo" />
                        <div className="logo-container">
                            <img src={bdxLogo} alt="" className="bdx-logo" />
                        </div>
                    </div>
                </NavLink>

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

                    <NavLink to="/tournament" className="s-links"><span className="link-text">TOURNAMENT</span></NavLink>
                    <NavLink to="/teams" className="s-links"><span className="link-text">TEAMS</span></NavLink>
                    <NavLink to="/players" className="s-links"><span className="link-text">PLAYERS</span></NavLink>
                    <NavLink to="/about-us" className="s-links"><span className="link-text">ABOUT US</span></NavLink>

                </div>
                <div className="login-container" ref={dropdownRef}>
                    {user ? (
                        <>
                            <div className={`profile-btn-wrap ${dropdownOpen ? "active" : ""}`}>
                                <button
                                    className={`profile-btn ${dropdownOpen ? "active" : ""}`}
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    <span className="material-symbols-outlined">account_circle</span>
                                    <span className="username">{user.username}</span>
                                    <span className={`material-symbols-outlined arrow ${dropdownOpen ? "open" : ""} `}>
                                        arrow_drop_down
                                    </span>
                                </button>
                            </ div>

                            {dropdownOpen && (
                                <div className="dropdown">
                                    <Link to="/my-activity" className="dropdown-item" onClick={(e) => e.stopPropagation()}>
                                        My activity
                                    </Link>

                                    <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); handleLogout(); }}>
                                        Log out
                                    </button>
                                </div>
                            )}

                        </>

                    ) : (
                        <a href="#" className="l-links">
                            <span className="material-symbols-outlined">account_circle</span>
                            Log-in
                        </a>
                    )}
                </div>
            </div>


            <div className={`side-bar ${isOpen ? "open" : ""}`} onClick={handleSidebarClick}>
                <div className="side-bar-links">
                    <div className="sidebar-login-container" ref={sidebarDropdownRef}>
                        {user ? (
                            <>
                                <div className={`sidebar-profile-btn-wrap ${sidebarDropdownOpen ? "active" : ""}`}>
                                    <button
                                        className={`sidebar-profile-btn ${sidebarDropdownOpen ? "active" : ""}`}
                                        onClick={() => setSidebarDropdownOpen(!sidebarDropdownOpen)}
                                    >
                                        <span className="material-symbols-outlined">account_circle</span>
                                        <span className="username">{user.username}</span>
                                        <span className={`material-symbols-outlined arrow ${sidebarDropdownOpen ? "open" : ""} `}>
                                            arrow_drop_down
                                        </span>
                                    </button>
                                </div>

                                <div className={`sidebar-dropdown ${sidebarDropdownOpen ? "open" : ""}`}>
                                    <Link to="/my-activity" className="sidebar-dropdown-item" onClick={(e) => e.stopPropagation()}>
                                        My activity
                                    </Link>

                                    <button className="sidebar-dropdown-item" onClick={(e) => { e.stopPropagation(); handleLogout(); }}>
                                        Log out
                                    </button>
                                </div>

                            </>

                        ) : (
                            <button className="sidebar-logout-btn">
                                Log-in
                            </button>
                        )}
                    </div>

                    <NavLink to="/tournament" className="side-bar-link"><span >Tournament</span></NavLink>
                    <NavLink to="/teams" className="side-bar-link"><span >Teams</span></NavLink>
                    <NavLink to="/players" className="side-bar-link"><span >Players</span></NavLink>
                    <NavLink to="/about-us" className="side-bar-link"><span >About us</span></NavLink>

                </div>
            </div>

        </nav>
    )
}