package com.ebizzness.ecommerce.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("SELLER")
public class Seller extends User {
    
}
