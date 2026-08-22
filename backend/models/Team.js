const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            maxlength: [50, "Team name cannot exceed 50 characters"],
        },

        teamTag: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: [2, "Team tag must be at least 2 characters long"],
            maxlength: [4, "Team tag cannot exceed 4 characters"],
            uppercase: true,
        },

        logo: {
            type: String,
            required: false,
        },

        country: {
            type: String,
            required: true,
            maxlength: [50, "Country name cannot exceed 50 characters"],
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },
        disbanded: {
            type: Boolean,
            default: false,
        },

        isOfficial: {
            type: Boolean,
            default: false,
        },
        banned: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Team = mongoose.model("Team", teamSchema);

module.exports = { Team };