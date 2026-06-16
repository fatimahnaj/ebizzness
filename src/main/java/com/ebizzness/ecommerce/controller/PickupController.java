package com.ebizzness.ecommerce.controller;

import com.ebizzness.ecommerce.dto.request.PickupConfirmRequest;
import com.ebizzness.ecommerce.service.PickupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pickup")
@RequiredArgsConstructor
public class PickupController {

    private final PickupService pickupService;

    @PostMapping("/confirm")
    public ResponseEntity<Void> confirmPickup(@RequestBody PickupConfirmRequest request) {
        // request should contain the encrypted data (extracted from QR scan)
        pickupService.confirmPickup(request.getEncryptedData());
        return ResponseEntity.ok().build();
    }
}