package com.ebizzness.ecommerce.service.impl;

import com.ebizzness.ecommerce.dto.request.ProductRequest;
import com.ebizzness.ecommerce.dto.response.ProductResponse;
import com.ebizzness.ecommerce.entity.Product;
import com.ebizzness.ecommerce.mapper.ProductMapper;
import com.ebizzness.ecommerce.repository.ProductRepo;
import com.ebizzness.ecommerce.entity.Seller;
import com.ebizzness.ecommerce.repository.SellerRepo;
import com.ebizzness.ecommerce.exception.ResourceNotFoundException;
import com.ebizzness.ecommerce.service.ProductService;
import com.ebizzness.ecommerce.entity.enums.ProductStatus;
import com.ebizzness.ecommerce.entity.enums.ProductCategory;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepo productRepo;
    private final SellerRepo sellerRepo;

    @Override
    public ProductResponse createProduct(ProductRequest request) {

        Seller seller = sellerRepo.findById(request.getSellerId())
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found"));

        Product product = Product.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .price(request.getPrice())
                .status(request.getStatus() == null ? ProductStatus.AVAILABLE : request.getStatus())
                .courseCode(request.getCourseCode())
                .imageUrl(request.getImageUrl())
                .seller(seller)
                .build();

        return ProductMapper.toResponse(productRepo.save(product));
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepo.findAll()
                .stream()
                .map(ProductMapper::toResponse)
                .toList();
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        return ProductMapper.toResponse(product);
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setStatus(request.getStatus());
        product.setCourseCode(request.getCourseCode());
        product.setImageUrl(request.getImageUrl());

        return ProductMapper.toResponse(productRepo.save(product));
    }

    @Override
    public void deleteProduct(Long id) {
        if (!productRepo.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }

        productRepo.deleteById(id);
    }

    @Override
    public List<ProductResponse> searchProducts(String keyword, String category, String courseCode, String status) {
        if (keyword != null && !keyword.isBlank()) {
            return productRepo.findByTitleContainingIgnoreCase(keyword)
                    .stream()
                    .map(ProductMapper::toResponse)
                    .toList();
        }

        if (category != null && !category.isBlank()) {
            try {
                ProductCategory productCategory = ProductCategory.valueOf(category.toUpperCase());

                return productRepo.findByCategory(productCategory)
                        .stream()
                        .map(ProductMapper::toResponse)
                        .toList();

            } catch (IllegalArgumentException e) {
                return List.of();
            }
        }

        if (courseCode != null && !courseCode.isBlank()) {
            return productRepo.findByCourseCodeIgnoreCase(courseCode)
                    .stream()
                    .map(ProductMapper::toResponse)
                    .toList();
        }

        if (status != null && !status.isBlank()) {
            try {
                ProductStatus productStatus =
                        ProductStatus.valueOf(status.toUpperCase());

                return productRepo.findByStatus(productStatus)
                        .stream()
                        .map(ProductMapper::toResponse)
                        .toList();

            } catch (IllegalArgumentException e) {
                return List.of();
            }
        }
        return getAllProducts();
    }
}