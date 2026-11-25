// courtResults.jsx
// 📰 شاشة النتائج — تصميm جريدة مصرية

import { useState } from "react";

const ROLE_LABELS = {
  judge:       { ar: "القاضي",        icon: "⚖️",  color: "#c9a961" },
  prosecution: { ar: "وكيل النيابة",  icon: "📋",  color: "#b23a3a" },
  defense:     { ar: "محامي الدفاع",  icon: "🛡️",  color: "#3a6ea5" },
  accused:     { ar: "المتهم",        icon: "⛓️",  color: "#6b6b6b" },
  jury:        { ar: "محلف",          icon: "👥",  color: "#3a7a5a" },
};

export default function CourtResults({
  debrief,
  players = [],
  playerId,
  isHost,
  isAdmin,
  onRestart,
  onExit,
  onShowTitles,
  onShowStats,
}) {
  const [showTruth, setShowTruth] = useState(false);

  if (!debrief) return null;

  const {
    verdict,
    correctVerdict,
    resultLabel,
    resultType,
    truth,
    debrief: report,
    scores,
  } = debrief;

  // ✅ صورة المتهم
  const accusedScore = Object.values(scores).find((s) => s.role === "accused");
  const accusedPlayer = accusedScore
    ? players.find((p) => p.id === accusedScore.playerId)
    : null;
  const accusedAvatar = accusedPlayer?.avatar;
  const accusedName = accusedScore?.playerName || "المتهم";

  const isJustice = resultType === "justice";
  const sortedScores = Object.values(scores).sort((a, b) => b.points - a.points);

  return (
    <div className="court-screen court-results" dir="rtl">
      {/* Newspaper */}
      <div className="court-news">
        {/* Masthead */}
        <div className="court-news-masthead">
          <div className="court-news-masthead-top">
            <span className="court-news-masthead-date">
              {new Date().toLocaleDateString("ar-EG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="court-news-masthead-edition">
              العدد رقم ٢٣٤٥
            </span>
          </div>
          <h1 className="court-news-masthead-title">الوقائع</h1>
          <div className="court-news-masthead-bottom">
            <span>جريدة المحكمة الرسمية</span>
            <span>•</span>
            <span>تصدر بعد كل جلسة</span>
          </div>
        </div>

        {/* Headline */}
        <div className="court-news-headline">
          <div
            className={`court-news-verdict-badge court-news-verdict-${resultType}`}
          >
            {isJustice ? "⚖️" : "🔴"} {resultLabel}
          </div>
          <h2 className="court-news-headline-title">
            {truth.isGuilty
              ? "المتهم مذنب — والتفاصيل صادمة"
              : "المتهم بريء — والعدالة انتصرت"}
          </h2>
        </div>

        {/* ✅ صورة المتهم */}
        {accusedAvatar && (
          <div className="court-news-accused">
            <div className="court-news-accused-photo-wrap">
              <img
                src={accusedAvatar}
                alt={accusedName}
                className="court-news-accused-photo"
              />
            </div>
            <div className="court-news-accused-info">
              <div className="court-news-accused-label">المتهم</div>
              <div className="court-news-accused-name">{accusedName}</div>
              <div className="court-news-accused-verdict">
                {verdict === "guilty" && "🔨 صدر بحقه حكم بالإدانة"}
                {verdict === "not_guilty" && "✅ أُعلنت براءته"}
                {verdict === "manslaughter" && "⚖️ أُدين بقتل خطأ"}
                {verdict === "refer" && "📂 أُحيل للتحقيق"}
              </div>
            </div>
          </div>
        )}

        {/* Two columns */}
        <div className="court-news-body">
          <div className="court-news-col court-news-col-left">
            <div className="court-news-col-header">
              <span>📰</span>
              <span>القصة الكاملة</span>
            </div>
            <p className="court-news-text">{report.fullStory}</p>

            <div className="court-news-subheader">
              <span>⚠️</span>
              <span>الخطأ الكبير</span>
            </div>
            <p className="court-news-text court-news-text-warn">
              {report.keyMistake}
            </p>
          </div>

          <div className="court-news-col court-news-col-right">
            <div className="court-news-col-header">
              <span>🏆</span>
              <span>النتائج النهائية</span>
            </div>
            <div className="court-news-scores">
              {sortedScores.map((s, i) => {
                const rInfo = ROLE_LABELS[s.role];
                const isMe = s.playerId === playerId;
                return (
                  <div
                    key={s.playerId}
                    className={`court-news-score ${isMe ? "court-news-score-me" : ""}`}
                  >
                    <div className="court-news-score-rank">#{i + 1}</div>
                    <div className="court-news-score-info">
                      <div className="court-news-score-name">
                        {s.playerName}
                        {isMe && <span className="court-news-score-you"> (أنت)</span>}
                      </div>
                      <div
                        className="court-news-score-role"
                        style={{ color: rInfo?.color }}
                      >
                        {rInfo?.icon} {rInfo?.ar} — {s.outcome}
                      </div>
                    </div>
                    <div
                      className={`court-news-score-points ${
                        s.points > 0
                          ? "court-news-score-pos"
                          : s.points < 0
                          ? "court-news-score-neg"
                          : ""
                      }`}
                    >
                      {s.points > 0 ? "+" : ""}
                      {s.points}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="court-news-subheader">
              <span>📚</span>
              <span>دروس مستفادة</span>
            </div>
            <ul className="court-news-lessons">
              {report.lessons?.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* ✅ Actions Row */}
        <div className="court-news-actions">
          <button
            className="court-btn court-btn-gold"
            onClick={() => setShowTruth(true)}
          >
            🔍 كشف الحقيقة كاملة
          </button>

          {onShowTitles && (
            <button
              className="court-btn court-btn-blue"
              onClick={onShowTitles}
            >
              🏆 الألقاب
            </button>
          )}

          {onShowStats && (
            <button
              className="court-btn court-btn-green"
              onClick={onShowStats}
            >
              📊 الإحصائيات
            </button>
          )}
        </div>

        {/* ✅ Admin Actions */}
        {(isAdmin || isHost) && (
          <div className="court-news-admin-actions">
            <button
              className="court-btn court-btn-gold court-btn-lg"
              onClick={onRestart}
            >
              🔄 جلسة جديدة
            </button>
            <button
              className="court-btn court-btn-red"
              onClick={onExit}
            >
              🚪 إنهاء الجلسة والخروج
            </button>
          </div>
        )}

        {!isAdmin && !isHost && (
          <div className="court-news-waiting">
            ⏳ في انتظار قرار المضيف...
          </div>
        )}
      </div>

      {/* ✅ Truth Modal */}
      {showTruth && (
        <div className="court-truth-overlay" onClick={() => setShowTruth(false)}>
          <div
            className="court-truth-modal"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="court-truth-header">
              <div className="court-truth-header-left">
                <span className="court-truth-icon">🔍</span>
                <div>
                  <h2 className="court-truth-title">الحقيقة الكاملة</h2>
                  <p className="court-truth-subtitle">
                    ما لم يره أحد في القاعة
                  </p>
                </div>
              </div>
              <button
                className="court-truth-close"
                onClick={() => setShowTruth(false)}
              >
                ✕
              </button>
            </div>

            <div className="court-truth-body">
              <div className="court-truth-section">
                <h3 className="court-truth-section-title">
                  <span>🎯</span> الجاني الحقيقي
                </h3>
                <p className="court-truth-section-text">
                  {truth.culprit}
                </p>
              </div>

              <div className="court-truth-section">
                <h3 className="court-truth-section-title">
                  <span>⚔️</span> طريقة الجريمة
                </h3>
                <p className="court-truth-section-text">
                  {truth.method}
                </p>
              </div>

              <div className="court-truth-section">
                <h3 className="court-truth-section-title">
                  <span>💭</span> الدافع
                </h3>
                <p className="court-truth-section-text">
                  {truth.motive}
                </p>
              </div>

              {truth.complexCase && (
                <div className="court-truth-section court-truth-section-note">
                  <h3 className="court-truth-section-title">
                    <span>⚠️</span> ملاحظة
                  </h3>
                  <p className="court-truth-section-text">
                    القضية كانت معقدة — النيابة قدمت نظرية مختلفة عن الحقيقة.
                  </p>
                </div>
              )}
            </div>

            <div className="court-truth-footer">
              <button
                className="court-btn court-btn-gold court-btn-lg"
                onClick={() => setShowTruth(false)}
              >
                فهمت — إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}