import { useState } from "react";
import "./App.css";

import ChatPage from "./components/ChatPage";
import ReportForm from "./components/ReportForm";
import AdminDashboard from "./components/AdminDashboard";
import NotificationDropdown from "./components/NotificationDropdown";

function App() {
  const [page, setPage] = useState("chat");

  return (
    <div className="app">
      <nav className="nav">
        <div className="logo">
          e<span>Bizzness</span>
        </div>

        <div className="nav-links">
          <button
            className={page === "chat" ? "active" : ""}
            onClick={() => setPage("chat")}
          >
            Messages
          </button>

          <button
            className={page === "report" ? "active" : ""}
            onClick={() => setPage("report")}
          >
            Report Issue
          </button>

          <button
            className={page === "admin" ? "active" : ""}
            onClick={() => setPage("admin")}
          >
            Admin Dashboard
          </button>
        </div>

        <div className="nav-right">
          <NotificationDropdown />
          <div className="avatar">AJ</div>
        </div>
      </nav>

      <main className="page">
        {page === "chat" && <ChatPage />}
        {page === "report" && <ReportForm />}
        {page === "admin" && <AdminDashboard />}
      </main>
    </div>
  );
}

export default App;