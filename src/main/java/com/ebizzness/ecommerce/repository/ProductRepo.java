package com.ebizzness.ecommerce.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.ebizzness.ecommerce.entity.Product;
import com.ebizzness.ecommerce.entity.enums.ProductCategory;
import com.ebizzness.ecommerce.entity.enums.ProductStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductRepo extends JpaRepository<Product, Long> {
    List<Product> findByTitleContainingIgnoreCase(String keyword);

    List<Product> findByCourseCodeIgnoreCase(String courseCode);

    List<Product> findByCategory(ProductCategory category);

    List<Product> findByStatus(ProductStatus status);

    List<Product> findBySellerUserID(Long sellerId);

    @Query(
            value = "select product_id from products where seller_id = :sellerId",
            nativeQuery = true
    )
    List<Long> findProductIdsBySellerId(@Param("sellerId") Long sellerId);

    @Modifying
    @Transactional
    @Query(
            value = "update products set status = 'REMOVED' where seller_id = :sellerId",
            nativeQuery = true
    )
    int markListingsRemovedBySellerId(@Param("sellerId") Long sellerId);

    @Query("select p.price from Product p where p.productId = :productId")
    Optional<BigDecimal> findPriceByProductId(@Param("productId") Long productId);

    @Query("select p.title from Product p where p.productId = :productId")
    Optional<String> findTitleByProductId(@Param("productId") Long productId);

    @Query("select p.imageUrl from Product p where p.productId = :productId")
    Optional<String> findImageUrlByProductId(@Param("productId") Long productId);

    @Query("select p.quantity from Product p where p.productId = :productId")
    Optional<Integer> findQuantityByProductId(@Param("productId") Long productId);

    @Query("select p.seller.userID from Product p where p.productId = :productId")
    Optional<Long> findSellerIdByProductId(@Param("productId") Long productId);
}
