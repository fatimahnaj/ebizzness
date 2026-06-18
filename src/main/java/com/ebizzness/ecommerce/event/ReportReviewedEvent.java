package com.ebizzness.ecommerce.event;

import com.ebizzness.ecommerce.model.Report;

public class ReportReviewedEvent {

    private final Report report;

    public ReportReviewedEvent(Report report) {
        this.report = report;
    }

    public Report getReport() {
        return report;
    }
}
