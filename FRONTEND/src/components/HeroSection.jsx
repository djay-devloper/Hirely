import React, { useMemo, useState } from 'react'
import { ArrowRight, BriefcaseBusiness, MapPin, Search, Sparkles } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const [activeSuggestion, setActiveSuggestion] = useState(-1);
    const { allJobs = [] } = useSelector(store => store.job);
    const navigate = useNavigate();

    const suggestions = useMemo(() => {
        const searchTerm = query.trim().toLowerCase();
        if (!searchTerm) return [];

        const uniqueSuggestions = new Map();
        allJobs.forEach(job => {
            [
                { value: job?.title, detail: job?.company?.name || "Job title" },
                { value: job?.company?.name, detail: "Company" },
                { value: job?.location, detail: "Location" }
            ].forEach(({ value, detail }) => {
                const normalizedValue = value?.trim();
                if (normalizedValue && normalizedValue.toLowerCase().includes(searchTerm)) {
                    const key = normalizedValue.toLowerCase();
                    if (!uniqueSuggestions.has(key)) {
                        uniqueSuggestions.set(key, { value: normalizedValue, detail });
                    }
                }
            });
        });

        return Array.from(uniqueSuggestions.values()).slice(0, 5);
    }, [allJobs, query]);

    const searchJobHandler = (event, searchQuery = query) => {
        event?.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('keyword', searchQuery.trim());
        const queryString = params.toString();
        navigate(`/jobs${queryString ? `?${queryString}` : ''}`);
    };

    const selectSuggestion = suggestion => {
        setQuery(suggestion.value);
        setIsSuggestionsOpen(false);
        setActiveSuggestion(-1);
        searchJobHandler(null, suggestion.value);
    };

    const handleSearchKeyDown = event => {
        if (event.key === "ArrowDown" && suggestions.length > 0) {
            event.preventDefault();
            setIsSuggestionsOpen(true);
            setActiveSuggestion(index => (index + 1) % suggestions.length);
        } else if (event.key === "ArrowUp" && suggestions.length > 0) {
            event.preventDefault();
            setActiveSuggestion(index => index <= 0 ? suggestions.length - 1 : index - 1);
        } else if (event.key === "Enter" && activeSuggestion >= 0) {
            event.preventDefault();
            selectSuggestion(suggestions[activeSuggestion]);
        } else if (event.key === "Escape") {
            setIsSuggestionsOpen(false);
            setActiveSuggestion(-1);
        }
    };

    return (
        <section className="relative isolate overflow-hidden bg-white">
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -left-40 -top-56 h-[34rem] w-[34rem] rounded-full bg-violet-100/70 blur-3xl" />
                <div className="absolute -right-36 top-16 h-[28rem] w-[28rem] rounded-full bg-blue-50 blur-3xl" />
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-gray-50 to-transparent" />
            </div>

            <div className="page-container grid min-h-[570px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
                <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-3.5 py-2 text-sm font-medium text-violet-800 shadow-sm">
                        <Sparkles className="h-4 w-4" />
                        Your next opportunity starts here
                    </div>
                    <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-gray-950 sm:text-5xl lg:text-6xl">
                        Work that moves
                        <span className="block bg-gradient-to-r from-violet-700 to-indigo-500 bg-clip-text text-transparent">your life forward.</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg lg:mx-0">
                        Find thoughtful teams, meaningful roles, and the next step that fits your ambitions.
                    </p>

                    <div className="relative mx-auto mt-8 max-w-xl lg:mx-0">
                        <form onSubmit={searchJobHandler} className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg shadow-gray-900/[0.06] ring-1 ring-black/[0.02] focus-within:border-violet-300 focus-within:ring-4 focus-within:ring-violet-100">
                            <Search className="ml-3 h-5 w-5 shrink-0 text-gray-400" />
                            <Input
                                type="search"
                                value={query}
                                onChange={event => {
                                    setQuery(event.target.value);
                                    setIsSuggestionsOpen(true);
                                    setActiveSuggestion(-1);
                                }}
                                onFocus={() => setIsSuggestionsOpen(true)}
                                onBlur={() => setIsSuggestionsOpen(false)}
                                onKeyDown={handleSearchKeyDown}
                                placeholder="Job title, skill, or company"
                                aria-label="Search jobs"
                                aria-autocomplete="list"
                                aria-expanded={isSuggestionsOpen && suggestions.length > 0}
                                aria-controls="home-job-search-suggestions"
                                aria-activedescendant={activeSuggestion >= 0 ? `home-job-suggestion-${activeSuggestion}` : undefined}
                                className="h-12 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0"
                            />
                            <Button type="submit" className="h-12 shrink-0 rounded-xl bg-violet-600 px-5 font-semibold hover:bg-violet-700">
                                Search <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                        {isSuggestionsOpen && suggestions.length > 0 && (
                            <ul
                                id="home-job-search-suggestions"
                                role="listbox"
                                aria-label="Job search suggestions"
                                className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl shadow-gray-900/10"
                            >
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={`${suggestion.value}-${suggestion.detail}`}
                                        id={`home-job-suggestion-${index}`}
                                        role="option"
                                        aria-selected={activeSuggestion === index}
                                    >
                                        <button
                                            type="button"
                                            onMouseDown={event => event.preventDefault()}
                                            onClick={() => selectSuggestion(suggestion)}
                                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${activeSuggestion === index ? "bg-violet-50" : "hover:bg-gray-50"}`}
                                        >
                                            {suggestion.detail === "Location" ? (
                                                <MapPin className="h-4 w-4 shrink-0 text-violet-600" />
                                            ) : (
                                                <Search className="h-4 w-4 shrink-0 text-violet-600" />
                                            )}
                                            <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">{suggestion.value}</span>
                                            <span className="shrink-0 text-xs text-gray-500">{suggestion.detail}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <p className="mt-4 text-sm text-gray-500">
                        Popular: <Link className="font-medium text-gray-700 hover:text-violet-700" to="/jobs?keyword=Product">Product</Link>
                        <span className="mx-2 text-gray-300">·</span>
                        <Link className="font-medium text-gray-700 hover:text-violet-700" to="/jobs?keyword=Engineering">Engineering</Link>
                        <span className="mx-2 text-gray-300">·</span>
                        <Link className="font-medium text-gray-700 hover:text-violet-700" to="/jobs?keyword=Design">Design</Link>
                    </p>

                    <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-gray-600 lg:justify-start">
                        <span className="inline-flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-violet-600" />Curated opportunities</span>
                        <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4 text-violet-600" />Personalized job matches</span>
                    </div>
                </div>

                <div className="relative mx-auto hidden w-full max-w-lg lg:block">
                    <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-violet-200/70 via-white to-blue-100/80 blur-2xl" />
                    <div className="relative rounded-[2rem] border border-white/80 bg-white/80 p-5 shadow-2xl shadow-violet-900/10 backdrop-blur">
                        <div className="flex items-center justify-between border-b border-gray-100 px-2 pb-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-900">A better way to find work</p>
                                <p className="mt-1 text-xs text-gray-500">A few steps closer to your next role</p>
                            </div>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Made for you</span>
                        </div>
                        <div className="space-y-3 py-4">
                            {[
                                { initials: "N", company: "Northstar Labs", title: "Product Designer", details: "Remote · Full-time", color: "bg-violet-100 text-violet-700" },
                                { initials: "F", company: "Fieldnote", title: "Frontend Engineer", details: "Hybrid · Full-time", color: "bg-blue-100 text-blue-700" },
                                { initials: "O", company: "Orbit Health", title: "Growth Associate", details: "Bengaluru · Full-time", color: "bg-amber-100 text-amber-700" }
                            ].map(job => (
                                <div key={job.company} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${job.color}`}>{job.initials}</div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-medium text-gray-500">{job.company}</p>
                                        <p className="mt-0.5 truncate font-semibold text-gray-900">{job.title}</p>
                                        <p className="mt-1 text-xs text-gray-500">{job.details}</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-violet-50 px-4 py-3 text-sm">
                            <span className="font-medium text-violet-900">Your next chapter is out there.</span>
                            <Sparkles className="h-4 w-4 text-violet-600" />
                        </div>
                    </div>
                    <div className="absolute -bottom-7 -left-8 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl shadow-gray-900/10">
                        <p className="text-xs text-gray-500">Search with confidence</p>
                        <p className="mt-0.5 text-sm font-semibold text-gray-900">Find a role that fits</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
