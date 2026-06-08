package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.dto.request.AdminLoginRequest;
import com.ebizzness.ecommerce.dto.request.BuyerRegisterRequest;
import com.ebizzness.ecommerce.dto.request.LoginRequest;
import com.ebizzness.ecommerce.dto.request.SellerRegisterRequest;
import com.ebizzness.ecommerce.dto.response.UserResponse;

public interface AuthService {
    UserResponse registerBuyer(BuyerRegisterRequest buyerRegisterRequest);
    UserResponse registerSeller(SellerRegisterRequest sellerRegisterRequest);
    UserResponse login(LoginRequest loginRequest);
    UserResponse loginAdmin(AdminLoginRequest adminLoginRequest);
    void logout(String authorizationHeader);
}
