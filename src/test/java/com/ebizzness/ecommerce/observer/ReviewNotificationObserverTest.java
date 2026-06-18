package com.ebizzness.ecommerce.observer;

import com.ebizzness.ecommerce.entity.Buyer;
import com.ebizzness.ecommerce.entity.Product;
import com.ebizzness.ecommerce.entity.Review;
import com.ebizzness.ecommerce.entity.Seller;
import com.ebizzness.ecommerce.event.ReviewCreatedEvent;
import com.ebizzness.ecommerce.repository.ProductRepo;
import com.ebizzness.ecommerce.service.NotificationService;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ReviewNotificationObserverTest {

    @Test
    void onReviewCreatedNotifiesSellerAboutReview() {
        NotificationService notificationService = mock(NotificationService.class);
        ProductRepo productRepo = mock(ProductRepo.class);
        ReviewNotificationObserver observer =
                new ReviewNotificationObserver(notificationService, productRepo);

        Seller seller = new Seller();
        seller.setUserID(7L);

        Product product = new Product();
        product.setProductId(11L);
        product.setTitle("Calculus Textbook");
        product.setSeller(seller);

        Buyer buyer = new Buyer();
        buyer.setName("Amir Hakimi");

        Review review = new Review();
        review.setProduct(product);
        review.setBuyer(buyer);
        review.setRating(5);

        when(productRepo.findSellerIdByProductId(11L)).thenReturn(Optional.of(7L));

        observer.onReviewCreated(new ReviewCreatedEvent(review));

        verify(notificationService).createNotification(
                7L,
                "You received a 5-star review from Amir for \"Calculus Textbook\"."
        );
    }
}
