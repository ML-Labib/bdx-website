import mongoose from "mongoose";


const tournamentRosterMemberSchema = new mongoose.Schema({
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

    playerId: {
        type: Schema.Types.ObjectId,
        ref: "Player",
        required: true
    },

    pubgId: {
        type: String,
        required: true
    },

}, {
    timestamps: true
});


tournamentRosterMemberSchema.index({
    tournamentId: 1,
    teamId: 1
});

tournamentRosterMemberSchema.index({
    tournamentId: 1,
    pubgId: 1
});

const TournamentRosterMember = mongoose.model("TournamentRosterMember", tournamentRosterMemberSchema);

module.exports = { TournamentRosterMember };