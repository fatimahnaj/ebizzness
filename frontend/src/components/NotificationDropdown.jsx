// src/components/NotificationDropdown.jsx

import React, { useEffect, useRef, useState } from "react";

function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const loggedInUserId = getLoggedInUserId();

  function isNotificationRead(notification) {
    const value =
      notification.isRead ??
      notification.read ??
      notification.is_read;

    return value === true || value === 1 || value === "true" || value === "1";
  }

  function getNotificationId(notification) {
    return notification.notificationId || notification.notification_id || notification.id;
  }

  const loadNotifications = async () => {
    if (!loggedInUserId) {
      setNotifications([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8080/api/notifications/user/${loggedInUserId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load notifications");
      }

      const data = await response.json();

      const unreadOnly = Array.isArray(data)
        ? data.filter((notification) => !isNotificationRead(notification))
        : [];

      setNotifications(unreadOnly);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      setNotifications((current) =>
        current.filter((notification) => getNotificationId(notification) !== notificationId)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    await Promise.all(
      notifications
        .map(getNotificationId)
        .filter(Boolean)
        .map((notificationId) =>
          fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
            method: "PUT",
          })
        )
    );

    setNotifications([]);
  };

  useEffect(() => {
    loadNotifications();
  }, [loggedInUserId]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const closeOnOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const unreadCount = notifications.length;

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="notification-trigger"
        onClick={() => {
          setOpen((current) => !current);
          loadNotifications();
        }}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <span className="notification-bell" aria-hidden="true">
          {"\uD83D\uDD14"}
        </span>

        {unreadCount > 0 && (
          <span className="notification-count-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-menu">
          <div className="notification-menu-header">
            <div>
              <h2>Notifications</h2>
              <p>{unreadCount === 0 ? "All caught up" : "Latest unread activity"}</p>
            </div>

            <span className="notification-unread-pill">
              {unreadCount} unread
            </span>
          </div>

          {unreadCount > 0 && (
            <div className="notification-menu-actions">
              <button type="button" onClick={markAllAsRead}>
                Mark all as read
              </button>
            </div>
          )}

          <div className="notification-list">
            {loading ? (
              <div className="notification-empty-state">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty-state">
                <strong>No unread notifications</strong>
                <span>New messages, reports, orders, and reviews will show here.</span>
              </div>
            ) : (
              notifications.map((notification) => {
                const notificationId = getNotificationId(notification);

                return (
                  <div key={notificationId} className="notification-item">
                    <span className="notification-item-dot" aria-hidden="true" />

                    <div className="notification-item-body">
                      <p>{notification.message}</p>
                      <time>{formatNotificationTime(notification)}</time>

                      <button
                        type="button"
                        onClick={() => markAsRead(notificationId)}
                      >
                        Mark as read
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getLoggedInUserId() {
  const directId = localStorage.getItem("userId") || localStorage.getItem("adminId");

  if (directId) {
    return directId;
  }

  return getIdFromStoredUser("user") || getIdFromStoredUser("admin");
}

function getIdFromStoredUser(storageKey) {
  try {
    const storedUser = JSON.parse(localStorage.getItem(storageKey) || "{}");
    return storedUser.userID || storedUser.userId || storedUser.id || null;
  } catch {
    return null;
  }
}

function formatNotificationTime(notification) {
  const dateTime =
    notification.createdAt ||
    notification.created_at ||
    notification.timestamp;

  if (!dateTime) {
    return "Just now";
  }

  const createdDate = new Date(dateTime);

  if (Number.isNaN(createdDate.getTime())) {
    return String(dateTime);
  }

  const diffMs = Date.now() - createdDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  return createdDate.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default NotificationDropdown;
