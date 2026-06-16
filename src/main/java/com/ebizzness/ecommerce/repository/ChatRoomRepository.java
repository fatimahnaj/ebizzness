package com.ebizzness.ecommerce.repository;

import com.ebizzness.ecommerce.model.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
}