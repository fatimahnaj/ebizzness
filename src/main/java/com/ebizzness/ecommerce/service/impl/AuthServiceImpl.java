package com.ebizzness.ecommerce.service.impl;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ebizzness.ecommerce.dto.request.AdminLoginRequest;
import com.ebizzness.ecommerce.dto.request.BuyerRegisterRequest;
import com.ebizzness.ecommerce.dto.request.LoginRequest;
import com.ebizzness.ecommerce.dto.request.SellerRegisterRequest;
import com.ebizzness.ecommerce.dto.response.UserResponse;
import com.ebizzness.ecommerce.entity.User;
import com.ebizzness.ecommerce.factory.BuyerFactory;
import com.ebizzness.ecommerce.factory.SellerFactory;
import com.ebizzness.ecommerce.mapper.UserMapper;
import com.ebizzness.ecommerce.repository.UserRepo;
import com.ebizzness.ecommerce.service.AuthService;
import com.ebizzness.ecommerce.service.SessionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final List<String> STUDENT_ROLES = List.of("BUYER", "SELLER");
    private static final String ADMIN_ROLE = "ADMIN";

    private final UserRepo userRepo;
    private final UserMapper userMapper;
    private final BuyerFactory buyerFactory;
    private final SellerFactory sellerFactory;
    private final SessionService sessionService;

    @Override
    public UserResponse registerBuyer(BuyerRegisterRequest buyerRegisterRequest) {
        if (buyerRegisterRequest == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "BuyerRegisterRequest cannot be null");
        }

        String email = buyerRegisterRequest.getEmail();
        String password = buyerRegisterRequest.getPassword();

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        if (!isAllowedMmuEmail(email)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Email must be a valid MMU student or staff address ending with student.mmu.edu.my or staff.mmu.edu.my");
        }

        userRepo.findByEmailAndRoleIn(email, STUDENT_ROLES).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        });

        User buyerEntity = buyerFactory.createUser(buyerRegisterRequest);
        User savedUser = userRepo.save(buyerEntity);
        String token = sessionService.createSession(savedUser);
        return userMapper.MaptoDto(savedUser, sessionService.getActiveRole(token), token);
    }

    @Override
    public UserResponse registerSeller(SellerRegisterRequest sellerRegisterRequest) {
        if (sellerRegisterRequest == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SellerRegisterRequest cannot be null");
        }

        String email = sellerRegisterRequest.getEmail();
        String password = sellerRegisterRequest.getPassword();

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        userRepo.findByEmailAndRoleIn(email, STUDENT_ROLES).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists");
        });

        User sellerEntity = sellerFactory.createUser(sellerRegisterRequest);
        User savedUser = userRepo.save(sellerEntity);
        String token = sessionService.createSession(savedUser);
        return userMapper.MaptoDto(savedUser, sessionService.getActiveRole(token), token);
    }

    @Override
    public UserResponse login(LoginRequest loginRequest) {
        if (loginRequest == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "LoginRequest cannot be null");
        }

        String email = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        User user = userRepo.findByEmailAndRoleIn(email, STUDENT_ROLES)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!password.equals(user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        String token = sessionService.createSession(user);
        return userMapper.MaptoDto(user, sessionService.getActiveRole(token), token);
    }

    @Override
    public UserResponse loginAdmin(AdminLoginRequest adminLoginRequest) {
        if (adminLoginRequest == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "AdminLoginRequest cannot be null");
        }

        String adminID = adminLoginRequest.getAdminID();
        String password = adminLoginRequest.getPassword();

        if (adminID == null || adminID.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Admin ID is required");
        }

        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        User admin = userRepo.findByMmuIDAndRole(adminID, ADMIN_ROLE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin credentials"));

        if (!password.equals(admin.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid admin credentials");
        }

        String token = sessionService.createSession(admin);
        return userMapper.MaptoDto(admin, sessionService.getActiveRole(token), token);
    }

    @Override
    public void logout(String authorizationHeader) {
        sessionService.invalidateSession(authorizationHeader);
    }

    private boolean isAllowedMmuEmail(String email) {
        String normalized = email.trim().toLowerCase();
        return normalized.endsWith("@student.mmu.edu.my") || normalized.endsWith("@staff.mmu.edu.my");
    }
}
