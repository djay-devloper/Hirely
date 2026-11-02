import React, { useState } from 'react'
import { ArrowUpRight, Bot, BriefcaseBusiness, Loader2, MessageCircle, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'sonner'
import Navbar from './shared/Navbar'
import { Button } from './ui/button'
import { useSelector } from 'react-redux'
import { COPILOT_API_END_POINT } from '@/utils/constant'

const requirementLabel = status => ({
    supported: 'Evidence found',
    partial: 'Some evidence',
    not_evidenced: 'Not found in resume'
}[status] || 'Not found in resume')

const CopilotQuestion = ({ jobId }) => {
    const [question, setQuestion] = useState('')
    const [answer, setAnswer] = useState(null)
    const [loading, setLoading] = useState(false)

    const askQuestion = async event => {
        event.preventDefault()
        if (!question.trim() || loading) return

        try {
            setLoading(true)
            const response = await axios.post(`${COPILOT_API_END_POINT}/chat`, {
                jobId,
                question: question.trim()
            }, { withCredentials: true })
            if (!response.data.success) throw new Error(response.data.message || 'Unable to answer that question.')
            setAnswer(response.data)
            setQuestion('')
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Unable to answer that question.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className="mt-5 border-t border-gray-100 pt-4">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <MessageCircle className="h-4 w-4 text-violet-600" />Ask about this job
            </h4>
            <p className="mt-1 text-xs text-gray-500">Answers use only this listing. Your resume is not sent for job questions.</p>
            <form onSubmit={askQuestion} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                    value={question}
                    onChange={event => setQuestion(event.target.value)}
                    maxLength={500}
                    aria-label="Ask a question about this job"
                    placeholder="For example: Which experience level is required?"
                    className="min-h-10 min-w-0 flex-1 rounded-xl border border-gray-200 px-3 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
                <Button type="submit" disabled={loading || !question.trim()} className="rounded-xl bg-violet-600 hover:bg-violet-700">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ask'}
                </Button>
            </form>
            {answer && (
                <div className="mt-3 rounded-xl bg-violet-50 p-4 text-sm">
                    <p className="leading-6 text-gray-800">{answer.answer}</p>
                    {answer.sourceQuotes?.length > 0 && (
                        <div className="mt-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">From the job listing</p>
                            <ul className="mt-1 space-y-1">
                                {answer.sourceQuotes.map((quote, index) => <li key={`${quote}-${index}`} className="border-l-2 border-violet-300 pl-2 text-xs text-gray-600">{quote}</li>)}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}

const CopilotMatch = ({ match }) => {
    const { job, analysis, semanticRelevance } = match
    return (
        <article className="surface-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium text-violet-700">{job.company?.name || 'Hiring team'} · {job.location}</p>
                    <h3 className="mt-1 text-xl font-bold text-gray-950">{job.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">{analysis.explanation}</p>
                </div>
                <div className="shrink-0 rounded-xl bg-violet-50 px-3 py-2 text-center">
                    <p className="text-xl font-bold text-violet-800">{semanticRelevance}%</p>
                    <p className="text-[11px] text-violet-700">semantic relevance</p>
                </div>
            </div>
            <p className="mt-3 text-xs text-gray-500">Relevance is based on resume/job text similarity, not hiring likelihood or a qualification decision.</p>

            {analysis.requirements?.length > 0 && (
                <section className="mt-5">
                    <h4 className="text-sm font-semibold text-gray-900">Requirements and resume evidence</h4>
                    <ul className="mt-2 space-y-3">
                        {analysis.requirements.map((item, index) => (
                            <li key={`${item.requirement}-${index}`} className="rounded-xl border border-gray-100 p-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-sm font-medium text-gray-800">{item.requirement}</span>
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.status === 'supported' ? 'bg-emerald-50 text-emerald-700' : item.status === 'partial' ? 'bg-amber-50 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                                        {requirementLabel(item.status)}
                                    </span>
                                </div>
                                {item.resumeEvidence && <p className="mt-2 border-l-2 border-emerald-300 pl-2 text-xs leading-5 text-gray-600"><strong className="text-gray-700">Resume:</strong> “{item.resumeEvidence}”</p>}
                                {item.jobEvidence && <p className="mt-1 border-l-2 border-violet-300 pl-2 text-xs leading-5 text-gray-600"><strong className="text-gray-700">Job:</strong> “{item.jobEvidence}”</p>}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {analysis.suggestions?.length > 0 && (
                <section className="mt-5 rounded-xl bg-amber-50/70 p-4">
                    <h4 className="text-sm font-semibold text-amber-950">Ways to present your experience clearly</h4>
                    <p className="mt-1 text-xs text-amber-900">Use only suggestions that accurately reflect work you have done.</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                        {analysis.suggestions.map((suggestion, index) => <li key={`${suggestion}-${index}`}>{suggestion}</li>)}
                    </ul>
                </section>
            )}

            <CopilotQuestion jobId={job._id} />
            <div className="mt-4 border-t border-gray-100 pt-4">
                <Button asChild variant="outline" className="rounded-xl">
                    <Link to={`/description/${job._id}`}>View full listing <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
                </Button>
            </div>
        </article>
    )
}

const Copilot = () => {
    const { user } = useSelector(store => store.auth)
    const [consent, setConsent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)

    const findMatches = async () => {
        if (!consent || loading) return
        try {
            setLoading(true)
            setResult(null)
            const response = await axios.post(`${COPILOT_API_END_POINT}/matches`, { consent }, { withCredentials: true })
            if (!response.data.success) throw new Error(response.data.message || 'Unable to analyze your resume.')
            setResult(response.data)
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Unable to analyze your resume.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50/60">
            <Navbar />
            <main className="page-container py-8 sm:py-10">
                <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-900 p-6 text-white shadow-xl shadow-violet-950/10 sm:p-9">
                    <div className="flex items-start gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10"><Sparkles className="h-6 w-6" /></span>
                        <div>
                            <p className="text-sm font-semibold text-violet-200">Hirely AI</p>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Job Match Copilot</h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-violet-100">
                                Discover relevant roles, see which requirements your resume supports, and ask questions grounded in each job listing.
                            </p>
                        </div>
                    </div>
                    {!user ? (
                        <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4">
                            <p className="text-sm">Sign in as a candidate to use Job Match Copilot.</p>
                            <Button asChild className="mt-3 rounded-xl bg-white text-violet-900 hover:bg-violet-50">
                                <Link to="/login">Sign in <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </div>
                    ) : user.role !== 'student' ? (
                        <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4">
                            <p className="text-sm">Job Match Copilot is available to candidate accounts.</p>
                        </div>
                    ) : !user?.profile?.resume ? (
                        <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4">
                            <p className="text-sm">Add a PDF resume to your candidate profile before getting matches.</p>
                            <Button asChild className="mt-3 rounded-xl bg-white text-violet-900 hover:bg-violet-50">
                                <Link to="/profile">Go to profile <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4">
                            <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-violet-50">
                                <input
                                    type="checkbox"
                                    checked={consent}
                                    onChange={event => setConsent(event.target.checked)}
                                    className="mt-1 h-4 w-4 accent-violet-300"
                                />
                                <span>
                                    I agree to send my saved resume PDF to Google Gemini for this analysis. The resume is processed to extract skills and compare jobs, and Hirely does not save the AI analysis. Do not use this as a hiring decision.
                                </span>
                            </label>
                            <Button
                                type="button"
                                disabled={!consent || loading}
                                onClick={findMatches}
                                className="mt-4 rounded-xl bg-white px-5 font-semibold text-violet-900 hover:bg-violet-50 disabled:bg-white/50"
                            >
                                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing resume and jobs...</> : <><Sparkles className="mr-2 h-4 w-4" />Find my matches</>}
                            </Button>
                        </div>
                    )}
                </section>

                {result && (
                    <div className="mt-8 space-y-6">
                        <section className="surface-card p-5 sm:p-6">
                            <div className="flex items-center gap-2">
                                <Bot className="h-5 w-5 text-violet-600" />
                                <h2 className="text-lg font-bold text-gray-950">Resume snapshot</h2>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-gray-600">{result.resumeProfile.summary || 'No summary could be extracted.'}</p>
                            {result.resumeProfile.skills?.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {result.resumeProfile.skills.map((skill, index) => <span key={`${skill}-${index}`} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800">{skill}</span>)}
                                </div>
                            )}
                            {result.resumeProfile.experience?.length > 0 && (
                                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                                    {result.resumeProfile.experience.map((item, index) => (
                                        <li key={`${item.role}-${index}`} className="rounded-xl bg-gray-50 p-3">
                                            <p className="text-sm font-semibold text-gray-900">{item.role || 'Experience'}</p>
                                            {item.organization && <p className="text-xs text-gray-500">{item.organization}</p>}
                                            {item.highlights?.length > 0 && <p className="mt-2 text-xs leading-5 text-gray-600">{item.highlights.join(' · ')}</p>}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section>
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-950">Relevant jobs</h2>
                                    <p className="mt-1 text-sm text-gray-500">Ranked by semantic similarity to your resume.</p>
                                </div>
                                <BriefcaseBusiness className="h-5 w-5 text-violet-600" />
                            </div>
                            {result.matches.length ? (
                                <div className="space-y-4">{result.matches.map(match => <CopilotMatch key={match.job._id} match={match} />)}</div>
                            ) : (
                                <div className="surface-card p-8 text-center">
                                    <p className="font-semibold text-gray-900">No jobs are listed yet.</p>
                                    <p className="mt-1 text-sm text-gray-500">Check back after recruiters post open roles.</p>
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </main>
        </div>
    )
}

export default Copilot
