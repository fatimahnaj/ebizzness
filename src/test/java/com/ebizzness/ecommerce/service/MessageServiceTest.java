package com.ebizzness.ecommerce.service;

import com.ebizzness.ecommerce.event.MessageSentEvent;
import com.ebizzness.ecommerce.model.Message;
import com.ebizzness.ecommerce.repository.MessageRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.context.ApplicationEventPublisher;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MessageServiceTest {

    @Test
    void sendMessagePublishesMessageSentEvent() {
        MessageRepository messageRepository = mock(MessageRepository.class);
        ApplicationEventPublisher eventPublisher = mock(ApplicationEventPublisher.class);
        MessageService messageService = new MessageService(messageRepository, eventPublisher);

        Message message = new Message();
        message.setRoomId(10L);
        message.setSenderId(1L);
        message.setReceiverId(2L);
        message.setContent("Hello");

        Message savedMessage = new Message();
        savedMessage.setMessageId(99L);
        savedMessage.setRoomId(message.getRoomId());
        savedMessage.setSenderId(message.getSenderId());
        savedMessage.setReceiverId(message.getReceiverId());
        savedMessage.setContent(message.getContent());

        when(messageRepository.save(message)).thenReturn(savedMessage);

        Message result = messageService.sendMessage(message);

        assertSame(savedMessage, result);

        ArgumentCaptor<Object> eventCaptor = ArgumentCaptor.forClass(Object.class);
        verify(eventPublisher).publishEvent(eventCaptor.capture());

        MessageSentEvent event = assertInstanceOf(MessageSentEvent.class, eventCaptor.getValue());
        assertSame(savedMessage, event.getMessage());
    }
}
