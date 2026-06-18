package com.ebizzness.ecommerce.dto.response;

import com.ebizzness.ecommerce.entity.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long orderId;
    private Long buyerId;
    private String buyerName;
    private Long sellerId;
    private String sellerName;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String pickupCode;
    private List<OrderItemResponse> items;
    private LocalDateTime orderDate;
    private String qrCodeData;        // encrypted pickup payload
    private String qrCodeImagePath;   // for pickup
}
