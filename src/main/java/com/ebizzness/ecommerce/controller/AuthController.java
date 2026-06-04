package com.ebizzness.ecommerce.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ebizzness.ecommerce.dto.request.BuyerRegisterRequest;
import com.ebizzness.ecommerce.dto.request.LoginRequest;
import com.ebizzness.ecommerce.dto.request.SellerRegisterRequest;
import com.ebizzness.ecommerce.dto.response.UserResponse;
import com.ebizzness.ecommerce.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;

@AllArgsConstructor
@RestController
@RequestMapping("api/auth")
public class AuthController {

    private final AuthService authService;

    //Register new buyer REST API
    @PostMapping("/register/buyer")
    public ResponseEntity<UserResponse> registerBuyer(@RequestBody BuyerRegisterRequest buyerRegisterRequest) {
        UserResponse userResponse = authService.registerBuyer(buyerRegisterRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(userResponse);
    }

    //Register new seller REST API
    @PostMapping("/register/seller")
    public ResponseEntity<UserResponse> registerSeller(@RequestBody SellerRegisterRequest sellerRegisterRequest) {
        UserResponse userResponse = authService.registerSeller(sellerRegisterRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(userResponse);
    }

    //Login REST API- get user
    @PostMapping("/login")
    public ResponseEntity<UserResponse> loginUser(@RequestBody LoginRequest loginRequestDTO) {
        UserResponse userResponse = authService.login(loginRequestDTO);
        return ResponseEntity.ok(userResponse);
    }

    //Logout REST API
    @PostMapping("/logout")
    public ResponseEntity<Void> logoutUser(HttpServletRequest request, HttpServletResponse response) {
        authService.logout(request, response);
        return ResponseEntity.noContent().build();
    }
}
