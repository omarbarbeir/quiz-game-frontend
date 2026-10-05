import { useState, useEffect, useRef } from "react";
import CourtRoom360 from "./Courtroom360";
import CharacterChat from "./Characterchat";
import CaseFile from "./Casefile";

const PHASE = {
  WAITING: "waiting", READING: "reading", TRIAL: "trial",
  VOTING: "voting",   VERDICT: "verdict", DEBRIEF: "debrief",
};

const ROLE_LABELS = {
  judge:       { ar: "القاضي",        icon: "⚖️",  color: "#f59e0b" },
  prosecution: { ar: "وكيل النيابة",  icon: "📋",  color: "#ef4444" },
  defense:     { ar: "محامي الدفاع",  icon: "🛡️",  color: "#3b82f6" },
  accused:     { ar: "المتهم",        icon: "🔗",  color: "#6b7280" },
  jury:        { ar: "المحلفون",      icon: "👥",  color: "#10b981" },
};

const VERDICT_OPTIONS = [
  { id: "guilty",       label: "إدانة",          icon: "🔨", color: "#ef4444" },
  { id: "not_guilty",   label: "براءة",          icon: "✅", color: "#10b981" },
  { id: "manslaughter", label: "قتل غير عمد",    icon: "⚖️", color: "#f59e0b" },
  { id: "refer",        label: "إحالة للتحقيق",  icon: "📂", color: "#8b5cf6" },
];

export default function CourtGame({ socket, roomCode, playerId, playerName, onExit }) {
  const [phase, setPhase]           = useState(PHASE.WAITING);
  const [role, setRole]             = useState(null);
  const [team, setTeam]             = useState(null);
  const [myFile, setMyFile]         = useState(null);
  const [mySecret, setMySecret]     = useState(null);
  const [caseInfo, setCaseInfo]     = useState(null);
  const [caseData, setCaseData]     = useState(null);
  const [cases, setCases]           = useState([]);
  const [isHost, setIsHost]         = useState(false);
  const [timer, setTimer]           = useState(0);
  const [votes, setVotes]           = useState({});
  const [verdict, setVerdict]       = useState(null);
  const [debrief, setDebrief]       = useState(null);
  const [players, setPlayers]       = useState([]);
  const [selectedVerdict, setSelectedVerdict] = useState(null);
  const [readyCount, setReadyCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(1);

  // شاشة Trial
  const [activeChat, setActiveChat] = useState(null);
  const [showFile, setShowFile]     = useState(false);

  // ══ Socket Events ══
  useEffect(() => {
    if (!socket) return;
    socket.emit("court_join", { roomCode, playerId, playerName, mode: "multi" });
    socket.emit("court_get_cases", { roomCode });

    socket.on("court_joined", (d) => {
      setCaseInfo(d.caseInfo); setIsHost(d.isHost); setPlayers(d.players || []);
    });
    socket.on("court_cases_list", ({ cases }) => setCases(cases));
    socket.on("court_player_joined", ({ playerId: pid, playerName: pn }) => {
      setPlayers(prev => prev.find(p => p.id === pid) ? prev : [...prev, { id: pid, name: pn }]);
    });
    socket.on("court_player_left", ({ playerId: pid }) => {
      setPlayers(prev => prev.filter(p => p.id !== pid));
    });
    socket.on("court_phase_changed", ({ phase: p }) => {
      setPhase(p);
      if (p === PHASE.TRIAL) { setShowFile(false); setActiveChat(null); }
    });
    socket.on("court_role_assigned", ({ role: r, team: t, file, secret, caseData: cd }) => {
      setRole(r); setTeam(t); setMyFile(file);
      if (secret) setMySecret(secret);
      if (cd) setCaseData(cd);
    });
    socket.on("court_timer_update",  ({ seconds }) => setTimer(seconds));
    socket.on("court_ready_update",  ({ readyCount: rc, totalPlayers: tp }) => {
      setReadyCount(rc); setTotalPlayers(tp);
    });
    socket.on("court_vote_cast", ({ playerId: pid, voted }) => {
      setVotes(prev => ({ ...prev, [pid]: voted ? "voted" : null }));
    });
    socket.on("court_verdict_announced", ({ verdict: v }) => {
      setVerdict(v); setPhase(PHASE.VERDICT);
    });
    socket.on("court_debrief", (d) => { setDebrief(d); setPhase(PHASE.DEBRIEF); });
    socket.on("court_restarted", () => {
      setPhase(PHASE.WAITING); setRole(null); setTeam(null);
      setMyFile(null); setMySecret(null); setCaseData(null);
      setVotes({}); setVerdict(null); setDebrief(null);
      setReadyCount(0); setSelectedVerdict(null);
      setActiveChat(null); setShowFile(false);
    });
    socket.on("court_case_changed", ({ caseInfo: ci }) => setCaseInfo(ci));

    return () => {
      ["court_joined","court_cases_list","court_player_joined","court_player_left",
       "court_phase_changed","court_role_assigned","court_timer_update",
       "court_ready_update","court_vote_cast","court_verdict_announced",
       "court_debrief","court_restarted","court_case_changed"]
        .forEach(ev => socket.off(ev));
    };
  }, [socket, roomCode, playerId, playerName]);

  // ══ Actions ══
  const startGame  = () => socket.emit("court_start_game",   { roomCode, playerId });
  const markReady  = () => socket.emit("court_player_ready", { roomCode, playerId });
  const endTrial   = () => socket.emit("court_end_trial",    { roomCode, playerId });
  const restart    = () => socket.emit("court_restart",      { roomCode, playerId });
  const changeCase = (id) => socket.emit("court_change_case",{ roomCode, playerId, caseId: id });
  const submitVote = () => {
    if (!selectedVerdict) return;
    socket.emit("court_vote", { roomCode, playerId, verdict: selectedVerdict });
  };

  // ══ مكوّنات مساعدة ══
  const RoleBadge = ({ r }) => {
    const info = ROLE_LABELS[r] || { ar: r, icon: "👤", color: "#6b7280" };
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
        style={{ backgroundColor: info.color+"22", border:`1px solid ${info.color}`, color: info.color }}>
        {info.icon} {info.ar}
      </span>
    );
  };

  const TimerBar = ({ maxTime }) => {
    const pct   = Math.round((timer / maxTime) * 100);
    const color = timer < 30 ? "#ef4444" : timer < 60 ? "#f59e0b" : "#10b981";
    const mins  = Math.floor(timer / 60);
    const secs  = timer % 60;
    return (
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>الوقت المتبقي</span>
          <span style={{ color }} className="font-mono font-bold">
            {mins}:{String(secs).padStart(2,"0")}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div className="h-1.5 rounded-full transition-all duration-1000"
            style={{ width:`${pct}%`, backgroundColor: color }} />
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════
  // شاشة الانتظار
  // ══════════════════════════════════════════════
  if (phase === PHASE.WAITING) return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">⚖️</div>
          <h1 className="text-3xl font-black text-amber-400 mb-1">قاعة المحكمة</h1>
          <p className="text-gray-400 text-sm">
            كود الغرفة: <span className="font-mono font-bold text-white">{roomCode}</span>
          </p>
        </div>

        {caseInfo && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
            <div className="flex gap-3">
              <span className="text-3xl">📁</span>
              <div>
                <h2 className="font-black text-white">{caseInfo.title}</h2>
                <p className="text-gray-400 text-sm">
                  {caseInfo.category} · {caseInfo.difficulty} · {caseInfo.estimatedTime}
                </p>
              </div>
            </div>
          </div>
        )}

        {isHost && cases.length > 0 && (
          <div className="mb-4">
            <p className="text-gray-500 text-xs mb-2">اختر قضية:</p>
            {cases.map(c => (
              <button key={c.id} onClick={() => changeCase(c.id)}
                className="w-full text-right px-4 py-3 rounded-xl border mb-2 text-sm transition-all"
                style={caseInfo?.id === c.id
                  ? { borderColor:"#f59e0b", background:"#451a0322", color:"#fbbf24" }
                  : { borderColor:"#374151", background:"#111827",   color:"#9ca3af" }}>
                <span className="font-bold">{c.title}</span>
                <span className="text-gray-500 mr-2">— {c.difficulty}</span>
              </button>
            ))}
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
          <p className="text-gray-500 text-xs mb-2">اللاعبون ({players.length})</p>
          <div className="flex flex-wrap gap-2">
            {players.map(p => (
              <span key={p.id} className="bg-gray-800 text-white text-sm px-3 py-1 rounded-full">
                {p.name}{p.id === playerId ? " (أنت)" : ""}
              </span>
            ))}
          </div>
        </div>

        {isHost ? (
          <button onClick={startGame}
            className="w-full py-4 rounded-2xl font-black text-lg bg-amber-500 hover:bg-amber-400 text-black transition-all">
            🔨 ابدأ الجلسة
          </button>
        ) : (
          <p className="text-center text-gray-500 text-sm py-4">في انتظار المضيف...</p>
        )}

        {onExit && (
          <button onClick={onExit} className="w-full mt-3 py-2 text-gray-600 text-sm">
            خروج
          </button>
        )}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════
  // شاشة القراءة
  // ══════════════════════════════════════════════
  if (phase === PHASE.READING) return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col" dir="rtl">
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-amber-400">📄 مرحلة القراءة</h2>
          {role && <RoleBadge r={role} />}
        </div>
        <TimerBar maxTime={180} />

        <div className="flex-1 overflow-hidden mb-4">
          <CaseFile caseData={caseData} role={role} myFile={myFile} />
        </div>

        {mySecret && (
          <div className="bg-red-950 border border-red-700 rounded-2xl p-4 mb-4">
            <p className="text-red-400 text-xs font-bold mb-2">🔐 سرك الخاص — لا يراه أحد</p>
            <p className="text-red-100 text-sm leading-relaxed">{mySecret}</p>
          </div>
        )}

        <div>
          <div className="text-center text-gray-500 text-xs mb-2">
            {readyCount}/{totalPlayers} جاهز
          </div>
          <button onClick={markReady}
            className="w-full py-3 rounded-2xl font-black bg-green-600 hover:bg-green-500 text-white transition-all">
            ✅ جاهز — ابدأ الجلسة
          </button>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════
  // شاشة المرافعة — الصورة تملأ الشاشة
  // ══════════════════════════════════════════════
  if (phase === PHASE.TRIAL) return (
    <div className="fixed inset-0 bg-gray-950 text-white flex flex-col" dir="rtl">

      {/* Header رفيع فوق الصورة */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent px-4 pt-3 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚖️</span>
          <div>
            <p className="font-black text-white text-xs leading-none drop-shadow">الجلسة جارية</p>
            {caseInfo && <p className="text-white/50 text-xs drop-shadow">{caseInfo.title}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {role && <RoleBadge r={role} />}
          <button
            onClick={() => setShowFile(f => !f)}
            className="text-xs px-3 py-1.5 rounded-xl font-bold transition-all backdrop-blur-sm"
            style={{
              background: showFile ? "#c8a84b" : "rgba(0,0,0,0.5)",
              color:      showFile ? "#000"    : "#fff",
              border:     "1px solid rgba(255,255,255,0.15)",
            }}
          >
            📄 الملف
          </button>
        </div>
      </div>

      {/* ── الصورة البانورامية تملأ الشاشة كلها ── */}
      <div className="absolute inset-0">
        <CourtRoom360
          role={role}
          onInteract={(characterId) => {
            if (characterId === role) return;
            setActiveChat(characterId);
          }}
        />
      </div>

      {/* زر إنهاء المرافعة للقاضي */}
      {role === "judge" && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none">
          <button
            onClick={endTrial}
            className="pointer-events-auto px-6 py-3 rounded-2xl font-black text-sm bg-amber-600/90 hover:bg-amber-500 text-white backdrop-blur-sm shadow-lg transition-all"
          >
            🔨 إنهاء المرافعة
          </button>
        </div>
      )}

      {/* ── ملف القضية — overlay فوق الصورة ── */}
      {showFile && (
        <div
          className="absolute inset-0 z-30 flex flex-col"
          style={{
            background: "rgba(0,0,0,0.88)",
            backdropFilter: "blur(10px)",
            animation: "slideUp 0.25s ease-out",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/60 flex-shrink-0">
            <h3 className="font-black text-white text-sm">📄 ملف القضية</h3>
            <button
              onClick={() => setShowFile(false)}
              className="text-gray-500 hover:text-white text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-hidden p-3">
            <CaseFile caseData={caseData} role={role} myFile={myFile} />
          </div>
        </div>
      )}

      {/* ── Character Chat Pop-up فوق كل حاجة ── */}
      {activeChat && (
        <CharacterChat
          characterId={activeChat}
          caseData={caseData}
          myRole={role}
          onClose={() => setActiveChat(null)}
        />
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );

  // ══════════════════════════════════════════════
  // شاشة التصويت
  // ══════════════════════════════════════════════
  if (phase === PHASE.VOTING) return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🗳️</div>
          <h2 className="text-2xl font-black text-amber-400">مرحلة التصويت</h2>
          <p className="text-gray-400 text-sm mt-1">الحكم النهائي</p>
        </div>

        {(role === "accused" || role === "defense") ? (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">⏳</div>
            <p className="text-gray-300 text-sm">فريق الدفاع لا يصوت.</p>
            <p className="text-gray-500 text-xs mt-1">في انتظار حكم المحكمة...</p>
          </div>
        ) : (
          <div>
            <div className="space-y-3 mb-6">
              {VERDICT_OPTIONS.map(v => (
                <button key={v.id} onClick={() => setSelectedVerdict(v.id)}
                  className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 border-2 transition-all"
                  style={selectedVerdict === v.id
                    ? { backgroundColor:v.color+"22", borderColor:v.color, color:v.color }
                    : { borderColor:"#374151", color:"#6b7280" }}>
                  <span className="text-2xl">{v.icon}</span>
                  {v.label}
                </button>
              ))}
            </div>
            <button onClick={submitVote} disabled={!selectedVerdict}
              className="w-full py-4 rounded-2xl font-black text-lg bg-amber-500 hover:bg-amber-400 text-black transition-all disabled:opacity-40">
              🔨 أصدر الحكم
            </button>
          </div>
        )}

        <div className="mt-4 text-center text-gray-500 text-xs">
          {Object.keys(votes).length} صوّتوا حتى الآن
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════
  // شاشة الحكم
  // ══════════════════════════════════════════════
  if (phase === PHASE.VERDICT) return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="text-center">
        <div className="text-8xl mb-6 animate-bounce">🔨</div>
        <h2 className="text-4xl font-black text-amber-400 mb-4">
          {verdict === "guilty" ? "إدانة!" : verdict === "not_guilty" ? "براءة!" : "إحالة!"}
        </h2>
        <p className="text-gray-400">جارٍ كشف الحقيقة...</p>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════
  // شاشة التقرير النهائي
  // ══════════════════════════════════════════════
  if (phase === PHASE.DEBRIEF && debrief) return (
    <div className="min-h-screen bg-gray-950 text-white p-4 overflow-y-auto" dir="rtl">
      <div className="max-w-2xl mx-auto">
        <div className={`rounded-3xl p-6 mb-6 text-center border-2 ${
          debrief.resultType === "justice"
            ? "bg-green-950 border-green-600"
            : "bg-red-950 border-red-600"
        }`}>
          <div className="text-5xl mb-3">
            {debrief.resultType === "justice" ? "⚖️" : "🔴"}
          </div>
          <h2 className="text-2xl font-black text-white mb-2">{debrief.resultLabel}</h2>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-4">
          <h3 className="font-black text-white mb-3">🔍 الحقيقة الكاملة</h3>
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-400">الجاني: </span><span className="text-white font-bold">{debrief.truth.culprit}</span></div>
            <div><span className="text-gray-400">الطريقة: </span><span className="text-white">{debrief.truth.method}</span></div>
            <div><span className="text-gray-400">الدافع: </span><span className="text-white">{debrief.truth.motive}</span></div>
            <div><span className="text-gray-400">الدليل الأهم: </span><span className="text-amber-300">{debrief.truth.keyEvidence}</span></div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-4">
          <h3 className="font-black text-white mb-3">📖 القصة كاملة</h3>
          <p className="text-gray-300 text-sm leading-relaxed">{debrief.debriefReport.fullStory}</p>
          <div className="mt-3 bg-red-950 border border-red-800 rounded-xl p-3">
            <p className="text-red-400 text-xs font-bold mb-1">الخطأ الكبير:</p>
            <p className="text-red-200 text-xs">{debrief.debriefReport.keyMistake}</p>
          </div>
        </div>

        {/* النقاط + الألقاب */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-6">
          <h3 className="font-black text-white mb-3">🏆 النقاط والألقاب</h3>
          <div className="space-y-2">
            {Object.values(debrief.scores || {})
              .sort((a, b) => b.points - a.points)
              .map(s => {
                const title = getTitle(s.role, s.points, debrief.resultType);
                return (
                  <div key={s.playerId}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      s.playerId === playerId
                        ? "bg-amber-950 border border-amber-700"
                        : "bg-gray-800"
                    }`}>
                    <div className="flex items-center gap-2">
                      <RoleBadge r={s.role} />
                      <div>
                        <span className="text-sm text-white">{s.playerName}</span>
                        {s.playerId === playerId && (
                          <span className="text-xs text-amber-400 mr-1">(أنت)</span>
                        )}
                        <p className="text-xs mt-0.5" style={{ color: title.color }}>
                          {title.icon} {title.label}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-black ${
                        s.points > 0 ? "text-green-400" :
                        s.points < 0 ? "text-red-400"   : "text-gray-400"
                      }`}>
                        {s.points > 0 ? "+" : ""}{s.points}
                      </div>
                      <div className="text-xs text-gray-500">{s.outcome}</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {isHost && (
          <button onClick={restart}
            className="w-full py-4 rounded-2xl font-black text-lg bg-amber-500 hover:bg-amber-400 text-black transition-all">
            🔄 جولة جديدة
          </button>
        )}
        {onExit && (
          <button onClick={onExit} className="w-full mt-3 py-2 text-gray-600 text-sm">
            خروج
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center" dir="rtl">
      <div className="text-center">
        <div className="text-4xl mb-3">⚖️</div>
        <p className="text-gray-400">جارٍ التحميل...</p>
      </div>
    </div>
  );
}

// ══ نظام الألقاب ══
function getTitle(role, points, resultType) {
  if (role === "judge") {
    if (points > 0) return { label: "القاضي العادل",     icon: "⚖️",  color: "#f59e0b" };
    if (points < 0) return { label: "القاضي الظالم",     icon: "😔",  color: "#ef4444" };
    return              { label: "القاضي المتردد",       icon: "🤔",  color: "#6b7280" };
  }
  if (role === "prosecution") {
    if (points > 0) return { label: "المدّعي الحديدي",   icon: "🔥",  color: "#ef4444" };
    return              { label: "النيابة الصامتة",     icon: "📋",  color: "#6b7280" };
  }
  if (role === "defense") {
    if (points >= 150) return { label: "محامي الشيطان",  icon: "😈",  color: "#8b5cf6" };
    if (points > 0)   return { label: "المدافع الشريف",  icon: "🛡️",  color: "#3b82f6" };
    return              { label: "الدفاع المنهزم",      icon: "😞",  color: "#6b7280" };
  }
  if (role === "accused") {
    if (points >= 150) return { label: "الداهية الهارب", icon: "🎭",  color: "#10b981" };
    if (points > 0)   return { label: "البريء المظلوم",  icon: "🕊️",  color: "#10b981" };
    return              { label: "المذنب المدان",       icon: "🔗",  color: "#6b7280" };
  }
  if (role === "jury") {
    if (points > 0) return { label: "المحلف الذكي",      icon: "🧠",  color: "#10b981" };
    return              { label: "المحلف المخدوع",      icon: "😕",  color: "#6b7280" };
  }
  return { label: "", icon: "", color: "#6b7280" };
}