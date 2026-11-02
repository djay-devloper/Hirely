import { setAllJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { setJobsPagination } from '@/redux/jobSlice'

const useGetAllJobs = (limit = 12) => {
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                const params = new URLSearchParams(location.search);
                params.set('limit', String(limit));
                const queryString = params.toString() ? `?${params.toString()}` : "";
                const res = await axios.get(`${JOB_API_END_POINT}/get${queryString}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setAllJobs(res.data.jobs));
                    if (res.data.pagination) dispatch(setJobsPagination(res.data.pagination));
                }
            } catch (error) {
                console.error('Unable to fetch jobs:', error);
            }
        };

        fetchAllJobs();
    }, [dispatch, limit, location.pathname, location.search]);
};

export default useGetAllJobs