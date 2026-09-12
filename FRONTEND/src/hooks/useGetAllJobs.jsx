import { setAllJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetAllJobs = (limit = 0) => {
    const dispatch = useDispatch();
    const { searchedQuery } = useSelector(store => store.job);

    useEffect(() => {
        const fetchAllJobs = async () => {
            try {
                const params = new URLSearchParams();

                if (searchedQuery) {
                    params.append('keyword', searchedQuery);
                }

                if (limit > 0) {
                    params.append('limit', String(limit));
                }

                const queryString = params.toString() ? `?${params.toString()}` : "";
                const res = await axios.get(`${JOB_API_END_POINT}/get${queryString}`, { withCredentials: true });
                if (res.data.success) {
                    dispatch(setAllJobs(res.data.jobs));
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchAllJobs();
    }, [searchedQuery, dispatch, limit]);
};

export default useGetAllJobs