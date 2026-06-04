package com.ebizzness.ecommerce.mapper;

import org.springframework.stereotype.Component;

import com.ebizzness.ecommerce.dto.response.UserResponse;
import com.ebizzness.ecommerce.entity.User;

@Component
public class UserMapper {

    // Maps Entity to Outgoing DTO (Used after Registration / Login / Profile Fetch)
    public UserResponse MaptoDto(User user) {
        if (user == null) {
            return null;
        }
        
        UserResponse dto = new UserResponse();
        dto.setUserID(user.getUserID());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setMmuID(user.getMmuID());
        dto.setRole(user.getRole());
        return dto;
    }

}