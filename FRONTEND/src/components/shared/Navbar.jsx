import React, { useEffect, useState } from 'react'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { LogOut, Menu, Sparkles, UserRound, X } from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'
import NotificationLink from '../NotificationLink'

const Navbar = () => {
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const logoutHandler = async () => {
        try {
            const response = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (response.data.success) {
                dispatch(setUser(null));
                navigate("/");
                toast.success(response.data.message);
            }
        } catch (error) {
            console.error("Unable to log out:", error);
            toast.error(error.response?.data?.message || "Unable to log out. Please try again.");
        }
    };

    const navLinkClass = ({ isActive }) => `site-nav-link ${isActive ? "text-violet-800" : ""}`;
    const navigation = user?.role === "recruiter"
        ? [
            { label: "Dashboard", to: "/admin/companies" },
            { label: "Jobs", to: "/admin/jobs" },
            { label: "Analytics", to: "/admin/analytics" }
        ]
        : [
            { label: "Home", to: "/" },
            { label: "Explore jobs", to: "/jobs" },
            ...(user?.role === "student" ? [
                { label: "AI Copilot", to: "/copilot" },
                { label: "Saved jobs", to: "/saved-jobs" }
            ] : [])
        ];

    const renderNavigation = () => (
        <>
            {navigation.map(({ label, to }) => (
                <li key={to}>
                    <NavLink
                        to={to}
                        end={to === "/"}
                        className={to === "/copilot" ? "site-nav-ai-link" : navLinkClass}
                    >
                        {to === "/copilot" && <Sparkles aria-hidden="true" className="h-4 w-4" />}
                        {label}
                    </NavLink>
                </li>
            ))}
            {user?.role === "student" && (
                <li className="flex items-center px-3 py-2">
                    <NotificationLink userId={user._id} />
                </li>
            )}
        </>
    );

    const userMenu = user && (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label="Open account menu"
                    className="flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                    <Avatar className="h-9 w-9 ring-2 ring-white">
                        <AvatarImage
                            src={user?.profile?.profilePhoto || "/default-avatar.svg"}
                            alt={`${user?.fullname || "User"} profile`}
                            onError={event => { event.currentTarget.src = "/default-avatar.svg"; }}
                        />
                    </Avatar>
                    <span className="hidden max-w-32 truncate text-sm font-medium text-gray-700 sm:block">{user.fullname}</span>
                </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 rounded-2xl border-gray-200 p-3 shadow-xl">
                <div className="flex items-center gap-3 border-b border-gray-100 px-2 pb-3">
                    <Avatar className="h-11 w-11">
                        <AvatarImage
                            src={user?.profile?.profilePhoto || "/default-avatar.svg"}
                            alt={`${user?.fullname || "User"} profile`}
                            onError={event => { event.currentTarget.src = "/default-avatar.svg"; }}
                        />
                    </Avatar>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{user.fullname}</p>
                        <p className="truncate text-xs text-gray-500">{user.email}</p>
                    </div>
                </div>
                <div className="grid gap-1 pt-2">
                    <Button asChild variant="ghost" className="justify-start rounded-xl">
                        <Link to="/profile"><UserRound className="mr-2 h-4 w-4" />View profile</Link>
                    </Button>
                    <Button type="button" onClick={logoutHandler} variant="ghost" className="justify-start rounded-xl text-gray-600 hover:text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />Sign out
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );

    return (
        <header className="site-header">
            <div className="site-header-inner">
                <Link to="/" aria-label="Hirely home" className="flex shrink-0 items-center gap-2">
                    <img src="/logo.svg" alt="" className="h-9 w-9 object-contain" />
                    <span className="text-xl font-extrabold tracking-tight text-gray-950">
                        Hire<span className="text-violet-600">ly</span>
                    </span>
                </Link>

                <nav aria-label="Main navigation" className="hidden md:block">
                    <ul className="flex items-center gap-1">{renderNavigation()}</ul>
                </nav>

                <div className="hidden items-center gap-3 md:flex">
                    {!user ? (
                        <>
                            <Button asChild variant="ghost" className="rounded-xl text-gray-700">
                                <Link to="/login">Sign in</Link>
                            </Button>
                            <Button asChild className="rounded-xl bg-violet-600 px-5 shadow-sm hover:bg-violet-700">
                                <Link to="/signup">Create account</Link>
                            </Button>
                        </>
                    ) : userMenu}
                </div>

                <div className="flex items-center gap-2 md:hidden">
                    {user && userMenu}
                    <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                        aria-expanded={mobileMenuOpen}
                        onClick={() => setMobileMenuOpen(current => !current)}
                        className="h-10 w-10 rounded-xl border-gray-200"
                    >
                        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {mobileMenuOpen && (
                <div className="border-t border-gray-100 bg-white px-4 py-3 shadow-lg md:hidden">
                    <nav aria-label="Mobile navigation">
                        <ul className="grid gap-1">{renderNavigation()}</ul>
                    </nav>
                    {!user && (
                        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3">
                            <Button asChild variant="outline" className="rounded-xl">
                                <Link to="/login">Sign in</Link>
                            </Button>
                            <Button asChild className="rounded-xl bg-violet-600 hover:bg-violet-700">
                                <Link to="/signup">Create account</Link>
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Navbar;
