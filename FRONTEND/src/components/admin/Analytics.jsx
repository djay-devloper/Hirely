import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import Navbar from '../shared/Navbar'
import { JOB_API_END_POINT } from '@/utils/constant'

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await axios.get(`${JOB_API_END_POINT}/analytics`, { withCredentials:true });
                if (response.data.success) setAnalytics(response.data.analytics);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Unable to load recruiter analytics.');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const maxMonthlyApplications = Math.max(...(analytics?.applicationsByMonth || []).map((item) => item.count), 1);

    return (
        <div>
            <Navbar />
            <main className="page-container py-8 sm:py-10">
                <header className="mb-7">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-700">Recruiter workspace</p>
                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">Hiring analytics</h1>
                    <p className="mt-1 text-sm text-gray-500">A clear view of your open roles and candidate pipeline.</p>
                </header>
                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map(item => <div key={item} className="surface-card h-28 animate-pulse bg-gray-50" />)}
                    </div>
                ) : analytics ? (
                    <>
                        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { label:'Jobs posted', value:analytics.totalJobs, tint:'text-violet-700', accent:'bg-violet-50' },
                                { label:'Total applicants', value:analytics.totalApplications, tint:'text-blue-700', accent:'bg-blue-50' },
                                { label:'Pending review', value:analytics.countsByStatus.pending, tint:'text-amber-700', accent:'bg-amber-50' },
                                { label:'Accepted', value:analytics.countsByStatus.accepted, tint:'text-emerald-700', accent:'bg-emerald-50' }
                            ].map(({ label, value, tint, accent }) => (
                                <article key={label} className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
                                    <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${accent} ${tint}`}>{label}</span>
                                    <p className={`mt-4 text-3xl font-bold tracking-tight ${tint}`}>{value}</p>
                                </article>
                            ))}
                        </section>
                        <section className="mt-6 grid gap-6 lg:grid-cols-2">
                            <article className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
                                <h2 className="mb-5 text-lg font-semibold">Applications over the last 6 months</h2>
                                <div className="flex h-52 items-end justify-around gap-3 border-b">
                                    {analytics.applicationsByMonth.map((month) => (
                                        <div key={`${month.label}-${month.count}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                                            <span className="text-xs text-gray-600">{month.count}</span>
                                            <div
                                                className="w-full max-w-12 rounded-t bg-violet-600"
                                                style={{ height:`${Math.max((month.count / maxMonthlyApplications) * 75, month.count ? 8 : 2)}%` }}
                                                aria-label={`${month.label}: ${month.count} applications`}
                                            />
                                            <span className="text-xs text-gray-500">{month.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </article>
                            <article className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
                                <h2 className="mb-5 text-lg font-semibold">Application outcomes</h2>
                                {Object.entries(analytics.countsByStatus).map(([status, count]) => {
                                    const percentage = analytics.totalApplications
                                        ? Math.round((count / analytics.totalApplications) * 100)
                                        : 0;
                                    return (
                                        <div key={status} className="mb-4">
                                            <div className="mb-1 flex justify-between text-sm capitalize">
                                                <span>{status}</span><span>{count} ({percentage}%)</span>
                                            </div>
                                            <div className="h-2 rounded bg-gray-100">
                                                <div className="h-2 rounded bg-violet-600" style={{ width:`${percentage}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </article>
                        </section>
                        <section className="mt-6 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold">Jobs attracting the most applicants</h2>
                            {analytics.topJobs.length ? (
                                <div className="divide-y">
                                    {analytics.topJobs.map((job) => (
                                        <div key={job.id} className="flex items-center justify-between py-3">
                                            <div>
                                                <p className="font-medium">{job.title}</p>
                                                <p className="text-sm text-gray-500">Posted {new Date(job.postedAt).toLocaleDateString()}</p>
                                            </div>
                                            <span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-800">
                                                {job.applications} applicants
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-gray-500">Post a job to start seeing applicant analytics.</p>}
                        </section>
                    </>
                ) : (
                    <div className="surface-card px-6 py-12 text-center text-sm text-gray-500">
                        Analytics will appear here once jobs and applications are available.
                    </div>
                )}
            </main>
        </div>
    );
};

export default Analytics;
