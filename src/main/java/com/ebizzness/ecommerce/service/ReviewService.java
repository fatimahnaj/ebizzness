package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.dto.request.ReviewRequest;
import com.ebizzness.ecommerce.dto.response.ReviewResponse;
import java.util.List;

public interface ReviewService {

    ReviewResponse createReview(ReviewRequest request);

    List<ReviewResponse> getReviewsByProduct(Long productId);

    List<ReviewResponse> getReviewsByBuyer(Long buyerId);

    void deleteReview(Long reviewId);
}
