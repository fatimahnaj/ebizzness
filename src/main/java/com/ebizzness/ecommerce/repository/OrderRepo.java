package com.ebizzness.ecommerce.repository;

import com.ebizzness.ecommerce.entity.Order;
import com.ebizzness.ecommerce.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepo extends JpaRepository<Order, Long> {
    List<Order> findByBuyer_UserID(Long buyerId);
    List<Order> findBySeller_UserID(Long sellerId);
    List<Order> findBySeller_UserIDOrderByOrderDateDesc(Long sellerId);
    List<Order> findByStatus(OrderStatus status);
}
