import { CompetitionParticipant } from '../models/leaderboard/CompetitionParticipant.js';
import { Tournament } from '../models/Tournament.js';
import { Team } from '../models/Team.js';
import { Stage } from '../models/leaderboard/Stage.js';
import { Group } from '../models/leaderboard/Group.js';

// Get all competition participants for a tournament
export const getCompetitionParticipantsByTournament = async (req, res) => {
    const { tournamentId, stageId } = req.params;
    const groupId = req.params.groupId || req.query.groupId;
    try {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        const filter = { tournamentId };
        if (stageId) { filter.stageId = stageId; }
        if (groupId) { filter.groupId = groupId; }
        const participants = await CompetitionParticipant.find(filter).populate('teamId', 'name teamTag logo country');
        res.status(200).json(participants);
    } catch (error) {
        console.error("Error fetching competition participants:", error);
        res.status(500).json({ message: error.message });
    }
};

// Add a new competition participant
export const addCompetitionParticipant = async (req, res) => {
    const { tournamentId, stageId, groupId, teamId, lobbyNumber } = req.body;
    try {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        const stage = await Stage.findById(stageId);
        if (!stage) {
            return res.status(404).json({ message: "Stage not found" });
        }

        // 1. Validate requirement based on stage configuration
        if (stage.hasGroups && !groupId) {
            return res.status(400).json({ message: "Group ID is required for stages with groups" });
        }

        // 2. Validate group ONLY if groupId is provided
        if (groupId) {
            const group = await Group.findById(groupId);
            if (!group) {
                return res.status(404).json({ message: "Group not found" });
            }
        }

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: "Team not found" });
        }

        // 3. Save participant with normalized groupId (defaults to null if missing)
        const participant = new CompetitionParticipant({
            tournamentId,
            stageId,
            groupId: groupId || null,
            teamId,
            lobbyNumber,
        });
        
        await participant.save();
        await participant.populate('teamId', 'name logo teamTag country');
        res.status(201).json(participant);
    } catch (error) {
        console.error("Error adding competition participant:", error);
        res.status(500).json({ message: error.message });
    }
};


// Remove a competition participant
export const removeCompetitionParticipant = async (req, res) => {
    const { participantId } = req.params;
    try {
        const participant = await CompetitionParticipant.findById(participantId);
        if (!participant) {
            return res.status(404).json({ message: "Competition participant not found" });
        }
        await participant.remove();
        res.status(200).json({ message: "Competition participant removed successfully" });
    } catch (error) {
        console.error("Error removing competition participant:", error);
        res.status(500).json({ message: error.message });
    }
};