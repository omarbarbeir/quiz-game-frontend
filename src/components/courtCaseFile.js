// courtCaseFile.jsx
// 📁 ملف القضية — تصميم ملف رسمي حقيقي

import { useState } from "react";

const ROLE_LABELS = {
  judge:       { ar: "القاضي",        icon: "⚖️",  color: "#c9a961" },
  prosecution: { ar: "وكيل النيابة",  icon: "📋",  color: "#b23a3a" },
  defense:     { ar: "محامي الدفاع",  icon: "🛡️",  color: "#3a6ea5" },
  accused:     { ar: "المتهم",        icon: "⛓️",  color: "#6b6b6b" },
  jury:        { ar: "محلف",          icon: "👥",  color: "#3a7a5a" },
};

export default function CourtCaseFile({ file, role, caseInfo, onClose }) {
  const [activeTab, setActiveTab] = useState(getInitialTab(role));

  const tabs = getTabsForRole(role, file);
  const roleInfo = ROLE_LABELS[role];

  return (
    <div className="court-file-overlay" onClick={onClose}>
      <div
        className="court-file"
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        <div className="court-file-header">
          <div className="court-file-header-left">
            <div className="court-file-emblem">⚖️</div>
            <div>
              <div className="court-file-country">
                جمهورية مصر العربية — وزارة العدل
              </div>
              <div className="court-file-court">
                {caseInfo?.court || "محكمة جنايات شمال القاهرة"}
              </div>
            </div>
          </div>
          <button
            className="court-file-close"
            onClick={onClose}
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        <div className="court-file-meta">
          <div className="court-file-meta-item">
            <span className="court-file-meta-label">رقم القضية</span>
            <span className="court-file-meta-value">
              {caseInfo?.caseNumber || "—"}
            </span>
          </div>
          <div className="court-file-meta-item">
            <span className="court-file-meta-label">الموضوع</span>
            <span className="court-file-meta-value">
              {caseInfo?.title || "—"}
            </span>
          </div>
          <div className="court-file-meta-item">
            <span className="court-file-meta-label">صفتك</span>
            <span
              className="court-file-meta-value court-file-meta-role"
              style={{ color: roleInfo?.color }}
            >
              {roleInfo?.icon} {roleInfo?.ar}
            </span>
          </div>
        </div>

        <div className="court-file-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`court-file-tab ${
                activeTab === t.id ? "court-file-tab-active" : ""
              }`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className="court-file-tab-icon">{t.icon}</span>
              <span className="court-file-tab-label">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="court-file-content">
          {renderTabContent(activeTab, file, role)}
        </div>

        <div className="court-file-footer">
          <div className="court-file-stamp">
            <span className="court-file-stamp-inner">
              <span className="court-file-stamp-top">وزارة العدل</span>
              <span className="court-file-stamp-mid">سري</span>
              <span className="court-file-stamp-bottom">للاطلاع فقط</span>
            </span>
          </div>
          <div className="court-file-page">
            صفحة {tabs.findIndex(t => t.id === activeTab) + 1} / {tabs.length}
          </div>
        </div>
      </div>
    </div>
  );
}

function getInitialTab(role) {
  if (role === "judge") return "public";
  if (role === "prosecution") return "prosecution";
  if (role === "defense") return "defense";
  if (role === "accused") return "secret";
  if (role === "jury") return "jury";
  return "public";
}

function getTabsForRole(role, file) {
  const tabs = [];

  if (role === "judge") {
    tabs.push({ id: "public", label: "الوقائع", icon: "📋" });
    tabs.push({ id: "court", label: "الأدلة", icon: "🔍" });
    tabs.push({ id: "timeline", label: "التسلسل الزمني", icon: "🕐" });
    tabs.push({ id: "legal", label: "الإطار القانوني", icon: "⚖️" });
    tabs.push({ id: "controversial", label: "نقاط الجدل", icon: "❓" });
  } else if (role === "prosecution") {
    tabs.push({ id: "public", label: "الوقائع", icon: "📋" });
    tabs.push({ id: "prosecution", label: "ملف الاتهام", icon: "📋" });
    tabs.push({ id: "court", label: "الأدلة", icon: "🔍" });
    tabs.push({ id: "timeline", label: "التسلسل الزمني", icon: "🕐" });
  } else if (role === "defense") {
    tabs.push({ id: "public", label: "الوقائع", icon: "📋" });
    tabs.push({ id: "defense", label: "ملف الدفاع", icon: "🛡️" });
    tabs.push({ id: "client", label: "كلام الموكّل", icon: "💬" });
    tabs.push({ id: "court", label: "الأدلة", icon: "🔍" });
  } else if (role === "accused") {
    tabs.push({ id: "secret", label: "الحقيقة", icon: "🔒" });
    tabs.push({ id: "say", label: "ما يجب أن تقوله", icon: "💬" });
    tabs.push({ id: "public", label: "الوقائع العامة", icon: "📋" });
  } else if (role === "jury") {
    tabs.push({ id: "jury", label: "ملخص القضية", icon: "📖" });
    tabs.push({ id: "public", label: "التفاصيل العامة", icon: "📋" });
  }

  return tabs;
}

function renderTabContent(tabId, file, role) {
  switch (tabId) {
    case "public":       return <PublicTab file={file} />;
    case "court":        return <CourtTab file={file} />;
    case "timeline":     return <TimelineTab file={file} />;
    case "legal":        return <LegalTab file={file} />;
    case "controversial":return <ControversialTab file={file} />;
    case "prosecution":  return <ProsecutionTab file={file} />;
    case "defense":      return <DefenseTab file={file} />;
    case "client":       return <ClientTab file={file} />;
    case "secret":       return <AccusedSecretTab file={file} />;
    case "say":          return <AccusedSayTab file={file} />;
    case "jury":         return <JuryTab file={file} />;
    default:             return null;
  }
}

// ══════════════════════════════════════════════
// Tab Components
// ══════════════════════════════════════════════

function PublicTab({ file }) {
  const p = file.publicInfo;
  if (!p) return <p className="court-file-empty">لا توجد بيانات.</p>;

  return (
    <div className="court-file-tab-content">
      <Section title="ملخص القضية" icon="📋">
        <p className="court-file-text">{p.summary}</p>
      </Section>

      <Section title="المتهم" icon="⛓️">
        <InfoGrid items={[
          ["الاسم", p.accused?.name],
          ["السن", p.accused?.age],
          ["المهنة", p.accused?.job],
          ["محل الإقامة", p.accused?.address],
          ["الحالة الاجتماعية", p.accused?.maritalStatus],
          ["السوابق", p.accused?.criminalRecord],
          ["حالة الاحتجاز", p.accused?.detained],
        ]} />
      </Section>

      <Section title="المجني عليه" icon="🕊️">
        <InfoGrid items={[
          ["الاسم", p.victim?.name],
          ["السن", p.victim?.age],
          ["المهنة", p.victim?.job],
          ["محل الإقامة", p.victim?.address],
          ["الحالة الاجتماعية", p.victim?.maritalStatus],
          ["وقت الوفاة", p.victim?.deathTime],
          ["سبب الوفاة", p.victim?.deathCause],
        ]} />
      </Section>

      <Section title="التهمة" icon="⚖️">
        <p className="court-file-text court-file-charge">{p.charge}</p>
      </Section>
    </div>
  );
}

function CourtTab({ file }) {
  const c = file.courtFile;
  if (!c) return <p className="court-file-empty">لا توجد أدلة.</p>;

  return (
    <div className="court-file-tab-content">
      <Section title="الأدلة" icon="🔍">
        <div className="court-file-evidence-list">
          {c.evidence?.map((ev, i) => (
            <div key={ev.id} className="court-file-evidence">
              <div className="court-file-evidence-header">
                <span className="court-file-evidence-num">{i + 1}</span>
                <h4 className="court-file-evidence-title">{ev.title}</h4>
              </div>
              <p className="court-file-evidence-text">{ev.content}</p>
              {ev.note && (
                <p className="court-file-evidence-note">
                  <strong>ملاحظة:</strong> {ev.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ✅ الشهود — أسماء فقط بدون شهادة */}
      <Section title="الشهود المتاحون" icon="👥">
        <div className="court-file-witnesses">
          <div className="court-file-witness-group">
            <h4 className="court-file-witness-group-title">
              📋 شهود النيابة
            </h4>
            {c.witnesses?.prosecution?.map((w, i) => (
              <div key={w.id} className="court-file-witness">
                <span className="court-file-witness-num">{i + 1}</span>
                <div>
                  <div className="court-file-witness-name">{w.name}</div>
                  <div className="court-file-witness-role">{w.role}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="court-file-witness-group">
            <h4 className="court-file-witness-group-title">
              🛡️ شهود الدفاع
            </h4>
            {c.witnesses?.defense?.map((w, i) => (
              <div key={w.id} className="court-file-witness">
                <span className="court-file-witness-num">{i + 1}</span>
                <div>
                  <div className="court-file-witness-name">{w.name}</div>
                  <div className="court-file-witness-role">{w.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="court-file-witness-note">
          💡 الشهادات تُعرض في الجلسة عند استدعاء الشاهد من قبل القاضي.
        </p>
      </Section>
    </div>
  );
}

function TimelineTab({ file }) {
  const p = file.publicInfo;
  if (!p?.timeline) return null;

  return (
    <div className="court-file-tab-content">
      <Section title="التسلسل الزمني" icon="🕐">
        <div className="court-file-timeline">
          {p.timeline.map((t, i) => (
            <div key={i} className="court-file-timeline-item">
              <div className="court-file-timeline-time">{t.time}</div>
              <div className="court-file-timeline-dot" />
              <div className="court-file-timeline-event">{t.event}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function LegalTab({ file }) {
  const c = file.courtFile;
  if (!c) return null;

  return (
    <div className="court-file-tab-content">
      <Section title="الإطار القانوني" icon="⚖️">
        <p className="court-file-text court-file-pre">{c.legalFramework}</p>
      </Section>
    </div>
  );
}

function ControversialTab({ file }) {
  const c = file.courtFile;
  if (!c) return null;

  return (
    <div className="court-file-tab-content">
      <Section title="نقاط الجدل" icon="❓">
        <ul className="court-file-list">
          {c.controversialPoints?.map((pt, i) => (
            <li key={i}>{pt}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function ProsecutionTab({ file }) {
  const p = file.prosecutionFile;
  if (!p) return null;

  return (
    <div className="court-file-tab-content">
      <Section title="المرافعة الافتتاحية" icon="📢">
        <p className="court-file-text court-file-quote">{p.openingStatement}</p>
      </Section>

      <Section title="نظرية الاتهام" icon="🎯">
        <p className="court-file-text">{p.theory}</p>
      </Section>

      <Section title="ملاحظات على الأدلة" icon="📝">
        <div className="court-file-notes">
          {p.evidenceNotes?.map((n, i) => (
            <div key={i} className="court-file-note">
              <div className="court-file-note-strategy">
                🎯 {n.strategy}
              </div>
              <p>{n.note}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="حجج مقترحة" icon="🗣️">
        <ul className="court-file-list">
          {p.suggestedArguments?.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function DefenseTab({ file }) {
  const d = file.defenseFile;
  if (!d) return null;

  return (
    <div className="court-file-tab-content">
      <Section title="المرافعة الافتتاحية" icon="📢">
        <p className="court-file-text court-file-quote">{d.openingStatement}</p>
      </Section>

      <Section title="ثغرات أدلة النيابة" icon="🕳️">
        <div className="court-file-loopholes">
          {d.loopholes?.map((lp, i) => (
            <div key={lp.id} className="court-file-loophole">
              <h4 className="court-file-loophole-title">
                <span className="court-file-loophole-num">{i + 1}</span>
                {lp.title}
              </h4>
              <p>{lp.content}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="حجج مقترحة" icon="🗣️">
        <ul className="court-file-list">
          {d.suggestedArguments?.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function ClientTab({ file }) {
  const d = file.defenseFile;
  if (!d?.clientMeeting) return null;

  return (
    <div className="court-file-tab-content">
      <Section title="ما قاله لك الموكّل" icon="💬">
        <p className="court-file-text court-file-pre">{d.clientMeeting}</p>
      </Section>
    </div>
  );
}

function AccusedSecretTab({ file }) {
  const s = file.accusedSecret;
  if (!s) return null;

  return (
    <div className="court-file-tab-content">
      <div className="court-file-secret-banner">
        🔒 هذا الملف سري — لا يراه أحد غيرك
      </div>

      <Section title="ما حدث بالضبط" icon="🔒">
        <p className="court-file-text court-file-pre">{s.whatHappened}</p>
      </Section>

      <Section title="نقاط ضعفك" icon="⚠️">
        <ul className="court-file-list court-file-list-warn">
          {s.fears?.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </Section>

      <Section title="عذر مؤقت" icon="⏰">
        <p className="court-file-text">{s.alibi}</p>
      </Section>
    </div>
  );
}

function AccusedSayTab({ file }) {
  const s = file.accusedSecret;
  if (!s?.whatToSay) return null;

  return (
    <div className="court-file-tab-content">
      <Section title="الرواية الرسمية" icon="💬">
        <p className="court-file-text court-file-pre">{s.whatToSay}</p>
      </Section>
    </div>
  );
}

function JuryTab({ file }) {
  const j = file.juryFile;
  if (!j) return null;

  return (
    <div className="court-file-tab-content">
      <Section title="ملخص القضية" icon="📖">
        <p className="court-file-text">{j.brief}</p>
      </Section>

      <Section title="إرشادات" icon="💡">
        <p className="court-file-text court-file-pre">{j.guidance}</p>
      </Section>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="court-file-section">
      <h3 className="court-file-section-title">
        <span className="court-file-section-icon">{icon}</span>
        {title}
      </h3>
      <div className="court-file-section-body">{children}</div>
    </div>
  );
}

function InfoGrid({ items }) {
  return (
    <div className="court-file-info-grid">
      {items.map(([label, value], i) => (
        <div key={i} className="court-file-info-item">
          <span className="court-file-info-label">{label}</span>
          <span className="court-file-info-value">{value || "—"}</span>
        </div>
      ))}
    </div>
  );
}