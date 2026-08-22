import { useState, useEffect } from "react";
import "./sideBar.css";

export function Sidebar() {
    const [isCollapsed, setIsCollapsed] = useState(window.innerWidth <= 768);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const navItems = [
        { id: 'tournaments', label: 'Manage Tournaments', icon: "trophy" },
        { id: 'leaderboards', label: 'Manage Leaderboard', icon: "leaderboard" },
        { id: 'players', label: 'Manage Players', icon: "account_circle" },
        { id: 'teams', label: 'Manage Teams', icon: "groups" },
    ];

    return (
        <div className="admin-sidebar-container">
            <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                {/* Header / Toggle Button */}
                <div className="sidebar-header">
                    {!isCollapsed && <span className="logo-text">Admin Dashboard</span>}
                    <button className="toggle-btn" onClick={toggleSidebar} aria-label="Toggle Navigation">
                        <span className="material-symbols-outlined">
                            {isCollapsed ? 'arrow_menu_open' : 'arrow_menu_close'}
                        </span>
                    </button>
                </div>

                {/* Nav Menu */}
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className="nav-item"
                            title={isCollapsed ? item.label : ''} // Tooltip when collapsed
                        >
                            <span className="material-symbols-outlined">
                                {item.icon}
                            </span>
                            {!isCollapsed && <span className="nav-label">{item.label}</span>}
                        </button>
                    ))}
                </nav>
            </aside>
        </div>
    );
}