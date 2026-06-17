package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.entity.Order;
import com.ebizzness.ecommerce.entity.Pickup;
import com.ebizzness.ecommerce.repository.PickupRepo;
import com.ebizzness.ecommerce.util.EncryptionUtil;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QRCodeService {

    private final PickupRepo pickupRepo;
    private final EncryptionUtil encryptionUtil;   // <-- Injected

    @Value("${qr.upload.dir:uploads/qrcodes}")
    private String uploadDir;

    public Pickup generateForOrder(Order order) throws WriterException, IOException {
        String manualCode = UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        // Use injected encryptionUtil
        String rawData = String.format("%d|%s", order.getOrderId(), manualCode);
        String encrypted = encryptionUtil.encrypt(rawData);
        String qrData = "https://ebizzness.com/pickup?data=" + encrypted;

        // Generate QR image
        Path dirPath = Paths.get(uploadDir);
        if (!Files.exists(dirPath)) Files.createDirectories(dirPath);

        String fileName = "qr_order_" + order.getOrderId() + ".png";
        Path filePath = dirPath.resolve(fileName);

        QRCodeWriter writer = new QRCodeWriter();
        BitMatrix matrix = writer.encode(qrData, BarcodeFormat.QR_CODE, 300, 300);
        MatrixToImageWriter.writeToPath(matrix, "PNG", filePath);

        Pickup pickup = Pickup.builder()
                .order(order)
                .qrCodeImagePath("/uploads/qrcodes/" + fileName)
                .manualCode(manualCode)
                .isScanned(false)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();
        return pickupRepo.save(pickup);
    }
}