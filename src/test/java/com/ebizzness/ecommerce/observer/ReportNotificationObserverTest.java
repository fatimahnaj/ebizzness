package com.ebizzness.ecommerce.observer;

import com.ebizzness.ecommerce.entity.Admin;
import com.ebizzness.ecommerce.event.ReportReviewedEvent;
import com.ebizzness.ecommerce.event.ReportSubmittedEvent;
import com.ebizzness.ecommerce.model.Report;
import com.ebizzness.ecommerce.repository.ProductRepo;
import com.ebizzness.ecommerce.repository.UserRepo;
import com.ebizzness.ecommerce.service.NotificationService;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ReportNotificationObserverTest {

    @Test
    void onReportSubmittedNotifiesAdmin() {
        NotificationService notificationService = mock(NotificationService.class);
        ProductRepo productRepo = mock(ProductRepo.class);
        UserRepo userRepo = mock(UserRepo.class);
        ReportNotificationObserver observer =
                new ReportNotificationObserver(notificationService, productRepo, userRepo);

        Admin firstAdmin = new Admin();
        firstAdmin.setUserID(5L);

        Admin secondAdmin = new Admin();
        secondAdmin.setUserID(6L);

        Report report = new Report();
        report.setReporterId(3L);

        when(userRepo.findByRoleIgnoreCase("ADMIN")).thenReturn(List.of(firstAdmin, secondAdmin));

        observer.onReportSubmitted(new ReportSubmittedEvent(report));

        verify(notificationService).createNotification(
                5L,
                "New report submitted by user 3"
        );
        verify(notificationService).createNotification(
                6L,
                "New report submitted by user 3"
        );
    }

    @Test
    void onWarningSentForUserReportNotifiesReportedUser() {
        NotificationService notificationService = mock(NotificationService.class);
        ProductRepo productRepo = mock(ProductRepo.class);
        UserRepo userRepo = mock(UserRepo.class);
        ReportNotificationObserver observer =
                new ReportNotificationObserver(notificationService, productRepo, userRepo);

        Report report = new Report();
        report.setReporterId(3L);
        report.setTargetType("USER");
        report.setTargetId(7L);
        report.setStatus("RESOLVED");
        report.setAdminAction("WARNING_SENT");

        observer.onReportReviewed(new ReportReviewedEvent(report));

        verify(notificationService).createNotification(
                3L,
                "Your report has been resolved. Action taken: WARNING_SENT"
        );
        verify(notificationService).createNotification(
                7L,
                "You received a warning from admin after a report review."
        );
    }

    @Test
    void onWarningSentForListingReportNotifiesSeller() {
        NotificationService notificationService = mock(NotificationService.class);
        ProductRepo productRepo = mock(ProductRepo.class);
        UserRepo userRepo = mock(UserRepo.class);
        ReportNotificationObserver observer =
                new ReportNotificationObserver(notificationService, productRepo, userRepo);

        Report report = new Report();
        report.setReporterId(3L);
        report.setTargetType("LISTING");
        report.setTargetId(11L);
        report.setStatus("RESOLVED");
        report.setAdminAction("WARNING_SENT");

        when(productRepo.findSellerIdByProductId(11L)).thenReturn(Optional.of(7L));

        observer.onReportReviewed(new ReportReviewedEvent(report));

        verify(notificationService).createNotification(
                7L,
                "You received a warning from admin after a report review."
        );
    }
}
