// courtVerdict.jsx
// 🔨 شاشة إعلان الحكم — لحظة درامية

import { useState, useEffect } from "react";

const VERDICT_LABELS = {
  guilty: {
    ar: "إدانة",
    sub: "بالقتل العمد مع سبق الإصرار والترصد",
    icon: "🔨",
    color: "#b23a3a",
  },
  not_guilty: {
    ar: "براءة",
    sub: "لعدم كفاية الأدلة",
    icon: "🕊️",
    color: "#3a7a5a",
  },
  manslaughter: {
    ar: "قتل خطأ",
    sub: "بدون قصد جنائي مسبق",
    icon: "⚖️",
    color: "#c9a961",
  },
  refer: {
    ar: "إحالة للتحقيق",
    sub: "القضية تحتاج مزيداً من البحث",
    icon: "📂",
    color: "#7a5aa5",
  },
};

export default function CourtVerdict({ verdict }) {
  const [stage, setStage] = useState("gavel"); // gavel → stamp → done

  const info = VERDICT_LABELS[verdict] || VERDICT_LABELS.not_guilty;

  useEffect(() => {
    const t1 = setTimeout(() => setStage("stamp"), 1800);
    const t2 = setTimeout(() => setStage("done"), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="court-screen court-verdict" dir="rtl">
      {/* خلفية معتمة */}
      <div className="court-verdict-bg" />

      {/* جزيئات ذهبية */}
      <div className="court-verdict-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="court-verdict-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* المحتوى */}
      <div className="court-verdict-content">
        {/* المطرقة */}
        {stage === "gavel" && (
          <div className="court-verdict-gavel">
            <div className="court-verdict-gavel-icon">🔨</div>
            <div className="court-verdict-gavel-text">
              المحكمة تنطق بحكمها...
            </div>
          </div>
        )}

        {/* الختم */}
        {(stage === "stamp" || stage === "done") && (
          <div className="court-verdict-stamp-wrap">
            <div
              className="court-verdict-stamp"
              style={{ "--v-color": info.color }}
            >
              <div className="court-verdict-stamp-inner">
                <div className="court-verdict-stamp-icon">{info.icon}</div>
                <div className="court-verdict-stamp-label">{info.ar}</div>
                <div className="court-verdict-stamp-sub">{info.sub}</div>
              </div>
            </div>
          </div>
        )}

        {/* جاري كشف الحقيقة */}
        {stage === "done" && (
          <div className="court-verdict-reveal">
            <div className="court-verdict-reveal-dots">
              <span />
              <span />
              <span />
            </div>
            <p className="court-verdict-reveal-text">
              جارٍ كشف الحقيقة الكاملة...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}