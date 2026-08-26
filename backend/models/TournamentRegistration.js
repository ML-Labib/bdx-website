import mongoose from "mongoose";

const tournamentRegistrationSchema = new mongoose.Schema({
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

    status: {
        type: String,
        enum: [
            "PENDING",
            "APPROVED",
            "REJECTED",
            "WITHDRAWN"
        ],
        default: "PENDING"
    },

    reason: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});


tournamentRegistrationSchema.index(
    { tournamentId: 1, teamId: 1 },
    { unique: true }
);


export const TournamentRegistration = mongoose.model("TournamentRegistration", tournamentRegistrationSchema);

