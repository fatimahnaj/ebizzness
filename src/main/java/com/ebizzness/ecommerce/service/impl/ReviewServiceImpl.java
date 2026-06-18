package com.ebizzness.ecommerce.service.impl;

import com.ebizzness.ecommerce.dto.request.ReviewRequest;
import com.ebizzness.ecommerce.dto.response.ReviewResponse;
import com.ebizzness.ecommerce.entity.Buyer;
import com.ebizzness.ecommerce.entity.Order;
import com.ebizzness.ecommerce.entity.Product;
import com.ebizzness.ecommerce.entity.Review;
import com.ebizzness.ecommerce.entity.enums.OrderStatus;
import com.ebizzness.ecommerce.exception.ResourceNotFoundException;
import com.ebizzness.ecommerce.mapper.ReviewMapper;
import com.ebizzness.ecommerce.repository.BuyerRepo;
import com.ebizzness.ecommerce.repository.OrderRepo;
import com.ebizzness.ecommerce.repository.ProductRepo;
import com.ebizzness.ecommerce.repository.ReviewRepository;
import com.ebizzness.ecommerce.service.ReviewService;
import com.ebizzness.ecommerce.service.SessionService;
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
    private final OrderRepo orderRepo;
    private final SessionService sessionService;

    @Override
    public ReviewResponse createReview(ReviewRequest request, String authorizationHeader) {
        Long sessionUserId = sessionService.getSession(authorizationHeader).getUserId();

        Order order = orderRepo.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        if (!order.getBuyer().getUserID().equals(sessionUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only review your own completed orders");
        }

        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must be completed before reviewing");
        }

        Product product = productRepo.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        boolean productBelongsToOrder = order.getItems()
                .stream()
                .anyMatch(item -> item.getProduct().getProductId().equals(request.getProductId()));

        if (!productBelongsToOrder) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product is not part of this order");
        }

        Buyer buyer = order.getBuyer();

        if (reviewRepository.existsByProductProductIdAndBuyerUserID(request.getProductId(), buyer.getUserID())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Buyer already reviewed this product");
        }

        Review review = new Review();
        review.setProduct(product);
        review.setBuyer(buyer);
        review.setOrder(order);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

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
