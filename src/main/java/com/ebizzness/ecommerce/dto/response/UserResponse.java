package com.ebizzness.ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long userID;
    private String name;
    private String email;
    private String mmuID;
    private String role;
    private String activeRole;
    private Boolean hasSellerProfile;
    private String currentView;
    private String token;
}
