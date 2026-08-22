const mongoose = require("mongoose");

const InvitationSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },

        team: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Team",
            required: true,
        },

        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "canceled"],
            default: "pending",
        },
        
        role: {
            type: String,
            enum: ["player", "captain", "manager"],
            default: "player",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent duplicate pending invitations
InvitationSchema.index(
    {
        sender: 1,
        team: 1,
        receiver: 1,
        status: 1,
    },
    {
        unique: true,
        partialFilterExpression: {
            status: "pending",
        },
    }
);

// Useful for notification/activity queries
InvitationSchema.index({ receiver: 1, status: 1, createdAt: -1 });
InvitationSchema.index({ sender: 1, status: 1, createdAt: -1 });
InvitationSchema.index({ team: 1, status: 1 });

const Invitation = mongoose.model("Invitation", InvitationSchema);

module.exports = { Invitation };