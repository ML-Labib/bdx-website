const { requireTeamOwnership } = require('../middleware/requireTeamOwnership');
const { requireAuth } = require('../middleware/auth');
const { requireMembership } = require('../middleware/requireMembership');
const { requireTeamValidity } = require('../middleware/requireTeamValidity');
const express = require("express");

const {
    getUserTeam,
    createTeam,
    updateTeamLogo,
    disbandTeam,
    transferOwnership,
    addTeamMember,
    removeTeamMember,
    leaveTeam,
    getAllTeams,
    getTeamInfo,
    searchTeams
} = require("../controllers/teamController");

const router = express.Router();

router.get("/", getAllTeams);
router.get("/search", searchTeams);
router.get("/:teamId/info", getTeamInfo);

// Protected routes
router.get("/user", requireAuth, getUserTeam);
router.post("/", requireAuth, requireTeamValidity, createTeam);
router.post("/:teamId/members", requireAuth, addTeamMember);
router.delete("/:teamId/members/:memberId", requireAuth, requireTeamOwnership, removeTeamMember);
router.delete("/:teamId/leave", requireAuth, requireMembership, leaveTeam);
router.put("/:teamId/logo", requireAuth, requireTeamOwnership, updateTeamLogo);
router.put("/:teamId/transfer", requireAuth, requireTeamOwnership, transferOwnership);
router.delete("/:teamId", requireAuth, requireTeamOwnership, disbandTeam);

module.exports = router;