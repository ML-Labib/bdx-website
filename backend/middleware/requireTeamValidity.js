const Profile = require("../models/Profile");
const { Team } = require("../models/Team");
const { TeamMember } = require("../models/TeamMembers");
const { Invitation } = require("../models/Invitation");

exports.requireTeamValidity = async (req, res, next) => {
    try {
        const { name, teamTag } = req.body;
        // Get the MongoDB Profile belonging to the authenticated Firebase user
        const profile = await Profile.findOne({ user: req.user.uid });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        const existingTeam = await Team.findOne({ name });
        if (existingTeam) return res.status(400).json({ message: "Team name already taken." });
        
        const existingTeamTag = await Team.findOne({ teamTag });
        if (existingTeamTag) return res.status(400).json({ message: "Team tag already taken." });


        const existingMembership = await TeamMember.findOne({ user: profile._id });
        if (existingMembership) return res.status(400).json({ message: "You are already in a team." });

        const existingInvitation = await Invitation.findOne({ receiver: profile._id, status: "pending" });
        if (existingInvitation) return res.status(400).json({ message: "You have a pending invitation. Please respond to it before creating a new team." });

        req.profile = profile;
        next();

    } catch (error) {
        console.error("Team validity error:", error);

        return res.status(500).json({
            message: "Failed to verify team validity"
        });
    }
};