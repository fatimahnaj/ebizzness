package com.ebizzness.ecommerce.observer;

import com.ebizzness.ecommerce.event.ReportReviewedEvent;
import com.ebizzness.ecommerce.event.ReportSubmittedEvent;
import com.ebizzness.ecommerce.entity.User;
import com.ebizzness.ecommerce.model.Report;
import com.ebizzness.ecommerce.repository.ProductRepo;
import com.ebizzness.ecommerce.repository.UserRepo;
import com.ebizzness.ecommerce.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.List;

@Component
public class ReportNotificationObserver {

    private static final Long ADMIN_NOTIFICATION_RECIPIENT_ID = 1L;
    private static final String ADMIN_ROLE = "ADMIN";
    private static final String WARNING_SENT_ACTION = "WARNING_SENT";

    private final NotificationService notificationService;
    private final ProductRepo productRepo;
    private final UserRepo userRepo;

    public ReportNotificationObserver(
            NotificationService notificationService,
            ProductRepo productRepo,
            UserRepo userRepo
    ) {
        this.notificationService = notificationService;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
    }

    @EventListener
    public void onReportSubmitted(ReportSubmittedEvent event) {
        Report report = event.getReport();
        List<User> admins = userRepo.findByRoleIgnoreCase(ADMIN_ROLE);

        if (admins.isEmpty()) {
            notificationService.createNotification(
                    ADMIN_NOTIFICATION_RECIPIENT_ID,
                    "New report submitted by user " + report.getReporterId()
            );
            return;
        }

        admins.forEach(admin ->
                notificationService.createNotification(
                        admin.getUserID(),
                        "New report submitted by user " + report.getReporterId()
                )
        );
    }

    @EventListener
    public void onReportReviewed(ReportReviewedEvent event) {
        Report report = event.getReport();

        if ("REJECTED".equalsIgnoreCase(report.getStatus())) {
            notificationService.createNotification(
                    report.getReporterId(),
                    "Your report was reviewed but no action was taken."
            );
            return;
        }

        if (!"RESOLVED".equalsIgnoreCase(report.getStatus())) {
            return;
        }

        notificationService.createNotification(
                report.getReporterId(),
                "Your report has been resolved. Action taken: " + report.getAdminAction()
        );

        if (WARNING_SENT_ACTION.equalsIgnoreCase(report.getAdminAction())) {
            getWarningRecipientId(report).ifPresent(recipientId ->
                    notificationService.createNotification(
                            recipientId,
                            buildWarningMessage(report)
                    )
            );
        }
    }

    private Optional<Long> getWarningRecipientId(Report report) {
        if ("USER".equalsIgnoreCase(report.getTargetType())) {
            return Optional.ofNullable(report.getTargetId());
        }

        if ("LISTING".equalsIgnoreCase(report.getTargetType()) ||
                "PRODUCT".equalsIgnoreCase(report.getTargetType())) {
            return productRepo.findSellerIdByProductId(report.getTargetId());
        }

        return Optional.empty();
    }

    private String buildWarningMessage(Report report) {
        if ("LISTING".equalsIgnoreCase(report.getTargetType()) ||
                "PRODUCT".equalsIgnoreCase(report.getTargetType())) {
            String productLabel = productRepo.findTitleByProductId(report.getTargetId())
                    .filter(title -> !title.isBlank())
                    .map(title -> "\"" + title + "\" (#" + report.getTargetId() + ")")
                    .orElse("product #" + report.getTargetId());

            return "You received a warning from admin for " + productLabel +
                    " after a report review.";
        }

        return "You received a warning from admin after a report review.";
    }
}
