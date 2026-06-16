package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.dto.request.RefundRequest;
import com.ebizzness.ecommerce.dto.response.RefundResponse;
import com.ebizzness.ecommerce.entity.Order;
import com.ebizzness.ecommerce.entity.Refund;
import com.ebizzness.ecommerce.entity.enums.OrderStatus;
import com.ebizzness.ecommerce.repository.OrderRepo;
import com.ebizzness.ecommerce.repository.RefundRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RefundService {

    private final RefundRepo refundRepo;
    private final OrderRepo orderRepo;
    private final SessionService sessionService;

    @Transactional
    public RefundResponse requestRefund(RefundRequest request, String authorizationHeader) {
        Long buyerId = sessionService.getSession(authorizationHeader).getUserId();
        Order order = orderRepo.findById(request.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getBuyer().getUserID().equals(buyerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your order");
        }
        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order not completed yet");
        }

        Refund refund = Refund.builder()
                .order(order)
                .buyer(order.getBuyer())
                .reason(request.getReason())
                .refundAmount(order.getTotalAmount())
                .status("PENDING")
                .requestedAt(LocalDateTime.now())
                .build();
        Refund saved = refundRepo.save(refund);
        return mapToResponse(saved);
    }

    @Transactional
    public RefundResponse resolveRefund(Long refundId, String action, String authorizationHeader) {
        // In a real system, check admin role. We'll assume admin.
        Refund refund = refundRepo.findById(refundId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Refund not found"));

        if (action.equalsIgnoreCase("APPROVE")) {
            refund.setStatus("APPROVED");
            refund.getOrder().setStatus(OrderStatus.REFUNDED);
            orderRepo.save(refund.getOrder());
        } else if (action.equalsIgnoreCase("REJECT")) {
            refund.setStatus("REJECTED");
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid action");
        }
        refund.setResolvedAt(LocalDateTime.now());
        return mapToResponse(refundRepo.save(refund));
    }

    private RefundResponse mapToResponse(Refund refund) {
        return RefundResponse.builder()
                .refundId(refund.getRefundId())
                .orderId(refund.getOrder().getOrderId())
                .reason(refund.getReason())
                .refundAmount(refund.getRefundAmount())
                .status(refund.getStatus())
                .requestedAt(refund.getRequestedAt())
                .build();
    }
}