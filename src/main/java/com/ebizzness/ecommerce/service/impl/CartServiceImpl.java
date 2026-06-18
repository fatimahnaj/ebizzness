package com.ebizzness.ecommerce.service.impl;

import com.ebizzness.ecommerce.dto.request.AddToCartRequest;
import com.ebizzness.ecommerce.dto.request.UpdateCartItemRequest;
import com.ebizzness.ecommerce.dto.response.CartItemResponse;
import com.ebizzness.ecommerce.dto.response.CartResponse;
import com.ebizzness.ecommerce.entity.*;
import com.ebizzness.ecommerce.repository.*;
import com.ebizzness.ecommerce.service.CartService;
import com.ebizzness.ecommerce.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepo cartRepo;
    private final CartItemRepo cartItemRepo;
    private final ProductRepo productRepo;
    private final BuyerRepo buyerRepo;
    private final SessionService sessionService;

    @Override
    @Transactional
    public CartResponse addToCart(AddToCartRequest request, String authorizationHeader) {
        if (request == null || request.getProductId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product is required");
        }

        if (request.getQuantity() == null || request.getQuantity() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be at least 1");
        }

        Long buyerId = sessionService.getSession(authorizationHeader).getUserId();
        Buyer buyer = buyerRepo.findById(buyerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Buyer not found"));

        validateNotOwnListing(request.getProductId(), buyerId);

        Cart cart = cartRepo.findByBuyer_UserIDAndStatus(buyerId, "ACTIVE")
                .orElseGet(() -> createNewCart(buyer));

        BigDecimal priceAtAdd = productRepo.findPriceByProductId(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        Product product = productRepo.getReferenceById(request.getProductId());

        // Check if product already in cart
        CartItem existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getProductId().equals(request.getProductId()))
                .findFirst()
                .orElse(null);

        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            validateStock(request.getProductId(), newQuantity);
            existingItem.setQuantity(newQuantity);
            cartItemRepo.save(existingItem);
        } else {
            validateStock(request.getProductId(), request.getQuantity());
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .priceAtAdd(priceAtAdd)
                    .build();
            cart.getItems().add(newItem);
            cartItemRepo.save(newItem);
        }

        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeFromCart(Long productId, String authorizationHeader) {
        Long buyerId = sessionService.getSession(authorizationHeader).getUserId();
        Cart cart = cartRepo.findByBuyer_UserIDAndStatus(buyerId, "ACTIVE")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart not found"));

        cart.getItems().removeIf(item -> item.getProduct().getProductId().equals(productId));
        cartRepo.save(cart);

        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(UpdateCartItemRequest request, String authorizationHeader) {
        if (request == null || request.getProductId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product is required");
        }

        if (request.getQuantity() == null || request.getQuantity() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be at least 1");
        }

        Long buyerId = sessionService.getSession(authorizationHeader).getUserId();
        Cart cart = cartRepo.findByBuyer_UserIDAndStatus(buyerId, "ACTIVE")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart not found"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getProduct().getProductId().equals(request.getProductId()))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not in cart"));

        validateStock(request.getProductId(), request.getQuantity());
        item.setQuantity(request.getQuantity());
        cartItemRepo.save(item);

        return mapToCartResponse(cart);
    }

    @Override
    public CartResponse getCart(String authorizationHeader) {
        Long buyerId = sessionService.getSession(authorizationHeader).getUserId();
        Cart cart = cartRepo.findByBuyer_UserIDAndStatus(buyerId, "ACTIVE")
                .orElse(null);
        return mapToCartResponse(cart);
    }

    @Override
    @Transactional
    public void clearCart(String authorizationHeader) {
        Long buyerId = sessionService.getSession(authorizationHeader).getUserId();
        cartRepo.findByBuyer_UserIDAndStatus(buyerId, "ACTIVE")
        .ifPresent(c -> {
            cartItemRepo.deleteAll(c.getItems());
            c.getItems().clear();
            cartRepo.save(c);
            });
    }

    private Cart createNewCart(Buyer buyer) {
        Cart cart = new Cart();
        cart.setBuyer(buyer);
        cart.setStatus("ACTIVE");
        return cartRepo.save(cart);  // ← must return the saved Cart (with generated ID)
    }

    private void validateStock(Long productId, int requestedQuantity) {
        Integer availableQuantity = productRepo.findQuantityByProductId(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (availableQuantity == null || availableQuantity < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product is out of stock");
        }

        if (requestedQuantity > availableQuantity) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only " + availableQuantity + " item(s) available");
        }
    }

    private void validateNotOwnListing(Long productId, Long buyerId) {
        Long sellerId = productRepo.findSellerIdByProductId(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product seller not found"));

        if (sellerId.equals(buyerId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot add your own listing to cart");
        }
    }

    private CartResponse mapToCartResponse(Cart cart) {
        if (cart == null) {
            return CartResponse.builder()
                    .items(List.of())
                    .totalAmount(BigDecimal.ZERO)
                    .status("EMPTY")
                    .build();
        }

        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(item -> {
                    Long productId = item.getProduct().getProductId();

                    return CartItemResponse.builder()
                            .productId(productId)
                            .productTitle(productRepo.findTitleByProductId(productId).orElse("Unknown product"))
                            .productImageUrl(productRepo.findImageUrlByProductId(productId).orElse(null))
                            .quantity(item.getQuantity())
                            .priceAtAdd(item.getPriceAtAdd())
                            .subtotal(item.getPriceAtAdd().multiply(BigDecimal.valueOf(item.getQuantity())))
                            .build();
                })
                .collect(Collectors.toList());

        BigDecimal total = itemResponses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .cartId(cart.getCartId())
                .items(itemResponses)
                .totalAmount(total)
                .status(cart.getStatus())
                .build();
    }
}
