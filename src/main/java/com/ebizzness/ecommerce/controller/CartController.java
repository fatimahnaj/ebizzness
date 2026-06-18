package com.ebizzness.ecommerce.controller;

import com.ebizzness.ecommerce.dto.request.AddToCartRequest;
import com.ebizzness.ecommerce.dto.request.UpdateCartItemRequest;
import com.ebizzness.ecommerce.dto.response.CartResponse;
import com.ebizzness.ecommerce.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(@RequestBody AddToCartRequest request,
                                                  @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(cartService.addToCart(request, auth));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<CartResponse> removeItem(@PathVariable Long productId,
                                                   @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(cartService.removeFromCart(productId, auth));
    }

    @PutMapping("/update")
    public ResponseEntity<CartResponse> updateQuantity(@RequestBody UpdateCartItemRequest request,
                                                       @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(cartService.updateCartItem(request, auth));
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(cartService.getCart(auth));
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@RequestHeader("Authorization") String auth) {
        cartService.clearCart(auth);
        return ResponseEntity.noContent().build();
    }
}
