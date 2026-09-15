import 'dotenv/config';
import mongoose from "mongoose";
import { Match } from "../models/leaderboard/Match.js";
import { Profile } from "../models/Profile.js";
import { Tournament } from "../models/Tournament.js";
import { Stage } from "../models/leaderboard/Stage.js";
import { CompetitionParticipant } from "../models/leaderboard/CompetitionParticipant.js";
import { TeamMatchResult } from "../models/leaderboard/TeamMatchResult.js";
import { PlayerMatchResult } from "../models/leaderboard/PlayerMatchResult.js";
import { normalizeMatchData } from "../services/pubg.service.js";

export const getMatchPreview = async (req, res) => {
    const { hostIgn, index } = req.params;

    if (!hostIgn) {
        return res.status(400).json({ message: "PUBG player name is required" });
    }

    const matchIndex = Number(index);
    if (!Number.isInteger(matchIndex) || matchIndex < 0) {
        return res.status(400).json({ message: "Match index must be a non-negative integer" });
    }

    try {
        const headers = {
            Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
            Accept: "application/vnd.api+json",
        };
        const playerResponse = await fetch(
            `https://api.pubg.com/shards/steam/players?filter[playerNames]=${encodeURIComponent(hostIgn)}`,
            { headers }
        );

        if (!playerResponse.ok) {
            return res.status(playerResponse.status).json({ message: "PUBG player not found" });
        }

        const playerData = await playerResponse.json();
        const matches = playerData.data?.[0]?.relationships?.matches?.data || [];
        const selectedMatch = matches[matchIndex];
        if (!selectedMatch?.id) {
            return res.status(404).json({ message: "PUBG match not found for this player and index" });
        }

        const matchResponse = await fetch(
            `https://api.pubg.com/shards/steam/matches/${selectedMatch.id}`,
            { headers }
        );
        if (!matchResponse.ok) {
            return res.status(matchResponse.status).json({ message: "Unable to fetch PUBG match data" });
        }

        const matchData = await matchResponse.json();
        return res.json(normalizeMatchData(matchData));
    } catch (error) {
        return res.status(500).json({ message: error.message || "Unable to preview PUBG match data" });
    }
};

export const saveMatchData = async (req, res) => {
    const {
        matchId,          // Mongoose ObjectId of the Match document
        tournamentId,     // Mongoose ObjectId of the Tournament document
        stageId,          // Mongoose ObjectId of the Stage document
        groupId,          // Mongoose ObjectId or null
        pubgMatchId,      // String ID from the PUBG API
        mapName,
        gameMode,
        status,
        hostIgn,
        teamResults = [],
        playerResults = [],
    } = req.body;

    const normalizedGroupId = groupId || null;

    // 1. Basic Payload Validation
    if (!matchId || !tournamentId || !stageId || !pubgMatchId) {
        return res.status(400).json({
            message: "matchId, tournamentId, stageId, and pubgMatchId are required",
        });
    }

    if (!Array.isArray(teamResults) || teamResults.length === 0) {
        return res.status(400).json({
            message: "At least one team result is required",
        });
    }

    if (
        !mongoose.isValidObjectId(matchId) ||
        !mongoose.isValidObjectId(tournamentId) ||
        !mongoose.isValidObjectId(stageId)
    ) {
        return res.status(400).json({ message: "Invalid ObjectIDs provided" });
    }

    try {
        // 2. Fetch target match and stage records
        const [match, stage] = await Promise.all([
            Match.findById(matchId),
            Stage.findById(stageId),
        ]);

        if (!match) return res.status(404).json({ message: "Match not found" });
        if (!stage) return res.status(404).json({ message: "Stage not found" });

        // 3. Status and Metadata Validation for Completed Matches
        if (match.status === "COMPLETED") {
            const isMapMatching = match.mapName?.trim().toLowerCase() === mapName?.trim().toLowerCase();
            const isGameModeMatching = match.gameMode?.trim().toLowerCase() === gameMode?.trim().toLowerCase();

            if (!isMapMatching || !isGameModeMatching) {
                return res.status(400).json({
                    message: `Cannot update completed match results with conflicting map or game mode. Expected map: "${match.mapName}", mode: "${match.gameMode}". Received map: "${mapName}", mode: "${gameMode}".`,
                });
            }
        }

        // 4. Scope and Belonging Validation
        const sameGroup = (match.groupId?.toString() || null) === normalizedGroupId;
        if (
            match.tournamentId.toString() !== tournamentId ||
            match.stageId.toString() !== stageId ||
            !sameGroup ||
            stage.tournamentId.toString() !== tournamentId
        ) {
            return res.status(400).json({
                message: "Match does not match the provided tournament, stage, or group",
            });
        }

        if (stage.hasGroups && !normalizedGroupId) {
            return res.status(400).json({ message: "Group ID is required for this stage" });
        }

        // 5. Ensure PUBG Match ID hasn't been used elsewhere
        const existingMatchWithPubgId = await Match.findOne({
            matchId: pubgMatchId,
            _id: { $ne: matchId },
        });

        if (existingMatchWithPubgId) {
            return res.status(409).json({
                message: `PUBG Match ID ${pubgMatchId} has already been recorded for another match.`,
            });
        }

        // 6. Admin Profile Check
        const adminProfile = await Profile.findOne({ user: req.user.uid });
        if (!adminProfile) {
            return res.status(404).json({ message: "Admin profile not found" });
        }

        // 7. Fetch Competition Participants
        const participantFilter = {
            tournamentId,
            stageId,
            groupId: normalizedGroupId,
        };

        const participants = await CompetitionParticipant.find(participantFilter).lean();

        const participantByLobby = new Map();
        for (const p of participants) {
            const key = Number(p.lobbyNumber);
            participantByLobby.set(key, p);
        }

        // 8. Transform Team Documents
        const teamDocuments = teamResults.map((result) => {
            const lobbyNum = Number(result.lobbyNumber);
            const participant = participantByLobby.get(lobbyNum);

            return {
                matchId,
                tournamentId,
                stageId,
                groupId: normalizedGroupId,
                teamId: participant?.teamId || null,
                lobbyNumber: lobbyNum,
                placement: result.placement ?? 0,
                wwdc: result.wwdc ?? 0,
                placementPoints: result.placementPoints ?? 0,
                kills: result.kills ?? 0,
                headshotKills: result.headshotKills ?? 0,
                totalPoints: result.totalPoints ?? 0,
                assists: result.assists ?? 0,
                longestKill: result.longestKill ?? 0,
                damageDealt: result.damageDealt ?? 0,
                timeSurvived: result.timeSurvived ?? 0,
                distanceMoved: result.distanceMoved ?? 0,
            };
        });

        // 9. Transform Player Documents
        const playerDocuments = playerResults.map((result) => {
            const lobbyNum = Number(result.lobbyNumber);
            const participant = participantByLobby.get(lobbyNum);

            return {
                matchId,
                tournamentId,
                stageId,
                groupId: normalizedGroupId,
                teamId: participant?.teamId || null,
                pubgId: result.pubgId,
                ign: result.ign,
                kills: result.kills ?? 0,
                headshotKills: result.headshotKills ?? 0,
                totalPoints: result.totalPoints ?? 0,
                assists: result.assists ?? 0,
                longestKill: result.longestKill ?? 0,
                damageDealt: result.damageDealt ?? 0,
                timeSurvived: result.timeSurvived ?? 0,
                distanceMoved: result.distanceMoved ?? 0,
            };
        });

        // 10. Atomic Transaction Execution
        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                await Match.updateOne(
                    { _id: matchId },
                    {
                        $set: {
                            matchId: pubgMatchId,
                            mapName,
                            gameMode,
                            status: status || "COMPLETED",
                            hostIgn,
                            resultVerifiedBy: adminProfile._id,
                        },
                    },
                    { session }
                );

                await TeamMatchResult.deleteMany({ matchId }, { session });
                await PlayerMatchResult.deleteMany({ matchId }, { session });

                await TeamMatchResult.insertMany(teamDocuments, { session });
                if (playerDocuments.length > 0) {
                    await PlayerMatchResult.insertMany(playerDocuments, { session });
                }
            });
        } finally {
            await session.endSession();
        }

        return res.status(200).json({ message: "Match data and results saved successfully" });
    } catch (error) {
        console.error("Error saving match data:", error);
        return res.status(500).json({ message: error.message || "Failed to save match data" });
    }
};


//create a new match
export const createMatch = async (req, res) => {
    const { tournamentId, stageId, groupId, matchNumber, globalMatchNumber, mapName, gameMode, matchDateTime } = req.body;
    try {

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        const stage = await Stage.findById(stageId);
        if (!stage) {
            return res.status(404).json({ message: "Stage not found" });
        }
        if (stage.hasGroups && !groupId) {
            return res.status(400).json({ message: "Group ID is required for stages with groups" });
        }

        const match = new Match({
            tournamentId,
            stageId,
            groupId: groupId || null,
            matchNumber,
            globalMatchNumber,
            mapName,
            gameMode,
            scheduledAt: matchDateTime
        });
        await match.save();

        return res.status(201).json({ message: "Match created successfully", match });
    } catch (error) {
        return res.status(500).json({ message: error.message || error.error });
    }
};


export const getMatches = async (req, res) => {
    try {
        const { tournamentId, stageId, groupId } = req.query;
        const filter = { tournamentId, stageId };
        if (groupId) {
            filter.groupId = groupId;
        }
        const matches = await Match.find(filter).sort({ matchNumber: 1, globalMatchNumber: 1 });
        res.json(matches);
    } catch (error) {
        res.status(400).json({ message: error.message || error.error });
    }
};
