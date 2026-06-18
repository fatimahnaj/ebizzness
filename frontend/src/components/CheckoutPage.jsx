// src/components/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart } from '../services/cartService';
import { checkout } from '../services/orderService';

const formatMoney = (value) => `RM ${Number(value || 0).toFixed(2)}`;

const CheckoutPage = () => {
    const [cart, setCart] = useState({ items: [], totalAmount: 0 });
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const res = await getCart();
            setCart(res.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load checkout.');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (cart.items.length === 0) {
            alert('Cart is empty');
            return;
        }
        setProcessing(true);
        setError('');
        try {
            await checkout(paymentMethod);
            navigate(`/orders`);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="container mt-5">Loading checkout...</div>;

    return (
        <div className="container mt-5 mb-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
                <div>
                    <h2 className="fw-bold mb-1">Checkout</h2>
                    <p className="text-muted mb-0">Review items, choose mock payment, and place order.</p>
                </div>

                <Link to="/cart" className="btn btn-outline-secondary">
                    Back to Cart
                </Link>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {cart.items.length === 0 ? (
                <div className="border rounded bg-light p-5 text-center">
                    <h5>No items to checkout</h5>
                    <p className="text-muted">Add an item to your cart first.</p>
                    <Link to="/dashboard" className="btn btn-primary">Browse Marketplace</Link>
                </div>
            ) : (
                <div className="row g-4">
                    <div className="col-lg-7">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                <h4 className="fw-bold mb-3">Order Summary</h4>

                                <div className="table-responsive">
                                    <table className="table align-middle">
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th className="text-center">Qty</th>
                                                <th className="text-end">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cart.items.map(item => (
                                                <tr key={item.productId}>
                                                    <td className="fw-semibold">{item.productTitle}</td>
                                                    <td className="text-center">{item.quantity}</td>
                                                    <td className="text-end">{formatMoney(item.subtotal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="d-flex justify-content-between align-items-center border-top pt-3">
                                    <span className="fw-bold">Total</span>
                                    <span className="fs-4 fw-bold text-success">{formatMoney(cart.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-5">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                <h4 className="fw-bold mb-3">Mock Payment</h4>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Payment Method</label>
                                    <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                        <option value="CASH">Cash on Pickup</option>
                                        <option value="CARD">Credit Card (Mock)</option>
                                        <option value="EWALLET">E-Wallet (Mock)</option>
                                    </select>
                                </div>

                                <div className="alert alert-info">
                                    Placing the order will create payment, order items, and pickup QR automatically.
                                </div>

                                <button className="btn btn-success w-100 py-2 fw-bold" onClick={handlePlaceOrder} disabled={processing}>
                                    {processing ? 'Processing...' : 'Place Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CheckoutPage;
