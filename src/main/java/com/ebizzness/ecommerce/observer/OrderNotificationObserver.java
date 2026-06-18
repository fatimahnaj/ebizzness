package com.ebizzness.ecommerce.observer;

import com.ebizzness.ecommerce.entity.Buyer;
import com.ebizzness.ecommerce.entity.Order;
import com.ebizzness.ecommerce.entity.OrderItem;
import com.ebizzness.ecommerce.entity.Seller;
import com.ebizzness.ecommerce.event.OrderPlacedEvent;
import com.ebizzness.ecommerce.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.stream.Collectors;

@Component
public class OrderNotificationObserver {

    private final NotificationService notificationService;

    public OrderNotificationObserver(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @EventListener
    public void onOrderPlaced(OrderPlacedEvent event) {
        Order order = event.getOrder();
        Seller seller = order.getSeller();

        if (seller == null || seller.getUserID() == null) {
            return;
        }

        notificationService.createNotification(
                seller.getUserID(),
                buildOrderMessage(order)
        );
    }

    private String buildOrderMessage(Order order) {
        return "New purchase from " + getBuyerName(order.getBuyer()) +
                " for " + getProductSummary(order) +
                ". Order #" + order.getOrderId() +
                " total: " + formatMoney(order.getTotalAmount()) + ".";
    }

    private String getBuyerName(Buyer buyer) {
        if (buyer == null || buyer.getName() == null || buyer.getName().isBlank()) {
            return "a buyer";
        }

        return buyer.getName().trim().split("\\s+")[0];
    }

    private String getProductSummary(Order order) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            return "your product";
        }

        return order.getItems()
                .stream()
                .map(this::formatOrderItem)
                .collect(Collectors.joining(", "));
    }

    private String formatOrderItem(OrderItem item) {
        String title = item.getProduct() == null || item.getProduct().getTitle() == null ||
                item.getProduct().getTitle().isBlank()
                ? "product #" + (item.getProduct() == null ? "unknown" : item.getProduct().getProductId())
                : "\"" + item.getProduct().getTitle() + "\"";

        return item.getQuantity() + " x " + title;
    }

    private String formatMoney(BigDecimal amount) {
        BigDecimal safeAmount = amount == null ? BigDecimal.ZERO : amount;
        return "RM " + safeAmount.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }
}
