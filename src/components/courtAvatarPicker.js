// courtAvatarPicker.jsx
// 🎭 اختيار الصورة الشخصية + الاسم

import { useState, useEffect } from "react";

const AVATARS = Array.from({ length: 24 }, (_, i) => ({
  id: `avatar_${String(i + 1).padStart(2, "0")}`,
  src: `/court/avatars/avatar_${String(i + 1).padStart(2, "0")}.jpg`,
}));

export default function CourtAvatarPicker({
  playerId,
  currentName = "",
  takenAvatars = [],
  currentAvatar,
  onConfirm,
  isMandatory = false,
}) {
  const [selected, setSelected] = useState(currentAvatar || null);
  const [name, setName] = useState(currentName || "");

    const isTaken = (src) => takenAvatars.includes(src);
    const isMyAvatar = (src) => src === currentAvatar;

  const canConfirm = selected && name.trim().length >= 2;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm({ avatar: selected, displayName: name.trim() });
  };

  return (
    <div className="court-av-picker-overlay">
      <div className="court-av-picker" dir="rtl">
        {/* Header */}
        <div className="court-av-picker-header">
          <div className="court-av-picker-header-left">
            <span className="court-av-picker-icon">🎭</span>
            <div>
              <h2 className="court-av-picker-title">
                اختر صورتك واسمك
              </h2>
              <p className="court-av-picker-subtitle">
                {isMandatory
                  ? "لازم تختار صورتك وتكتب اسمك قبل ما تدوس جاهز"
                  : "تقدر تغير صورتك واسمك في أي وقت"}
              </p>
            </div>
          </div>
        </div>

        {/* Name Input */}
        <div className="court-av-picker-name-wrap">
          <label className="court-av-picker-name-label">
            ✍️ اسمك في القاعة
          </label>
          <input
            type="text"
            className="court-av-picker-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اكتب اسمك..."
            maxLength={20}
            dir="rtl"
          />
          <div className="court-av-picker-name-hint">
            {name.length}/20 حرف
          </div>
        </div>

        {/* Grid */}
        <div className="court-av-picker-grid">
        {AVATARS.map((av) => {
        const taken = isTaken(av.src) && !isMyAvatar(av.src);
        const isSelected = selected === av.src;

            return (
              <button
                key={av.id}
                className={`court-av-picker-item ${
                  isSelected ? "court-av-picker-item-selected" : ""
                } ${taken ? "court-av-picker-item-taken" : ""}`}
                onClick={() => !taken && setSelected(av.src)}
                disabled={taken}
              >
                <img
                  src={av.src}
                  alt={av.id}
                  className="court-av-picker-img"
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = "flex";
                    }
                  }}
                />
                <div className="court-av-picker-placeholder">👤</div>
                {isSelected && (
                  <div className="court-av-picker-check">✓</div>
                )}
                {taken && (
                  <div className="court-av-picker-taken-overlay">
                    محجوز
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="court-av-picker-footer">
          <button
            className="court-btn court-btn-gold court-btn-lg"
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            {canConfirm
              ? "✅ تأكيد"
              : selected
              ? "✍️ اكتب اسمك أولاً"
              : "👆 اختر صورة أولاً"}
          </button>
        </div>
      </div>
    </div>
  );
}