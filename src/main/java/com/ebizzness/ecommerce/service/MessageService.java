package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.event.MessageSentEvent;
import com.ebizzness.ecommerce.model.Message;
import com.ebizzness.ecommerce.repository.MessageRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final ApplicationEventPublisher eventPublisher;

    public MessageService(
            MessageRepository messageRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.messageRepository = messageRepository;
        this.eventPublisher = eventPublisher;
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

        eventPublisher.publishEvent(new MessageSentEvent(savedMessage));

        return savedMessage;
    }

    public void deleteMessage(Long messageId) {
        messageRepository.deleteById(messageId);
    }
}
