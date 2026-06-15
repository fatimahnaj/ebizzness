// src/components/ChatPage.jsx

import React, { useEffect, useRef, useState } from "react";
import authService from "../services/authService";

function ChatPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef(null);

  const getUserId = (user) => {
    return user?.userID || user?.userId || user?.id;
  };

  const getRoomId = (roomItem) => {
    return (
      roomItem?.chatRoom?.chatRoomId ||
      roomItem?.chatRoom?.chat_room_id ||
      roomItem?.chatRoomId ||
      roomItem?.roomId
    );
  };

  const getMessageSenderId = (message) => {
    return (
      message?.senderId ||
      message?.sender_id ||
      message?.sender?.userID ||
      message?.sender?.userId ||
      message?.sender?.id
    );
  };

  const loadProfile = async () => {
    try {
      const data = await authService.getProfile();
      setCurrentUser(data);

      const userId = getUserId(data);

      if (userId) {
        loadChatRooms(userId);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadChatRooms = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/chatrooms/user/${userId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load chat rooms");
      }

      const data = await response.json();
      const rooms = Array.isArray(data) ? data : [];

      setChatRooms(rooms);

      if (rooms.length > 0 && !selectedRoomId) {
        const firstRoomId = getRoomId(rooms[0]);
        setSelectedRoomId(firstRoomId);
      }
    } catch (error) {
      console.error("Error loading chat rooms:", error);
      setChatRooms([]);
    }
  };

  const loadParticipants = async (roomId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/chatrooms/${roomId}/participants`
      );

      if (!response.ok) {
        throw new Error("Failed to load participants");
      }

      const data = await response.json();
      setParticipants(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading participants:", error);
      setParticipants([]);
    }
  };

  const loadMessages = async (roomId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/messages/chatroom/${roomId}`
      );

      if (!response.ok) {
        throw new Error("Failed to load messages");
      }

      const data = await response.json();

      const sortedMessages = Array.isArray(data)
        ? [...data].sort((a, b) => {
            const dateA = new Date(a.sentAt || a.sent_at).getTime();
            const dateB = new Date(b.sentAt || b.sent_at).getTime();

            return dateA - dateB;
          })
        : [];

      setMessages(sortedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    }
  };

  const getReceiverId = () => {
    const currentUserId = Number(getUserId(currentUser));

    const otherParticipant = participants.find((participant) => {
      const participantUserId = Number(
        participant?.user?.userID ||
          participant?.user?.userId ||
          participant?.user?.id ||
          participant?.userId
      );

      return participantUserId !== currentUserId;
    });

    return (
      otherParticipant?.user?.userID ||
      otherParticipant?.user?.userId ||
      otherParticipant?.user?.id ||
      otherParticipant?.userId
    );
  };

  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(roomId);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    const senderId = getUserId(currentUser);
    const receiverId = getReceiverId();

    if (!selectedRoomId) {
      alert("No chat room selected.");
      return;
    }

    if (!senderId) {
      alert("Logged-in user ID not found.");
      return;
    }

    if (!receiverId) {
      alert("Receiver ID not found.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          roomId: selectedRoomId,
          senderId: senderId,
          receiverId: receiverId,
          content: newMessage
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setNewMessage("");
      loadMessages(selectedRoomId);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth"
      });
    }, 100);
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      loadParticipants(selectedRoomId);
      loadMessages(selectedRoomId);
    }
  }, [selectedRoomId]);

  useEffect(() => {
    if (!selectedRoomId) return;

    const interval = setInterval(() => {
      loadMessages(selectedRoomId);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedRoomId]);

  const loggedInUserId = getUserId(currentUser);

  return (
    <div className="chat-page">
      <h2 className="chat-title">Messages</h2>

      <div className="chat-layout">
        <div className="inbox">
          <div className="inbox-header">
            Inbox <span className="count-pill">{chatRooms.length}</span>
          </div>

          {chatRooms.length === 0 ? (
            <div className="empty-card">No chat rooms yet.</div>
          ) : (
            chatRooms.map((roomItem) => {
              const roomId = getRoomId(roomItem);

              return (
                <div
                  key={roomId}
                  className={
                    Number(roomId) === Number(selectedRoomId)
                      ? "thread active"
                      : "thread"
                  }
                  onClick={() => handleSelectRoom(roomId)}
                >
                  <div className="thread-avatar">AJ</div>

                  <div className="thread-info">
                    <div className="thread-top">
                      <strong>Chat Room #{roomId}</strong>
                      <span>Now</span>
                    </div>

                    <p>Logged in as User #{loggedInUserId || "..."}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="chat-main">
          <div className="chat-header">
            <div className="small-avatar">AJ</div>

            <div>
              <div className="chat-header-name">
                {selectedRoomId
                  ? `Chat Room #${selectedRoomId}`
                  : "No chat selected"}
              </div>

              <div className="online">
                Connected as User #{loggedInUserId || "..."}
              </div>
            </div>

            <div className="chat-product">Real MySQL Messages</div>
          </div>

          <div className="messages-area">
            {messages.length === 0 ? (
              <p style={{ textAlign: "center", color: "#777" }}>
                No messages yet.
              </p>
            ) : (
              messages.map((message, index) => {
                const senderId = getMessageSenderId(message);
                const isMine = Number(senderId) === Number(loggedInUserId);

                const currentMessageDate = getMessageDate(message);
                const previousMessageDate =
                  index > 0 ? getMessageDate(messages[index - 1]) : null;

                const showDateLabel =
                  !previousMessageDate ||
                  currentMessageDate.toDateString() !==
                    previousMessageDate.toDateString();

                return (
                  <React.Fragment key={message.messageId || message.message_id}>
                    {showDateLabel && (
                      <div className="date-separator">
                        {formatDateLabel(currentMessageDate)}
                      </div>
                    )}

                    <div className={isMine ? "msg-row mine" : "msg-row"}>
                      <div className="small-avatar">
                        {isMine ? "ME" : "U"}
                      </div>

                      <div>
                        <div
                          className={isMine ? "msg mine-msg" : "msg other-msg"}
                        >
                          {message.content}
                        </div>

                        <div
                          className={isMine ? "msg-time right" : "msg-time"}
                        >
                          {formatTime(message.sentAt || message.sent_at)}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={!selectedRoomId}
            />

            <button
              type="submit"
              className="send-btn"
              disabled={!selectedRoomId}
            >
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function getMessageDate(message) {
  const dateTime = message.sentAt || message.sent_at;

  if (!dateTime) {
    return new Date();
  }

  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

function formatTime(dateTime) {
  if (!dateTime) return "";

  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDateLabel(date) {
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export default ChatPage;
