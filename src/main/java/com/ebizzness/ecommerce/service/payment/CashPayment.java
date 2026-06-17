package com.ebizzness.ecommerce.service.payment;

import com.ebizzness.ecommerce.entity.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component("CASH")
public class CashPayment implements PaymentStrategy {
    @Override
    public void processPayment(Order order) {
        log.info("Cash on pickup selected for order {}", order.getOrderId());
        // No real money movement
    }
}