package com.ebizzness.ecommerce.mapper;

import com.ebizzness.ecommerce.dto.request.ProductRequest;
import com.ebizzness.ecommerce.dto.response.ProductResponse;
import com.ebizzness.ecommerce.entity.Product;

public class ProductMapper {

    public static Product toEntity(ProductRequest request) {
        return Product.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .price(request.getPrice())
                .status(request.getStatus())
                .imageUrl(request.getImageUrl())
                .courseCode(request.getCourseCode())
                .build();
    }

    public static ProductResponse toResponse(Product product) {
        return ProductResponse.builder()
                .sellerId(product.getSeller() != null ? product.getSeller().getUserID() : null)
                .sellerName(product.getSeller() != null ? product.getSeller().getName() : null)
                .productId(product.getProductId())
                .title(product.getTitle())
                .description(product.getDescription())
                .category(product.getCategory())
                .price(product.getPrice())
                .status(product.getStatus())
                .courseCode(product.getCourseCode())
                .imageUrl(product.getImageUrl())
                .build();
    }
}