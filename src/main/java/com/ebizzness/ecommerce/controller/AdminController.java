package com.ebizzness.ecommerce.controller;

import com.ebizzness.ecommerce.dto.AdminDashboardResponse;
import com.ebizzness.ecommerce.model.Message;
import com.ebizzness.ecommerce.model.Notification;
import com.ebizzness.ecommerce.model.Report;
import com.ebizzness.ecommerce.service.AdminService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173" , "http://localhost:3000"})
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // Admin dashboard summary
    @GetMapping("/dashboard")
    public AdminDashboardResponse getDashboardSummary() {
        return adminService.getDashboardSummary();
    }

    // Admin views all reports
    @GetMapping("/reports")
    public List<Report> getAllReports() {
        return adminService.getAllReports();
    }

    // Admin views open reports
    @GetMapping("/reports/open")
    public List<Report> getOpenReports() {
        return adminService.getOpenReports();
    }

    // Admin views resolved reports
    @GetMapping("/reports/resolved")
    public List<Report> getResolvedReports() {
        return adminService.getResolvedReports();
    }

    // Admin views rejected reports
    @GetMapping("/reports/rejected")
    public List<Report> getRejectedReports() {
        return adminService.getRejectedReports();
    }

    // Admin resolves report
    @PutMapping("/reports/{reportId}/resolve")
    public Report resolveReport(
            @PathVariable Long reportId,
            @RequestParam Long adminId,
            @RequestParam String adminAction
    ) {
        return adminService.resolveReport(reportId, adminId, adminAction);
    }

    // Admin rejects report
    @PutMapping("/reports/{reportId}/reject")
    public Report rejectReport(
            @PathVariable Long reportId,
            @RequestParam Long adminId
    ) {
        return adminService.rejectReport(reportId, adminId);
    }

    // Admin deletes report
    @DeleteMapping("/reports/{reportId}")
    public String deleteReport(@PathVariable Long reportId) {
        adminService.deleteReport(reportId);
        return "Report deleted successfully by admin";
    }

    // Admin views messages for moderation
    @GetMapping("/messages")
    public List<Message> getAllMessages() {
        return adminService.getAllMessages();
    }

    // Admin deletes inappropriate message
    @DeleteMapping("/messages/{messageId}")
    public String deleteMessage(@PathVariable Long messageId) {
        adminService.deleteMessage(messageId);
        return "Message deleted successfully by admin";
    }

    // Admin views all notifications
    @GetMapping("/notifications")
    public List<Notification> getAllNotifications() {
        return adminService.getAllNotifications();
    }
}