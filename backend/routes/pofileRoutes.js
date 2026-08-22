const express = require('express');
const {getAllProfiles, getProfileByUserId, getProfileByPubgId, createProfile, updateProfile, searchPlayers } = require('../controllers/profileController');
const { requireProfileOwnership } = require('../middleware/requireProfileOwnership');
const {requireAuth} = require('../middleware/auth');
const router = express.Router();

router.get('/', getAllProfiles);
router.get('/search', searchPlayers);
router.get('/pubg/:pubgId?', getProfileByPubgId);


//protected routes
router.get('/user', requireAuth, getProfileByUserId);
router.post('/', requireAuth, createProfile);
router.put('/user/', requireAuth, requireProfileOwnership, updateProfile);

module.exports = router;