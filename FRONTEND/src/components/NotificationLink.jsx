import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { NOTIFICATIONS_API_END_POINT } from '@/utils/constant'

const NotificationLink = ({ userId }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    const loadUnreadCount = useCallback(async () => {
        try {
            const response = await axios.get(NOTIFICATIONS_API_END_POINT, { withCredentials:true });
            if (response.data.success) setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Unable to load notification count:', error);
        }
    }, []);

    useEffect(() => {
        loadUnreadCount();
        window.addEventListener('hirely:notifications-updated', loadUnreadCount);
        return () => window.removeEventListener('hirely:notifications-updated', loadUnreadCount);
    }, [loadUnreadCount, userId]);

    return (
        <Link to="/notifications" className="relative inline-flex items-center gap-1" aria-label="Notifications">
            <Bell size={18} />
            <span>Alerts</span>
            {unreadCount > 0 && <span className="rounded-full bg-red-600 px-1.5 text-xs text-white">{unreadCount}</span>}
        </Link>
    );
};

export default NotificationLink;
