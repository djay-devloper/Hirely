import React from 'react'
import { Bookmark, BookmarkCheck, MapPin } from 'lucide-react'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { SAVED_JOBS_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { toast } from 'sonner'
import { setSavedJobs } from '@/redux/jobSlice'
import JobMatch from './JobMatch'

const formatSalary = salary => {
    if (!salary) return "Salary not listed";
    const value = String(salary).trim();
    return value.toLowerCase().endsWith("lpa") ? value : `${value} LPA`;
};

const Job = ({ job }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { allAppliedJobs, savedJobs: persistedSavedJobs } = useSelector(store => store.job);
    const savedJobs = Array.isArray(persistedSavedJobs) ? persistedSavedJobs : [];
    const { user } = useSelector(store => store.auth);
    const isSaved = savedJobs.some(savedJob => savedJob?._id === job?._id);
    const userApplication = allAppliedJobs.find(application => {
        const appliedJobId = typeof application?.job === "object" ? application.job?._id : application?.job;
        return appliedJobId === job?._id;
    });
    const applicationStatus = userApplication?.status?.toLowerCase() || null;
    const postedAt = job?.createdAt ? new Date(job.createdAt) : null;
    const daysAgo = postedAt ? Math.max(0, Math.floor((Date.now() - postedAt.getTime()) / 86400000)) : null;

    const toggleSavedJob = async () => {
        if (user?.role !== "student") {
            toast.error("Log in as a candidate to save jobs.");
            navigate("/login");
            return;
        }
        try {
            const response = await axios.put(`${SAVED_JOBS_API_END_POINT}/${job._id}`, {}, { withCredentials: true });
            if (response.data.success) {
                dispatch(setSavedJobs(isSaved
                    ? savedJobs.filter(savedJob => savedJob?._id !== job._id)
                    : [...savedJobs, job]));
                toast.success(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update saved jobs.");
        }
    };

    return (
        <article className="flex h-full flex-col rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-900/[0.05]">
            <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-gray-500">
                    {daysAgo === null ? "Recently posted" : daysAgo === 0 ? "Posted today" : `Posted ${daysAgo} ${daysAgo === 1 ? "day" : "days"} ago`}
                </span>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={isSaved ? "Remove saved job" : "Save job"}
                    onClick={toggleSavedJob}
                    className={`h-9 w-9 rounded-xl border-gray-200 ${isSaved ? "border-violet-200 bg-violet-50 text-violet-700" : "text-gray-500"}`}
                >
                    {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </Button>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <Avatar className="h-11 w-11 rounded-xl border border-gray-100 bg-gray-50">
                    <AvatarImage src={job?.company?.logo} alt={`${job?.company?.name || "Company"} logo`} />
                    <AvatarFallback className="rounded-xl bg-violet-50 font-semibold text-violet-700">
                        {job?.company?.name?.slice(0, 1)?.toUpperCase() || "H"}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-gray-900">{job?.company?.name || "Company"}</h2>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />{job?.location || "Location not listed"}
                    </p>
                </div>
            </div>

            <div className="mt-5 flex-1">
                <h3 className="text-lg font-bold tracking-tight text-gray-950">{job?.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500">{job?.description}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {job?.jobType && <Badge variant="secondary" className="rounded-lg bg-violet-50 text-violet-700">{job.jobType}</Badge>}
                {job?.experienceLevel && <Badge variant="secondary" className="rounded-lg bg-gray-100 text-gray-700">{job.experienceLevel}</Badge>}
                {applicationStatus && (
                    <Badge className={`rounded-lg text-white ${applicationStatus === "rejected" ? "bg-red-500" : applicationStatus === "pending" ? "bg-amber-500" : "bg-emerald-600"}`}>
                        {applicationStatus.toUpperCase()}
                    </Badge>
                )}
            </div>

            <JobMatch job={job} />
            <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Compensation</p>
                    <p className="mt-0.5 text-sm font-semibold text-gray-900">{formatSalary(job?.salary)}</p>
                </div>
                <Button
                    type="button"
                    onClick={() => navigate(`/description/${job?._id}`)}
                    className="rounded-xl bg-violet-600 px-4 font-semibold hover:bg-violet-700"
                >
                    View role
                </Button>
            </div>
        </article>
    );
};

export default Job;
