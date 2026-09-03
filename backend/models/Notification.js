import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },

        type: {
            type: String,
            enum: [
                "invite_sent",
                "invite_accepted",
                "invite_rejected",
                "invite_canceled",
                "user_left_team",
                "removed_from_team",
                "team_disbanded",
                "team_banned",
                "player_banned",
                "player_unbanned",
                "registration_pending",
                "registration_approved",
                "registration_rejected",
                "registration_withdrawn",
            ],
            required: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: [200, "Notification message cannot exceed 200 characters"],
        },

        target: {
            type: String,
            required: false,
            default: null,
        },

        isRead: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = mongoose.model("Notification", NotificationSchema);
