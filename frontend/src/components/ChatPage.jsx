// src/components/ChatPage.jsx

import React, { useEffect, useRef, useState } from "react";
import authService from "../services/authService";


function ChatPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [chatRooms, setChatRooms] = useState([]);
  const [roomDetails, setRoomDetails] = useState({});
  const [selectedRoomId, setSelectedRoomId] = useState(() => {
    const savedRoomId =
      sessionStorage.getItem("selectedChatRoomId") ||
      localStorage.getItem("selectedChatRoomId");

    return savedRoomId ? Number(savedRoomId) : null;
  });
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const messagesAreaRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const scrollBehaviorRef = useRef("auto");

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

  const getParticipantUser = (participant) => {
    return participant?.user || participant;
  };

  const getParticipantUserId = (participant) => {
    const user = getParticipantUser(participant);

    return (
      user?.userID ||
      user?.userId ||
      user?.id ||
      participant?.userId ||
      participant?.user_id
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

  const getOtherUserFromParticipants = (participantList, loggedInUserId) => {
    const otherParticipant = participantList.find((participant) => {
      const participantUserId = Number(getParticipantUserId(participant));
      return participantUserId !== Number(loggedInUserId);
    });

    return getParticipantUser(otherParticipant);
  };

  const getOtherUserForRoom = (roomId) => {
    const selectedOtherUser = getOtherUserFromParticipants(
      participants,
      getUserId(currentUser)
    );

    if (selectedOtherUser && Number(roomId) === Number(selectedRoomId)) {
      return selectedOtherUser;
    }

    return roomDetails[roomId]?.otherUser;
  };

  const getRoomDisplayName = (roomId) => {
    const otherUser = getOtherUserForRoom(roomId);

    return (
      otherUser?.name ||
      otherUser?.email ||
      `Chat Room #${roomId}`
    );
  };

  const getRoomDisplaySubtitle = (roomId) => {
    const otherUser = getOtherUserForRoom(roomId);

    if (otherUser?.email) {
      return otherUser.email;
    }

    if (otherUser?.userID || otherUser?.userId || otherUser?.id) {
      return `User #${getUserId(otherUser)}`;
    }

    return `Room #${roomId}`;
  };

  const getInitials = (name) => {
    if (!name) return "U";

    const parts = name.trim().split(" ");

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[0].charAt(0).toUpperCase() +
      parts[1].charAt(0).toUpperCase()
    );
  };

  const isNearBottom = () => {
    const messagesArea = messagesAreaRef.current;

    if (!messagesArea) {
      return true;
    }

    const distanceFromBottom =
      messagesArea.scrollHeight -
      messagesArea.scrollTop -
      messagesArea.clientHeight;

    return distanceFromBottom < 80;
  };

  const requestScrollToBottom = (behavior = "auto") => {
    shouldAutoScrollRef.current = true;
    scrollBehaviorRef.current = behavior;
  };

  const scrollToBottom = (behavior = "auto") => {
    setTimeout(() => {
      const messagesArea = messagesAreaRef.current;

      if (!messagesArea) {
        return;
      }

      messagesArea.scrollTo({
        top: messagesArea.scrollHeight,
        behavior: behavior
      });
    }, 0);
  };

  const loadProfile = async () => {
    try {
      const data = await authService.getProfile();
      setCurrentUser(data);

      const userId = getUserId(data);

      if (userId) {
        localStorage.setItem("userId", userId);
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

      const details = {};

      const roomsWithLatestMessage = await Promise.all(
        rooms.map(async (roomItem) => {
          const roomId = getRoomId(roomItem);

          let latestMessageTime = 0;
          let latestMessageText = "";

          try {
            const participantsResponse = await fetch(
              `http://localhost:8080/api/chatrooms/${roomId}/participants`
            );

            if (participantsResponse.ok) {
              const participantsData = await participantsResponse.json();
              const participantList = Array.isArray(participantsData)
                ? participantsData
                : [];

              const otherUser = getOtherUserFromParticipants(
                participantList,
                userId
              );

              details[roomId] = {
                participants: participantList,
                otherUser: otherUser
              };
            }

            const messagesResponse = await fetch(
              `http://localhost:8080/api/messages/chatroom/${roomId}`
            );

            if (messagesResponse.ok) {
              const messagesData = await messagesResponse.json();
              const roomMessages = Array.isArray(messagesData)
                ? messagesData
                : [];

              if (roomMessages.length > 0) {
                const sortedRoomMessages = [...roomMessages].sort((a, b) => {
                  const dateA = new Date(a.sentAt || a.sent_at).getTime();
                  const dateB = new Date(b.sentAt || b.sent_at).getTime();

                  return dateA - dateB;
                });

                const latestMessage =
                  sortedRoomMessages[sortedRoomMessages.length - 1];

                latestMessageTime = new Date(
                  latestMessage.sentAt || latestMessage.sent_at
                ).getTime();

                latestMessageText = latestMessage.content;
              }
            }
          } catch (error) {
            console.error("Error loading room info:", error);
          }

          return {
            ...roomItem,
            latestMessageTime,
            latestMessageText
          };
        })
      );

      const sortedRooms = roomsWithLatestMessage.sort((a, b) => {
        return b.latestMessageTime - a.latestMessageTime;
      });

      setRoomDetails(details);
      setChatRooms(sortedRooms);

      if (sortedRooms.length > 0) {
        const savedRoomId =
          sessionStorage.getItem("selectedChatRoomId") ||
          localStorage.getItem("selectedChatRoomId");

        if (savedRoomId) {
          requestScrollToBottom("auto");
          setSelectedRoomId(Number(savedRoomId));
          sessionStorage.removeItem("selectedChatRoomId");
          localStorage.removeItem("selectedChatRoomId");
        } else if (!selectedRoomId) {
          const firstRoomId = getRoomId(sortedRooms[0]);
          requestScrollToBottom("auto");
          setSelectedRoomId(firstRoomId);
        }
      }
    } catch (error) {
      console.error("Error loading chat rooms:", error);
      setChatRooms([]);
    }
  };

  const loadRoomDetails = async (rooms, loggedInUserId) => {
    const details = {};

    await Promise.all(
      rooms.map(async (roomItem) => {
        const roomId = getRoomId(roomItem);

        if (!roomId) {
          return;
        }

        try {
          const response = await fetch(
            `http://localhost:8080/api/chatrooms/${roomId}/participants`
          );

          if (!response.ok) {
            return;
          }

          const data = await response.json();
          const participantList = Array.isArray(data) ? data : [];

          const otherUser = getOtherUserFromParticipants(
            participantList,
            loggedInUserId
          );

          details[roomId] = {
            participants: participantList,
            otherUser: otherUser
          };
        } catch (error) {
          console.error("Error loading room details:", error);
        }
      })
    );

    setRoomDetails(details);
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

  const loadMessages = async (
    roomId,
    forceScrollToBottom = false,
    behavior = "auto"
  ) => {
    try {
      const shouldStayAtBottom = forceScrollToBottom || isNearBottom();

      if (shouldStayAtBottom) {
        requestScrollToBottom(behavior);
      } else {
        shouldAutoScrollRef.current = false;
      }

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
      const participantUserId = Number(getParticipantUserId(participant));
      return participantUserId !== currentUserId;
    });

    return getParticipantUserId(otherParticipant);
  };

  const handleSelectRoom = (roomId) => {
    requestScrollToBottom("auto");
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
      await loadMessages(selectedRoomId, true, "smooth");

      const userId = getUserId(currentUser);
      if (userId) {
        loadChatRooms(userId);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      requestScrollToBottom("auto");
      loadParticipants(selectedRoomId);
      loadMessages(selectedRoomId, true, "auto");
    }
  }, [selectedRoomId]);

  useEffect(() => {
    if (!selectedRoomId) return;

    const interval = setInterval(() => {
      loadMessages(selectedRoomId, false, "auto");
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedRoomId]);

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom(scrollBehaviorRef.current);
      shouldAutoScrollRef.current = false;
      scrollBehaviorRef.current = "auto";
    }
  }, [messages]);

  const loggedInUserId = getUserId(currentUser);
  const selectedOtherUser = getOtherUserForRoom(selectedRoomId);

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
              const roomName = getRoomDisplayName(roomId);
              const roomSubtitle = getRoomDisplaySubtitle(roomId);

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
                  <div className="thread-avatar">
                    {getInitials(roomName)}
                  </div>

                  <div className="thread-info">
                    <div className="thread-top">
                      <strong>{roomName}</strong>
                      <span>{formatRoomTime(roomItem.latestMessageTime)}</span>
                    </div>

                    <p>
                      {roomItem.latestMessageText
                        ? roomItem.latestMessageText
                        : roomSubtitle}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="chat-main">
          <div className="chat-header">
            <div className="small-avatar">
              {getInitials(selectedOtherUser?.name)}
            </div>

            <div>
              <div className="chat-header-name">
                {selectedRoomId
                  ? getRoomDisplayName(selectedRoomId)
                  : "No chat selected"}
              </div>

              <div className="online">
                {selectedOtherUser?.email
                  ? selectedOtherUser.email
                  : selectedRoomId
                  ? `Room #${selectedRoomId}`
                  : "Select a conversation"}
              </div>
            </div>

            <div className="chat-product">Marketplace Chat</div>
          </div>

          <div className="messages-area" ref={messagesAreaRef}>
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
                  <React.Fragment
                    key={message.messageId || message.message_id || index}
                  >
                    {showDateLabel && (
                      <div className="date-separator">
                        {formatDateLabel(currentMessageDate)}
                      </div>
                    )}

                    <div className={isMine ? "msg-row mine" : "msg-row"}>
                      {!isMine && (
                        <div className="small-avatar">
                          {getInitials(selectedOtherUser?.name)}
                        </div>
                      )}

                      <div className={isMine ? "message-stack mine-stack" : "message-stack"}>
                        <div className={isMine ? "msg mine-msg" : "msg other-msg"}>
                          {message.content}
                        </div>

                        <div className={isMine ? "msg-time right" : "msg-time"}>
                          {formatTime(message.sentAt || message.sent_at)}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })
            )}
          </div>

          <form className="chat-input" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder={
                selectedRoomId
                  ? "Type a message..."
                  : "Select a chat first..."
              }
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

  function formatRoomTime(dateTime) {
    if (!dateTime) {
      return "";
    }

    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return date.toLocaleDateString([], {
      day: "2-digit",
      month: "short"
    });
  }

export default ChatPage;

