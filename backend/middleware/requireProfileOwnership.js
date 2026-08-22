const Profile = require("../models/Profile");

exports.requireProfileOwnership = async (req, res, next) => {
    try {
        if (!req.user?.uid) {
            return res.status(401).json({
                message: "Authentication required."
            });
        }


        const profile = await Profile.findOne({
            user: req.user.uid
        });

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found."
            });
        }

        req.profile = profile;

        next();

    } catch (error) {
        console.error("Profile ownership error:", error);

        return res.status(500).json({
            message: "Failed to verify profile ownership.",
            error: error.message
        });
    }
};