package com.ebizzness.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "pickup")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pickup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pickupId;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    private String qrCodeImagePath;   // server path or URL
    private String manualCode;        // 6‑character backup code
    private boolean isScanned;
    private LocalDateTime scannedAt;
    private LocalDateTime expiresAt;

    @CreationTimestamp
    private LocalDateTime generatedAt;
}