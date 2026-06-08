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

    public UserResponse MaptoDto(User user, String activeRole, String token) {
        UserResponse dto = MaptoDto(user);
        dto.setActiveRole(activeRole);
        dto.setToken(token);
        return dto;
    }

}