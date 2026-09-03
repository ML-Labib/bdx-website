import { Notification } from "../models/Notification.js";
export const sendNotification = async (recipientId, message, type, target = null) => {
    try {
        await Notification.create({
            userId: recipientId,
            type,
            message,
            target
        });
    } catch (error) {
        // Log the error, but don't break the main app flow
        console.error("Failed to create notification:", error);
    }
};