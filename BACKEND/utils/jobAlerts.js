import nodemailer from "nodemailer";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { parseSalaryMin } from "./salary.js";

const emailConfigured = () => Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_FROM
);

export const matchesPreferences = (preferences, job) => {
    const containsAny = (values, candidate) => !values?.length ||
        values.some((value) => value.toLowerCase() === String(candidate || "").toLowerCase());
    const keyword = preferences.keyword?.trim().toLowerCase();
    const text = [
        job.title,
        job.description,
        ...(job.requirements || [])
    ].join(" ").toLowerCase();

    if (keyword && !text.includes(keyword)) return false;
    if (!containsAny(preferences.locations, job.location)) return false;
    if (!containsAny(preferences.jobTypes, job.jobType)) return false;
    if (!containsAny(preferences.experienceLevels, job.experienceLevel)) return false;
    const salaryMin = Number.isFinite(job.salaryMin)
        ? job.salaryMin
        : parseSalaryMin(job.salary);
    if (preferences.minSalary != null && (!Number.isFinite(salaryMin) || salaryMin < preferences.minSalary)) return false;
    if (preferences.maxSalary != null && (!Number.isFinite(salaryMin) || salaryMin > preferences.maxSalary)) return false;
    return true;
};

const sendEmailAlert = async ({ user, job, companyName }) => {
    if (!emailConfigured()) {
        throw new Error("SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM must be configured to send job-alert emails.");
    }

    const transporter = nodemailer.createTransport({
        host:process.env.SMTP_HOST,
        port:Number(process.env.SMTP_PORT || 587),
        secure:process.env.SMTP_SECURE === "true",
        auth:{
            user:process.env.SMTP_USER,
            pass:process.env.SMTP_PASSWORD
        }
    });
    const jobUrl = `${(process.env.FRONTEND_URLS || "http://localhost:5173").split(",")[0].replace(/\/$/, "")}/description/${job._id}`;
    await transporter.sendMail({
        from:process.env.SMTP_FROM,
        to:user.email,
        subject:`A new job matches your Hirely alert: ${job.title}`,
        text:`Hi ${user.fullname},\n\nA new ${job.jobType} role at ${companyName} matches your job alert.\n\n${job.title} — ${job.location}\n${jobUrl}\n\nYou can manage your alerts from Hirely.`
    });
};

export const notifyMatchingCandidates = async (job, companyName) => {
    const candidates = await User.find({
        role:"student",
        "jobAlertPreferences.enabled":true
    }).select("_id fullname email jobAlertPreferences");
    const matchedCandidates = candidates.filter((candidate) =>
        matchesPreferences(candidate.jobAlertPreferences, job)
    );

    if (!matchedCandidates.length) {
        return { matched:0, emailSent:0, emailFailed:0 };
    }

    await Notification.insertMany(
        matchedCandidates.map((candidate) => ({
            recipient:candidate._id,
            job:job._id,
            message:`${job.title} at ${companyName} matches your job alert.`
        })),
        { ordered:false }
    );

    let emailSent = 0;
    let emailFailed = 0;
    const emailResults = await Promise.allSettled(
        matchedCandidates.map((user) => sendEmailAlert({ user, job, companyName }))
    );
    emailResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
            emailSent += 1;
        } else {
            emailFailed += 1;
            console.error(`Unable to email job alert to ${matchedCandidates[index].email}:`, result.reason);
        }
    });

    return { matched:matchedCandidates.length, emailSent, emailFailed };
};

export const isJobAlertEmailConfigured = emailConfigured;
