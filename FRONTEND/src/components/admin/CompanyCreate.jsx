import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { setSingleCompany } from '@/redux/companySlice'
import { ArrowLeft, Building2, Loader2 } from 'lucide-react'

const CompanyCreate = () => {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const registerNewCompany = async (event) => {
        event.preventDefault();
        if (!companyName.trim()) {
            toast.error("Enter a company name to continue.");
            return;
        }
        try {
            setLoading(true);
            const res = await axios.post(`${COMPANY_API_END_POINT}/register`, {companyName:companyName.trim()}, {
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res?.data?.success){
                dispatch(setSingleCompany(res.data.company));
                toast.success(res.data.message);
                const companyId = res?.data?.company?._id;
                navigate(`/admin/companies/${companyId}`);
            }
        } catch (error) {
            console.error("Unable to create company:", error);
            toast.error(error.response?.data?.message || "Unable to create company.");
        } finally {
            setLoading(false);
        }
    }
    return (
        <div>
            <Navbar />
            <main className="page-container py-8 sm:py-12">
                <form onSubmit={registerNewCompany} className="surface-card mx-auto max-w-2xl p-6 sm:p-10">
                    <Button type="button" onClick={() => navigate("/admin/companies")} variant="ghost" className="-ml-3 mb-6 rounded-xl text-gray-600">
                        <ArrowLeft className="mr-2 h-4 w-4" />Back to companies
                    </Button>
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                        <Building2 className="h-5 w-5" />
                    </span>
                    <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-violet-700">Set up your organization</p>
                    <h1 className='mt-2 text-3xl font-bold tracking-tight text-gray-950'>Add a company</h1>
                    <p className='mt-2 max-w-lg text-sm leading-6 text-gray-500'>Start with your company name. You can add a description, location, website, and logo next.</p>

                    <div className="mt-7 space-y-2">
                        <Label htmlFor="company-name" className="text-sm font-semibold text-gray-700">Company name</Label>
                        <Input
                            id="company-name"
                            type="text"
                            required
                            maxLength={100}
                            value={companyName}
                            placeholder="e.g. Northstar Labs"
                            onChange={event => setCompanyName(event.target.value)}
                            className="form-control"
                        />
                    </div>
                    <div className='mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
                        <Button type="button" variant="outline" className="rounded-xl" onClick={() => navigate("/admin/companies")}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="rounded-xl bg-violet-600 px-6 hover:bg-violet-700">
                            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Continue"}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    )
}

export default CompanyCreate