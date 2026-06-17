import { Component } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Header } from "./components/Header";
import { AuthProvider } from "./components/AuthContext";
import { useAuth } from "./components/useAuth.jsx";
import { Tournament } from "./pages/Tournament/Tournament";
import { TeamGrid } from "./pages/Teams/TeamGrid";
import { PlayerGrid } from "./pages/Players/PlayerGrid";
import { AboutUs } from "./pages/AboutUs/AboutUs";
import { MyActivity } from "./pages/MyActivity/MyActivity";
import Login from "./pages/UserAuth/Login";
import './App.css'

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
        <ErrorBoundary>
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
        </ErrorBoundary>
    );
}

export default App;
