import { Tournament } from '../models/Tournament.js';
import { TournamentRegistration } from "../models/TournamentRegistration.js";
import { Team } from "../models/Team.js";

export const requireValidRegistration = async (req, res, next) => {
    try {
        const { registrationId } = req.params;
        if (!registrationId) {
            return res.status(400).json({ error: "Registration ID is required" });
        }
        const registration = await TournamentRegistration.findById(registrationId);
        if (!registration) {
            return res.status(404).json({ error: "Registration not found" });
        }


        const tournament = await Tournament.findById(registration.tournamentId);
        if (!tournament) {
            return res.status(404).json({ error: "Tournament not found" });
        }

        
        if(tournament.registrationEndDate && new Date() > tournament.registrationEndDate) {
            return res.status(400).json({ error: "Registration is closed" });
        }
        
        if(tournament.registrationStartDate && new Date() < tournament.registrationStartDate) {
            return res.status(400).json({ error: "Registration is not yet open" });
        }
        req.tournament = tournament;
        req.registration = registration;
        next();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};