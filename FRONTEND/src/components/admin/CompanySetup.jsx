import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Button } from '../ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import axios from 'axios'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import useGetCompanyById from '@/hooks/useGetCompanyById'

const CompanySetup = () => {
    const params = useParams();
    useGetCompanyById(params.id);
    const [input, setInput] = useState({
        name: "",
        description: "",
        website: "",
        location: "",
        file: null
    });
    const {singleCompany} = useSelector(store=>store.company);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const changeFileHandler = (e) => {
        const file = e.target.files?.[0];
        setInput({ ...input, file });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", input.name);
        formData.append("description", input.description);
        formData.append("website", input.website);
        formData.append("location", input.location);
        if (input.file) {
            formData.append("file", input.file);
        }
        try {
            setLoading(true);
            const res = await axios.put(`${COMPANY_API_END_POINT}/update/${params.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            if (res.data.success) {
                toast.success(res.data.message);
                navigate("/admin/companies");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setInput({
            name: singleCompany?.name || "",
            description: singleCompany?.description || "",
            website: singleCompany?.website || "",
            location: singleCompany?.location || "",
            file: null
        })
    },[singleCompany]);

    return (
        <div>
            <Navbar />
            <main className="page-container py-8 sm:py-10">
                <form onSubmit={submitHandler} className="surface-card mx-auto max-w-2xl p-5 sm:p-8">
                    <div className='mb-7 flex flex-wrap items-center gap-4'>
                        <Button type="button" onClick={() => navigate("/admin/companies")} variant="outline" className="flex items-center gap-2 rounded-xl text-gray-600">
                            <ArrowLeft />
                            <span>Back</span>
                        </Button>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Company profile</p>
                            <h1 className='text-2xl font-bold tracking-tight text-gray-950'>Edit company details</h1>
                        </div>
                    </div>
                    <div className='grid gap-5 sm:grid-cols-2'>
                        <div>
                            <Label htmlFor="company-name">Company name</Label>
                            <Input
                                id="company-name"
                                type="text"
                                name="name"
                                value={input.name}
                                onChange={changeEventHandler}
                            />
                        </div>
                        <div>
                            <Label htmlFor="company-description">Description</Label>
                            <Input
                                id="company-description"
                                type="text"
                                name="description"
                                value={input.description}
                                onChange={changeEventHandler}
                            />
                        </div>
                        <div>
                            <Label htmlFor="company-website">Website</Label>
                            <Input
                                id="company-website"
                                type="text"
                                name="website"
                                value={input.website}
                                onChange={changeEventHandler}
                            />
                        </div>
                        <div>
                            <Label htmlFor="company-location">Location</Label>
                            <Input
                                id="company-location"
                                type="text"
                                name="location"
                                value={input.location}
                                onChange={changeEventHandler}
                            />
                        </div>
                        <div>
                            <Label htmlFor="company-logo">Company logo</Label>
                            <Input
                                id="company-logo"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={changeFileHandler}
                            />
                            <p className="mt-1 text-xs text-gray-500">JPG, PNG, or WebP format</p>
                        </div>
                    </div>
                    {
                        loading ? <Button disabled className="my-6 h-11 w-full rounded-xl bg-violet-600"><Loader2 className='mr-2 h-4 w-4 animate-spin' />Saving changes...</Button> : <Button type="submit" className="my-6 h-11 w-full rounded-xl bg-violet-600 hover:bg-violet-700">Save company details</Button>
                    }
                </form>
            </main>

        </div>
    )
}

export default CompanySetup