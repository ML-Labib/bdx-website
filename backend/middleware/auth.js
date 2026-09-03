import admin from "../config/firebase-admin.js";
export const requireAuth = async (req, res, next) => {
    const authHeader =
        req.headers.authorization ||
        req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication required. Please provide a valid Bearer token in the Authorization header."
        });
    }

    const token = authHeader
        .substring(7)
        .trim();

    if (!token) {
        return res.status(401).json({
            message: "Authentication required. 3"
        });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;

        return next();

    } catch (error) {
        console.error("Firebase token verification failed:", error);
        
        return res.status(401).json({
            message: "Invalid or expired authentication token."
        });
    }
};