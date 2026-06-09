import { useEffect, useState } from "react";

function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const recipientId = 3;

  function loadNotifications() {
    fetch(`http://localhost:8080/api/notifications/user/${recipientId}`)
      .then((response) => response.json())
      .then((data) => setNotifications(data))
      .catch((error) => console.error("Error loading notifications:", error));
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

    const interval = setInterval(() => {
      loadNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <div style={containerStyle}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={bellButtonStyle}
      >
        🔔

        {unreadCount > 0 && (
          <span style={badgeStyle}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={dropdownStyle}>
          <div style={headerStyle}>
            <h3 style={{ margin: 0 }}>Notifications</h3>
            <span style={{ fontSize: "14px" }}>
              {unreadCount} unread
            </span>
          </div>

          {notifications.length === 0 ? (
            <p style={{ padding: "15px" }}>No notifications found.</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.notificationId}
                style={{
                  ...notificationItemStyle,
                  backgroundColor: notification.isRead ? "#2b2b2b" : "#1f2d3d"
                }}
              >
                <div style={dotContainerStyle}>
                  {!notification.isRead && <span style={blueDotStyle}></span>}
                </div>

                <div style={{ flex: 1 }}>
                  <p style={messageStyle}>
                    {notification.message}
                  </p>

                  <small style={timeStyle}>
                    {notification.createdAt}
                  </small>

                  {!notification.isRead && (
                    <div>
                      <button
                        onClick={() => markAsRead(notification.notificationId)}
                        style={markButtonStyle}
                      >
                        Mark as Read
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const containerStyle = {
  position: "relative",
  display: "inline-block"
};

const bellButtonStyle = {
  position: "relative",
  fontSize: "24px",
  backgroundColor: "transparent",
  border: "none",
  cursor: "pointer",
  color: "white"
};

const badgeStyle = {
  position: "absolute",
  top: "-6px",
  right: "-8px",
  backgroundColor: "red",
  color: "white",
  borderRadius: "50%",
  padding: "2px 6px",
  fontSize: "12px",
  fontWeight: "bold"
};

const dropdownStyle = {
  position: "absolute",
  top: "40px",
  right: "0",
  width: "430px",
  maxHeight: "600px",
  overflowY: "auto",
  backgroundColor: "#242424",
  color: "white",
  border: "1px solid #444",
  borderRadius: "10px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  zIndex: 999
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "15px",
  borderBottom: "1px solid #444"
};

const notificationItemStyle = {
  display: "flex",
  gap: "10px",
  padding: "15px",
  borderBottom: "1px solid #3a3a3a"
};

const dotContainerStyle = {
  width: "15px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const blueDotStyle = {
  width: "8px",
  height: "8px",
  backgroundColor: "#3ea6ff",
  borderRadius: "50%"
};

const messageStyle = {
  margin: "0 0 6px 0",
  fontSize: "14px",
  fontWeight: "bold"
};

const timeStyle = {
  color: "#aaa",
  fontSize: "12px"
};

const markButtonStyle = {
  marginTop: "8px",
  padding: "5px 10px",
  cursor: "pointer",
  backgroundColor: "#3ea6ff",
  color: "white",
  border: "none",
  borderRadius: "5px"
};

export default NotificationDropdown;