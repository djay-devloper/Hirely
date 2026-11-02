import React from 'react'
import { ArrowRight } from 'lucide-react'
import LatestJobCards from './LatestJobCards'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'

const LatestJobs = () => {
    const { allJobs } = useSelector(store => store.job);

    return (
        <section className="bg-gray-50/80 py-14 sm:py-20">
            <div className="page-container">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-700">Handpicked for you</p>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">Latest opportunities</h2>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">Explore new openings from teams looking for their next great hire.</p>
                    </div>
                    <Link to="/jobs" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50">
                        See all jobs <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                {allJobs.length <= 0 ? (
                    <div className="surface-card px-6 py-12 text-center">
                        <h3 className="font-semibold text-gray-900">New opportunities are on the way</h3>
                        <p className="mt-1 text-sm text-gray-500">Check back soon for the latest roles.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {allJobs.slice(0, 6).map(job => <LatestJobCards key={job._id} job={job} />)}
                    </div>
                )}
            </div>
        </section>
    );
};

export default LatestJobs;
