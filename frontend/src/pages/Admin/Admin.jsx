import { Outlet } from "react-router-dom";
import { Sidebar } from "./SideBar";
import "./admin.css";

export function Admin() {
    return (
        <div className="admin-container">
            {/* Sidebar stays visible on all admin pages */}
            <Sidebar />

            <section className="admin-content">
                {/* This dynamically changes based on the child route */}
                <Outlet />
            </section>
        </div>
    );
}