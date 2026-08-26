import { TournamentRegistration } from "../models/TournamentRegistration.js";


// Register a team for a tournament
export const registerTeamForTournament = async (req, res) => {
    try {
        const { tournamentId } = req.body;
        const registration = new TournamentRegistration({ tournamentId, teamId: req.team._id });
        await registration.save();
        res.status(201).json(registration);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all registrations for a tournament
export const getRegistrationsForTournament = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        if (!tournamentId) {
            return res.status(400).json({ error: "Tournament ID is required" });
        }
        const registrations = await TournamentRegistration.find({ tournamentId }).populate('teamId', 'name logo teamTag country'); // Populate team name
        if (!registrations) {
            return res.status(404).json({ error: "No registrations found for this tournament" });
        }
        res.status(200).json(registrations);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

//get accpeted registrations for a tournament
export const getAcceptedRegistrationsForTournament = async (req, res) => {
    try {
        const { tournamentId } = req.params;
        if (!tournamentId) {
            return res.status(400).json({ error: "Tournament ID is required" });
        }

        const registrations = await TournamentRegistration.find({ tournamentId, status: 'APPROVED' }).populate('teamId', 'name logo teamTag country');
        if (!registrations) {
            return res.status(404).json({ error: "No accepted registrations found for this tournament" });
        }
        res.status(200).json(registrations);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update registration status
export const updateRegistrationStatus = async (req, res) => {
    try {
        const { registrationId } = req.params;
        const { status, reason } = req.body;
        const registration = await TournamentRegistration.findByIdAndUpdate(
            registrationId,
            { status, reason },
            { new: true }
        );
        res.status(200).json(registration);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Withdraw a team from a tournament
export const withdrawTeamFromTournament = async (req, res) => {
    try {
        const { registrationId } = req.params;
        const registration = await TournamentRegistration.findByIdAndUpdate(
            registrationId,
            { status: 'withdrawn', reason: req.body.reason || null },
            { new: true }
        );
        res.status(200).json(registration);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};