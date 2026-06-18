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
          throw new Error(await readErrorMessage(response, "Failed to resolve report."));
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
          throw new Error(await readErrorMessage(response, "Failed to reject report."));
        }

        return response.json();
      })
      .then(() => {
        alert("Report rejected successfully.");
        loadReports();
      })
      .catch((error) => {
        console.error("Error rejecting report:", error);
        alert(error.message);
      });
  }

  function openProductDetails(productId) {
    globalThis.open(`/products/${productId}?adminView=true`, "_blank", "noopener,noreferrer");
  }

  useEffect(() => {
    loadReports();
  }, []);

  const openReports = reports.filter((report) => report.status === "OPEN");
  const closedReports = reports
    .filter((report) => report.status !== "OPEN")
    .sort(compareClosedReports);
  const resolvedReports = closedReports.filter(
    (report) => report.status === "RESOLVED"
  );
  const rejectedReports = closedReports.filter(
    (report) => report.status === "REJECTED"
  );

  return (
    <div className="admin-page">
      <div className="admin-header report-admin-header">
        <div>
          <h2>Resolve Reports</h2>
          <p>Review pending reports and choose the appropriate admin action.</p>
        </div>

        <div className="admin-header-actions">
          <span className="admin-badge">{openReports.length} Pending</span>
          <button type="button" className="admin-refresh-btn" onClick={loadReports}>
            Refresh
          </button>
        </div>
      </div>

      <div className="report-summary-grid">
        <div className="report-summary-card urgent">
          <span>Needs Review</span>
          <strong>{openReports.length}</strong>
        </div>

        <div className="report-summary-card success">
          <span>Resolved</span>
          <strong>{resolvedReports.length}</strong>
        </div>

        <div className="report-summary-card neutral">
          <span>Rejected</span>
          <strong>{rejectedReports.length}</strong>
        </div>
      </div>

      <div className="admin-content-grid reports-grid">
        <section className="admin-section report-workbench">
          <div className="admin-section-header">
            <div>
              <h3>Pending Reports</h3>
              <p>Prioritize the newest open reports first.</p>
            </div>
            <span>{openReports.length} needs review</span>
          </div>

          {openReports.length === 0 ? (
            <div className="empty-card">No open reports.</div>
          ) : (
            openReports.map((report) => (
              <div key={report.reportId} className="moderation-card">
                <div className="moderation-top">
                  <div>
                    <div className="report-card-eyebrow">
                      <span className="report-type">{report.targetType}</span>
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                    <h4>Report #{report.reportId}</h4>
                  </div>

                  <span className="status-badge status-open">OPEN</span>
                </div>

                <div className="report-details">
                  <div className="report-meta-grid">
                    <div className="report-meta-item">
                      <span>Reporter</span>
                      <strong>#{report.reporterId}</strong>
                    </div>

                    <div className="report-meta-item">
                      <span>Target</span>
                      <strong>
                        {report.targetType} #{report.targetId}
                      </strong>
                    </div>
                  </div>

                  {isListingReport(report) && (
                    <button
                      type="button"
                      className="view-product-details-btn"
                      onClick={() => openProductDetails(report.targetId)}
                    >
                      View Product Details
                    </button>
                  )}

                  <div className="report-reason-box">
                    <span>Reason</span>
                    <p>{report.reason || "No reason provided."}</p>
                  </div>
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
        </section>

        <section className="admin-section closed-report-panel">
          <div className="admin-section-header">
            <div>
              <h3>Recently Closed Reports</h3>
              <p>Latest moderation outcomes.</p>
            </div>
            <span>{closedReports.length} records</span>
          </div>

          {closedReports.length === 0 ? (
            <div className="empty-card">No closed reports yet.</div>
          ) : (
            closedReports.map((report) => (
              <div key={report.reportId} className="closed-report-card">
                <div className="closed-report-top">
                  <div>
                    <strong>Report #{report.reportId}</strong>
                    <span>
                      {report.targetType} #{report.targetId}
                    </span>
                  </div>

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

                <div className="closed-report-body">
                  <p>{report.reason || "No reason provided."}</p>

                  <div className="closed-report-meta">
                    <span>
                      Action:{" "}
                      <strong>
                        {formatActionLabel(report.adminAction || "NO_ACTION")}
                      </strong>
                    </span>

                    <span>
                      By:{" "}
                      <strong>
                        {report.resolvedByAdminId
                          ? `Admin ${report.resolvedByAdminId}`
                          : "-"}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </section>
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

function compareClosedReports(firstReport, secondReport) {
  const timeDifference =
    getClosedReportTime(secondReport) - getClosedReportTime(firstReport);

  if (timeDifference !== 0) {
    return timeDifference;
  }

  return getReportId(secondReport) - getReportId(firstReport);
}

function getClosedReportTime(report) {
  const timestamp = report.resolvedAt || report.createdAt;

  if (!timestamp) {
    return 0;
  }

  const time = new Date(timestamp).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function getReportId(report) {
  const reportId = Number(report.reportId);
  return Number.isNaN(reportId) ? 0 : reportId;
}

function formatActionLabel(action) {
  return action
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function readErrorMessage(response, fallbackMessage) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      const errorBody = await response.json();
      return errorBody.message || errorBody.error || fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  }

  const errorText = await response.text();

  if (!errorText) {
    return fallbackMessage;
  }

  try {
    const errorBody = JSON.parse(errorText);
    return errorBody.message || errorBody.error || fallbackMessage;
  } catch {
    return errorText;
  }
}

export default ResolveReports;
