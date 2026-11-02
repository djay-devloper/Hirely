import React from 'react'
import { BriefcaseBusiness, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import Navbar from './shared/Navbar'
import FilterCard from './FilterCard'
import Job from './Job'
import { Button } from './ui/button'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'
import useGetSavedJobs from '@/hooks/useGetSavedJobs'
import { useSearchParams } from 'react-router-dom'
import AlertSubscription from './AlertSubscription'

const Jobs = () => {
    useGetAllJobs();
    useGetAppliedJobs();
    useGetSavedJobs();
    const { allJobs, jobsPagination: persistedPagination } = useSelector(store => store.job);
    const jobsPagination = persistedPagination || { page: 1, limit: 12, totalJobs: 0, totalPages: 0 };
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = Number(searchParams.get("page") || 1);
    const keyword = searchParams.get("keyword") || "";

    const changePage = page => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("page", String(page));
        setSearchParams(nextParams);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="page-container py-8 sm:py-10">
                <header className="mb-7 rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-blue-50 px-5 py-7 sm:px-8 sm:py-9">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700">
                        <BriefcaseBusiness className="h-4 w-4" /> THE RIGHT ROLE IS OUT THERE
                    </p>
                    <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">Find work that fits.</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
                                Search openings by role, location, and the way you want to work.
                            </p>
                        </div>
                        <div className="rounded-xl border border-white bg-white/80 px-4 py-2.5 shadow-sm">
                            <p className="text-xs font-medium text-gray-500">Open opportunities</p>
                            <p className="mt-0.5 text-xl font-bold text-gray-950">{jobsPagination.totalJobs}</p>
                        </div>
                    </div>
                </header>

                <div className="grid items-start gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
                    <aside className="space-y-4 lg:sticky lg:top-24">
                        <FilterCard />
                        <AlertSubscription />
                    </aside>

                    <section className="min-w-0 pb-8">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-gray-950">
                                    {keyword ? `Results for “${keyword}”` : "Recommended opportunities"}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Showing {allJobs.length} of {jobsPagination.totalJobs} {jobsPagination.totalJobs === 1 ? "role" : "roles"}
                                </p>
                            </div>
                        </div>

                        {allJobs.length === 0 ? (
                            <div className="surface-card px-6 py-16 text-center">
                                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                                    <Search className="h-6 w-6" />
                                </span>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">No matching roles yet</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                                    Try another keyword or remove a filter to discover more opportunities.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                                    {allJobs.map(job => (
                                        <motion.div
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                            key={job?._id}
                                            className="h-full"
                                        >
                                            <Job job={job} />
                                        </motion.div>
                                    ))}
                                </div>
                                <nav aria-label="Job results pages" className="mt-8 flex flex-wrap items-center justify-center gap-3">
                                    <Button
                                        type="button"
                                        disabled={currentPage <= 1}
                                        onClick={() => changePage(currentPage - 1)}
                                        variant="outline"
                                        className="rounded-xl border-gray-200"
                                    >
                                        <ChevronLeft className="mr-1 h-4 w-4" />Previous
                                    </Button>
                                    <span className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">
                                        Page {currentPage} of {Math.max(jobsPagination.totalPages, 1)}
                                    </span>
                                    <Button
                                        type="button"
                                        disabled={currentPage >= jobsPagination.totalPages}
                                        onClick={() => changePage(currentPage + 1)}
                                        variant="outline"
                                        className="rounded-xl border-gray-200"
                                    >
                                        Next<ChevronRight className="ml-1 h-4 w-4" />
                                    </Button>
                                </nav>
                            </>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Jobs;
