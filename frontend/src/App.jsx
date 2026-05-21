import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { AuthProvider, useAuth } from "./components/AuthContext";
import { Tournament } from "./pages/Tournament/Tournament";
import { TeamGrid } from "./pages/Teams/TeamGrid";
import { PlayerGrid } from "./pages/Players/PlayerGrid";
import { AboutUs } from "./pages/AboutUs/AboutUs";
import { MyActivity } from "./pages/MyActivity/MyActivity";
import Login from "./pages/UserAuth/Login";
import './App.css'

function RequireAuth({ children }) {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return null;
    }

    if (!currentUser) {
        const redirectTo = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/login?redirectTo=${redirectTo}`} replace />;
    }

    return children;
}

function App() {
    return (
        <AuthProvider>
            <Header />
            <Routes>
                <Route path="/" element={<div>Home</div>} />
                <Route path="/tournament" element={<Tournament />} />
                <Route path="/teams" element={<TeamGrid />} />
                <Route path="/players" element={<PlayerGrid />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/my-activity" element={<RequireAuth><MyActivity /></RequireAuth>} />
                <Route path="/login" element={<Login />} />
            </Routes>
        </AuthProvider>
    );
}

export default App;
