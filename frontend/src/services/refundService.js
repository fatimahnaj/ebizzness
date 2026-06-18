import api from './api';

export const requestRefund = (orderId, reason) =>
    api.post('/refunds/request', { orderId, reason });
