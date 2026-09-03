import mongoose from "mongoose";

const PlayerMatchResultSchema = new mongoose.Schema({
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Match",
        required: true
    },

    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament",
        required: true
    },

    stageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Stage",
        default: null
    },

    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        default: null
    },

    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },


    pubgId: {
        type: String,
        required: true
    },

    ign: {
        type: String,
        required: true
    },

    kills: { type: Number, default: 0 },
    headshotKills: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    longestKill: { type: Number, default: 0 },
    damageDealt: { type: Number, default: 0 },
    timeSurvived: { type: Number, default: 0 },
    distanceMoved: { type: Number, default: 0 },

}, {
    timestamps: true
});




PlayerMatchResultSchema.virtual("profile", {
    ref: "Profile",
    localField: "pubgId",
    foreignField: "pubgId",
    justOne: true,
});

// Enable virtuals in responses
PlayerMatchResultSchema.set("toJSON", { virtuals: true });
PlayerMatchResultSchema.set("toObject", { virtuals: true });


PlayerMatchResultSchema.index({
    matchId: 1,
    teamId: 1
}, {
    unique: true
});

PlayerMatchResultSchema.index({
    tournamentId: 1,
    stageId: 1,
    groupId: 1,
    teamId: 1
});

export const PlayerMatchResult = mongoose.model("PlayerMatchResult", PlayerMatchResultSchema);
