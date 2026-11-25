// courtTrialRecord.jsx
// 📜 سجل الجلسة — يعرض كل الأحداث

const EVENT_STYLES = {
  phase_start:   { color: "#c9a961", bg: "rgba(201, 169, 97, 0.1)" },
  phase_end:     { color: "#c9a961", bg: "rgba(201, 169, 97, 0.1)" },
  witness_summon:{ color: "#3a6ea5", bg: "rgba(58, 110, 165, 0.1)" },
  evidence:      { color: "#3a7a5a", bg: "rgba(58, 122, 90, 0.1)" },
  objection:     { color: "#b23a3a", bg: "rgba(178, 58, 58, 0.1)" },
  verdict:       { color: "#d4af37", bg: "rgba(212, 175, 55, 0.15)" },
};

export default function CourtTrialRecord({ trialLog = [], onClose }) {
  return (
    <div className="court-trial-record-overlay" onClick={onClose}>
      <div
        className="court-trial-record"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="court-trial-record-header">
          <div className="court-trial-record-header-left">
            <span className="court-trial-record-icon">📜</span>
            <div>
              <h2 className="court-trial-record-title">سجل الجلسة</h2>
              <p className="court-trial-record-subtitle">
                {trialLog.length} حدث
              </p>
            </div>
          </div>
          <button
            className="court-trial-record-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Timeline */}
        <div className="court-trial-record-body">
          {trialLog.length === 0 ? (
            <div className="court-trial-record-empty">
              <div className="court-trial-record-empty-icon">📭</div>
              <p>لسه مفيش أحداث في الجلسة</p>
            </div>
          ) : (
            <div className="court-trial-record-timeline">
              {trialLog.map((event) => {
                const style = EVENT_STYLES[event.type] || EVENT_STYLES.phase_start;
                return (
                  <div
                    key={event.id}
                    className="court-trial-record-item"
                    style={{
                      background: style.bg,
                      borderRightColor: style.color,
                    }}
                  >
                    <div
                      className="court-trial-record-item-icon"
                      style={{ color: style.color }}
                    >
                      {event.icon}
                    </div>
                    <div className="court-trial-record-item-content">
                      <div className="court-trial-record-item-text">
                        {event.text}
                      </div>
                      <div className="court-trial-record-item-time">
                        {new Date(event.timestamp).toLocaleTimeString("ar-EG", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="court-trial-record-footer">
          💡 السجل بيتحدث تلقائياً مع كل حدث في الجلسة
        </div>
      </div>
    </div>
  );
}