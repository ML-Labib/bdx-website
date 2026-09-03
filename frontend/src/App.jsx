import { useEffect, useState, Component, lazy, Suspense } from "react";
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
const AboutUs = lazy(() => import("./pages/AboutUs/AboutUs").then(m => ({ default: m.AboutUs })));
const MyActivity = lazy(() => import("./pages/MyActivity/MyActivity").then(m => ({ default: m.MyActivity })));
const TeamInfo = lazy(() => import("./pages/TeamInfo/TeamInfo").then(m => ({ default: m.TeamInfo })));
const PlayerInfo = lazy(() => import("./pages/PlayerInfo/PlayerInfo").then(m => ({ default: m.PlayerInfo })));
const TournamentInfo = lazy(() => import("./pages/TournamentInfo/TournamentInfo").then(m => ({ default: m.TournamentInfo })));
const Login = lazy(() => import("./pages/UserAuth/Login")); // Default export
const Admin = lazy(() => import("./pages/Admin/Admin").then(m => ({ default: m.Admin })));
const ManageLeaderboards = lazy(() => import("./pages/Admin/leaderboardManagement/ManageLeaderboards.jsx").then(m => ({ default: m.ManageLeaderboards })));
const ManageTournaments = lazy(() => import("./pages/Admin/ManageTournaments").then(m => ({ default: m.ManageTournaments })));
const ManagePlayers = lazy(() => import("./pages/Admin/ManagePlayers").then(m => ({ default: m.ManagePlayers })));  
const ManageTeams = lazy(() => import("./pages/Admin/ManageTeams").then(m => ({ default: m.ManageTeams })));


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

function RequireAdmin({ children }) {
    const { currentUser, loading } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingAdmin, setCheckingAdmin] = useState(true);

    useEffect(() => {
        let isMounted = true;

        if (currentUser) {
            // getIdTokenResult() fetches custom claims attached to the user's JWT
            currentUser.getIdTokenResult()
                .then((idTokenResult) => {
                    if (isMounted) {
                        setIsAdmin(!!idTokenResult.claims.admin);
                    }
                })
                .catch((error) => {
                    console.error("Error verifying admin claim:", error);
                    if (isMounted) setIsAdmin(false);
                })
                .finally(() => {
                    if (isMounted) setCheckingAdmin(false);
                });
        } else {
            Promise.resolve().then(() => {
                if (isMounted) {
                    setIsAdmin(false);
                    setCheckingAdmin(false);
                }
            });
        }

        return () => {
            isMounted = false;
        };
    }, [currentUser]);

    if (loading || checkingAdmin) {
        return <Loader />;
    }

    if (!currentUser || !isAdmin) {
        return (
            <div className="empty-state admin-access-denied">
                <h1>Access Denied</h1>
                <p>You do not have permission to access this page.</p>
            </div>
        );
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
                        <Route path="/" element={<div>Home</div>} />
                        <Route path="/tournament" element={<Tournament />} />
                        <Route path="/teams" element={<TeamGrid />} />
                        <Route path="/teams/info/:teamId?" element={<TeamInfo />} />
                        <Route path="/players" element={<Players />} />
                        <Route path="/about-us" element={<AboutUs />} />
                        <Route path="/my-activity" element={<RequireAuth><MyActivity /></RequireAuth>} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/player-info/:pubgId?" element={<PlayerInfo />} />
                        <Route path="/tournament-info/:id?" element={<TournamentInfo  />} />

                        <Route path="/admin" element={
                            <RequireAuth><RequireAdmin>
                                <Admin />
                            </RequireAdmin></RequireAuth>} >

                            <Route index element={<Navigate to="manage-tournaments" replace />} />

                            <Route path="manage-tournaments" element={<ManageTournaments />} />
                            <Route path="manage-leaderboards" element={<ManageLeaderboards />} />
                            <Route path="manage-players" element={<ManagePlayers />} />
                            <Route path="manage-teams" element={<ManageTeams />} />
                        </Route>

                    </Routes>
                </Suspense>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;