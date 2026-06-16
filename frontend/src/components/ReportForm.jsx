// src/components/ReportForm.jsx

import React, { useEffect, useState } from "react";
import authService from "../services/authService";

function ReportForm({
  initialTargetType = "",
  initialTargetId = "",
  onSuccess
}) {
  const [currentUser, setCurrentUser] = useState(null);
  const [targetType, setTargetType] = useState(initialTargetType);
  const [targetId, setTargetId] = useState(initialTargetId);
  const [reason, setReason] = useState("");

  const [loadingUser, setLoadingUser] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      setLoadingUser(true);

      const data = await authService.getProfile();
      setCurrentUser(data);

      const userId = getUserId(data);

      if (userId) {
        localStorage.setItem("userId", userId);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      setErrorMessage("Unable to load your user profile. Please login again.");
    } finally {
      setLoadingUser(false);
    }
  };

  const getUserId = (user) => {
    return user?.userID || user?.userId || user?.id;
  };

  const getTargetHelpText = () => {
    if (targetType === "LISTING") {
      return "Enter the product/listing ID of the item you are reporting.";
    }

    if (targetType === "USER") {
      return "Enter the user ID of the buyer or seller you are reporting.";
    }

    if (targetType === "MESSAGE") {
      return "Enter the message ID of the inappropriate message.";
    }

    if (targetType === "ORDER") {
      return "Enter the order ID related to your issue.";
    }

    return "Choose what you are reporting first.";
  };

  const validateForm = () => {
    if (!currentUser) {
      setErrorMessage("User profile is still loading. Please wait.");
      return false;
    }

    if (!targetType) {
      setErrorMessage("Please choose what you are reporting.");
      return false;
    }

    if (!targetId || Number(targetId) <= 0) {
      setErrorMessage("Please enter a valid target ID.");
      return false;
    }

    if (!reason.trim()) {
      setErrorMessage("Please describe the reason for your report.");
      return false;
    }

    if (reason.trim().length < 10) {
      setErrorMessage("Please provide a clearer reason with at least 10 characters.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!validateForm()) {
      return;
    }

    const reporterId = getUserId(currentUser);

    const reportData = {
      reporterId: Number(reporterId),
      targetType: targetType,
      targetId: Number(targetId),
      reason: reason.trim()
    };

    try {
      setSubmitting(true);

      const response = await fetch("http://localhost:8080/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) {
        throw new Error("Failed to submit report");
      }

      setSuccessMessage(
        "Report submitted successfully. An admin will review it soon."
      );

      setTargetType(initialTargetType || "");
      setTargetId(initialTargetId || "");
      setReason("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      setErrorMessage("Failed to submit report. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-page">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-xl-7">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body p-4 p-md-5">
              <div className="mb-4">
                <h2 className="fw-bold mb-2">Report an Issue</h2>
                <p className="text-muted mb-0">
                  Use this form to report suspicious listings, inappropriate
                  users, messages, or transaction problems.
                </p>
              </div>

              {successMessage && (
                <div className="alert alert-success rounded-3">
                  {successMessage}
                </div>
              )}

              {errorMessage && (
                <div className="alert alert-danger rounded-3">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Reporting As</label>

                  <div className="form-control bg-light">
                    {loadingUser
                      ? "Loading user..."
                      : currentUser
                      ? `${currentUser.name || "User"} (${currentUser.email})`
                      : "User not found"}
                  </div>

                  <small className="text-muted">
                    Your account is attached automatically. You do not need to
                    enter your user ID.
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    What are you reporting?
                  </label>

                  <select
                    className="form-select"
                    value={targetType}
                    onChange={(e) => setTargetType(e.target.value)}
                  >
                    <option value="">Select report type</option>
                    <option value="LISTING">Product / Listing</option>
                    <option value="USER">Buyer / Seller Account</option>
                    <option value="MESSAGE">Chat Message</option>
                    <option value="ORDER">Order / Transaction</option>
                  </select>

                  <small className="text-muted">
                    Choose the category that best matches your issue.
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Reported Item / User ID
                  </label>

                  <input
                    type="number"
                    className="form-control"
                    placeholder="Example: 5"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                  />

                  <small className="text-muted">{getTargetHelpText()}</small>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">
                    Reason for Report
                  </label>

                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Explain the issue clearly. Example: This listing contains inappropriate content or the seller is not responding after payment."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />

                  <div className="d-flex justify-content-between mt-1">
                    <small className="text-muted">
                      Please provide enough detail for admin review.
                    </small>

                    <small className="text-muted">
                      {reason.length}/500
                    </small>
                  </div>
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-danger fw-bold rounded-pill py-2"
                    disabled={submitting || loadingUser}
                  >
                    {submitting ? "Submitting Report..." : "Submit Report"}
                  </button>
                </div>
              </form>

              <div className="mt-4 p-3 bg-light rounded-3">
                <strong>Note:</strong>{" "}
                <span className="text-muted">
                  Reports are reviewed by admins. False reports may be ignored
                  or rejected.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportForm;
