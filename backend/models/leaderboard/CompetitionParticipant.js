import mongoose from "mongoose";

const CompetitionParticipantSchema = new mongoose.Schema({
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament",
        required: true
    },

    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
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

    lobbyNumber: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: [
            "ACTIVE",
            "QUALIFIED",
            "ELIMINATED",
            "DISQUALIFIED",
            "WITHDRAWN"
        ],
        default: "ACTIVE"
    },

    qualification: {
        sourceParticipantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CompetitionParticipant"
        },

        sourceStageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Stage"
        },

        sourceGroupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group"
        },

        sourceRank: Number,

        qualificationType: {
            type: String,
            enum: [
                "DIRECT",
                "QUALIFIED",
                "MANUAL",
                "REPLACEMENT"
            ]
        },

        reason: String
    },
    

}, {
    timestamps: true
});

CompetitionParticipantSchema.index({
    tournamentId: 1,
    stageId: 1,
    teamId: 1,
}, {
    unique: true
});



export const CompetitionParticipant = mongoose.model("CompetitionParticipant", CompetitionParticipantSchema);