package com.ebizzness.ecommerce.service;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ebizzness.ecommerce.model.Report;
import com.ebizzness.ecommerce.repository.MessageRepository;
import com.ebizzness.ecommerce.repository.NotificationRepository;
import com.ebizzness.ecommerce.repository.ReportRepository;

class AdminServiceTest {

    @Test
    void resolveReportAppliesSelectedModerationAction() {
        ReportRepository reportRepository = mock(ReportRepository.class);
        MessageRepository messageRepository = mock(MessageRepository.class);
        NotificationRepository notificationRepository = mock(NotificationRepository.class);
        ReportService reportService = mock(ReportService.class);
        AdminModerationService adminModerationService = mock(AdminModerationService.class);
        com.ebizzness.ecommerce.repository.UserRepo userRepo = mock(com.ebizzness.ecommerce.repository.UserRepo.class);
        AdminService adminService = new AdminService(
                reportRepository,
                messageRepository,
                notificationRepository,
                reportService,
                adminModerationService,
                userRepo
        );

        Report report = new Report();
        report.setReportId(4L);
        report.setTargetType("USER");
        report.setTargetId(7L);

        when(reportRepository.findById(4L)).thenReturn(Optional.of(report));

        adminService.resolveReport(4L, 1L, "USER_BANNED");

        verify(adminModerationService).applyReportAction("USER", 7L, "USER_BANNED", 1L);
        verify(reportService).resolveReport(4L, 1L, "USER_BANNED");
    }
}
