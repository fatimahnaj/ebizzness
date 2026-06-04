import { useState } from "react";
import ChatPage from "./components/ChatPage";
import ReportForm from "./components/ReportForm";
import AdminDashboard from "./components/AdminDashboard";
import NotificationDropdown from "./components/NotificationDropdown";

function App() {
  const [page, setPage] = useState("chat");

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <div style={topBarStyle}>
        <h1>eBizzness Prototype</h1>

        <NotificationDropdown />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setPage("chat")} style={navButtonStyle}>
          Chat
        </button>

        <button onClick={() => setPage("report")} style={navButtonStyle}>
          Report Issue
        </button>

        <button onClick={() => setPage("admin")} style={navButtonStyle}>
          Admin Dashboard
        </button>
      </div>

      {page === "chat" && <ChatPage />}
      {page === "report" && <ReportForm />}
      {page === "admin" && <AdminDashboard />}
    </div>
  );
}

const topBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const navButtonStyle = {
  padding: "10px 20px",
  marginRight: "10px",
  cursor: "pointer"
};

export default App;