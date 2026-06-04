package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.dto.request.BuyerRegisterRequest;
import com.ebizzness.ecommerce.dto.request.LoginRequest;
import com.ebizzness.ecommerce.dto.request.SellerRegisterRequest;
import com.ebizzness.ecommerce.dto.response.UserResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    UserResponse registerBuyer(BuyerRegisterRequest buyerRegisterRequest);
    UserResponse registerSeller(SellerRegisterRequest sellerRegisterRequest);
    UserResponse login(LoginRequest loginRequest);
    void logout(HttpServletRequest request, HttpServletResponse response);
}
