import { Tournament } from '../models/Tournament.js';


export const requireEditableTournament = async (
    req,
    res,
    next
) => {
    try {

        const tournament =
            await Tournament.findById(
                req.params.tournamentId
            );

        if (!tournament) {
            return res.status(404).json({
                message: "Tournament not found"
            });
        }

        if ( new Date() >=  new Date(tournament.endDate)
        ) {
            return res.status(403).json({
                message: "Tournament has ended and can no longer be modified."
            });
        }

        req.tournament = tournament;

        next();

    } catch (error) {
        return res.status(500).json({
            message: "Failed to verify tournament editability.",
            error: error.message
        });
    }
};