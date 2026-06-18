import { useEffect, useState } from "react";

function ResolveReports() {
  const [reports, setReports] = useState([]);
  const [selectedActions, setSelectedActions] = useState({});

  function getAdminId() {
    const storedAdminId = Number(localStorage.getItem("adminId"));

    if (Number.isFinite(storedAdminId) && storedAdminId > 0) {
      return storedAdminId;
    }

    const storedUserId = Number(localStorage.getItem("userId"));

    if (Number.isFinite(storedUserId) && storedUserId > 0) {
      return storedUserId;
    }

    return 1;
  }

  function loadReports() {
    fetch("http://localhost:8080/api/admin/reports")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load reports.");
        }

        return response.json();
      })
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
      [reportId]: action,
    });
  }

  function resolveReport(reportId) {
    const report = reports.find((item) => item.reportId === reportId);

    if (!report) {
      alert("Report not found.");
      return;
    }

    const action =
      selectedActions[reportId] || getActionsForReport(report)[0].value;

    const confirmResolve = window.confirm(
      `Are you sure you want to apply this action: ${action}?`
    );

    if (!confirmResolve) return;

    const adminId = getAdminId();

    fetch(
      `http://localhost:8080/api/admin/reports/${reportId}/resolve?adminId=${adminId}&adminAction=${encodeURIComponent(
        action
      )}`,
      {
        method: "PUT",
      }
    )
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to resolve report.");
        }

        return response.json();
      })
      .then(() => {
        alert("Report resolved successfully.");
        loadReports();
      })
      .catch((error) => {
        console.error("Error resolving report:", error);
        alert(error.message);
      });
  }

  function rejectReport(reportId) {
    const confirmReject = window.confirm(
      "Are you sure you want to reject this report?"
    );

    if (!confirmReject) return;

    const adminId = getAdminId();

    fetch(
      `http://localhost:8080/api/admin/reports/${reportId}/reject?adminId=${adminId}`,
      {
        method: "PUT",
      }
    )
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to reject report.");
        }

        return response.json();
      })
      .then(() => {
        alert("Report rejected successfully.");
        loadReports();
      })
      .catch((error) => {
        console.error("Error rejecting report:", error);
        alert("Failed to reject report. Check backend console.");
      });
  }

  function openProductDetails(productId) {
    globalThis.open(`/products/${productId}`, "_blank", "noopener,noreferrer");
  }

  useEffect(() => {
    loadReports();
  }, []);

  const openReports = reports.filter((report) => report.status === "OPEN");
  const closedReports = reports.filter((report) => report.status !== "OPEN");

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h2>Resolve Reports</h2>
          <p>Review pending reports and choose the appropriate admin action.</p>
        </div>

        <span className="admin-badge">{openReports.length} Pending</span>
      </div>

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

                  {isListingReport(report) && (
                    <button
                      type="button"
                      className="view-product-details-btn"
                      onClick={() => openProductDetails(report.targetId)}
                    >
                      View Product Details
                    </button>
                  )}

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
                    value={
                      selectedActions[report.reportId] ||
                      getActionsForReport(report)[0].value
                    }
                    onChange={(event) =>
                      handleActionChange(report.reportId, event.target.value)
                    }
                  >
                    {getActionsForReport(report).map((action) => (
                      <option key={action.value} value={action.value}>
                        {action.label}
                      </option>
                    ))}
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
                    Reject Report
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="admin-section">
          <div className="admin-section-header">
            <h3>Recently Closed Reports</h3>
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

                {isListingReport(report) && (
                  <button
                    type="button"
                    className="view-product-details-btn"
                    onClick={() => openProductDetails(report.targetId)}
                  >
                    View Product Details
                  </button>
                )}

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

function isListingReport(report) {
  const targetType = report.targetType?.toUpperCase();
  return targetType === "LISTING" || targetType === "PRODUCT";
}

function getActionsForReport(report) {
  const targetType = report.targetType?.toUpperCase();

  if (targetType === "USER") {
    return [
      { value: "USER_BANNED", label: "Ban User" },
      { value: "WARNING_SENT", label: "Warning Sent" },
      { value: "INVESTIGATION_REQUIRED", label: "Investigation Required" },
    ];
  }

  if (targetType === "LISTING") {
    return [
      { value: "LISTING_REMOVED", label: "Remove Listing" },
      { value: "WARNING_SENT", label: "Warning Sent" },
      { value: "INVESTIGATION_REQUIRED", label: "Investigation Required" },
    ];
  }

  if (targetType === "MESSAGE") {
    return [
      { value: "MESSAGE_DELETED", label: "Delete Message" },
      { value: "WARNING_SENT", label: "Warning Sent" },
      { value: "INVESTIGATION_REQUIRED", label: "Investigation Required" },
    ];
  }

  return [
    { value: "WARNING_SENT", label: "Warning Sent" },
    { value: "INVESTIGATION_REQUIRED", label: "Investigation Required" },
  ];
}

function formatDate(dateTime) {
  if (!dateTime) return "-";

  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default ResolveReports;
