import React, { useEffect, useState } from 'react'
import { BriefcaseBusiness, CheckCircle2, ImagePlus, Loader2, ShieldCheck, Sparkles } from 'lucide-react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'

const Signup = () => {
    const [input, setInput] = useState({
        fullname: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "",
        file: null
    });
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);
    const navigate = useNavigate();

    const changeEventHandler = event => {
        setInput(current => ({ ...current, [event.target.name]: event.target.value }));
    };

    const changeFileHandler = event => {
        const file = event.target.files?.[0] || null;
        if (file && !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            toast.error("Choose a JPG, PNG, or WebP profile picture.");
            event.target.value = "";
            return;
        }
        if (file && file.size > 5 * 1024 * 1024) {
            toast.error("Profile pictures must be 5 MB or smaller.");
            event.target.value = "";
            return;
        }
        setInput(current => ({ ...current, file }));
    };

    const submitHandler = async event => {
        event.preventDefault();
        const formData = new FormData();
        formData.append("fullname", input.fullname.trim());
        formData.append("email", input.email.trim());
        formData.append("phoneNumber", input.phoneNumber.trim());
        formData.append("password", input.password);
        formData.append("role", input.role);
        if (input.file) formData.append("file", input.file);

        try {
            setLoading(true);
            const response = await axios.post(`${USER_API_END_POINT}/register`, formData, {
                withCredentials: true
            });
            if (response.data.success) {
                navigate("/login");
                toast.success(response.data.message);
            }
        } catch (error) {
            console.error("Unable to create account:", error);
            toast.error(error.response?.data?.message || "Unable to create your account. Please try again.");
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
                <div className="auth-shell md:grid-cols-[1.05fr_.95fr]">
                    <aside className="auth-visual">
                        <div className="relative">
                            <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold text-white">
                                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><BriefcaseBusiness className="h-5 w-5" /></span>
                                Hirely
                            </Link>
                            <div className="mt-24">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-violet-100">
                                    <Sparkles className="h-3.5 w-3.5" /> Make your next move count
                                </span>
                                <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight">A better career—or a better team—starts here.</h1>
                                <p className="mt-4 leading-7 text-gray-300">Create your free account and make every opportunity count.</p>
                            </div>
                        </div>
                        <div className="relative space-y-3">
                            {["A profile that shows what makes you different", "Tools built for candidates and hiring teams", "Your search and hiring journey, all in one place"].map(item => (
                                <p key={item} className="flex items-center gap-2 text-sm text-gray-200">
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-violet-300" />{item}
                                </p>
                            ))}
                        </div>
                    </aside>

                    <div className="auth-form-panel">
                        <form onSubmit={submitHandler} className="w-full max-w-md">
                            <div className="mb-7">
                                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 md:hidden">
                                    <BriefcaseBusiness className="h-5 w-5" />
                                </span>
                                <p className="mt-5 text-sm font-semibold text-violet-700">START SOMETHING GOOD</p>
                                <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">Create your account</h2>
                                <p className="mt-2 text-sm leading-6 text-gray-500">Join Hirely as a candidate or recruiter.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-fullname" className="text-sm font-semibold text-gray-700">Full name</Label>
                                    <Input
                                        id="signup-fullname"
                                        type="text"
                                        name="fullname"
                                        autoComplete="name"
                                        required
                                        value={input.fullname}
                                        onChange={changeEventHandler}
                                        placeholder="Your name"
                                        className="form-control"
                                    />
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email" className="text-sm font-semibold text-gray-700">Email address</Label>
                                        <Input
                                            id="signup-email"
                                            type="email"
                                            name="email"
                                            autoComplete="email"
                                            required
                                            value={input.email}
                                            onChange={changeEventHandler}
                                            placeholder="you@example.com"
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-phone" className="text-sm font-semibold text-gray-700">Phone number</Label>
                                        <Input
                                            id="signup-phone"
                                            type="tel"
                                            name="phoneNumber"
                                            autoComplete="tel"
                                            required
                                            value={input.phoneNumber}
                                            onChange={changeEventHandler}
                                            placeholder="Your phone"
                                            className="form-control"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password" className="text-sm font-semibold text-gray-700">Password</Label>
                                    <Input
                                        id="signup-password"
                                        type="password"
                                        name="password"
                                        autoComplete="new-password"
                                        required
                                        value={input.password}
                                        onChange={changeEventHandler}
                                        placeholder="Create a password"
                                        className="form-control"
                                    />
                                </div>

                                <fieldset>
                                    <legend className="mb-2 text-sm font-semibold text-gray-700">Choose your account type</legend>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { value: "student", title: "Candidate", note: "Explore new roles" },
                                            { value: "recruiter", title: "Recruiter", note: "Find great people" }
                                        ].map(option => (
                                            <label
                                                key={option.value}
                                                htmlFor={`signup-role-${option.value}`}
                                                className={`cursor-pointer rounded-xl border p-3 transition ${input.role === option.value ? "border-violet-400 bg-violet-50 ring-2 ring-violet-100" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <input
                                                        id={`signup-role-${option.value}`}
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

                                <div className="space-y-2">
                                    <Label htmlFor="signup-photo" className="text-sm font-semibold text-gray-700">Profile picture <span className="font-normal text-gray-400">(optional)</span></Label>
                                    <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50/70 p-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-700 shadow-sm">
                                            <ImagePlus className="h-5 w-5" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <Input
                                                id="signup-photo"
                                                accept="image/jpeg,image/png,image/webp"
                                                type="file"
                                                onChange={changeFileHandler}
                                                className="h-auto border-0 bg-transparent p-0 text-xs shadow-none file:mr-2 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-semibold file:text-gray-700 hover:file:bg-violet-50"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                {input.file ? input.file.name : "JPG, PNG, or WebP · up to 5 MB"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-violet-600 text-base font-semibold shadow-sm hover:bg-violet-700">
                                    {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : "Create account"}
                                </Button>
                            </div>
                            <p className="mt-5 text-center text-sm text-gray-500">
                                Already have an account? <Link to="/login" className="font-semibold text-violet-700 hover:text-violet-800">Sign in</Link>
                            </p>
                            <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                                <ShieldCheck className="h-4 w-4" />Your information stays private and secure
                            </p>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Signup;
