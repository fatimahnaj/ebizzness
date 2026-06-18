package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.dto.request.PickupConfirmRequest;
import com.ebizzness.ecommerce.entity.Order;
import com.ebizzness.ecommerce.entity.Pickup;
import com.ebizzness.ecommerce.entity.enums.OrderStatus;
import com.ebizzness.ecommerce.repository.OrderRepo;
import com.ebizzness.ecommerce.repository.PickupRepo;
import com.ebizzness.ecommerce.util.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class PickupService {

    private final PickupRepo pickupRepo;
    private final OrderRepo orderRepo;
    private final SessionService sessionService;
    private final EncryptionUtil encryptionUtil;

    @Transactional
    public void confirmPickup(PickupConfirmRequest request, String authorizationHeader) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pickup confirmation details are required");
        }

        Long buyerId = sessionService.getSession(authorizationHeader).getUserId();
        Pickup pickup = hasText(request.getEncryptedData())
                ? findPickupFromEncryptedData(request.getEncryptedData())
                : findPickupFromManualCode(request.getOrderId(), request.getPickupCode());

        completePickup(pickup, buyerId);
    }

    private Pickup findPickupFromManualCode(Long orderId, String pickupCode) {
        if (!hasText(pickupCode)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pickup code is required");
        }

        if (orderId != null) {
            Pickup pickup = pickupRepo.findByOrder_OrderId(orderId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pickup record not found"));

            if (!pickupCode.equalsIgnoreCase(pickup.getManualCode())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid pickup code");
            }

            return pickup;
        }

        return pickupRepo.findByManualCode(pickupCode.trim().toUpperCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid pickup code"));
    }

    private Pickup findPickupFromEncryptedData(String encryptedData) {
        String normalized = extractEncryptedPayload(encryptedData);
        return pickupRepo.findByQrCodeData(normalized)
                .orElseGet(() -> findPickupFromDecryptedPayload(normalized));
    }

    private Pickup findPickupFromDecryptedPayload(String encryptedData) {
        String decrypted;
        try {
            decrypted = encryptionUtil.decrypt(encryptedData);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid QR code data");
        }

        String[] parts = decrypted.split("\\|");
        if (parts.length < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Malformed QR data");
        }

        try {
            Long orderId = Long.parseLong(parts[0]);
            String pickupCode = parts[1];
            return findPickupFromManualCode(orderId, pickupCode);
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Malformed QR data");
        }
    }

    private void completePickup(Pickup pickup, Long buyerId) {
        if (pickup.getExpiresAt() != null && pickup.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pickup code expired");
        }

        Order order = pickup.getOrder();

        if (!order.getBuyer().getUserID().equals(buyerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Pickup code does not belong to you");
        }

        if (order.getStatus() == OrderStatus.COMPLETED || pickup.isScanned()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order already completed");
        }

        if (order.getStatus() != OrderStatus.PAID) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order is not ready for pickup");
        }

        pickup.setScanned(true);
        pickup.setScannedAt(LocalDateTime.now());
        pickupRepo.save(pickup);

        order.setStatus(OrderStatus.COMPLETED);
        orderRepo.save(order);
    }

    private String extractEncryptedPayload(String encryptedData) {
        String value = encryptedData.trim();
        int dataIndex = value.indexOf("data=");

        if (dataIndex >= 0) {
            value = value.substring(dataIndex + 5);
            int ampIndex = value.indexOf('&');
            if (ampIndex >= 0) {
                value = value.substring(0, ampIndex);
            }
            value = URLDecoder.decode(value, StandardCharsets.UTF_8);
        }

        return value;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
