// courtMenu.jsx
// ⚖️ شاشة الانتظار والقائمة الرئيسية

import { useState } from "react";

export default function CourtMenu({
  roomCode,
  playerId,
  playerName,
  players,
  isHost,
  caseInfo,
  cases,
  onChangeCase,
  onStart,
  onExit,
}) {
  const [showCasesPopup, setShowCasesPopup] = useState(false);

  const canStart = isHost && players.length >= 2;

  const handleSelectCase = (caseId) => {
    onChangeCase(caseId);
    setShowCasesPopup(false);
  };

  return (
    <div className="court-screen court-menu" dir="rtl">
      {/* زخرفة علوية */}
      <div className="court-menu-ornament">
        <span className="court-menu-ornament-line" />
        <span className="court-menu-ornament-icon">⚖️</span>
        <span className="court-menu-ornament-line" />
      </div>

      {/* العنوان */}
      <div className="court-menu-header">
        <h1 className="court-menu-title">المحكمة</h1>
        <p className="court-menu-subtitle">
          <span className="court-menu-court-name">
            جمهورية مصر العربية — وزارة العدل
          </span>
        </p>
        <div className="court-menu-room">
          <span className="court-menu-room-label">رقم القاعة</span>
          <span className="court-menu-room-code">{roomCode}</span>
        </div>
      </div>

      {/* معلومات القضية */}
      {caseInfo && (
        <div className="court-menu-case">
          <div className="court-menu-case-header">
            <span className="court-menu-case-icon">📁</span>
            <div>
              <h2 className="court-menu-case-title">{caseInfo.title}</h2>
              <p className="court-menu-case-meta">
                {caseInfo.category} • {caseInfo.difficulty} • {caseInfo.duration}
              </p>
            </div>
          </div>
          <div className="court-menu-case-number">
            قضية رقم: <strong>{caseInfo.caseNumber}</strong>
          </div>
        </div>
      )}

      {/* زر تغيير القضية (للمضيف فقط) */}
      {isHost && cases.length > 0 && (
        <button
          className="court-btn court-btn-ghost court-menu-change-case"
          onClick={() => setShowCasesPopup(true)}
        >
          🔄 تغيير القضية
        </button>
      )}

      {/* اللاعبون */}
      <div className="court-menu-players">
        <div className="court-menu-players-header">
          <span>الحضور</span>
          <span className="court-menu-players-count">
            {players.length} / 8
          </span>
        </div>
        <div className="court-menu-players-list">
          {players.map(p => (
            <div key={p.id} className="court-menu-player">
              <span className="court-menu-player-dot" />
              <span className="court-menu-player-name">
                {p.name}
                {p.id === playerId && (
                  <span className="court-menu-player-you"> (أنت)</span>
                )}
              </span>
            </div>
          ))}
          {players.length < 2 && (
            <div className="court-menu-players-empty">
              في انتظار المزيد من اللاعبين...
            </div>
          )}
        </div>
      </div>

      {/* الأزرار */}
      <div className="court-menu-actions">
        {isHost ? (
          <button
            className="court-btn court-btn-gold court-btn-lg"
            onClick={onStart}
            disabled={!canStart}
          >
            🔨 افتح الجلسة
          </button>
        ) : (
          <div className="court-menu-waiting">
            <div className="court-menu-waiting-dots">
              <span />
              <span />
              <span />
            </div>
            في انتظار المضيف...
          </div>
        )}

        {isHost && players.length < 2 && (
          <p className="court-menu-warning">
            ⚠️ اللعبة تحتاج لاعبين على الأقل
          </p>
        )}

        {onExit && (
          <button
            className="court-btn court-btn-ghost"
            onClick={onExit}
          >
            خروج
          </button>
        )}
      </div>

      {/* زخرفة سفلية */}
      <div className="court-menu-footer">
        <span className="court-menu-footer-line" />
        <span className="court-menu-footer-text">
          ﴿ وَإِذَا حَكَمْتُم بَيْنَ النَّاسِ أَن تَحْكُمُوا بِالْعَدْلِ ﴾
        </span>
        <span className="court-menu-footer-line" />
      </div>

      {/* ═══════════ Modal تغيير القضية ═══════════ */}
      {showCasesPopup && (
        <div
          className="court-cases-popup-overlay"
          onClick={() => setShowCasesPopup(false)}
        >
          <div
            className="court-cases-popup"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="court-cases-popup-header">
              <div className="court-cases-popup-header-left">
                <span className="court-cases-popup-icon">📁</span>
                <div>
                  <h2 className="court-cases-popup-title">
                    اختر القضية
                  </h2>
                  <p className="court-cases-popup-subtitle">
                    {cases.length} قضية متاحة
                  </p>
                </div>
              </div>
              <button
                className="court-cases-popup-close"
                onClick={() => setShowCasesPopup(false)}
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="court-cases-popup-list">
              {cases.map((c) => {
                const isActive = caseInfo?.id === c.id;
                return (
                  <button
                    key={c.id}
                    className={`court-cases-popup-item ${
                      isActive ? "court-cases-popup-item-active" : ""
                    }`}
                    onClick={() => handleSelectCase(c.id)}
                  >
                    <div className="court-cases-popup-item-icon">
                      {isActive ? "✓" : "📁"}
                    </div>
                    <div className="court-cases-popup-item-info">
                      <div className="court-cases-popup-item-title">
                        {c.title}
                      </div>
                      <div className="court-cases-popup-item-meta">
                        {c.category} • {c.difficulty} • {c.duration}
                      </div>
                      <div className="court-cases-popup-item-number">
                        قضية رقم: {c.caseNumber}
                      </div>
                    </div>
                    {isActive && (
                      <div className="court-cases-popup-item-badge">
                        الحالية
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="court-cases-popup-footer">
              💡 اختيار القضية يُطبّق فورًا لكل اللاعبين
            </div>
          </div>
        </div>
      )}
    </div>
  );
}