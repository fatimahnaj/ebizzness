import { useEffect, useState } from "react";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [reports, setReports] = useState([]);

  function loadDashboard() {
    fetch("http://localhost:8080/api/admin/dashboard")
      .then((response) => response.json())
      .then((data) => setDashboard(data))
      .catch((error) => console.error("Error loading dashboard:", error));
  }

  function loadReports() {
    fetch("http://localhost:8080/api/admin/reports")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReports(data);
        } else {
          setReports([]);
        }
      })
      .catch((error) => {
        console.error("Error loading reports:", error);
        setReports([]);
      });
  }

  useEffect(() => {
    loadDashboard();
    loadReports();
  }, []);

  const openReports = reports.filter((report) => report.status === "OPEN");
  const closedReports = reports.filter((report) => report.status !== "OPEN");

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Review reports, resolve issues, and moderate marketplace activity.</p>
        </div>

        <span className="admin-badge">Admin Panel</span>
      </div>

      {dashboard && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <span>Total Reports</span>
            <strong>{dashboard.totalReports}</strong>
          </div>

          <div className="admin-stat-card danger">
            <span>Open Reports</span>
            <strong>{dashboard.openReports}</strong>
          </div>

          <div className="admin-stat-card success">
            <span>Resolved</span>
            <strong>{dashboard.resolvedReports}</strong>
          </div>

          <div className="admin-stat-card warning">
            <span>Rejected</span>
            <strong>{dashboard.rejectedReports}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Messages</span>
            <strong>{dashboard.totalMessages}</strong>
          </div>

          <div className="admin-stat-card">
            <span>Notifications</span>
            <strong>{dashboard.totalNotifications}</strong>
          </div>
        </div>
      )}

      <div className="admin-content-grid">
        <div className="admin-section">
          <div className="admin-section-header">
            <h3>Pending Reports</h3>
            <span>{openReports.length} needs review</span>
          </div>

          {openReports.length === 0 ? (
            <div className="empty-card">No open reports.</div>
          ) : (
            <div className="empty-card">
              You have {openReports.length} open report(s). Open the{" "}
              <strong>Resolve Reports</strong> page from the top navigation to review them.
            </div>
          )}
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <h3>Resolved / Closed Reports</h3>
            <span>{closedReports.length} records</span>
          </div>

          {closedReports.length === 0 ? (
            <div className="empty-card">No closed reports yet.</div>
          ) : (
            <div className="empty-card">
              {closedReports.length} report(s) have already been closed.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
