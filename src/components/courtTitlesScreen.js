// courtTitlesScreen.jsx
// 🏆 شاشة عرض الألقاب

import { useState, useEffect } from "react";
import CourtTitleCard from "./courtTitleCard";

const ROLE_AR = {
  judge: "القاضي",
  prosecution: "وكيل النيابة",
  defense: "محامي الدفاع",
  accused: "المتهم",
  jury: "محلف",
};

export default function CourtTitlesScreen({ debrief, players, onDone }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  // نبني array الألقاب من debrief
  const titleCards = Object.values(debrief.scores || {}).map((score) => {
    const title = getTitle(score.role, score.points, debrief.resultType);
    const player = players.find((p) => p.id === score.playerId) || {
      id: score.playerId,
      name: score.playerName,
    };
    return {
      player,
      title: {
        ...title,
        roleAr: ROLE_AR[score.role],
        points: score.points,
      },
    };
  });

  // ترتيب حسب النقاط (الأعلى أول)
  titleCards.sort((a, b) => (b.title.points || 0) - (a.title.points || 0));

  const currentCard = titleCards[currentIndex];
  const total = titleCards.length;

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onDone();
    }
  };

  if (!currentCard) {
    return (
      <div className="court-titles-screen" dir="rtl">
        <p>لا توجد ألقاب</p>
        <button onClick={onDone}>متابعة</button>
      </div>
    );
  }

  return (
    <div className="court-titles-screen" dir="rtl">
      {/* عداد */}
      <div className="court-titles-counter">
        كارت {currentIndex + 1} من {total}
      </div>

      {/* كارت اللقب */}
      <CourtTitleCard
        title={currentCard.title}
        player={currentCard.player}
        onClose={handleNext}
      />

      {/* أزرار التنقل */}
      <div className="court-titles-nav">
        <button
          className="court-btn court-btn-ghost"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          ← السابق
        </button>

        <button
          className="court-btn court-btn-gold"
          onClick={handleNext}
        >
          {currentIndex < total - 1 ? "التالي →" : "✨ تم"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// حساب اللقب حسب الدور والنقاط
// ══════════════════════════════════════════════
function getTitle(role, points, resultType) {
  if (role === "judge") {
    if (points > 0) return { label: "القاضي العادل",     icon: "⚖️",  color: "#f4e5a1" };
    if (points < 0) return { label: "القاضي الظالم",     icon: "😔",  color: "#8b1a1a" };
    return              { label: "القاضي المتردد",       icon: "🤔",  color: "#6b7280" };
  }
  if (role === "prosecution") {
    if (points >= 100) return { label: "المدّعي الحديدي",   icon: "🔥",  color: "#dc2626" };
    if (points > 0)   return { label: "النيابة الناجحة",    icon: "📋",  color: "#b91c1c" };
    return              { label: "النيابة الصامتة",      icon: "📋",  color: "#4b5563" };
  }
  if (role === "defense") {
    if (points >= 150) return { label: "محامي الشيطان",   icon: "😈",  color: "#6b21a8" };
    if (points > 0)   return { label: "المدافع الشريف",  icon: "🛡️",  color: "#2563eb" };
    return              { label: "الدفاع المنهزم",     icon: "😞",  color: "#4b5563" };
  }
  if (role === "accused") {
    if (points >= 150) return { label: "الداهية الهارب",  icon: "🎭",  color: "#d4af37" };
    if (points > 0)   return { label: "البريء المظلوم",   icon: "🕊️",  color: "#86efac" };
    return              { label: "المذنب المدان",      icon: "🔗",  color: "#991b1b" };
  }
  if (role === "jury") {
    if (points > 0) return { label: "المحلف الذكي",       icon: "🧠",  color: "#16a34a" };
    return              { label: "المحلف المخدوع",     icon: "😕",  color: "#d97706" };
  }
  return { label: "", icon: "", color: "#6b7280" };
}