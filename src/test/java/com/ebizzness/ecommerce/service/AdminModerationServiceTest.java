package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.entity.Product;
import com.ebizzness.ecommerce.entity.Seller;
import com.ebizzness.ecommerce.entity.enums.ProductStatus;
import com.ebizzness.ecommerce.model.Report;
import com.ebizzness.ecommerce.repository.ProductRepo;
import com.ebizzness.ecommerce.repository.ReportRepository;
import com.ebizzness.ecommerce.repository.UserRepo;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminModerationServiceTest {

    @Test
    void banUserInvalidatesActiveSessionsAndRemovesListings() {
        UserRepo userRepository = mock(UserRepo.class);
        ProductRepo productRepository = mock(ProductRepo.class);
        ReportRepository reportRepository = mock(ReportRepository.class);
        SessionService sessionService = mock(SessionService.class);
        AdminModerationService adminModerationService = new AdminModerationService(
                userRepository,
                productRepository,
                reportRepository,
                sessionService
        );

        Seller seller = new Seller();
        Product activeListing = new Product();
        activeListing.setProductId(11L);
        activeListing.setStatus(ProductStatus.AVAILABLE);

        Product soldListing = new Product();
        soldListing.setProductId(12L);
        soldListing.setStatus(ProductStatus.SOLD);

        List<Product> sellerListings = List.of(activeListing, soldListing);
        Report userTargetReport = new Report();
        userTargetReport.setReporterId(3L);
        userTargetReport.setTargetType("USER");
        userTargetReport.setTargetId(7L);
        userTargetReport.setStatus("OPEN");

        Report listingTargetReport = new Report();
        listingTargetReport.setReporterId(4L);
        listingTargetReport.setTargetType("LISTING");
        listingTargetReport.setTargetId(11L);
        listingTargetReport.setStatus("OPEN");

        Report submittedByBannedUser = new Report();
        submittedByBannedUser.setReporterId(7L);
        submittedByBannedUser.setTargetType("USER");
        submittedByBannedUser.setTargetId(8L);
        submittedByBannedUser.setStatus("OPEN");

        Report unrelatedReport = new Report();
        unrelatedReport.setReporterId(9L);
        unrelatedReport.setTargetType("USER");
        unrelatedReport.setTargetId(10L);
        unrelatedReport.setStatus("OPEN");

        List<Report> openReports = List.of(
                userTargetReport,
                listingTargetReport,
                submittedByBannedUser,
                unrelatedReport
        );
        List<Report> relatedReports = List.of(
                userTargetReport,
                listingTargetReport,
                submittedByBannedUser
        );

        when(userRepository.findById(7L)).thenReturn(Optional.of(seller));
        when(productRepository.findBySellerUserID(7L)).thenReturn(sellerListings);
        when(reportRepository.findByStatus("OPEN")).thenReturn(openReports);

        adminModerationService.banUser(7L, 1L);

        assertTrue(seller.isBanned());
        assertTrue(sellerListings.stream()
                .allMatch(product -> ProductStatus.REMOVED.equals(product.getStatus())));
        assertTrue(relatedReports.stream()
                .allMatch(report -> "RESOLVED".equals(report.getStatus())));
        assertEquals("USER_BANNED", userTargetReport.getAdminAction());
        assertEquals("LISTING_REMOVED", listingTargetReport.getAdminAction());
        assertEquals("USER_BANNED", submittedByBannedUser.getAdminAction());
        assertEquals(1L, userTargetReport.getResolvedByAdminId());
        assertEquals("OPEN", unrelatedReport.getStatus());

        verify(userRepository).save(seller);
        verify(productRepository).saveAll(sellerListings);
        verify(reportRepository).saveAll(relatedReports);
        verify(sessionService).invalidateSessionsForUser(7L);
    }
}
