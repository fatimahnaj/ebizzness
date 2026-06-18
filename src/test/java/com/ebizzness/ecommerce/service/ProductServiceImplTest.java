package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.dto.response.ProductResponse;
import com.ebizzness.ecommerce.entity.Product;
import com.ebizzness.ecommerce.entity.Seller;
import com.ebizzness.ecommerce.entity.enums.ProductStatus;
import com.ebizzness.ecommerce.repository.ProductRepo;
import com.ebizzness.ecommerce.repository.ReviewRepository;
import com.ebizzness.ecommerce.repository.SellerRepo;
import com.ebizzness.ecommerce.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ProductServiceImplTest {

    @Test
    void getAllProductsDoesNotReturnProductsFromBannedSellers() {
        ProductRepo productRepo = mock(ProductRepo.class);
        SellerRepo sellerRepo = mock(SellerRepo.class);
        ReviewRepository reviewRepository = mock(ReviewRepository.class);
        ProductServiceImpl productService =
                new ProductServiceImpl(productRepo, sellerRepo, reviewRepository);

        Seller activeSeller = new Seller();
        activeSeller.setUserID(1L);
        activeSeller.setName("Active Seller");
        activeSeller.setBanned(false);

        Product visibleProduct = new Product();
        visibleProduct.setProductId(10L);
        visibleProduct.setTitle("Visible Product");
        visibleProduct.setStatus(ProductStatus.AVAILABLE);
        visibleProduct.setSeller(activeSeller);

        Seller bannedSeller = new Seller();
        bannedSeller.setUserID(2L);
        bannedSeller.setName("Banned Seller");
        bannedSeller.setBanned(true);

        Product hiddenProduct = new Product();
        hiddenProduct.setProductId(20L);
        hiddenProduct.setTitle("Hidden Product");
        hiddenProduct.setStatus(ProductStatus.AVAILABLE);
        hiddenProduct.setSeller(bannedSeller);

        when(productRepo.findAll()).thenReturn(List.of(visibleProduct, hiddenProduct));
        when(reviewRepository.findByProductSellerUserIDOrderByCreatedAtDesc(1L))
                .thenReturn(List.of());

        List<ProductResponse> products = productService.getAllProducts();

        assertEquals(1, products.size());
        assertEquals(10L, products.get(0).getProductId());
    }

    @Test
    void getProductByIdForAdminReturnsProductFromBannedSeller() {
        ProductRepo productRepo = mock(ProductRepo.class);
        SellerRepo sellerRepo = mock(SellerRepo.class);
        ReviewRepository reviewRepository = mock(ReviewRepository.class);
        ProductServiceImpl productService =
                new ProductServiceImpl(productRepo, sellerRepo, reviewRepository);

        Seller bannedSeller = new Seller();
        bannedSeller.setUserID(2L);
        bannedSeller.setName("Banned Seller");
        bannedSeller.setBanned(true);

        Product hiddenProduct = new Product();
        hiddenProduct.setProductId(20L);
        hiddenProduct.setTitle("Hidden Product");
        hiddenProduct.setStatus(ProductStatus.REMOVED);
        hiddenProduct.setSeller(bannedSeller);

        when(productRepo.findById(20L)).thenReturn(Optional.of(hiddenProduct));
        when(reviewRepository.findByProductSellerUserIDOrderByCreatedAtDesc(2L))
                .thenReturn(List.of());

        ProductResponse response = productService.getProductByIdForAdmin(20L);

        assertEquals(20L, response.getProductId());
        assertEquals("Hidden Product", response.getTitle());
        assertEquals(2L, response.getSellerId());
    }
}
