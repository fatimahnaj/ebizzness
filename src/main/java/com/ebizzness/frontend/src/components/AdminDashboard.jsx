import { useEffect, useState } from "react";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [reports, setReports] = useState([]);
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
      .then((data) => setReports(data))
      .catch((error) => console.error("Error loading reports:", error));
  }

  function resolveReport(reportId) {
    fetch(
      `http://localhost:8080/api/admin/reports/${reportId}/resolve?adminId=${adminId}&adminAction=LISTING_REMOVED`,
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

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {dashboard ? (
        <div style={summaryContainerStyle}>
          <div style={summaryCardStyle}>
            <h3>Total Reports</h3>
            <p>{dashboard.totalReports}</p>
          </div>

          <div style={summaryCardStyle}>
            <h3>Open Reports</h3>
            <p>{dashboard.openReports}</p>
          </div>

          <div style={summaryCardStyle}>
            <h3>Resolved Reports</h3>
            <p>{dashboard.resolvedReports}</p>
          </div>

          <div style={summaryCardStyle}>
            <h3>Rejected Reports</h3>
            <p>{dashboard.rejectedReports}</p>
          </div>

          <div style={summaryCardStyle}>
            <h3>Total Messages</h3>
            <p>{dashboard.totalMessages}</p>
          </div>

          <div style={summaryCardStyle}>
            <h3>Total Notifications</h3>
            <p>{dashboard.totalNotifications}</p>
          </div>
        </div>
      ) : (
        <p>Loading dashboard...</p>
      )}

      <h2>Manage Reports</h2>

      {reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        reports.map((report) => (
          <div key={report.reportId} style={reportCardStyle}>
            <p>
              <strong>Report ID:</strong> {report.reportId}
            </p>
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
              <strong>Status:</strong> {report.status}
            </p>
            <p>
              <strong>Admin Action:</strong>{" "}
              {report.adminAction ? report.adminAction : "None"}
            </p>

            {report.status === "OPEN" && (
              <div>
                <button
                  onClick={() => resolveReport(report.reportId)}
                  style={buttonStyle}
                >
                  Resolve
                </button>

                <button
                  onClick={() => rejectReport(report.reportId)}
                  style={rejectButtonStyle}
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

const summaryContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "15px",
  marginBottom: "30px"
};

const summaryCardStyle = {
  border: "1px solid #ccc",
  padding: "15px",
  width: "180px",
  textAlign: "center"
};

const reportCardStyle = {
  border: "1px solid #ddd",
  padding: "15px",
  marginBottom: "15px",
  width: "600px"
};

const buttonStyle = {
  padding: "8px 15px",
  marginRight: "10px",
  cursor: "pointer"
};

const rejectButtonStyle = {
  padding: "8px 15px",
  cursor: "pointer"
};

export default AdminDashboard;