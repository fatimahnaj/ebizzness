package com.ebizzness.ecommerce.dto.request;

import com.ebizzness.ecommerce.entity.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {
    private PaymentMethod paymentMethod;
}