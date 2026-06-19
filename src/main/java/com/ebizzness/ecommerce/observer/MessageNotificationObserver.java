package com.ebizzness.ecommerce.observer;

import com.ebizzness.ecommerce.entity.User;
import com.ebizzness.ecommerce.event.MessageSentEvent;
import com.ebizzness.ecommerce.model.Message;
import com.ebizzness.ecommerce.repository.UserRepo;
import com.ebizzness.ecommerce.service.NotificationService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class MessageNotificationObserver {

    private final NotificationService notificationService;
    private final UserRepo userRepo;

    public MessageNotificationObserver(
            NotificationService notificationService,
            UserRepo userRepo
    ) {
        this.notificationService = notificationService;
        this.userRepo = userRepo;
    }

    @EventListener
    public void onMessageSent(MessageSentEvent event) {
        Message message = event.getMessage();

        String senderName = userRepo.findById(message.getSenderId())
                .map(User::getName)
                .map(name -> name.trim().split("\\s+")[0])
                .orElse("Unknown user");

        notificationService.createNotification(
                message.getReceiverId(),
                "You received a new message from " + senderName
        );
    }
}
