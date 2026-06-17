package com.ebizzness.ecommerce.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "report")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    private Long reporterId;

    private Long targetId;

    private String targetType; 
    // Example: "USER", "LISTING", "MESSAGE", "ORDER"

    @Column(nullable = false, length = 1000)
    private String reason;

    private String status;
    // Example: "OPEN", "RESOLVED", "REJECTED"

    private String adminAction;
    // Example: "WARNING_SENT", "LISTING_REMOVED", "USER_BANNED", "NO_ACTION"

    private Long resolvedByAdminId;

    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;

    public Report() {
    }

    public Report(Long reporterId, Long targetId, String targetType, String reason) {
        this.reporterId = reporterId;
        this.targetId = targetId;
        this.targetType = targetType;
        this.reason = reason;
        this.status = "OPEN";
        this.createdAt = LocalDateTime.now();
    }

    public Long getReportId() {
        return reportId;
    }

    public void setReportId(Long reportId) {
        this.reportId = reportId;
    }

    public Long getReporterId() {
        return reporterId;
    }

    public void setReporterId(Long reporterId) {
        this.reporterId = reporterId;
    }

    public Long getTargetId() {
        return targetId;
    }

    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminAction() {
        return adminAction;
    }

    public void setAdminAction(String adminAction) {
        this.adminAction = adminAction;
    }

    public Long getResolvedByAdminId() {
        return resolvedByAdminId;
    }

    public void setResolvedByAdminId(Long resolvedByAdminId) {
        this.resolvedByAdminId = resolvedByAdminId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}