import mongoose from "mongoose";
import { TeamMember } from "../models/TeamMembers.js";
import { Profile } from "../models/Profile.js";


export const requireMembership = async (req, res, next) => {
    try {
        const { teamId } = req.params;

        if (!teamId || !mongoose.Types.ObjectId.isValid(teamId)) {
            return res.status(400).json({ message: "Invalid or missing team ID" });
        }

        // 1. Fetch only _id as a plain JS object using .select() and .lean()
        const profile = await Profile.findOne({ user: req.user.uid })
            .select("_id ign")
            .lean();

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        // 2. Fetch membership as a plain JS object using .lean()
        const membership = await TeamMember.findOne({
            team: teamId,
            user: profile._id,
        })
            .populate("team", "_id name owner")
            .lean();

        if (!membership) {
            return res.status(403).json({
                message: "Forbidden: you are not a member of this team"
            });
        }

        req.membership = membership;
        req.profile = profile;
        next();

    } catch (error) {
        console.error("Team membership error:", error);
        return res.status(500).json({ message: "Failed to verify team membership" });
    }
};