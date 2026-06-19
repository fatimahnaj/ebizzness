package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.dto.AdminUserDTO;
import com.ebizzness.ecommerce.dto.request.AdminUserUpdateRequest;
import com.ebizzness.ecommerce.entity.User;
import com.ebizzness.ecommerce.repository.UserRepo;
import com.ebizzness.ecommerce.util.AccountStatusUtil;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminUserService {

    private final UserRepo userRepository;

    public AdminUserService(UserRepo userRepository) {
        this.userRepository = userRepository;
    }

    public List<AdminUserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .filter(user -> user.getRole() == null || !user.getRole().equalsIgnoreCase("ADMIN"))
                .map(this::convertToDTO)
                .toList();
    }

    public AdminUserDTO updateUser(Long userID, AdminUserUpdateRequest request) {
        User user = userRepository.findById(userID)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userID));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName());
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            user.setEmail(request.getEmail());
        }

        if (request.getMmuID() != null && !request.getMmuID().trim().isEmpty()) {
            user.setMmuID(request.getMmuID());
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(request.getPassword());
        }

        User savedUser = userRepository.save(user);

        return convertToDTO(savedUser);
    }

    public void deleteUser(Long userID) {
        if (!userRepository.existsById(userID)) {
            throw new RuntimeException("User not found with ID: " + userID);
        }

        userRepository.deleteById(userID);
    }

    private AdminUserDTO convertToDTO(User user) {
        return new AdminUserDTO(
                user.getUserID(),
                user.getName(),
                user.getEmail(),
                user.getMmuID(),
                user.getRole(),
                AccountStatusUtil.isBanned(user)
        );
    }
}
