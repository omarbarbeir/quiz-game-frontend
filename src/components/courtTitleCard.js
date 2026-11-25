// courtTitleCard.jsx
// 🏆 كارت اللقب — بيظهر بعد الجلسة

export default function CourtTitleCard({ title, player, onClose }) {
  if (!title || !player) return null;

  const color = title.color || "#c9a961";

  return (
    <div className="court-title-overlay" onClick={onClose}>
      <div
        className="court-title-card"
        onClick={(e) => e.stopPropagation()}
        style={{ "--title-color": color }}
        dir="rtl"
      >
        {/* شريط علوي */}
        <div className="court-title-top-bar" />

        {/* الحرف اللوني */}
        <div className="court-title-glow" />

        {/* الصورة */}
        <div className="court-title-avatar-wrap">
          <div className="court-title-avatar-frame">
            <img
              src={player.avatar || `/court/avatars/avatar_01.jpg`}
              alt={player.name}
              className="court-title-avatar-img"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
            <div className="court-title-avatar-placeholder">👤</div>
          </div>
        </div>

        {/* الاسم */}
        <h3 className="court-title-player-name">{player.name}</h3>

        {/* الفاصل */}
        <div className="court-title-divider">
          <span className="court-title-divider-line" />
          <span className="court-title-divider-icon">🏆</span>
          <span className="court-title-divider-line" />
        </div>

        {/* اللقب */}
        <div className="court-title-badge">
          <span className="court-title-badge-icon">{title.icon}</span>
          <span className="court-title-badge-text">{title.label}</span>
        </div>

        {/* تفاصيل */}
        <div className="court-title-details">
          <div className="court-title-detail-row">
            <span className="court-title-detail-label">الدور:</span>
            <span className="court-title-detail-value">
              {title.roleAr || "—"}
            </span>
          </div>
          <div className="court-title-detail-row">
            <span className="court-title-detail-label">النقاط:</span>
            <span className="court-title-detail-value court-title-points">
              {title.points > 0 ? "+" : ""}{title.points}
            </span>
          </div>
        </div>

        {/* زر الإغلاق */}
        <button className="court-title-close" onClick={onClose}>
          إغلاق
        </button>
      </div>
    </div>
  );
}