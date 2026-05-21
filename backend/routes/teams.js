const express = require('express');
const { getTeams, getTeamById, createTeam, updateTeam, deleteTeam, getTeamsByCreator } = require('../controllers/teams');

const router = express.Router();

// Routes
router.get('/', getTeams);
router.get('/:id', getTeamById);
router.get('/creator/:creatorId', getTeamsByCreator);
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

module.exports = router;
