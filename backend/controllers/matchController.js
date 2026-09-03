import 'dotenv/config';
import * as pubgService from '../services/pubg.service.js';
import { Match } from "../models/leaderboard/Match.js";

const getPubgHeaders = () => ({
    "Authorization": `Bearer ${process.env.PUBG_API_KEY}`,
    "Accept": "application/vnd.api+json"
});


export const getPlayerDataByName = async (req, res) => {
    try {
        const { playerName, index } = req.body;
        const response = await fetch(`https://api.pubg.com/shards/steam/players?filter[playerNames]=${playerName}`, {
            headers: getPubgHeaders()
        }); 
        
        if (!response.ok) {
            return res.status(response.status).json({ error: await response.json() });
        }

        const playerData = await response.json();
        const normalizedPlayerData = pubgService.normalizePlayerData(playerData, index || 0);
        const match = await Match.findOne({ matchId: normalizedPlayerData.matchId });
        normalizedPlayerData.alreadyExists = match;
        return res.json(normalizedPlayerData);

    } catch (error) {
        res.status(400).json({ message: error.message || error.error });
    }
};


export const getMatchDataById = async (req, res) => {
    try {
        const { matchId } = req.body;
        const response = await fetch(`https://api.pubg.com/shards/steam/matches/${matchId}`, {
            headers: getPubgHeaders()
        });
        
        if (!response.ok) {
            return res.status(response.status).json({ error: await response.json() });
        }

        const matchData = await response.json();
        normalizedMatchData = pubgService.normalizeMatchData(matchData);
        return res.json(normalizedMatchData);

    } catch (error) {
        res.status(400).json({ message: error.message || error.error });
    }
};
