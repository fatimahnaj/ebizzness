package com.ebizzness.ecommerce.service.payment;

import com.ebizzness.ecommerce.entity.Order;

public interface PaymentStrategy {
    void processPayment(Order order);
}