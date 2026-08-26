const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/requireAdmin');
const { requireTeamOwnership } = require('../middleware/requireTeamOwnership');
const {
	getTournaments,
	getTournamentById,
	createTournament,
	updateTournament,
	deleteTournament,
	getUpcomingTournaments
} = require('../controllers/tournamentsController');

const { getAcceptedRegistrationsForTournament,
	registerTeamForTournament,
	getRegistrationsForTournament,
	updateRegistrationStatus,
	withdrawTeamFromTournament
} = require('../controllers/tournamentRegistrationController');

const router = express.Router();

// Public Routes
router.get('/', getTournaments);
router.get('/upcoming', getUpcomingTournaments);
router.get('/:id', getTournamentById);
router.get('/:tournamentId/registrations', getAcceptedRegistrationsForTournament);

//private Routes
router.post('/', requireAuth, requireAdmin, createTournament);
router.put('/:id', requireAuth, requireAdmin, updateTournament);
router.delete('/:id', requireAuth, requireAdmin, deleteTournament);
router.post('/:tournamentId/register', requireAuth, requireTeamOwnership, registerTeamForTournament);

// Registration Routes
router.get('/:tournamentId/all-registrations', requireAuth, requireAdmin, getRegistrationsForTournament);
router.put('/registrations/:registrationId/status', requireAuth, requireAdmin, updateRegistrationStatus);
router.delete('/registrations/:registrationId', requireAuth, withdrawTeamFromTournament);

module.exports = router;