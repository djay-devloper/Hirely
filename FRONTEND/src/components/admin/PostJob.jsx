import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useSelector } from 'react-redux'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import axios from 'axios'
import { JOB_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

const locationOptions = ["Delhi", "Gurugram", "Bangalore", "Hyderabad", "Pune", "Mumbai"];
const jobTypeOptions = ["Full Time", "Part Time", "Work From Home", "Internship"];
const experienceOptions = ["Fresher", "0-2 Years", "2-5 Years"];

const PostJob = () => {
    const [input, setInput] = useState({
        title: "",
        description: "",
        requirements: "",
        salary: "",
        location: "",
        jobType: "",
        experience: "",
        position: 0,
        companyId: ""
    });
    const [loading, setLoading]= useState(false);
    const navigate = useNavigate();

    const { companies } = useSelector(store => store.company);
    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const selectChangeHandler = (value) => {
        const selectedCompany = companies.find((company)=> company.name.toLowerCase() === value);
        setInput({...input, companyId:selectedCompany._id});
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!input.title || !input.description || !input.requirements || !input.salary || !input.location || !input.jobType || !input.experience || !input.position || !input.companyId) {
            toast.error("Please complete all job fields and select a company.");
            return;
        }
        try {
            setLoading(true);
            const res = await axios.post(`${JOB_API_END_POINT}/post`, input,{
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res.data.success){
                toast.success(res.data.message);
                navigate("/admin/jobs");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to post job.");
        } finally{
            setLoading(false);
        }
    }

    return (
        <div>
            <Navbar />
            <main className="page-container py-8 sm:py-10">
                <form onSubmit={submitHandler} className='surface-card mx-auto max-w-4xl p-5 sm:p-8'>
                    <div className="mb-7">
                        <p className="text-sm font-semibold uppercase tracking-wide text-violet-700">Recruiter workspace</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">Create a job post</h1>
                        <p className="mt-1 text-sm text-gray-500">Share the role clearly so the right people can find it.</p>
                    </div>
                    <div className='grid gap-x-5 gap-y-4 sm:grid-cols-2'>
                        <div>
                            <Label htmlFor="job-title">Job title</Label>
                            <Input
                                id="job-title"
                                type="text"
                                name="title"
                                placeholder="Frontend Developer"
                                value={input.title}
                                onChange={changeEventHandler}
                                required
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="job-description">Description</Label>
                            <textarea
                                id="job-description"
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                                placeholder="Describe the role, team, and what the successful candidate will work on."
                                rows={4}
                                required
                                className="mt-1.5 w-full resize-y rounded-xl border border-input bg-white px-3 py-2.5 text-sm leading-6 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                            />
                        </div>
                        <div>
                            <Label htmlFor="job-requirements">Key requirements</Label>
                            <Input
                                id="job-requirements"
                                type="text"
                                name="requirements"
                                placeholder="React, JavaScript, HTML, CSS, Git"
                                value={input.requirements}
                                onChange={changeEventHandler}
                                required
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label htmlFor="job-salary">Salary</Label>
                            <Input
                                id="job-salary"
                                type="text"
                                name="salary"
                                placeholder="10 or 10 LPA"
                                value={input.salary}
                                onChange={changeEventHandler}
                                required
                                className="mt-1.5"
                            />
                        </div>
                        <div>
                            <Label>Location</Label>
                            <Select value={input.location || undefined} onValueChange={(value) => setInput({ ...input, location: value })}>
                                <SelectTrigger className="w-full my-1">
                                    <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {locationOptions.map((location) => (
                                            <SelectItem key={location} value={location}>{location}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Job Type</Label>
                            <Select value={input.jobType || undefined} onValueChange={(value) => setInput({ ...input, jobType: value })}>
                                <SelectTrigger className="w-full my-1">
                                    <SelectValue placeholder="Select job type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {jobTypeOptions.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Experience Level</Label>
                            <Select value={input.experience || undefined} onValueChange={(value) => setInput({ ...input, experience: value })}>
                                <SelectTrigger className="w-full my-1">
                                    <SelectValue placeholder="Select experience" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {experienceOptions.map((level) => (
                                            <SelectItem key={level} value={level}>{level}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="job-position">Number of openings</Label>
                            <Input
                                id="job-position"
                                type="number"
                                name="position"
                                placeholder="3"
                                value={input.position}
                                onChange={changeEventHandler}
                                min="1"
                                required
                                className="mt-1.5"
                            />
                        </div>
                        {
                            companies.length > 0 && (
                                <div className="sm:col-span-2">
                                <Label>Hiring company</Label>
                                <Select onValueChange={selectChangeHandler}>
                                    <SelectTrigger className="mt-1.5 w-full">
                                        <SelectValue placeholder="Select a company" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            {
                                                companies.map((company) => {
                                                    return (
                                                        <SelectItem key={company._id} value={company?.name?.toLowerCase()}>{company.name}</SelectItem>
                                                    )
                                                })
                                            }

                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                </div>
                            )
                        }
                    </div> 
                    {
                        loading ? <Button disabled className="mt-7 h-11 w-full rounded-xl bg-violet-600"><Loader2 className='mr-2 h-4 w-4 animate-spin' />Publishing job...</Button> : <Button type="submit" className="mt-7 h-11 w-full rounded-xl bg-violet-600 hover:bg-violet-700">Publish job</Button>
                    }
                    {
                        companies.length === 0 && <p className='mt-3 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-800'>Add a company profile before publishing a job.</p>
                    }
                </form>
            </main>
        </div>
    )
}

export default PostJob