package com.ebizzness.ecommerce.observer;

import com.ebizzness.ecommerce.entity.Buyer;
import com.ebizzness.ecommerce.entity.Order;
import com.ebizzness.ecommerce.entity.OrderItem;
import com.ebizzness.ecommerce.entity.Product;
import com.ebizzness.ecommerce.entity.Seller;
import com.ebizzness.ecommerce.event.OrderPlacedEvent;
import com.ebizzness.ecommerce.service.NotificationService;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class OrderNotificationObserverTest {

    @Test
    void onOrderPlacedNotifiesSellerAboutPurchase() {
        NotificationService notificationService = mock(NotificationService.class);
        OrderNotificationObserver observer = new OrderNotificationObserver(notificationService);

        Buyer buyer = new Buyer();
        buyer.setName("Amir Hakimi");

        Seller seller = new Seller();
        seller.setUserID(7L);

        Product product = new Product();
        product.setProductId(11L);
        product.setTitle("Calculus Textbook");

        Order order = Order.builder()
                .orderId(3L)
                .buyer(buyer)
                .seller(seller)
                .totalAmount(new BigDecimal("45.00"))
                .build();

        OrderItem item = OrderItem.builder()
                .order(order)
                .product(product)
                .quantity(2)
                .priceAtPurchase(new BigDecimal("22.50"))
                .build();
        order.getItems().add(item);

        observer.onOrderPlaced(new OrderPlacedEvent(order));

        verify(notificationService).createNotification(
                7L,
                "New purchase from Amir for 2 x \"Calculus Textbook\". Order #3 total: RM 45.00."
        );
    }
}
