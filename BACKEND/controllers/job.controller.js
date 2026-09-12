import { Job } from "../models/job.model.js";

// admin post krega job
export const postJob = async (req, res) => {
    try {
        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "Somethin is missing.",
                success: false
            })
        };
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: String(salary).trim(),
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId
        });
        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unable to post job.",
            success: false
        });
    }
}
// student k liye
export const getAllJobs = async (req, res) => {
    try {
        const keyword = String(req.query.keyword || "").trim();
        const limit = Number(req.query.limit || 0);
        const query = {};
        const exactMatchValues = {
            location: ["Delhi", "Gurugram", "Bangalore", "Hyderabad", "Pune", "Mumbai"],
            jobType: ["Full Time", "Part Time", "Work From Home", "Internship"],
            experienceLevel: ["Fresher", "0-2 Years", "2-5 Years"],
        };

        const normalizedKeyword = keyword.toLowerCase();
        const matchedField = Object.entries(exactMatchValues).find(([field, values]) =>
            values.some((value) => value.toLowerCase() === normalizedKeyword)
        );

        if (matchedField) {
            const matchedValue = matchedField[1].find((value) => value.toLowerCase() === normalizedKeyword);
            query[matchedField[0]] = { $regex: `^${matchedValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" };
        } else if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
                { location: { $regex: keyword, $options: "i" } },
                { jobType: { $regex: keyword, $options: "i" } },
                { salary: { $regex: keyword, $options: "i" } },
                { experienceLevel: { $regex: keyword, $options: "i" } },
            ];
        }

        let jobsQuery = Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });

        if (limit > 0) {
            jobsQuery = jobsQuery.limit(limit);
        }

        const jobs = await jobsQuery;

        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };

        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unable to fetch jobs.",
            success: false
        });
    }
}
// student
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path:"applications"
        });
        if (!job) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unable to fetch job.",
            success: false
        });
    }
}
// admin kitne job create kra hai abhi tk
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({ created_by: adminId }).populate({
            path:'company',
            createdAt:-1
        });
        if (!jobs) {
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            })
        };
        return res.status(200).json({
            jobs,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
