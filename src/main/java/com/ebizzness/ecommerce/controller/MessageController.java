package com.ebizzness.ecommerce.controller;

import com.ebizzness.ecommerce.service.MessageService;
import com.ebizzness.ecommerce.model.Message;


import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(originPatterns = {"http://localhost:5173", "http://localhost:3000", "https://*.ngrok-free.dev", "https://*.ngrok-free.app"})
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // GET all messages
    @GetMapping
    public List<Message> getAllMessages() {
        return messageService.getAllMessages();
    }

    // GET messages by chat room ID
    @GetMapping("/chatroom/{roomId}")
    public List<Message> getMessagesByRoomId(@PathVariable Long roomId) {
        return messageService.getMessagesByRoomId(roomId);
    }

    // POST send message
    @PostMapping
    public Message sendMessage(@RequestBody Message message) {
        return messageService.sendMessage(message);
    }

    // DELETE message by ID
    @DeleteMapping("/{messageId}")
    public String deleteMessage(@PathVariable Long messageId) {
        messageService.deleteMessage(messageId);
        return "Message deleted successfully";
    }
}
