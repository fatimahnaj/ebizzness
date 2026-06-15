// src/components/NotificationDropdown.jsx

import React, { useEffect, useState } from "react";

function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const loggedInUserId = localStorage.getItem("userId");

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
      console.error("No userId found in localStorage");
      return;
    }

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
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/notifications/${notificationId}/read`,
        {
          method: "PUT"
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      loadNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [loggedInUserId]);

  const unreadCount = notifications.length;

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          loadNotifications();
        }}
        style={{
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontSize: "22px",
          position: "relative"
        }}
      >
        🔔

        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              fontSize: "12px",
              padding: "2px 6px",
              fontWeight: "bold"
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "42px",
            width: "430px",
            maxHeight: "500px",
            overflowY: "auto",
            background: "#2b2b2b",
            color: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            zIndex: 1000
          }}
        >
          <div
            style={{
              padding: "18px",
              borderBottom: "1px solid #444",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <h2 style={{ margin: 0 }}>Notifications</h2>
            <span>{unreadCount} unread</span>
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: "18px", color: "#ccc" }}>
              No unread notifications.
            </div>
          ) : (
            notifications.map((notification) => {
              const notificationId = getNotificationId(notification);

              return (
                <div
                  key={notificationId}
                  style={{
                    padding: "16px 40px",
                    borderBottom: "1px solid #444"
                  }}
                >
                  <strong>{notification.message}</strong>

                  <p style={{ marginTop: "10px", color: "#cfcfcf" }}>
                    {notification.createdAt || notification.created_at}
                  </p>

                  <button
                    type="button"
                    onClick={() => markAsRead(notificationId)}
                    style={{
                      marginTop: "8px",
                      padding: "7px 12px",
                      borderRadius: "8px",
                      border: "1px solid #666",
                      background: "transparent",
                      color: "white",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}
                  >
                    Mark as read
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;