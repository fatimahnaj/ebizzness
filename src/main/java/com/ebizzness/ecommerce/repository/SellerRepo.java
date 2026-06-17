package com.ebizzness.ecommerce.repository;

import com.ebizzness.ecommerce.entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SellerRepo extends JpaRepository<Seller, Long> {
}