package com.ebizzness.ecommerce.repository;

import com.ebizzness.ecommerce.entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import jakarta.transaction.Transactional;

public interface SellerRepo extends JpaRepository<Seller, Long> {

    @Modifying
    @Transactional
    @Query(
        value = "INSERT INTO seller (seller_id, is_banned, trust_score) VALUES (:sellerId, false, 0.0)",
        nativeQuery = true
    )
    void createSellerProfile(Long sellerId);
}