import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import requireRole from "../middlewares/requireRole.js";
import { getSavedJobs, toggleSavedJob } from "../controllers/savedJob.controller.js";

const router = express.Router();
router.use(isAuthenticated, requireRole("student"));
router.get("/", getSavedJobs);
router.put("/:id", toggleSavedJob);

export default router;
