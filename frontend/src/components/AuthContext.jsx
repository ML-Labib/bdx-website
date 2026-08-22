import { useEffect, useState } from 'react';
import { auth } from '../pages/UserAuth/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { AuthContext, AUTH_LOGIN_TIMESTAMP_KEY } from './authConstants';
import { Loader } from './Loader';

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

    // Centralized logout logic
    const handleForcedLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Failed to sign out on expiration:", error);
        } finally {
            clearAuthTimestamp();
        }
    };

    useEffect(() => {
        // Listen to Firebase auth state
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // If Firebase says we have a user, verify they haven't expired our custom timer
                if (isAuthExpired()) {
                    handleForcedLogout();
                } else {
                    setCurrentUser(user);
                }
            } else {
                // No user logged in
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Check for session expiry every 5 minutes
    useEffect(() => {
        // Only run the interval if someone is currently logged in
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
            // No need to set currentUser(null) manually; onAuthStateChanged handles it automatically
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
                    <Loader />
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}