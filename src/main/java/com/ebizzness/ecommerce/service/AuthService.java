package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.dto.request.LoginRequest;
import com.ebizzness.ecommerce.dto.request.RegisterRequest;
import com.ebizzness.ecommerce.dto.response.UserResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
    UserResponse register(RegisterRequest registerRequest);
    UserResponse login(LoginRequest loginRequest);
    void logout(HttpServletRequest request, HttpServletResponse response);
}
