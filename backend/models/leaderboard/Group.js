import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema({
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

    name: {
        type: String,
        required: true
    },

    order: {
        type: Number,
        default: 0
    },


});
GroupSchema.index({
    stageId: 1,
    order: 1
});

export const Group = mongoose.model("Group", GroupSchema);