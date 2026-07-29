const mongoose = require("mongoose");

const TournamentSchema = new mongoose.Schema(
    {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    registrationStartDate: { type: Date, required: true },
    registrationEndDate: { type: Date, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    logo: { type: String, required: false },
    prize: { type: String, required: true, trim: true },
    participatingRegion: { type: String, required: true, trim: true },
    eventPlace: {type: String, required: true},
    totalTeams: { type: Number, required: true },
    gameMode: { type: String, required: true, trim: true },
    matchTime: { type: String, required: true, trim: true },
    entryFee: { type: String, required: true, trim: true },
    rosterLocked: { type: Boolean, default: false }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Tournament", TournamentSchema);