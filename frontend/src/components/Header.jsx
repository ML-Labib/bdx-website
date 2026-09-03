import { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "./useAuth.jsx";
import { getAuthHeaders } from "../utils/authHeaders";
import bdxLogo from "../assets/BDX_EXTREME.svg";
import bdxTextLogo from "../assets/bd-extreme-text.svg";
import bdxTextShortLogo from "../assets/bdx-text.svg";
import { NotificationPanel } from "./NotificationPanel";
import "./header.css";

export function Header() {
    const { currentUser, profile, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [sidebarDropdownOpen, setSidebarDropdownOpen] = useState(false);

    const dropdownRef = useRef(null);
    const sidebarDropdownRef = useRef(null);
    const notificationRef = useRef(null);
    const sidebarRef = useRef(null);

    const [notificationOpen, setNotificationOpen] = useState(false);


    const [hasNotification, setHasNotification] = useState(false);

    const handleNotificationClose = () => {
        setNotificationOpen(false);
    };

    const handleNotificationsRead = () => {
        setHasNotification(false);
    };


    const handleLogout = async () => {
        try {
            await logout();
            closeAllMenus();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };
    // Helper to close menus on navigation
    const closeAllMenus = () => {
        setIsOpen(false);
        setDropdownOpen(false);
        setSidebarDropdownOpen(false);
        setNotificationOpen(false);
    };

    // 1. Automatically close mobile sidebar when window resizes to desktop screens
    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia('(min-width: 1025px)');

        const handleResize = (e) => {
            if (e.matches) setIsOpen(false);
        };

        if (mq.addEventListener) mq.addEventListener('change', handleResize);
        else mq.addListener(handleResize);

        return () => {
            if (mq.removeEventListener) mq.removeEventListener('change', handleResize);
            else mq.removeListener(handleResize);
        };
    }, []);

    // 2. Close dropdowns on outside pointer down
    useEffect(() => {
        const handleClickOutside = (e) => {
            const target = e.target;

            // Desktop profile dropdown
            if (
                dropdownOpen &&
                dropdownRef.current &&
                !dropdownRef.current.contains(target)
            ) {
                setDropdownOpen(false);
            }

            // Mobile profile dropdown
            if (
                sidebarDropdownOpen &&
                sidebarDropdownRef.current &&
                !sidebarDropdownRef.current.contains(target)
            ) {
                setSidebarDropdownOpen(false);
            }

            // Notification panel
            if (
                notificationOpen &&
                notificationRef.current &&
                !notificationRef.current.contains(target)
            ) {
                handleNotificationClose();
            }

            // Mobile sidebar
            if (
                isOpen &&
                sidebarRef.current &&
                !sidebarRef.current.contains(target)
            ) {
                setIsOpen(false);
                setSidebarDropdownOpen(false);
            }
        };

        document.addEventListener("pointerdown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "pointerdown",
                handleClickOutside
            );
        };
    }, [
        dropdownOpen,
        sidebarDropdownOpen,
        notificationOpen,
        isOpen,
    ]);

    useEffect(() => {
        // 1. Define the async function inside the effect
        const fetchUnreadNotifications = async () => {
            try {
                const headers = await getAuthHeaders(currentUser);
                const response = await fetch("/api/notifications/unread", {
                    method: "GET",
                    headers,
                });

                if (response.ok) {
                    const data = await response.json();
                    setHasNotification(data.hasUnread);
                } else {
                    console.error("Failed to fetch unread notifications");
                }
            } catch (error) {
                console.error("Error fetching unread notifications:", error);
            }
        };

        // 2. Only call it if we have a user
        if (currentUser) {
            fetchUnreadNotifications();
        }
    }, [currentUser]);


    // const handleSidebarOverlayClick = (e) => {
    //     if (e.target === e.currentTarget) {
    //         setIsOpen(false);
    //     }
    // };

    return (
        <nav className="header">
            {/* Left Brand Section */}
            <div className="left-section">
                <NavLink to="/" className="logo-link" onClick={closeAllMenus}>
                    <div className="all-logo-container">
                        <img src={bdxTextLogo} alt="BD-Extreme" className="bdx-text-logo" />
                        <img src={bdxTextShortLogo} alt="BD-Extreme" className="bdx-short-text-logo" />
                        <div className="logo-container">
                            <img src={bdxLogo} alt="BDX Logo" className="bdx-logo" />
                        </div>
                    </div>
                </NavLink>
            </div>


            {/* Desktop Navigation */}
            <div className="right-section">
                <div className="links">
                    <NavLink to="/tournament" className="s-links"><span className="link-text">TOURNAMENT</span></NavLink>
                    <NavLink to="/teams" className="s-links"><span className="link-text">TEAMS</span></NavLink>
                    <NavLink to="/players" className="s-links"><span className="link-text">PLAYERS</span></NavLink>
                    <NavLink to="/about-us" className="s-links"><span className="link-text">ABOUT US</span></NavLink>
                </div>
            </div>

            <div className="header-actions">

                {/* ONE NOTIFICATION */}
                {currentUser && (
                    <div className="notification-wrapper" ref={notificationRef}>

                        <button
                            className={`notification-button ${hasNotification ? "has-notification" : ""
                                }`}
                            onClick={() => {
                                setNotificationOpen((prev) => !prev);
                            }}
                            aria-label="Notifications"
                            aria-expanded={notificationOpen}
                        >
                            <span className="material-symbols-outlined">
                                notifications
                            </span>
                        </button>

                        {notificationOpen && (
                            <NotificationPanel
                                // notifications={notifications}
                                onClose={handleNotificationClose}
                                onRead={handleNotificationsRead}

                            />
                        )}

                    </div>
                )}

                {/* Desktop Profile / Login Menu */}
                <div className="login-box" ref={dropdownRef}>
                    {currentUser ? (
                        <>
                            <div className={`profile-btn-wrap ${dropdownOpen ? "active" : ""}`}>
                                <button
                                    className={`profile-btn ${dropdownOpen ? "active" : ""}`}
                                    onClick={() => setDropdownOpen((prev) => !prev)}
                                >
                                    <span className="material-symbols-outlined">account_circle</span>
                                    <span className="username">{profile?.displayName ||currentUser.displayName || currentUser.email}</span>
                                    <span className={`material-symbols-outlined arrow ${dropdownOpen ? "open" : ""}`}>
                                        arrow_drop_down
                                    </span>
                                </button>
                            </div>

                            {dropdownOpen && (
                                <div className="dropdown">
                                    <Link
                                        to="/my-activity"
                                        className="dropdown-item"
                                        onClick={closeAllMenus}
                                    >
                                        My activity
                                    </Link>
                                    <button
                                        className="dropdown-item"
                                        onClick={handleLogout}
                                    >
                                        Log out
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <NavLink to="/login" className="l-links">
                            <span className="material-symbols-outlined">account_circle</span>
                            Log-in
                        </NavLink>
                    )}
                </div>

                {/* Mobile Toggle Button */}
                <div className="menu" onClick={() => setIsOpen(true)}>
                    <span className="material-symbols-outlined menu">menu</span>
                </div>

            </div>



            {/* Mobile Sidebar */}
            <div className={`side-bar ${isOpen ? "open" : ""}`}>
                <div className="close-menu" onClick={() => setIsOpen(false)}>
                    <span className="material-symbols-outlined">close</span>
                </div>

                <div className="side-bar-links" ref={sidebarRef}>

                    {/* Mobile Profile / Login Container */}
                    <div className="sidebar-login-container" ref={sidebarDropdownRef}>
                        {currentUser ? (
                            <>

                                <div className={`sidebar-profile-btn-wrap ${sidebarDropdownOpen ? "active" : ""}`}>
                                    <button
                                        className={`sidebar-profile-btn ${sidebarDropdownOpen ? "active" : ""}`}
                                        onClick={() => setSidebarDropdownOpen((prev) => !prev)}
                                    >
                                        <span className="material-symbols-outlined">account_circle</span>
                                        <span className="username">{currentUser.displayName || currentUser.email}</span>
                                        <span className={`material-symbols-outlined arrow ${sidebarDropdownOpen ? "open" : ""}`}>
                                            arrow_drop_down
                                        </span>
                                    </button>
                                </div>

                                <div className={`sidebar-dropdown ${sidebarDropdownOpen ? "open" : ""}`}>
                                    <Link
                                        to="/my-activity"
                                        className="sidebar-dropdown-item"
                                        onClick={closeAllMenus}
                                    >
                                        My activity
                                    </Link>

                                    <button
                                        className="sidebar-dropdown-item"
                                        onClick={handleLogout}
                                    >
                                        Log out
                                    </button>
                                </div>
                            </>
                        ) : (
                            <NavLink to="/login" className="sidebar-logout-btn" onClick={closeAllMenus}>
                                Log-in
                            </NavLink>
                        )}
                    </div>

                    {/* Mobile Nav Links */}
                    <NavLink to="/tournament" className="side-bar-link" onClick={closeAllMenus}><span>Tournament</span></NavLink>
                    <NavLink to="/teams" className="side-bar-link" onClick={closeAllMenus}><span>Teams</span></NavLink>
                    <NavLink to="/players" className="side-bar-link" onClick={closeAllMenus}><span>Players</span></NavLink>
                    <NavLink to="/about-us" className="side-bar-link" onClick={closeAllMenus}><span>About us</span></NavLink>

                </div>
            </div>
        </nav>
    );
}