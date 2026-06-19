package com.ebizzness.ecommerce.entity;

import com.ebizzness.ecommerce.entity.enums.ProductCategory;
import com.ebizzness.ecommerce.entity.enums.ProductStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "products")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    @JsonIgnore  
    private Seller seller;

    private String title;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private ProductCategory category;

    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, columnDefinition = "varchar(20)")
    private ProductStatus status;

    private String imageUrl;

    private String courseCode;

    private Integer quantity;
}
