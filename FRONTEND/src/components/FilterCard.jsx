import React, { useEffect, useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { useDispatch, useSelector } from 'react-redux'
import { setSearchedQuery } from '@/redux/jobSlice'

const fitlerData = [
    {
        fitlerType: "Location",
        array: ["Delhi", "Gurugram", "Bangalore", "Hyderabad", "Pune", "Mumbai"]
    },
    {
        fitlerType: "Job Type",
        array: ["Full Time", "Part Time", "Work From Home", "Internship"]
    },
    {
        fitlerType: "Experience",
        array: ["Fresher", "0-2 Years", "2-5 Years"]
    },
].map((group) => ({
    ...group,
    array: group.array.map((value) => value.charAt(0).toUpperCase() + value.slice(1))
}));

const FilterCard = () => {
    const { searchedQuery } = useSelector(store => store.job);
    const [selectedValue, setSelectedValue] = useState(searchedQuery || '');
    const dispatch = useDispatch();

    useEffect(() => {
        setSelectedValue(searchedQuery || '');
    }, [searchedQuery]);

    const changeHandler = (value) => {
        setSelectedValue(value);
        dispatch(setSearchedQuery(value));
    }

    return (
        <div className='w-full bg-white p-3 rounded-md'>
            <h1 className='font-bold text-lg'>Filter Jobs</h1>
            <hr className='mt-3' />
            <RadioGroup value={selectedValue} onValueChange={changeHandler}>
                {
                    fitlerData.map((data, index) => (
                        <div key={data.fitlerType}>
                            <h1 className='font-bold text-lg'>{data.fitlerType}</h1>
                            {
                                data.array.map((item, idx) => {
                                    const itemId = `id${index}-${idx}`
                                    return (
                                        <div key={itemId} className='flex items-center space-x-2 my-2'>
                                            <RadioGroupItem value={item} id={itemId} />
                                            <Label htmlFor={itemId}>{item}</Label>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    ))
                }
            </RadioGroup>
        </div>
    )
}

export default FilterCard