import { SAVED_JOBS_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setSavedJobs } from '@/redux/jobSlice'

const useGetSavedJobs = () => {
    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);

    useEffect(() => {
        if (user?.role !== 'student') {
            dispatch(setSavedJobs([]));
            return;
        }

        const fetchSavedJobs = async () => {
            try {
                const res = await axios.get(SAVED_JOBS_API_END_POINT, { withCredentials:true });
                if (res.data.success) dispatch(setSavedJobs(res.data.jobs));
            } catch (error) {
                console.error('Unable to fetch saved jobs:', error);
            }
        };
        dispatch(setSavedJobs([]));
        fetchSavedJobs();
    }, [dispatch, user?._id, user?.role]);
};

export default useGetSavedJobs;
