package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.entity.Buyer;
import com.ebizzness.ecommerce.entity.Product;
import com.ebizzness.ecommerce.entity.Seller;
import com.ebizzness.ecommerce.entity.User;
import com.ebizzness.ecommerce.model.Report;
import com.ebizzness.ecommerce.repository.ProductRepo;
import com.ebizzness.ecommerce.repository.ReportRepository;
import com.ebizzness.ecommerce.repository.UserRepo;
import com.ebizzness.ecommerce.entity.enums.ProductStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AdminModerationService {

    private final UserRepo userRepository;
    private final ProductRepo productRepository;
    private final ReportRepository reportRepository;
    private final SessionService sessionService;

    public AdminModerationService(
            UserRepo userRepository,
            ProductRepo productRepository,
            ReportRepository reportRepository,
            SessionService sessionService
    ) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.reportRepository = reportRepository;
        this.sessionService = sessionService;
    }

    public void applyReportAction(String targetType, Long targetId, String adminAction) {
        applyReportAction(targetType, targetId, adminAction, null);
    }

    public void applyReportAction(String targetType, Long targetId, String adminAction, Long adminId) {
        if (adminAction == null || adminAction.trim().isEmpty()) {
            throw new RuntimeException("Admin action is required.");
        }

        switch (adminAction) {
            case "USER_BANNED":
                if (!"USER".equalsIgnoreCase(targetType)) {
                    throw new RuntimeException("USER_BANNED can only be used for USER reports.");
                }
                banUser(targetId, adminId);
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
        banUser(userID, null);
    }

    public void banUser(Long userID, Long adminId) {
        User user = userRepository.findById(userID)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userID));

        if (user instanceof Buyer buyer) {
            buyer.setBanned(true);
            userRepository.save(buyer);
            Set<Long> removedListingIds = removeListingsForUser(userID);
            resolveOpenReportsRelatedToBannedUser(userID, removedListingIds, adminId);
            sessionService.invalidateSessionsForUser(userID);
            return;
        }

        if (user instanceof Seller seller) {
            seller.setBanned(true);
            userRepository.save(seller);
            Set<Long> removedListingIds = removeListingsForUser(userID);
            resolveOpenReportsRelatedToBannedUser(userID, removedListingIds, adminId);
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

    private Set<Long> removeListingsForUser(Long userID) {
        List<Product> listings = productRepository.findBySellerUserID(userID);
        Set<Long> listingIds = listings.stream()
                .map(Product::getProductId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (listingIds.isEmpty()) {
            listingIds.addAll(productRepository.findProductIdsBySellerId(userID));
        }

        if (!listings.isEmpty()) {
            listings.forEach(product -> product.setStatus(ProductStatus.REMOVED));
            productRepository.saveAll(listings);
        }

        productRepository.markListingsRemovedBySellerId(userID);

        return listingIds;
    }

    private void resolveOpenReportsRelatedToBannedUser(
            Long userID,
            Set<Long> removedListingIds,
            Long adminId
    ) {
        List<Report> relatedReports = reportRepository.findByStatus("OPEN")
                .stream()
                .filter(report -> isRelatedToBannedUser(report, userID, removedListingIds))
                .toList();

        if (relatedReports.isEmpty()) {
            return;
        }

        LocalDateTime resolvedAt = LocalDateTime.now();

        relatedReports.forEach(report -> {
            report.setStatus("RESOLVED");
            report.setAdminAction(getBanCleanupAction(report, removedListingIds));
            report.setResolvedByAdminId(adminId);
            report.setResolvedAt(resolvedAt);
        });

        reportRepository.saveAll(relatedReports);
    }

    private boolean isRelatedToBannedUser(
            Report report,
            Long userID,
            Set<Long> removedListingIds
    ) {
        boolean submittedByBannedUser = userID.equals(report.getReporterId());
        boolean targetsBannedUser =
                "USER".equalsIgnoreCase(report.getTargetType()) &&
                userID.equals(report.getTargetId());
        boolean targetsBannedUsersListing =
                ("LISTING".equalsIgnoreCase(report.getTargetType()) ||
                "PRODUCT".equalsIgnoreCase(report.getTargetType())) &&
                removedListingIds.contains(report.getTargetId());

        return submittedByBannedUser || targetsBannedUser || targetsBannedUsersListing;
    }

    private String getBanCleanupAction(Report report, Set<Long> removedListingIds) {
        boolean listingReport =
                ("LISTING".equalsIgnoreCase(report.getTargetType()) ||
                "PRODUCT".equalsIgnoreCase(report.getTargetType())) &&
                removedListingIds.contains(report.getTargetId());

        return listingReport ? "LISTING_REMOVED" : "USER_BANNED";
    }
}
