package com.ebizzness.ecommerce.factory;

import org.springframework.stereotype.Component;

import com.ebizzness.ecommerce.dto.request.SellerRegisterRequest;
import com.ebizzness.ecommerce.entity.Seller;
import com.ebizzness.ecommerce.entity.User;

@Component
public class SellerFactory {

    public User createUser(SellerRegisterRequest request) {
        Seller seller = new Seller();
        seller.setName(request.getName());
        seller.setEmail(request.getEmail());
        seller.setPassword(request.getPassword());
        seller.setMmuID(request.getMmuID());
        seller.setRole("SELLER");
        return seller;
    }
}
