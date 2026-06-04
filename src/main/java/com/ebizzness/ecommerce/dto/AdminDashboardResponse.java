package com.ebizzness.ecommerce.dto;

public class AdminDashboardResponse {

    private long totalReports;
    private long openReports;
    private long resolvedReports;
    private long rejectedReports;
    private long totalMessages;
    private long totalNotifications;

    public AdminDashboardResponse() {
    }

    public AdminDashboardResponse(
            long totalReports,
            long openReports,
            long resolvedReports,
            long rejectedReports,
            long totalMessages,
            long totalNotifications
    ) {
        this.totalReports = totalReports;
        this.openReports = openReports;
        this.resolvedReports = resolvedReports;
        this.rejectedReports = rejectedReports;
        this.totalMessages = totalMessages;
        this.totalNotifications = totalNotifications;
    }

    public long getTotalReports() {
        return totalReports;
    }

    public void setTotalReports(long totalReports) {
        this.totalReports = totalReports;
    }

    public long getOpenReports() {
        return openReports;
    }

    public void setOpenReports(long openReports) {
        this.openReports = openReports;
    }

    public long getResolvedReports() {
        return resolvedReports;
    }

    public void setResolvedReports(long resolvedReports) {
        this.resolvedReports = resolvedReports;
    }

    public long getRejectedReports() {
        return rejectedReports;
    }

    public void setRejectedReports(long rejectedReports) {
        this.rejectedReports = rejectedReports;
    }

    public long getTotalMessages() {
        return totalMessages;
    }

    public void setTotalMessages(long totalMessages) {
        this.totalMessages = totalMessages;
    }

    public long getTotalNotifications() {
        return totalNotifications;
    }

    public void setTotalNotifications(long totalNotifications) {
        this.totalNotifications = totalNotifications;
    }
}