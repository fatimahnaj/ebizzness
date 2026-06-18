package com.ebizzness.ecommerce.dto;

public class AdminUserDTO {
    private Long userID;
    private String name;
    private String email;
    private String mmuID;
    private String role;
    private Boolean banned;

    public AdminUserDTO() {
    }

    public AdminUserDTO(Long userID, String name, String email, String mmuID, String role, Boolean banned) {
        this.userID = userID;
        this.name = name;
        this.email = email;
        this.mmuID = mmuID;
        this.role = role;
        this.banned = banned;
    }

    public Long getUserID() {
        return userID;
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

    public String getRole() {
        return role;
    }

    public Boolean getBanned() {
        return banned;
    }

    public void setUserID(Long userID) {
        this.userID = userID;
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

    public void setRole(String role) {
        this.role = role;
    }

    public void setBanned(Boolean banned) {
        this.banned = banned;
    }
}
