package com.ebizzness.ecommerce.repository;

import com.ebizzness.ecommerce.model.ChatParticipant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {

    List<ChatParticipant> findByUserUserID(Long userId);

    List<ChatParticipant> findByChatRoomChatRoomId(Long chatRoomId);

    boolean existsByChatRoomChatRoomIdAndUserUserID(Long chatRoomId, Long userId);
}