package com.ebizzness.ecommerce.repository;

import com.ebizzness.ecommerce.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RefundRepo extends JpaRepository<Refund, Long> {
    List<Refund> findByOrder_OrderId(Long orderId);
    List<Refund> findByBuyer_UserID(Long buyerId);
    List<Refund> findAllByOrderByRequestedAtDesc();
    boolean existsByOrder_OrderIdAndStatus(Long orderId, String status);
}
