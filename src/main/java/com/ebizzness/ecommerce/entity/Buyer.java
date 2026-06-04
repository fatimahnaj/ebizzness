package com.ebizzness.ecommerce.entity;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;

@Entity
@DiscriminatorValue("BUYER")
public class Buyer extends User {
    
}
