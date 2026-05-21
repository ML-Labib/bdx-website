const express = require('express');
const {
  getRegistrations,
  getRegistrationById,
  createRegistration,
  updateRegistration,
  deleteRegistration,
  getRegistrationsByTournament,
  getRegistrationsByTeam
} = require('../controllers/registrations');

const router = express.Router();

// Routes
router.get('/', getRegistrations);
router.get('/:id', getRegistrationById);
router.get('/tournament/:tournamentId', getRegistrationsByTournament);
router.get('/team/:teamId', getRegistrationsByTeam);
router.post('/', createRegistration);
router.put('/:id', updateRegistration);
router.delete('/:id', deleteRegistration);

module.exports = router;