package com.ebizzness.ecommerce.repository;

import com.ebizzness.ecommerce.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByReporterId(Long reporterId);

    List<Report> findByStatus(String status);

    List<Report> findByTargetType(String targetType);

    List<Report> findByTargetId(Long targetId);

    long countByStatus(String status);
}


