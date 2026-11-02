import React from 'react'
import Navbar from './shared/Navbar'
import Job from './Job'
import useGetSavedJobs from '@/hooks/useGetSavedJobs'
import { useSelector } from 'react-redux'
import { Bookmark, Search } from 'lucide-react'
import { Button } from './ui/button'
import { Link } from 'react-router-dom'

const SavedJobs = () => {
    useGetSavedJobs();
    const { savedJobs: persistedSavedJobs } = useSelector(store => store.job);
    const savedJobs = Array.isArray(persistedSavedJobs) ? persistedSavedJobs : [];

    return (
        <div>
            <Navbar />
            <main className="page-container py-8 sm:py-10">
                <header className="mb-7 flex items-center gap-4 rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-6 sm:p-8">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-sm">
                        <Bookmark className="h-5 w-5" />
                    </span>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-950">Saved jobs</h1>
                        <p className="mt-1 text-sm text-gray-600">Keep the roles you love close while you decide what comes next.</p>
                    </div>
                </header>
                {savedJobs.length ? (
                    <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                        {savedJobs.map((job) => <Job key={job._id} job={job} />)}
                    </div>
                ) : (
                    <div className="surface-card px-6 py-14 text-center">
                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-500">
                            <Bookmark className="h-6 w-6" />
                        </span>
                        <h2 className="mt-4 text-lg font-semibold text-gray-900">Your shortlist starts here</h2>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">Save jobs that catch your eye and come back when you&apos;re ready to apply.</p>
                        <Button asChild className="mt-5 rounded-xl bg-violet-600 hover:bg-violet-700">
                            <Link to="/jobs"><Search className="mr-2 h-4 w-4" />Explore jobs</Link>
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SavedJobs;
