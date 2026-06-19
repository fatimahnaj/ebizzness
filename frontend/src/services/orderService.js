// src/services/orderService.js
import api from './api';

const freshRequestConfig = () => ({
    params: { _ts: Date.now() },
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
});

export const checkout = (paymentMethod) => api.post('/orders/checkout', { paymentMethod });
export const getOrders = () => api.get('/orders', freshRequestConfig());
export const getSellerOrders = () => api.get('/orders/seller', freshRequestConfig());
export const getOrderDetails = (orderId) => api.get(`/orders/${orderId}`, freshRequestConfig());
