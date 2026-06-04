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
      .then((data) => setReports(data))
      .catch((error) => console.error("Error loading reports:", error));
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
    <div>
      <h1>Report Issue</h1>

      <form onSubmit={submitReport} style={formStyle}>
        <div style={inputGroupStyle}>
          <label>Reporter ID:</label>
          <input
            type="number"
            value={reporterId}
            onChange={(event) => setReporterId(event.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={inputGroupStyle}>
          <label>Target Type:</label>
          <select
            value={targetType}
            onChange={(event) => setTargetType(event.target.value)}
            style={inputStyle}
          >
            <option value="LISTING">Listing</option>
            <option value="USER">User</option>
            <option value="MESSAGE">Message</option>
            <option value="ORDER">Order</option>
          </select>
        </div>

        <div style={inputGroupStyle}>
          <label>Target ID:</label>
          <input
            type="number"
            placeholder="Example: 5"
            value={targetId}
            onChange={(event) => setTargetId(event.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={inputGroupStyle}>
          <label>Reason:</label>
          <textarea
            placeholder="Enter report reason..."
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows="4"
            style={inputStyle}
          />
        </div>

        <button type="submit" style={buttonStyle}>
          Submit Report
        </button>
      </form>

      {message && <p>{message}</p>}

      <h2>Submitted Reports</h2>

      {reports.length === 0 ? (
        <p>No reports yet.</p>
      ) : (
        reports.map((report) => (
          <div key={report.reportId} style={cardStyle}>
            <p><strong>Report ID:</strong> {report.reportId}</p>
            <p><strong>Reporter ID:</strong> {report.reporterId}</p>
            <p><strong>Target:</strong> {report.targetType} #{report.targetId}</p>
            <p><strong>Reason:</strong> {report.reason}</p>
            <p><strong>Status:</strong> {report.status}</p>
            <p>
              <strong>Admin Action:</strong>{" "}
              {report.adminAction ? report.adminAction : "None"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

const formStyle = {
  border: "1px solid #ccc",
  padding: "20px",
  width: "500px",
  marginBottom: "30px"
};

const inputGroupStyle = {
  marginBottom: "15px",
  display: "flex",
  flexDirection: "column",
  gap: "5px"
};

const inputStyle = {
  padding: "8px",
  fontSize: "14px"
};

const buttonStyle = {
  padding: "10px 20px",
  cursor: "pointer"
};

const cardStyle = {
  border: "1px solid #ddd",
  padding: "15px",
  marginBottom: "10px",
  width: "600px"
};

export default ReportForm;