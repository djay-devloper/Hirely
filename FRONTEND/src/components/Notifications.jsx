import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Navbar from './shared/Navbar'
import { NOTIFICATIONS_API_END_POINT } from '@/utils/constant'
import { Bell, CheckCheck, CircleCheck } from 'lucide-react'
import { Button } from './ui/button'

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    const loadNotifications = async () => {
        try {
            const response = await axios.get(NOTIFICATIONS_API_END_POINT, { withCredentials:true });
            if (response.data.success) setNotifications(response.data.notifications);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to load notifications.');
        }
    };

    useEffect(() => { loadNotifications(); }, []);

    const markAllRead = async () => {
        try {
            await axios.patch(`${NOTIFICATIONS_API_END_POINT}/read-all`, {}, { withCredentials:true });
            setNotifications((current) => current.map((item) => ({ ...item, readAt:item.readAt || new Date().toISOString() })));
            window.dispatchEvent(new Event('hirely:notifications-updated'));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to update notifications.');
        }
    };

    const openNotification = async (notification) => {
        try {
            if (!notification.readAt) {
                await axios.patch(`${NOTIFICATIONS_API_END_POINT}/${notification._id}/read`, {}, { withCredentials:true });
                window.dispatchEvent(new Event('hirely:notifications-updated'));
            }
            if (notification.job?._id) navigate(`/description/${notification.job._id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unable to open notification.');
        }
    };

    const unreadCount = notifications.filter((notification) => !notification.readAt).length;

    return (
        <div>
            <Navbar />
            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
                            <Bell className="h-5 w-5" />
                        </span>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-950">Notifications</h1>
                            <p className="mt-1 text-sm text-gray-500">{unreadCount ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"}` : "You’re all caught up"}</p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <Button onClick={markAllRead} variant="outline" className="rounded-xl border-gray-200">
                            <CheckCheck className="mr-2 h-4 w-4" />Mark all as read
                        </Button>
                    )}
                </div>
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <button
                            key={notification._id}
                            type="button"
                            onClick={() => openNotification(notification)}
                            className={`block w-full rounded-2xl border p-4 text-left transition hover:border-violet-200 hover:shadow-sm ${notification.readAt ? 'border-gray-200 bg-white' : 'border-violet-200 bg-violet-50/80'}`}
                        >
                            <div className="flex items-start gap-3">
                                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${notification.readAt ? "bg-gray-100 text-gray-500" : "bg-white text-violet-700"}`}>
                                    {notification.readAt ? <CircleCheck className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                                </span>
                                <span>
                                    <span className="block font-semibold text-gray-900">{notification.message}</span>
                                    <span className="mt-1 block text-sm text-gray-500">
                                        {new Date(notification.createdAt).toLocaleString()}
                                        {notification.job?.company?.name ? ` · ${notification.job.company.name}` : ''}
                                    </span>
                                </span>
                            </div>
                        </button>
                    ))}
                    {!notifications.length && (
                        <div className="surface-card px-6 py-14 text-center">
                            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-500"><Bell className="h-6 w-6" /></span>
                            <h2 className="mt-4 font-semibold text-gray-900">Nothing new right now</h2>
                            <p className="mt-1 text-sm text-gray-500">We&apos;ll let you know when there&apos;s something worth seeing.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Notifications;
