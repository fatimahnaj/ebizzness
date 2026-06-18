package com.ebizzness.ecommerce.controller;

import com.ebizzness.ecommerce.model.Notification;
import com.ebizzness.ecommerce.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "https://v7dj1qmx-5173.asse.devtunnels.ms"})
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationService.getAllNotifications();
    }

    @GetMapping("/user/{recipientId}")
    public List<Notification> getNotificationsByRecipientId(@PathVariable Long recipientId) {
        return notificationService.getNotificationsByRecipientId(recipientId);
    }

    @PutMapping("/{notificationId}/read")
    public Notification markNotificationAsRead(@PathVariable Long notificationId) {
        return notificationService.markAsRead(notificationId);
    }
}
