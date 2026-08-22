const express = require("express");

const {
    sendInvitation,
    getReceivedInvitations,
    getSentInvitations,
    acceptInvitation,
    rejectInvitation,
    cancelInvitation,
} = require("../controllers/invitationController");

const { requireAuth } = require("../middleware/auth");
const { requireTeamOwnership } = require("../middleware/requireTeamOwnership");
const { requireProfileOwnership } = require("../middleware/requireProfileOwnership");
const router = express.Router();

router.post("/", requireAuth,
    requireTeamOwnership,
    sendInvitation
);

router.get(
    "/received",
    requireAuth,
    requireProfileOwnership,
    getReceivedInvitations
);

router.get(
    "/sent",
    requireAuth,
    requireTeamOwnership,
    getSentInvitations
);

router.put(
    "/:invitationId/accept",
    requireAuth,
    requireProfileOwnership,
    acceptInvitation
);

router.put(
    "/:invitationId/reject",
    requireAuth,
    requireProfileOwnership,
    rejectInvitation
);

router.put(
    "/:invitationId/cancel",
    requireAuth,
    requireTeamOwnership,
    cancelInvitation
);

module.exports = router;