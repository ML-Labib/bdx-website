const { requireAuth } = require('../middleware/auth');
const { requireProfileOwnership } = require('../middleware/requireProfileOwnership');
const {
    getUnreadNotifications,
    markAllNotificationsAsRead,
    getLatestNotifications,
    createNotification
} = require("../controllers/notificationController");

const express = require("express");
const router = express.Router();


// protected routes
router.get("/unread", requireAuth, requireProfileOwnership, getUnreadNotifications);
router.put("/markAsread", requireAuth, requireProfileOwnership, markAllNotificationsAsRead);
router.get("/latest", requireAuth, requireProfileOwnership, getLatestNotifications);
router.post("/", requireAuth, createNotification);

module.exports = router;