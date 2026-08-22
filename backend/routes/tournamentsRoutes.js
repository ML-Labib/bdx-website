const express = require('express');
const {
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  getUpcomingTournaments
} = require('../controllers/tournamentsController');

const router = express.Router();

// Routes
router.get('/', getTournaments);
router.get('/upcoming', getUpcomingTournaments);
router.get('/:id', getTournamentById);
router.post('/', createTournament);
router.put('/:id', updateTournament);
router.delete('/:id', deleteTournament);

module.exports = router;