package com.ebizzness.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ebizzness.ecommerce.entity.Product;
import com.ebizzness.ecommerce.entity.enums.ProductCategory;

import java.util.List;

public interface ProductRepo extends JpaRepository<Product, Long> {
    List<Product> findByTitleContainingIgnoreCase(String keyword);

    List<Product> findByCourseCodeIgnoreCase(String courseCode);

    List<Product> findByCategory(ProductCategory category);

    List<Product> findByStatus(com.ebizzness.ecommerce.entity.enums.ProductStatus status);

}
