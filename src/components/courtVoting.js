// courtVoting.jsx
// 🗳️ شاشة التصويت — تدعم كل الأعداد (2-8 لاعبين)

import { useState } from "react";

const VERDICT_OPTIONS = [
  {
    id: "guilty",
    label: "إدانة",
    sub: "قتل عمد مع سبق الإصرار",
    icon: "🔨",
    color: "#b23a3a",
  },
  {
    id: "not_guilty",
    label: "براءة",
    sub: "لعدم كفاية الأدلة",
    icon: "🕊️",
    color: "#3a7a5a",
  },
  {
    id: "manslaughter",
    label: "قتل خطأ",
    sub: "بدون قصد جنائي مسبق",
    icon: "⚖️",
    color: "#c9a961",
  },
  {
    id: "refer",
    label: "إحالة للتحقيق",
    sub: "القضية تحتاج مزيداً من البحث",
    icon: "📂",
    color: "#7a5aa5",
  },
];

export default function CourtVoting({
  role,
  votes,
  players,
  playerId,
  timer,
  onSubmit,
}) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // ══════════════════════════════════════════════
  // تحديد نظام التصويت حسب عدد اللاعبين
  // ══════════════════════════════════════════════
  const rolesArray = players.map(p => p.role);
  const hasProsecution = rolesArray.includes("prosecution");
  const hasJury = rolesArray.includes("jury");
  const hasDefense = rolesArray.includes("defense");

  // عدد المصوتين المتوقع
  let votersCount = 0;
  if (hasJury) {
    votersCount = players.filter(p =>
      ["judge", "prosecution", "jury"].includes(p.role)
    ).length;
  } else if (hasProsecution) {
    votersCount = players.filter(p =>
      ["judge", "prosecution"].includes(p.role)
    ).length;
  } else {
    votersCount = players.filter(p => p.role === "judge").length;
  }

  // هل القاضي هو الوحيد اللي يحكم؟
  const isDirectJudgeVerdict = votersCount <= 1;

  // هل اللاعب الحالي له حق التصويت؟
  const canVote = (() => {
    if (isDirectJudgeVerdict) return role === "judge";
    if (hasJury) {
      return ["judge", "prosecution", "jury"].includes(role);
    }
    return ["judge", "prosecution"].includes(role);
  })();

  // هل اللاعب في فريق الدفاع؟ (مش بيصوت)
  const isDefenseTeam = role === "defense" || role === "accused";

  const handleSubmit = () => {
    if (!selected || submitted) return;
    onSubmit(selected);
    setSubmitted(true);
  };

  const votedCount = Object.keys(votes).length;

  // ══════════════════════════════════════════════
  // الحالة 1: القاضي هو الوحيد اللي يحكم
  // (2-3 لاعبين: مفيش نيابة ولا محلفين)
  // ══════════════════════════════════════════════
  if (isDirectJudgeVerdict) {
    return (
      <div className="court-screen court-voting" dir="rtl">
        <div className="court-voting-header">
          <div className="court-voting-header-icon">⚖️</div>
          <h1 className="court-voting-title">
            {role === "judge" ? "أصدر حكمك" : "في انتظار الحكم"}
          </h1>
          <p className="court-voting-subtitle">
            {role === "judge"
              ? "أنت القاضي الوحيد في هذه القضية — حكمك نهائي"
              : "القاضي هو الوحيد الذي يحكم في هذه القضية"}
          </p>
          <div className="court-voting-timer">
            <span className="court-voting-timer-icon">⏱️</span>
            <span className="court-voting-timer-text">
              {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
            </span>
          </div>
        </div>

        {role === "judge" ? (
          <>
            <div className="court-voting-direct-note">
              🎯 لا يوجد وكيل نيابة ولا محلفين — القرار قرارك وحدك.
            </div>

            <div className="court-voting-grid">
              {VERDICT_OPTIONS.map(opt => {
                const isSelected = selected === opt.id;
                return (
                  <button
                    key={opt.id}
                    className={`court-voting-box ${
                      isSelected ? "court-voting-box-active" : ""
                    }`}
                    onClick={() => setSelected(opt.id)}
                    style={{ "--v-color": opt.color }}
                  >
                    <div className="court-voting-box-icon">{opt.icon}</div>
                    <div className="court-voting-box-label">{opt.label}</div>
                    <div className="court-voting-box-sub">{opt.sub}</div>
                    {isSelected && (
                      <div className="court-voting-box-check">✓</div>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              className="court-btn court-btn-gold court-btn-lg court-voting-submit"
              onClick={handleSubmit}
              disabled={!selected}
            >
              🔨 أصدر الحكم النهائي
            </button>
          </>
        ) : (
          <div className="court-voting-waiting">
            <div className="court-voting-waiting-icon">⏳</div>
            <h2>في انتظار حكم القاضي</h2>
            <p>
              القاضي هو الوحيد الذي يحكم في هذه القضية.
            </p>
            {isDefenseTeam && (
              <p className="court-voting-waiting-hint">
                دورك في الدفاع انتهى — الآن القرار للقاضي.
              </p>
            )}
            {role === "prosecution" && (
              <p className="court-voting-waiting-hint">
                لا يوجد محلفين — القاضي يحكم مباشرة.
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // الحالة 2: فريق الدفاع (لا يصوت)
  // ══════════════════════════════════════════════
  if (isDefenseTeam) {
    return (
      <div className="court-screen court-voting" dir="rtl">
        <div className="court-voting-header">
          <div className="court-voting-header-icon">🗳️</div>
          <h1 className="court-voting-title">مرحلة التصويت</h1>
          <p className="court-voting-subtitle">الحكم النهائي على المتهم</p>
          <div className="court-voting-timer">
            <span className="court-voting-timer-icon">⏱️</span>
            <span className="court-voting-timer-text">
              {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div className="court-voting-counter">
          <div className="court-voting-counter-bar">
            <div
              className="court-voting-counter-fill"
              style={{
                width: `${(votedCount / Math.max(1, votersCount)) * 100}%`,
              }}
            />
          </div>
          <p className="court-voting-counter-text">
            <strong>{votedCount}</strong> من {votersCount} صوّتوا
          </p>
        </div>

        <div className="court-voting-waiting">
          <div className="court-voting-waiting-icon">⏳</div>
          <h2>فريق الدفاع لا يصوّت</h2>
          <p>
            مهمتكم كانت الإقناع. الآن المحكمة هي التي تقرر.
          </p>
          <p className="court-voting-waiting-hint">
            في انتظار حكم القاضي والنيابة
            {hasJury ? " والمحلفين..." : "..."}
          </p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // الحالة 3: بعد التصويت (بانتظار الباقي)
  // ══════════════════════════════════════════════
  if (submitted) {
    return (
      <div className="court-screen court-voting" dir="rtl">
        <div className="court-voting-header">
          <div className="court-voting-header-icon">🗳️</div>
          <h1 className="court-voting-title">مرحلة التصويت</h1>
          <p className="court-voting-subtitle">الحكم النهائي على المتهم</p>
        </div>

        <div className="court-voting-counter">
          <div className="court-voting-counter-bar">
            <div
              className="court-voting-counter-fill"
              style={{
                width: `${(votedCount / Math.max(1, votersCount)) * 100}%`,
              }}
            />
          </div>
          <p className="court-voting-counter-text">
            <strong>{votedCount}</strong> من {votersCount} صوّتوا
          </p>
        </div>

        <div className="court-voting-waiting">
          <div className="court-voting-waiting-icon">✅</div>
          <h2>تم تسجيل صوتك</h2>
          <p>في انتظار باقي أعضاء المحكمة...</p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════
  // الحالة 4: شاشة التصويت العادية
  // (4 لاعبين: القاضي + النيابة)
  // (5+: القاضي + النيابة + المحلفين)
  // ══════════════════════════════════════════════
  return (
    <div className="court-screen court-voting" dir="rtl">
      <div className="court-voting-header">
        <div className="court-voting-header-icon">🗳️</div>
        <h1 className="court-voting-title">مرحلة التصويت</h1>
        <p className="court-voting-subtitle">الحكم النهائي على المتهم</p>
        <div className="court-voting-timer">
          <span className="court-voting-timer-icon">⏱️</span>
          <span className="court-voting-timer-text">
            {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className="court-voting-counter">
        <div className="court-voting-counter-bar">
          <div
            className="court-voting-counter-fill"
            style={{
              width: `${(votedCount / Math.max(1, votersCount)) * 100}%`,
            }}
          />
        </div>
        <p className="court-voting-counter-text">
          <strong>{votedCount}</strong> من {votersCount} صوّتوا
        </p>
      </div>

      <div className="court-voting-grid">
        {VERDICT_OPTIONS.map(opt => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              className={`court-voting-box ${
                isSelected ? "court-voting-box-active" : ""
              }`}
              onClick={() => setSelected(opt.id)}
              style={{ "--v-color": opt.color }}
            >
              <div className="court-voting-box-icon">{opt.icon}</div>
              <div className="court-voting-box-label">{opt.label}</div>
              <div className="court-voting-box-sub">{opt.sub}</div>
              {isSelected && (
                <div className="court-voting-box-check">✓</div>
              )}
            </button>
          );
        })}
      </div>

      <button
        className="court-btn court-btn-gold court-btn-lg court-voting-submit"
        onClick={handleSubmit}
        disabled={!selected}
      >
        🔨 أصدر صوتك
      </button>

      {/* ملاحظات حسب الدور */}
      {role === "jury" && (
        <p className="court-voting-jury-note">
          بصفتك محلفاً، صوتك مهم. اعتمد على ما سمعته من أدلة.
        </p>
      )}

      {role === "judge" && !hasJury && (
        <p className="court-voting-jury-note">
          في حالة التعادل مع النيابة — صوتك هو المرجّح.
        </p>
      )}

      {role === "judge" && hasJury && (
        <p className="court-voting-jury-note">
          في حالة التعادل — صوتك هو المرجّح.
        </p>
      )}

      {role === "prosecution" && (
        <p className="court-voting-jury-note">
          بصفتك وكيل النيابة، صوتك يعكس قوة أدلتك.
        </p>
      )}
    </div>
  );
}