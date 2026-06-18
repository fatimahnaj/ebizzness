// src/services/orderService.js
import api from './api';

export const checkout = (paymentMethod) => api.post('/orders/checkout', { paymentMethod });
export const getOrders = () => api.get('/orders');
export const getSellerOrders = () => api.get('/orders/seller');
export const getOrderDetails = (orderId) => api.get(`/orders/${orderId}`);
