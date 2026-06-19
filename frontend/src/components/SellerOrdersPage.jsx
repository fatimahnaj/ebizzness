import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSellerOrders } from '../services/orderService';
import { withApiOrigin } from '../services/apiConfig';

const formatMoney = (value) => `RM ${Number(value || 0).toFixed(2)}`;

const getQrImageSrc = (path) => {
    if (!path) return null;
    return withApiOrigin(path);
};

const getPickupQrLink = (order) => {
    if (!order.qrCodeData) return null;
    return `${window.location.origin}/pickup?data=${encodeURIComponent(order.qrCodeData)}`;
};

const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const getStatusPresentation = (status) => {
    switch (status) {
        case 'COMPLETED':
            return {
                badgeClass: 'bg-success',
                title: 'Pickup completed',
                description: 'Buyer QR verification succeeded. This parcel has been collected.'
            };
        case 'PAID':
            return {
                badgeClass: 'bg-primary',
                title: 'Awaiting pickup scan',
                description: 'Payment is complete. Waiting for the buyer to scan and confirm the parcel QR.'
            };
        default:
            return {
                badgeClass: 'bg-secondary',
                title: 'Order in progress',
                description: 'Refresh to view the latest order state.'
            };
    }
};

const SellerOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);
    const hasLoadedOnceRef = useRef(false);

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        const refreshTimer = window.setInterval(() => {
            loadOrders({ silent: true });
        }, 5000);

        return () => window.clearInterval(refreshTimer);
    }, []);

    const loadOrders = async ({ silent = false } = {}) => {
        if (!silent) {
            setLoading(true);
            setMessage('');
        }

        try {
            const res = await getSellerOrders();
            const nextOrders = res.data;

            setOrders(previousOrders => {
                if (hasLoadedOnceRef.current) {
                    const previousStatusById = new Map(
                        previousOrders.map(order => [order.orderId, order.status])
                    );

                    const completedOrder = nextOrders.find(order =>
                        order.status === 'COMPLETED' &&
                        previousStatusById.get(order.orderId) &&
                        previousStatusById.get(order.orderId) !== 'COMPLETED'
                    );

                    if (completedOrder) {
                        setMessage(`Order #${completedOrder.orderId} pickup completed successfully.`);
                    }
                }

                return nextOrders;
            });
            hasLoadedOnceRef.current = true;
            setLastUpdated(new Date());
        } catch (err) {
            if (!silent) {
                setMessage(err.response?.data?.message || 'Failed to load seller orders.');
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    const handlePrintLabel = (order) => {
        const qrImageSrc = getQrImageSrc(order.qrCodeImagePath);
        if (!qrImageSrc) {
            setMessage(`Order #${order.orderId} does not have a QR code yet.`);
            return;
        }

        const itemRows = (order.items || []).map(item => `
            <tr>
                <td>${escapeHtml(item.productTitle)}</td>
                <td>${escapeHtml(item.quantity)}</td>
            </tr>
        `).join('');

        const printWindow = window.open('', `qr-label-${order.orderId}`, 'width=520,height=720');
        if (!printWindow) {
            setMessage('Please allow pop-ups so the QR label can open for printing.');
            return;
        }

        printWindow.document.write(`
            <!doctype html>
            <html>
                <head>
                    <title>eBizzness Order #${escapeHtml(order.orderId)} QR Label</title>
                    <style>
                        * { box-sizing: border-box; }
                        body {
                            margin: 0;
                            padding: 24px;
                            font-family: Arial, sans-serif;
                            color: #111827;
                        }
                        .label {
                            width: 100%;
                            max-width: 420px;
                            border: 2px solid #111827;
                            padding: 20px;
                            margin: 0 auto;
                        }
                        h1 {
                            margin: 0 0 4px;
                            font-size: 22px;
                        }
                        .muted {
                            color: #4b5563;
                            font-size: 13px;
                        }
                        .qr {
                            display: block;
                            width: 240px;
                            height: 240px;
                            margin: 18px auto;
                            border: 1px solid #d1d5db;
                            padding: 8px;
                        }
                        .code {
                            margin: 12px 0;
                            padding: 10px;
                            text-align: center;
                            border: 1px dashed #4b5563;
                            font-size: 20px;
                            font-weight: 700;
                            letter-spacing: 2px;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 12px;
                            font-size: 13px;
                        }
                        th, td {
                            border-bottom: 1px solid #e5e7eb;
                            padding: 6px 4px;
                            text-align: left;
                        }
                        .footer {
                            margin-top: 14px;
                            font-size: 12px;
                            color: #374151;
                        }
                    </style>
                </head>
                <body>
                    <section class="label">
                        <h1>eBizzness Pickup QR</h1>
                        <div class="muted">Scan only when the buyer receives the parcel.</div>
                        <img class="qr" src="${escapeHtml(qrImageSrc)}" alt="Pickup QR">
                        <div>Order: <strong>#${escapeHtml(order.orderId)}</strong></div>
                        <div>Buyer: <strong>${escapeHtml(order.buyerName || 'Buyer')}</strong></div>
                        <div>Total: <strong>${escapeHtml(formatMoney(order.totalAmount))}</strong></div>
                        <div class="code">${escapeHtml(order.pickupCode || 'NO CODE')}</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                </tr>
                            </thead>
                            <tbody>${itemRows}</tbody>
                        </table>
                        <div class="footer">
                            Security check: this QR opens the pickup confirmation page with encrypted order data.
                        </div>
                    </section>
                </body>
            </html>
        `);
        printWindow.document.close();

        const qrImage = printWindow.document.querySelector('.qr');
        const print = () => {
            printWindow.focus();
            printWindow.print();
        };

        if (qrImage && !qrImage.complete) {
            qrImage.onload = print;
            qrImage.onerror = print;
        } else {
            setTimeout(print, 250);
        }
    };

    const handleCopyQrLink = async (order) => {
        const pickupLink = getPickupQrLink(order);
        if (!pickupLink) {
            setMessage(`Order #${order.orderId} does not have QR data yet.`);
            return;
        }

        try {
            await navigator.clipboard.writeText(pickupLink);
            setMessage(`Secure pickup QR link copied for order #${order.orderId}.`);
        } catch (err) {
            setMessage(`Copy failed. QR link: ${pickupLink}`);
        }
    };

    if (loading) {
        return <div className="container mt-5">Loading seller orders...</div>;
    }

    return (
        <div className="container mt-5 mb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between gap-3 align-items-md-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Seller Orders</h2>
                    <p className="text-muted mb-0">Print pickup QR labels for paid buyer orders.</p>
                    {lastUpdated && (
                        <div className="text-muted small mt-1">
                            Last refreshed: {lastUpdated.toLocaleTimeString()}
                        </div>
                    )}
                </div>

                <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary" onClick={loadOrders}>
                        Refresh
                    </button>
                    <Link to="/user-dashboard" className="btn btn-outline-secondary">
                        Back to Dashboard
                    </Link>
                </div>
            </div>

            {message && <div className="alert alert-info">{message}</div>}

            {orders.length === 0 ? (
                <div className="border rounded bg-light p-5 text-center">
                    <h5>No seller orders yet</h5>
                    <p className="text-muted mb-0">Paid checkout orders from buyers will appear here.</p>
                </div>
            ) : (
                <div className="d-flex flex-column gap-3">
                    {orders.map(order => {
                        const qrImageSrc = getQrImageSrc(order.qrCodeImagePath);
                        const isCompleted = order.status === 'COMPLETED';
                        const statusInfo = getStatusPresentation(order.status);

                        return (
                            <div key={order.orderId} className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                                        <div>
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <h5 className="fw-bold mb-0">Order #{order.orderId}</h5>
                                                <span className={`badge ${statusInfo.badgeClass}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="text-muted small">
                                                {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'Date unavailable'}
                                            </div>
                                            <div className="mt-2">Buyer: <strong>{order.buyerName || 'Buyer'}</strong></div>
                                            <div>Total: <strong>{formatMoney(order.totalAmount)}</strong></div>
                                            <div>Pickup Code: <strong>{order.pickupCode || 'N/A'}</strong></div>
                                            <div className={`alert ${isCompleted ? 'alert-success' : 'alert-info'} py-2 px-3 mt-3 mb-0`}>
                                                <strong>{statusInfo.title}.</strong> {statusInfo.description}
                                            </div>
                                        </div>

                                        <div className="text-lg-end">
                                            {qrImageSrc ? (
                                                <img
                                                    src={qrImageSrc}
                                                    alt={`Pickup QR for order ${order.orderId}`}
                                                    width="120"
                                                    height="120"
                                                    className="border rounded bg-white p-1"
                                                />
                                            ) : (
                                                <div className="text-muted">QR pending</div>
                                            )}
                                        </div>
                                    </div>

                                    {order.items?.length > 0 && (
                                        <div className="table-responsive mt-3">
                                            <table className="table table-sm align-middle mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>Product</th>
                                                        <th className="text-center">Qty</th>
                                                        <th className="text-end">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order.items.map((item, index) => (
                                                        <tr key={`${order.orderId}-${item.productId}-${index}`}>
                                                            <td>{item.productTitle}</td>
                                                            <td className="text-center">{item.quantity}</td>
                                                            <td className="text-end">{formatMoney(item.subtotal)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    <div className="d-flex flex-wrap gap-2 mt-3">
                                        <button
                                            className="btn btn-warning btn-sm fw-bold"
                                            onClick={() => handlePrintLabel(order)}
                                            disabled={!qrImageSrc}
                                        >
                                            Print Parcel QR
                                        </button>

                                        <button
                                            className="btn btn-outline-primary btn-sm fw-bold"
                                            onClick={() => handleCopyQrLink(order)}
                                            disabled={!order.qrCodeData}
                                        >
                                            Copy QR Link
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SellerOrdersPage;
