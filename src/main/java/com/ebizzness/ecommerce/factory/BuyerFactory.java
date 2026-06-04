package com.ebizzness.ecommerce.factory;

import com.ebizzness.ecommerce.dto.request.RegisterRequest;
import com.ebizzness.ecommerce.entity.Buyer;
import com.ebizzness.ecommerce.entity.User;

public class BuyerFactory implements UserFactory {

    @Override
    public User createUser() {
        return new Buyer();
    }

    @Override
    public User createUser(RegisterRequest request) {
        Buyer buyer = new Buyer();
        buyer.setName(request.getName());
        buyer.setEmail(request.getEmail());
        buyer.setPassword(request.getPassword());
        buyer.setMmuID(request.getMmuID());
        buyer.setRole(request.getRole());
        return buyer;
    }
}
