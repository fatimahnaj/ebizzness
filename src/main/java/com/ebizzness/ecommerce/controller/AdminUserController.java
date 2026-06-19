package com.ebizzness.ecommerce.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ebizzness.ecommerce.dto.AdminUserDTO;
import com.ebizzness.ecommerce.dto.request.AdminUserUpdateRequest;
import com.ebizzness.ecommerce.service.AdminUserService;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<List<AdminUserDTO>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @PutMapping("/{userID}")
    public ResponseEntity<AdminUserDTO> updateUser(
            @PathVariable Long userID,
            @RequestBody AdminUserUpdateRequest request
    ) {
        return ResponseEntity.ok(adminUserService.updateUser(userID, request));
    }

    @DeleteMapping("/{userID}")
    public ResponseEntity<String> deleteUser(@PathVariable Long userID) {
        adminUserService.deleteUser(userID);
        return ResponseEntity.ok("User deleted successfully.");
    }
}