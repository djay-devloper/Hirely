import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { Company } from "../models/company.model.js";
import { notifyMatchingCandidates } from "../utils/jobAlerts.js";
import { parseSalaryMin } from "../utils/salary.js";

const parseList = (value) => String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseSalary = (job) => {
    if (Number.isFinite(job.salaryMin)) return job.salaryMin;
    return parseSalaryMin(job.salary);
};

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
            requirements: Array.isArray(requirements) ? requirements : requirements.split(","),
            salary: String(salary).trim(),
            salaryMin:parseSalaryMin(salary),
            location,
            jobType,
            experienceLevel: experience,
            position,
            company: companyId,
            created_by: userId
        });
        let alertSummary = { matched:0, emailSent:0, emailFailed:0 };
        try {
            const company = await Company.findById(companyId).select("name");
            alertSummary = await notifyMatchingCandidates(job, company?.name || "a company");
        } catch (error) {
            console.error("Job created, but matching candidate alerts could not be recorded:", error);
        }
        return res.status(201).json({
            message: "New job created successfully.",
            job,
            alerts:alertSummary,
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
        const requestedLimit = Number(req.query.limit || 12);
        const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
            ? Math.min(requestedLimit, 50)
            : 12;
        const requestedPage = Number(req.query.page || 1);
        const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
        const locations = parseList(req.query.locations);
        const jobTypes = parseList(req.query.jobTypes);
        const experienceLevels = parseList(req.query.experienceLevels);
        const minSalary = req.query.minSalary === undefined || req.query.minSalary === "" ? null : Number(req.query.minSalary);
        const maxSalary = req.query.maxSalary === undefined || req.query.maxSalary === "" ? null : Number(req.query.maxSalary);
        const sort = String(req.query.sort || "newest");
        const query = {};

        if ((minSalary !== null && (!Number.isFinite(minSalary) || minSalary < 0)) ||
            (maxSalary !== null && (!Number.isFinite(maxSalary) || maxSalary < 0)) ||
            (minSalary !== null && maxSalary !== null && minSalary > maxSalary)) {
            return res.status(400).json({ message:"Enter a valid salary range.", success:false });
        }
        if (keyword) {
            const safeKeyword = new RegExp(escapeRegex(keyword), "i");
            query.$or = [
                { title:safeKeyword },
                { description:safeKeyword },
                { location:safeKeyword },
                { jobType:safeKeyword },
                { salary:safeKeyword },
                { experienceLevel:safeKeyword },
                { requirements:safeKeyword }
            ];
        }
        if (locations.length) query.location = { $in:locations.map((value) => new RegExp(`^${escapeRegex(value)}$`, "i")) };
        if (jobTypes.length) query.jobType = { $in:jobTypes.map((value) => new RegExp(`^${escapeRegex(value)}$`, "i")) };
        if (experienceLevels.length) query.experienceLevel = { $in:experienceLevels.map((value) => new RegExp(`^${escapeRegex(value)}$`, "i")) };

        const sortOptions = {
            newest:{ createdAt:-1 },
            oldest:{ createdAt:1 },
            salary_asc:{ salaryMin:1, createdAt:-1 },
            salary_desc:{ salaryMin:-1, createdAt:-1 }
        };
        if (!Object.hasOwn(sortOptions, sort)) {
            return res.status(400).json({ message:"Unsupported sort order.", success:false });
        }
        const needsSalaryFilter = minSalary !== null || maxSalary !== null;
        const needsSalarySort = sort === "salary_asc" || sort === "salary_desc";
        const findQuery = Job.find(query).populate({ path:"company" }).sort(sortOptions[sort]);
        if (!needsSalaryFilter && !needsSalarySort) {
            const [jobs, totalJobs] = await Promise.all([
                findQuery.skip((page - 1) * limit).limit(limit),
                Job.countDocuments(query)
            ]);
            return res.status(200).json({
                jobs,
                pagination:{ page, limit, totalJobs, totalPages:Math.ceil(totalJobs / limit) },
                success:true
            });
        }

        const matchingJobs = await findQuery;
        const salaryFilteredJobs = matchingJobs.filter((job) => {
            const salary = parseSalary(job);
            if (needsSalaryFilter && !Number.isFinite(salary)) return false;
            return (minSalary === null || salary >= minSalary) && (maxSalary === null || salary <= maxSalary);
        });
        if (needsSalarySort) {
            salaryFilteredJobs.sort((left, right) => {
                const leftSalary = parseSalary(left);
                const rightSalary = parseSalary(right);
                if (!Number.isFinite(leftSalary) && !Number.isFinite(rightSalary)) return 0;
                if (!Number.isFinite(leftSalary)) return 1;
                if (!Number.isFinite(rightSalary)) return -1;
                const difference = leftSalary - rightSalary;
                return sort === "salary_asc" ? difference : -difference;
            });
        }
        const offset = (page - 1) * limit;

        return res.status(200).json({
            jobs:salaryFilteredJobs.slice(offset, offset + limit),
            pagination:{
                page,
                limit,
                totalJobs:salaryFilteredJobs.length,
                totalPages:Math.ceil(salaryFilteredJobs.length / limit)
            },
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
};

export const getRecruiterAnalytics = async (req, res) => {
        try {
            const jobs = await Job.find({ created_by:req.id }).select("_id title createdAt");
            const jobIds = jobs.map((job) => job._id);
            const [applicationTotals, statusCounts, monthlyCounts] = await Promise.all([
                Application.countDocuments({ job:{ $in:jobIds } }),
                Application.aggregate([
                    { $match:{ job:{ $in:jobIds } } },
                    { $group:{ _id:"$status", count:{ $sum:1 } } }
                ]),
                Application.aggregate([
                    { $match:{ job:{ $in:jobIds } } },
                    { $group:{
                        _id:{ year:{ $year:"$createdAt" }, month:{ $month:"$createdAt" } },
                        count:{ $sum:1 }
                    } }
                ])
            ]);
            const countsByStatus = { pending:0, accepted:0, rejected:0 };
            statusCounts.forEach(({ _id, count }) => {
                countsByStatus[_id] = count;
            });
            const monthMap = new Map(monthlyCounts.map(({ _id, count }) => [`${_id.year}-${_id.month}`, count]));
            const applicationsByMonth = [];
            for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo -= 1) {
                const date = new Date();
                date.setDate(1);
                date.setHours(0, 0, 0, 0);
                date.setMonth(date.getMonth() - monthsAgo);
                const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                applicationsByMonth.push({
                    label:date.toLocaleString("en", { month:"short" }),
                    count:monthMap.get(key) || 0
                });
            }
            const applicationCountsByJob = await Application.aggregate([
                { $match:{ job:{ $in:jobIds } } },
                { $group:{ _id:"$job", count:{ $sum:1 } } }
            ]);
            const countByJobId = new Map(applicationCountsByJob.map(({ _id, count }) => [String(_id), count]));
            const topJobs = jobs
                .map((job) => ({
                    id:String(job._id),
                    title:job.title,
                    postedAt:job.createdAt,
                    applications:countByJobId.get(String(job._id)) || 0
                }))
                .sort((left, right) => right.applications - left.applications)
                .slice(0, 5);

            return res.status(200).json({
                analytics:{
                    totalJobs:jobs.length,
                    totalApplications:applicationTotals,
                    countsByStatus,
                    applicationsByMonth,
                    topJobs
                },
                success:true
            });
        } catch (error) {
            console.error("Unable to fetch recruiter analytics:", error);
            return res.status(500).json({ message:"Unable to fetch recruiter analytics.", success:false });
        }
};
