import React from "react";

export default function NavBar() {
  return (
    <header className="topbar">
      <div className="topbar-inner container">
        <div className="brand">
          <div className="brand-mark">RE</div>
          <div>
            <div className="brand-title">Real Estate Analysis Chatbot</div>
            <div className="brand-sub">LLM-enabled · Professional Dashboard</div>
          </div>
        </div>
        <nav className="nav-actions">
          {/* intentionally left blank: removed 'Demo' badge */}
        </nav>
      </div>
    </header>
  );
}
