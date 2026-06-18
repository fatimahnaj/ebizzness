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
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RefundService {

    private final RefundRepo refundRepo;
    private final OrderRepo orderRepo;
    private final SessionService sessionService;

    public List<RefundResponse> getAllRefunds(String authorizationHeader) {
        requireAdmin(authorizationHeader);
        return refundRepo.findAllByOrderByRequestedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public RefundResponse requestRefund(RefundRequest request, String authorizationHeader) {
        if (request == null || request.getOrderId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order is required");
        }

        if (request.getReason() == null || request.getReason().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Refund reason is required");
        }

        Long buyerId = sessionService.getSession(authorizationHeader).getUserId();
        Order order = orderRepo.findById(request.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!order.getBuyer().getUserID().equals(buyerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your order");
        }
        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order not completed yet");
        }
        if (refundRepo.existsByOrder_OrderIdAndStatus(order.getOrderId(), "PENDING")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A pending refund request already exists for this order");
        }

        Refund refund = Refund.builder()
                .order(order)
                .buyer(order.getBuyer())
                .reason(request.getReason().trim())
                .refundAmount(order.getTotalAmount())
                .status("PENDING")
                .requestedAt(LocalDateTime.now())
                .build();
        Refund saved = refundRepo.save(refund);
        return mapToResponse(saved);
    }

    @Transactional
    public RefundResponse resolveRefund(Long refundId, String action, String authorizationHeader) {
        requireAdmin(authorizationHeader);
        Refund refund = refundRepo.findById(refundId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Refund not found"));
        if (!"PENDING".equalsIgnoreCase(refund.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Refund request is already resolved");
        }

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

    private void requireAdmin(String authorizationHeader) {
        SessionInfo session = sessionService.getSession(authorizationHeader);
        if (!"ADMIN".equalsIgnoreCase(session.getActiveRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access is required");
        }
    }

    private RefundResponse mapToResponse(Refund refund) {
        return RefundResponse.builder()
                .refundId(refund.getRefundId())
                .orderId(refund.getOrder().getOrderId())
                .buyerId(refund.getBuyer().getUserID())
                .buyerName(refund.getBuyer().getName())
                .reason(refund.getReason())
                .refundAmount(refund.getRefundAmount())
                .status(refund.getStatus())
                .requestedAt(refund.getRequestedAt())
                .resolvedAt(refund.getResolvedAt())
                .build();
    }
}
