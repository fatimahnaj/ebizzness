//Facade
package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.entity.Order;
import com.ebizzness.ecommerce.entity.Payment;
import com.ebizzness.ecommerce.entity.enums.PaymentMethod;
import com.ebizzness.ecommerce.repository.PaymentRepo;
import com.ebizzness.ecommerce.service.payment.PaymentStrategy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepo paymentRepo;
    private final Map<String, PaymentStrategy> paymentStrategies;

    @Transactional
    public Payment processMockPayment(Order order, PaymentMethod method) {
        // Get strategy
        PaymentStrategy strategy = paymentStrategies.get(method.name());
        if (strategy == null) {
            throw new RuntimeException("No payment strategy for " + method);
        }
        strategy.processPayment(order);

        // Create payment record
        Payment payment = Payment.builder()
                .order(order)
                .amount(order.getTotalAmount())
                .method(method)
                .status("SUCCESS")
                .transactionId("SIM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();
        return paymentRepo.save(payment);
    }
}