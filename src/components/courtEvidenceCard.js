// courtEvidenceCard.jsx
// 🔍 كارت الدليل — يظهر لما القاضي يقدّمه

export default function CourtEvidenceCard({ evidence, onClose }) {
  if (!evidence) return null;

  const isProsecution = evidence.side === "prosecution";

  return (
    <div className="court-ev-overlay" onClick={onClose}>
      <div
        className={`court-ev-card court-ev-card-${evidence.side}`}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="court-ev-top-bar" />

        <div className={`court-ev-badge court-ev-badge-${evidence.side}`}>
          {isProsecution ? "📋 دليل نيابة" : "🛡️ دليل دفاع"}
        </div>

        <div className="court-ev-icon-wrap">
          <div className={`court-ev-icon-circle court-ev-icon-circle-${evidence.side}`}>
            🔍
          </div>
        </div>

        <h2 className="court-ev-title">{evidence.title}</h2>

        <div className="court-ev-divider">
          <span className="court-ev-divider-line" />
          <span className="court-ev-divider-icon">📄</span>
          <span className="court-ev-divider-line" />
        </div>

        <div className="court-ev-content-wrap">
          <div className="court-ev-content">
            {evidence.content}
          </div>
          {evidence.note && (
            <div className="court-ev-note">
              <span className="court-ev-note-label">📌 ملاحظة:</span>
              <span>{evidence.note}</span>
            </div>
          )}
        </div>

        <button
          className={`court-ev-close court-ev-close-${evidence.side}`}
          onClick={onClose}
        >
          فهمت — إغلاق
        </button>
      </div>
    </div>
  );
}