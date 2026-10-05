import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ Global styles
const GLOBAL_STYLES = `
  @keyframes nextBtnGlow {
    0%, 100% {
      box-shadow: 
        0 0 20px rgba(251,191,36,0.5), 
        0 0 40px rgba(251,191,36,0.3),
        inset 0 0 10px rgba(255,255,255,0.3);
    }
    50% {
      box-shadow: 
        0 0 40px rgba(251,191,36,0.9), 
        0 0 80px rgba(251,191,36,0.5),
        inset 0 0 25px rgba(255,255,255,0.7);
    }
  }
  .next-btn {
    animation: nextBtnGlow 2s ease-in-out infinite;
    transform: translateZ(0);
    will-change: box-shadow;
    isolation: isolate;
  }
  .next-btn:focus, .next-btn:focus-visible {
    outline: none;
  }

  /* ✅ زرار Buzz — بنفسجي بـ gradient متحرك + glow داخلي */
  @keyframes buzzBorderSpin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes buzzGradientMove {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  .buzz-wrapper {
    position: relative;
    border-radius: 9999px;
    padding: 2px;
    overflow: hidden;
    isolation: isolate;
    transform: translateZ(0);
  }
  .buzz-wrapper::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200%;
    height: 200%;
    margin-left: -100%;
    margin-top: -100%;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      transparent 60deg,
      #a855f7 90deg,
      #e9d5ff 120deg,
      transparent 150deg,
      transparent 360deg
    );
    animation: buzzBorderSpin 3s linear infinite;
    z-index: 0;
  }
  .buzz-wrapper-inner {
    position: relative;
    border-radius: 9999px;
    background: linear-gradient(
      270deg,
      #6d28d9 0%,
      #7c3aed 25%,
      #a855f7 50%,
      #8b5cf6 75%,
      #6d28d9 100%
    );
    background-size: 300% 300%;
    animation: buzzGradientMove 4s ease infinite;
    box-shadow:
      inset 0 0 20px rgba(255, 255, 255, 0.15),
      inset 0 0 40px rgba(168, 85, 247, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
    z-index: 1;
  }
  .buzz-wrapper-inner:focus, .buzz-wrapper-inner:focus-visible {
    outline: none;
  }
  .buzz-disabled::before {
    display: none;
  }
  .buzz-disabled .buzz-wrapper-inner {
    background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
    animation: none;
    box-shadow: none;
  }
`;

// =====================================================
// 🔧 Helpers
// =====================================================
function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .trim()
    .replace(/[إأآا]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[ًٌٍَُِّْـ]/g, '')
    .replace(/[^\w\s\u0600-\u06FF]/g, '')
    .replace(/\s+/g, ' ');
}

function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[a.length][b.length];
}

function scoreMovie(query, title) {
  const nq = normalize(query);
  const nt = normalize(title);
  if (!nq || !nt) return 0;

  if (nt.includes(nq)) return 1000 - nt.length;

  const queryTokens = nq.split(/\s+/).filter(Boolean);
  const titleTokens = nt.split(/\s+/).filter(Boolean);
  if (queryTokens.length === 0) return 0;

  let totalScore = 0;
  let matched = 0;

  for (const qt of queryTokens) {
    let best = 0;
    for (const tt of titleTokens) {
      if (tt === qt) { best = Math.max(best, 1); continue; }
      if (tt.includes(qt) || qt.includes(tt)) { best = Math.max(best, 0.85); continue; }
      const dist = levenshtein(qt, tt);
      const maxLen = Math.max(qt.length, tt.length);
      if (maxLen === 0) continue;
      const similarity = 1 - dist / maxLen;
      if (qt.length >= 3 && similarity >= 0.6) {
        best = Math.max(best, similarity);
      }
    }
    if (best > 0) matched++;
    totalScore += best;
  }

  const matchRatio = matched / queryTokens.length;
  if (matchRatio < 0.5) return 0;

  return (totalScore / queryTokens.length) * 100 * matchRatio;
}

function filterMovies(query, movies) {
  const q = normalize(query);
  if (!q) return [];

  const scored = movies
    .map((m) => ({ movie: m, score: scoreMovie(query, m.title) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return scored.map((x) => x.movie);
}

function highlightMatch(text, query) {
  const nq = normalize(query);
  const nt = normalize(text);
  if (!nq) return [{ text, hl: false }];

  const idx = nt.indexOf(nq);
  if (idx === -1) {
    const tokens = nq.split(/\s+/);
    for (const token of tokens) {
      if (token.length < 2) continue;
      const i = nt.indexOf(token);
      if (i !== -1) {
        return [
          { text: text.slice(0, i), hl: false },
          { text: text.slice(i, i + token.length), hl: true },
          { text: text.slice(i + token.length), hl: false },
        ];
      }
    }
    return [{ text, hl: false }];
  }

  let origStart = -1;
  let normCount = 0;
  const origToNorm = [];
  for (let i = 0; i < text.length; i++) {
    origToNorm[i] = normCount;
    const c = text[i];
    let skip = false;
    if (/[ًٌٍَُِّْـ]/.test(c)) skip = true;
    if (!skip) normCount++;
  }
  origToNorm[text.length] = normCount;

  for (let i = 0; i < text.length; i++) {
    if (origToNorm[i] === idx) { origStart = i; break; }
  }
  if (origStart === -1) return [{ text, hl: false }];

  let origEnd = text.length;
  for (let i = origStart; i < text.length; i++) {
    if (origToNorm[i] >= idx + nq.length) { origEnd = i; break; }
  }

  return [
    { text: text.slice(0, origStart), hl: false },
    { text: text.slice(origStart, origEnd), hl: true },
    { text: text.slice(origEnd), hl: false },
  ];
}

// =====================================================
// 🔊 Sounds
// =====================================================
function useSoundEffects() {
  const ref = useRef({});
  useEffect(() => {
    const files = {
      correct: '/sounds/correct.mp3',
      wrong: '/sounds/wrong.mp3',
      buzz: '/sounds/ready.mp3',
      win: '/sounds/win.mp3',
      tick: '/sounds/tick.mp3',
    };
    Object.entries(files).forEach(([k, p]) => {
      try {
        const a = new Audio(p);
        a.preload = 'auto';
        a.volume = 0.5;
        ref.current[k] = a;
      } catch {}
    });
  }, []);
  const play = useCallback((k) => {
    try {
      const a = ref.current[k];
      if (!a) return;
      a.currentTime = 0;
      const p = a.play();
      if (p && p.catch) p.catch(() => {});
    } catch {}
  }, []);
  const stopAll = useCallback(() => {
    try {
      Object.values(ref.current).forEach((a) => {
        if (!a) return;
        a.pause();
        a.currentTime = 0;
      });
    } catch {}
  }, []);
  return { play, stopAll };
}

// =====================================================
// 🌌 Background
// =====================================================
const BackgroundFX = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-[#050510]" />
    <motion.div
      className="absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full opacity-40 blur-3xl"
      style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 65%)' }}
      animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute -bottom-1/4 -right-1/4 w-[70vw] h-[70vw] rounded-full opacity-40 blur-3xl"
      style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 65%)' }}
      animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
      transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
    />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050510_95%)]" />
  </div>
);

// =====================================================
// 💎 Glass
// =====================================================
const GlassButton = ({ children, onClick, disabled, variant = 'primary', size = 'md', className = '' }) => {
  const variants = {
    primary: { c1: '#22d3ee', c2: '#a855f7', glow: '34,211,238' },
    danger: { c1: '#ef4444', c2: '#ec4899', glow: '239,68,68' },
    success: { c1: '#10b981', c2: '#22d3ee', glow: '16,185,129' },
    amber: { c1: '#fbbf24', c2: '#f97316', glow: '251,191,36' },
    neutral: { c1: '#64748b', c2: '#94a3b8', glow: '148,163,184' },
  };
  const v = variants[variant] || variants.primary;
  const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-base', lg: 'px-8 py-4 text-lg', xl: 'px-10 py-6 text-2xl' };
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.04, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`relative group ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      style={{ boxShadow: !disabled ? `0 0 40px -12px rgba(${v.glow},0.5)` : 'none' }}
    >
      <span className="absolute inset-0 rounded-2xl overflow-hidden p-[1.5px]">
        <motion.span
          className="absolute inset-[-150%]"
          style={{ background: `conic-gradient(from 0deg, transparent 0%, ${v.c1} 15%, ${v.c2} 30%, transparent 45%, transparent 100%)` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        <span className="absolute inset-[1.5px] rounded-2xl bg-[#0a0a1a]" />
      </span>
      <span className={`relative block rounded-2xl ${sizes[size]} font-bold text-white backdrop-blur-xl bg-white/[0.04] group-hover:bg-white/[0.08] transition-colors duration-300`}>
        {children}
      </span>
    </motion.button>
  );
};

const GlassCard = ({ children, className = '', accent = null }) => (
  <div className={`relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl overflow-hidden ${className}`}>
    {accent && (
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${accent}, transparent 70%)` }} />
    )}
    <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    <div className="relative">{children}</div>
  </div>
);

// =====================================================
// 🎊 Confetti
// =====================================================
const Confetti = () => {
  const colors = ['#22d3ee', '#a855f7', '#ec4899', '#fbbf24', '#10b981'];
  const pieces = Array.from({ length: 70 });
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-20">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 1.5;
        const dur = 3 + Math.random() * 2;
        const c = colors[Math.floor(Math.random() * colors.length)];
        const s = 6 + Math.random() * 8;
        return (
          <motion.div key={i} className="absolute rounded-sm"
            style={{ left: `${left}%`, top: '-5%', width: s, height: s * 1.8, background: c }}
            initial={{ y: 0, rotate: 0, opacity: 1 }}
            animate={{ y: '110vh', rotate: 900 + Math.random() * 720, opacity: [1, 1, 1, 0] }}
            transition={{ duration: dur, delay, ease: 'easeIn', repeat: Infinity, repeatDelay: Math.random() * 2 }} />
        );
      })}
    </div>
  );
};

// =====================================================
// 🔍 Movie Autocomplete
// =====================================================
const MovieAutocomplete = ({ movies, onSelect, disabled }) => {
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const [open, setOpen] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => filterMovies(query, movies), [query, movies]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(0, filtered.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(0, h - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlight]) onSelect(filtered[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={(e) => e.preventDefault()}
          placeholder="اكتب اسم الفيلم..."
          disabled={disabled}
          className="w-full bg-white/[0.06] border-2 border-cyan-400/40 rounded-2xl p-4 pr-12 text-xl font-bold text-white outline-none focus:border-cyan-400 transition placeholder:text-slate-500"
          autoComplete="off"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl pointer-events-none">
          🔍
        </span>

        <AnimatePresence>
          {open && query && filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute z-20 left-0 right-0 mt-2 bg-[#0a0a1a] border border-cyan-400/40 rounded-2xl overflow-hidden shadow-2xl shadow-cyan-500/20"
            >
              <div className="max-h-72 overflow-y-auto">
                {filtered.map((m, i) => {
                  const parts = highlightMatch(m.title, query);
                  return (
                    <button
                      key={m.id}
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => onSelect(m)}
                      className={`w-full text-right p-4 transition flex items-center gap-3 ${
                        i === highlight ? 'bg-cyan-500/20 border-r-4 border-cyan-400' : 'hover:bg-white/5'
                      }`}
                    >
                      <span className="text-xl">🎬</span>
                      <span className="font-bold text-white">
                        {parts.map((p, idx) =>
                          p.hl ? (
                            <span key={idx} className="bg-cyan-400/30 text-cyan-300 px-0.5 rounded">{p.text}</span>
                          ) : (
                            <span key={idx}>{p.text}</span>
                          )
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {open && query && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute z-20 left-0 right-0 mt-2 bg-[#0a0a1a] border border-red-500/40 rounded-2xl p-4 text-center"
            >
              <p className="text-red-300 text-sm">مفيش فيلم بالاسم ده</p>
              <p className="text-slate-500 text-xs mt-1">جرّب تكتب حروف تانية</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-center text-xs text-slate-500 mt-5">
        💡 اختر الفيلم من القائمة — هيتبعت على طول
        <br />
        <span className="text-slate-600 text-[10px]">
          أو اضغط Enter لاختيار المحدد
        </span>
      </p>

      <p className="text-center text-xs text-slate-500 mt-3">
        💡 اختر الفيلم من القائمة عشان إجابتك تكون دقيقة
      </p>
    </div>
  );
};

// =====================================================
// ⏱️ Countdown Ring
// =====================================================
const CountdownRing = ({ value, total, size = 140, color = '#22d3ee', label }) => {
  const radius = (size - 14) / 2;
  const circ = 2 * Math.PI * radius;
  const p = total > 0 ? Math.max(0, Math.min(1, value / total)) : 0;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth="4" fill="none"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - p)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.15s linear', filter: `drop-shadow(0 0 10px ${color})` }} />
      </svg>
      <div className="relative text-center">
        <div className="text-4xl font-black tabular-nums" style={{ color }}>{Math.ceil(value)}</div>
        {label && <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{label}</div>}
      </div>
    </div>
  );
};

// =====================================================
// 🎮 MAIN
// =====================================================
export default function MovieQuiz({
  socket, roomCode, playerId, playerName, isAdmin = false, players = [], onExit,
}) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [videoAspect, setVideoAspect] = useState(16 / 9);
  const [videoLoading, setVideoLoading] = useState(false);
  const videoRef = useRef(null);
  const lastVideoPhaseRef = useRef(null);

  const { play: playSound, stopAll: stopAllSounds } = useSoundEffects();
  const prevPhaseRef = useRef(null);
  const tickRef = useRef(null);

  // Socket
  // Socket
  useEffect(() => {
    if (!socket) return;
    const onState = (s) => setState(s);
    const onError = ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    };

    socket.on('mq_state', onState);
    socket.on('mq_error', onError);

    // ✅ الأدمن بيدخل من نفس الـ join event بتاع اللاعبين
    if (playerId && playerName) {
      socket.emit('mq_join', { roomCode, playerId, playerName, isAdmin });
    }

    return () => {
      socket.off('mq_state', onState);
      socket.off('mq_error', onError);
      socket.emit('mq_leave', { roomCode });
    };
  }, [socket, roomCode, playerId, playerName, isAdmin]);

  // Clock
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, []);

  // Video play/pause
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !state) return;

    const shouldPlay = state.phase === 'playing' && state.videoStarted;

    if (shouldPlay) {
      if (v.readyState < 2) setVideoLoading(true);
      if (v.readyState >= 2) {
        if (v.currentTime > 0.1) v.currentTime = 0;
        v.play().catch(() => {});
      }
    } else {
      v.pause();
      setVideoLoading(false);
    }
    lastVideoPhaseRef.current = state.phase;
  }, [state?.phase, state?.video?.id, state?.videoStarted]);

  // ✅ Seamless loop — مراقبة مستمرة بـ requestAnimationFrame
  useEffect(() => {
    const shouldMonitor = state?.phase === 'playing' && state?.videoStarted;
    if (!shouldMonitor) return;

    const v = videoRef.current;
    if (!v) return;

    let rafId = null;
    let lastSeekTime = 0;

    const checkLoop = () => {
      if (v.duration && v.duration > 0 && v.currentTime > 0) {
        const remaining = v.duration - v.currentTime;
        const now = performance.now();

        // ✅ لو الفاضل أقل من 200ms، ارجع للبداية
        //    بس مرة كل 500ms على الأقل عشان مايحصلش seek spam
        if (remaining < 0.2 && remaining > 0 && now - lastSeekTime > 200) {
          lastSeekTime = now;
          try {
            v.currentTime = 0.05;
          } catch (e) {}
          // لو الفيديو اتوقف بسبب الـ seek، رجعه شغال
          if (v.paused) {
            v.play().catch(() => {});
          }
        }
      }
      rafId = requestAnimationFrame(checkLoop);
    };

    rafId = requestAnimationFrame(checkLoop);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [state?.phase, state?.videoStarted, state?.video?.id]);

  // Phase sounds
  useEffect(() => {
    if (!state) return;
    const prev = prevPhaseRef.current;
    const cur = state.phase;
    if (prev === cur) return;

    stopAllSounds();

    if (cur === 'buzzed') playSound('buzz');
    else if (cur === 'roundEnd' && state.buzzerResult === 'correct') playSound('correct');
    else if (cur === 'roundEnd' && (state.buzzerResult === 'wrong' || state.buzzerResult === 'timeout')) playSound('wrong');
    else if (cur === 'gameover') playSound('win');

    prevPhaseRef.current = cur;
  }, [state?.phase, state?.buzzerResult, playSound, stopAllSounds, state]);

  const buzzLeft = state?.buzzStartedAt
    ? Math.max(0, Math.ceil((state.buzzStartedAt + (state?.buzzTime || 0) - now) / 1000))
    : 0;

  useEffect(() => {
    if (state?.phase !== 'buzzed') return;
    if (buzzLeft <= 5 && buzzLeft > 0 && tickRef.current !== buzzLeft) {
      tickRef.current = buzzLeft;
      playSound('tick');
    }
    if (buzzLeft > 5) tickRef.current = null;
  }, [state?.phase, buzzLeft, playSound]);

  const emit = useCallback((ev, payload) => {
    socket?.emit(ev, { roomCode, ...payload });
  }, [socket, roomCode]);

  const roundSeconds = state?.roundEndsAt
    ? Math.max(0, Math.ceil((state.roundEndsAt - now) / 1000))
    : state?.roundTimeLeft
    ? Math.ceil(state.roundTimeLeft / 1000)
    : 0;

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!state) {
    return (
      <div dir="rtl" className="relative min-h-screen bg-[#050510] text-white flex items-center justify-center">
        <BackgroundFX />
        <div className="relative z-10 text-center">
          <motion.div className="w-16 h-16 rounded-full mx-auto mb-4"
            style={{ border: '3px solid transparent', borderTopColor: '#22d3ee', borderRightColor: '#a855f7' }}
            animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
          <p className="text-slate-400 tracking-wider">جاري تجهيز السينما...</p>
        </div>
      </div>
    );
  }

  const { phase, me } = state;
  const canReveal = me?.canReveal;

  // ============================================================
  // HUD
  // ============================================================
  const renderHUD = () => (
    <div className="relative z-30 max-w-7xl mx-auto px-4 pt-4">
      <GlassCard className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition">
              <span>←</span><span>خروج</span>
            </button>
            {canReveal && (
              <motion.button
                onClick={() => { if (window.confirm('ترجع للشاشة الرئيسية؟')) onExit(); }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="relative rounded-xl p-[1.5px] overflow-hidden"
              >
                <motion.span
                  className="absolute inset-[-150%]"
                  style={{ background: 'conic-gradient(from 0deg, transparent 0%, #22d3ee 20%, #a855f7 40%, transparent 60%, transparent 100%)' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                <span className="relative block rounded-xl px-3 py-1.5 bg-[#0a0a1a] text-xs font-bold flex items-center gap-1.5">
                  <span>🏠</span><span>الرئيسية</span>
                </span>
              </motion.button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest">النقاط</p>
              <p className="text-2xl font-black text-emerald-400 tabular-nums">{me.score}</p>
            </div>
            {phase === 'playing' && (
              <div className="text-center">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest">الوقت</p>
                {state.videoStarted ? (
                  <p className={`text-2xl font-black tabular-nums ${roundSeconds <= 30 ? 'text-red-400' : 'text-cyan-400'}`}>
                    {formatTime(roundSeconds)}
                  </p>
                ) : (
                  <p className="text-2xl font-black text-amber-400 animate-pulse">
                    جاهز
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {canReveal && phase !== 'lobby' && phase !== 'gameover' && state.video?.id && state.video?.title === null && (
              <motion.button
                onClick={() => emit('mq_reveal_answer')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 20px -4px rgba(245,158,11,0.5)',
                    '0 0 40px -4px rgba(245,158,11,1)',
                    '0 0 20px -4px rgba(245,158,11,0.5)',
                  ],
                }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="rounded-xl px-5 py-2.5 text-sm font-black bg-amber-500/25 border-2 border-amber-500 text-amber-200 flex items-center gap-2"
              >
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  🎬
                </motion.span>
                <span>أظهر الفيلم</span>
              </motion.button>
            )}
            <div className="text-xs text-slate-500 font-mono">{roomCode}</div>
          </div>
        </div>
      </GlassCard>
    </div>
  );

  // ============================================================
  // ADMIN LOBBY
  // ============================================================
  const renderAdminLobby = () => {
    const canStart = state.players.length > 0;
    return (
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        <GlassCard className="p-6 text-center">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-6xl mb-3">
            🎬
          </motion.div>
          <h2 className="text-3xl font-black mb-1">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              فيلم إيه؟
            </span>
          </h2>
          <p className="text-slate-400 text-sm">
            أول واحد يوصل {state.targetScore} نقطة يفوز
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">اللاعبون</h3>
            <span className="text-xs text-slate-500">{state.players.length}</span>
          </div>
          {state.players.length === 0 && (
            <p className="text-slate-600 text-sm italic text-center py-4">في انتظار انضمام اللاعبين...</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {state.players.map((p) => (
              <div key={p.id} className="rounded-xl p-3 bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <span className="text-sm">{p.name}</span>
                <span className="text-sm font-black text-cyan-400 tabular-nums">{p.score}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassButton
          variant={canStart ? 'success' : 'neutral'}
          size="lg"
          disabled={!canStart}
          onClick={() => emit('mq_start')}
          className="w-full"
        >
          {canStart ? '🎬 ابدأ اللعبة' : 'في انتظار اللاعبين...'}
        </GlassButton>
      </div>
    );
  };

  // ============================================================
  // PLAYER LOBBY
  // ============================================================
  const renderPlayerLobby = () => (
    <div className="max-w-2xl mx-auto px-4 py-6 text-center">
      <GlassCard className="p-8">
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">
          🎬
        </motion.div>
        <h2 className="text-3xl font-black mb-3">
          <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            فيلم إيه؟
          </span>
        </h2>
        <p className="text-slate-400 mb-6">
          لما تعرف الفيلم، دوس على زرار Buzz واكتب اسمه
        </p>
        <motion.p className="text-cyan-300 text-sm inline-flex items-center gap-2"
          animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          في انتظار الأدمن يبدأ...
        </motion.p>
      </GlassCard>
    </div>
  );

  // ============================================================
  // VIDEO + OVERLAYS
  // ============================================================
  const renderVideo = () => (
    <div className="relative w-full h-full bg-black">
      {state.video?.videoUrl ? (
        <>
          <video
            ref={videoRef}
            src={state.video.videoUrl}
            muted
            playsInline
            preload="auto"
            // @ts-ignore
            disablePictureInPicture
            onLoadedMetadata={(e) => {
              const v = e.target;
              if (v.videoWidth > 0 && v.videoHeight > 0) {
                setVideoAspect(v.videoWidth / v.videoHeight);
              }
            }}
            onLoadStart={() => setVideoLoading(true)}
            onLoadedData={() => {
              setVideoLoading(false);
              if (state?.phase === 'playing' && state?.videoStarted) {
                const v = videoRef.current;
                if (v) {
                  if (v.currentTime > 0.1) v.currentTime = 0;
                  v.play().catch(() => {});
                }
              }
            }}
            onCanPlay={() => {
              setVideoLoading(false);
              if (state?.phase === 'playing' && state?.videoStarted) {
                const v = videoRef.current;
                if (v && v.paused) {
                  if (v.currentTime > 0.1) v.currentTime = 0;
                  v.play().catch(() => {});
                }
              }
            }}
            onTimeUpdate={(e) => {
              // ✅ الحل: نرجع للبداية قبل ما الفيديو يخلص
              const v = e.target;
              if (!v.duration || v.duration < 1) return;
              const remaining = v.duration - v.currentTime;
              if (remaining < 0.1 && remaining > 0) {
                v.currentTime = 0.01;
                if (v.paused && state?.phase === 'playing' && state?.videoStarted) {
                  v.play().catch(() => {});
                }
              }
            }}
            onEnded={(e) => {
              // ✅ حل احتياطي: لو الفيديو خلص قبل ما onTimeUpdate يمسكه
              const v = e.target;
              if (state?.phase === 'playing' && state?.videoStarted) {
                v.currentTime = 0;
                v.play().catch(() => {});
              }
            }}
            onWaiting={() => setVideoLoading(true)}
            onPlaying={() => setVideoLoading(false)}
            className="w-full h-full object-cover"
            style={{
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              willChange: 'transform',
            }}
          />

          {/* PLAY overlay */}
          <AnimatePresence>
            {state.phase === 'playing' && !state.videoStarted && (
              <motion.button
                key="playOverlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.3 }}
                onClick={() => emit('mq_play_video')}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center"
                style={{
                  background: 'radial-gradient(circle at center, rgba(5,5,16,0.88) 0%, rgba(5,5,16,0.98) 100%)',
                  backdropFilter: 'blur(12px)',
                  cursor: 'pointer',
                }}
              >
                <motion.div
                  className="relative mb-8"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {[0, 0.5, 1].map((delay, i) => (
                    <motion.span
                      key={i}
                      className="absolute inset-0 rounded-full"
                      style={{ border: '3px solid #22d3ee' }}
                      animate={{
                        scale: [1, 1.6, 2],
                        opacity: [0.7, 0.3, 0],
                      }}
                      transition={{
                        duration: 2,
                        delay,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                  ))}

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-36 h-36 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #22d3ee 0%, #a855f7 100%)',
                      boxShadow: '0 0 80px -10px rgba(34,211,238,0.9), 0 0 120px -20px rgba(168,85,247,0.6)',
                    }}
                  >
                    <span className="text-7xl ml-2">▶️</span>
                  </motion.div>
                </motion.div>

                <h3 className="text-3xl sm:text-4xl font-black text-white mb-3">
                  اضغط لتشغيل الفيديو
                </h3>
                <p className="text-slate-400 text-base mb-2">
                  استعدوا — الفيديو هيبدأ لما أي حد يدوس
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mt-3"
                  style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)' }}>
                  <span className="text-amber-400 text-sm font-bold">
                    ⏱️ الوقت هيبدأ مع الفيديو
                  </span>
                </div>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Loading spinner */}
          <AnimatePresence>
            {videoLoading && state.videoStarted && state.phase === 'playing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-10 pointer-events-none"
              >
                <div className="text-center">
                  <motion.div
                    className="w-16 h-16 rounded-full mx-auto mb-4"
                    style={{
                      border: '4px solid transparent',
                      borderTopColor: '#22d3ee',
                      borderRightColor: '#a855f7',
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <p className="text-slate-300 font-bold">جاري التحميل...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-500">
          لا يوجد فيديو
        </div>
      )}
    </div>
  );

  const renderPlayingOrBuzzed = () => {
    const isBuzzed = phase === 'buzzed';
    const imBuzzer = me.isBuzzer;
    const hasAnswer = !!state.buzzerAnswer;
    const isRevealed = state.buzzerResult === 'revealed';
    const hasTitle = !!state.video?.title;

    return (
      <div className="relative w-full h-[calc(100vh-88px)] flex flex-col pb-16">
        <div className="flex-1 relative bg-black overflow-hidden">
          {renderVideo()}

          {/* REVEAL Overlay */}
          <AnimatePresence>
            {isRevealed && hasTitle && (
              <motion.div
                key="revealOverlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 z-20 flex items-center justify-center px-4"
                style={{
                  background: 'radial-gradient(circle at center, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.97) 100%)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <motion.div
                  initial={{ scale: 0.4, opacity: 0, y: 30 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-7xl mb-6 inline-block"
                  >
                    🎬
                  </motion.div>
                  <p className="text-xs uppercase tracking-[0.4em] text-amber-400/80 mb-4">
                    الفيلم كان
                  </p>
                  <motion.h1
                    className="text-5xl sm:text-7xl font-black mb-6 leading-tight"
                    style={{
                      background: 'linear-gradient(135deg, #fbbf24, #f97316, #fbbf24)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 0 40px rgba(251,191,36,0.6))',
                    }}
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {state.video.title}
                  </motion.h1>

                  {canReveal && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                      className="mt-10 flex justify-center"
                    >
                      <button
                        onClick={() => emit('mq_next_round')}
                        className="next-btn relative px-10 py-4 rounded-full font-black text-xl"
                        style={{
                          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #f97316 100%)',
                          color: '#1a0f08',
                          border: '2px solid rgba(255,255,255,0.3)',
                          outline: 'none',
                        }}
                      >
                        <span className="relative z-10 flex items-center gap-3">
                          <span className="text-2xl">▶️</span>
                          <span>الفيلم اللي بعده</span>
                        </span>
                      </button>
                    </motion.div>
                  )}
                  {!canReveal && (
                    <motion.p
                      className="text-slate-400 text-sm mt-6"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      في انتظار الأدمن...
                    </motion.p>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* BUZZED Overlay */}
          <AnimatePresence>
            {isBuzzed && !isRevealed && (
              <motion.div
                key="buzzOverlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 z-10 bg-black/90 backdrop-blur-xl flex items-center justify-center px-4 py-6 overflow-y-auto"
              >
                {imBuzzer && !hasAnswer ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-full max-w-xl"
                  >
                    <div className="text-center mb-5">
                      <motion.div
                        className="text-6xl mb-3"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        🎤
                      </motion.div>
                      <h2 className="text-3xl font-black text-amber-400">قول اسم الفيلم!</h2>
                    </div>

                    <MovieAutocomplete
                      movies={state.availableMovies || []}
                      onSelect={(movie) => {
                        emit('mq_submit_answer', { movieId: movie.id, movieTitle: movie.title });
                      }}
                    />

                    <div className="flex justify-center mt-5">
                      <CountdownRing
                        value={buzzLeft}
                        total={Math.ceil((state.buzzTime || 0) / 1000)}
                        size={100}
                        color={buzzLeft <= 3 ? '#ef4444' : '#fbbf24'}
                      />
                    </div>
                  </motion.div>
                ) : imBuzzer && hasAnswer ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <motion.div
                      className="text-7xl mb-4"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ✓
                    </motion.div>
                    <p className="text-2xl font-black text-emerald-400 mb-2">تم إرسال إجابتك</p>
                    <p className="text-slate-400">في انتظار النتيجة...</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.5, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="text-center"
                  >
                    <p className="text-xs uppercase tracking-[0.4em] text-slate-500 mb-3">بزّر</p>
                    <h2 className="text-5xl sm:text-6xl font-black mb-4 text-cyan-400"
                      style={{ textShadow: '0 0 40px #22d3ee' }}>
                      {state.buzzerName}
                    </h2>
                    {hasAnswer ? (
                      <p className="text-lg text-slate-400">كتب إجابته، استعد للنتيجة...</p>
                    ) : (
                      <p className="text-lg text-slate-400">بيكتب اسم الفيلم...</p>
                    )}
                    {!hasAnswer && (
                      <div className="mt-6">
                        <CountdownRing
                          value={buzzLeft}
                          total={Math.ceil((state.buzzTime || 0) / 1000)}
                          size={120}
                          color={buzzLeft <= 3 ? '#ef4444' : '#fbbf24'}
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ROUND END (wrong/timeout/skip) */}
          <AnimatePresence>
            {phase === 'roundEnd' && !isRevealed && state.buzzerResult !== 'correct' && (
              <motion.div
                key="roundEndOverlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center px-4"
              >
                <motion.div
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="text-center max-w-2xl"
                >
                  {state.buzzerResult === 'wrong' && (
                    <>
                      <motion.div
                        animate={{ x: [0, -10, 10, -8, 8, 0] }}
                        transition={{ duration: 0.5 }}
                        className="text-7xl mb-4"
                      >
                        ❌
                      </motion.div>
                      <p className="text-4xl font-black text-red-400 mb-2">إجابة غلط!</p>
                      {state.buzzerAnswer && (
                        <p className="text-sm text-slate-400 mt-3">
                          <span className="text-slate-500">{state.buzzerName} كتب:</span>{' '}
                          <span className="text-red-300 line-through">{state.buzzerAnswer.movieTitle}</span>
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-6">
                        الفيلم لسه شغال — جرّبوا تاني!
                      </p>
                    </>
                  )}
                  {state.buzzerResult === 'timeout' && (
                    <>
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="text-7xl mb-4"
                      >
                        ⏱️
                      </motion.div>
                      <p className="text-4xl font-black text-red-400 mb-2">انتهى الوقت!</p>
                      <p className="text-xs text-slate-500 mt-6">الفيلم لسه شغال</p>
                    </>
                  )}
                  {state.buzzerResult === 'skip' && (
                    <>
                      <div className="text-7xl mb-4">⏭️</div>
                      <p className="text-4xl font-black text-slate-400 mb-2">تم تخطي الدور</p>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CORRECT Overlay */}
          <AnimatePresence>
            {phase === 'roundEnd' && state.buzzerResult === 'correct' && hasTitle && (
              <motion.div
                key="correctOverlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center px-4"
              >
                <motion.div
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="text-center max-w-2xl"
                >
                  <motion.div
                    animate={{ scale: [1, 1.15, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    className="text-8xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <p className="text-4xl font-black text-emerald-400 mb-6">إجابة صحيحة!</p>

                  <div className="rounded-2xl px-6 py-4 inline-block mb-6"
                    style={{
                      background: 'rgba(16,185,129,0.15)',
                      border: '2px solid rgba(16,185,129,0.6)',
                    }}>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                      {state.buzzerName} كتب
                    </p>
                    <p className="text-2xl font-black text-emerald-300">{state.buzzerAnswer?.movieTitle}</p>
                  </div>

                  <div className="mt-2">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">الفيلم كان</p>
                    <p className="text-3xl font-black text-amber-400">{state.video.title}</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ✅ Buzz Button — بنفسجي، ثابت، بحجم أكبر */}  
        {phase === 'playing' && (!canReveal || me.id) && (
          <div
            className="fixed bottom-20 left-1/2 z-40"
            style={{ transform: 'translateX(-50%)' }}
          >
            <motion.button
              onClick={() => state.videoStarted && emit('mq_buzz')}
              whileTap={state.videoStarted ? { scale: 0.95 } : {}}
              disabled={!state.videoStarted}
              className={`buzz-wrapper ${state.videoStarted ? '' : 'buzz-disabled'}`}
              style={{
                cursor: state.videoStarted ? 'pointer' : 'not-allowed',
                opacity: state.videoStarted ? 1 : 0.55,
              }}
            >
              <div
                className="buzz-wrapper-inner px-14 py-5 sm:px-16 sm:py-6 font-black text-2xl sm:text-3xl flex items-center gap-4"
                style={{
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                <span className="relative flex items-center gap-3">
                  {state.videoStarted ? (
                    <>
                      <motion.span
                        className="text-3xl"
                        animate={{ rotate: [0, 15, -15, 0] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                      >
                        🔔
                      </motion.span>
                      <span>دوس!</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">⏸️</span>
                      <span>استنى الفيديو</span>
                    </>
                  )}
                </span>
              </div>
            </motion.button>
          </div>
        )}

        {/* Admin-only footer */}
        {phase === 'playing' && canReveal && !me.id && (
          <div className="w-full py-6 text-center bg-slate-900/50 border-t border-white/10">
            <p className="text-slate-400">
              <span className="text-cyan-400 font-bold">أنت الأدمن</span> — اللاعبون بيشوفوا الفيديو
            </p>
          </div>
        )}

        {isBuzzed && !canReveal && !imBuzzer && (
          <div className="w-full py-6 text-center bg-slate-900/50 border-t border-white/10">
            <p className="text-slate-400 text-sm">
              استعد — لو {state.buzzerName} غلط، تقدر تبزّر إنت كمان
            </p>
          </div>
        )}

        {isBuzzed && imBuzzer && !hasAnswer && (
          <div className="w-full py-4 text-center bg-amber-900/30 border-t border-amber-500/30">
            <p className="text-amber-300 font-bold">🎤 اختر الإجابة من القائمة واضغط تأكيد</p>
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // LEADERBOARD
  // ============================================================
  const renderLeaderboard = () => {
    if (phase === 'lobby' || phase === 'gameover') return null;
    const top = state.players.slice(0, 5);
    return (
      <div className="fixed bottom-0 left-0 right-0 z-30 max-w-5xl mx-auto px-4 pb-3 pointer-events-none">
        <GlassCard className="px-3 py-2 pointer-events-auto">
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 shrink-0">🏆</span>
            {top.map((p, i) => (
              <div key={p.id}
                className={`flex items-center gap-2 shrink-0 px-3 py-1 rounded-xl ${
                  p.id === me.id ? 'bg-cyan-500/20 border border-cyan-400/40' : 'bg-white/[0.03]'
                }`}
              >
                <span className="text-xs">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                <span className="text-sm font-bold">{p.name}</span>
                <span className="text-sm font-black text-emerald-400 tabular-nums">{p.score}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    );
  };

  // ============================================================
  // GAME OVER
  // ============================================================
  const renderGameOver = () => {
    const winner = state.players.find((p) => p.id === state.winnerId);
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 relative">
        <Confetti />
        <motion.div initial={{ opacity: 0, scale: 0.5, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200 }} className="relative z-30 text-center">
          <motion.div className="text-8xl mb-4"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}>
            🏆
          </motion.div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-3">الفائز</p>
          <motion.h2 className="text-5xl sm:text-6xl font-black mb-8"
            style={{ color: '#fbbf24', textShadow: '0 0 40px #fbbf24, 0 0 80px #fbbf2460' }}
            animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            {winner?.name || '???'}
          </motion.h2>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }} className="my-8 relative z-30">
          <GlassCard className="p-5">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">الترتيب النهائي</p>
            <div className="space-y-2">
              {state.players.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-xl ${
                    i === 0 ? 'bg-amber-500/15 border border-amber-500/40' : 'bg-white/[0.03] border border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                    <span className="font-bold">{p.name}</span>
                  </div>
                  <span className="text-2xl font-black tabular-nums" style={{ color: i === 0 ? '#fbbf24' : 'white' }}>
                    {p.score}
                  </span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {canReveal && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }} className="relative z-30">
            <GlassButton variant="success" size="lg" onClick={() => emit('mq_reset')} className="w-full">
              🔄 العب تاني
            </GlassButton>
          </motion.div>
        )}
      </div>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div dir="rtl" className="relative min-h-screen text-white overflow-hidden">
      <style>{GLOBAL_STYLES}</style>
      {phase !== 'playing' && phase !== 'buzzed' && <BackgroundFX />}
      {renderHUD()}

      <AnimatePresence mode="wait">
        {phase === 'lobby' && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {me.isAdmin ? renderAdminLobby() : renderPlayerLobby()}
          </motion.div>
        )}
        {(phase === 'playing' || phase === 'buzzed') && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderPlayingOrBuzzed()}
          </motion.div>
        )}
        {phase === 'roundEnd' && (
          <motion.div key="roundEnd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderPlayingOrBuzzed()}
          </motion.div>
        )}
        {phase === 'gameover' && (
          <motion.div key="gameover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderGameOver()}
          </motion.div>
        )}
      </AnimatePresence>

      {renderLeaderboard()}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="rounded-2xl p-[1.5px] overflow-hidden">
              <motion.div className="absolute inset-[-150%]"
                style={{ background: 'conic-gradient(from 0deg, transparent 0%, #ef4444 20%, #fbbf24 40%, transparent 60%)' }}
                animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
              <div className="relative rounded-2xl bg-[#0a0a1a] px-6 py-3 font-bold">⚠️ {error}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}