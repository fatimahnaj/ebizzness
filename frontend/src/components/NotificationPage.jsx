import { useEffect, useState } from "react";

function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [recipientId, setRecipientId] = useState(3);
  const [viewMode, setViewMode] = useState("user");

  function loadUserNotifications() {
    fetch(`http://localhost:8080/api/notifications/user/${recipientId}`)
      .then((response) => response.json())
      .then((data) => setNotifications(data))
      .catch((error) => console.error("Error loading user notifications:", error));
  }

  function loadAllNotifications() {
    fetch("http://localhost:8080/api/notifications")
      .then((response) => response.json())
      .then((data) => setNotifications(data))
      .catch((error) => console.error("Error loading all notifications:", error));
  }

  function loadNotifications() {
    if (viewMode === "user") {
      loadUserNotifications();
    } else {
      loadAllNotifications();
    }
  }
  function markAsRead(notificationId) {
    fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
      method: "PUT"
    })
      .then((response) => response.json())
      .then(() => {
        loadNotifications();
      })
      .catch((error) => console.error("Error marking notification as read:", error));
  }

  useEffect(() => {
    loadNotifications();
  }, [viewMode]);

  return (
    <div>
      <h1>Notifications</h1>

      <div style={controlBoxStyle}>
        <label>View Mode:</label>

        <select
          value={viewMode}
          onChange={(event) => setViewMode(event.target.value)}
          style={inputStyle}
        >
          <option value="user">Specific User</option>
          <option value="all">All Notifications</option>
        </select>

        {viewMode === "user" && (
          <>
            <label>Recipient ID:</label>

            <input
              type="number"
              value={recipientId}
              onChange={(event) => setRecipientId(event.target.value)}
              style={inputStyle}
            />

            <button onClick={loadUserNotifications} style={buttonStyle}>
              Load User Notifications
            </button>
          </>
        )}

        {viewMode === "all" && (
          <button onClick={loadAllNotifications} style={buttonStyle}>
            Load All Notifications
          </button>
        )}
      </div>

      <h2>Notification List</h2>

      {notifications.length === 0 ? (
        <p>No notifications found.</p>
      ) : (
        notifications.map((notification) => (
          <div key={notification.notificationId} style={cardStyle}>
            <p>
              <strong>Notification ID:</strong> {notification.notificationId}
            </p>

            <p>
              <strong>Recipient ID:</strong> {notification.recipientId}
            </p>

            <p>
              <strong>Message:</strong> {notification.message}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {notification.isRead ? "Read" : "Unread"}
              {!notification.isRead && (
                <button
                  onClick={() => markAsRead(notification.notificationId)}
                  style={buttonStyle}
                >
                  Mark as Read
                </button>
              )}
            </p>

            <p>
              <strong>Created At:</strong> {notification.createdAt}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

const controlBoxStyle = {
  border: "1px solid #ccc",
  padding: "20px",
  width: "500px",
  marginBottom: "30px",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const inputStyle = {
  padding: "8px",
  fontSize: "14px"
};

const buttonStyle = {
  padding: "10px 20px",
  cursor: "pointer"
};

const cardStyle = {
  border: "1px solid #ddd",
  padding: "15px",
  marginBottom: "10px",
  width: "600px"
};

export default NotificationPage;