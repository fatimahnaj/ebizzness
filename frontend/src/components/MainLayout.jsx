import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("user");
    navigate("/admin-login");
  };

  return (
    <div className="app">
      <nav className="admin-top-nav">
        <div className="admin-logo" onClick={() => navigate("/admin-dashboard")}>
          eBizzness
        </div>

        <div className="admin-nav-right">
          <span className="admin-greeting">
            Hi, {admin.name || "Admin"}
          </span>

          <NotificationDropdown />

          <button
            className={`admin-nav-pill ${isActive("/admin-dashboard") ? "active" : ""}`}
            onClick={() => navigate("/admin-dashboard")}
          >
            Dashboard
          </button>

          <button
            className={`admin-nav-pill ${isActive("/resolve-reports") ? "active" : ""}`}
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
            Manage Users
          </button>

          <button
            className={`admin-nav-pill ${isActive("/admin-marketplace") ? "active" : ""}`}
            onClick={() => navigate("/admin-marketplace")}
          >
            Moderate Marketplace
          </button>

          <button className="admin-logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="admin-page-content">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
