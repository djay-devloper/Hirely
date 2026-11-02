import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import requireRole from "../middlewares/requireRole.js";
import { askJobCopilot, findCopilotMatches } from "../controllers/copilot.controller.js";

const router = express.Router();
router.use(isAuthenticated, requireRole("student"));
router.post("/matches", findCopilotMatches);
router.post("/chat", askJobCopilot);

export default router;
