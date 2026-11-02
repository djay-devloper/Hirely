import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import { Input } from '../ui/input'
import { Button } from '../ui/button' 
import { useNavigate } from 'react-router-dom' 
import { useDispatch } from 'react-redux' 
import AdminJobsTable from './AdminJobsTable'
import useGetAllAdminJobs from '@/hooks/useGetAllAdminJobs'
import { setSearchJobByText } from '@/redux/jobSlice'

const AdminJobs = () => {
  useGetAllAdminJobs();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchJobByText(input));
  }, [input]);
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className='page-container py-8 sm:py-10'>
        <header className='mb-7 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-violet-700">Recruiter workspace</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">Job posts</h1>
            <p className="mt-1 text-sm text-gray-500">Manage open roles and keep your hiring pipeline moving.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Input
            className="w-full bg-white sm:w-64"
            placeholder="Search roles or companies"
            aria-label="Search roles or companies"
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={() => navigate("/admin/jobs/create")} className="rounded-xl bg-violet-600 hover:bg-violet-700">Post a job</Button>
          </div>
        </header>
        <AdminJobsTable />
      </main>
    </div>
  )
}

export default AdminJobs