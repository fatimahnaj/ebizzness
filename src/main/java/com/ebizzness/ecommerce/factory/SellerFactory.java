package com.ebizzness.ecommerce.factory;

import com.ebizzness.ecommerce.dto.request.RegisterRequest;
import com.ebizzness.ecommerce.entity.Seller;
import com.ebizzness.ecommerce.entity.User;

public class SellerFactory implements UserFactory {

    @Override
    public User createUser() {
        return new Seller();
    }

    @Override
    public User createUser(RegisterRequest request) {
        Seller seller = new Seller();
        seller.setName(request.getName());
        seller.setEmail(request.getEmail());
        seller.setPassword(request.getPassword());
        seller.setMmuID(request.getMmuID());
        seller.setRole(request.getRole());
        return seller;
    }
}
