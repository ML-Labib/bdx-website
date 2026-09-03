import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema({
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

    matchNumber: {
        type: Number,
        required: true
    },


    mapName: {
        type: String,
        required: true
    },

    gameMode: {
        type: String,
        required: true
    },


    globalMatchNumber: Number,

    matchId: String,

    status: {
        type: String,
        enum: [
            "SCHEDULED",
            "COMPLETED",
        ],
        default: "SCHEDULED"
    },

    resultVerifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        default: null
    },

    hostIgn: {
        type: String,
        default: null
    },

    scheduledAt: Date,

}, {
    timestamps: true
});

MatchSchema.index({
    tournamentId: 1,
    stageId: 1,
    groupId: 1,
    matchNumber: 1
}, {
    unique: true
});

export const Match = mongoose.model("Match", MatchSchema);