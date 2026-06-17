package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.entity.Order;
import com.ebizzness.ecommerce.entity.enums.OrderStatus;
import com.ebizzness.ecommerce.repository.OrderRepo;
import com.ebizzness.ecommerce.util.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class PickupService {

    private final OrderRepo orderRepo;
    private final EncryptionUtil encryptionUtil;   // <-- INJECTED HERE

    @Transactional
    public void confirmPickup(String encryptedData) {
        String decrypted;
        try {
            // Now using the injected instance (not static)
            decrypted = encryptionUtil.decrypt(encryptedData);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid QR code data");
        }

        String[] parts = decrypted.split("\\|");
        if (parts.length != 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Malformed QR data");
        }

        long orderId = Long.parseLong(parts[0]);
        long productId = Long.parseLong(parts[1]);
        long buyerId = Long.parseLong(parts[2]);
        long expiryEpoch = Long.parseLong(parts[3]);

        // Check expiry
        if (Instant.ofEpochSecond(expiryEpoch).isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "QR code expired");
        }

        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        // Verify buyer
        if (!order.getBuyer().getUserID().equals(buyerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "QR code does not belong to you");
        }

        // Verify product belongs to order
        boolean productMatches = order.getItems().stream()
                .anyMatch(item -> item.getProduct().getProductId().equals(productId));
        if (!productMatches) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product mismatch");
        }

        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order already completed");
        }

        order.setStatus(OrderStatus.COMPLETED);
        orderRepo.save(order);
    }
}