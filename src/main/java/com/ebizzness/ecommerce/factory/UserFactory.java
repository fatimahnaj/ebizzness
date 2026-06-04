package com.ebizzness.ecommerce.factory;

import com.ebizzness.ecommerce.dto.request.RegisterRequest;
import com.ebizzness.ecommerce.entity.User;

public interface UserFactory {
    User createUser();

    User createUser(RegisterRequest request);
}
