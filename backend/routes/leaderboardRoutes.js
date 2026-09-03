import express from "express";

import * as leaderboardController from "../controllers/leaderboardController.js";
import * as matchController from "../controllers/matchController.js";

import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// Stages routes
router.get("/tournament/:tournamentId/stages", requireAuth, leaderboardController.getStagesByTournamentId);
router.post("/stages", requireAuth, requireAdmin, leaderboardController.createStage);
router.put("/stages/:stageId", requireAuth, requireAdmin, leaderboardController.updateStage);
router.delete("/stages/:stageId", requireAuth, requireAdmin, leaderboardController.deleteStage);

// Groups routes
router.get("/tournament/:tournamentId/stage/:stageId/groups", requireAuth, leaderboardController.getGroups);
router.post("/groups", requireAuth, requireAdmin, leaderboardController.createGroup);
router.put("/groups/:groupId", requireAuth, requireAdmin, leaderboardController.updateGroup);
router.delete("/groups/:groupId", requireAuth, requireAdmin, leaderboardController.deleteGroup);


//Match routes
router.get("/match/player-data", requireAuth, matchController.getPlayerDataByName);


export default router;