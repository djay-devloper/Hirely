import React, { useEffect, useState } from 'react'
import { ArrowLeft, BriefcaseBusiness, CalendarDays, CheckCircle2, MapPin, UsersRound } from 'lucide-react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from './shared/Navbar'
import axios from 'axios'
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant'
import { setSingleJob } from '@/redux/jobSlice'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import JobMatch from './JobMatch'

const formatSalary = salary => {
    if (!salary) return "Not listed";
    const value = String(salary).trim();
    return value.toLowerCase().endsWith("lpa") ? value : `${value} LPA`;
};

const JobDescription = () => {
    const { singleJob } = useSelector(store => store.job);
    const { user } = useSelector(store => store.auth);
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const [isApplied, setIsApplied] = useState(false);
    const applications = singleJob?.applications || [];
    const userApplication = useSelector(store => store.job.allAppliedJobs).find(application => {
        const appliedJobId = typeof application?.job === "object" ? application.job?._id : application?.job;
        return appliedJobId === singleJob?._id;
    });
    const applicationStatus = userApplication?.status?.toLowerCase();
    const hasApplied = isApplied || Boolean(applicationStatus);

    useEffect(() => {
        let isCurrent = true;
        const fetchSingleJob = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${JOB_API_END_POINT}/get/${params.id}`, { withCredentials: true });
                if (!response.data.success) {
                    throw new Error(response.data.message || "Unable to load this job.");
                }
                if (isCurrent) {
                    dispatch(setSingleJob(response.data.job));
                    setIsApplied((response.data.job?.applications || []).some(application => application.applicant === user?._id));
                }
            } catch (error) {
                console.error("Unable to load job details:", error);
                if (isCurrent) toast.error(error.response?.data?.message || error.message || "Unable to load this job.");
            } finally {
                if (isCurrent) setLoading(false);
            }
        };
        fetchSingleJob();
        return () => { isCurrent = false; };
    }, [params.id, dispatch, user?._id]);

    const applyJobHandler = async () => {
        if (user?.role !== "student") {
            toast.error(user ? "Only candidates can apply to jobs." : "Sign in as a candidate to apply.");
            if (!user) navigate("/login");
            return;
        }
        try {
            const response = await axios.get(`${APPLICATION_API_END_POINT}/apply/${params.id}`, { withCredentials: true });
            if (response.data.success) {
                setIsApplied(true);
                dispatch(setSingleJob({ ...singleJob, applications: [...applications, { applicant: user._id }] }));
                toast.success(response.data.message);
            }
        } catch (error) {
            console.error("Unable to apply for job:", error);
            toast.error(error.response?.data?.message || "Unable to apply for this job.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <main className="page-container py-10">
                    <div className="surface-card animate-pulse p-8">
                        <div className="h-5 w-28 rounded bg-gray-100" />
                        <div className="mt-6 h-9 w-2/3 rounded bg-gray-100" />
                        <div className="mt-4 h-5 w-1/3 rounded bg-gray-100" />
                        <div className="mt-10 h-48 rounded-2xl bg-gray-50" />
                    </div>
                </main>
            </div>
        );
    }

    if (!singleJob || singleJob._id !== params.id) {
        return (
            <div className="min-h-screen">
                <Navbar />
                <main className="page-container py-12">
                    <div className="surface-card px-6 py-14 text-center">
                        <h1 className="text-xl font-bold text-gray-950">We couldn&apos;t find that role</h1>
                        <p className="mt-2 text-sm text-gray-500">It may have been removed or the link may be incorrect.</p>
                        <Button asChild className="mt-5 rounded-xl bg-violet-600 hover:bg-violet-700">
                            <Link to="/jobs">Explore available jobs</Link>
                        </Button>
                    </div>
                </main>
            </div>
        );
    }

    const statusLabel = applicationStatus
        ? applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1)
        : hasApplied ? "Application received" : "Apply for this role";
    const postedDate = singleJob.createdAt ? new Date(singleJob.createdAt).toLocaleDateString() : "Recently";

    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="page-container py-8 sm:py-10">
                <Link to="/jobs" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-violet-700">
                    <ArrowLeft className="h-4 w-4" />Back to jobs
                </Link>
                <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <section className="surface-card overflow-hidden">
                        <div className="border-b border-gray-100 bg-gradient-to-br from-white to-violet-50/60 p-6 sm:p-9">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex min-w-0 items-start gap-4">
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-100 bg-white text-violet-700 shadow-sm">
                                        <BriefcaseBusiness className="h-6 w-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-violet-700">{singleJob.company?.name || "Hiring team"}</p>
                                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">{singleJob.title}</h1>
                                        <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                                            <MapPin className="h-4 w-4" />{singleJob.location || "Location not listed"}
                                        </p>
                                    </div>
                                </div>
                                {user?.role === "student" && (
                                    <Button
                                        type="button"
                                        onClick={applyJobHandler}
                                        disabled={hasApplied}
                                        className="h-11 shrink-0 rounded-xl bg-violet-600 px-5 font-semibold hover:bg-violet-700 disabled:bg-gray-300"
                                    >
                                        {hasApplied && <CheckCircle2 className="mr-2 h-4 w-4" />}
                                        {statusLabel}
                                    </Button>
                                )}
                            </div>
                            <div className="mt-6 flex flex-wrap gap-2">
                                {singleJob.jobType && <Badge variant="secondary" className="rounded-lg bg-violet-100 px-3 py-1 text-violet-800">{singleJob.jobType}</Badge>}
                                {singleJob.experienceLevel && <Badge variant="secondary" className="rounded-lg bg-gray-100 px-3 py-1 text-gray-700">{singleJob.experienceLevel}</Badge>}
                                <Badge variant="secondary" className="rounded-lg bg-emerald-50 px-3 py-1 text-emerald-700">{formatSalary(singleJob.salary)}</Badge>
                            </div>
                        </div>

                        <div className="space-y-8 p-6 sm:p-9">
                            <JobMatch job={singleJob} detailed />
                            <section>
                                <h2 className="text-lg font-bold text-gray-950">About the role</h2>
                                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">{singleJob.description || "No description provided."}</p>
                            </section>
                            {singleJob.requirements?.length > 0 && (
                                <section>
                                    <h2 className="text-lg font-bold text-gray-950">What you&apos;ll bring</h2>
                                    <ul className="mt-3 space-y-2">
                                        {singleJob.requirements.map((requirement, index) => (
                                            <li key={`${requirement}-${index}`} className="flex items-start gap-2.5 text-sm leading-6 text-gray-600">
                                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-violet-600" />{requirement}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>
                    </section>

                    <aside className="space-y-4 lg:sticky lg:top-24">
                        <section className="surface-card p-5">
                            <h2 className="font-bold text-gray-950">Role overview</h2>
                            <dl className="mt-4 space-y-4">
                                {[
                                    { label: "Compensation", value: formatSalary(singleJob.salary), icon: BriefcaseBusiness },
                                    { label: "Open positions", value: singleJob.position || "Not specified", icon: UsersRound },
                                    { label: "Applicants", value: applications.length, icon: UsersRound },
                                    { label: "Posted", value: postedDate, icon: CalendarDays }
                                ].map(({ label, value, icon: Icon }) => (
                                    <div key={label} className="flex items-center gap-3">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500"><Icon className="h-4 w-4" /></span>
                                        <div>
                                            <dt className="text-xs text-gray-500">{label}</dt>
                                            <dd className="mt-0.5 text-sm font-semibold text-gray-900">{value}</dd>
                                        </div>
                                    </div>
                                ))}
                            </dl>
                        </section>
                        {user?.role !== "student" && (
                            <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-5">
                                <h2 className="font-semibold text-violet-950">Ready to take the next step?</h2>
                                <p className="mt-1 text-sm leading-5 text-violet-800">Create a candidate account to apply and track your applications.</p>
                                <Button asChild variant="outline" className="mt-4 w-full rounded-xl border-violet-200 bg-white text-violet-800 hover:bg-violet-100">
                                    <Link to="/signup">Create candidate account</Link>
                                </Button>
                            </div>
                        )}
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default JobDescription;
