import mongoose from "mongoose";
import { Invitation } from "../models/Invitation.js";
import { Profile } from "../models/Profile.js";
import { Team } from "../models/Team.js";
import { TeamMember } from "../models/TeamMembers.js";
import { sendNotification } from "../utils/notificationHelper.js";


// POST /api/invitations
export const sendInvitation = async (req, res) => {
    try {
        const { receiverId, role = "player" } = req.body;
        const senderProfile = req.profile;
        const team = req.team;

        if (!receiverId) {
            return res.status(400).json({ message: "Receiver ID is required." });
        }

        const receiver = await Profile.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: "Receiver profile not found." });
        }

        // Cannot invite yourself
        if (receiver._id.equals(senderProfile._id)) {
            return res.status(400).json({ message: "You cannot invite yourself." });
        }

        // Check if receiver already belongs to a team
        const existingMembership = await TeamMember.findOne({ user: receiver._id });
        if (existingMembership) {
            return res.status(400).json({ message: "Player already belongs to a team." });
        }

        // Check if there's already a pending invitation
        const existingInvitation = await Invitation.findOne({
            sender: senderProfile._id,
            team: team._id,
            receiver: receiver._id,
            status: "pending",
        });

        if (existingInvitation) {
            return res.status(400).json({
                message: "An invitation has already been sent to this player.",
            });
        }

        // Capacity Check before sending invitation
        if (role === "manager") {
            const managerCount = await TeamMember.countDocuments({ team: team._id, role: "manager" });
            if (managerCount >= 2) {
                return res.status(400).json({ message: "Team already has maximum 2 managers." });
            }
        } else {
            const playerCount = await TeamMember.countDocuments({ team: team._id, role: { $ne: "manager" } });
            if (playerCount >= 6) {
                return res.status(400).json({ message: "Team already has maximum 6 players (including owner)." });
            }
        }

        const invitation = await Invitation.create({
            sender: senderProfile._id,
            team: team._id,
            receiver: receiver._id,
            role,
        });

        // Send notifications
        await Promise.all([
            sendNotification(
                invitation.sender,
                `Team invitation sent to ${receiver.ign} as ${role}.`,
                "invite_sent",
                "/my-activity?tab=team"
            ),
            sendNotification(
                invitation.receiver,
                `You received an invitation to join ${team.name} as ${role}.`,
                "invite_sent",
                "/my-activity?tab=team"
            )
        ]);

        res.status(201).json({
            message: `Invitation sent successfully to ${receiver.ign}.`,
            invitation
        });
    } catch (error) {
        console.error("Send invitation error:", error);
        res.status(500).json({ message: "Failed to send invitation.", error: error.message });
    }
};

// GET /api/invitations/received
export const getReceivedInvitations = async (req, res) => {
    try {
        const profile = req.profile;
        const invitations = await Invitation.find({
            receiver: profile._id,
            status: "pending",
        })
            .populate("sender", "user displayName ign picture")
            .populate("team", "name logo country")
            .sort({ createdAt: -1 })
            .lean();

        res.json(invitations);
    } catch (error) {
        console.error("Get received invitations error:", error);
        res.status(500).json({ message: "Failed to fetch invitations." });
    }
};

// GET /api/invitations/sent
export const getSentInvitations = async (req, res) => {
    try {
        const profile = req.profile;
        const team = req.team;

        const invitations = await Invitation.find({
            sender: profile._id,
            team: team._id,
            status: "pending",
        })
            .populate("receiver", "user displayName ign picture")
            .sort({ createdAt: -1 })
            .lean();

        res.json(invitations);
    } catch (error) {
        console.error("Get sent invitations error:", error);
        res.status(500).json({ message: "Failed to fetch sent invitations." });
    }
};

// PUT /api/invitations/:invitationId/accept
export const acceptInvitation = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const receiverProfile = req.profile;
        const { invitationId } = req.params;

        const invitation = await Invitation.findById(invitationId).session(session);

        if (!invitation) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Invitation not found." });
        }

        if (invitation.status !== "pending") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: `This invitation has already been ${invitation.status}.`
            });
        }

        // 1. Fetch Team FIRST so it can be safely referenced
        const team = await Team.findById(invitation.team).session(session);

        const rejectAndNotify = async (statusCode, reason) => {
            invitation.status = "rejected";
            await invitation.save({ session });

            await session.commitTransaction();
            session.endSession();

            await Promise.all([
                sendNotification(
                    invitation.sender,
                    `Invitation to ${receiverProfile.ign} was auto-rejected: ${reason}`,
                    "invite_rejected",
                    "/my-activity?tab=team"
                ),
                sendNotification(
                    invitation.receiver,
                    `Could not join team: ${reason}`,
                    "invite_rejected",
                    "/my-activity?tab=team"
                )
            ]);

            return res.status(statusCode).json({ message: reason });
        };

        if (!team) return await rejectAndNotify(404, "Team no longer exists.");
        if (team.disbanded) return await rejectAndNotify(400, "Team has been disbanded.");

        // 2. Check existing team membership
        const existingMembership = await TeamMember.findOne({ user: invitation.receiver }).session(session);
        if (existingMembership) {
            return await rejectAndNotify(400, "You already belong to another team.");
        }

        // 3. Role-based Capacity Checks
        const isManager = invitation.role === "manager";
        if (isManager) {
            const currentManagerCount = await TeamMember.countDocuments({
                team: team._id,
                role: "manager"
            }).session(session);

            if (currentManagerCount >= 2) {
                return await rejectAndNotify(400, `${team.name} already has the maximum limit of 2 managers.`);
            }
        } else {
            const currentPlayerCount = await TeamMember.countDocuments({
                team: team._id,
                role: { $ne: "manager" }
            }).session(session);

            if (currentPlayerCount >= 6) {
                return await rejectAndNotify(400, `${team.name} already has the maximum limit of 6 players (including owner).`);
            }
        }

        // --- ATOMIC EXECUTION ---
        await TeamMember.create([{
            team: team._id,
            user: invitation.receiver,
            role: invitation.role,
        }], { session });

        invitation.status = "accepted";
        await invitation.save({ session });

        // 1. Find other pending invitations before updating them so we can notify their senders
        const otherPendingInvitations = await Invitation.find({
            receiver: invitation.receiver,
            _id: { $ne: invitation._id },
            status: "pending"
        }).session(session);

        // 2. Bulk update them to rejected
        await Invitation.updateMany(
            {
                receiver: invitation.receiver,
                _id: { $ne: invitation._id },
                status: "pending"
            },
            { $set: { status: "rejected" } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        // Send Success Notifications
        await Promise.all([
            sendNotification(
                invitation.sender,
                `${receiverProfile.ign} accepted your invitation to join ${team.name}!`,
                "invite_accepted",
                "/my-activity?tab=team"
            ),
            sendNotification(
                invitation.receiver,
                `You have successfully joined ${team.name}!`,
                "invite_accepted",
                "/my-activity?tab=team"
            )
        ]);


        // 4. Send Rejection Notifications for all other auto-rejected invitations
        const autoRejectionNotifications = otherPendingInvitations.map((otherInv) => {
            return Promise.all([
                sendNotification(
                otherInv.sender,
                `${receiverProfile.ign} rejected your team invitation.`,
                "invite_rejected",
                "/my-activity?tab=team"
            )
            ]);
        });

        await Promise.all(autoRejectionNotifications.flat());

        res.json({
            message: "Invitation accepted successfully.",
            invitation,
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error("Accept invitation transaction error:", error);
        res.status(500).json({ message: "Failed to accept invitation." });
    }
};

// PUT /api/invitations/:invitationId/reject
export const rejectInvitation = async (req, res) => {
    try {
        const invitationId = req.params.invitationId || req.body.invitationId;
        const receiverProfile = req.profile;

        const invitation = await Invitation.findById(invitationId).populate("team", "name");

        if (!invitation) {
            return res.status(404).json({ message: "Invitation not found." });
        }

        if (invitation.status !== "pending") {
            return res.status(400).json({ message: `Invitation is already ${invitation.status}.` });
        }

        invitation.status = "rejected";
        await invitation.save();

        const teamName = invitation.team ? invitation.team.name : "the team";

        await Promise.all([
            sendNotification(
                invitation.sender,
                `${receiverProfile.ign} rejected your invitation to join ${teamName}.`,
                "invite_rejected",
                "/my-activity?tab=team"
            ),
            sendNotification(
                invitation.receiver,
                `You rejected the invitation to join ${teamName}.`,
                "invite_rejected",
                "/my-activity?tab=team"
            )
        ]);

        res.json({
            message: "Invitation rejected.",
            invitation,
        });
    } catch (error) {
        console.error("Reject invitation error:", error);
        res.status(500).json({ message: "Failed to reject invitation." });
    }
};

// PUT /api/invitations/:invitationId/cancel
export const cancelInvitation = async (req, res) => {
    try {
        const invitationId = req.params.invitationId;
        const senderProfile = req.profile;
        const team = req.team;

        const invitation = await Invitation.findById(invitationId)
            .populate("receiver", "ign");

        if (!invitation) {
            return res.status(404).json({ message: "Invitation not found." });
        }

        if (invitation.status !== "pending") {
            return res.status(400).json({ message: `Invitation is already ${invitation.status}.` });
        }

        invitation.status = "canceled";
        await invitation.save();
        await Promise.all([
            sendNotification(
                invitation.sender,
                `Team invitation to ${invitation.receiver.ign} was canceled.`,
                "invite_canceled",
                "/my-activity?tab=team"
            ),
            sendNotification(
                invitation.receiver,
                `${team.name} owner canceled your team invitation.`,
                "invite_canceled",
                "/my-activity?tab=team"
            )
        ]);

        res.json({
            message: "Invitation canceled.",
            invitation,
        });
    } catch (error) {
        console.error("Cancel invitation error:", error);
        res.status(500).json({ message: "Failed to cancel invitation." });
    }
};