import mongoose from "mongoose";

const tournamentRegistrationSchema = new mongoose.Schema({
    tournamentId: {
        type: Schema.Types.ObjectId,
        ref: "Tournament",
        required: true
    },

    teamId: {
        type: Schema.Types.ObjectId,
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

    rejectionReason: String
}, {
    timestamps: true
});


tournamentRegistrationSchema.index(
    { tournamentId: 1, teamId: 1 },
    { unique: true }
);


const TournamentRegistration = mongoose.model("TournamentRegistration", tournamentRegistrationSchema);

module.exports = { TournamentRegistration };