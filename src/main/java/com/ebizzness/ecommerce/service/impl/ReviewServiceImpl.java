package com.ebizzness.ecommerce.service.impl;

import com.ebizzness.ecommerce.dto.request.ReviewRequest;
import com.ebizzness.ecommerce.dto.response.ReviewResponse;
import com.ebizzness.ecommerce.entity.Buyer;
import com.ebizzness.ecommerce.entity.Product;
import com.ebizzness.ecommerce.entity.Review;
import com.ebizzness.ecommerce.exception.ResourceNotFoundException;
import com.ebizzness.ecommerce.mapper.ReviewMapper;
import com.ebizzness.ecommerce.repository.BuyerRepo;
import com.ebizzness.ecommerce.repository.ProductRepo;
import com.ebizzness.ecommerce.repository.ReviewRepository;
import com.ebizzness.ecommerce.service.ReviewService;
import java.util.List;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@AllArgsConstructor
@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepo productRepo;
    private final BuyerRepo buyerRepo;

    @Override
    public ReviewResponse createReview(ReviewRequest request) {
        Product product = productRepo.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        Buyer buyer = buyerRepo.findById(request.getBuyerId())
                .orElseThrow(() -> new ResourceNotFoundException("Buyer not found with id: " + request.getBuyerId()));

        if (reviewRepository.existsByProductProductIdAndBuyerUserID(request.getProductId(), request.getBuyerId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Buyer already reviewed this product");
        }

        Review review = Review.builder()
                .product(product)
                .buyer(buyer)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        return ReviewMapper.toResponse(reviewRepository.save(review));
    }

    @Override
    public List<ReviewResponse> getReviewsByProduct(Long productId) {
        if (!productRepo.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }

        return reviewRepository.findByProductProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(ReviewMapper::toResponse)
                .toList();
    }

    @Override
    public List<ReviewResponse> getReviewsByBuyer(Long buyerId) {
        if (!buyerRepo.existsById(buyerId)) {
            throw new ResourceNotFoundException("Buyer not found with id: " + buyerId);
        }

        return reviewRepository.findByBuyerUserIDOrderByCreatedAtDesc(buyerId)
                .stream()
                .map(ReviewMapper::toResponse)
                .toList();
    }

    @Override
    public void deleteReview(Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new ResourceNotFoundException("Review not found with id: " + reviewId);
        }

        reviewRepository.deleteById(reviewId);
    }
}
