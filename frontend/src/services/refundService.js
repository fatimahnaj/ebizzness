import api from './api';

export const getRefunds = () => api.get('/refunds');

export const requestRefund = (orderId, reason) =>
    api.post('/refunds/request', { orderId, reason });

export const resolveRefund = (refundId, action) =>
    api.put(`/refunds/${refundId}/resolve`, null, { params: { action } });
