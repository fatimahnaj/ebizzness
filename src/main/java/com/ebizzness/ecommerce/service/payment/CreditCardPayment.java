package com.ebizzness.ecommerce.service.payment;

import com.ebizzness.ecommerce.entity.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component("CARD")
public class CreditCardPayment implements PaymentStrategy {
    @Override
    public void processPayment(Order order) {
        // Simulate card validation
        log.info("Mock credit card payment processed for order {}", order.getOrderId());
    }
}