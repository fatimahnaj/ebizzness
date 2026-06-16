// src/components/OrderHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { getOrders } from '../services/orderService';

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const res = await getOrders();
            setOrders(res.data);
        } catch (err) {
            console.error('Failed to load orders', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container mt-5">Loading orders...</div>;

    return (
        <div className="container mt-5">
            <h2>My Orders</h2>
            {orders.length === 0 ? (
                <p>No orders yet.</p>
            ) : (
                <div className="list-group">
                    {orders.map(order => (
                        <div key={order.orderId} className="list-group-item mb-3">
                            <div className="d-flex justify-content-between">
                                <strong>Order #{order.orderId}</strong>
                                <span className={`badge bg-${order.status === 'COMPLETED' ? 'success' : 'warning'}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div>Date: {new Date(order.orderDate).toLocaleString()}</div>
                            <div>Total: RM {order.totalAmount}</div>
                            <div>Pickup Code: <strong>{order.pickupCode || 'N/A'}</strong></div>
                            {order.qrCodeImageUrl && (
                                <div className="mt-2">
                                    <img src={order.qrCodeImageUrl} alt="Pickup QR" width="100" />
                                </div>
                            )}
                            {order.status === 'PAID' && order.pickupCode && (
                                <div className="mt-2">
                                    <a href="/pickup" className="btn btn-sm btn-primary">Confirm Pickup</a>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;