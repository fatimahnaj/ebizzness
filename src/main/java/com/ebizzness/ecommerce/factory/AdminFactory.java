package com.ebizzness.ecommerce.factory;

import com.ebizzness.ecommerce.dto.request.RegisterRequest;
import com.ebizzness.ecommerce.entity.Admin;
import com.ebizzness.ecommerce.entity.User;

public class AdminFactory implements UserFactory {

    @Override
    public User createUser() {
        return new Admin();
    }

    @Override
    public User createUser(RegisterRequest request) {
        Admin admin = new Admin();
        admin.setName(request.getName());
        admin.setEmail(request.getEmail());
        admin.setPassword(request.getPassword());
        admin.setMmuID(request.getMmuID());
        admin.setRole(request.getRole());
        return admin;
    }
}
