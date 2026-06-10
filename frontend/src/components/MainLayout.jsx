import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

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
            className={
              location.pathname === "/admin-dashboard" ? "active" : ""
            }
            onClick={() => navigate("/admin-dashboard")}
          >
            Admin Dashboard
          </button>
        </div>

        <div className="nav-right">
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: "20px"
            }}
          >
            🔔
          </button>

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