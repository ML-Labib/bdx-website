const mongoose = require("mongoose");

const TournamentSchema = new mongoose.Schema(
    {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    registrationStartDate: { type: Date, required: true },
    registrationEndDate: { type: Date, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    logo: { type: String, required: false },
    prize: { type: String, required: true, trim: true },
    participatingRegion: { type: String, required: true, trim: true },
    tier: {type: String, enum: ['A', 'B', 'C', 'D'], required: true},
    totalTeams: { type: Number, required: true },
    mode: { type: String, required: true, enum: ['TPP', 'FPP'] },
    format: { type: String, required: true, trim: true, enum: ['Solo', 'Duo', 'Squad'] },
    matchTime: { type: String, required: true, trim: true },
    entryFee: { type: String, required: true, trim: true },
    rosterLocked: { type: Boolean, default: false }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Tournament", TournamentSchema);