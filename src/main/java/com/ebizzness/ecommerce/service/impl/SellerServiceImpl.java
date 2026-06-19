package com.ebizzness.ecommerce.service.impl;

import com.ebizzness.ecommerce.dto.response.SellerProfileResponse;
import com.ebizzness.ecommerce.entity.Seller;
import com.ebizzness.ecommerce.entity.Review;
import com.ebizzness.ecommerce.exception.ResourceNotFoundException;
import com.ebizzness.ecommerce.mapper.ProductMapper;
import com.ebizzness.ecommerce.mapper.ReviewMapper;
import com.ebizzness.ecommerce.repository.ProductRepo;
import com.ebizzness.ecommerce.repository.ReviewRepository;
import com.ebizzness.ecommerce.repository.SellerRepo;
import com.ebizzness.ecommerce.service.SellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SellerServiceImpl implements SellerService {

    private final SellerRepo sellerRepo;
    private final ProductRepo productRepo;
    private final ReviewRepository reviewRepository;

    @Override
    public SellerProfileResponse getSellerProfile(Long sellerId) {
        Seller seller = sellerRepo.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found"));

        List<Review> sellerReviews = reviewRepository.findByProductSellerUserIDOrderByCreatedAtDesc(sellerId);
        double sellerRating = sellerReviews.stream()
                .mapToInt(review -> review.getRating() == null ? 0 : review.getRating())
                .average()
                .orElse(0.0);

        return SellerProfileResponse.builder()
                .sellerId(seller.getUserID())
                .sellerName(seller.getName())
                .email(seller.getEmail())
                .sellerRating(sellerRating)
                .reviewCount(sellerReviews.size())
                .listings(
                        productRepo.findBySellerUserID(sellerId)
                                .stream()
                                .map(ProductMapper::toResponse)
                                .toList()
                )
                .reviews(
                        sellerReviews.stream()
                                .map(ReviewMapper::toResponse)
                                .toList()
                )
                .build();
    }
}
