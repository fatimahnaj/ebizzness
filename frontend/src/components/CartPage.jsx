// src/components/CartPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../services/cartService';

const CartPage = () => {
    const [cart, setCart] = useState({ items: [], totalAmount: 0 });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            const res = await getCart();
            setCart(res.data);
        } catch (err) {
            console.error('Failed to load cart', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (productId, quantity) => {
        if (quantity < 1) return;
        try {
            await updateCartItem(productId, quantity);
            loadCart();
        } catch (err) {
            console.error('Update failed', err);
        }
    };

    const handleRemoveItem = async (productId) => {
        try {
            await removeFromCart(productId);
            loadCart();
        } catch (err) {
            console.error('Remove failed', err);
        }
    };

    const handleClearCart = async () => {
        if (window.confirm('Clear entire cart?')) {
            await clearCart();
            loadCart();
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
            <h2>Your Shopping Cart</h2>
            {cart.items.length === 0 ? (
                <p>Cart is empty. <a href="/dashboard">Continue shopping</a></p>
            ) : (
                <>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Subtotal</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.items.map(item => (
                                <tr key={item.productId}>
                                    <td>{item.productTitle}</td>
                                    <td>RM {item.priceAtAdd}</td>
                                    <td>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value))}
                                            style={{ width: '70px' }}
                                        />
                                    </td>
                                    <td>RM {item.subtotal}</td>
                                    <td>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleRemoveItem(item.productId)}>
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="d-flex justify-content-between">
                        <button className="btn btn-secondary" onClick={handleClearCart}>Clear Cart</button>
                        <div>
                            <strong>Total: RM {cart.totalAmount}</strong>
                            <button className="btn btn-primary ms-3" onClick={handleCheckout}>Proceed to Checkout</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;