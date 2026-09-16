import mongoose from "mongoose";

const MatchSchema = new mongoose.Schema(
    {
        tournamentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tournament",
            required: true,
            index: true,
        },

        stageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Stage",
            required: true,
            index: true,
        },

        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            default: null,
        },

        matchNumber: {
            type: Number,
            required: true,
        },
        globalMatchNumber: {
            type: Number,
            default: null,
        },
        
        mapName: {
            type: String,
            required: true,
        },

        gameMode: {
            type: String,
            required: true,
        },

        // PUBG's actual match ID
        matchId: {
            type: String,
        },


        status: {
            type: String,
            enum: ["SCHEDULED", "COMPLETED"],
            default: "SCHEDULED",
        },

        resultVerifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
            default: null,
        },

        hostIgn: {
            type: String,
            default: null,
        },

        scheduledAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

MatchSchema.index(
    {
        tournamentId: 1,
        stageId: 1,
        groupId: 1,
        matchNumber: 1,
    },
    {
        unique: true,
    }
);

// A PUBG match should only be used once.
MatchSchema.index(
    { matchId: 1 },
    {
        unique: true,
        partialFilterExpression: { matchId: { $type: "string" } },
    }
);

// Define the virtual relationship
MatchSchema.virtual("teamResults", {
    ref: "TeamMatchResult", // The model to populate
    localField: "_id",      // The field in the Match model
    foreignField: "matchId",// The field in the TeamMatchResult model
    justOne: false          // Set to false because one match has many team results
});

// Include virtuals in JSON responses
MatchSchema.set("toJSON", { virtuals: true });
MatchSchema.set("toObject", { virtuals: true });

export const Match = mongoose.model("Match", MatchSchema);