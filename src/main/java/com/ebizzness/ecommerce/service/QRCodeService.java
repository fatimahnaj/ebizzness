package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.entity.Order;
import com.ebizzness.ecommerce.entity.Pickup;
import com.ebizzness.ecommerce.repository.PickupRepo;
import com.ebizzness.ecommerce.util.EncryptionUtil;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class QRCodeService {

    private final PickupRepo pickupRepo;

    @Value("${qr.upload.dir:uploads/qrcodes}")
    private String uploadDir;


    public Pickup generateForOrder(Order order) throws Exception {
        // Prepare payload: orderId|productId|buyerId|expiryTimestamp
        // We need the product ID – get from first order item or store directly in Order
        Long productId = order.getItems().isEmpty() ? null : order.getItems().get(0).getProduct().getProductId();
        if (productId == null) throw new RuntimeException("Order has no items - cannot generate QR");

        long expiryEpoch = LocalDateTime.now().plusDays(7).toEpochSecond(java.time.ZoneOffset.UTC);
        String rawData = String.format("%d|%d|%d|%d",
                order.getOrderId(),
                productId,
                order.getBuyer().getUserID(),
                expiryEpoch
        );

        // Encrypt the data
        String encrypted = EncryptionUtil.encrypt(rawData);

        // QR code data – include a prefix to differentiate
        String qrData = "https://ebizzness.com/pickup?data=" + encrypted;

        // Generate QR image
        Path dirPath = Paths.get(uploadDir);
        if (!Files.exists(dirPath)) Files.createDirectories(dirPath);

        String fileName = "qr_order_" + order.getOrderId() + ".png";
        Path filePath = dirPath.resolve(fileName);

        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix matrix = writer.encode(qrData, BarcodeFormat.QR_CODE, 300, 300);
        MatrixToImageWriter.writeToPath(matrix, "PNG", filePath);

        // Save to Pickup entity (optional, but useful for tracking)
        Pickup pickup = Pickup.builder()
                .order(order)
                .qrCodeImagePath("/uploads/qrcodes/" + fileName)
                .manualCode(null)   // manual code not needed if using encrypted payload
                .isScanned(false)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        return pickupRepo.save(pickup);
    }
}