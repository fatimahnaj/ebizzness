package com.ebizzness.ecommerce.service;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class SessionInfo {
    private Long userId;
    private String activeRole;
}
