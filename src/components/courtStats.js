// courtStats.jsx
// 📊 شاشة الإحصائيات بعد الجلسة

const ROLE_LABELS = {
  judge:       { ar: "القاضي",        icon: "⚖️",  color: "#c9a961" },
  prosecution: { ar: "وكيل النيابة",  icon: "📋",  color: "#b23a3a" },
  defense:     { ar: "محامي الدفاع",  icon: "🛡️",  color: "#3a6ea5" },
  accused:     { ar: "المتهم",        icon: "⛓️",  color: "#6b6b6b" },
  jury:        { ar: "محلف",          icon: "👥",  color: "#3a7a5a" },
};

export default function CourtStats({ stats, players, onBack, onExit, isAdmin }) {
  if (!stats) return null;

  // ترتيب اللعيبة حسب النقاط الكلية
  const sortedPlayers = Object.entries(stats)
    .map(([pid, s]) => ({
      pid,
      ...s,
      player: players.find((p) => p.id === pid) || { id: pid, name: "لاعب" },
    }))
    .sort((a, b) => b.points - a.points);

  return (
    <div className="court-screen court-stats" dir="rtl">
      {/* Header */}
      <div className="court-stats-header">
        <div className="court-stats-header-icon">📊</div>
        <h1 className="court-stats-title">إحصائيات الجلسة</h1>
        <p className="court-stats-subtitle">نتائج جميع اللاعبين</p>
      </div>

      {/* Players Grid */}
      <div className="court-stats-grid">
        {sortedPlayers.map((entry, idx) => {
          const player = entry.player;
          const isFirst = idx === 0;

          return (
            <div
              key={entry.pid}
              className={`court-stats-card ${isFirst ? "court-stats-card-first" : ""}`}
            >
              {/* Rank Badge */}
              <div className="court-stats-rank">
                {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
              </div>

              {/* Avatar */}
              <div className="court-stats-avatar-wrap">
                <img
                  src={player.avatar || `/court/avatars/avatar_01.jpg`}
                  alt={player.name}
                  className="court-stats-avatar"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="court-stats-avatar-placeholder">👤</div>
              </div>

              {/* Name */}
              <h3 className="court-stats-name">{player.name}</h3>

              {/* Stats */}
              <div className="court-stats-numbers">
                <div className="court-stats-num-item">
                  <div className="court-stats-num-label">جلسات</div>
                  <div className="court-stats-num-value">{entry.gamesPlayed}</div>
                </div>
                <div className="court-stats-num-item">
                  <div className="court-stats-num-label">فوز</div>
                  <div className="court-stats-num-value court-stats-num-win">
                    {entry.wins}
                  </div>
                </div>
                <div className="court-stats-num-item">
                  <div className="court-stats-num-label">خسارة</div>
                  <div className="court-stats-num-value court-stats-num-loss">
                    {entry.losses}
                  </div>
                </div>
                <div className="court-stats-num-item">
                  <div className="court-stats-num-label">نقاط</div>
                  <div
                    className={`court-stats-num-value ${
                      entry.points > 0
                        ? "court-stats-num-win"
                        : entry.points < 0
                        ? "court-stats-num-loss"
                        : ""
                    }`}
                  >
                    {entry.points > 0 ? "+" : ""}
                    {entry.points}
                  </div>
                </div>
              </div>

              {/* Roles */}
              <div className="court-stats-roles">
                <div className="court-stats-roles-label">الأدوار</div>
                <div className="court-stats-roles-list">
                  {Object.entries(entry.roles || {}).map(([role, count]) => {
                    const info = ROLE_LABELS[role];
                    return (
                      <div
                        key={role}
                        className="court-stats-role-item"
                        style={{ borderColor: info?.color + "55" }}
                      >
                        <span style={{ color: info?.color }}>
                          {info?.icon}
                        </span>
                        <span className="court-stats-role-name">
                          {info?.ar}
                        </span>
                        <span className="court-stats-role-count">
                          ×{count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="court-stats-actions">
        <button
          className="court-btn court-btn-ghost court-btn-lg"
          onClick={onBack}
        >
          ← رجوع للجريدة
        </button>

        {isAdmin && (
          <button
            className="court-btn court-btn-red"
            onClick={onExit}
          >
            🚪 إنهاء الجلسة والخروج
          </button>
        )}
      </div>
    </div>
  );
}