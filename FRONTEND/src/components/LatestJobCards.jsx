import React from 'react'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Link } from 'react-router-dom'
import JobMatch from './JobMatch'

const formatSalary = salary => {
    if (!salary) return "Salary not listed";
    const value = String(salary).trim();
    return value.toLowerCase().endsWith("lpa") ? value : `${value} LPA`;
};

const LatestJobCards = ({ job }) => (
    <Link
        to={`/description/${job._id}`}
        className="group flex h-full flex-col rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-900/[0.06] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-100"
    >
        <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-11 w-11 rounded-xl border border-gray-100 bg-gray-50">
                    <AvatarImage src={job?.company?.logo} alt={`${job?.company?.name || "Company"} logo`} />
                    <AvatarFallback className="rounded-xl bg-violet-50 font-semibold text-violet-700">
                        {job?.company?.name?.slice(0, 1)?.toUpperCase() || "H"}
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{job?.company?.name || "Company"}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500"><MapPin className="h-3 w-3" />{job?.location || "Location not listed"}</p>
                </div>
            </div>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-700" />
        </div>

        <div className="mt-5 flex-1">
            <h3 className="text-lg font-semibold tracking-tight text-gray-950">{job?.title}</h3>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">{job?.description}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
            {job?.jobType && <Badge variant="secondary" className="rounded-lg bg-violet-50 font-medium text-violet-700">{job.jobType}</Badge>}
            {job?.experienceLevel && <Badge variant="secondary" className="rounded-lg bg-gray-100 font-medium text-gray-700">{job.experienceLevel}</Badge>}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-sm font-semibold text-gray-900">{formatSalary(job?.salary)}</span>
            {job?.position && <span className="text-xs text-gray-500">{job.position} {Number(job.position) === 1 ? "opening" : "openings"}</span>}
        </div>
        <JobMatch job={job} />
    </Link>
);

export default LatestJobCards;
