import React from 'react'
import { ArrowUpRight, BriefcaseBusiness } from 'lucide-react'
import { Link } from 'react-router-dom'

const Footer = () => (
    <footer className="mt-12 border-t border-gray-200 bg-white">
        <div className="page-container grid gap-8 py-10 sm:grid-cols-[1fr_auto] sm:items-center sm:py-12">
            <div>
                <Link to="/" className="inline-flex items-center gap-2 text-lg font-extrabold tracking-tight text-gray-950">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                        <BriefcaseBusiness className="h-4 w-4" />
                    </span>
                    <span>Hire<span className="text-violet-600">ly</span></span>
                </Link>
                <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
                    Better connections between ambitious people and the teams ready to grow.
                </p>
            </div>
            <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-gray-600">
                <Link to="/jobs" className="transition hover:text-violet-700">Explore jobs</Link>
                <Link to="/signup" className="transition hover:text-violet-700">Create an account</Link>
                <Link to="/login" className="inline-flex items-center gap-1 transition hover:text-violet-700">Sign in <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            </nav>
            <p className="border-t border-gray-100 pt-5 text-xs text-gray-400 sm:col-span-2">
                © {new Date().getFullYear()} Hirely. Your next chapter starts here.
            </p>
        </div>
    </footer>
);

export default Footer;
