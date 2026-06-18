package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.dto.request.AddToCartRequest;
import com.ebizzness.ecommerce.dto.request.UpdateCartItemRequest;
import com.ebizzness.ecommerce.dto.response.CartResponse;
import org.springframework.stereotype.Service;

@Service
public interface CartService {
    CartResponse addToCart(AddToCartRequest request, String authorizationHeader);
    CartResponse removeFromCart(Long productId, String authorizationHeader);
    CartResponse updateCartItem(UpdateCartItemRequest request, String authorizationHeader);
    CartResponse getCart(String authorizationHeader);
    void clearCart(String authorizationHeader);
}