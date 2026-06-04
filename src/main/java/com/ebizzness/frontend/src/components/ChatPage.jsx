import { useEffect, useState } from "react";

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");

  const roomId = 1;
  const senderId = 2;
  const receiverId = 3;

  function loadMessages() {
    fetch(`http://localhost:8080/api/messages/chatroom/${roomId}`)
      .then((response) => response.json())
      .then((data) => setMessages(data))
      .catch((error) => console.error("Error loading messages:", error));
  }

  function sendMessage(event) {
    event.preventDefault();

    if (content.trim() === "") {
      alert("Message cannot be empty");
      return;
    }

    const newMessage = {
      roomId: roomId,
      senderId: senderId,
      receiverId: receiverId,
      content: content
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

    const interval = setInterval(() => {
      loadMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>eBizzness Chat Prototype</h1>

      <div style={chatBoxStyle}>
        <h2>Chat Room #{roomId}</h2>

        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.messageId}
              style={{
                ...messageStyle,
                backgroundColor:
                  message.senderId === senderId ? "#e3f2fd" : "#f5f5f5"
              }}
            >
              <strong>User {message.senderId}</strong>
              <p>{message.content}</p>
              <small>{message.sentAt}</small>
            </div>
          ))
        )}
      </div>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type message..."
          value={content}
          onChange={(event) => setContent(event.target.value)}
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          Send
        </button>
      </form>
    </div>
  );
}

const chatBoxStyle = {
  border: "1px solid #ccc",
  padding: "15px",
  width: "500px",
  minHeight: "300px",
  marginBottom: "20px"
};

const messageStyle = {
  marginBottom: "10px",
  padding: "10px"
};

const inputStyle = {
  width: "400px",
  padding: "10px",
  marginRight: "10px"
};

const buttonStyle = {
  padding: "10px 20px",
  cursor: "pointer"
};

export default ChatPage;