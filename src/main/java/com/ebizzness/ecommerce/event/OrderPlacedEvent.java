package com.ebizzness.ecommerce.event;

import com.ebizzness.ecommerce.entity.Order;

public class OrderPlacedEvent {

    private final Order order;

    public OrderPlacedEvent(Order order) {
        this.order = order;
    }

    public Order getOrder() {
        return order;
    }
}
