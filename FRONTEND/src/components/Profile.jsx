import React, { useEffect, useRef, useState } from 'react'
import Navbar from './shared/Navbar'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Building2, Camera, Contact, Globe, Loader2, Mail, MapPin, Pen } from 'lucide-react'
import { Badge } from './ui/badge'
import { Label } from './ui/label'
import AppliedJobTable from './AppliedJobTable'
import UpdateProfileDialog from './UpdateProfileDialog'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { COMPANY_API_END_POINT, USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Link } from 'react-router-dom'

const Profile = () => {
    useGetAppliedJobs();
    const [open, setOpen] = useState(false);
    const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);
    const [companyLoadError, setCompanyLoadError] = useState(false);
    const photoInputRef = useRef(null);
    const {user} = useSelector(store=>store.auth);
    const dispatch = useDispatch();
    const isRecruiter = user?.role === "recruiter";

    useEffect(() => {
        if (!isRecruiter) {
            setCompanies([]);
            setCompanyLoadError(false);
            return undefined;
        }

        let isCurrent = true;
        const fetchCompanies = async () => {
            setLoadingCompanies(true);
            setCompanyLoadError(false);
            try {
                const response = await axios.get(`${COMPANY_API_END_POINT}/get`, { withCredentials: true });
                if (!response.data.success) {
                    throw new Error(response.data.message || "Unable to load company information.");
                }
                if (isCurrent) setCompanies(response.data.companies || []);
            } catch (error) {
                console.error("Unable to load recruiter companies:", error);
                if (isCurrent) {
                    setCompanyLoadError(true);
                    toast.error(error.response?.data?.message || error.message || "Unable to load company information.");
                }
            } finally {
                if (isCurrent) setLoadingCompanies(false);
            }
        };

        fetchCompanies();
        return () => {
            isCurrent = false;
        };
    }, [isRecruiter]);

    const profilePhotoHandler = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            toast.error("Choose a JPG, PNG, or WebP profile picture.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Profile pictures must be 5 MB or smaller.");
            return;
        }

        const formData = new FormData();
        formData.append("profilePhoto", file);
        try {
            setUploadingPhoto(true);
            const response = await axios.put(`${USER_API_END_POINT}/profile/photo`, formData, {
                withCredentials:true
            });
            if (!response.data.success) {
                toast.error(response.data.message || "Unable to update profile picture.");
                return;
            }
            dispatch(setUser(response.data.user));
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to update profile picture.");
        } finally {
            setUploadingPhoto(false);
        }
    };

    return (
        <div>
            <Navbar />
            <main className="page-container py-5 sm:py-8">
            <div className='surface-card mx-auto max-w-4xl p-5 sm:p-8'>
                <div className='flex flex-wrap items-start justify-between gap-5'>
                    <div className='flex items-center gap-4'>
                        <button
                            type="button"
                            onClick={() => setPhotoViewerOpen(true)}
                            disabled={uploadingPhoto}
                            aria-label="View profile picture"
                            className="group relative rounded-full ring-4 ring-violet-50 transition hover:ring-violet-100 disabled:cursor-wait"
                        >
                            <Avatar className="h-24 w-24">
                                <AvatarImage
                                    src={user?.profile?.profilePhoto || "/default-avatar.svg"}
                                    alt={`${user?.fullname || "User"} profile`}
                                    onError={(event) => {
                                        event.currentTarget.src = "/default-avatar.svg";
                                    }}
                                />
                            </Avatar>
                            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                                {uploadingPhoto ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
                            </span>
                        </button>
                        <input
                            ref={photoInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={profilePhotoHandler}
                            className="hidden"
                            aria-label="Upload profile picture"
                        />
                        <div>
                            <h1 className='font-medium text-xl'>{user?.fullname}</h1>
                            {isRecruiter && <Badge variant="secondary" className="mt-1">Recruiter</Badge>}
                            <p className="mt-1">{user?.profile?.bio || (isRecruiter ? "Add a short professional bio to introduce yourself." : "")}</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setOpen(true)}
                        className="text-right"
                        variant="outline"
                        aria-label={isRecruiter ? "Edit recruiter profile" : "Edit profile"}
                    >
                        <Pen />
                    </Button>
                </div>
                <div className='my-6 grid gap-3 border-y border-gray-100 py-5 sm:grid-cols-2'>
                    <div className='flex items-center gap-3 my-2'>
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500"><Mail className="h-4 w-4" /></span>
                        <div className="min-w-0"><p className="text-xs text-gray-500">Email</p><span className="break-all text-sm font-medium text-gray-800">{user?.email}</span></div>
                    </div>
                    <div className='flex items-center gap-3 my-2'>
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-500"><Contact className="h-4 w-4" /></span>
                        <div><p className="text-xs text-gray-500">Phone</p><span className="text-sm font-medium text-gray-800">{user?.phoneNumber}</span></div>
                    </div>
                </div>
                {!isRecruiter ? (
                    <>
                        <div className='my-5'>
                            <h2 className="font-semibold">Skills</h2>
                            <div className='flex flex-wrap items-center gap-1 mt-2'>
                                {
                                    user?.profile?.skills?.length ? user.profile.skills.map((item, index) => <Badge key={index}>{item}</Badge>) : <span>NA</span>
                                }
                            </div>
                        </div>
                        <div className='grid w-full max-w-sm items-center gap-1.5'>
                            <Label className="text-md font-bold">Resume</Label>
                            {
                                user?.profile?.resume ? <a target="_blank" rel="noopener noreferrer" href={user.profile.resume} className='text-blue-500 w-full hover:underline cursor-pointer'>{user?.profile?.resumeOriginalName || "View resume"}</a> : <span>NA</span>
                            }
                        </div>
                    </>
                ) : (
                    <section className="my-7 rounded-2xl border border-gray-100 bg-gray-50/60 p-5 sm:p-6">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="font-bold text-lg">Company information</h2>
                                <p className="text-sm text-gray-500">Organizations associated with your recruiter account.</p>
                            </div>
                            <Button asChild variant="outline">
                                <Link to="/admin/companies">Manage companies</Link>
                            </Button>
                        </div>
                        {loadingCompanies ? (
                            <div className="flex items-center gap-2 rounded-xl border p-5 text-gray-500">
                                <Loader2 className="h-4 w-4 animate-spin" /> Loading company information...
                            </div>
                        ) : companyLoadError ? (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                                Company information could not be loaded. Please try again later.
                            </div>
                        ) : companies.length ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {companies.map(company => (
                                    <article key={company._id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <Avatar className="h-12 w-12 rounded-lg">
                                                <AvatarImage src={company.logo} alt={`${company.name} logo`} />
                                                <AvatarFallback className="rounded-lg"><Building2 className="h-5 w-5" /></AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-gray-900">{company.name}</h3>
                                                {company.description && <p className="mt-1 text-sm text-gray-600">{company.description}</p>}
                                            </div>
                                        </div>
                                        <div className="mt-4 space-y-2 text-sm text-gray-600">
                                            {company.location && (
                                                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" />{company.location}</p>
                                            )}
                                            {company.website && (
                                                <a
                                                    className="flex items-center gap-2 text-blue-600 hover:underline"
                                                    href={/^[a-z][a-z\d+.-]*:\/\//i.test(company.website) ? company.website : `https://${company.website}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Globe className="h-4 w-4 shrink-0" />{company.website}
                                                </a>
                                            )}
                                            {!company.location && !company.website && (
                                                <p className="flex items-center gap-2"><Building2 className="h-4 w-4" />Company details can be added from Manage companies.</p>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
                                <Building2 className="mx-auto h-8 w-8 text-gray-400" />
                                <h3 className="mt-2 font-semibold">No company added yet</h3>
                                <p className="mt-1 text-sm text-gray-500">Add your organization to include its details on your recruiter profile.</p>
                                <Button asChild className="mt-4">
                                    <Link to="/admin/companies/create">Add a company</Link>
                                </Button>
                            </div>
                        )}
                    </section>
                )}
            </div>
            {!isRecruiter && (
                <div className='mx-auto mt-6 max-w-4xl'>
                    <h2 className='mb-4 text-xl font-bold tracking-tight text-gray-950'>Applied Jobs</h2>
                    <AppliedJobTable />
                </div>
            )}
            <UpdateProfileDialog open={open} setOpen={setOpen}/>
            <Dialog open={photoViewerOpen} onOpenChange={setPhotoViewerOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Profile picture</DialogTitle>
                        <DialogDescription>
                            View your current picture or choose a JPG, PNG, or WebP image up to 5 MB.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center py-4">
                        <Avatar className="h-56 w-56">
                            <AvatarImage
                                src={user?.profile?.profilePhoto || "/default-avatar.svg"}
                                alt={`${user?.fullname || "User"} profile`}
                                onError={(event) => {
                                    event.currentTarget.src = "/default-avatar.svg";
                                }}
                            />
                        </Avatar>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            className="w-full"
                            disabled={uploadingPhoto}
                            onClick={() => photoInputRef.current?.click()}
                        >
                            {uploadingPhoto ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                            {uploadingPhoto ? "Uploading..." : "Change picture"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </main>
        </div>
    )
}

export default Profile