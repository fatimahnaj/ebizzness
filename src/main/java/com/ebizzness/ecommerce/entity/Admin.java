package com.ebizzness.ecommerce.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "admin")
@PrimaryKeyJoinColumn(name = "admin_id") // Maps admin_id to user_id
public class Admin extends User {
    // Inherits everything cleanly from User
}