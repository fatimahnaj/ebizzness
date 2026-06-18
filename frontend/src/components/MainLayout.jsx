import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="app">
      <nav className="nav">
        <div className="logo">
          e<span>Bizzness</span>
        </div>

        <div className="nav-links">
          <button
            className={location.pathname === "/messages" ? "active" : ""}
            onClick={() => navigate("/messages")}
          >
            Messages
          </button>

          <button
            className={location.pathname === "/report" ? "active" : ""}
            onClick={() => navigate("/report")}
          >
            Report Issue
          </button>

          <button
            className={location.pathname === "/resolve-reports" ? "active" : ""}
            onClick={() => navigate("/resolve-reports")}
          >
            Resolve Reports
          </button>

          <button
            className={location.pathname === "/admin-refunds" ? "active" : ""}
            onClick={() => navigate("/admin-refunds")}
          >
            Refunds
          </button>

          <button
            className={location.pathname === "/admin-dashboard" ? "active" : ""}
            onClick={() => navigate("/admin-dashboard")}
          >
            Admin Dashboard
          </button>
        </div>

        <div className="nav-right" style={{ position: "relative" }}>
          <NotificationDropdown />

          <div className="avatar">AJ</div>

          <button className="btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
