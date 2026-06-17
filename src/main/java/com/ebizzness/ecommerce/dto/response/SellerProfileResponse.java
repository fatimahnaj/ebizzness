package com.ebizzness.ecommerce.dto.response;

import java.util.List;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerProfileResponse {
    private Long sellerId;
    private String sellerName;
    private String email;
    private double trustScore;
    private List<ProductResponse> listings;
    private List<String> reviews;
}