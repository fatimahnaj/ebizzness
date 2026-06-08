import { useEffect, useState } from "react";

function ReportForm() {
  const [reporterId, setReporterId] = useState(2);
  const [targetId, setTargetId] = useState("");
  const [targetType, setTargetType] = useState("LISTING");
  const [reason, setReason] = useState("");
  const [reports, setReports] = useState([]);
  const [message, setMessage] = useState("");

  function loadReports() {
    fetch("http://localhost:8080/api/reports")
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

  function submitReport(event) {
    event.preventDefault();

    if (targetId === "" || reason.trim() === "") {
      alert("Please enter target ID and report reason.");
      return;
    }

    const newReport = {
      reporterId: Number(reporterId),
      targetId: Number(targetId),
      targetType: targetType,
      reason: reason
    };

    fetch("http://localhost:8080/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newReport)
    })
      .then((response) => response.json())
      .then((data) => {
        setMessage(`Report submitted successfully. Report ID: ${data.reportId}`);
        setTargetId("");
        setReason("");
        loadReports();
      })
      .catch((error) => {
        console.error("Error submitting report:", error);
        setMessage("Failed to submit report.");
      });
  }

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div className="report-page">
      <div className="report-header">
        <h2>Report Issue</h2>
        <p>Submit marketplace issues for admin review and moderation.</p>
      </div>

      <div className="report-layout">
        <div className="report-left">
          <form onSubmit={submitReport} className="card report-form-card">
            <h3>Create New Report</h3>

            <div className="form-group">
              <label>Reporter ID</label>
              <input
                type="number"
                value={reporterId}
                onChange={(event) => setReporterId(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Target Type</label>
              <select
                value={targetType}
                onChange={(event) => setTargetType(event.target.value)}
              >
                <option value="LISTING">Listing</option>
                <option value="USER">User</option>
                <option value="MESSAGE">Message</option>
                <option value="ORDER">Order</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target ID</label>
              <input
                type="number"
                placeholder="Example: 5"
                value={targetId}
                onChange={(event) => setTargetId(event.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Reason</label>
              <textarea
                placeholder="Enter report reason..."
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows="5"
              />
            </div>

            <button type="submit" className="btn-primary">
              Submit Report
            </button>

            {message && <p className="report-message">{message}</p>}
          </form>
        </div>

        <div className="report-right">
          <div className="report-list-header">
            <h3>Submitted Reports</h3>
            <span>{reports.length} total</span>
          </div>

          {reports.length === 0 ? (
            <div className="card empty-report-card">No reports yet.</div>
          ) : (
            reports.map((report) => (
              <div key={report.reportId} className="card report-card">
                <div className="report-card-top">
                  <div>
                    <span className="report-type-pill">{report.targetType}</span>
                    <h4>Report #{report.reportId}</h4>
                  </div>

                  <span
                    className={
                      report.status === "RESOLVED"
                        ? "badge badge-resolved"
                        : report.status === "REJECTED"
                        ? "badge badge-rejected"
                        : "badge badge-open"
                    }
                  >
                    {report.status}
                  </span>
                </div>

                <p>
                  <strong>Reporter ID:</strong> {report.reporterId}
                </p>

                <p>
                  <strong>Target:</strong> {report.targetType} #{report.targetId}
                </p>

                <p>
                  <strong>Reason:</strong> {report.reason}
                </p>

                {report.adminAction && (
                  <p>
                    <strong>Admin Action:</strong> {report.adminAction}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportForm;