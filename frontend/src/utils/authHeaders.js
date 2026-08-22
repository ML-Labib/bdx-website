export const getAuthHeaders = async (currentUser, includeJson = true) => {
    const headers = {};

    if (includeJson) {
        headers["Content-Type"] = "application/json";
    }

    if (!currentUser?.getIdToken) {
        throw new Error("User is not authenticated.");
    }

    try {
        const token = await currentUser.getIdToken();

        headers.Authorization = `Bearer ${token}`;

        return headers;
    } catch (error) {
        console.error("Failed to get Firebase ID token:", error);
        throw new Error("Authentication failed.");
    }
};