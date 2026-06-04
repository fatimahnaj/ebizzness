package com.ebizzness.ecommerce.service.impl;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepo userRepo;
    private final UserMapper userMapper;
    private final BuyerFactory buyerFactory;
    private final SellerFactory sellerFactory;

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

        userRepo.findByEmail(email).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        });

        User buyerEntity = buyerFactory.createUser(buyerRegisterRequest);
        User savedUser = userRepo.save(buyerEntity);
        return userMapper.MaptoDto(savedUser);
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

        userRepo.findByEmail(email).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        });

        User sellerEntity = sellerFactory.createUser(sellerRegisterRequest);
        User savedUser = userRepo.save(sellerEntity);
        return userMapper.MaptoDto(savedUser);
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

        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));

        if (!password.equals(user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return userMapper.MaptoDto(user);
    }

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response) {
        if (response != null) {
            response.setHeader("Authorization", "");
        }
    }
}
