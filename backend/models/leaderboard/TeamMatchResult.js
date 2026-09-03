import mongoose from "mongoose";

const TeamMatchResultSchema = new mongoose.Schema({
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
        required: true
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

    lobbyNumber: {
        type: Number,
        required: true
    },


    placement: { type: Number, default: 0 },
    wwdc: { type: Number, default: 0 },
    placementPoints: { type: Number, default: 0 },
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

TeamMatchResultSchema.index({
    matchId: 1,
    teamId: 1
}, {
    unique: true
});

TeamMatchResultSchema.index({
    tournamentId: 1,
    stageId: 1,
    groupId: 1,
    teamId: 1
});

export const TeamMatchResult = mongoose.model("TeamMatchResult", TeamMatchResultSchema);