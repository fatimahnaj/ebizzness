package com.ebizzness.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.ebizzness.ecommerce.entity.Product;
import java.util.List;

public interface ProductRepo extends JpaRepository<Product, Long> {
    List<Product> findByTitleContainingIgnoreCase(String keyword);

    List<Product> findByCategoryIgnoreCase(String category);

    List<Product> findByCourseCodeIgnoreCase(String courseCode);

}
