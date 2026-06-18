package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.entity.Buyer;
import com.ebizzness.ecommerce.entity.Seller;
import com.ebizzness.ecommerce.model.Report;
import com.ebizzness.ecommerce.repository.ProductRepo;
import com.ebizzness.ecommerce.repository.ReportRepository;
import com.ebizzness.ecommerce.repository.UserRepo;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
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
        when(productRepository.findProductIdsBySellerId(7L)).thenReturn(List.of(11L, 12L));
        when(reportRepository.findByStatus("OPEN")).thenReturn(openReports);

        adminModerationService.banUser(7L, 1L);

        assertTrue(seller.isBanned());
        assertTrue(relatedReports.stream()
                .allMatch(report -> "RESOLVED".equals(report.getStatus())));
        assertEquals("USER_BANNED", userTargetReport.getAdminAction());
        assertEquals("LISTING_REMOVED", listingTargetReport.getAdminAction());
        assertEquals("USER_BANNED", submittedByBannedUser.getAdminAction());
        assertEquals(1L, userTargetReport.getResolvedByAdminId());
        assertEquals("OPEN", unrelatedReport.getStatus());

        verify(userRepository).save(seller);
        verify(productRepository).markListingsRemovedBySellerId(7L);
        verify(reportRepository).saveAll(relatedReports);
        verify(sessionService).invalidateSessionsForUser(7L);
    }

    @Test
    void banBuyerResolvesUserReportsWithoutHydratingSellerListings() {
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

        Buyer buyer = new Buyer();
        buyer.setUserID(7L);
        buyer.setBanned(false);

        Report userTargetReport = new Report();
        userTargetReport.setReporterId(3L);
        userTargetReport.setTargetType("USER");
        userTargetReport.setTargetId(7L);
        userTargetReport.setStatus("OPEN");

        when(userRepository.findById(7L)).thenReturn(Optional.of(buyer));
        when(productRepository.findProductIdsBySellerId(7L)).thenReturn(List.of());
        when(reportRepository.findByStatus("OPEN")).thenReturn(List.of(userTargetReport));

        adminModerationService.banUser(7L, 1L);

        assertTrue(buyer.isBanned());
        assertEquals("RESOLVED", userTargetReport.getStatus());
        assertEquals("USER_BANNED", userTargetReport.getAdminAction());

        verify(userRepository).save(buyer);
        verify(productRepository, never()).findBySellerUserID(7L);
        verify(productRepository).markListingsRemovedBySellerId(7L);
        verify(reportRepository).saveAll(List.of(userTargetReport));
        verify(sessionService).invalidateSessionsForUser(7L);
    }

    @Test
    void banUserThrowsHelpfulMessageWhenUserIsAlreadyBanned() {
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

        Seller bannedSeller = new Seller();
        bannedSeller.setUserID(7L);
        bannedSeller.setBanned(true);

        when(userRepository.findById(7L)).thenReturn(Optional.of(bannedSeller));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> adminModerationService.banUser(7L, 1L)
        );

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("User is already banned.", exception.getReason());

        verify(userRepository, never()).save(bannedSeller);
        verify(sessionService, never()).invalidateSessionsForUser(7L);
    }
}
