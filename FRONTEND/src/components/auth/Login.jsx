import React, { useEffect, useState } from 'react'
import { BriefcaseBusiness, CheckCircle2, Loader2, ShieldCheck, Sparkles } from 'lucide-react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setUser } from '@/redux/authSlice'

const Login = () => {
    const [input, setInput] = useState({ email: "", password: "", role: "" });
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = event => {
        setInput(current => ({ ...current, [event.target.name]: event.target.value }));
    };

    const submitHandler = async event => {
        event.preventDefault();
        try {
            setLoading(true);
            const response = await axios.post(`${USER_API_END_POINT}/login`, input, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true
            });
            if (response.data.success) {
                dispatch(setUser(response.data.user));
                navigate("/");
                toast.success(response.data.message);
            }
        } catch (error) {
            console.error("Unable to sign in:", error);
            toast.error(error.response?.data?.message || "Unable to sign in. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) navigate("/");
    }, [navigate, user]);

    return (
        <div className="min-h-screen">
            <Navbar />
            <main className="page-container">
                <div className="auth-shell">
                    <aside className="auth-visual">
                        <div className="relative">
                            <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold text-white">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><BriefcaseBusiness className="h-5 w-5" /></span>
                                Hirely
                            </Link>
                            <div className="mt-24">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-violet-100">
                                    <Sparkles className="h-3.5 w-3.5" /> A more thoughtful way to work
                                </span>
                                <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight">Good work starts with the right connection.</h1>
                                <p className="mt-4 leading-7 text-gray-300">Find a role that fits your ambitions, or find the people who will shape what comes next.</p>
                            </div>
                        </div>
                        <div className="relative space-y-3">
                            {["Discover opportunities built around your strengths", "Keep your career journey organized", "Connect with teams that are ready to grow"].map(item => (
                                <p key={item} className="flex items-center gap-2 text-sm text-gray-200">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-300" />{item}
                                </p>
                            ))}
                        </div>
                    </aside>

                    <div className="auth-form-panel">
                        <form onSubmit={submitHandler} className="w-full max-w-md">
                            <div className="mb-8">
                                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 md:hidden">
                                    <BriefcaseBusiness className="h-5 w-5" />
                                </span>
                                <p className="mt-5 text-sm font-semibold text-violet-700">WELCOME BACK</p>
                                <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">Sign in to Hirely</h2>
                                <p className="mt-2 text-sm leading-6 text-gray-500">Pick up where you left off and take the next step.</p>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email" className="text-sm font-semibold text-gray-700">Email address</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={input.email}
                                        name="email"
                                        onChange={changeEventHandler}
                                        placeholder="you@example.com"
                                        className="form-control"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password" className="text-sm font-semibold text-gray-700">Password</Label>
                                    <Input
                                        id="login-password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={input.password}
                                        name="password"
                                        onChange={changeEventHandler}
                                        placeholder="Enter your password"
                                        className="form-control"
                                    />
                                </div>
                                <fieldset>
                                    <legend className="mb-2 text-sm font-semibold text-gray-700">I&apos;m signing in as</legend>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { value: "student", title: "Candidate", note: "Find your next role" },
                                            { value: "recruiter", title: "Recruiter", note: "Build your team" }
                                        ].map(option => (
                                            <label
                                                key={option.value}
                                                htmlFor={`login-role-${option.value}`}
                                                className={`cursor-pointer rounded-xl border p-3 transition ${input.role === option.value ? "border-violet-400 bg-violet-50 ring-2 ring-violet-100" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <input
                                                        id={`login-role-${option.value}`}
                                                        type="radio"
                                                        name="role"
                                                        value={option.value}
                                                        checked={input.role === option.value}
                                                        onChange={changeEventHandler}
                                                        required
                                                        className="accent-violet-600"
                                                    />
                                                    <span className="text-sm font-semibold text-gray-900">{option.title}</span>
                                                </span>
                                                <span className="mt-1 block pl-6 text-xs text-gray-500">{option.note}</span>
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                                <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-violet-600 text-base font-semibold shadow-sm hover:bg-violet-700">
                                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : "Sign in"}
                                </Button>
                            </div>
                            <p className="mt-6 text-center text-sm text-gray-500">
                                New to Hirely? <Link to="/signup" className="font-semibold text-violet-700 hover:text-violet-800">Create an account</Link>
                            </p>
                            <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                                <ShieldCheck className="h-4 w-4" />Your account is protected and secure
                            </p>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;
