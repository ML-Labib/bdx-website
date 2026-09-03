import { Team } from "../models/Team.js";
import { TeamMember } from "../models/TeamMembers.js";
import { sendNotification } from "../utils/notificationHelper.js";
import { Profile } from "../models/Profile.js";

const getProfileByUid = async (Uid) => {
    if (!Uid) {
        return null;
    }
    return Profile.findOne({ user: Uid });
};

// get All Teams
export const getAllTeams = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        const search = req.query.search;

        const query = { disbanded: { $ne: true } }; // Exclude banned profiles by default

        // Search
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { teamTag: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } }
            ];
        }

        const [teams, total] = await Promise.all([
            Team.find(query).skip(skip).limit(limit).lean(),
            Team.countDocuments(query)
        ]);
        res.status(200).json({
            teams,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//get all team members
export const getTeamInfo = async (req, res) => {
    try {
        const { teamId } = req.params;
        const team = await Team.findById(teamId);

        if (!team) {
            return res.status(404).json({ message: "Team not found." });
        }

        const members = await TeamMember.find({ team: teamId }).populate("user", "displayName ign pubgId picture");
        res.status(200).json({ team: team, members: members });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//get team by name
export const getTeamByName = async (req, res) => {
    try {
        const { name } = req.params;

        const team = await Team.findOne({ name });
        if (!team) {
            return res.status(404).json({ message: "Team not found." });
        }

        res.json(team);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 1. Get Team Details
export const getUserTeam = async (req, res) => {
    try {
        const profile = await getProfileByUid(req.user.uid);
        if (!profile) {
            return res.json({ team: null, members: [] });
        }

        const membership = await TeamMember.findOne({ user: profile._id });
        if (!membership) {
            return res.json({ team: null, members: [] });
        }

        // OPTIMIZATION: Fetch the team data and member data concurrently
        const [team, members] = await Promise.all([
            Team.findById(membership.team).populate("owner", "user displayName ign"),
            TeamMember.find({ team: membership.team }).populate("user", "displayName ign picture")
        ]);

        if (!team) {
            return res.status(404).json({ message: "Team not found." });
        }

        const formattedMembers = members.map((m) => ({
            user_id: m.user._id,
            displayName: m.user.displayName,
            ign: m.user.ign,
            picture: m.user.picture,
            role: m.role,
        }));

        res.json({
            team: {
                id: team._id,
                name: team.name,
                teamTag: team.teamTag,
                logo: team.logo,
                country: team.country,
                owner_id: team.owner.user,
                owner_name: team.owner.ign || team.owner.displayName,
            },
            members: formattedMembers,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Create Team
export const createTeam = async (req, res) => {
    try {
        const { name, teamTag, country, logo } = req.body;
        const newTeam = await Team.create({ name, teamTag, country, logo: logo || "", owner: req.profile._id });

        await TeamMember.create({
            team: newTeam._id,
            user: req.profile._id,
            role: "owner",
        });

        res.status(201).json(newTeam);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Team Logo
export const updateTeamLogo = async (req, res) => {
    try {
        const { logo } = req.body;
        req.team.logo = logo;
        await req.team.save();
        res.status(200).json(req.team);
    } catch (error) {
        console.error("Update team logo error:", error);
        res.status(500).json({
            message: "Failed to update team logo",
            error: error.message
        });
    }
};



// 4. Search Teams
export const searchTeams = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        const regex = new RegExp(query, "i");

        const teams = await Team.find({
            disbanded: { $ne: true },
            banned: { $ne: true },
            $or: [{ name: regex }, { teamTag: regex }],
        }).limit(10).lean();

        res.json(teams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. Add Player
export const addTeamMember = async (req, res) => {
    try {
        const { userId } = req.body;
        const { teamId } = req.params;

        const profile = await Profile.findById(userId);
        if (!profile) {
            return res.status(404).json({ message: "Player profile not found." });
        }

        const existingMember = await TeamMember.findOne({ user: profile._id });
        if (existingMember) {
            return res.status(400).json({ message: "Player already belongs to a team." });
        }

        const newMember = await TeamMember.create({ team: teamId, user: profile._id, role: req.body.role || "player" });
        res.status(201).json(newMember);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const removeTeamMember = async (req, res) => {
    try {
        const { memberId } = req.params;

        if (!memberId) {
            return res.status(400).json({ message: "Player ID is required." });
        }

        if (req.team.owner.toString() === memberId) {
            return res.status(400).json({ message: "Cannot remove the team owner." });
        }

        await TeamMember.findOneAndDelete({ team: req.team._id, user: memberId });

        await Promise.all([
            sendNotification(
                req.team.owner,
                `You have removed ${req.profile.ign} from your team.`,
                "user_left_team",
                "/my-activity?tab=team"
            ),
            sendNotification(
                memberId,
                `You have been removed from ${req.team.name} team.`,
                "user_left_team",
                "/my-activity?tab=team"
            )
        ]);

        res.json({ message: "Player removed from the team." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const leaveTeam = async (req, res) => {
    try {
        await TeamMember.findOneAndDelete({ team: req.membership.team._id, user: req.membership.user });

        await Promise.all([
            sendNotification(
                req.membership.team.owner,
                `${req.profile.ign} has left your team.`,
                "user_left_team",
                "/my-activity?tab=team"
            ),
            sendNotification(
                req.membership.user,
                `You have left ${req.membership.team.name} team.`,
                "user_left_team",
                "/my-activity?tab=team"
            )
        ]);

        res.json({ message: "You have left the team." });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Transfer Ownership
export const transferOwnership = async (req, res) => {
    try {
        const { newOwnerId } = req.body;
        if (!newOwnerId) {
            return res.status(400).json({
                message: "New owner ID is required."
            });
        }

        // Verify new owner profile exists
        const newOwnerProfile = await Profile.findById(newOwnerId);

        if (!newOwnerProfile) {
            return res.status(404).json({
                message: "New owner profile not found."
            });
        }

        // New owner must already be a member of this team
        const newOwnerMembership = await TeamMember.findOne({
            team: req.team._id,
            user: newOwnerProfile._id
        });

        if (!newOwnerMembership) {
            return res.status(400).json({
                message: "New owner must already be a team member."
            });
        }

        // Find current owner membership
        const currentOwnerMembership = await TeamMember.findOne({
            team: req.team._id,
            user: req.team.owner
        });

        if (!currentOwnerMembership) {
            return res.status(500).json({
                message: "Current owner membership is missing."
            });
        }

        // Update Team owner
        req.team.owner = newOwnerProfile._id;
        await req.team.save();

        // Update old owner role
        currentOwnerMembership.role = "player";
        await currentOwnerMembership.save();

        // Update new owner role
        newOwnerMembership.role = "owner";
        await newOwnerMembership.save();

        res.json({
            message: "Ownership transferred successfully."
        });

    } catch (error) {
        console.error("Transfer ownership error:", error);

        res.status(500).json({
            message: "Failed to transfer ownership",
            error: error.message
        });
    }
};

// Disband Team
export const disbandTeam = async (req, res) => {
    try {
        req.team.disbanded = true;

        await req.team.save();

        await TeamMember.deleteMany({
            team: req.team._id
        });

        res.json({
            message: "Team disbanded. Roster cleared, but team history is preserved."
        });

    } catch (error) {
        console.error("Disband team error:", error);

        res.status(500).json({
            message: "Failed to disband team",
            error: error.message
        });
    }
};

// get team member count
export const getTeamMemberCount = async (req, res) => {
    try {

        const count = await TeamMember.countDocuments({ 
            team: req.params.teamId, 
            role: { $ne: "manager" } 
        });

        return res.status(200).json({ count });
    } catch (error) {
        console.error("Error getting team member count:", error);
        return res.status(500).json({ error: "Failed to get team member count" });
    }
};