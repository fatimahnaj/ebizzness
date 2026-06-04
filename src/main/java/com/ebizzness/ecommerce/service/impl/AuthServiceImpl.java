package com.ebizzness.ecommerce.service.impl;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ebizzness.ecommerce.dto.request.LoginRequest;
import com.ebizzness.ecommerce.dto.request.RegisterRequest;
import com.ebizzness.ecommerce.dto.response.UserResponse;
import com.ebizzness.ecommerce.entity.User;
import com.ebizzness.ecommerce.factory.AdminFactory;
import com.ebizzness.ecommerce.factory.BuyerFactory;
import com.ebizzness.ecommerce.factory.SellerFactory;
import com.ebizzness.ecommerce.factory.UserFactory;
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

    @Override
    public UserResponse register(RegisterRequest registerRequest) {
        if (registerRequest == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "RegisterRequest cannot be null");
        }

        String email = registerRequest.getEmail();
        String password = registerRequest.getPassword();
        String role = registerRequest.getRole();

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        if (role == null || role.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role is required");
        }

        userRepo.findByEmail(email).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        });

        User userEntity = createUserFromRequest(registerRequest);
        User savedUser = userRepo.save(userEntity);
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

    private User createUserFromRequest(RegisterRequest request) {
        UserFactory factory = getFactoryForRole(request.getRole());
        return factory.createUser(request);
    }

    private UserFactory getFactoryForRole(String role) {
        if (role == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role is required");
        }

        return switch (role.trim().toLowerCase()) {
            case "buyer" -> new BuyerFactory();
            case "seller" -> new SellerFactory();
            case "admin" -> new AdminFactory();
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown role: " + role);
        };
    }
}
