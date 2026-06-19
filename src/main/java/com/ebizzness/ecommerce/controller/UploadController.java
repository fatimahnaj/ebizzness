package com.ebizzness.ecommerce.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;


@RestController
@RequestMapping("/api/upload")
@CrossOrigin(originPatterns = {"http://localhost:5173", "https://*.ngrok-free.dev", "https://*.ngrok-free.app"})

public class UploadController {

        private static final String UPLOAD_DIR = "uploads/products";

        @PostMapping
        public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) throws Exception {

                Path uploadPath = Paths.get(UPLOAD_DIR);

                if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                }

                String originalFilename = file.getOriginalFilename();
                String filename = UUID.randomUUID() + "_" + originalFilename;

                Path filePath = uploadPath.resolve(filename);
                System.out.println("UPLOAD PATH: " + filePath);

                Files.copy(
                file.getInputStream(),
                filePath,
                java.nio.file.StandardCopyOption.REPLACE_EXISTING
                );

                return ResponseEntity.ok("/uploads/products/" + filename);
        }
}
