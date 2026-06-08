package com.ebizzness.ecommerce.dto.request;

import java.math.BigDecimal;

import com.ebizzness.ecommerce.entity.enums.ProductCategory;
import com.ebizzness.ecommerce.entity.enums.ProductStatus;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    private String title;
    private String description;
    private String imageUrl;
    private ProductCategory category;
    private BigDecimal price;
    private ProductStatus status;
    private String courseCode;

}