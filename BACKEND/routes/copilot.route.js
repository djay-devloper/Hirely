import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import requireRole from "../middlewares/requireRole.js";
import { rateLimit } from "express-rate-limit";
import { askJobCopilot, findCopilotMatches } from "../controllers/copilot.controller.js";

const router = express.Router();
const copilotRateLimit = rateLimit({
    windowMs:15 * 60 * 1000,
    limit:10,
    standardHeaders:"draft-8",
    legacyHeaders:false,
    message:{ message:"Too many AI requests. Please try again later.", success:false }
});
router.use(isAuthenticated, requireRole("student"));
router.use(copilotRateLimit);
router.post("/matches", findCopilotMatches);
router.post("/chat", askJobCopilot);

export default router;
