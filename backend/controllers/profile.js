const Profile = require('../models/Profile');


// Get profile by Firebase user id
exports.getProfileByUserId = async (req, res) => {
    try {
        const firebaseUserId = req.params.userId || req.body.uid || req.query.userId;

        if (!firebaseUserId) {
            return res.status(400).json({ message: 'Firebase user ID is required' });
        }

        const profile = await Profile.findOne({ user: firebaseUserId });

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
    const { uid, user, displayName, ign, discordUsername, pubgId, picture, country } = req.body;
    const firebaseUserId = uid || user;

    if (!firebaseUserId) {
        return res.status(400).json({ message: 'Firebase user ID is required' });
    }

    try {
        const existingPubgProfile = await Profile.findOne({ pubgId });
        if (existingPubgProfile) {
            return res.status(409).json({ message: 'PUBG ID has already been registered' });
        }

        const profile = new Profile({
            user: firebaseUserId,
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
    const { uid, user, displayName, ign, discordUsername, pubgId, picture, country } = req.body;
    const firebaseUserId = req.params.userId || uid || user;

    if (!firebaseUserId) {
        return res.status(400).json({ message: 'Firebase user ID is required' });
    }

    try {
        if (pubgId) {
            const existingPubgProfile = await Profile.findOne({ pubgId, user: { $ne: firebaseUserId } });
            if (existingPubgProfile) {
                return res.status(409).json({ message: 'PUBG ID has already been registered' });
            }
        }

        const updatedProfile = await Profile.findOneAndUpdate(
            { user: firebaseUserId },
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
            {  returnDocument: 'after', runValidators: true }
        );

        if (!updatedProfile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(updatedProfile);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};