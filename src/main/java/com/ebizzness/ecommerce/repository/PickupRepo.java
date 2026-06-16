package com.ebizzness.ecommerce.repository;

import com.ebizzness.ecommerce.entity.Pickup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PickupRepo extends JpaRepository<Pickup, Long> {
    Optional<Pickup> findByOrder_OrderId(Long orderId);
    Optional<Pickup> findByManualCode(String manualCode);
}