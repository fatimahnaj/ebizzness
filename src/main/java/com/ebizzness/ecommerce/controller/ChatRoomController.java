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
@CrossOrigin(originPatterns = {"http://localhost:5173", "https://*.ngrok-free.dev", "https://*.ngrok-free.app"})
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
        Long user1Id = request.getUser1Id();
        Long user2Id = request.getUser2Id();

        if (user1Id == null || user2Id == null) {
            throw new RuntimeException("Both user IDs are required");
        }

        if (user1Id.equals(user2Id)) {
            throw new RuntimeException("Cannot create chat room with yourself");
        }

        User user1 = userRepo.findById(user1Id)
                .orElseThrow(() -> new RuntimeException("User 1 not found"));

        User user2 = userRepo.findById(user2Id)
                .orElseThrow(() -> new RuntimeException("User 2 not found"));

        /*
         * Check if these two users already have a chat room.
         * If yes, return the existing room instead of creating another one.
         */
        List<ChatParticipant> user1ChatRooms =
                chatParticipantRepository.findByUserUserID(user1Id);

        for (ChatParticipant participant : user1ChatRooms) {
            Long roomId = participant.getChatRoom().getChatRoomId();

            boolean user2AlreadyInRoom =
                    chatParticipantRepository.existsByChatRoomChatRoomIdAndUserUserID(
                            roomId,
                            user2Id
                    );

            if (user2AlreadyInRoom) {
                return participant.getChatRoom();
            }
        }

        /*
         * If no existing room is found, create a new room.
         */
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
