import { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import UrbexMainMenu   from "./UrbexMainMenu";
import UrbexMythBook   from "./UrbexMythBook";
import UrbexGameEngine from "./UrbexGameEngine";

const SERVER_URL = import.meta.env?.VITE_SERVER_URL || "http://localhost:3001";

// ══════════════════════════════════════════════
// شاشة اختيار الفصل
// ══════════════════════════════════════════════
function ChapterSelect({ chapters, lang, onSelect, onBack }) {
  const isRtl = lang === "ar";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "radial-gradient(ellipse at 50% 30%, #1a1008 0%, #0a0704 60%, #050302 100%)" }}
      dir={isRtl ? "rtl" : "ltr"}>
      {["top-4 left-4 border-t border-l","top-4 right-4 border-t border-r",
        "bottom-4 left-4 border-b border-l","bottom-4 right-4 border-b border-r"].map((cls,i) => (
        <span key={i} className={`absolute ${cls} border-[#c9a84c]/20 w-6 h-6`} />
      ))}
      <div className="w-full max-w-md">
        <p className="text-center text-[#c9a84c]/60 text-xs tracking-[0.4em] uppercase mb-2">
          {isRtl ? "اختر الفصل" : "Select Chapter"}
        </p>
        <p className="text-center text-[#5a4a3a] text-xs tracking-wider mb-8">
          {isRtl ? "كل فصل قصة مستقلة بأماكن وأسرار جديدة" : "Each chapter is a standalone story"}
        </p>
        <div className="flex flex-col gap-3">
          {chapters.map((ch, i) => (
            <button key={ch.id} onClick={() => onSelect(ch)}
              className="group relative border border-[#2a1f14] bg-[#0d0a06]/80 p-5 text-left hover:border-[#c9a84c]/30 hover:bg-[#c9a84c]/5 transition-all duration-300">
              <span className="absolute left-0 top-0 bottom-0 w-px bg-[#c9a84c]/0 group-hover:bg-[#c9a84c]/50 transition-all duration-300" />
              <div className="flex items-start gap-4">
                <span className="text-[#c9a84c]/30 text-3xl font-bold" style={{ fontFamily: "Georgia,serif" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <p className="text-[#e8d9b0] text-sm font-semibold tracking-wide mb-1">
                    {isRtl ? ch.titleAr : ch.titleEn}
                  </p>
                  <p className="text-[#5a4a3a] text-xs leading-relaxed line-clamp-2">
                    {(isRtl ? ch.mythAr : ch.mythEn)?.split("\n")[0]}
                  </p>
                </div>
                <span className="text-[#2a1f14] group-hover:text-[#c9a84c]/40 transition-colors">›</span>
              </div>
            </button>
          ))}
        </div>
        <button onClick={onBack}
          className="w-full mt-6 border border-[#1a1208] text-[#5a4a3a] hover:text-[#c9a84c] text-xs tracking-[0.3em] py-3 transition-colors">
          {isRtl ? "رجوع" : "BACK"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// Waiting Room
// ══════════════════════════════════════════════
function WaitingRoom({ roomId, playerName, isHost, players, lang, chapters, onStartGame, onBack }) {
  const isRtl = lang === "ar";
  const [copied, setCopied] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(roomId).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  if (showChapters && isHost) return (
    <ChapterSelect chapters={chapters} lang={lang}
      onSelect={ch => onStartGame(ch.id)} onBack={() => setShowChapters(false)} />
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "radial-gradient(ellipse at 50% 30%, #1a1008 0%, #0a0704 60%, #050302 100%)" }}
      dir={isRtl ? "rtl" : "ltr"}>
      {["top-4 left-4 border-t border-l","top-4 right-4 border-t border-r",
        "bottom-4 left-4 border-b border-l","bottom-4 right-4 border-b border-r"].map((cls,i) => (
        <span key={i} className={`absolute ${cls} border-[#c9a84c]/20 w-6 h-6`} />
      ))}
      <div className="w-full max-w-sm">
        <p className="text-center text-[#5a4a3a] text-xs tracking-[0.3em] uppercase mb-3">
          {isRtl ? "كود الغرفة" : "Room Code"}
        </p>
        <div onClick={copy}
          className="border border-[#c9a84c]/20 p-4 text-center mb-2 cursor-pointer hover:border-[#c9a84c]/40 transition-all">
          <p className="text-[#c9a84c] text-3xl font-bold tracking-[0.5em] font-mono">{roomId}</p>
        </div>
        <button onClick={copy} className="w-full text-[#5a4a3a] hover:text-[#c9a84c] text-xs tracking-wider transition-colors mb-8 text-center">
          {copied ? (isRtl ? "✓ اتنسخ" : "✓ Copied") : (isRtl ? "انسخ الكود" : "Copy Code")}
        </button>
        <div className="border border-[#1a1208] bg-[#0d0a06]/60 p-4 mb-6">
          <p className="text-[#5a4a3a] text-xs tracking-[0.3em] mb-3 uppercase text-center">
            {players.length} {isRtl ? "لاعبين" : "players"}
          </p>
          <div className="flex flex-col gap-2">
            {players.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/10 flex items-center justify-center">
                  <span className="text-[#c9a84c] text-xs font-bold">{p.name?.[0]?.toUpperCase()}</span>
                </div>
                <span className="text-[#b8a88a] text-xs tracking-wide flex-1">{p.name}</span>
                {p.isHost && <span className="text-[#c9a84c]/40 text-xs">{isRtl ? "هوست" : "host"}</span>}
              </div>
            ))}
          </div>
        </div>
        {!isHost && (
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]/40 animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <p className="text-[#5a4a3a] text-xs tracking-wider">
              {isRtl ? "في انتظار صاحب الغرفة..." : "Waiting for host..."}
            </p>
          </div>
        )}
        {isHost && (
          <button onClick={() => setShowChapters(true)}
            className="w-full border border-[#c9a84c]/40 text-[#c9a84c] text-sm tracking-[0.3em] py-4 hover:bg-[#c9a84c]/8 transition-all mb-3">
            {isRtl ? "ابدأ اللعبة" : "START GAME"}
          </button>
        )}
        <button onClick={onBack}
          className="w-full border border-[#1a1208] text-[#5a4a3a] hover:text-[#c9a84c] text-xs tracking-[0.3em] py-3 transition-colors">
          {isRtl ? "رجوع" : "BACK"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// Transition Screen
// ══════════════════════════════════════════════
function TransitionScreen({ text, subtext }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: "#050302" }}>
      <p className="text-[#c9a84c] text-xs tracking-[0.5em] uppercase mb-4 animate-fadeIn">{text}</p>
      {subtext && (
        <p className="text-[#3a2812] text-xs tracking-[0.3em] animate-fadeIn" style={{ animationDelay: "0.3s" }}>
          {subtext}
        </p>
      )}
      <div className="mt-8 flex gap-1.5">
        {[0,1,2,3].map(i => (
          <div key={i} className="w-1 h-1 rounded-full bg-[#c9a84c]/40 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .animate-fadeIn { animation: fadeIn .6s ease forwards }
      `}</style>
    </div>
  );
}

// ══════════════════════════════════════════════
// UrbexApp — المتحكم الرئيسي
// ══════════════════════════════════════════════
export default function UrbexApp({ onExit: appOnExit }) {

  const [screen,          setScreen]          = useState("menu");
  const [lang,            setLang]            = useState(() => localStorage.getItem("urbex_lang") || "ar");
  const [socketInst,      setSocketInst]      = useState(null);
  const [roomId,          setRoomId]          = useState(null);
  const [playerId,        setPlayerId]        = useState(() => `p_${Date.now()}_${Math.random().toString(36).slice(2,7)}`);
  const [playerName,      setPlayerName]      = useState("");
  const [isHost,          setIsHost]          = useState(false);
  const [players,         setPlayers]         = useState([]);
  const [chapters,        setChapters]        = useState([]);
  const [gameData,        setGameData]        = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [transition,      setTransition]      = useState(null);

  // ── Refs لحل مشكلة Stale Closure ─────────────────────────
  // هنا المشكلة الأساسية — الـ listener بيحتفظ بالقيم القديمة
  // الـ refs دايماً عندهم القيمة الحالية
  const playerIdRef   = useRef(playerId);
  const playerNameRef = useRef(playerName);
  const langRef       = useRef(lang);
  const isHostRef     = useRef(isHost);
  const roomIdRef     = useRef(roomId);
  const socketRef     = useRef(null);

  // نحدث الـ refs لما الـ state تتغير
  useEffect(() => { playerIdRef.current   = playerId;    }, [playerId]);
  useEffect(() => { playerNameRef.current = playerName;  }, [playerName]);
  useEffect(() => { langRef.current       = lang;        }, [lang]);
  useEffect(() => { isHostRef.current     = isHost;      }, [isHost]);
  useEffect(() => { roomIdRef.current     = roomId;      }, [roomId]);

  // ── WebSocket ─────────────────────────────────────────────
  useEffect(() => {
    const s = io(SERVER_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 2000,
    });
    socketRef.current = s;

    s.on("connect",    () => console.log("🔌 Urbex connected:", s.id));
    s.on("disconnect", () => console.log("🔌 Urbex disconnected"));

    s.on("urbex_chapters_list", ({ chapters: chs }) => setChapters(chs));

    s.on("urbex_player_joined", ({ playerId: pid, playerName: pname }) => {
      setPlayers(prev => {
        if (prev.find(p => p.id === pid)) return prev;
        return [...prev, { id: pid, name: pname, isHost: false }];
      });
    });

    s.on("urbex_player_left", ({ playerId: pid }) => {
      setPlayers(prev => prev.filter(p => p.id !== pid));
    });

    s.on("urbex_host_changed", ({ newHostId }) => {
      setPlayers(prev => prev.map(p => ({ ...p, isHost: p.id === newHostId })));
      if (newHostId === playerIdRef.current) setIsHost(true);
    });

    // ── الحدث الأهم — بيستخدم الـ refs مش الـ state ──────
    s.on("urbex_game_started", (data) => {
      console.log("🎮 urbex_game_started received", data);
      // الـ refs دايماً فيهم القيمة الحالية حتى لو الـ state اتغيرت
      setGameData({
        ...data,
        playerId:   playerIdRef.current,
        playerName: playerNameRef.current,
        language:   langRef.current,
        isHost:     isHostRef.current,
        roomState:  { roomId: roomIdRef.current },
      });
      setScreen("game");
    });

    setSocketInst(s);
    s.emit("urbex_get_chapters");

    return () => s.disconnect();
  }, []); // [] عشان يشتغل مرة واحدة بس — والـ refs بتضمن القيم الحالية

  useEffect(() => { localStorage.setItem("urbex_lang", lang); }, [lang]);

  // ── showTransition ────────────────────────────────────────
  const showTransition = useCallback((text, subtext, onDone, delay = 1500) => {
    setTransition({ text, subtext });
    setTimeout(() => { setTransition(null); onDone?.(); }, delay);
  }, []);

  // ── handleGameStart من MainMenu ───────────────────────────
  const handleGameStart = useCallback(({ mode, roomId: rid, playerName: pname, isHost: ih, roomState, language: lng }) => {
    const currentLang = lng || lang;
    setLang(currentLang);
    setPlayerName(pname);
    playerNameRef.current = pname;
    langRef.current       = currentLang;

    if (mode === "solo") {
      setIsHost(true);
      isHostRef.current = true;
      setScreen("chapter_select_solo");
      return;
    }

    // Multiplayer
    setRoomId(rid);
    roomIdRef.current = rid;
    setIsHost(ih);
    isHostRef.current = ih;
    if (roomState?.players) setPlayers(roomState.players);

    showTransition(
      currentLang === "ar" ? "جاري التحميل" : "Loading",
      rid,
      () => setScreen("waiting"),
      1200
    );
  }, [lang, showTransition]);

  // ── Solo: اختيار الفصل ───────────────────────────────────
  const handleSoloChapterSelect = useCallback((ch) => {
    setSelectedChapter(ch);
    setScreen("book_preview");
  }, []);

  // ── Solo: بعد الكتاب ─────────────────────────────────────
  const handleBookDone = useCallback(() => {
    const ch     = selectedChapter;
    const socket = socketRef.current;
    if (!ch || !socket) return;

    // تغيير الشاشة فوراً
    setScreen("loading");

    // إنشاء ID جديد للسولو
    const pid = `solo_${Date.now()}`;
    const rid = `SOLO_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // تحديث الـ state والـ refs مع بعض
    setPlayerId(pid);
    setRoomId(rid);
    playerIdRef.current = pid;   // ← مهم جداً: الـ ref يتحدث فوراً
    roomIdRef.current   = rid;   // ← مهم جداً: الـ ref يتحدث فوراً
    isHostRef.current   = true;

    // لما السيرفر يعمل الغرفة — نبدأ اللعبة
    socket.once("urbex_room_created", ({ roomId: createdRoomId }) => {
      console.log("✅ Room created:", createdRoomId);
      socket.emit("urbex_start_game", {
        roomId:    createdRoomId,
        chapterId: ch.id,
        playerId:  pid,
      });
    });

    // إنشاء الغرفة
    socket.emit("urbex_create_room", {
      playerId:   pid,
      playerName: playerNameRef.current,
      language:   langRef.current,
    });

  }, [selectedChapter]);

  // ── Multiplayer: بدء الفصل ───────────────────────────────
  const handleStartMultiplayer = useCallback((chapterId) => {
    const socket = socketRef.current;
    if (!socket) return;
    const ch = chapters.find(c => c.id === chapterId) ||
               FALLBACK_CHAPTERS.find(c => c.id === chapterId);
    setSelectedChapter(ch);
    setScreen("book_preview");
  }, [chapters]);

  // ── Multiplayer: بعد الكتاب ──────────────────────────────
  const handleBookDoneMultiplayer = useCallback(() => {
    const socket = socketRef.current;
    const ch     = selectedChapter;
    if (!socket || !ch) return;

    // تغيير الشاشة فوراً
    setScreen("loading");

    socket.emit("urbex_start_game", {
      roomId:    roomIdRef.current,
      chapterId: ch.id,
      playerId:  playerIdRef.current,
    });

  }, [selectedChapter]);

  // ── الخروج ───────────────────────────────────────────────
  const handleExit = useCallback(() => {
    setGameData(null);
    setSelectedChapter(null);
    setScreen("menu");
    appOnExit?.(); // لو اتفتحت من App.jsx الرئيسي
  }, [appOnExit]);

  // ── Helper ────────────────────────────────────────────────
  const isRoomMode = () => !!roomIdRef.current && !roomIdRef.current.startsWith("SOLO_");

  // ════════════════════════════════════════════
  // الرندر
  // ════════════════════════════════════════════

  if (transition) return <TransitionScreen text={transition.text} subtext={transition.subtext} />;

  if (screen === "menu") return (
    <UrbexMainMenu socket={socketInst} onGameStart={handleGameStart} />
  );

  if (screen === "chapter_select_solo") return (
    <ChapterSelect
      chapters={chapters.length ? chapters : FALLBACK_CHAPTERS}
      lang={lang}
      onSelect={handleSoloChapterSelect}
      onBack={() => setScreen("menu")}
    />
  );

  if (screen === "waiting") return (
    <WaitingRoom
      roomId={roomId}
      playerName={playerName}
      isHost={isHost}
      players={players}
      lang={lang}
      chapters={chapters.length ? chapters : FALLBACK_CHAPTERS}
      onStartGame={handleStartMultiplayer}
      onBack={() => setScreen("menu")}
    />
  );

  if (screen === "loading") return (
    <TransitionScreen
      text={lang === "ar" ? "جاري التحميل..." : "Loading..."}
      subtext={lang === "ar" ? selectedChapter?.titleAr : selectedChapter?.titleEn}
    />
  );

  if (screen === "book_preview") return (
    <div>
      <UrbexMythBook
        lang={lang}
        chapterId={selectedChapter?.id || "chapter_forest_01"}
        onClose={undefined}
      />
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]">
        <button
          onClick={isHost ? (isRoomMode() ? handleBookDoneMultiplayer : handleBookDone) : undefined}
          className={`
            border px-8 py-3 text-sm tracking-[0.3em] transition-all
            ${isHost
              ? "border-[#c9a84c]/50 text-[#c9a84c] hover:bg-[#c9a84c]/10 cursor-pointer"
              : "border-[#2a1f14] text-[#3a2812] cursor-not-allowed"
            }
          `}
          style={{ background: "#0d0a06ee" }}
        >
          {lang === "ar"
            ? isHost ? "← ادخل المكان" : "في انتظار الهوست..."
            : isHost ? "Enter the Location →" : "Waiting for host..."}
        </button>
      </div>
    </div>
  );

  if (screen === "game" && gameData) return (
    <UrbexGameEngine
      socket={socketInst}
      gameData={gameData}
      onExit={handleExit}
    />
  );

  return <UrbexMainMenu socket={socketInst} onGameStart={handleGameStart} />;
}

// ══════════════════════════════════════════════
// Fallback Chapters
// ══════════════════════════════════════════════
const FALLBACK_CHAPTERS = [
  {
    id: "chapter_forest_01",
    titleAr: "كوخ الغابة السوداء",
    titleEn: "The Black Forest Cabin",
    mythAr:
      "يقول أهل القرية إن غابة الصنوبر السوداء تأكل الذكريات،\n" +
      "ومن يدخلها يخرج بوجه تانية...\n\n" +
      "عائلة كمال اختفت سنة ١٩٩٤ في ليلة واحدة.\n" +
      "لم يجدوا جثثاً. لم يجدوا آثاراً.\n" +
      "وجدوا فقط... الكوخ.",
    mythEn:
      "The villagers say the Black Pine Forest devours memories,\n" +
      "and those who enter emerge as someone else...\n\n" +
      "The Kamal family vanished in 1994 in a single night.\n" +
      "No bodies. No traces. Only... the cabin.",
  },
];