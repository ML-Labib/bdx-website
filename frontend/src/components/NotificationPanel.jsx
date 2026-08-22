import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader } from "./Loader";
import { useAuth } from "./useAuth.jsx";
import { getAuthHeaders } from "../utils/authHeaders";
import "./notificationPanel.css";

export function NotificationPanel({
    onClose,
    onRead,
}) {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch latest 15 notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);

                const headers = await getAuthHeaders(currentUser);

                const response = await fetch(
                    "/api/notifications/latest",
                    {
                        method: "GET",
                        headers,
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Failed to fetch notifications"
                    );
                }

                const data = await response.json();

                setNotifications(data.notifications || []);
            } catch (error) {
                console.error(
                    "Failed to fetch notifications:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        if (currentUser) {
            fetchNotifications();
        }
    }, [currentUser]);

    /*
     * Mark ALL notifications as read.
     *
     * This is called when the panel closes.
     */
    const markAllAsRead = async () => {
        try {
            const headers = await getAuthHeaders(currentUser);

            const response = await fetch(
                "/api/notifications/markAsread",
                {
                    method: "PUT",
                    headers,
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Failed to mark notifications as read"
                );
            }

            // Tell Header that there are no unread notifications anymore
            if (onRead) {
                onRead();
            }
        } catch (error) {
            console.error(
                "Failed to mark notifications as read:",
                error
            );
        }
    };

    /*
     * Close panel
     *
     * First mark notifications as read,
     * then close the panel.
     */
    const handleClose = async () => {
        await markAllAsRead();
        onClose();
    };

    /*
     * Notification click
     *
     * Treat clicking a notification as closing the panel.
     */
    const handleNotificationClick = async (notification) => {
        await markAllAsRead();
        onClose();

        if (notification.target) {
            navigate(notification.target);
        }
    };

    return (
        <>
            {/* Mobile backdrop */}
            <div
                className="notification-backdrop"
                onClick={handleClose}
            />

            <div className="notification-panel">

                {/* Header */}
                <div className="notification-header">
                    <h3 className="notification-title">
                        Notifications
                    </h3>

                    <button
                        type="button"
                        className="notification-close"
                        onClick={handleClose}
                        aria-label="Close notifications"
                    >
                        <span className="material-symbols-outlined">
                            close
                        </span>
                    </button>
                </div>

                {/* Notification list */}
                <div className="notification-list">

                    {loading ? (
                        <div className="notification-loader">
                            <Loader />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="notification-empty">
                            <span class="material-symbols-outlined">
                                exclamation
                            </span>

                            <p>
                                No notifications
                            </p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <button
                                key={notification._id}
                                type="button"
                                className={`notification-item ${!notification.isRead
                                    ? "unread"
                                    : ""
                                    }`}
                                onClick={() =>
                                    handleNotificationClick(
                                        notification
                                    )
                                }
                            >
                                <div className="notification-icon">
                                    <span className="material-symbols-outlined">
                                        {notification.icon ||
                                            "notifications"}
                                    </span>
                                </div>

                                <div className="notification-content">
                                    <div className="notification-message">
                                        {notification.message}
                                    </div>

                                    <div className="notification-time">
                                        {new Date(
                                            notification.createdAt
                                        ).toLocaleString(undefined, {
                                            year: 'numeric',
                                            month: 'numeric',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}

                </div>
            </div>
        </>
    );
}