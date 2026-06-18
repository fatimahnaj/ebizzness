package com.ebizzness.ecommerce.observer;

import com.ebizzness.ecommerce.entity.Buyer;
import com.ebizzness.ecommerce.event.MessageSentEvent;
import com.ebizzness.ecommerce.model.Message;
import com.ebizzness.ecommerce.repository.UserRepo;
import com.ebizzness.ecommerce.service.NotificationService;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MessageNotificationObserverTest {

    @Test
    void onMessageSentCreatesNotificationForReceiver() {
        NotificationService notificationService = mock(NotificationService.class);
        UserRepo userRepo = mock(UserRepo.class);
        MessageNotificationObserver observer =
                new MessageNotificationObserver(notificationService, userRepo);

        Buyer sender = new Buyer();
        sender.setName("Selam Codes");

        Message message = new Message();
        message.setSenderId(1L);
        message.setReceiverId(2L);

        when(userRepo.findById(1L)).thenReturn(Optional.of(sender));

        observer.onMessageSent(new MessageSentEvent(message));

        verify(notificationService).createNotification(
                2L,
                "You received a new message from Selam"
        );
    }
}
