// src/components/PickupPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { confirmPickup } from '../services/pickupService';

const PickupPage = () => {
    const [orderId, setOrderId] = useState('');
    const [code, setCode] = useState('');
    const [encryptedData, setEncryptedData] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setOrderId(params.get('orderId') || '');
        setCode(params.get('code') || '');
        setEncryptedData(params.get('data') || '');
    }, [location.search]);

    const handleConfirm = async (e) => {
        e.preventDefault();

        if (!code.trim() && !encryptedData.trim()) {
            setMessage('Enter a pickup code or QR data.');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            await confirmPickup({
                orderId: orderId ? Number(orderId) : null,
                pickupCode: code.trim(),
                encryptedData: encryptedData.trim()
            });
            setMessage('Pickup confirmed successfully. Order marked as completed.');
            setTimeout(() => navigate('/orders'), 1500);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Invalid pickup confirmation details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '620px' }}>
            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    <h2 className="fw-bold mb-1">Confirm Pickup</h2>
                    <p className="text-muted">
                        Use the pickup code from your paid order, or paste encrypted QR data.
                    </p>

                    <form onSubmit={handleConfirm}>
                        <div className="mb-3">
                            <label className="form-label fw-bold">Order ID</label>
                            <input
                                type="number"
                                className="form-control"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="Optional if code is unique"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Pickup Code</label>
                            <input
                                type="text"
                                className="form-control text-uppercase"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="Example: A1B2C3"
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-bold">Encrypted QR Data</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                value={encryptedData}
                                onChange={(e) => setEncryptedData(e.target.value)}
                                placeholder="Optional QR data"
                            />
                        </div>

                        <div className="d-flex gap-2">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Verifying...' : 'Confirm Pickup'}
                            </button>

                            <Link to="/orders" className="btn btn-outline-secondary">
                                Back to Orders
                            </Link>
                        </div>
                    </form>

                    {message && <div className="alert alert-info mt-3 mb-0">{message}</div>}
                </div>
            </div>
        </div>
    );
};

export default PickupPage;
