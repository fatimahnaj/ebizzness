package com.ebizzness.ecommerce.controller;

import com.ebizzness.ecommerce.dto.request.CreateChatRoomRequest;
import com.ebizzness.ecommerce.entity.User;
import com.ebizzness.ecommerce.model.ChatParticipant;
import com.ebizzness.ecommerce.model.ChatRoom;
import com.ebizzness.ecommerce.repository.ChatParticipantRepository;
import com.ebizzness.ecommerce.repository.ChatRoomRepository;
import com.ebizzness.ecommerce.repository.UserRepo;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chatrooms")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatRoomController {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final UserRepo userRepo;

    public ChatRoomController(
            ChatRoomRepository chatRoomRepository,
            ChatParticipantRepository chatParticipantRepository,
            UserRepo userRepo
    ) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatParticipantRepository = chatParticipantRepository;
        this.userRepo = userRepo;
    }

    @PostMapping("/start")
    public ChatRoom startChatRoom(@RequestBody CreateChatRoomRequest request) {
        User user1 = userRepo.findById(request.getUser1Id())
                .orElseThrow(() -> new RuntimeException("User 1 not found"));

        User user2 = userRepo.findById(request.getUser2Id())
                .orElseThrow(() -> new RuntimeException("User 2 not found"));

        ChatRoom chatRoom = new ChatRoom();
        ChatRoom savedRoom = chatRoomRepository.save(chatRoom);

        chatParticipantRepository.save(new ChatParticipant(savedRoom, user1));
        chatParticipantRepository.save(new ChatParticipant(savedRoom, user2));

        return savedRoom;
    }

    @GetMapping("/user/{userId}")
    public List<ChatParticipant> getChatRoomsByUser(@PathVariable Long userId) {
        return chatParticipantRepository.findByUserUserID(userId);
    }

    @GetMapping("/{roomId}/participants")
    public List<ChatParticipant> getParticipantsByRoom(@PathVariable Long roomId) {
        return chatParticipantRepository.findByChatRoomChatRoomId(roomId);
    }
}