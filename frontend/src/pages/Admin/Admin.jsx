import { Sidebar } from "./Sidebar";

import "./admin.css";
export function Admin() {


    return (
        <div className="admin-container">
            <Sidebar />

            <section className="admin-content">
                <div>
                <h1>Admin Page</h1>
                </div>
            </section>
        </div>
    );
}