package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.model.Report;
import com.ebizzness.ecommerce.repository.ReportRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final NotificationService notificationService;

    public ReportService(
            ReportRepository reportRepository,
            NotificationService notificationService
    ) {
        this.reportRepository = reportRepository;
        this.notificationService = notificationService;
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public Report getReportById(Long reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
    }

    public List<Report> getReportsByReporterId(Long reporterId) {
        return reportRepository.findByReporterId(reporterId);
    }

    public List<Report> getReportsByStatus(String status) {
        return reportRepository.findByStatus(status.toUpperCase());
    }

    public List<Report> getReportsByTargetType(String targetType) {
        return reportRepository.findByTargetType(targetType.toUpperCase());
    }

    public List<Report> getReportsByTargetId(Long targetId) {
        return reportRepository.findByTargetId(targetId);
    }

    public Report submitReport(Report report) {
        report.setStatus("OPEN");
        report.setCreatedAt(LocalDateTime.now());

        Report savedReport = reportRepository.save(report);

        /*
         * Prototype notification:
         * In a real system, this would notify admins.
         * For now, we use adminId = 1 as a fake admin user.
         */
        notificationService.createNotification(
                1L,
                "New report submitted by user " + report.getReporterId()
        );

        return savedReport;
    }

    public Report resolveReport(Long reportId, Long adminId, String adminAction) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setStatus("RESOLVED");
        report.setAdminAction(adminAction);
        report.setResolvedByAdminId(adminId);
        report.setResolvedAt(LocalDateTime.now());

        Report updatedReport = reportRepository.save(report);

        notificationService.createNotification(
                report.getReporterId(),
                "Your report has been resolved. Action taken: " + adminAction
        );

        return updatedReport;
    }

    public Report rejectReport(Long reportId, Long adminId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setStatus("REJECTED");
        report.setAdminAction("NO_ACTION");
        report.setResolvedByAdminId(adminId);
        report.setResolvedAt(LocalDateTime.now());

        Report updatedReport = reportRepository.save(report);

        notificationService.createNotification(
                report.getReporterId(),
                "Your report was reviewed but no action was taken."
        );

        return updatedReport;
    }

    public void deleteReport(Long reportId) {
        reportRepository.deleteById(reportId);
    }
}