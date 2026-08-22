const mongoose = require("mongoose");
const { Team } = require("../models/Team");
const { TeamMember } = require("../models/TeamMembers");

const Profile = require("../models/Profile");


exports.requireMembership = async (req, res, next) => {
    try {
        const teamId = req.params.teamId;

        if (!teamId) {
            return res.status(400).json({
                message: "Team ID is required"
            });
        }

        if (!mongoose.Types.ObjectId.isValid(teamId)) {
            return res.status(400).json({
                message: "Invalid team ID"
            });
        }

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
        const membership = await TeamMember.findOne({
            team: teamId,
            user: profile._id
        }).populate("team", "name owner");

        if (!membership) {
            return res.status(403).json({
                message: "Forbidden: you are not a member of this team"
            });
        }

        // Pass the verified team to the controller
        req.membership = membership;
        req.profile = profile;
        next();

    } catch (error) {
        console.error("Team membership error:", error);

        return res.status(500).json({
            message: "Failed to verify team membership"
        });
    }
};