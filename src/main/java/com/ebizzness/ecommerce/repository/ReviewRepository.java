package com.ebizzness.ecommerce.repository;

import com.ebizzness.ecommerce.entity.Review;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductProductIdOrderByCreatedAtDesc(Long productId);

    List<Review> findByBuyerUserIDOrderByCreatedAtDesc(Long buyerId);

    List<Review> findByProductSellerUserIDOrderByCreatedAtDesc(Long sellerId);

    boolean existsByProductProductIdAndBuyerUserID(Long productId, Long buyerId);
}
