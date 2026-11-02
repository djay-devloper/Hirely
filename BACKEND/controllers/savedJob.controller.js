import mongoose from "mongoose";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";

export const getSavedJobs = async (req, res) => {
    try {
        const user = await User.findById(req.id).populate({
            path:"savedJobs",
            populate:{ path:"company" }
        }).select("savedJobs");
        if (!user) {
            return res.status(404).json({ message:"User not found.", success:false });
        }
        return res.status(200).json({ jobs:user.savedJobs, success:true });
    } catch (error) {
        console.error("Unable to fetch saved jobs:", error);
        return res.status(500).json({ message:"Unable to fetch saved jobs.", success:false });
    }
};

export const toggleSavedJob = async (req, res) => {
    try {
        const { id:jobId } = req.params;
        if (!mongoose.isValidObjectId(jobId)) {
            return res.status(400).json({ message:"Invalid job id.", success:false });
        }

        const [user, job] = await Promise.all([
            User.findById(req.id).select("savedJobs"),
            Job.findById(jobId).select("_id")
        ]);
        if (!user) return res.status(404).json({ message:"User not found.", success:false });
        if (!job) return res.status(404).json({ message:"Job not found.", success:false });

        const alreadySaved = user.savedJobs.some((savedJobId) => savedJobId.equals(job._id));
        if (alreadySaved) {
            user.savedJobs = user.savedJobs.filter((savedJobId) => !savedJobId.equals(job._id));
        } else {
            user.savedJobs.push(job._id);
        }
        await user.save();

        return res.status(200).json({
            message:alreadySaved ? "Job removed from saved jobs." : "Job saved successfully.",
            saved:!alreadySaved,
            success:true
        });
    } catch (error) {
        console.error("Unable to update saved jobs:", error);
        return res.status(500).json({ message:"Unable to update saved jobs.", success:false });
    }
};
