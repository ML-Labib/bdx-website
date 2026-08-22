const Profile = require('../models/Profile');
const { TeamMember } = require('../models/TeamMembers');

exports.getAllProfiles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        const filter = req.query.filter;
        const search = req.query.search;

        const query = { banned: false }; // Exclude banned profiles by default

        // Search
        if (search) {
            query.$or = [
                { ign: { $regex: search, $options: "i" } },
                { displayName: { $regex: search, $options: "i" } },
                { country: { $regex: search, $options: "i" } }
            ];
        }

        // Team filter
        if (filter === "has_team") {
            const teamMembers = await TeamMember
                .find()
                .distinct("user");

            query._id = { $in: teamMembers };
        }

        if (filter === "no_team") {
            const teamMembers = await TeamMember
                .find()
                .distinct("user");

            query._id = { $nin: teamMembers };
        }

        const [profiles, total] = await Promise.all([
            Profile.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: "membership",
                    populate: {
                        path: "team",
                        select: "name logo country"
                    }
                }),

            Profile.countDocuments(query)
        ]);

        const formattedProfiles = profiles.map((profile) => {
            const membership = profile.membership;
            const team = membership?.team;

            return {
                ...profile.toObject(),

                team: team
                    ? {
                        _id: team._id,
                        name: team.name,
                        logo: team.logo,
                        country: team.country
                    }
                    : null,

                teamName: team?.name || null,
                teamLogo: team?.logo || null
            };
        });

        res.status(200).json({
            profiles: formattedProfiles,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error("Error in getAllProfiles:", error);

        res.status(500).json({
            message: "Failed to fetch profiles",
            error: error.message
        });
    }
};

// Get profile by Firebase user id
exports.getProfileByUserId = async (req, res) => {
    try {
        // const uid = req.params.userId || req.body.uid || req.query.userId;
        const uid = req.user?.uid;

        if (!uid) {
            return res.status(400).json({ message: 'Firebase user ID is required' });
        }

        const profile = await Profile.findOne({ user: uid });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get profile by pubg id
exports.getProfileByPubgId = async (req, res) => {
    try {
        const pubgId = req.params.pubgId || req.body.pubgId;

        if (!pubgId) {
            return res.status(400).json({ message: 'PUBG ID is required' });
        }

        const profile = await Profile.findOne({ pubgId: pubgId });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Create profile
exports.createProfile = async (req, res) => {
    const { displayName, ign, discordUsername, pubgId, picture, country } = req.body;
    const uid = req.user?.uid;

    if (!uid) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const existingPubgProfile = await Profile.findOne({ pubgId });
        if (existingPubgProfile) {
            return res.status(409).json({ message: 'PUBG ID has already been registered' });
        }

        const profile = new Profile({
            user: uid,
            displayName,
            ign,
            discordUsername,
            pubgId,
            picture,
            country
        });

        await profile.save();
        res.status(201).json(profile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    const { displayName, ign, discordUsername, pubgId, picture, country } = req.body;
    const uid = req.user?.uid;

    if (!uid) {
        return res.status(400).json({ message: 'Firebase user ID is required' });
    }

    try {
        if (pubgId) {
            const existingPubgProfile = await Profile.findOne({ pubgId, user: { $ne: uid } });
            if (existingPubgProfile) {
                return res.status(409).json({ message: 'PUBG ID has already been registered' });
            }
        }

        const updatedProfile = await Profile.findOneAndUpdate(
            { user: uid },
            {
                $set: {
                    ...(displayName !== undefined && { displayName }),
                    ...(ign !== undefined && { ign }),
                    ...(discordUsername !== undefined && { discordUsername }),
                    ...(pubgId !== undefined && { pubgId }),
                    ...(picture !== undefined && { picture }),
                    ...(country !== undefined && { country })
                }
            },
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(updatedProfile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.searchPlayers = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query?.trim()) {
            return res.json([]);
        }

        const regex = new RegExp(query.trim(), "i");

        const players = await Profile.find({
            banned: { $ne: true },
            $or: [
                { ign: regex },
                { displayName: regex }
            ]
        })
        .lean();

        const results = await Promise.all(
            players.map(async (player) => {
                const membership = await TeamMember.findOne({
                    user: player._id
                })
                    .populate("team", "name logo")
                    .lean();

                return {
                    user: player._id,
                    ign: player.ign,
                    displayName: player.displayName,
                    picture: player.picture,
                    currentTeam: membership?.team?.name || null,
                    currentTeamLogo: membership?.team?.logo || null
                };
            })
        );

        res.json(results);

    } catch (error) {
        console.error("Search players error:", error);

        res.status(500).json({
            message: "Failed to search players",
            error: error.message
        });
    }
};