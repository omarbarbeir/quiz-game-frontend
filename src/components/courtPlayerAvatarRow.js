// courtPlayerAvatarRow.jsx
// 👥 صف صور اللعيبة — بيظهر في شاشة الجلسة

const ROLE_LABELS = {
  judge:       { ar: "القاضي",        icon: "⚖️",  color: "#c9a961" },
  prosecution: { ar: "وكيل النيابة",  icon: "📋",  color: "#b23a3a" },
  defense:     { ar: "محامي الدفاع",  icon: "🛡️",  color: "#3a6ea5" },
  accused:     { ar: "المتهم",        icon: "⛓️",  color: "#6b6b6b" },
  jury:        { ar: "محلف",          icon: "👥",  color: "#3a7a5a" },
};

export default function CourtPlayerAvatarRow({
  players,
  allRoles,
  playerId,
  isCompact = false,
}) {
  return (
    <div className={`court-av-row ${isCompact ? "court-av-row-compact" : ""}`} dir="rtl">
      {players.map((p) => {
        const role = allRoles[p.id]?.role;
        const roleInfo = ROLE_LABELS[role];
        const isMe = p.id === playerId;

        return (
          <div
            key={p.id}
            className={`court-av-card ${isMe ? "court-av-card-me" : ""}`}
            style={{ "--role-color": roleInfo?.color || "#666" }}
          >
            <div className="court-av-card-img-wrap">
              <img
                src={p.avatar || `/court/avatars/avatar_01.jpg`}
                alt={p.name}
                className="court-av-card-img"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="court-av-card-placeholder">👤</div>
            </div>
            <div className="court-av-card-info">
              <div className="court-av-card-name">
                {p.name}
                {isMe && <span className="court-av-card-you"> (أنت)</span>}
              </div>
              {roleInfo && (
                <div className="court-av-card-role">
                  <span className="court-av-card-role-icon">
                    {roleInfo.icon}
                  </span>
                  {roleInfo.ar}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}