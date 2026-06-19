package com.ebizzness.ecommerce.controller;

import com.ebizzness.ecommerce.dto.response.SellerProfileResponse;
import com.ebizzness.ecommerce.service.SellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sellers")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = {"http://localhost:5173", "https://*.ngrok-free.dev", "https://*.ngrok-free.app"})
public class SellerController {

    private final SellerService sellerService;

    @GetMapping("/{sellerId}")
    public ResponseEntity<SellerProfileResponse> getSellerProfile(@PathVariable Long sellerId) {
        return ResponseEntity.ok(sellerService.getSellerProfile(sellerId));
    }
}
