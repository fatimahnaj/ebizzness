package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.entity.User;
import com.ebizzness.ecommerce.model.Message;
import com.ebizzness.ecommerce.repository.MessageRepository;
import com.ebizzness.ecommerce.repository.UserRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final NotificationService notificationService;
    private final UserRepo userRepo;

    public MessageService(
            MessageRepository messageRepository,
            NotificationService notificationService,
            UserRepo userRepo
    ) {
        this.messageRepository = messageRepository;
        this.notificationService = notificationService;
        this.userRepo = userRepo;
    }

    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }

    public List<Message> getMessagesByRoomId(Long roomId) {
        return messageRepository.findByRoomId(roomId);
    }

    public Message sendMessage(Message message) {
        if (message.getContent() == null || message.getContent().isBlank()) {
            throw new RuntimeException("Message content cannot be empty");
        }

        if (message.getSenderId() == null) {
            throw new RuntimeException("Sender ID cannot be empty");
        }

        if (message.getReceiverId() == null) {
            throw new RuntimeException("Receiver ID cannot be empty");
        }

        if (message.getRoomId() == null) {
            throw new RuntimeException("Room ID cannot be empty");
        }

        message.setSentAt(LocalDateTime.now());

        Message savedMessage = messageRepository.save(message);

        String senderName = userRepo.findById(message.getSenderId())
            .map(User::getName)
            .map(name -> name.trim().split("\\s+")[0])
            .orElse("Unknown user");

        notificationService.createNotification(
                message.getReceiverId(),
                "You received a new message from " + senderName
        );

        return savedMessage;
    }

    public void deleteMessage(Long messageId) {
        messageRepository.deleteById(messageId);
    }
}
