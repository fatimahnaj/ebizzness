package com.ebizzness.ecommerce.repository;

import com.ebizzness.ecommerce.entity.Buyer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BuyerRepo extends JpaRepository<Buyer, Long> {
}
