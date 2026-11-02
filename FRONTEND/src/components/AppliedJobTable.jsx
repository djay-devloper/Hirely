import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { useSelector } from 'react-redux'

const AppliedJobTable = () => {
    const { allAppliedJobs: storedAppliedJobs } = useSelector(store => store.job);
    const allAppliedJobs = Array.isArray(storedAppliedJobs) ? storedAppliedJobs : [];
    return (
        <div className="surface-card overflow-hidden">
            <Table>
                <TableCaption>Your recent applications and their current status</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        allAppliedJobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="py-10 text-center text-sm text-gray-500">
                                    You haven&apos;t applied to any jobs yet. Your applications will appear here.
                                </TableCell>
                            </TableRow>
                        ) : allAppliedJobs.map((appliedJob) => (
                            <TableRow key={appliedJob._id}>
                                <TableCell className="text-sm text-gray-500">{appliedJob?.createdAt?.split("T")[0] || "—"}</TableCell>
                                <TableCell className="font-semibold text-gray-900">{appliedJob?.job?.title || "Role unavailable"}</TableCell>
                                <TableCell className="text-gray-600">{appliedJob?.job?.company?.name || "—"}</TableCell>
                                <TableCell className="text-right">
                                    <Badge className={`rounded-lg ${appliedJob?.status === "rejected" ? "bg-red-50 text-red-700" : appliedJob?.status === "pending" ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}>
                                        {appliedJob?.status?.toUpperCase() || "PENDING"}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default AppliedJobTable