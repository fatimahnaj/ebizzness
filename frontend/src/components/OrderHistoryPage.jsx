// src/components/OrderHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../services/orderService';
import { requestRefund } from '../services/refundService';
import { createReview, getReviewsByBuyer } from '../services/ReviewService';

const API_ORIGIN = 'http://localhost:8080';

const formatMoney = (value) => `RM ${Number(value || 0).toFixed(2)}`;

const getQrImageSrc = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${API_ORIGIN}${path}`;
};

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [actionOrderId, setActionOrderId] = useState(null);
    const [refundOrder, setRefundOrder] = useState(null);
    const [refundReason, setRefundReason] = useState('');
    const [reviewTarget, setReviewTarget] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [submittedReviews, setSubmittedReviews] = useState({});

    useEffect(() => {
        loadOrders();
    }, []);

    const getReviewKey = (orderId, productId) => `${orderId}-${productId}`;

    const loadOrders = async () => {
        try {
            const res = await getOrders();
            setOrders(res.data);

            const buyerId = localStorage.getItem('userId');
            if (buyerId) {
                const reviews = await getReviewsByBuyer(buyerId);
                const reviewedItems = {};

                reviews.forEach((review) => {
                    reviewedItems[getReviewKey(review.orderId, review.productId)] = true;
                });

                setSubmittedReviews(reviewedItems);
            }
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to load orders.');
        } finally {
            setLoading(false);
        }
    };

    const openRefundRequest = (order) => {
        setRefundOrder(order);
        setRefundReason('');
        setMessage('');
    };

    const openReviewForm = (order, item) => {
        setReviewTarget({ order, item });
        setReviewRating(5);
        setReviewComment('');
        setMessage('');
    };

    const handleRefundRequest = async (e) => {
        e.preventDefault();

        if (!refundOrder || !refundReason.trim()) {
            return;
        }

        const orderId = refundOrder.orderId;
        setActionOrderId(orderId);
        setMessage('');

        try {
            const res = await requestRefund(orderId, refundReason.trim());
            setMessage(`Refund request #${res.data.refundId} submitted for order #${orderId}.`);
            setRefundOrder(null);
            setRefundReason('');
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to request refund.');
        } finally {
            setActionOrderId(null);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();

        if (!reviewTarget) {
            return;
        }

        setReviewSubmitting(true);
        setMessage('');

        try {
            await createReview({
                orderId: reviewTarget.order.orderId,
                productId: reviewTarget.item.productId,
                rating: Number(reviewRating),
                comment: reviewComment.trim()
            });

            setSubmittedReviews(prev => ({
                ...prev,
                [getReviewKey(reviewTarget.order.orderId, reviewTarget.item.productId)]: true
            }));
            setMessage(`Review submitted for ${reviewTarget.item.productTitle}.`);
            setReviewTarget(null);
            setReviewComment('');
            setReviewRating(5);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to submit review.');
        } finally {
            setReviewSubmitting(false);
        }
    };

    if (loading) {
        return <div className="container mt-5">Loading orders...</div>;
    }

    return (
        <div className="container mt-5 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">My Orders</h2>
                    <p className="text-muted mb-0">Track checkout, payment, pickup, and refund status.</p>
                </div>

                <Link to="/user-dashboard" className="btn btn-outline-secondary">
                    Continue Shopping
                </Link>
            </div>

            {message && <div className="alert alert-info">{message}</div>}

            {orders.length === 0 ? (
                <div className="border rounded bg-light p-5 text-center">
                    <h5>No orders yet</h5>
                    <p className="text-muted mb-0">Items you checkout will appear here.</p>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {orders.map(order => {
                        const qrImageSrc = getQrImageSrc(order.qrCodeImagePath);
                        const pickupUrl = `/pickup?orderId=${order.orderId}&code=${encodeURIComponent(order.pickupCode || '')}`;
                        const isPaid = order.status === 'PAID';
                        const isCompleted = order.status === 'COMPLETED';

                        return (
                            <div key={order.orderId} className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                                        <div>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <h5 className="fw-bold mb-0">Order #{order.orderId}</h5>
                                                <span className={`badge ${
                                                    isCompleted ? 'bg-success' :
                                                    isPaid ? 'bg-primary' :
                                                    order.status === 'REFUNDED' ? 'bg-secondary' :
                                                    'bg-warning text-dark'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </div>

                                            <div className="text-muted small">
                                                {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'Date unavailable'}
                                            </div>
                                            <div className="mt-2">Seller: <strong>{order.sellerName || 'Seller'}</strong></div>
                                            <div>Total: <strong>{formatMoney(order.totalAmount)}</strong></div>
                                            <div>Pickup Code: <strong>{order.pickupCode || 'N/A'}</strong></div>
                                        </div>

                                        {qrImageSrc && (
                                            <div className="text-lg-end">
                                                <img
                                                    src={qrImageSrc}
                                                    alt={`Pickup QR for order ${order.orderId}`}
                                                    width="110"
                                                    height="110"
                                                    className="border rounded bg-white p-1"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {order.items?.length > 0 && (
                                        <div className="table-responsive mt-3">
                                            <table className="table table-sm align-middle mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>Product</th>
                                                        <th className="text-center">Qty</th>
                                                        <th className="text-end">Price</th>
                                                        <th className="text-end">Subtotal</th>
                                                        {isCompleted && <th className="text-end">Review</th>}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.items.map(item => (
                                                        <tr key={`${order.orderId}-${item.productId}`}>
                                                            <td>{item.productTitle}</td>
                                                            <td className="text-center">{item.quantity}</td>
                                                            <td className="text-end">{formatMoney(item.priceAtPurchase)}</td>
                                                            <td className="text-end">{formatMoney(item.subtotal)}</td>
                                                            {isCompleted && (
                                                                <td className="text-end">
                                                                    {submittedReviews[getReviewKey(order.orderId, item.productId)] ? (
                                                                        <button className="btn btn-success btn-sm" disabled>
                                                                            Submitted
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            className="btn btn-outline-primary btn-sm"
                                                                            onClick={() => openReviewForm(order, item)}
                                                                        >
                                                                            Review
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    <div className="d-flex flex-wrap gap-2 mt-3">
                                        {isPaid && order.pickupCode && (
                                            <Link to={pickupUrl} className="btn btn-primary btn-sm">
                                                Confirm Pickup
                                            </Link>
                                        )}

                                        {isCompleted && (
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => openRefundRequest(order)}
                                                disabled={actionOrderId === order.orderId}
                                            >
                                                {actionOrderId === order.orderId ? 'Submitting...' : 'Request Refund'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {refundOrder && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <form onSubmit={handleRefundRequest}>
                                <div className="modal-header">
                                    <h5 className="modal-title fw-bold">
                                        Request Refund for Order #{refundOrder.orderId}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setRefundOrder(null)}
                                    />
                                </div>

                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Refund reason</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={refundReason}
                                            onChange={(event) => setRefundReason(event.target.value)}
                                            placeholder="Describe the issue with the order or pickup."
                                            required
                                        />
                                    </div>
                                    <div className="alert alert-warning mb-0">
                                        Admin will review this request before any mock refund is approved.
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setRefundOrder(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-danger"
                                        disabled={actionOrderId === refundOrder.orderId}
                                    >
                                        {actionOrderId === refundOrder.orderId ? 'Submitting...' : 'Submit Refund'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {reviewTarget && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <form onSubmit={handleReviewSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title fw-bold">
                                        Review {reviewTarget.item.productTitle}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setReviewTarget(null)}
                                    />
                                </div>

                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Rating</label>
                                        <select
                                            className="form-select"
                                            value={reviewRating}
                                            onChange={(event) => setReviewRating(event.target.value)}
                                        >
                                            <option value="5">5 - Excellent</option>
                                            <option value="4">4 - Good</option>
                                            <option value="3">3 - Okay</option>
                                            <option value="2">2 - Poor</option>
                                            <option value="1">1 - Bad</option>
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold">Comment</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={reviewComment}
                                            onChange={(event) => setReviewComment(event.target.value)}
                                            placeholder="Share your experience with this item."
                                            maxLength="1000"
                                        />
                                    </div>

                                    <div className="alert alert-info mb-0">
                                        Reviews can only be submitted after the order is completed.
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={() => setReviewTarget(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={reviewSubmitting}
                                    >
                                        {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;
