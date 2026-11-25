// courtEvidenceModal.jsx
// 🔍 مودال تقديم الأدلة — للقاضي فقط

import { useState } from "react";

export default function CourtEvidenceModal({
  evidence,
  usedEvidence,
  evidenceLeft,
  onPresent,
  onClose,
}) {
  const [selectedSide, setSelectedSide] = useState(null);

  const isUsed = (id) => usedEvidence.includes(id);
  const canPresentSide = (side) => evidenceLeft[side] > 0;

  const handleSelect = (id, side) => {
    if (isUsed(id)) return;
    if (!canPresentSide(side)) return;
    onPresent(id, side);
  };

  // ✅ عدد الأدلة الفعلي لكل فريق
  const prosCount = Object.keys(evidence.prosecution || {}).length;
  const defCount = Object.keys(evidence.defense || {}).length;

  return (
    <div className="court-ev-modal-overlay" onClick={onClose}>
      <div
        className="court-ev-modal"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="court-ev-modal-header">
          <div className="court-ev-modal-header-left">
            <span className="court-ev-modal-icon">🔍</span>
            <div>
              <h2 className="court-ev-modal-title">تقديم دليل</h2>
              <p className="court-ev-modal-subtitle">
                اختر الدليل لعرضه في الجلسة
              </p>
            </div>
          </div>
          <button
            className="court-ev-modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="court-ev-modal-tabs">
          <button
            className={`court-ev-modal-tab ${
              selectedSide === "prosecution" ? "court-ev-modal-tab-active-red" : ""
            }`}
            onClick={() => setSelectedSide("prosecution")}
            disabled={!canPresentSide("prosecution")}
          >
            <span className="court-ev-modal-tab-icon">📋</span>
            <div>
              <div className="court-ev-modal-tab-title">أدلة النيابة</div>
              <div className="court-ev-modal-tab-count">
                {evidenceLeft.prosecution} من {prosCount} متبقية
              </div>
            </div>
          </button>

          <button
            className={`court-ev-modal-tab ${
              selectedSide === "defense" ? "court-ev-modal-tab-active-blue" : ""
            }`}
            onClick={() => setSelectedSide("defense")}
            disabled={!canPresentSide("defense")}
          >
            <span className="court-ev-modal-tab-icon">🛡️</span>
            <div>
              <div className="court-ev-modal-tab-title">أدلة الدفاع</div>
              <div className="court-ev-modal-tab-count">
                {evidenceLeft.defense} من {defCount} متبقية
              </div>
            </div>
          </button>
        </div>

        {selectedSide ? (
          <div className="court-ev-modal-list">
            {Object.values(evidence[selectedSide] || {}).map((ev) => {
              const used = isUsed(ev.id);
              const noLeft = !canPresentSide(selectedSide);
              const disabled = used || noLeft;

              return (
                <button
                  key={ev.id}
                  className={`court-ev-modal-item ${
                    used ? "court-ev-modal-item-used" : ""
                  } ${disabled ? "court-ev-modal-item-disabled" : ""}`}
                  onClick={() => handleSelect(ev.id, selectedSide)}
                  disabled={disabled}
                >
                  <div className="court-ev-modal-item-icon">🔍</div>
                  <div className="court-ev-modal-item-info">
                    <div className="court-ev-modal-item-title">
                      {ev.title}
                    </div>
                    <div className="court-ev-modal-item-preview">
                      {ev.content && ev.content.length > 80
                        ? ev.content.slice(0, 80) + "..."
                        : ev.content}
                    </div>
                  </div>
                  <div className="court-ev-modal-item-action">
                    {used ? (
                      <span className="court-ev-modal-item-used-label">✓ قُدّم</span>
                    ) : noLeft ? (
                      <span className="court-ev-modal-item-used-label">✗ لا فرص</span>
                    ) : (
                      <span className="court-ev-modal-item-present-label">📄 تقديم</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="court-ev-modal-empty">
            <div className="court-ev-modal-empty-icon">👈</div>
            <p>اختر فريق الدليل</p>
          </div>
        )}

        <div className="court-ev-modal-footer">
          💡 كل فريق عنده عدد أدلة محدد. اختر بحكمة.
        </div>
      </div>
    </div>
  );
}