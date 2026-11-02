import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Label } from './ui/label'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { setUser } from '@/redux/authSlice'
import { toast } from 'sonner'

const UpdateProfileDialog = ({ open, setOpen }) => {
    const [loading, setLoading] = useState(false);
    const { user } = useSelector(store => store.auth);
    const [input, setInput] = useState({ fullname:"", email:"", phoneNumber:"", bio:"", skills:"", file:null });
    const dispatch = useDispatch();
    const isStudent = user?.role === "student";

    useEffect(() => {
        if (open) {
            setInput({
                fullname:user?.fullname || "",
                email:user?.email || "",
                phoneNumber:user?.phoneNumber || "",
                bio:user?.profile?.bio || "",
                skills:user?.profile?.skills?.join(", ") || "",
                file:null
            });
        }
    }, [open, user]);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];

        if (file && file.type !== "application/pdf") {
            toast.error("Only PDF resumes are allowed.");
            e.target.value = "";
            setInput({ ...input, file: null });
            return;
        }

        setInput({ ...input, file:file || null })
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        if (loading) return;

        if (input.file && input.file.type !== "application/pdf") {
            toast.error("Only PDF resumes are allowed.");
            return;
        }

        const formData = new FormData();
        const fullname = input.fullname.trim();
        const email = input.email.trim();
        const phoneNumber = String(input.phoneNumber ?? "").trim();
        const skills = input.skills.split(",").map(skill => skill.trim()).filter(Boolean);
        const currentSkills = (user?.profile?.skills || []).map(skill => String(skill).trim()).filter(Boolean);
        const hasChanges = fullname !== String(user?.fullname ?? "").trim()
            || email.toLowerCase() !== String(user?.email ?? "").trim().toLowerCase()
            || phoneNumber !== String(user?.phoneNumber ?? "").trim()
            || input.bio !== String(user?.profile?.bio ?? "")
            || (isStudent && (
                JSON.stringify(skills) !== JSON.stringify(currentSkills)
                || Boolean(input.file)
            ));

        if (!hasChanges) {
            toast.info("Nothing to update.");
            return;
        }

        formData.append("fullname", fullname);
        formData.append("email", email);
        formData.append("phoneNumber", phoneNumber);
        formData.append("bio", input.bio);
        if (isStudent) {
            formData.append("skills", skills.join(","));
            if (input.file) formData.append("file", input.file);
        }

        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/profile/update`, formData, {
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success(res.data.message);
                setOpen(false);
            } else {
                toast.error(res.data.message || "Unable to update profile.");
            }
        } catch (error) {
            console.error("Unable to update profile:", error);
            const message = error.response?.data?.message
                || (error.request
                    ? "Could not reach the server. Check that the backend is running and try again."
                    : "Unable to update profile. Please try again.");
            toast.error(message);
        } finally{
            setLoading(false);
        }
    }



    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{isStudent ? "Update Profile" : "Update Recruiter Profile"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitHandler}>
                        <div className='grid gap-4 py-4'>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input
                                    id="name"
                                    name="fullname"
                                    type="text"
                                    value={input.fullname}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={input.email}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="number" className="text-right">Number</Label>
                                <Input
                                    id="number"
                                    name="phoneNumber"
                                    value={input.phoneNumber}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            <div className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor="bio" className="text-right">Bio</Label>
                                <Input
                                    id="bio"
                                    name="bio"
                                    value={input.bio}
                                    onChange={changeEventHandler}
                                    className="col-span-3"
                                />
                            </div>
                            {isStudent && (
                                <>
                                    <div className='grid grid-cols-4 items-center gap-4'>
                                        <Label htmlFor="skills" className="text-right">Skills</Label>
                                        <Input
                                            id="skills"
                                            name="skills"
                                            value={input.skills}
                                            onChange={changeEventHandler}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className='grid grid-cols-4 items-center gap-4'>
                                        <Label htmlFor="file" className="text-right">Resume</Label>
                                        <div className="col-span-3">
                                            <Input
                                                id="file"
                                                name="file"
                                                type="file"
                                                accept="application/pdf"
                                                onChange={fileChangeHandler}
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                {user?.profile?.resumeOriginalName
                                                    ? `Current resume: ${user.profile.resumeOriginalName}. Leave empty to keep it.`
                                                    : "Resume is optional. Upload a PDF if you want to add one."}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <DialogFooter>
                            {
                                loading ? (
                                    <Button type="button" disabled className="w-full my-4">
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait
                                    </Button>
                                ) : (
                                    <Button type="submit" className="w-full my-4">Update</Button>
                                )
                            }
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default UpdateProfileDialog