package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.model.Report;
import com.ebizzness.ecommerce.repository.MessageRepository;
import com.ebizzness.ecommerce.repository.NotificationRepository;
import com.ebizzness.ecommerce.repository.ReportRepository;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AdminServiceTest {

    @Test
    void resolveReportAppliesSelectedModerationAction() {
        ReportRepository reportRepository = mock(ReportRepository.class);
        MessageRepository messageRepository = mock(MessageRepository.class);
        NotificationRepository notificationRepository = mock(NotificationRepository.class);
        ReportService reportService = mock(ReportService.class);
        AdminModerationService adminModerationService = mock(AdminModerationService.class);
        AdminService adminService = new AdminService(
                reportRepository,
                messageRepository,
                notificationRepository,
                reportService,
                adminModerationService
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
