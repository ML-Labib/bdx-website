import { useEffect, useState } from 'react';
import { auth } from '../pages/UserAuth/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { AuthContext, AUTH_LOGIN_TIMESTAMP_KEY } from './authConstants';

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        if (isAuthExpired()) {
            signOut(auth).catch(console.error);
            clearAuthTimestamp();
            setCurrentUser(null);
        }

        return unsubscribe;
    }, []);

    // Check for session expiry every 5 minutes
    useEffect(() => {
        const expiryCheckInterval = setInterval(() => {
            if (isAuthExpired() && currentUser) {
                signOut(auth).catch(console.error);
                clearAuthTimestamp();
                setCurrentUser(null);
            }
        }, 5 * 60 * 1000); // Check every 5 minutes

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
        }
    };

    const value = {
        currentUser,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="auth-loading">
                    <div className="auth-loading-spinner" />
                    <span>Loading...</span>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}