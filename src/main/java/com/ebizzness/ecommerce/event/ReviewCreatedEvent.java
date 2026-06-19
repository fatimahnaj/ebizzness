package com.ebizzness.ecommerce.event;

import com.ebizzness.ecommerce.entity.Review;

public class ReviewCreatedEvent {

    private final Review review;

    public ReviewCreatedEvent(Review review) {
        this.review = review;
    }

    public Review getReview() {
        return review;
    }
}
