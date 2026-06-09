package com.ebizzness.ecommerce.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "user")
@Inheritance(strategy = InheritanceType.JOINED) // Tells Hibernate to use separate tables linked by FK
public abstract class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userID; // This is the ONLY @Id field for the entire hierarchy

    @Column(name="name")
    private String name;

    @Column(name="email", nullable=false, unique=true)
    private String email;

    @Column(name="password")
    private String password;

    @Column(name="mmu_id")
    private String mmuID;

    @Column(name="role")
    private String role;
}