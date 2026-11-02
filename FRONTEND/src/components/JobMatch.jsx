import React from 'react'
import { useSelector } from 'react-redux'
import { getJobMatch } from '@/utils/jobMatch'

const JobMatch = ({ job, detailed = false }) => {
    const { user } = useSelector(store => store.auth);
    if (user?.role !== 'student') return null;

    const match = getJobMatch(job, user?.profile?.skills || []);
    if (match.percentage === null) {
        return <p className="mt-3 text-sm text-gray-500">Add job requirements to see your skills match.</p>;
    }

    return (
        <div className="mt-3 rounded-md bg-violet-50 p-3 text-sm">
            <p className="font-semibold text-violet-800">
                {match.percentage}% skills match
                <span className="ml-1 font-normal text-gray-600">
                    ({match.matchedRequirements.length} of {(job?.requirements || []).length} listed requirements)
                </span>
            </p>
            {detailed && (
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div>
                        <p className="font-medium text-green-700">Matching skills</p>
                        <p className="text-gray-700">{match.matchedRequirements.join(', ') || 'No listed skills matched yet.'}</p>
                    </div>
                    <div>
                        <p className="font-medium text-amber-700">Other requirements</p>
                        <p className="text-gray-700">{match.missingRequirements.join(', ') || 'You matched all listed requirements.'}</p>
                    </div>
                </div>
            )}
            <p className="mt-1 text-xs text-gray-500">Based only on the skills listed in your profile and this job&apos;s requirements.</p>
        </div>
    );
};

export default JobMatch;
