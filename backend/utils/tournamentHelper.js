export const ensureTournamentNotEnded = (tournament) => {
    if (new Date() >= new Date(tournament.endDate)) {
        const error = new Error(
            "This tournament has ended and can no longer be modified."
        );

        error.statusCode = 403;

        throw error;
    }
};