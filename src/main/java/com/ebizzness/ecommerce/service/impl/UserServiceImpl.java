package com.ebizzness.ecommerce.service.impl;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ebizzness.ecommerce.dto.request.SwitchRoleRequest;
import com.ebizzness.ecommerce.dto.request.UpgradeToSellerRequest;
import com.ebizzness.ecommerce.dto.response.UserResponse;
import com.ebizzness.ecommerce.entity.User;
import com.ebizzness.ecommerce.mapper.UserMapper;
import com.ebizzness.ecommerce.repository.UserRepo;
import com.ebizzness.ecommerce.repository.SellerRepo;
import com.ebizzness.ecommerce.service.SessionInfo;
import com.ebizzness.ecommerce.service.SessionService;
import com.ebizzness.ecommerce.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final String BUYER_ROLE = "BUYER";
    private static final String SELLER_ROLE = "SELLER";

    private final UserRepo userRepo;
    private final UserMapper userMapper;
    private final SessionService sessionService;
    private final SellerRepo sellerRepo;

    @Override
    public UserResponse upgradeToSeller(String authorizationHeader, UpgradeToSellerRequest request) {
        Long userId = sessionService.getSession(authorizationHeader).getUserId();

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session user not found"));

        if (!sellerRepo.existsById(user.getUserID())) {
            sellerRepo.createSellerProfile(user.getUserID());
        }

        if (!SELLER_ROLE.equalsIgnoreCase(user.getRole())) {
            user.setRole(SELLER_ROLE);
            user = userRepo.save(user);
        }

        sessionService.setActiveRole(authorizationHeader, SELLER_ROLE);
        return userMapper.MaptoDto(user, SELLER_ROLE, extractToken(authorizationHeader));
    }

    @Override
    public UserResponse switchRole(String authorizationHeader, SwitchRoleRequest request) {
        if (request == null || request.getRole() == null || request.getRole().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role is required");
        }

        String requestedRole = request.getRole().trim().toUpperCase();
        SessionInfo session = sessionService.getSession(authorizationHeader);
        User user = userRepo.findById(session.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session user not found"));

        if (SELLER_ROLE.equals(requestedRole) && !SELLER_ROLE.equalsIgnoreCase(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seller profile is required before switching to seller mode");
        }

        if (!BUYER_ROLE.equals(requestedRole) && !SELLER_ROLE.equals(requestedRole)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported role switch request");
        }

        sessionService.setActiveRole(authorizationHeader, requestedRole);
        return userMapper.MaptoDto(user, requestedRole, extractToken(authorizationHeader));
    }

    @Override
    public UserResponse getProfile(String authorizationHeader) {
        SessionInfo session = sessionService.getSession(authorizationHeader);
        User user = userRepo.findById(session.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Session user not found"));

        return userMapper.MaptoDto(user, session.getActiveRole(), extractToken(authorizationHeader));
    }

    private String extractToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            return null;
        }
        if (authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring(7).trim();
        }
        return authorizationHeader.trim();
    }
}
