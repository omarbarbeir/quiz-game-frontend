import { useState, useEffect, useRef } from "react";

// ═══════════════════════════════════════════
// النصوص — عربي / إنجليزي
// ═══════════════════════════════════════════
const T = {
  ar: {
    tagline:     "الحقيقة أخطر من الخرافة",
    solo:        "لعب منفرد",
    create:      "إنشاء غرفة",
    join:        "انضمام لغرفة",
    howToPlay:   "كيف تلعب؟",
    roomCode:    "كود الغرفة",
    roomName:    "اسم الغرفة",
    yourName:    "اسمك",
    start:       "ابدأ",
    enter:       "ادخل",
    back:        "رجوع",
    creating:    "جاري الإنشاء...",
    joining:     "جاري الانضمام...",
    roomCreated: "تم إنشاء الغرفة",
    shareCode:   "شارك الكود مع أصحابك",
    copied:      "اتنسخ!",
    copy:        "انسخ الكود",
    waitingHost: "في انتظار صاحب الغرفة...",
    players:     "لاعبين",
    errName:     "اكتب اسمك الأول",
    errCode:     "كود الغرفة ٦ حروف/أرقام",
    errNotFound: "الغرفة مش موجودة",
    tutorial: {
      title: "كيف تلعب؟",
      steps: [
        { icon: "📖", t: "اقرأ الكتاب", d: "كل فصل فيه خرافة — جزء منها حقيقي. استخدمه دليلاً." },
        { icon: "🔦", t: "استكشف المكان", d: "التفت بالجايروسكوب أو الماوس في بيئات ٣٦٠ درجة." },
        { icon: "🧩", t: "حل الألغاز", d: "الأدلة اللي بتلاقيها بتفتحلك طريق للحقيقة." },
        { icon: "👥", t: "تعاون مع الفريق", d: "كل لاعب ممكن يلاقي دليل تاني — شاركوا اللي عندكم." },
        { icon: "📍", t: "إشارة Ping", d: "لقيت حاجة مهمة؟ أرسل إشارة للشلة على طول." },
      ],
    },
  },
  en: {
    tagline:     "The truth is more dangerous than the myth",
    solo:        "Solo Play",
    create:      "Create Room",
    join:        "Join Room",
    howToPlay:   "How To Play?",
    roomCode:    "Room Code",
    roomName:    "Room Name",
    yourName:    "Your Name",
    start:       "Start",
    enter:       "Enter",
    back:        "Back",
    creating:    "Creating...",
    joining:     "Joining...",
    roomCreated: "Room Created",
    shareCode:   "Share this code with your friends",
    copied:      "Copied!",
    copy:        "Copy Code",
    waitingHost: "Waiting for host...",
    players:     "players",
    errName:     "Enter your name first",
    errCode:     "Room code is 6 characters",
    errNotFound: "Room not found",
    tutorial: {
      title: "How To Play?",
      steps: [
        { icon: "📖", t: "Read the Book", d: "Each chapter has a myth — part of it is real. Use it as a guide." },
        { icon: "🔦", t: "Explore the Location", d: "Look around with gyroscope or mouse drag in 360° environments." },
        { icon: "🧩", t: "Solve the Puzzles", d: "The clues you find open the path to the truth." },
        { icon: "👥", t: "Team Up", d: "Each player may find a different clue — share what you have." },
        { icon: "📍", t: "Ping Signal", d: "Found something important? Signal the team immediately." },
      ],
    },
  },
};

// ═══════════════════════════════════════════
// Particle — جزيئات الغلاف
// ═══════════════════════════════════════════
function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let   raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      o: Math.random() * 0.5 + 0.15,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,160,120,${p.o})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} />;
}

// ═══════════════════════════════════════════
// OldButton
// ═══════════════════════════════════════════
function OldBtn({ children, onClick, variant = "primary", disabled = false, fullWidth = false, small = false }) {
  const base = `
    relative inline-flex items-center justify-center gap-2 font-semibold tracking-widest
    border transition-all duration-300 cursor-pointer select-none
    ${small ? "text-xs px-4 py-2" : "text-sm px-6 py-3"}
    ${fullWidth ? "w-full" : ""}
    ${disabled ? "opacity-40 cursor-not-allowed" : ""}
  `;
  const styles = {
    primary:  "bg-transparent border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c]/10 hover:shadow-[0_0_18px_#c9a84c44]",
    ghost:    "bg-transparent border-[#5a4a3a] text-[#8a7a6a] hover:border-[#c9a84c]/50 hover:text-[#c9a84c]",
    danger:   "bg-transparent border-[#8b3030] text-[#c97070] hover:bg-[#8b3030]/10",
  };
  return (
    <button className={`${base} ${styles[variant]}`} onClick={disabled ? undefined : onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// ═══════════════════════════════════════════
// OldInput
// ═══════════════════════════════════════════
function OldInput({ placeholder, value, onChange, maxLength, center = false, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`
        w-full bg-transparent border-b border-[#5a4a3a] text-[#e8d9b0] placeholder-[#5a4a3a]
        py-2 px-1 text-sm tracking-widest outline-none
        focus:border-[#c9a84c] transition-colors duration-300
        ${center ? "text-center" : ""}
      `}
    />
  );
}

// ═══════════════════════════════════════════
// شاشة التوتوريال
// ═══════════════════════════════════════════
function TutorialScreen({ lang, onBack }) {
  const t = T[lang];
  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <h2 className="text-center text-[#c9a84c] tracking-[0.3em] text-sm uppercase font-bold">
        {t.tutorial.title}
      </h2>
      <div className="flex flex-col gap-4">
        {t.tutorial.steps.map((s, i) => (
          <div key={i} className="flex gap-4 items-start border border-[#2a1f14] p-4 bg-[#0d0a06]/60">
            <span className="text-2xl mt-0.5 shrink-0">{s.icon}</span>
            <div>
              <p className="text-[#c9a84c] text-sm font-semibold tracking-wider mb-1">{s.t}</p>
              <p className="text-[#8a7a6a] text-xs leading-relaxed">{s.d}</p>
            </div>
          </div>
        ))}
      </div>
      <OldBtn variant="ghost" onClick={onBack} fullWidth>{t.back}</OldBtn>
    </div>
  );
}

// ═══════════════════════════════════════════
// شاشة اللعب المنفرد
// ═══════════════════════════════════════════
function SoloScreen({ lang, socket, onStart, onBack }) {
  const t      = T[lang];
  const [name, setName]   = useState("");
  const [err,  setErr]    = useState("");

  const handle = () => {
    if (!name.trim()) { setErr(t.errName); return; }
    const playerId = `solo_${Date.now()}`;
    onStart({ mode: "solo", playerId, playerName: name.trim(), language: lang });
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <h2 className="text-center text-[#c9a84c] tracking-[0.3em] text-sm uppercase font-bold">{t.solo}</h2>
      <OldInput placeholder={t.yourName} value={name} onChange={v => { setName(v); setErr(""); }} maxLength={20} center />
      {err && <p className="text-center text-[#c97070] text-xs tracking-wider">{err}</p>}
      <OldBtn onClick={handle} fullWidth>{t.start}</OldBtn>
      <OldBtn variant="ghost" onClick={onBack} fullWidth>{t.back}</OldBtn>
    </div>
  );
}

// ═══════════════════════════════════════════
// شاشة إنشاء الغرفة
// ═══════════════════════════════════════════
function CreateRoomScreen({ lang, socket, onRoomReady, onBack }) {
  const t = T[lang];
  const [name,    setName]    = useState("");
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");
  const [created, setCreated] = useState(null); // { roomId, players }
  const [copied,  setCopied]  = useState(false);

  useEffect(() => {
    if (!socket) return;
    const onCreated = ({ roomId, roomState }) => {
      setLoading(false);
      setCreated({ roomId, players: roomState.players });
    };
    const onJoined = ({ roomState }) => {
      setCreated(prev => prev ? { ...prev, players: roomState.players } : prev);
    };
    const onErr = ({ messageAr, messageEn }) => {
      setLoading(false);
      setErr(lang === "ar" ? messageAr : messageEn);
    };
    socket.on("urbex_room_created",  onCreated);
    socket.on("urbex_player_joined", onJoined);
    socket.on("urbex_error",         onErr);
    return () => {
      socket.off("urbex_room_created",  onCreated);
      socket.off("urbex_player_joined", onJoined);
      socket.off("urbex_error",         onErr);
    };
  }, [socket, lang]);

  const handle = () => {
    if (!name.trim()) { setErr(t.errName); return; }
    setLoading(true);
    setErr("");
    const playerId = `p_${Date.now()}`;
    socket.emit("urbex_create_room", { playerId, playerName: name.trim(), language: lang });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(created.roomId).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  if (created) return (
    <div className="flex flex-col gap-5 animate-fadeIn">
      <p className="text-center text-[#8a7a6a] text-xs tracking-[0.2em] uppercase">{t.roomCreated}</p>

      {/* الكود */}
      <div className="border border-[#c9a84c]/30 p-5 text-center bg-[#0d0a06]/80">
        <p className="text-[#c9a84c] text-3xl font-bold tracking-[0.5em] font-mono">{created.roomId}</p>
        <p className="text-[#5a4a3a] text-xs mt-2 tracking-wider">{t.shareCode}</p>
      </div>

      <OldBtn onClick={copyCode} fullWidth small>{copied ? t.copied : t.copy}</OldBtn>

      {/* اللاعبين */}
      <div className="border border-[#2a1f14] p-3 bg-[#0d0a06]/60">
        <p className="text-[#5a4a3a] text-xs tracking-wider mb-2 text-center">
          {created.players.length} {t.players}
        </p>
        {created.players.map(p => (
          <div key={p.id} className="flex items-center gap-2 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] shrink-0" />
            <span className="text-[#e8d9b0] text-xs tracking-wider">{p.name}</span>
            {p.isHost && <span className="text-[#c9a84c]/50 text-xs">(host)</span>}
          </div>
        ))}
      </div>

      <OldBtn onClick={() => onRoomReady({ roomId: created.roomId, playerName: name.trim(), isHost: true })} fullWidth>
        {t.start}
      </OldBtn>
      <OldBtn variant="ghost" onClick={onBack} fullWidth>{t.back}</OldBtn>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <h2 className="text-center text-[#c9a84c] tracking-[0.3em] text-sm uppercase font-bold">{t.create}</h2>
      <OldInput placeholder={t.yourName} value={name} onChange={v => { setName(v); setErr(""); }} maxLength={20} center />
      {err && <p className="text-center text-[#c97070] text-xs tracking-wider">{err}</p>}
      <OldBtn onClick={handle} fullWidth disabled={loading}>{loading ? t.creating : t.create}</OldBtn>
      <OldBtn variant="ghost" onClick={onBack} fullWidth>{t.back}</OldBtn>
    </div>
  );
}

// ═══════════════════════════════════════════
// شاشة الانضمام لغرفة
// ═══════════════════════════════════════════
function JoinRoomScreen({ lang, socket, onRoomReady, onBack }) {
  const t = T[lang];
  const [name,    setName]    = useState("");
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");

  useEffect(() => {
    if (!socket) return;
    const onJoined = ({ roomId, roomState }) => {
      setLoading(false);
      onRoomReady({ roomId, playerName: name.trim(), isHost: false, roomState });
    };
    const onErr = ({ messageAr, messageEn }) => {
      setLoading(false);
      setErr(lang === "ar" ? messageAr : messageEn);
    };
    socket.on("urbex_joined", onJoined);
    socket.on("urbex_error",  onErr);
    return () => { socket.off("urbex_joined", onJoined); socket.off("urbex_error", onErr); };
  }, [socket, lang, name]);

  const handle = () => {
    if (!name.trim())        { setErr(t.errName);    return; }
    if (code.trim().length < 4) { setErr(t.errCode); return; }
    setLoading(true); setErr("");
    const playerId = `p_${Date.now()}`;
    socket.emit("urbex_join_room", { roomId: code.trim().toUpperCase(), playerId, playerName: name.trim(), language: lang });
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <h2 className="text-center text-[#c9a84c] tracking-[0.3em] text-sm uppercase font-bold">{t.join}</h2>
      <OldInput placeholder={t.yourName} value={name} onChange={v => { setName(v); setErr(""); }} maxLength={20} center />
      <OldInput
        placeholder={t.roomCode} value={code}
        onChange={v => { setCode(v.toUpperCase()); setErr(""); }}
        maxLength={6} center
      />
      {err && <p className="text-center text-[#c97070] text-xs tracking-wider">{err}</p>}
      <OldBtn onClick={handle} fullWidth disabled={loading}>{loading ? t.joining : t.enter}</OldBtn>
      <OldBtn variant="ghost" onClick={onBack} fullWidth>{t.back}</OldBtn>
    </div>
  );
}

// ═══════════════════════════════════════════
// الشاشة الرئيسية
// ═══════════════════════════════════════════
function HomeScreen({ lang, onNav }) {
  const t = T[lang];
  const menuItems = [
    { key: "solo",      label: t.solo,      icon: "◈" },
    { key: "create",    label: t.create,    icon: "✦" },
    { key: "join",      label: t.join,      icon: "⬡" },
    { key: "tutorial",  label: t.howToPlay, icon: "?" },
  ];
  return (
    <div className="flex flex-col gap-3 animate-fadeIn w-full">
      {menuItems.map(item => (
        <button
          key={item.key}
          onClick={() => onNav(item.key)}
          className="
            group relative w-full flex items-center gap-4 px-5 py-4
            border border-[#2a1f14] bg-[#0d0a06]/60
            hover:border-[#c9a84c]/40 hover:bg-[#c9a84c]/5
            transition-all duration-300 text-left
          "
        >
          {/* خط يسار */}
          <span className="absolute left-0 top-0 bottom-0 w-px bg-[#c9a84c]/0 group-hover:bg-[#c9a84c]/60 transition-all duration-300" />

          <span className="text-[#c9a84c]/40 group-hover:text-[#c9a84c] text-lg transition-colors duration-300 w-5 text-center">
            {item.icon}
          </span>
          <span className="text-[#8a7a6a] group-hover:text-[#e8d9b0] text-sm tracking-[0.25em] uppercase font-medium transition-colors duration-300">
            {item.label}
          </span>
          <span className="ml-auto text-[#2a1f14] group-hover:text-[#c9a84c]/40 text-xs transition-colors duration-300">›</span>
        </button>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════
// Main Export — UrbexMainMenu
// ═══════════════════════════════════════════
export default function UrbexMainMenu({ socket, onGameStart }) {
  const [lang,   setLang]   = useState("ar");
  const [screen, setScreen] = useState("home"); // home | solo | create | join | tutorial
  const [glitch, setGlitch] = useState(false);
  const isRtl = lang === "ar";

  // Glitch effect دوري
  useEffect(() => {
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120);
    }, 7000);
    return () => clearInterval(id);
  }, []);

  const toggleLang = () => setLang(l => l === "ar" ? "en" : "ar");
  const goHome     = () => setScreen("home");

  const handleRoomReady = ({ roomId, playerName, isHost, roomState }) => {
    onGameStart?.({ mode: "multiplayer", roomId, playerName, isHost, roomState, language: lang });
  };

  const handleSoloStart = ({ playerId, playerName }) => {
    onGameStart?.({ mode: "solo", playerId, playerName, language: lang });
  };

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 30%, #1a1008 0%, #0a0704 60%, #050302 100%)" }}
    >
      {/* Particles */}
      <Particles />

      {/* طبقة ضباب */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 30%, #050302aa 100%)" }} />

      {/* خطوط الإطار */}
      {["top-4 left-4 border-t border-l", "top-4 right-4 border-t border-r",
        "bottom-4 left-4 border-b border-l", "bottom-4 right-4 border-b border-r"].map((cls, i) => (
        <span key={i} className={`absolute ${cls} border-[#c9a84c]/20 w-6 h-6`} />
      ))}

      {/* مبدل اللغة */}
      <button
        onClick={toggleLang}
        className="
          absolute top-5 right-5 z-20
          text-[#5a4a3a] hover:text-[#c9a84c] text-xs tracking-[0.25em]
          border border-[#2a1f14] hover:border-[#c9a84c]/40
          px-3 py-1.5 transition-all duration-300 bg-[#0d0a06]/80
        "
      >
        {lang === "ar" ? "EN" : "عر"}
      </button>

      {/* الجسم الرئيسي */}
      <div className="relative z-10 w-full max-w-sm px-6 flex flex-col items-center gap-8">

        {/* الشعار */}
        <div className="text-center select-none">
          {/* رمز العين */}
          <div className="flex justify-center mb-4">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <ellipse cx="24" cy="24" rx="20" ry="12" stroke="#c9a84c" strokeWidth="1" opacity="0.6"/>
              <circle cx="24" cy="24" r="6" stroke="#c9a84c" strokeWidth="1" opacity="0.8"/>
              <circle cx="24" cy="24" r="2" fill="#c9a84c" opacity="0.9"/>
              <line x1="4" y1="24" x2="10" y2="24" stroke="#c9a84c" strokeWidth="0.8" opacity="0.4"/>
              <line x1="38" y1="24" x2="44" y2="24" stroke="#c9a84c" strokeWidth="0.8" opacity="0.4"/>
            </svg>
          </div>

          {/* الاسم */}
          <h1
            className={`
              text-4xl font-black tracking-[0.15em] uppercase mb-1
              transition-all duration-100
              ${glitch ? "text-[#c97070] translate-x-0.5" : "text-[#e8d9b0]"}
            `}
            style={{ fontFamily: "Georgia, serif", textShadow: "0 0 30px #c9a84c33" }}
          >
            {lang === "ar" ? "المستكشفون" : "URBEX"}
          </h1>

          {/* الوصف */}
          <p className="text-[#5a4a3a] text-xs tracking-[0.3em] uppercase mt-1">
            {lang === "ar" ? "لعبة الغموض والأسرار" : "Mystery & Secrets Game"}
          </p>

          {/* فاصل */}
          <div className="flex items-center gap-3 mt-4 justify-center">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#c9a84c]/40" />
            <span className="text-[#c9a84c]/40 text-xs">✦</span>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#c9a84c]/40" />
          </div>

          {/* Tagline */}
          <p className="text-[#c9a84c]/60 text-xs tracking-[0.2em] mt-3 italic">
            "{T[lang].tagline}"
          </p>
        </div>

        {/* المحتوى */}
        <div className="w-full border border-[#1a1208] bg-[#0d0a06]/70 p-6"
          style={{ boxShadow: "0 0 40px #00000088, inset 0 0 20px #c9a84c08" }}>

          {screen === "home"     && <HomeScreen     lang={lang} onNav={setScreen} />}
          {screen === "solo"     && <SoloScreen     lang={lang} socket={socket} onStart={handleSoloStart} onBack={goHome} />}
          {screen === "create"   && <CreateRoomScreen lang={lang} socket={socket} onRoomReady={handleRoomReady} onBack={goHome} />}
          {screen === "join"     && <JoinRoomScreen  lang={lang} socket={socket} onRoomReady={handleRoomReady} onBack={goHome} />}
          {screen === "tutorial" && <TutorialScreen  lang={lang} onBack={goHome} />}
        </div>

        {/* Footer */}
        <p className="text-[#2a1f14] text-xs tracking-[0.3em] text-center">
          {lang === "ar" ? "لا تدخل وحدك" : "DON'T ENTER ALONE"}
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.35s ease forwards; }
      `}</style>
    </div>
  );
}