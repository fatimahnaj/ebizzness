package com.ebizzness.ecommerce.observer;

import com.ebizzness.ecommerce.entity.Buyer;
import com.ebizzness.ecommerce.entity.Product;
import com.ebizzness.ecommerce.entity.Review;
import com.ebizzness.ecommerce.event.ReviewCreatedEvent;
import com.ebizzness.ecommerce.repository.ProductRepo;
import com.ebizzness.ecommerce.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class ReviewNotificationObserver {

    private final NotificationService notificationService;
    private final ProductRepo productRepo;

    public ReviewNotificationObserver(
            NotificationService notificationService,
            ProductRepo productRepo
    ) {
        this.notificationService = notificationService;
        this.productRepo = productRepo;
    }

    @EventListener
    public void onReviewCreated(ReviewCreatedEvent event) {
        Review review = event.getReview();
        Product product = review.getProduct();

        if (product == null || product.getProductId() == null) {
            return;
        }

        productRepo.findSellerIdByProductId(product.getProductId()).ifPresent(sellerId ->
                notificationService.createNotification(
                        sellerId,
                        buildReviewMessage(review)
                )
        );
    }

    private String buildReviewMessage(Review review) {
        return "You received a " + getRatingLabel(review.getRating()) +
                " review from " + getBuyerName(review.getBuyer()) +
                " for " + getProductLabel(review.getProduct()) + ".";
    }

    private String getRatingLabel(Integer rating) {
        int safeRating = rating == null ? 0 : rating;
        return safeRating + "-star";
    }

    private String getBuyerName(Buyer buyer) {
        if (buyer == null || buyer.getName() == null || buyer.getName().isBlank()) {
            return "a buyer";
        }

        return buyer.getName().trim().split("\\s+")[0];
    }

    private String getProductLabel(Product product) {
        if (product == null) {
            return "your product";
        }

        if (product.getTitle() == null || product.getTitle().isBlank()) {
            return "product #" + product.getProductId();
        }

        return "\"" + product.getTitle() + "\"";
    }
}
