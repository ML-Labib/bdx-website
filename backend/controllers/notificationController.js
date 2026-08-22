const Profile = require("../models/Profile");
const { Notification } = require("../models/Notification");


// Check if user has any unread notifications
exports.getUnreadNotifications = async (req, res) => {
    try {
        
        const unreadNotifications = await Notification.find({ userId: req.profile._id, isRead: false });

        res.json({ hasUnread: unreadNotifications.length > 0 });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server error. Failed to fetch unread notifications." });
    }
};


// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            {
                userId: req.profile._id,
                isRead: false,
            },
            {
                $set: { isRead: true },
            }
        );

        res.json({
            msg: "All notifications marked as read.",
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: "Server error. Failed to mark notifications as read.",
        });
    }
};

// get latest 15 notifications for the user
exports.getLatestNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.profile._id })
            .sort({ createdAt: -1 })
            .limit(15);
        res.json({ notifications });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server error. Failed to fetch latest notifications." });
    }
};

//create a new notification for a user
exports.createNotification = async (req, res) => {
    try {
        const { userId, type, message, target } = req.body;
        const notification = new Notification({
            userId: userId,
            type: type,
            message: message,
            target: target
        });

        await notification.save();
        res.json({ msg: "Notification created successfully." });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server error. Failed to create notification." });
    }
};
