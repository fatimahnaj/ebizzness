package com.ebizzness.ecommerce.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ebizzness.ecommerce.dto.request.AdminLoginRequest;
import com.ebizzness.ecommerce.dto.request.BuyerRegisterRequest;
import com.ebizzness.ecommerce.dto.request.LoginRequest;
import com.ebizzness.ecommerce.dto.response.UserResponse;
import com.ebizzness.ecommerce.service.AuthService;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@RestController
@RequestMapping("api/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping({"/register", "/register/buyer"})
    public ResponseEntity<UserResponse> registerBuyer(@RequestBody BuyerRegisterRequest buyerRegisterRequest) {
        UserResponse userResponse = authService.registerBuyer(buyerRegisterRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(userResponse);
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponse> loginUser(@RequestBody LoginRequest loginRequestDTO) {
        UserResponse userResponse = authService.login(loginRequestDTO);
        return ResponseEntity.ok(userResponse);
    }

    @PostMapping("/login-admin")
    public ResponseEntity<UserResponse> loginAdmin(@RequestBody AdminLoginRequest adminLoginRequest) {
        UserResponse userResponse = authService.loginAdmin(adminLoginRequest);
        return ResponseEntity.ok(userResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logoutUser(@RequestHeader("Authorization") String authorizationHeader) {
        authService.logout(authorizationHeader);
        return ResponseEntity.noContent().build();
    }
}
