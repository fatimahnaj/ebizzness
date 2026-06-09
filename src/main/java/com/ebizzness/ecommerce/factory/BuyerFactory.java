package com.ebizzness.ecommerce.factory;

import com.ebizzness.ecommerce.dto.request.BuyerRegisterRequest;
import com.ebizzness.ecommerce.entity.Buyer;
import com.ebizzness.ecommerce.entity.User;
import org.springframework.stereotype.Component;

@Component
public class BuyerFactory {

    public User createUser(BuyerRegisterRequest request) {
        Buyer buyer = new Buyer();
        buyer.setName(request.getName());
        buyer.setEmail(request.getEmail());
        buyer.setPassword(request.getPassword());
        buyer.setMmuID(request.getMmuID());
        buyer.setRole("BUYER");
        return buyer;
    }
}
