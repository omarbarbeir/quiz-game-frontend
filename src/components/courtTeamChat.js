// courtTeamChat.jsx
// 💬 شات سري لكل فريق — الدفاع / المحكمة

import { useState, useEffect, useRef } from "react";

const ROLE_LABELS = {
  judge:       { ar: "القاضي",        icon: "⚖️",  color: "#c9a961" },
  prosecution: { ar: "وكيل النيابة",  icon: "📋",  color: "#b23a3a" },
  defense:     { ar: "محامي الدفاع",  icon: "🛡️",  color: "#3a6ea5" },
  accused:     { ar: "المتهم",        icon: "⛓️",  color: "#6b6b6b" },
  jury:        { ar: "محلف",          icon: "👥",  color: "#3a7a5a" },
};

const TEAM_LABELS = {
  court:   { ar: "فريق المحكمة",   icon: "⚖️", color: "#c9a961" },
  defense: { ar: "فريق الدفاع",    icon: "🛡️", color: "#3a6ea5" },
};

export default function CourtTeamChat({
  socket,
  roomCode,
  playerId,
  team,
  role,
  players,
  onClose,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const teamInfo = TEAM_LABELS[team];
  const teamMembers = players.filter(p => p.team === team);

  // استقبال الرسائل
  useEffect(() => {
    if (!socket) return;

    const onMsg = (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    };

    const onTyping = ({ playerId: pid, isTyping: t }) => {
      if (pid === playerId) return;
      setIsTyping(t ? pid : null);
    };

    socket.on("court_team_message", onMsg);
    socket.on("court_team_typing", onTyping);

    return () => {
      socket.off("court_team_message", onMsg);
      socket.off("court_team_typing", onTyping);
    };
  }, [socket, playerId]);

  // فوكس تلقائي
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    socket.emit("court_team_message", {
      roomCode,
      playerId,
      message: text,
    });
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="court-chat-backdrop"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="court-chat-drawer"
        style={{ "--team-color": teamInfo?.color }}
        dir="rtl"
      >
        {/* Header */}
        <div className="court-chat-header">
          <div className="court-chat-header-left">
            <span
              className="court-chat-team-icon"
              style={{ color: teamInfo?.color }}
            >
              {teamInfo?.icon}
            </span>
            <div>
              <h3 className="court-chat-title">
                شات {teamInfo?.ar}
              </h3>
              <p className="court-chat-subtitle">
                {teamMembers.length} عضو — سري
              </p>
            </div>
          </div>
          <button
            className="court-chat-close"
            onClick={onClose}
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* Members bar */}
        <div className="court-chat-members">
          {teamMembers.map(m => {
            const mInfo = ROLE_LABELS[m.role];
            return (
              <span
                key={m.id}
                className="court-chat-member"
                style={{ borderColor: mInfo?.color + "55" }}
              >
                <span
                  className="court-chat-member-dot"
                  style={{ background: mInfo?.color }}
                />
                {m.name}
                {m.id === playerId && (
                  <span className="court-chat-member-you"> (أنت)</span>
                )}
              </span>
            );
          })}
        </div>

        {/* Messages */}
        <div className="court-chat-messages">
          {messages.length === 0 && (
            <div className="court-chat-empty">
              <div className="court-chat-empty-icon">💬</div>
              <p>لسه مفيش رسائل.</p>
              <p className="court-chat-empty-hint">
                اتكلموا مع فريقكم بحرية — الرسائل دي سرية.
              </p>
            </div>
          )}

          {messages.map((msg, i) => {
            const isMe = msg.playerId === playerId;
            const mInfo = ROLE_LABELS[msg.role];
            return (
              <div
                key={i}
                className={`court-chat-msg ${isMe ? "court-chat-msg-me" : ""}`}
              >
                <div className="court-chat-msg-head">
                  <span
                    className="court-chat-msg-role"
                    style={{ color: mInfo?.color }}
                  >
                    {mInfo?.icon} {msg.playerName}
                  </span>
                  <span className="court-chat-msg-time">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div
                  className="court-chat-msg-bubble"
                  style={{
                    background: isMe
                      ? teamInfo?.color + "22"
                      : "rgba(255,255,255,0.04)",
                    borderColor: isMe
                      ? teamInfo?.color + "66"
                      : "rgba(255,255,255,0.06)",
                  }}
                >
                  {msg.message}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="court-chat-typing">
              <span className="court-chat-typing-name">
                {players.find(p => p.id === isTyping)?.name}
              </span>
              يكتب
              <span className="court-chat-typing-dots">
                <span />
                <span />
                <span />
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="court-chat-input-wrap">
          <textarea
            ref={inputRef}
            className="court-chat-input"
            value={input}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالة لفريقك..."
            rows={1}
            maxLength={500}
          />
          <button
            className="court-chat-send"
            onClick={sendMessage}
            disabled={!input.trim()}
            style={{
              background: teamInfo?.color,
              opacity: input.trim() ? 1 : 0.4,
            }}
            aria-label="إرسال"
          >
            ➤
          </button>
        </div>

        {/* Warning */}
        <div className="court-chat-warning">
          🔒 الرسائل دي لا تُرى إلا من فريقك
        </div>
      </div>
    </>
  );
}

// ══════════════════════════════════════════════
function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}