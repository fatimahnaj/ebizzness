// src/components/CartPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../services/cartService';

const API_ORIGIN = 'http://localhost:8080';

const formatMoney = (value) => `RM ${Number(value || 0).toFixed(2)}`;

const getImageSrc = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${API_ORIGIN}${path}`;
};

const CartPage = () => {
    const [cart, setCart] = useState({ items: [], totalAmount: 0 });
    const [loading, setLoading] = useState(true);
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
            setError(err.response?.data?.message || 'Failed to load cart.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (productId, quantity) => {
        if (quantity < 1) return;
        try {
            const res = await updateCartItem(productId, quantity);
            setCart(res.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed.');
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            const res = await removeFromCart(productId);
            setCart(res.data);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Remove failed.');
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Clear entire cart?')) {
            try {
                await clearCart();
                setCart({ items: [], totalAmount: 0, status: 'EMPTY' });
                setError('');
            } catch (err) {
                setError(err.response?.data?.message || 'Clear cart failed.');
            }
        }
    };

    const handleCheckout = () => {
        if (cart.items.length === 0) {
            alert('Your cart is empty');
            return;
        }
        navigate('/checkout');
    };

    if (loading) return <div className="container mt-5">Loading cart...</div>;

    return (
        <div className="container mt-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="fw-bold mb-0">Your Shopping Cart</h2>
                <Link to="/user-dashboard" className="btn btn-outline-secondary btn-sm">
                    Continue Shopping
                </Link>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {cart.items.length === 0 ? (
                <div className="border rounded bg-light p-5 text-center">
                    <h5>Cart is empty</h5>
                    <p className="text-muted mb-0">Add a marketplace item before checkout.</p>
                </div>
            ) : (
                <>
                    <table className="table table-bordered align-middle">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th className="text-end">Price</th>
                                <th className="text-center">Quantity</th>
                                <th className="text-end">Subtotal</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.items.map(item => {
                                const imageSrc = getImageSrc(item.productImageUrl);

                                return (
                                    <tr key={item.productId}>
                                        <td>
                                            <div className="d-flex align-items-center gap-3">
                                                {imageSrc && (
                                                    <img
                                                        src={imageSrc}
                                                        alt={item.productTitle}
                                                        width="56"
                                                        height="56"
                                                        className="rounded border"
                                                        style={{ objectFit: 'cover' }}
                                                    />
                                                )}
                                                <span className="fw-semibold">{item.productTitle}</span>
                                            </div>
                                        </td>
                                        <td className="text-end">{formatMoney(item.priceAtAdd)}</td>
                                        <td>
                                            <div className="d-flex justify-content-center align-items-center gap-2">
                                                <button
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => handleUpdateQuantity(item.productId, Number(e.target.value))}
                                                    className="form-control form-control-sm text-center"
                                                    style={{ width: '70px' }}
                                                />
                                                <button
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td className="text-end">{formatMoney(item.subtotal)}</td>
                                        <td className="text-center">
                                            <button className="btn btn-danger btn-sm" onClick={() => handleRemoveItem(item.productId)}>
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="d-flex justify-content-between">
                        <button className="btn btn-secondary" onClick={handleClearCart}>Clear Cart</button>
                        <div>
                            <strong>Total: {formatMoney(cart.totalAmount)}</strong>
                            <button className="btn btn-primary ms-3" onClick={handleCheckout}>Proceed to Checkout</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;
