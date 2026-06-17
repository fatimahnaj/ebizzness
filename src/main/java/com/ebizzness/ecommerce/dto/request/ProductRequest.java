package com.ebizzness.ecommerce.dto.request;

import java.math.BigDecimal;

import com.ebizzness.ecommerce.entity.enums.ProductCategory;
import com.ebizzness.ecommerce.entity.enums.ProductStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String description;
    
    @NotBlank
    private String imageUrl;

    @NotNull
    private ProductCategory category;

    @NotNull
    @Positive
    private BigDecimal price;

    @NotNull
    @PositiveOrZero
    private Integer quantity;
    
    private ProductStatus status;

    private String courseCode;

    @NotNull
    private Long sellerId;

}