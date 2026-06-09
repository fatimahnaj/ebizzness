package com.ebizzness.ecommerce.entity;

import com.ebizzness.ecommerce.entity.enums.ProductCategory;
import com.ebizzness.ecommerce.entity.enums.ProductStatus;

import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "products")
public class Product {

    @ManyToOne
    @JoinColumn(name = "seller_id")
    private Seller seller;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    private String title;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private ProductCategory category;

    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private ProductStatus status;

    private String imageUrl;

    private String courseCode;

}