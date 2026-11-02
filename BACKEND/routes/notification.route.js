import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import requireRole from "../middlewares/requireRole.js";
import {
    getJobAlertPreferences,
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    updateJobAlertPreferences
} from "../controllers/notification.controller.js";

const router = express.Router();
router.use(isAuthenticated, requireRole("student"));
router.get("/", getNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.patch("/:id/read", markNotificationRead);
router.get("/preferences", getJobAlertPreferences);
router.put("/preferences", updateJobAlertPreferences);

export default router;
