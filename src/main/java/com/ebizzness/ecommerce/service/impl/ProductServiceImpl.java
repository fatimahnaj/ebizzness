package com.ebizzness.ecommerce.service.impl;

import com.ebizzness.ecommerce.dto.request.ProductRequest;
import com.ebizzness.ecommerce.dto.response.ProductResponse;
import com.ebizzness.ecommerce.entity.Product;
import com.ebizzness.ecommerce.entity.Seller;
import com.ebizzness.ecommerce.entity.enums.ProductCategory;
import com.ebizzness.ecommerce.entity.enums.ProductStatus;
import com.ebizzness.ecommerce.exception.ResourceNotFoundException;
import com.ebizzness.ecommerce.mapper.ProductMapper;
import com.ebizzness.ecommerce.repository.ProductRepo;
import com.ebizzness.ecommerce.repository.ReviewRepository;
import com.ebizzness.ecommerce.repository.SellerRepo;
import com.ebizzness.ecommerce.service.ProductService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@AllArgsConstructor
@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepo productRepo;
    private final SellerRepo sellerRepo;
    private final ReviewRepository reviewRepository;

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        Seller seller = sellerRepo.findById(request.getSellerId())
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found"));

        Product product = Product.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .status(request.getQuantity() == 0 ? ProductStatus.SOLD : ProductStatus.AVAILABLE)
                .courseCode(request.getCourseCode())
                .imageUrl(request.getImageUrl())
                .seller(seller)
                .build();

        Product savedProduct = productRepo.save(product);
        return toResponseWithSellerRating(savedProduct);
    }

    @Override
    public List<ProductResponse> getAllProducts() {
        return productRepo.findAll()
                .stream()
                .filter(this::isFromActiveSeller)
                .map(this::toResponseWithSellerRating)
                .toList();
    }

    @Override
    public ProductResponse getProductById(Long id) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (!isFromActiveSeller(product)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }

        return toResponseWithSellerRating(product);
    }

    @Override
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        Seller seller = sellerRepo.findById(request.getSellerId())
                .orElseThrow(() -> new ResourceNotFoundException("Seller not found"));

        product.setTitle(request.getTitle());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setQuantity(request.getQuantity());
        product.setStatus(request.getQuantity() == 0 ? ProductStatus.SOLD : ProductStatus.AVAILABLE);
        product.setCourseCode(request.getCourseCode());
        product.setImageUrl(request.getImageUrl());
        product.setSeller(seller);

        Product savedProduct = productRepo.save(product);
        return toResponseWithSellerRating(savedProduct);
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
                    .filter(this::isFromActiveSeller)
                    .map(this::toResponseWithSellerRating)
                    .toList();
        }

        if (category != null && !category.isBlank()) {
            try {
                ProductCategory productCategory = ProductCategory.valueOf(category.toUpperCase());

                return productRepo.findByCategory(productCategory)
                        .stream()
                        .filter(this::isFromActiveSeller)
                        .map(this::toResponseWithSellerRating)
                        .toList();
            } catch (IllegalArgumentException e) {
                return List.of();
            }
        }

        if (courseCode != null && !courseCode.isBlank()) {
            return productRepo.findByCourseCodeIgnoreCase(courseCode)
                    .stream()
                    .filter(this::isFromActiveSeller)
                    .map(this::toResponseWithSellerRating)
                    .toList();
        }

        if (status != null && !status.isBlank()) {
            try {
                ProductStatus productStatus = ProductStatus.valueOf(status.toUpperCase());

                return productRepo.findByStatus(productStatus)
                        .stream()
                        .filter(this::isFromActiveSeller)
                        .map(this::toResponseWithSellerRating)
                        .toList();
            } catch (IllegalArgumentException e) {
                return List.of();
            }
        }

        return getAllProducts();
    }

    @Override
    public List<ProductResponse> getProductsBySeller(Long sellerId) {
        return productRepo.findBySellerUserID(sellerId)
                .stream()
                .filter(this::isFromActiveSeller)
                .map(this::toResponseWithSellerRating)
                .toList();
    }

    private ProductResponse toResponseWithSellerRating(Product product) {
        return ProductMapper.toResponse(product, getProductSellerRating(product));
    }

    private boolean isFromActiveSeller(Product product) {
        Seller seller = product.getSeller();
        return seller != null && !seller.isBanned();
    }

    private double getProductSellerRating(Product product) {
        if (product.getSeller() == null) {
            return 0.0;
        }

        return getSellerRating(product.getSeller().getUserID());
    }

    private double getSellerRating(Long sellerId) {
        return reviewRepository.findByProductSellerUserIDOrderByCreatedAtDesc(sellerId)
                .stream()
                .mapToInt(review -> review.getRating() == null ? 0 : review.getRating())
                .average()
                .orElse(0.0);
    }
}
