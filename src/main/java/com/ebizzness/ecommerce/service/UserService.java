package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.dto.request.SwitchRoleRequest;
import com.ebizzness.ecommerce.dto.request.UpgradeToSellerRequest;
import com.ebizzness.ecommerce.dto.response.UserResponse;

public interface UserService {
    UserResponse upgradeToSeller(String authorizationHeader, UpgradeToSellerRequest request);
    UserResponse switchRole(String authorizationHeader, SwitchRoleRequest request);
    UserResponse getProfile(String authorizationHeader);
}
