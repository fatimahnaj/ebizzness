package com.ebizzness.ecommerce.dto.response;

import java.math.BigDecimal;

import com.ebizzness.ecommerce.entity.enums.ProductCategory;
import com.ebizzness.ecommerce.entity.enums.ProductStatus;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long sellerId;
    private String sellerName;
    private Long productId;
    private String title;
    private String description;
    private ProductCategory category;
    private BigDecimal price;
    private ProductStatus status;
    private String imageUrl;
    private String courseCode;
}