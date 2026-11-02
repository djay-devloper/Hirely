import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import CompaniesTable from './CompaniesTable'
import { useNavigate } from 'react-router-dom'
import useGetAllCompanies from '@/hooks/useGetAllCompanies'
import { useDispatch } from 'react-redux'
import { setSearchCompanyByText } from '@/redux/companySlice'

const Companies = () => {
    useGetAllCompanies();
    const [input, setInput] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(()=>{
        dispatch(setSearchCompanyByText(input));
    },[input]);
    return (
        <div className="min-h-screen">
            <Navbar />
            <main className='page-container py-8 sm:py-10'>
                <header className='mb-7 flex flex-wrap items-end justify-between gap-4'>
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-700">Recruiter workspace</p>
                        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">Companies</h1>
                        <p className="mt-1 text-sm text-gray-500">Manage the organizations you hire for.</p>
                    </div>
                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <Input
                        className="w-full bg-white sm:w-64"
                        placeholder="Search companies"
                        aria-label="Search companies"
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <Button onClick={() => navigate("/admin/companies/create")} className="rounded-xl bg-violet-600 hover:bg-violet-700">Add company</Button>
                    </div>
                </header>
                <CompaniesTable />
            </main>
        </div>
    )
}

export default Companies