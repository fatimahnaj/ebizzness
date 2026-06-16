package com.ebizzness.ecommerce.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PickupConfirmRequest {
    private String encryptedData;   // instead of manualCode
}