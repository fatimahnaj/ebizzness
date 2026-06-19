package com.ebizzness.ecommerce.service.payment;

import com.ebizzness.ecommerce.entity.Order;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component("EWALLET")
public class EWalletPayment implements PaymentStrategy {
    @Override
    public void processPayment(Order order) {
        log.info("Mock e-wallet payment processed for order {}", order.getOrderId());
    }
}