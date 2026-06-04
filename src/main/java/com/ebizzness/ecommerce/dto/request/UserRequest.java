package com.ebizzness.ecommerce.dto.request;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {
    private Long userID;
    private String name;
    private String email;
    private String mmuID;
    private String role;
}
