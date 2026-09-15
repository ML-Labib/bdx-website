import { Group } from '../models/leaderboard/Group.js';
import { Stage } from '../models/leaderboard/Stage.js';
import { CompetitionParticipant } from '../models/leadeboard/CompetitionParticipant.js';

//get all groups for a stage
export const getGroupsByStage = async (req, res) => {
    const { stageId } = req.params;
    try {
        const stage = await Stage.findById(stageId);
        if (!stage) {
            return res.status(404).json({ message: "Stage not found" });
        }
        const groups = await Group.find({ stageId });
        res.status(200).json(groups);

    } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ message: error.message });
    }
};

//create new group
export const createGroup = async (req, res) => {
    const { tournamentId, stageId, name, order } = req.body;
    try {
        const stage = await Stage.findById(stageId);
        if (!stage) {
            return res.status(404).json({ message: "Stage not found" });
        }

        const existingGroup = await Group.findOne({ stageId, order });
        if (existingGroup) {
            return res.status(400).json({ message: "Group with this order already exists for the stage" });
        }

        const group = new Group({
            tournamentId,
            stageId,
            name,
            order
        });
        await group.save();
        res.status(201).json(group);
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: error.message });
    }
};

//update group
export const updateGroup = async (req, res) => {
    const { groupId } = req.params;
    const { name, order } = req.body;
    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }
        group.name = name;
        group.order = order;
        await group.save();
        res.status(200).json(group);
    } catch (error) {
        console.error("Error updating group:", error);
        res.status(500).json({ message: error.message });
    }
};

//delete group
export const deleteGroup = async (req, res) => {
    const { groupId } = req.params; 
    try {
        group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        existingParticipants = await CompetitionParticipant.find({ groupId });
        if (existingParticipants.length > 0) {
            return res.status(400).json({ message: "Cannot delete group with existing participants" });
        }

        await group.remove();
        res.status(200).json({ message: "Group deleted successfully" });
    } catch (error) {
        console.error("Error deleting group:", error);
        res.status(500).json({ message: error.message });
    }
};
