import express from "express";
import * as invitationController from "../controllers/invitationController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireTeamOwnership } from "../middleware/requireTeamOwnership.js";
import { requireProfileOwnership } from "../middleware/requireProfileOwnership.js";

const router = express.Router();

router.post("/", requireAuth,
    requireTeamOwnership,
    invitationController.sendInvitation
);

router.get(
    "/received",
    requireAuth,
    requireProfileOwnership,
    invitationController.getReceivedInvitations
);

router.get(
    "/sent",
    requireAuth,
    requireTeamOwnership,
    invitationController.getSentInvitations
);

router.put(
    "/:invitationId/accept",
    requireAuth,
    requireProfileOwnership,
    invitationController.acceptInvitation
);

router.put(
    "/:invitationId/reject",
    requireAuth,
    requireProfileOwnership,
    invitationController.rejectInvitation
);

router.put(
    "/:invitationId/cancel",
    requireAuth,
    requireTeamOwnership,
    invitationController.cancelInvitation
);

export default router;