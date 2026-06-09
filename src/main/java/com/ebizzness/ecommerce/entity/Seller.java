package com.ebizzness.ecommerce.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.PrimaryKeyJoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "seller")
@PrimaryKeyJoinColumn(name = "seller_id") // Maps seller_id to user_id
public class Seller extends User {

    @Column(name = "is_banned")
    private boolean isBanned;

    @Column(name = "trust_score")
    private double trustScore;
}