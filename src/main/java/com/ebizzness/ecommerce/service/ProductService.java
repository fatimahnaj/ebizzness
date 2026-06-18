package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.dto.request.ProductRequest;
import com.ebizzness.ecommerce.dto.response.ProductResponse;
import java.util.List;

public interface ProductService {
    ProductResponse createProduct(ProductRequest request);
    List<ProductResponse> getAllProducts();
    ProductResponse getProductById(Long id);
    ProductResponse getProductByIdForAdmin(Long id);
    ProductResponse updateProduct(Long id, ProductRequest request);
    void deleteProduct(Long id);
    List<ProductResponse> searchProducts(String keyword, String category, String courseCode, String status);
    List<ProductResponse> getProductsBySeller(Long sellerId);
}
