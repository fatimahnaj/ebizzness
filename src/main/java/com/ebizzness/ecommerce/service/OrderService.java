package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.dto.request.CheckoutRequest;
import com.ebizzness.ecommerce.dto.response.OrderResponse;
import java.util.List;

public interface OrderService {
    OrderResponse checkout(CheckoutRequest request, String authorizationHeader);
    List<OrderResponse> getUserOrders(String authorizationHeader);
    OrderResponse getOrderDetails(Long orderId, String authorizationHeader);
}