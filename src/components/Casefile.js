import { useState, useCallback } from "react";

// ══════════════════════════════════════════════
// CaseFile — محضر القضية الرسمي
// مع نظام تحديد النص بالقلم
// ══════════════════════════════════════════════

// ── مكوّن النص القابل للتحديد ──
function HighlightableText({ text, textKey, highlights, onHighlight, active }) {
  if (!text) return null;
  const parts = [];
  let lastIndex = 0;
  const textHighlights = (highlights[textKey] || []).sort((a, b) => a.start - b.start);
  textHighlights.forEach(({ start, end }) => {
    if (start > lastIndex) parts.push({ t: text.slice(lastIndex, start), h: false });
    parts.push({ t: text.slice(start, end), h: true });
    lastIndex = end;
  });
  if (lastIndex < text.length) parts.push({ t: text.slice(lastIndex), h: false });
  if (parts.length === 0) parts.push({ t: text, h: false });

  const handleMouseUp = () => {
    if (!active) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const selected = sel.toString().trim();
    if (!selected || selected.length < 2) return;
    const idx = text.indexOf(selected);
    if (idx === -1) return;
    onHighlight(textKey, { start: idx, end: idx + selected.length });
    sel.removeAllRanges();
  };

  return (
    <span onMouseUp={handleMouseUp} style={{ cursor: active ? "text" : "default" }}>
      {parts.map((p, i) =>
        p.h ? (
          <mark key={i} style={{
            background: "#fde68a",
            borderBottom: "2px solid #d97706",
            borderRadius: 2,
            padding: "0 1px",
            color: "#1a1008",
          }}>{p.t}</mark>
        ) : (
          <span key={i}>{p.t}</span>
        )
      )}
    </span>
  );
}

export default function CaseFile({ caseData, role, myFile }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [highlights, setHighlights]   = useState({});
  const [penActive, setPenActive]     = useState(false);

  const addHighlight = useCallback((key, range) => {
    setHighlights(prev => {
      const existing = prev[key] || [];
      const merged = [...existing, range]
        .sort((a, b) => a.start - b.start)
        .reduce((acc, cur) => {
          if (!acc.length) return [cur];
          const last = acc[acc.length - 1];
          if (cur.start <= last.end) {
            acc[acc.length - 1] = { start: last.start, end: Math.max(last.end, cur.end) };
          } else acc.push(cur);
          return acc;
        }, []);
      return { ...prev, [key]: merged };
    });
  }, []);

  const totalHighlights = Object.values(highlights).reduce((s, a) => s + a.length, 0);

  if (!caseData || !myFile) return null;

  const pages = buildPages(caseData, role, myFile);

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* ── تبويبات الصفحات ── */}
      {pages.length > 1 && (
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          {pages.map((p, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: currentPage === i ? "#c8a84b" : "#1a1a22",
                color:      currentPage === i ? "#000"    : "#6b7280",
                border:     currentPage === i ? "none"    : "1px solid #2a2a35",
              }}
            >
              {p.tab}
            </button>
          ))}
        </div>
      )}

      {/* ── شريط القلم ── */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => setPenActive(p => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{
            background: penActive ? "#d97706" : "#1a1a22",
            color:      penActive ? "#000"    : "#6b7280",
            border:     penActive ? "none"    : "1px solid #2a2a35",
          }}
        >
          ✏️ {penActive ? "القلم شغال — حدد النص" : "تفعيل القلم"}
        </button>

        {totalHighlights > 0 && (
          <>
            <span className="text-xs text-amber-600 font-bold">
              {totalHighlights} تحديد
            </span>
            <button
              onClick={() => setHighlights({})}
              className="text-xs text-gray-600 hover:text-red-400 transition-all px-2 py-1 rounded"
            >
              مسح الكل
            </button>
          </>
        )}

        {penActive && (
          <span className="text-xs text-amber-700/70 italic">
            اختار النص بالماوس أو الإصبع
          </span>
        )}
      </div>

      {/* ── الورقة ── */}
      <div
        className="flex-1 overflow-y-auto rounded-2xl"
        style={{
          background: "#f5f0e8",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(0,0,0,0.1)",
          fontFamily: "'Cairo', 'Amiri', serif",
          userSelect: penActive ? "text" : "none",
        }}
      >
        <PageContent
          page={pages[currentPage]}
          caseData={caseData}
          role={role}
          highlights={highlights}
          onHighlight={addHighlight}
          penActive={penActive}
        />
      </div>

      {/* ── تنقل الصفحات ── */}
      {pages.length > 1 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="text-xs text-gray-500 disabled:opacity-30 px-3 py-1.5 bg-gray-800 rounded-lg"
          >
            ◀ السابق
          </button>
          <span className="text-xs text-gray-500">
            {currentPage + 1} / {pages.length}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}
            disabled={currentPage === pages.length - 1}
            className="text-xs text-gray-500 disabled:opacity-30 px-3 py-1.5 bg-gray-800 rounded-lg"
          >
            التالي ▶
          </button>
        </div>
      )}
    </div>
  );
}

// ── محتوى الصفحة ──
function PageContent({ page, caseData, role, highlights = {}, onHighlight = () => {}, penActive = false }) {
  if (!page) return null;
  const hlProps = { highlights, onHighlight, active: penActive };

  return (
    <div className="p-5" style={{ color: "#1a1008", minHeight: 400 }}>
      {/* ── الترويسة الرسمية ── */}
      <div className="text-center mb-4 pb-3" style={{ borderBottom: "2px solid #8b6914" }}>
        <p className="text-xs font-bold text-amber-800 tracking-widest mb-1">
          جمهورية مصر العربية
        </p>
        <p className="text-xs text-amber-700 tracking-wider">
          النيابة العامة — محكمة الجنايات
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="h-px flex-1 bg-amber-700/30" />
          <span className="text-lg">⚖️</span>
          <div className="h-px flex-1 bg-amber-700/30" />
        </div>
      </div>

      {/* ── الصفحة الأولى: بيانات القضية + صورة المتهم ── */}
      {page.type === "cover" && (
        <CoverPage caseData={caseData} role={role} hlProps={hlProps} />
      )}

      {page.type === "evidence" && (
        <EvidencePage evidence={page.data} hlProps={hlProps} />
      )}

      {page.type === "loopholes" && (
        <LoopholesPage loopholes={page.data} hlProps={hlProps} />
      )}

      {page.type === "timeline" && (
        <TimelinePage timeline={page.data} hlProps={hlProps} />
      )}

      {page.type === "arguments" && (
        <ArgumentsPage arguments={page.data} hlProps={hlProps} />
      )}

      {page.type === "secret" && (
        <SecretPage data={page.data} hlProps={hlProps} />
      )}

      {/* ── صفحات القاضي الـ ٤ ── */}
      {page.type === "judge_p1" && <JudgePage1 data={page.data} hlProps={hlProps} />}
      {page.type === "judge_p2" && <JudgePage2 data={page.data} hlProps={hlProps} />}
      {page.type === "judge_p3" && <JudgePage3 data={page.data} hlProps={hlProps} />}
      {page.type === "judge_p4" && <JudgePage4 data={page.data} hlProps={hlProps} />}

      {/* ── التوقيع والختم ── */}
      <div className="mt-6 pt-4 flex items-end justify-between"
        style={{ borderTop: "1px dashed #8b6914" }}>
        <div className="text-xs text-amber-800/60">
          <p>رقم القضية: {caseData.id}</p>
          <p>تاريخ الجلسة: {new Date().toLocaleDateString("ar-EG")}</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-amber-700/30 flex items-center justify-center mb-1 mx-auto opacity-30">
            <span className="text-2xl">⚖️</span>
          </div>
          <p className="text-xs text-amber-800/40">ختم المحكمة</p>
        </div>
      </div>
    </div>
  );
}

// ── الصفحة الغلاف ──
function CoverPage({ caseData, role, hlProps }) {
  return (
    <>
      {/* صورة المتهم + بيانات */}
      <div className="flex gap-4 mb-5">
        {/* صورة المتهم */}
        <div className="flex-shrink-0">
          <div
            className="rounded-lg overflow-hidden flex items-center justify-center"
            style={{
              width: 90, height: 110,
              background: "#d4c9a8",
              border: "2px solid #8b6914",
              boxShadow: "2px 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {caseData.accusedImage ? (
              <img src={caseData.accusedImage} alt="المتهم"
                className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-1">👤</div>
                <p className="text-xs text-amber-800/50 font-bold">صورة</p>
                <p className="text-xs text-amber-800/50">المتهم</p>
              </div>
            )}
          </div>
          <p className="text-center text-xs text-amber-800/60 mt-1 font-bold">
            {caseData.interrogationDialogues?.accused?.name}
          </p>
        </div>

        {/* بيانات القضية */}
        <div className="flex-1">
          <h1 className="text-lg font-black text-amber-900 mb-1">{caseData.title}</h1>
          <p className="text-xs text-amber-700 mb-3 font-bold tracking-wide">
            {caseData.category} — {caseData.difficulty}
          </p>

          <div className="space-y-1.5">
            <DataRow label="المتهم"   value={caseData.interrogationDialogues?.accused?.name} />
            <DataRow label="التهمة"   value={caseData.judgeFile?.page1?.charge?.split("،")[0] || caseData.judgeFile?.summary?.split(".")[0] || caseData.prosecutionFile?.summary?.split(".")[0]} />
            <DataRow label="الفئة"    value={caseData.category} />
            <DataRow label="المدة"    value={caseData.estimatedTime} />
          </div>
        </div>
      </div>

      {/* ملخص القضية */}
      <div className="mb-4 p-3 rounded-lg" style={{ background: "#e8dfc8", border: "1px solid #c8a84b" }}>
        <p className="text-xs font-black text-amber-900 mb-2">📋 ملخص القضية</p>
        <p className="text-xs leading-relaxed text-amber-800">
          <HighlightableText
            text={
              caseData.judgeFile?.summary ||
              caseData.judgeFile?.page2?.incident?.slice(0, 300) + "..." ||
              caseData.prosecutionFile?.summary ||
              ""
            }
            textKey="cover_summary"
            {...hlProps}
          />
        </p>
      </div>

      {/* دور اللاعب */}
      <div className="p-3 rounded-lg" style={{ background: "#ddd5b8", border: "1px dashed #8b6914" }}>
        <p className="text-xs font-black text-amber-900 mb-1">🎭 دورك في هذه القضية</p>
        <p className="text-xs text-amber-800 leading-relaxed">
          <HighlightableText
            text={getRoleDescription(role)}
            textKey="cover_role"
            {...hlProps}
          />
        </p>
      </div>
    </>
  );
}

// ── صفحة الأدلة ──
function EvidencePage({ evidence, hlProps }) {
  const [zoomedImage, setZoomedImage] = useState(null);

  return (
    <>
      <h2 className="text-sm font-black text-amber-900 mb-4 flex items-center gap-2">
        <span>🔍</span> الأدلة والإثباتات
      </h2>
      <div className="space-y-3">
        {evidence.map((ev, i) => (
          <div key={ev.id || i} className="p-3 rounded-lg"
            style={{ background: "#e8dfc8", border: "1px solid #c8a84b" }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black text-amber-900">{ev.title}</span>
              {ev.strength && (
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                  ev.strength === "قوي" ? "bg-red-700 text-white" : "bg-yellow-700 text-white"
                }`}>{ev.strength}</span>
              )}
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              <HighlightableText
                text={ev.content}
                textKey={`ev_${ev.id || i}`}
                {...hlProps}
              />
            </p>

            {/* ── صورة الدليل المادي ── */}
            {ev.image && (
              <button
                onClick={() => setZoomedImage(ev)}
                className="mt-3 w-full rounded-lg overflow-hidden border-2 border-amber-700/40 hover:border-amber-600 transition-all relative group"
                style={{ maxHeight: 140 }}
              >
                <img
                  src={ev.image}
                  alt={ev.title}
                  className="w-full object-cover"
                  style={{ maxHeight: 140 }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                  <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 bg-black/60 px-2 py-1 rounded">
                    🔍 تكبير
                  </span>
                </div>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ── Modal تكبير الدليل ── */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.9)" }}
          onClick={() => setZoomedImage(null)}
        >
          <div className="max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <div className="bg-amber-950 rounded-2xl overflow-hidden border border-amber-700">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-amber-800">
                <div>
                  <p className="text-amber-300 font-black text-sm">{zoomedImage.title}</p>
                  {zoomedImage.strength && (
                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                      zoomedImage.strength === "قوي" ? "bg-red-700 text-white" : "bg-yellow-700 text-white"
                    }`}>{zoomedImage.strength}</span>
                  )}
                </div>
                <button onClick={() => setZoomedImage(null)}
                  className="text-amber-500 hover:text-white text-xl w-8 h-8 flex items-center justify-center">
                  ✕
                </button>
              </div>

              {/* الصورة */}
              <div className="p-3">
                <img
                  src={zoomedImage.image}
                  alt={zoomedImage.title}
                  className="w-full rounded-lg object-contain"
                  style={{ maxHeight: 300 }}
                />
              </div>

              {/* التفاصيل */}
              <div className="px-4 pb-4">
                <p className="text-amber-200 text-xs leading-relaxed">{zoomedImage.content}</p>
                {zoomedImage.imageNote && (
                  <div className="mt-2 p-2 rounded-lg bg-amber-900/50 border border-amber-700/50">
                    <p className="text-amber-400 text-xs font-bold">🔎 ملاحظة على الصورة:</p>
                    <p className="text-amber-300 text-xs mt-0.5">{zoomedImage.imageNote}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── صفحة الثغرات ──
function LoopholesPage({ loopholes, hlProps }) {
  return (
    <>
      <h2 className="text-sm font-black text-amber-900 mb-4 flex items-center gap-2">
        <span>⚡</span> الثغرات القانونية
      </h2>
      <div className="space-y-3">
        {loopholes.map((lp, i) => (
          <div key={lp.id || i} className="p-3 rounded-lg"
            style={{ background: "#ddeedd", border: "1px solid #6b8e6b" }}>
            <p className="text-xs font-black text-green-900 mb-2">{lp.title}</p>
            <p className="text-xs text-green-800 leading-relaxed mb-2">
              <HighlightableText text={lp.content} textKey={`lp_${lp.id}`} {...hlProps} />
            </p>
            <div className="p-2 rounded" style={{ background: "#c8ddc8" }}>
              <p className="text-xs text-green-900 font-bold">💡 كيف تستخدمها:</p>
              <p className="text-xs text-green-800 mt-0.5">
                <HighlightableText text={lp.howToUse} textKey={`lp_use_${lp.id}`} {...hlProps} />
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── صفحة الجدول الزمني ──
function TimelinePage({ timeline, hlProps }) {
  return (
    <>
      <h2 className="text-sm font-black text-amber-900 mb-4 flex items-center gap-2">
        <span>🕐</span> الجدول الزمني للجريمة
      </h2>
      <div className="relative">
        {/* الخط الزمني */}
        <div className="absolute right-16 top-0 bottom-0 w-0.5 bg-amber-700/30" />

        <div className="space-y-4">
          {timeline.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              {/* الوقت */}
              <div className="flex-shrink-0 text-left" style={{ width: 56 }}>
                <span className="text-xs font-black text-amber-800 font-mono">{item.time}</span>
              </div>

              {/* النقطة */}
              <div className="flex-shrink-0 mt-1">
                <div className="w-3 h-3 rounded-full border-2 border-amber-700 bg-amber-100" />
              </div>

              {/* الحدث */}
              <div className="flex-1 pb-3">
                <p className="text-xs text-amber-800 leading-relaxed">
                <HighlightableText text={item.event} textKey={`tl_${i}`} {...hlProps} />
              </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── صفحة الحجج ──
function ArgumentsPage({ arguments: args, hlProps }) {
  return (
    <>
      <h2 className="text-sm font-black text-amber-900 mb-4 flex items-center gap-2">
        <span>🗣️</span> الحجج المقترحة
      </h2>
      <div className="space-y-2 mb-4">
        {args.map((arg, i) => (
          <div key={i} className="flex gap-2 p-2 rounded-lg"
            style={{ background: "#e8dfc8" }}>
            <span className="text-amber-700 font-black text-xs flex-shrink-0">{i + 1}.</span>
            <p className="text-xs text-amber-800 leading-relaxed">
              <HighlightableText text={arg} textKey={`arg_${i}`} {...hlProps} />
            </p>
          </div>
        ))}
      </div>


    </>
  );
}

// ── صفحة سر المتهم ──
function SecretPage({ data, hlProps }) {
  return (
    <>
      <div className="p-3 rounded-lg mb-4"
        style={{ background: "#ffe0e0", border: "2px solid #cc4444" }}>
        <p className="text-xs font-black text-red-900 mb-2">🔐 معلومة سرية — لا يراها غيرك</p>
        <p className="text-xs text-red-800 leading-relaxed font-bold">
          <HighlightableText text={data.secret || ""} textKey="secret_main" {...hlProps} />
        </p>
      </div>

      <div className="p-3 rounded-lg"
        style={{ background: "#e8dfc8", border: "1px solid #c8a84b" }}>
        <p className="text-xs font-black text-amber-900 mb-2">🎭 كيف تتصرف</p>
        <p className="text-xs text-amber-800 leading-relaxed">
          {data.openingStatement}
        </p>
      </div>
    </>
  );
}

// ── مكوّن صف البيانات ──
function DataRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex gap-2">
      <span className="text-xs font-black text-amber-800 flex-shrink-0">{label}:</span>
      <span className="text-xs text-amber-700 leading-relaxed">{value}</span>
    </div>
  );
}

// ── بناء صفحات الملف حسب الدور ──
// ══════════════════════════════════════════════
// صفحات القاضي الـ ٤
// ══════════════════════════════════════════════

// صفحة ١ — المحضر الرسمي
function JudgePage1({ data, hlProps }) {
  return (
    <>
      {/* الترويسة الرسمية */}
      <div className="text-center mb-5 pb-3" style={{ borderBottom: "2px solid #8b6914" }}>
        <p className="text-xs font-black text-amber-800 tracking-widest mb-0.5">{data.header}</p>
        <p className="text-xs text-amber-700">{data.court}</p>
      </div>

      {/* بيانات المتهم */}
      <div className="mb-4 p-3 rounded-lg" style={{ background: "#ffe8e8", border: "1px solid #cc8888" }}>
        <p className="text-xs font-black text-red-900 mb-2">أولاً: بيانات المتهم</p>
        <p className="text-xs text-red-800 leading-relaxed whitespace-pre-line">
          <HighlightableText text={data.accused} textKey="jp1_accused" {...hlProps} />
        </p>
      </div>

      {/* بيانات المجني عليها */}
      <div className="mb-4 p-3 rounded-lg" style={{ background: "#e8f0ff", border: "1px solid #8899cc" }}>
        <p className="text-xs font-black text-blue-900 mb-2">ثانياً: بيانات المجني عليها</p>
        <p className="text-xs text-blue-800 leading-relaxed whitespace-pre-line">
          <HighlightableText text={data.victim} textKey="jp1_victim" {...hlProps} />
        </p>
      </div>

      {/* التهمة */}
      <div className="p-3 rounded-lg" style={{ background: "#fff3e0", border: "2px solid #c8a84b" }}>
        <p className="text-xs font-black text-amber-900 mb-2">ثالثاً: التهمة الموجّهة</p>
        <p className="text-xs text-amber-800 leading-relaxed font-bold">
          <HighlightableText text={data.charge} textKey="jp1_charge" {...hlProps} />
        </p>
      </div>
    </>
  );
}

// صفحة ٢ — وقائع الحادثة
function JudgePage2({ data, hlProps }) {
  return (
    <>
      <h2 className="text-sm font-black text-amber-900 mb-4 flex items-center gap-2">
        <span>📖</span> وقائع الحادثة التفصيلية
      </h2>

      <div className="mb-4 p-3 rounded-lg" style={{ background: "#e8dfc8", border: "1px solid #c8a84b" }}>
        <p className="text-xs font-black text-amber-900 mb-2">رابعاً: سرد الأحداث</p>
        <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-line">
          <HighlightableText text={data.incident} textKey="jp2_incident" {...hlProps} />
        </p>
      </div>

      <div className="p-3 rounded-lg" style={{ background: "#ddd5b8", border: "1px dashed #8b6914" }}>
        <p className="text-xs font-black text-amber-900 mb-2">خامساً: الخلفية والدوافع</p>
        <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-line">
          <HighlightableText text={data.background} textKey="jp2_background" {...hlProps} />
        </p>
      </div>
    </>
  );
}

// صفحة ٣ — الأدلة والشهود
function JudgePage3({ data, hlProps }) {
  return (
    <>
      <h2 className="text-sm font-black text-amber-900 mb-4 flex items-center gap-2">
        <span>🔍</span> ملخص الأدلة المادية
      </h2>

      <div className="space-y-3 mb-5">
        {(data.evidenceSummary || []).map((ev, i) => (
          <div key={i} className="p-3 rounded-lg" style={{ background: "#e8dfc8", border: "1px solid #c8a84b" }}>
            <div className="flex items-start gap-2 mb-1">
              <span className="text-xs font-black text-amber-700 flex-shrink-0">{ev.number}.</span>
              <p className="text-xs font-black text-amber-900">{ev.title}</p>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed mb-2 pr-4">
              <HighlightableText text={ev.content} textKey={`jp3_ev_${i}`} {...hlProps} />
            </p>
            <div className="pr-4">
              <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                ev.weight.includes("عالية جداً") ? "bg-red-800 text-white" :
                ev.weight.includes("عالية")      ? "bg-red-700 text-white" :
                "bg-yellow-700 text-white"
              }`}>
                {ev.weight}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-lg" style={{ background: "#ddd5b8", border: "1px dashed #8b6914" }}>
        <p className="text-xs font-black text-amber-900 mb-2">سابعاً: قائمة الشهود</p>
        <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-line">
          <HighlightableText text={data.witnesses} textKey="jp3_witnesses" {...hlProps} />
        </p>
      </div>
    </>
  );
}

// صفحة ٤ — الإطار القانوني ومحاور الخلاف
function JudgePage4({ data, hlProps }) {
  return (
    <>
      <h2 className="text-sm font-black text-amber-900 mb-4 flex items-center gap-2">
        <span>⚖️</span> الإطار القانوني ومحاور الخلاف
      </h2>

      <div className="mb-4 p-3 rounded-lg" style={{ background: "#e8dfc8", border: "1px solid #c8a84b" }}>
        <p className="text-xs font-black text-amber-900 mb-2">ثامناً: الإطار القانوني</p>
        <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-line">
          <HighlightableText text={data.legalFramework} textKey="jp4_legal" {...hlProps} />
        </p>
      </div>

      <div className="p-3 rounded-lg" style={{ background: "#fff8e0", border: "2px solid #c8a84b" }}>
        <p className="text-xs font-black text-amber-900 mb-2">تاسعاً: محاور الخلاف الجوهرية</p>
        <p className="text-amber-700 text-xs mb-2 italic">
          هذه النقاط هي جوهر ما ستستمع إليه من المرافعتين:
        </p>
        <p className="text-xs text-amber-800 leading-relaxed whitespace-pre-line">
          <HighlightableText text={data.controversialPoints} textKey="jp4_controversial" {...hlProps} />
        </p>
      </div>
    </>
  );
}

function buildPages(caseData, role, myFile) {
  const pages = [
    { tab: "📋 الغلاف", type: "cover" },
  ];

  // ── النيابة ──
  if (role === "prosecution") {
    if (myFile.evidence?.length)
      pages.push({ tab: "🔍 الأدلة", type: "evidence", data: myFile.evidence });
    if (myFile.timeline?.length)
      pages.push({ tab: "🕐 الجدول", type: "timeline", data: myFile.timeline });
    if (myFile.suggestedArguments?.length)
      pages.push({ tab: "🗣️ الحجج", type: "arguments", data: myFile.suggestedArguments });
  }

  // ── المحامي ──
  if (role === "defense") {
    if (myFile.loopholes?.length)
      pages.push({ tab: "⚡ الثغرات", type: "loopholes", data: myFile.loopholes });
    if (myFile.suggestedArguments?.length)
      pages.push({ tab: "🗣️ الحجج", type: "arguments", data: myFile.suggestedArguments });
  }

  // ── القاضي — ٤ صفحات مفصّلة ──
  if (role === "judge") {
    const jf = caseData.judgeFile;
    if (jf?.page1)
      pages.push({ tab: "📜 المحضر", type: "judge_p1", data: jf.page1 });
    if (jf?.page2)
      pages.push({ tab: "📖 الوقائع", type: "judge_p2", data: jf.page2 });
    if (jf?.page3)
      pages.push({ tab: "🔍 الأدلة", type: "judge_p3", data: jf.page3 });
    if (jf?.page4)
      pages.push({ tab: "⚖️ القانون", type: "judge_p4", data: jf.page4 });
  }

  // ── المتهم ──
  if (role === "accused") {
    pages.push({
      tab: "🔐 سرك",
      type: "secret",
      data: {
        secret: caseData.truth?.secretToAccused,
        openingStatement: caseData.interrogationDialogues?.accused?.openingStatement,
      },
    });
  }

  return pages;
}

// ── وصف الدور ──
function getRoleDescription(role) {
  const map = {
    judge:       "أنت رئيس المحكمة. استمع للمرافعات، استجوب المتهم، وأصدر الحكم النهائي بناءً على الأدلة والمنطق القانوني.",
    prosecution: "أنت وكيل النيابة. مهمتك إثبات إدانة المتهم باستخدام الأدلة المتاحة والحجج القانونية.",
    defense:     "أنت محامي الدفاع. مهمتك إيجاد الثغرات في أدلة النيابة والدفاع عن موكلك بكل الطرق المتاحة.",
    accused:     "أنت المتهم. استمع للمرافعات وردّ على أسئلة القاضي بحكمة. الحقيقة السرية موجودة في ورقتك.",
    jury:        "أنت عضو في هيئة المحلفين. استمع للجميع وصوّت في النهاية بضمير.",
  };
  return map[role] || "";
}