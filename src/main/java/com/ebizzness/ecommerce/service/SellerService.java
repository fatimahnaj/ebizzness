package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.dto.response.SellerProfileResponse;

public interface SellerService {
    SellerProfileResponse getSellerProfile(Long sellerId);
}