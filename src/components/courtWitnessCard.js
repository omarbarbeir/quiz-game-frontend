// courtWitnessCard.jsx
// 🎴 كارت الشاهد — مع صورة

export default function CourtWitnessCard({ witness, onClose }) {
  if (!witness) return null;

  const isProsecution = witness.side === "prosecution";
  const hasImage = witness.image && witness.image.trim() !== "";

  return (
    <div className="court-wcard-overlay" onClick={onClose}>
      <div
        className={`court-wcard court-wcard-${witness.side}`}
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* شريط علوي ذهبي */}
        <div className="court-wcard-top-decoration" />

        {/* Badge الفريق */}
        <div className={`court-wcard-badge court-wcard-badge-${witness.side}`}>
          {isProsecution ? "📋 شاهد نيابة" : "🛡️ شاهد دفاع"}
        </div>

        {/* الصورة */}
        <div className="court-wcard-photo-wrap">
          <div className={`court-wcard-photo-frame court-wcard-photo-frame-${witness.side}`}>
            {hasImage ? (
              <img
                src={witness.image}
                alt={witness.name}
                className="court-wcard-photo"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="court-wcard-photo-placeholder"
              style={{ display: hasImage ? "none" : "flex" }}
            >
              <span className="court-wcard-photo-placeholder-icon">
                {isProsecution ? "📋" : "🛡️"}
              </span>
            </div>
          </div>
        </div>

        {/* الاسم والدور */}
        <h2 className="court-wcard-name">{witness.name}</h2>
        <p className="court-wcard-role">{witness.role}</p>

        {/* فاصل */}
        <div className="court-wcard-divider">
          <span className="court-wcard-divider-line" />
          <span className="court-wcard-divider-icon">🎤</span>
          <span className="court-wcard-divider-line" />
        </div>

        {/* الشهادة */}
        <div className="court-wcard-testimony-wrap">
          <div className="court-wcard-testimony">
            <span className="court-wcard-quote court-wcard-quote-open">"</span>
            {witness.testimony}
            <span className="court-wcard-quote court-wcard-quote-close">"</span>
          </div>
        </div>

        {/* زر الإغلاق */}
        <button
          className={`court-wcard-close court-wcard-close-${witness.side}`}
          onClick={onClose}
        >
          فهمت — إغلاق
        </button>
      </div>
    </div>
  );
}