import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { useSearchParams } from 'react-router-dom'
import { NOTIFICATIONS_API_END_POINT } from '@/utils/constant'
import { useSelector } from 'react-redux'
import { BellRing, Loader2 } from 'lucide-react'

const AlertSubscription = () => {
    const { user } = useSelector(store => store.auth);
    const [searchParams] = useSearchParams();
    const [preferences, setPreferences] = useState(null);
    const [emailConfigured, setEmailConfigured] = useState(null);
    const [preferencesLoading, setPreferencesLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [loadAttempt, setLoadAttempt] = useState(0);

    useEffect(() => {
        if (user?.role !== 'student') return;
        let cancelled = false;
        const loadPreferences = async () => {
            setPreferences(null);
            setEmailConfigured(null);
            setLoadError('');
            setPreferencesLoading(true);
            try {
                const response = await axios.get(`${NOTIFICATIONS_API_END_POINT}/preferences`, { withCredentials:true });
                if (!cancelled) {
                    setPreferences(response.data.preferences);
                    setEmailConfigured(response.data.emailConfigured);
                }
            } catch (error) {
                console.error('Unable to load job alert preferences:', error);
                if (!cancelled) {
                    setLoadError(error.response?.data?.message || 'Unable to load job alerts. Please try again.');
                }
            } finally {
                if (!cancelled) setPreferencesLoading(false);
            }
        };
        loadPreferences();
        return () => { cancelled = true; };
    }, [user?._id, user?.role, loadAttempt]);

    const buildPreferences = (enabled) => ({
        enabled,
        keyword:searchParams.get('keyword') || '',
        locations:(searchParams.get('locations') || '').split(',').filter(Boolean),
        jobTypes:(searchParams.get('jobTypes') || '').split(',').filter(Boolean),
        experienceLevels:(searchParams.get('experienceLevels') || '').split(',').filter(Boolean),
        minSalary:searchParams.get('minSalary') || null,
        maxSalary:searchParams.get('maxSalary') || null
    });

    const savePreferences = async (enabled) => {
        try {
            const response = await axios.put(
                `${NOTIFICATIONS_API_END_POINT}/preferences`,
                buildPreferences(enabled),
                { withCredentials:true }
            );
            setPreferences(response.data.preferences);
            toast.success(response.data.message);
            if (enabled && !emailConfigured) {
                toast.warning('In-app alerts are active. Configure SMTP settings on the server to deliver email alerts.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to update job alerts.');
        }
    };

    if (user?.role !== 'student') return null;

    return (
        <div className="mt-4 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-violet-700 shadow-sm">
                <BellRing className="h-4 w-4" />
            </span>
            <h2 className="mt-3 font-semibold text-gray-950">Make the next match come to you</h2>
            <p className="my-2 text-sm leading-6 text-gray-600">Get updates when jobs matching these filters are posted.</p>
            {!preferencesLoading && !loadError && emailConfigured === false && <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">In-app alerts are available. Email delivery needs SMTP settings.</p>}
            {loadError && (
                <div role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm leading-5 text-red-700">
                    <p>{loadError}</p>
                    <button
                        type="button"
                        onClick={() => setLoadAttempt((attempt) => attempt + 1)}
                        className="mt-1 font-semibold underline underline-offset-2"
                    >Try again</button>
                </div>
            )}
            <button
                type="button"
                onClick={() => savePreferences(true)}
                disabled={preferencesLoading || !preferences || Boolean(loadError)}
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60"
            >{preferencesLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Loading alerts</> : preferences?.enabled ? 'Update this alert' : 'Create job alert'}</button>
            {preferences?.enabled && (
                <button
                    type="button"
                    onClick={() => savePreferences(false)}
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-300 hover:bg-gray-50"
                >Turn off alerts</button>
            )}
        </div>
    );
};

export default AlertSubscription;
