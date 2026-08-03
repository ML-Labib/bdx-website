const express = require('express');
const { getProfileByUserId, getProfileByPubgId, createProfile, updateProfile } = require('../controllers/profile');

const router = express.Router();

router.get('/user/:userId?', getProfileByUserId);
router.get('/pubg/:pubgId?', getProfileByPubgId);
router.post('/', createProfile);
router.put('/user/:userId?', updateProfile);

module.exports = router;