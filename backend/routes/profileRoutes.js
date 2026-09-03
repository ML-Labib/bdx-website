import express from 'express';
import * as profileController from '../controllers/profileController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireProfileOwnership } from '../middleware/requireProfileOwnership.js';

const router = express.Router();

router.get('/', profileController.getAllProfiles);
router.get('/search', profileController.searchPlayers);
router.get('/pubg/:pubgId?', profileController.getProfileByPubgId);


//protected routes
router.get('/user', requireAuth, profileController.getProfileByUserId);
router.post('/', requireAuth, profileController.createProfile);
router.put('/user/', requireAuth, requireProfileOwnership, profileController.updateProfile);

export default router;