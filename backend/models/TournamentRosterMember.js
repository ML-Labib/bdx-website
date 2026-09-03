import mongoose from "mongoose";


const tournamentRosterMemberSchema = new mongoose.Schema({
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

    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
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

    rosterVersion: {
        type: Number,
        default: 0
    },
    rosterLockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        default: null
    }
    

}, {
    timestamps: true
});


tournamentRosterMemberSchema.index({
    tournamentId: 1,
    teamId: 1,
    rosterVersion: 1
});

tournamentRosterMemberSchema.index({
    tournamentId: 1,
    pubgId: 1,
    rosterVersion: 1
});

export const TournamentRosterMember = mongoose.model("TournamentRosterMember", tournamentRosterMemberSchema);

