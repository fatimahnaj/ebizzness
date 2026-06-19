package com.ebizzness.ecommerce.event;

import com.ebizzness.ecommerce.model.Report;

public class ReportSubmittedEvent {

    private final Report report;

    public ReportSubmittedEvent(Report report) {
        this.report = report;
    }

    public Report getReport() {
        return report;
    }
}
