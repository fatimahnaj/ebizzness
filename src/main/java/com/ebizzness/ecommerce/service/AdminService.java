package com.ebizzness.ecommerce.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ebizzness.ecommerce.dto.AdminDashboardResponse;
import com.ebizzness.ecommerce.entity.User;
import com.ebizzness.ecommerce.model.Message;
import com.ebizzness.ecommerce.model.Notification;
import com.ebizzness.ecommerce.model.Report;
import com.ebizzness.ecommerce.repository.MessageRepository;
import com.ebizzness.ecommerce.repository.NotificationRepository;
import com.ebizzness.ecommerce.repository.ReportRepository;
import com.ebizzness.ecommerce.repository.UserRepo;

@Service
public class AdminService {

    private final ReportRepository reportRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;
    private final ReportService reportService;
    private final AdminModerationService adminModerationService;
    private final UserRepo userRepository;

    public AdminService(
            ReportRepository reportRepository,
            MessageRepository messageRepository,
            NotificationRepository notificationRepository,
            ReportService reportService,
            AdminModerationService adminModerationService
            , UserRepo userRepository
    ) {
        this.reportRepository = reportRepository;
        this.messageRepository = messageRepository;
        this.notificationRepository = notificationRepository;
        this.reportService = reportService;
        this.adminModerationService = adminModerationService;
        this.userRepository = userRepository;
    }

    public AdminDashboardResponse getDashboardSummary() {
        long totalReports = reportRepository.count();
        long openReports = reportRepository.countByStatus("OPEN");
        long resolvedReports = reportRepository.countByStatus("RESOLVED");
        long rejectedReports = reportRepository.countByStatus("REJECTED");
        long totalMessages = messageRepository.count();
        long totalNotifications = notificationRepository.count();

        return new AdminDashboardResponse(
                totalReports,
                openReports,
                resolvedReports,
                rejectedReports,
                totalMessages,
                totalNotifications
        );
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public List<Report> getOpenReports() {
        return reportRepository.findByStatus("OPEN");
    }

    public List<Report> getResolvedReports() {
        return reportRepository.findByStatus("RESOLVED");
    }

    public List<Report> getRejectedReports() {
        return reportRepository.findByStatus("REJECTED");
    }

    @Transactional
    public Report resolveReport(Long reportId, Long adminId, String adminAction) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        adminModerationService.applyReportAction(
                report.getTargetType(),
                report.getTargetId(),
                adminAction,
                adminId
        );

        return reportService.resolveReport(reportId, adminId, adminAction);
    }

    public Report rejectReport(Long reportId, Long adminId) {
        return reportService.rejectReport(reportId, adminId);
    }

    public void deleteReport(Long reportId) {
        reportRepository.deleteById(reportId);
    }

    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    public void deleteMessage(Long messageId) {
        messageRepository.deleteById(messageId);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }
}
