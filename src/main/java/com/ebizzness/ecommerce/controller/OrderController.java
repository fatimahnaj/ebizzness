package com.ebizzness.ecommerce.controller;

import com.ebizzness.ecommerce.dto.request.CheckoutRequest;
import com.ebizzness.ecommerce.dto.response.OrderResponse;
import com.ebizzness.ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponse> checkout(@RequestBody CheckoutRequest request,
                                                  @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(orderService.checkout(request, auth));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getUserOrders(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(orderService.getUserOrders(auth));
    }

    @GetMapping("/seller")
    public ResponseEntity<List<OrderResponse>> getSellerOrders(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(orderService.getSellerOrders(auth));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderDetails(@PathVariable Long orderId,
                                                         @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(orderService.getOrderDetails(orderId, auth));
    }
}
