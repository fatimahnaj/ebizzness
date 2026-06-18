import React, { useEffect, useState } from 'react';
import { getRefunds, resolveRefund } from '../services/refundService';

const formatMoney = (value) => `RM ${Number(value || 0).toFixed(2)}`;

const AdminRefundsPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    loadRefunds();
  }, []);

  const loadRefunds = async () => {
    setLoading(true);
    setMessage('');

    try {
      const res = await getRefunds();
      setRefunds(res.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to load refund requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (refundId, action) => {
    setActionId(refundId);
    setMessage('');

    try {
      await resolveRefund(refundId, action);
      setMessage(`Refund #${refundId} ${action === 'APPROVE' ? 'approved' : 'rejected'}.`);
      await loadRefunds();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to resolve refund.');
    } finally {
      setActionId(null);
    }
  };

  const pendingRefunds = refunds.filter(refund => refund.status === 'PENDING');
  const resolvedRefunds = refunds.filter(refund => refund.status !== 'PENDING');

  if (loading) {
    return <div className="admin-page">Loading refund requests...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h2>Refund Requests</h2>
          <p>Approve or reject buyer refund claims after pickup completion.</p>
        </div>

        <button className="admin-tab active" onClick={loadRefunds}>
          Refresh
        </button>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      <div className="admin-content-grid">
        <section className="admin-section">
          <div className="admin-section-header">
            <h3>Pending Refunds</h3>
            <span>{pendingRefunds.length} needs decision</span>
          </div>

          {pendingRefunds.length === 0 ? (
            <div className="empty-card">No pending refund requests.</div>
          ) : (
            pendingRefunds.map(refund => (
              <div className="closed-report-card" key={refund.refundId}>
                <div className="closed-report-top">
                  <strong>Refund #{refund.refundId}</strong>
                  <span className="status-badge status-open">PENDING</span>
                </div>

                <div>Order: <strong>#{refund.orderId}</strong></div>
                <div>Buyer: <strong>{refund.buyerName || `Buyer ${refund.buyerId}`}</strong></div>
                <div>Amount: <strong>{formatMoney(refund.refundAmount)}</strong></div>
                <div>Reason: {refund.reason}</div>
                <div className="text-muted small">
                  Requested {refund.requestedAt ? new Date(refund.requestedAt).toLocaleString() : 'recently'}
                </div>

                <div className="moderation-buttons mt-2">
                  <button
                    className="resolve-btn-ui"
                    onClick={() => handleResolve(refund.refundId, 'APPROVE')}
                    disabled={actionId === refund.refundId}
                  >
                    Approve Refund
                  </button>
                  <button
                    className="reject-btn-ui"
                    onClick={() => handleResolve(refund.refundId, 'REJECT')}
                    disabled={actionId === refund.refundId}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="admin-section">
          <div className="admin-section-header">
            <h3>Resolved Refunds</h3>
            <span>{resolvedRefunds.length} records</span>
          </div>

          {resolvedRefunds.length === 0 ? (
            <div className="empty-card">No resolved refunds yet.</div>
          ) : (
            resolvedRefunds.map(refund => (
              <div className="closed-report-card" key={refund.refundId}>
                <div className="closed-report-top">
                  <strong>Refund #{refund.refundId}</strong>
                  <span className={`status-badge ${refund.status === 'APPROVED' ? 'status-resolved' : 'status-rejected'}`}>
                    {refund.status}
                  </span>
                </div>

                <div>Order: <strong>#{refund.orderId}</strong></div>
                <div>Buyer: <strong>{refund.buyerName || `Buyer ${refund.buyerId}`}</strong></div>
                <div>Amount: <strong>{formatMoney(refund.refundAmount)}</strong></div>
                <div>Reason: {refund.reason}</div>
                <div className="text-muted small">
                  Resolved {refund.resolvedAt ? new Date(refund.resolvedAt).toLocaleString() : 'recently'}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminRefundsPage;
