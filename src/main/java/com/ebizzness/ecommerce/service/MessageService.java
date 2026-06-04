package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.model.Message;
import com.ebizzness.ecommerce.repository.MessageRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final NotificationService notificationService;

    public MessageService(
            MessageRepository messageRepository,
            NotificationService notificationService
    ) {
        this.messageRepository = messageRepository;
        this.notificationService = notificationService;
    }

    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    public List<Message> getMessagesByRoomId(Long roomId) {
        return messageRepository.findByRoomId(roomId);
    }

    public Message sendMessage(Message message) {
        message.setSentAt(LocalDateTime.now());

        Message savedMessage = messageRepository.save(message);

        notificationService.createNotification(
                message.getReceiverId(),
                "You received a new message from user " + message.getSenderId()
        );

        if (message.getContent() == null || message.getContent().isBlank()) {
            throw new RuntimeException("Message content cannot be empty");
        }

        return savedMessage;
    }

    public void deleteMessage(Long messageId) {
        messageRepository.deleteById(messageId);
    }
}