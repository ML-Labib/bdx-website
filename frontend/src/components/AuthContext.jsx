import { useEffect, useState } from 'react';
import { auth } from '../pages/UserAuth/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { AuthContext, AUTH_LOGIN_TIMESTAMP_KEY } from './authConstants';
import { Loader } from './Loader';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const clearAuthTimestamp = () => {
        localStorage.removeItem(AUTH_LOGIN_TIMESTAMP_KEY);
    };

    const isAuthExpired = () => {
        const stored = localStorage.getItem(AUTH_LOGIN_TIMESTAMP_KEY);
        if (!stored) return false;

        const timestamp = Number(stored);
        return !Number.isNaN(timestamp) && Date.now() - timestamp >= TWENTY_FOUR_HOURS_MS;
    };

    const resetAuthState = () => {
        setCurrentUser(null);
        setProfile(null);
    };

    // Centralized logout logic
    const handleForcedLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Failed to sign out on expiration:", error);
        } finally {
            clearAuthTimestamp();
            resetAuthState();
        }
    };

    // Fetches profile and populated team membership from backend
    const fetchUserProfile = async (user) => {
        try {
            const token = await user.getIdToken();
            const res = await fetch("/api/profile/user", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setProfile(data || null);
            } else {
                setProfile(null);
            }
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
            setProfile(null);
        }
    };

    useEffect(() => {
        // Listen to Firebase auth state
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                if (isAuthExpired()) {
                    await handleForcedLogout();
                } else {
                    setCurrentUser(user);
                    await fetchUserProfile(user);
                }
            } else {
                resetAuthState();
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Check for session expiry every 5 minutes
    useEffect(() => {
        if (!currentUser) return;

        const expiryCheckInterval = setInterval(() => {
            if (isAuthExpired()) {
                handleForcedLogout();
            }
        }, 5 * 60 * 1000);

        return () => clearInterval(expiryCheckInterval);
    }, [currentUser]);

    const logout = async () => {
        if (!auth) {
            return Promise.reject(new Error('Firebase auth is not initialized'));
        }

        try {
            await signOut(auth);
        } finally {
            clearAuthTimestamp();
            resetAuthState();
        }
    };

    // Allows child components to re-sync profile state after mutations (e.g. updating profile or leaving team)
    const refreshProfile = async () => {
        if (currentUser) {
            await fetchUserProfile(currentUser);
        }
    };

    const value = {
        currentUser,
        profile,
        refreshProfile,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="auth-loading">
                    <div className="auth-loading-spinner" />
                    <Loader />
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}