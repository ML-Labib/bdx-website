import { Component, lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { AuthProvider } from "./components/AuthContext";
import { useAuth } from "./components/useAuth.jsx";
import { Loader } from "./components/Loader";
import './App.css';
// Lazy-load page components on demand
// const Tournament = lazy(() => import("./pages/Tournament/Tournament").then(m => ({ default: m.Tournament })));
import { Tournament } from "./pages/Tournament/Tournament";
const TeamGrid = lazy(() => import("./pages/Teams/TeamGrid").then(m => ({ default: m.TeamGrid })));
const Players = lazy(() => import("./pages/Players/Players").then(m => ({ default: m.Players })));
const PlayerGrid = lazy(() => import("./pages/Players/PlayerGrid").then(m => ({ default: m.PlayerGrid })));
const AboutUs = lazy(() => import("./pages/AboutUs/AboutUs").then(m => ({ default: m.AboutUs })));
const MyActivity = lazy(() => import("./pages/MyActivity/MyActivity").then(m => ({ default: m.MyActivity })));
const TeamInfo = lazy(() => import("./pages/TeamInfo/TeamInfo").then(m => ({ default: m.TeamInfo })));
const PlayerInfo = lazy(() => import("./pages/PlayerInfo/PlayerInfo").then(m => ({ default: m.PlayerInfo })));
const TournamentInfo = lazy(() => import("./pages/TournamentInfo/TournamentInfo").then(m => ({ default: m.TournamentInfo })));
const Login = lazy(() => import("./pages/UserAuth/Login")); // Default export

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    render() {
        if (this.state.error) {
            return (
                <div className="app-error">
                    <h1>Something went wrong</h1>
                    <pre>{this.state.error.message}</pre>
                    <p>Please check the browser console for details.</p>
                </div>
            );
        }

        return this.props.children;
    }
}

function RequireAuth({ children }) {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loader />;
    }

    if (!currentUser) {
        const redirectTo = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/login?redirectTo=${redirectTo}`} replace />;
    }

    return children;
}

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Header />
                {/* Wrap Routes in Suspense to show Loader while chunk files download */}
                <Suspense fallback={<Loader />}>
                    <Routes>
                        <Route path="/" element={<div>Home {<Loader />}</div>} />
                        <Route path="/tournament" element={<Tournament />} />
                        <Route path="/teams" element={<TeamGrid />} />
                        <Route path="/players" element={<Players />} />
                        <Route path="/about-us" element={<AboutUs />} />
                        <Route path="/my-activity" element={<RequireAuth><MyActivity /></RequireAuth>} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/team-info" element={<TeamInfo />} />
                        <Route path="/player-info" element={<PlayerInfo />} />
                        <Route path="/tournament-info/:id?" element={<TournamentInfo />} />
                    </Routes>
                </Suspense>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;