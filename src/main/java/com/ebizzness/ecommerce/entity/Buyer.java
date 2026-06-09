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
@Table(name = "buyer")
@PrimaryKeyJoinColumn(name = "buyer_id") // Maps buyer_id in this table to user_id in the USER table
public class Buyer extends User {

    @Column(name = "is_banned")
    private boolean isBanned;
}