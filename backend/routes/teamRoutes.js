import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireTeamValidity } from '../middleware/requireTeamValidity.js';
import { requireMembership } from '../middleware/requireMembership.js';
import { requireTeamOwnership } from '../middleware/requireTeamOwnership.js';
import * as teamController from '../controllers/teamController.js';


const router = express.Router();

router.get("/", teamController.getAllTeams);
router.get("/search", teamController.searchTeams);
router.get("/:teamId/info", teamController.getTeamInfo);

// Protected routes
router.get("/:teamId/members/count", requireAuth, requireMembership, teamController.getTeamMemberCount);
router.get("/user", requireAuth, teamController.getUserTeam);
router.post("/", requireAuth, requireTeamValidity, teamController.createTeam);
router.post("/:teamId/members", requireAuth, teamController.addTeamMember);
router.delete("/:teamId/members/:memberId", requireAuth, requireTeamOwnership, teamController.removeTeamMember);
router.delete("/:teamId/leave", requireAuth, requireMembership, teamController.leaveTeam);
router.put("/:teamId/logo", requireAuth, requireTeamOwnership, teamController.updateTeamLogo);
router.put("/:teamId/transfer", requireAuth, requireTeamOwnership, teamController.transferOwnership);
router.delete("/:teamId", requireAuth, requireTeamOwnership, teamController.disbandTeam);

export default router;