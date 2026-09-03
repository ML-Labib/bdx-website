import { requireAuth } from '../middleware/auth.js';
import { requireProfileOwnership } from '../middleware/requireProfileOwnership.js';
import * as notificationController from '../controllers/notificationController.js';
import express from 'express';

const router = express.Router();


// protected routes
router.get("/unread", requireAuth, requireProfileOwnership, notificationController.getUnreadNotifications);
router.put("/markAsread", requireAuth, requireProfileOwnership, notificationController.markAllNotificationsAsRead);
router.get("/latest", requireAuth, requireProfileOwnership, notificationController.getLatestNotifications);
router.post("/", requireAuth, notificationController.createNotification);

export default router;