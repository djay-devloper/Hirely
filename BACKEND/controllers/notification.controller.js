import mongoose from "mongoose";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";

export const getNotifications = async (req, res) => {
    try {
        const [notifications, unreadCount] = await Promise.all([
            Notification.find({ recipient:req.id })
                .populate({ path:"job", populate:{ path:"company" } })
                .sort({ createdAt:-1 })
                .limit(50),
            Notification.countDocuments({ recipient:req.id, readAt:null })
        ]);
        return res.status(200).json({
            notifications,
            unreadCount,
            success:true
        });
    } catch (error) {
        console.error("Unable to fetch notifications:", error);
        return res.status(500).json({ message:"Unable to fetch notifications.", success:false });
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message:"Invalid notification id.", success:false });
        }
        const notification = await Notification.findOneAndUpdate(
            { _id:req.params.id, recipient:req.id },
            { $set:{ readAt:new Date() } },
            { new:true }
        );
        if (!notification) {
            return res.status(404).json({ message:"Notification not found.", success:false });
        }
        return res.status(200).json({ notification, success:true });
    } catch (error) {
        console.error("Unable to update notification:", error);
        return res.status(500).json({ message:"Unable to update notification.", success:false });
    }
};

export const markAllNotificationsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient:req.id, readAt:null },
            { $set:{ readAt:new Date() } }
        );
        return res.status(200).json({ message:"Notifications marked as read.", success:true });
    } catch (error) {
        console.error("Unable to update notifications:", error);
        return res.status(500).json({ message:"Unable to update notifications.", success:false });
    }
};

export const getJobAlertPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.id).select("jobAlertPreferences");
        if (!user) return res.status(404).json({ message:"User not found.", success:false });
        return res.status(200).json({
            preferences:user.jobAlertPreferences,
            emailConfigured:Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD && process.env.SMTP_FROM),
            success:true
        });
    } catch (error) {
        console.error("Unable to fetch job-alert preferences:", error);
        return res.status(500).json({ message:"Unable to fetch job-alert preferences.", success:false });
    }
};

export const updateJobAlertPreferences = async (req, res) => {
    try {
        const { enabled, keyword, locations, jobTypes, experienceLevels, minSalary, maxSalary } = req.body;
        if (typeof enabled !== "boolean") {
            return res.status(400).json({ message:"Alert enabled must be a boolean.", success:false });
        }
        const listFields = [locations, jobTypes, experienceLevels];
        if (listFields.some((field) => field !== undefined && (!Array.isArray(field) || field.some((item) => typeof item !== "string")))) {
            return res.status(400).json({ message:"Alert filters must be arrays of strings.", success:false });
        }
        const parsedMin = minSalary === "" || minSalary == null ? null : Number(minSalary);
        const parsedMax = maxSalary === "" || maxSalary == null ? null : Number(maxSalary);
        if ((parsedMin !== null && (!Number.isFinite(parsedMin) || parsedMin < 0)) ||
            (parsedMax !== null && (!Number.isFinite(parsedMax) || parsedMax < 0)) ||
            (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax)) {
            return res.status(400).json({ message:"Enter a valid salary range.", success:false });
        }

        const preferences = {
            enabled,
            keyword:typeof keyword === "string" ? keyword.trim().slice(0, 100) : "",
            locations:(locations || []).map((value) => value.trim()).filter(Boolean),
            jobTypes:(jobTypes || []).map((value) => value.trim()).filter(Boolean),
            experienceLevels:(experienceLevels || []).map((value) => value.trim()).filter(Boolean),
            minSalary:parsedMin,
            maxSalary:parsedMax
        };
        const user = await User.findByIdAndUpdate(
            req.id,
            { $set:{ jobAlertPreferences:preferences } },
            { new:true, runValidators:true }
        ).select("jobAlertPreferences");
        if (!user) return res.status(404).json({ message:"User not found.", success:false });
        return res.status(200).json({
            message:enabled ? "Job alert enabled." : "Job alert disabled.",
            preferences:user.jobAlertPreferences,
            success:true
        });
    } catch (error) {
        console.error("Unable to update job-alert preferences:", error);
        return res.status(500).json({ message:"Unable to update job-alert preferences.", success:false });
    }
};
