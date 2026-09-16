import mongoose from "mongoose";

const StageSchema = new mongoose.Schema({
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tournament",
        required: true
    },

    name: {
        type: String,
        required: true
    },

    order: {
        type: Number,
        required: true
    },

    hasGroups: {
        type: Boolean,
        default: false
    },

    
});

StageSchema.virtual("groups", {
    ref: "Group",
    localField: "_id",
    foreignField: "stageId",
    justOne: false
});

// Make virtuals appear in JSON responses
StageSchema.set("toJSON", {
    virtuals: true
});

StageSchema.set("toObject", {
    virtuals: true
});

StageSchema.index({
    tournamentId: 1,
    order: 1
});

export const Stage = mongoose.model("Stage", StageSchema);
