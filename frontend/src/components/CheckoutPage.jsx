// src/components/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart } from '../services/cartService';
import { checkout } from '../services/orderService';

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
        <div className="container mt-5">
            <h2>Checkout</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="row">
                <div className="col-md-7">
                    <h4>Order Summary</h4>
                    {cart.items.map(item => (
                        <div key={item.productId} className="border-bottom py-2">
                            {item.productTitle} x {item.quantity} = RM {item.subtotal}
                        </div>
                    ))}
                    <hr />
                    <h5>Total: RM {cart.totalAmount}</h5>
                </div>
                <div className="col-md-5">
                    <div className="card p-3">
                        <h4>Payment Method</h4>
                        <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                            <option value="CASH">Cash on Pickup</option>
                            <option value="CARD">Credit Card (Mock)</option>
                            <option value="EWALLET">E-Wallet (Mock)</option>
                        </select>
                        <hr />
                        <button className="btn btn-success w-100" onClick={handlePlaceOrder} disabled={processing}>
                            {processing ? 'Processing...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
