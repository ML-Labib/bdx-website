import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID,
};

const validConfig = Object.values(firebaseConfig).every((value) => typeof value === "string" && value.length > 0);

let auth;
let googleProvider;

if (validConfig) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
} else {
    console.warn(
        "Firebase configuration is missing. Auth is disabled in development. " +
        "Create a .env file with VITE_API_KEY, VITE_AUTH_DOMAIN, VITE_PROJECT_ID, " +
        "VITE_STORAGE_BUCKET, VITE_MESSAGING_SENDER_ID, and VITE_APP_ID to enable it."
    );

    auth = {
        onAuthStateChanged(callback) {
            callback(null);
            return () => {};
        },
    };
    googleProvider = null;
}

export { auth, googleProvider };
