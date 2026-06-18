package com.ebizzness.ecommerce.service.impl;

import com.ebizzness.ecommerce.dto.request.CheckoutRequest;
import com.ebizzness.ecommerce.dto.response.OrderItemResponse;
import com.ebizzness.ecommerce.dto.response.OrderResponse;
import com.ebizzness.ecommerce.entity.*;
import com.ebizzness.ecommerce.entity.enums.OrderStatus;
import com.ebizzness.ecommerce.entity.enums.ProductStatus;
import com.ebizzness.ecommerce.repository.*;
import com.ebizzness.ecommerce.service.OrderService;
import com.ebizzness.ecommerce.service.PaymentService;
import com.ebizzness.ecommerce.service.QRCodeService;
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
public class OrderServiceImpl implements OrderService {

    private final CartRepo cartRepo;
    private final CartItemRepo cartItemRepo;
    private final OrderRepo orderRepo;
    private final OrderItemRepo orderItemRepo;
    private final PaymentService paymentService;
    private final QRCodeService qrCodeService;
    private final PickupRepo pickupRepo;
    private final BuyerRepo buyerRepo;
    private final SellerRepo sellerRepo;
    private final ProductRepo productRepo;
    private final SessionService sessionService;

    @Override
    @Transactional
    public OrderResponse checkout(CheckoutRequest request, String authorizationHeader) {
        Long buyerId = sessionService.getSession(authorizationHeader).getUserId();
        Buyer buyer = buyerRepo.findById(buyerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Buyer not found"));

        Cart cart = cartRepo.findByBuyer_UserIDAndStatus(buyerId, "ACTIVE")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        Long sellerId = resolveSingleSellerId(cart);
        if (sellerId.equals(buyerId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot checkout your own listing");
        }

        Seller seller = sellerRepo.getReferenceById(sellerId);

        Order order = Order.builder()
                .buyer(buyer)
                .seller(seller)
                .totalAmount(calculateTotal(cart))
                .status(OrderStatus.PENDING)
                .build();
        Order savedOrder = orderRepo.save(order);

        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepo.findById(cartItem.getProduct().getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

            if (product.getQuantity() == null || product.getQuantity() < cartItem.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Not enough stock for " + product.getTitle());
            }

            product.setQuantity(product.getQuantity() - cartItem.getQuantity());
            product.setStatus(product.getQuantity() == 0 ? ProductStatus.SOLD : ProductStatus.AVAILABLE);
            productRepo.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .priceAtPurchase(cartItem.getPriceAtAdd())
                    .build();
            orderItemRepo.save(orderItem);
            savedOrder.getItems().add(orderItem);
        }

        // Process mock payment
        paymentService.processMockPayment(savedOrder, request.getPaymentMethod());

        // Update order status to PAID
        savedOrder.setStatus(OrderStatus.PAID);
        orderRepo.save(savedOrder);

        // Generate pickup QR code
        try {
            qrCodeService.generateForOrder(savedOrder);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate QR code", e);
        }

        // Clear cart
        cartItemRepo.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepo.save(cart);

        return mapToOrderResponse(savedOrder);
    }

    @Override
    public List<OrderResponse> getUserOrders(String authorizationHeader) {
        Long buyerId = sessionService.getSession(authorizationHeader).getUserId();
        List<Order> orders = orderRepo.findByBuyer_UserID(buyerId);
        return orders.stream().map(this::mapToOrderResponse).collect(Collectors.toList());
    }

    @Override
    public List<OrderResponse> getSellerOrders(String authorizationHeader) {
        Long sellerId = sessionService.getSession(authorizationHeader).getUserId();
        if (!sellerRepo.existsById(sellerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seller profile is required");
        }

        List<Order> orders = orderRepo.findBySeller_UserIDOrderByOrderDateDesc(sellerId);
        return orders.stream().map(this::mapToOrderResponse).collect(Collectors.toList());
    }

    @Override
    public OrderResponse getOrderDetails(Long orderId, String authorizationHeader) {
        Order order = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        Long userId = sessionService.getSession(authorizationHeader).getUserId();
        if (!order.getBuyer().getUserID().equals(userId) && !order.getSeller().getUserID().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your order");
        }
        return mapToOrderResponse(order);
    }

    private BigDecimal calculateTotal(Cart cart) {
        return cart.getItems().stream()
                .map(item -> item.getPriceAtAdd().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Long resolveSingleSellerId(Cart cart) {
        Long sellerId = null;

        for (CartItem item : cart.getItems()) {
            Long productId = item.getProduct().getProductId();
            Long itemSellerId = productRepo.findSellerIdByProductId(productId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product seller not found"));

            if (sellerId == null) {
                sellerId = itemSellerId;
            } else if (!sellerId.equals(itemSellerId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Checkout supports products from one seller at a time");
            }
        }

        return sellerId;
    }

    private OrderResponse mapToOrderResponse(Order order) {
        Pickup pickup = getOrCreatePickupForPaidOrder(order);
        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .buyerId(order.getBuyer().getUserID())
                .buyerName(order.getBuyer().getName())
                .sellerId(order.getSeller().getUserID())
                .sellerName(order.getSeller().getName())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .pickupCode(pickup != null ? pickup.getManualCode() : null)
                .qrCodeImagePath(pickup != null ? pickup.getQrCodeImagePath() : null)
                .orderDate(order.getOrderDate())
                .items(order.getItems().stream().map(item -> OrderItemResponse.builder()
                        .productId(item.getProduct().getProductId())
                        .productTitle(item.getProduct().getTitle())
                        .quantity(item.getQuantity())
                        .priceAtPurchase(item.getPriceAtPurchase())
                        .subtotal(item.getPriceAtPurchase().multiply(BigDecimal.valueOf(item.getQuantity())))
                        .build()).collect(Collectors.toList()))
                .build();
    }

    private Pickup getOrCreatePickupForPaidOrder(Order order) {
        return pickupRepo.findByOrder_OrderId(order.getOrderId())
                .orElseGet(() -> {
                    if (order.getStatus() != OrderStatus.PAID) {
                        return null;
                    }

                    try {
                        return qrCodeService.generateForOrder(order);
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to generate QR code", e);
                    }
                });
    }
}
