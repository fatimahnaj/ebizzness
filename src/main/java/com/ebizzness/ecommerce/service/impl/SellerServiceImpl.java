package com.ebizzness.ecommerce.service.impl;

import com.ebizzness.ecommerce.dto.response.SellerProfileResponse;
import com.ebizzness.ecommerce.entity.Seller;
import com.ebizzness.ecommerce.exception.ResourceNotFoundException;
import com.ebizzness.ecommerce.mapper.ProductMapper;
import com.ebizzness.ecommerce.repository.ProductRepo;
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

    @Override
    public SellerProfileResponse getSellerProfile(Long sellerId) {
        Seller seller = sellerRepo.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found"));

        return SellerProfileResponse.builder()
                .sellerId(seller.getUserID())
                .sellerName(seller.getName())
                .email(seller.getEmail())
                .trustScore(seller.getTrustScore())
                .listings(
                        productRepo.findBySellerUserID(sellerId)
                                .stream()
                                .map(ProductMapper::toResponse)
                                .toList()
                )
                .reviews(List.of())
                .build();
    }
}