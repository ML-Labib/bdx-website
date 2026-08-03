

// const PUBG_API_KEY = import.meta.env.VITE_PUBG_API_KEY;
const PUBG_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIzN2JlZGZiMC1jYzNmLTAxM2QtNjc0Ni02ZTVlYTRlOTc1ODMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNzM5NDU0NTQ2LCJwdWIiOiJibHVlaG9sZSIsInRpdGxlIjoicHViZyIsImFwcCI6Im1sX3B1YmdfcGMifQ.stNg7upgrtrR4jTNOqAgbATOYxBxBQaqqN4Qq4WDhf4";
const BASE_URL = "https://api.pubg.com/shards/steam/players?filter[playerNames]=";

export const fetchPubgData = async (ign) => {
    // 1. Guard check for missing API Key
    if (!PUBG_API_KEY) {
        throw new Error("PUBG API key is not set in environment variables.");
    }

    const url = `${BASE_URL}${encodeURIComponent(ign)}`;

    try {
        // 2. Perform network request inside try block
        const response = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${PUBG_API_KEY}`,
                "Accept": "application/vnd.api+json"
            }
        });

        // 3. Handle non-2xx HTTP responses (e.g., 404 Player Not Found, 401 Unauthorized, 429 Rate Limit)
        if (!response.ok) {
            let errorMessage = `Failed to fetch PUBG data for player: ${ign}. Status: ${response.status}`;
            
            // Try reading API error details if available in response body
            try {
                const errorData = await response.json();
                if (errorData?.errors?.[0]?.detail) {
                    errorMessage += ` - ${errorData.errors[0].detail}`;
                }
            } catch (_) {
                // Ignore JSON parse error if response body isn't JSON
            }

            throw new Error(errorMessage);
        }

        // 4. Return parsed JSON data
        return await response.json();

    } catch (error) {
        // 5. Catch network dropouts, CORS issues, or thrown status errors
        console.error(`Error fetching PUBG data for "${ign}":`, error.message);
        throw error; // Re-throw so calling component can display UI error feedback
    }
};

