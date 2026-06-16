package com.ebizzness.ecommerce.controller;

import com.ebizzness.ecommerce.dto.request.RefundRequest;
import com.ebizzness.ecommerce.dto.response.RefundResponse;
import com.ebizzness.ecommerce.service.RefundService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/refunds")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;

    @PostMapping("/request")
    public ResponseEntity<RefundResponse> requestRefund(@RequestBody RefundRequest request,
                                                        @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(refundService.requestRefund(request, auth));
    }

    @PutMapping("/{refundId}/resolve")
    public ResponseEntity<RefundResponse> resolveRefund(@PathVariable Long refundId,
                                                        @RequestParam String action,
                                                        @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(refundService.resolveRefund(refundId, action, auth));
    }
}