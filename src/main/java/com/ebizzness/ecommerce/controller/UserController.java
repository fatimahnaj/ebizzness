package com.ebizzness.ecommerce.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ebizzness.ecommerce.dto.request.SwitchRoleRequest;
import com.ebizzness.ecommerce.dto.request.UpgradeToSellerRequest;
import com.ebizzness.ecommerce.dto.response.UserResponse;
import com.ebizzness.ecommerce.service.UserService;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@RestController
@RequestMapping("api/users")
@CrossOrigin(origins = {"http://localhost:5173", "https://v7dj1qmx-5173.asse.devtunnels.ms"}, allowedHeaders = "*", allowCredentials = "true")
public class UserController {

    private final UserService userService;
    
    @PostMapping("/upgrade-to-seller")
    public ResponseEntity<UserResponse> upgradeToSeller(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody UpgradeToSellerRequest request) {
        return ResponseEntity.ok(userService.upgradeToSeller(authorizationHeader, request));
    }

    @PostMapping("/switch-role")
    public ResponseEntity<UserResponse> switchRole(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestBody SwitchRoleRequest request) {
        return ResponseEntity.ok(userService.switchRole(authorizationHeader, request));
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(@RequestHeader("Authorization") String authorizationHeader) {
        return ResponseEntity.ok(userService.getProfile(authorizationHeader));
    }
}
