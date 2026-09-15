import "dotenv/config";

export const getPubgHeaders = () => ({
    Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
    Accept: "application/vnd.api+json",
});