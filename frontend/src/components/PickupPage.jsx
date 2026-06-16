// src/components/PickupPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmPickup } from '../services/pickupService';

const PickupPage = () => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleConfirm = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            await confirmPickup(null, code); // adjust if your backend expects { code }
            setMessage('Pickup confirmed successfully!');
            setTimeout(() => navigate('/orders'), 2000);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Invalid pickup code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: '500px' }}>
            <h2>Confirm Pickup</h2>
            <form onSubmit={handleConfirm}>
                <div className="mb-3">
                    <label className="form-label">Pickup Code (from your order)</label>
                    <input
                        type="text"
                        className="form-control"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Verifying...' : 'Confirm Pickup'}
                </button>
            </form>
            {message && <div className="alert alert-info mt-3">{message}</div>}
        </div>
    );
};

export default PickupPage;