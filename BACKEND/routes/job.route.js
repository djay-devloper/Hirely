import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getAdminJobs, getAllJobs, getJobById, getRecruiterAnalytics, postJob } from "../controllers/job.controller.js";
import requireRole from "../middlewares/requireRole.js";

const router = express.Router();

router.route("/post").post(isAuthenticated, postJob);
router.route("/get").get(getAllJobs);
router.route("/analytics").get(isAuthenticated, requireRole("recruiter"), getRecruiterAnalytics);
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);
router.route("/get/:id").get(getJobById);

export default router;
