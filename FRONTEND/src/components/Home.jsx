import React from 'react'
import { ArrowRight, BarChart3, Building2, BriefcaseBusiness, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navbar from './shared/Navbar'
import HeroSection from './HeroSection'
import CategoryCarousel from './CategoryCarousel'
import LatestJobs from './LatestJobs'
import Footer from './shared/Footer'
import { Button } from './ui/button'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'

const Home = () => {
    useGetAllJobs(6);
    useGetAppliedJobs();
    const { user } = useSelector(store => store.auth);
    const isRecruiter = user?.role === "recruiter";

    return (
        <div className="min-h-screen">
            <Navbar />
            {isRecruiter ? (
                <>
                    <main className="page-container py-10 sm:py-14">
                        <section className="relative overflow-hidden rounded-[2rem] bg-gray-950 px-6 py-10 text-white shadow-xl shadow-violet-950/10 sm:px-10 sm:py-14 lg:px-14">
                            <div className="pointer-events-none absolute -right-20 -top-32 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
                            <div className="pointer-events-none absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
                            <div className="relative max-w-2xl">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-violet-100">
                                    <Sparkles className="h-4 w-4" /> RECRUITER WORKSPACE
                                </span>
                                <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-5xl">
                                    Build a team that moves your business forward.
                                </h1>
                                <p className="mt-4 max-w-xl leading-7 text-gray-300">
                                    Publish thoughtful roles, meet standout candidates, and keep every hiring decision moving.
                                </p>
                                <div className="mt-8 flex flex-wrap gap-3">
                                    <Button asChild className="h-11 rounded-xl bg-violet-500 px-5 font-semibold hover:bg-violet-400">
                                        <Link to="/admin/jobs/create">Post a new job <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                    </Button>
                                    <Button asChild variant="outline" className="h-11 rounded-xl border-white/20 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white">
                                        <Link to="/admin/companies">Manage companies</Link>
                                    </Button>
                                </div>
                            </div>
                        </section>

                        <section className="mt-8 grid gap-4 md:grid-cols-3">
                            {[
                                { title: "Company profile", description: "Present your organization and hiring brand.", href: "/admin/companies", icon: Building2, label: "Manage companies" },
                                { title: "Your job posts", description: "Create roles and review your active openings.", href: "/admin/jobs", icon: BriefcaseBusiness, label: "View jobs" },
                                { title: "Hiring insights", description: "Track applications and see what is working.", href: "/admin/analytics", icon: BarChart3, label: "Open analytics" }
                            ].map(({ title, description, href, icon: Icon, label }) => (
                                <Link
                                    key={title}
                                    to={href}
                                    className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-900/5"
                                >
                                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                                        <Icon className="h-5 w-5" />
                                    </span>
                                    <h2 className="mt-4 font-semibold text-gray-950">{title}</h2>
                                    <p className="mt-1 min-h-10 text-sm leading-5 text-gray-500">{description}</p>
                                    <span className="mt-4 inline-flex items-center text-sm font-semibold text-violet-700">
                                        {label}<ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </span>
                                </Link>
                            ))}
                        </section>
                    </main>
                    <Footer />
                </>
            ) : (
                <>
                    <HeroSection />
                    <CategoryCarousel />
                    <LatestJobs />
                    <Footer />
                </>
            )}
        </div>
    );
};

export default Home;
