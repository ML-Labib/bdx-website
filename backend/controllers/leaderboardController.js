import { Tournament } from '../models/Tournament.js';
import { TeamMatchResult } from "../models/leaderboard/TeamMatchResult.js";
import { PlayerMatchResult } from "../models/leaderboard/PlayerMatchResult.js";
import { Stage } from "../models/leaderboard/Stage.js";
import { Group } from "../models/leaderboard/Group.js";
import { CompetitionParticipant } from "../models/leaderboard/CompetitionParticipant.js";

import 'dotenv/config';

const getPubgHeaders = () => ({
    "Authorization": `Bearer ${process.env.PUBG_API_KEY}`,
    "Accept": "application/vnd.api+json"
});


// get all stages for a tournament
export const getStagesByTournamentId = async (req, res) => {
    try { 
        const { tournamentId } = req.params;

        const stages = await Stage.find({ tournamentId });

        res.json(stages);
    } catch (error) {
        res.status(400).json({ message: error.message || error.error });
    }
};

// create stage
export const createStage = async (req, res) => {
    try {
        const { tournamentId, name, order, hasGroup } = req.body;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        const stage = new Stage({ tournamentId, name, order, hasGroup });
        await stage.save();
        res.status(201).json(stage);

    } catch (error) {
        res.status(400).json({ message: error.message || error.error
         });
    }
};

// update stage
export const updateStage = async (req, res) => {
    try {
        const { stageId } = req.params;
        const { name, order, hasGroup } = req.body;

        const stage = await Stage.findByIdAndUpdate(stageId, { name, order, hasGroup }, { new: true });
        if (!stage) {
            return res.status(404).json({ message: "Stage not found" });
        }
        res.json(stage);
    } catch (error) {
        res.status(400).json({ message: error.message || error.error });
    }
};


// delete stage
export const deleteStage = async (req, res) => {
    try {
        const { stageId } = req.params;

        const groups = await Group.find({ stageId });

        if (groups.length > 0) {
            return res.status(400).json({ message: "Cannot delete stage with existing groups" });
        }

        const stage = await Stage.findByIdAndDelete(stageId);
        if (!stage) {
            return res.status(404).json({ message: "Stage not found" });
        }
        res.status(200).json({ message: "Stage deleted successfully" });

    } catch (error) {
        res.status(400).json({ message: error.message || error.error });
    }
};

// get all groups for a stage
export const getGroups = async (req, res) => {
    try {
        const { tournamentId, stageId } = req.params;

        const groups = await Group.find({ tournamentId, stageId });
        res.json(groups);

    } catch (error) {
        res.status(400).json({ message: error.message || error.error });
    }
};

// create group
export const createGroup = async (req, res) => {
    try {
        const { tournamentId, stageId, name, order} = req.body;

        const stage = await Stage.findById(stageId);
        if (!stage) {
            return res.status(404).json({ message: "Stage not found" });
        }

        const group = new Group({ tournamentId, stageId, name, order });
        await group.save();
        res.status(201).json(group);
    } catch (error) {
        res.status(400).json({ message: error.message || error.error });
    }
};

// update group
export const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { name, order } = req.body;

        const group = await Group.findByIdAndUpdate(groupId, { name, order }, { new: true });
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        res.status(200).json(group);
    } catch (error) {
        res.status(400).json({ message: error.message || error.error });
    }
};


// delete group
export const deleteGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findByIdAndDelete(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        res.status(200).json({ message: "Group deleted successfully" });
    } catch (error) {
        res.status(400).json({ message: error.message || error.error });
    }
};



// create match
export const createMatch = async (req, res) => {
    try {
        const { tournamentId, stageId, groupId, matchNumber, scheduledAt } = req.body;
        const match = new Match({ tournamentId, stageId, groupId, matchNumber, scheduledAt });
        await match.save();
        res.status(201).json(match);
    } catch (error) {
        res.status(400).json({ message: error.message || error.error });
    }
};
