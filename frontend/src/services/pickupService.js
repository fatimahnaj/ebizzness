// src/services/pickupService.js
import api from './api';

export const confirmPickup = (orderId, pickupCode) => 
    api.post('/pickup/confirm', { orderId, pickupCode });