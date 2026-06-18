package com.ebizzness.ecommerce.mapper;

import com.ebizzness.ecommerce.dto.response.ReviewResponse;
import com.ebizzness.ecommerce.entity.Review;

public class ReviewMapper {

    private ReviewMapper() {
        // Utility class
    }

    public static ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .reviewId(review.getReviewId())
                .orderId(review.getOrder().getOrderId())
                .productId(review.getProduct().getProductId())
                .productTitle(review.getProduct().getTitle())
                .buyerId(review.getBuyer().getUserID())
                .buyerName(review.getBuyer().getName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
