import { useEffect, useState } from "react";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [reports, setReports] = useState([]);
  const [selectedActions, setSelectedActions] = useState({});

  const adminId = 1;

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

  function handleActionChange(reportId, action) {
    setSelectedActions({
      ...selectedActions,
      [reportId]: action
    });
  }

  function resolveReport(reportId) {
    const action = selectedActions[reportId] || "WARNING_SENT";

    fetch(
      `http://localhost:8080/api/admin/reports/${reportId}/resolve?adminId=${adminId}&adminAction=${action}`,
      {
        method: "PUT"
      }
    )
      .then((response) => response.json())
      .then(() => {
        loadDashboard();
        loadReports();
      })
      .catch((error) => console.error("Error resolving report:", error));
  }

  function rejectReport(reportId) {
    fetch(
      `http://localhost:8080/api/admin/reports/${reportId}/reject?adminId=${adminId}`,
      {
        method: "PUT"
      }
    )
      .then((response) => response.json())
      .then(() => {
        loadDashboard();
        loadReports();
      })
      .catch((error) => console.error("Error rejecting report:", error));
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
            openReports.map((report) => (
              <div key={report.reportId} className="moderation-card">
                <div className="moderation-top">
                  <div>
                    <span className="report-type">{report.targetType}</span>
                    <h4>Report #{report.reportId}</h4>
                  </div>

                  <span className="status-badge status-open">OPEN</span>
                </div>

                <div className="report-details">
                  <p>
                    <strong>Reporter ID:</strong> {report.reporterId}
                  </p>
                  <p>
                    <strong>Target:</strong> {report.targetType} #{report.targetId}
                  </p>
                  <p>
                    <strong>Reason:</strong> {report.reason}
                  </p>
                  <p>
                    <strong>Created:</strong> {formatDate(report.createdAt)}
                  </p>
                </div>

                <div className="admin-action-box">
                  <label>Admin Action</label>

                  <select
                    value={selectedActions[report.reportId] || "WARNING_SENT"}
                    onChange={(event) =>
                      handleActionChange(report.reportId, event.target.value)
                    }
                  >
                    <option value="WARNING_SENT">Warning Sent</option>
                    <option value="LISTING_REMOVED">Listing Removed</option>
                    <option value="MESSAGE_DELETED">Message Deleted</option>
                    <option value="USER_BANNED">User Banned</option>
                    <option value="INVESTIGATION_REQUIRED">
                      Investigation Required
                    </option>
                  </select>
                </div>

                <div className="moderation-buttons">
                  <button
                    className="resolve-btn-ui"
                    onClick={() => resolveReport(report.reportId)}
                  >
                    Resolve Report
                  </button>

                  <button
                    className="reject-btn-ui"
                    onClick={() => rejectReport(report.reportId)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
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
            closedReports.map((report) => (
              <div key={report.reportId} className="closed-report-card">
                <div className="closed-report-top">
                  <strong>Report #{report.reportId}</strong>

                  <span
                    className={
                      report.status === "RESOLVED"
                        ? "status-badge status-resolved"
                        : "status-badge status-rejected"
                    }
                  >
                    {report.status}
                  </span>
                </div>

                <p>
                  <strong>Target:</strong> {report.targetType} #{report.targetId}
                </p>

                <p>
                  <strong>Reason:</strong> {report.reason}
                </p>

                <p>
                  <strong>Action:</strong>{" "}
                  {report.adminAction ? report.adminAction : "NO_ACTION"}
                </p>

                <p>
                  <strong>Resolved By:</strong>{" "}
                  {report.resolvedByAdminId
                    ? `Admin ${report.resolvedByAdminId}`
                    : "-"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(dateTime) {
  if (!dateTime) return "-";

  const date = new Date(dateTime);

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export default AdminDashboard;