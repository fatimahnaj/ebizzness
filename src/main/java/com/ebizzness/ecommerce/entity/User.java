package com.ebizzness.ecommerce.entity;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class User {
    //atributes
    private String userID;
    private String name;
    private String email;
    private String password;
    private String mmuID;

    //concrete method
    //abstract void display()
}
