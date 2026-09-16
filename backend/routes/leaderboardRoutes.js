import express from "express";

import * as leaderboardController from "../controllers/leaderboardController.js";
import * as matchController from "../controllers/matchController.js";
import * as competitionParticipantController from "../controllers/competitionParticipantController.js";

import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();

// Stages routes
router.get("/tournament/:tournamentId/stages", requireAuth, leaderboardController.getStagesByTournamentId);
router.post("/stages", requireAuth, requireAdmin, leaderboardController.createStage);
router.put("/stages/:stageId", requireAuth, requireAdmin, leaderboardController.updateStage);
router.delete("/stages/:stageId", requireAuth, requireAdmin, leaderboardController.deleteStage);

//public stages and groups routes
router.get("/tournament/:tournamentId/stages-and-groups", leaderboardController.getStagesAndGroupsByTournamentId);

// Groups routes
router.get("/tournament/:tournamentId/stage/:stageId/groups", requireAuth, leaderboardController.getGroups);
router.post("/groups", requireAuth, requireAdmin, leaderboardController.createGroup);
router.put("/groups/:groupId", requireAuth, requireAdmin, leaderboardController.updateGroup);
router.delete("/groups/:groupId", requireAuth, requireAdmin, leaderboardController.deleteGroup);
// router.post("/matches", requireAuth, requireAdmin, leaderboardController.createMatch);

// Competition Participants routes
router.get("/tournament/:tournamentId/stage/:stageId/participants", requireAuth, requireAdmin, competitionParticipantController.getCompetitionParticipantsByTournament);
router.post("/participants", requireAuth, requireAdmin, competitionParticipantController.addCompetitionParticipant);
// router.put("/participants/:participantId", requireAuth, requireAdmin, competitionParticipantController.updateCompetitionParticipant);
router.delete("/participants/:participantId", requireAuth, requireAdmin, competitionParticipantController.removeCompetitionParticipant);

//Match routes
router.get("/matches", requireAuth, matchController.getMatches);
router.get("/match/preview/:hostIgn/:index", requireAuth, requireAdmin, matchController.getMatchPreview);
router.post("/match/save", requireAuth, requireAdmin, matchController.saveMatchData);
router.post("/match/create", requireAuth, requireAdmin, matchController.createMatch);

//match public routes
router.get("/matches/:tournamentId/:stageId/", matchController.getPublicMatches);
router.get("/matches/ranking/:tournamentId/:stageId/", matchController.getRanking);




export default router;