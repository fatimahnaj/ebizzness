package com.ebizzness.ecommerce.dto.request;

public class AdminUserUpdateRequest {
    private String name;
    private String email;
    private String mmuID;
    private String password;

    public AdminUserUpdateRequest() {
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getMmuID() {
        return mmuID;
    }

    public String getPassword() {
        return password;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setMmuID(String mmuID) {
        this.mmuID = mmuID;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}