package com.ebizzness.ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundResponse {
    private Long refundId;
    private Long orderId;
    private Long buyerId;
    private String buyerName;
    private String reason;
    private BigDecimal refundAmount;
    private String status;
    private LocalDateTime requestedAt;
    private LocalDateTime resolvedAt;
}
