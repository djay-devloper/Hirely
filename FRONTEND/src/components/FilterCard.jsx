import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ListFilter, RotateCcw, SlidersHorizontal } from 'lucide-react'

const filterGroups = [
    { label:'Location', param:'locations', values:['Delhi', 'Gurugram', 'Bangalore', 'Hyderabad', 'Pune', 'Mumbai'] },
    { label:'Job type', param:'jobTypes', values:['Full Time', 'Part Time', 'Work From Home', 'Internship'] },
    { label:'Experience', param:'experienceLevels', values:['Fresher', '0-2 Years', '2-5 Years'] }
];

const getValues = (params, key) => (params.get(key) || '').split(',').filter(Boolean);

const FilterCard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({});
    const [keyword, setKeyword] = useState('');
    const [minSalary, setMinSalary] = useState('');
    const [maxSalary, setMaxSalary] = useState('');
    const [sort, setSort] = useState('newest');

    useEffect(() => {
        const nextFilters = {};
        filterGroups.forEach(({ param }) => { nextFilters[param] = getValues(searchParams, param); });
        setFilters(nextFilters);
        setKeyword(searchParams.get('keyword') || '');
        setMinSalary(searchParams.get('minSalary') || '');
        setMaxSalary(searchParams.get('maxSalary') || '');
        setSort(searchParams.get('sort') || 'newest');
    }, [searchParams]);

    const toggleFilter = (param, value) => {
        setFilters((current) => {
            const values = current[param] || [];
            return {
                ...current,
                [param]:values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
            };
        });
    };

    const applyFilters = (event) => {
        event.preventDefault();
        const nextParams = new URLSearchParams();
        if (keyword.trim()) nextParams.set('keyword', keyword.trim());
        Object.entries(filters).forEach(([key, values]) => {
            if (values?.length) nextParams.set(key, values.join(','));
        });
        if (minSalary) nextParams.set('minSalary', minSalary);
        if (maxSalary) nextParams.set('maxSalary', maxSalary);
        if (sort !== 'newest') nextParams.set('sort', sort);
        nextParams.set('page', '1');
        setSearchParams(nextParams);
    };

    const clearFilters = () => {
        setFilters({});
        setKeyword('');
        setMinSalary('');
        setMaxSalary('');
        setSort('newest');
        setSearchParams({});
    };

    return (
        <form onSubmit={applyFilters} className="w-full rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-base font-bold text-gray-950">
                    <SlidersHorizontal className="h-4 w-4 text-violet-700" />Search &amp; filters
                </h2>
                <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 transition hover:text-violet-700">
                    <RotateCcw className="h-3 w-3" />Clear
                </button>
            </div>
            <label className="mb-4 block text-sm font-medium">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Keyword</span>
                <input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="Title, skill, or company"
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-normal outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
            </label>
            {filterGroups.map(({ label, param, values }) => (
                <fieldset key={param} className="mb-5 border-t border-gray-100 pt-4">
                    <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</legend>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {values.map((value) => (
                            <label key={value} className="flex cursor-pointer items-center gap-2 rounded-lg py-1 text-xs text-gray-600 transition hover:text-gray-950">
                                <input
                                    type="checkbox"
                                    checked={(filters[param] || []).includes(value)}
                                    onChange={() => toggleFilter(param, value)}
                                    className="h-4 w-4 rounded border-gray-300 accent-violet-600 focus:ring-violet-500"
                                />
                                {value}
                            </label>
                        ))}
                    </div>
                </fieldset>
            ))}
            <fieldset className="mb-5 border-t border-gray-100 pt-4">
                <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Salary range (LPA)</legend>
                <div className="flex gap-2">
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={minSalary}
                        onChange={(event) => setMinSalary(event.target.value)}
                        placeholder="From"
                        aria-label="Minimum salary in LPA"
                        className="w-1/2 rounded-xl border border-gray-200 px-2.5 py-2 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    />
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={maxSalary}
                        onChange={(event) => setMaxSalary(event.target.value)}
                        placeholder="To"
                        aria-label="Maximum salary in LPA"
                        className="w-1/2 rounded-xl border border-gray-200 px-2.5 py-2 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                    />
                </div>
            </fieldset>
            <label className="mb-5 block text-sm font-medium">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Sort by</span>
                <select value={sort} onChange={(event) => setSort(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100">
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="salary_asc">Salary: low to high</option>
                    <option value="salary_desc">Salary: high to low</option>
                </select>
            </label>
            <button type="submit" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200">
                <ListFilter className="h-4 w-4" />Apply filters
            </button>
        </form>
    );
};

export default FilterCard;
