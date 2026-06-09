import { useEffect, useState } from "react";

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");

  const roomId = 1;
  const senderId = 2;
  const receiverId = 3;

  function loadMessages() {
  fetch(`http://localhost:8080/api/messages/chatroom/${roomId}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load messages");
      }
      return response.json();
    })
    .then((data) => {
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        console.error("Expected array but got:", data);
        setMessages([]);
      }
    })
    .catch((error) => {
      console.error("Error loading messages:", error);
      setMessages([]);
    });
}

  function sendMessage(event) {
    event.preventDefault();

    if (content.trim() === "") {
      alert("Message cannot be empty");
      return;
    }

    const newMessage = {
      roomId,
      senderId,
      receiverId,
      content
    };

    fetch("http://localhost:8080/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newMessage)
    })
      .then((response) => response.json())
      .then(() => {
        setContent("");
        loadMessages();
      })
      .catch((error) => console.error("Error sending message:", error));
  }

  useEffect(() => {
    loadMessages();

    const interval = setInterval(loadMessages, 3000);

    return () => clearInterval(interval);
  }, []);

  function formatTime(dateTime) {
    if (!dateTime) return "";

    const date = new Date(dateTime);

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  

  return (
    <div className="chat-page">
      <h2 className="chat-title">Messages</h2>

      <div className="chat-layout">
        <div className="inbox">
          <div className="inbox-header">
            Messages
          </div>

          <div className="inbox-search">
            <input type="text" placeholder="Search conversations..." />
          </div>

          <div className="thread active">
            <div className="thread-avatar">SR</div>

            <div className="thread-info">
              <div className="thread-top">
                <strong>Siti Rahimah</strong>
                <span>now</span>
              </div>

              <p>Chat room #{roomId}</p>
            </div>
          </div>

          <div className="thread">
            <div className="thread-avatar amber">AD</div>

            <div className="thread-info">
              <div className="thread-top">
                <strong>Admin Support</strong>
                <span>1h</span>
              </div>

              <p>Report reviewed</p>
            </div>
          </div>
        </div>

        <div className="chat-main">
          <div className="chat-header">
            <div className="thread-avatar">SR</div>

            <div>
              <div className="chat-header-name">Siti Rahimah</div>
              <p className="online">● Online</p>
            </div>

            <div className="chat-product">
              📚 Software Engineering 4th Ed. · RM28
            </div>
          </div>

          <div className="messages-area">
            <div className="conversation-pill">
              Conversation started about Software Engineering 4th Ed.
            </div>

            {messages.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              messages.map((message) => {
                const mine = message.senderId === senderId;

                return (
                  <div
                    key={message.messageId}
                    className={mine ? "msg-row mine" : "msg-row"}
                  >
                    {!mine && <div className="small-avatar">SR</div>}

                    <div>
                      <div className={mine ? "msg mine-msg" : "msg other-msg"}>
                        {message.content}
                      </div>

                      <div className={mine ? "msg-time right" : "msg-time"}>
                        {formatTime(message.sentAt)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form className="chat-input" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder="Type a message..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />

            <button className="send-btn" type="submit">
              ➤
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;