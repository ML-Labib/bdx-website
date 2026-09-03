import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { requireTeamOwnership } from '../middleware/requireTeamOwnership.js';
import { requireValidRegistration } from '../middleware/requireValidRegistration.js';
import { requireEditableTournament } from '../middleware/requireEditableTournament.js';
import { requireMembership } from '../middleware/requireMembership.js';
import * as TournamentRegistrationController from '../controllers/tournamentRegistrationController.js';
import * as tournamentController from '../controllers/tournamentsController.js';

const router = express.Router();
	
// Public Routes
router.get('/', tournamentController.getTournaments);
router.get('/upcoming', tournamentController.getUpcomingTournaments);
router.get('/:id', tournamentController.getTournamentById);
router.get('/:tournamentId/registrations', TournamentRegistrationController.getAcceptedRegistrationsForTournament);

//private Routes
// Registration Routes
router.get("/:tournamentId/team/:teamId/registration", requireAuth, requireMembership, TournamentRegistrationController.getTeamsRegistrations);
router.post('/:tournamentId/register', requireAuth, requireTeamOwnership, TournamentRegistrationController.registerTeamForTournament);
router.put('/registrations/:tournamentId/:registrationId', requireAuth, requireTeamOwnership, requireValidRegistration, TournamentRegistrationController.withdrawTeamFromTournament);

// Admin Routes for Roster Management
router.get('/:tournamentId/all-registrations', requireAuth, requireAdmin, TournamentRegistrationController.getRegistrationsForTournament);
router.post('/', requireAuth, requireAdmin, tournamentController.createTournament);
router.put('/:id', requireAuth, requireAdmin, tournamentController.updateTournament);
router.delete('/:id', requireAuth, requireAdmin, tournamentController.deleteTournament);
router.put('/registrations/:tournamentId/:registrationId/status', requireAuth, requireAdmin, requireEditableTournament, TournamentRegistrationController.updateRegistrationStatus);
router.post(
    '/:tournamentId/registrations/:registrationId/lock-roster', 
    requireAuth,
	requireAdmin,
    requireEditableTournament, 
    TournamentRegistrationController.lockRoster
);
router.delete(
    '/:tournamentId/registrations/:registrationId/unlock-roster', 
    requireAuth, 
	requireAdmin,
    requireEditableTournament, 
    TournamentRegistrationController.unlockRoster
);

router.get(
    '/:tournamentId/registrations/:registrationId/roster', 
    requireAuth, 
	requireAdmin,
    TournamentRegistrationController.viewLockedRoster
);

export default router;