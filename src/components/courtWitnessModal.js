// courtWitnessModal.jsx
// 📣 مودال استدعاء الشهود — للقاضي فقط

import { useState } from "react";

export default function CourtWitnessModal({
  witnesses,
  usedWitnesses,
  summonsLeft,
  onSummon,
  onClose,
}) {
  const [selectedSide, setSelectedSide] = useState(null);

  const isUsed = (id) => usedWitnesses.includes(id);
  const canSummonSide = (side) => summonsLeft[side] > 0;

  const handleSelect = (id, side) => {
    if (isUsed(id)) return;
    if (!canSummonSide(side)) return;
    onSummon(id, side);
  };

  return (
    <div className="court-witness-overlay" onClick={onClose}>
      <div
        className="court-witness-modal"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="court-witness-header">
          <div className="court-witness-header-left">
            <span className="court-witness-icon">📣</span>
            <div>
              <h2 className="court-witness-title">استدعاء شاهد</h2>
              <p className="court-witness-subtitle">
                اختر الشاهد لاستدعائه إلى المنصة
              </p>
            </div>
          </div>
          <button className="court-witness-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="court-witness-tabs">
          <button
            className={`court-witness-tab ${
              selectedSide === "prosecution" ? "court-witness-tab-active-red" : ""
            }`}
            onClick={() => setSelectedSide("prosecution")}
            disabled={!canSummonSide("prosecution")}
          >
            <span className="court-witness-tab-icon">📋</span>
            <div>
              <div className="court-witness-tab-title">شهود النيابة</div>
              <div className="court-witness-tab-count">
                {summonsLeft.prosecution} استدعاءات متبقية
              </div>
            </div>
          </button>

          <button
            className={`court-witness-tab ${
              selectedSide === "defense" ? "court-witness-tab-active-blue" : ""
            }`}
            onClick={() => setSelectedSide("defense")}
            disabled={!canSummonSide("defense")}
          >
            <span className="court-witness-tab-icon">🛡️</span>
            <div>
              <div className="court-witness-tab-title">شهود الدفاع</div>
              <div className="court-witness-tab-count">
                {summonsLeft.defense} استدعاءات متبقية
              </div>
            </div>
          </button>
        </div>

        {selectedSide ? (
          <div className="court-witness-list">
            {Object.values(witnesses[selectedSide] || {}).map((w) => {
              const used = isUsed(w.id);
              const noSummons = !canSummonSide(selectedSide);
              const disabled = used || noSummons;

              return (
                <button
                  key={w.id}
                  className={`court-witness-card ${
                    used ? "court-witness-card-used" : ""
                  } ${disabled ? "court-witness-card-disabled" : ""}`}
                  onClick={() => handleSelect(w.id, selectedSide)}
                  disabled={disabled}
                >
                  <div className="court-witness-card-avatar">
                    {w.side === "prosecution" ? "📋" : "🛡️"}
                  </div>
                  <div className="court-witness-card-info">
                    <div className="court-witness-card-name">{w.name}</div>
                    <div className="court-witness-card-role">{w.role}</div>
                  </div>
                  <div className="court-witness-card-action">
                    {used ? (
                      <span className="court-witness-card-used-label">✓ استُدعي</span>
                    ) : noSummons ? (
                      <span className="court-witness-card-used-label">✗ لا فرص</span>
                    ) : (
                      <span className="court-witness-card-summon-label">📣 استدعاء</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="court-witness-empty">
            <div className="court-witness-empty-icon">👈</div>
            <p>اختر فريق الشاهد</p>
          </div>
        )}

        <div className="court-witness-footer">
          <div className="court-witness-footer-info">
            💡 كل فريق عنده استدعاءين بس. اختر بحكمة.
          </div>
        </div>
      </div>
    </div>
  );
}