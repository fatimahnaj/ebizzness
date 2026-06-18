package com.ebizzness.ecommerce.event;

import com.ebizzness.ecommerce.model.Message;

public class MessageSentEvent {

    private final Message message;

    public MessageSentEvent(Message message) {
        this.message = message;
    }

    public Message getMessage() {
        return message;
    }
}
