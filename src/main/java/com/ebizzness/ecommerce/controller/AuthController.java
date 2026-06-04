package com.ebizzness.ecommerce.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ebizzness.ecommerce.dto.request.LoginRequest;
import com.ebizzness.ecommerce.dto.request.RegisterRequest;
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

    //Create new user REST API
    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(@RequestBody RegisterRequest registerRequestDTO) {
        UserResponse userResponse = authService.register(registerRequestDTO);
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
