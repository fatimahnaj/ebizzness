package com.ebizzness.ecommerce.controller;

import com.ebizzness.ecommerce.model.Report;
import com.ebizzness.ecommerce.service.ReportService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "https://v7dj1qmx-5173.asse.devtunnels.ms"})
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    // GET all reports
    @GetMapping
    public List<Report> getAllReports() {
        return reportService.getAllReports();
    }

    // GET one report by ID
    @GetMapping("/{reportId}")
    public Report getReportById(@PathVariable Long reportId) {
        return reportService.getReportById(reportId);
    }

    // GET reports submitted by one user
    @GetMapping("/reporter/{reporterId}")
    public List<Report> getReportsByReporterId(@PathVariable Long reporterId) {
        return reportService.getReportsByReporterId(reporterId);
    }

    // GET reports by status: OPEN, RESOLVED, REJECTED
    @GetMapping("/status/{status}")
    public List<Report> getReportsByStatus(@PathVariable String status) {
        return reportService.getReportsByStatus(status);
    }

    // GET reports by target type: USER, LISTING, MESSAGE, ORDER
    @GetMapping("/target-type/{targetType}")
    public List<Report> getReportsByTargetType(@PathVariable String targetType) {
        return reportService.getReportsByTargetType(targetType);
    }

    // GET reports against a specific target ID
    @GetMapping("/target/{targetId}")
    public List<Report> getReportsByTargetId(@PathVariable Long targetId) {
        return reportService.getReportsByTargetId(targetId);
    }

    // POST submit report
    @PostMapping
    public Report submitReport(@RequestBody Report report) {
        return reportService.submitReport(report);
    }

    // PUT resolve report
    @PutMapping("/{reportId}/resolve")
    public Report resolveReport(
            @PathVariable Long reportId,
            @RequestParam Long adminId,
            @RequestParam String adminAction
    ) {
        return reportService.resolveReport(reportId, adminId, adminAction);
    }

    // PUT reject report
    @PutMapping("/{reportId}/reject")
    public Report rejectReport(
            @PathVariable Long reportId,
            @RequestParam Long adminId
    ) {
        return reportService.rejectReport(reportId, adminId);
    }

    // DELETE report
    @DeleteMapping("/{reportId}")
    public String deleteReport(@PathVariable Long reportId) {
        reportService.deleteReport(reportId);
        return "Report deleted successfully";
    }
}
