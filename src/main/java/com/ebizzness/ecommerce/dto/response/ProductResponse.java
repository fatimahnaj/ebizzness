package com.ebizzness.ecommerce.dto.response;

import java.math.BigDecimal;

import com.ebizzness.ecommerce.entity.enums.ProductCategory;
import com.ebizzness.ecommerce.entity.enums.ProductStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long sellerId;
    private String sellerName;
    private double sellerTrustScore;
    private Long productId;
    private String title;
    private String description;
    private ProductCategory category;
    private BigDecimal price;
    private ProductStatus status;
    private String imageUrl;
    private String courseCode;
}