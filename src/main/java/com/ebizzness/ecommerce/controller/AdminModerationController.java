package com.ebizzness.ecommerce.controller;

import com.ebizzness.ecommerce.service.AdminModerationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/moderation")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminModerationController {

    private final AdminModerationService adminModerationService;

    public AdminModerationController(AdminModerationService adminModerationService) {
        this.adminModerationService = adminModerationService;
    }

    @PutMapping("/users/{userID}/ban")
    public ResponseEntity<String> banUser(@PathVariable Long userID) {
        adminModerationService.banUser(userID);
        return ResponseEntity.ok("User banned successfully.");
    }

    @PutMapping("/users/{userID}/unban")
    public ResponseEntity<String> unbanUser(@PathVariable Long userID) {
        adminModerationService.unbanUser(userID);
        return ResponseEntity.ok("User unbanned successfully.");
    }

    @PutMapping("/listings/{productID}/remove")
    public ResponseEntity<String> removeListing(@PathVariable Long productID) {
        adminModerationService.removeListing(productID);
        return ResponseEntity.ok("Listing removed successfully.");
    }
}