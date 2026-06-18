package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.entity.Buyer;
import com.ebizzness.ecommerce.entity.Product;
import com.ebizzness.ecommerce.entity.Seller;
import com.ebizzness.ecommerce.entity.User;
import com.ebizzness.ecommerce.repository.ProductRepo;
import com.ebizzness.ecommerce.repository.UserRepo;
import com.ebizzness.ecommerce.entity.enums.ProductStatus;
import org.springframework.stereotype.Service;

@Service
public class AdminModerationService {

    private final UserRepo userRepository;
    private final ProductRepo productRepository;
    private final SessionService sessionService;

    public AdminModerationService(
            UserRepo userRepository,
            ProductRepo productRepository,
            SessionService sessionService
    ) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.sessionService = sessionService;
    }

    public void applyReportAction(String targetType, Long targetId, String adminAction) {
        if (adminAction == null || adminAction.trim().isEmpty()) {
            throw new RuntimeException("Admin action is required.");
        }

        switch (adminAction) {
            case "USER_BANNED":
                if (!"USER".equalsIgnoreCase(targetType)) {
                    throw new RuntimeException("USER_BANNED can only be used for USER reports.");
                }
                banUser(targetId);
                break;

            case "LISTING_REMOVED":
                if (!"LISTING".equalsIgnoreCase(targetType)) {
                    throw new RuntimeException("LISTING_REMOVED can only be used for LISTING reports.");
                }
                removeListing(targetId);
                break;

            case "WARNING_SENT":
            case "INVESTIGATION_REQUIRED":
            case "MESSAGE_DELETED":
                // For now, only save the action in the report.
                // You can add notification/message delete logic later.
                break;

            default:
                throw new RuntimeException("Unknown admin action: " + adminAction);
        }
    }

    public void banUser(Long userID) {
        User user = userRepository.findById(userID)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userID));

        if (user instanceof Buyer buyer) {
            buyer.setBanned(true);
            userRepository.save(buyer);
            sessionService.invalidateSessionsForUser(userID);
            return;
        }

        if (user instanceof Seller seller) {
            seller.setBanned(true);
            userRepository.save(seller);
            sessionService.invalidateSessionsForUser(userID);
            return;
        }

        throw new RuntimeException("Admin users cannot be banned.");
    }

    public void unbanUser(Long userID) {
        User user = userRepository.findById(userID)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userID));

        if (user instanceof Buyer buyer) {
            buyer.setBanned(false);
            userRepository.save(buyer);
            return;
        }

        if (user instanceof Seller seller) {
            seller.setBanned(false);
            userRepository.save(seller);
            return;
        }

        throw new RuntimeException("Admin users cannot be unbanned.");
    }

    public void removeListing(Long productID) {
        Product product = productRepository.findById(productID)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + productID));

        product.setStatus(ProductStatus.REMOVED);
        productRepository.save(product);
    }
}
