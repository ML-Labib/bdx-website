import mongoose from "mongoose";
import { Profile } from "../models/Profile.js";
import { Team } from "../models/Team.js";

export const requireTeamOwnership = async (req, res, next) => {
    try {
        // const teamId = req.params.teamId;

        // if (!teamId) {
        //     return res.status(400).json({
        //         message: "Team ID is required"
        //     });
        // }

        // if (!mongoose.Types.ObjectId.isValid(teamId)) {
        //     return res.status(400).json({
        //         message: "Invalid team ID"
        //     });
        // }

        // Get the MongoDB Profile belonging to the
        // authenticated Firebase user
        const profile = await Profile.findOne({
            user: req.user.uid
        });

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        // Find the team AND verify ownership
        const team = await Team.findOne({
            owner: profile._id,
            disbanded: false
        });

        if (!team) {
            return res.status(403).json({
                message: "Forbidden: you do not own this team"
            });
        }

        // Pass the verified team to the controller
        req.profile = profile;
        req.team = team;
        next();

    } catch (error) {
        console.error("Team ownership error:", error);

        return res.status(500).json({
            message: "Failed to verify team ownership"
        });
    }
};