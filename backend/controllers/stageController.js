import mongoose from 'mongoose';
import { Group } from '../models/leaderboard/Group.js';
import { Stage } from '../models/leaderboard/Stage.js';
import { Tournament } from '../models/Tournament.js';

// get all stages for a tournament
export const getStagesByTournament = async (req, res) => {
    const { tournamentId } = req.params;
    try {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }
        const stages = await Stage.find({ tournamentId }).sort({ order: 1 });
        res.status(200).json(stages);
    } catch (error) {
        console.error("Error fetching stages:", error);
        res.status(500).json({ message: error.message });
    }
};

// create new stage
export const createStage = async (req, res) => {
    const { tournamentId, name, order, hasGroups } = req.body;

    try {
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        const existingStage = await Stage.findOne({ tournamentId, order });
        if (existingStage) {
            return res.status(400).json({ message: "Stage with this order already exists for the tournament" });
        }

        const stage = new Stage({
            tournamentId,
            name,
            order,
            hasGroups
        });
        await stage.save();
        res.status(201).json(stage);
    } catch (error) {
        console.error("Error creating stage:", error);
        res.status(500).json({ message: error.message });
    }
};

// update stage
export const updateStage = async (req, res) => {
    const { stageId } = req.params;
    const { name, order, hasGroups } = req.body;

    try {
        const stage = await Stage.findById(stageId);
        if (!stage) {
            return res.status(404).json({ message: "Stage not found" });
        }

        stage.name = name;
        stage.order = order;
        stage.hasGroups = hasGroups;

        await stage.save();
        res.status(200).json(stage);
    } catch (error) {
        console.error("Error updating stage:", error);
        res.status(500).json({ message: error.message });
    }
};

// delete stage
export const deleteStage = async (req, res) => {
    const { stageId } = req.params;
    try {
        const stage = await Stage.findById(stageId);
        if (!stage) {
            return res.status(404).json({ message: "Stage not found" });
        }

        let groups = await Group.find({ stageId: stage._id });
        if (groups.length > 0) {
            return res.status(400).json({ message: "Cannot delete stage with associated groups" });
        }
        await stage.remove();
        res.status(200).json({ message: "Stage deleted successfully" });
    } catch (error) {
        console.error("Error deleting stage:", error);
        res.status(500).json({ message: error.message });
    }
};