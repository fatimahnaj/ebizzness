package com.ebizzness.ecommerce.repository;

import com.ebizzness.ecommerce.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CartRepo extends JpaRepository<Cart, Long> {
    Optional<Cart> findByBuyer_UserIDAndStatus(Long buyerId, String status);
}