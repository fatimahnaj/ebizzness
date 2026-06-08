package com.ebizzness.ecommerce.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SellerRegisterRequest {
    private String name;
    private String email;
    private String password;
    private String mmuID;
}
