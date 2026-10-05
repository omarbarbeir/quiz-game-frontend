import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// =====================================================
// 🎨 Colors
// =====================================================
const C = {
  bg0: '#050510',
  bg1: '#0a0a14',
  card: '#111122',
  border: '#1e1e35',
  red: '#dc2626',
  redSoft: '#7f1d1d',
  blue: '#2563eb',
  blueSoft: '#1e3a8a',
  neutral: '#64748b',
  assassin: '#000000',
  text: '#e5e7eb',
  textDim: '#94a3b8',
  textMuted: '#64748b',
  amber: '#f59e0b',
};

const TEAM_LABEL = { red: 'الفريق الأحمر', blue: 'الفريق الأزرق' };

// =====================================================
// 🔊 Sounds
// =====================================================
function useSoundEffects() {
  const ref = useRef({});
  useEffect(() => {
    const files = {
      correct: '/sounds/correct.mp3',
      wrong: '/sounds/wrong.mp3',
      ready: '/sounds/ready.mp3',
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
      style={{ background: 'radial-gradient(circle, #dc2626 0%, transparent 65%)' }}
      animate={{ x: [0, 80, 0], y: [0, 60, 0] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute -bottom-1/4 -right-1/4 w-[70vw] h-[70vw] rounded-full opacity-40 blur-3xl"
      style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 65%)' }}
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
    primary: { c1: '#22d3ee', c2: '#a855f7', text: '#e0f2fe', glow: '34,211,238' },
    red:     { c1: '#f87171', c2: '#dc2626', text: '#fee2e2', glow: '248,113,113' },
    blue:    { c1: '#60a5fa', c2: '#2563eb', text: '#dbeafe', glow: '96,165,250' },
    success: { c1: '#34d399', c2: '#10b981', text: '#d1fae5', glow: '52,211,153' },
    amber:   { c1: '#fbbf24', c2: '#f97316', text: '#fef3c7', glow: '251,191,36' },
    neutral: { c1: '#94a3b8', c2: '#475569', text: '#e2e8f0', glow: '148,163,184' },
  };
  const v = variants[variant] || variants.primary;
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`relative group ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      style={{
        filter: !disabled ? `drop-shadow(0 4px 12px rgba(${v.glow}, 0.15))` : 'none',
      }}
    >
      {/* Outer rotating border (subtle) */}
      <span className="absolute inset-0 rounded-xl overflow-hidden p-[1px]">
        <motion.span
          className="absolute inset-[-150%]"
          style={{
            background: `conic-gradient(from 0deg,
              transparent 0%,
              ${v.c1}80 20%,
              transparent 35%,
              transparent 65%,
              ${v.c2}80 80%,
              transparent 100%)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        />
        <span
          className="absolute inset-[1px] rounded-xl"
          style={{
            background: `linear-gradient(145deg,
              rgba(255,255,255,0.08),
              rgba(255,255,255,0.02) 40%,
              rgba(0,0,0,0.15))`,
            backdropFilter: 'blur(20px) saturate(150%)',
            WebkitBackdropFilter: 'blur(20px) saturate(150%)',
          }}
        />
      </span>

      {/* Inner content */}
      <span
        className={`relative block rounded-xl ${sizes[size]} font-bold transition-colors duration-300`}
        style={{
          color: v.text,
          background: `linear-gradient(180deg,
            rgba(255,255,255,0.06) 0%,
            rgba(255,255,255,0.02) 100%)`,
        }}
      >
        {/* Top shine */}
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg,
              transparent,
              rgba(255,255,255,0.4) 50%,
              transparent)`,
          }}
        />
        {/* Inner soft glow */}
        <span
          className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(ellipse at center,
              rgba(${v.glow}, 0.15) 0%,
              transparent 70%)`,
          }}
        />
        <span className="relative flex items-center justify-center gap-2">{children}</span>
      </span>
    </motion.button>
  );
};

const GlassCard = ({ children, className = '', accent = null }) => (
  <div className={`relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl overflow-hidden ${className}`}>
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
  const colors = ['#22d3ee', '#a855f7', '#ec4899', '#fbbf24', '#10b981', '#dc2626', '#2563eb'];
  const pieces = Array.from({ length: 80 });
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
// 📇 Word Cell
// =====================================================
const WordCell = ({ cell, canSeeColors, canGuess, onGuess }) => {
  const revealed = cell.revealed;
  const showColor = canSeeColors || revealed;

  // ✅ Liquid glass colors — شفاف + لون خفيف
  let glassBg, glassBorder, glowRgb, textColor, accentColor;
  if (!showColor) {
    glassBg = 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 50%, rgba(0,0,0,0.15) 100%)';
    glassBorder = 'rgba(255,255,255,0.08)';
    glowRgb = '148,163,184';
    textColor = '#e5e7eb';
    accentColor = 'rgba(255,255,255,0.15)';
  } else if (cell.color === 'red') {
    glassBg = 'linear-gradient(145deg, rgba(239,68,68,0.18) 0%, rgba(220,38,38,0.08) 50%, rgba(127,29,29,0.15) 100%)';
    glassBorder = 'rgba(248,113,113,0.4)';
    glowRgb = '239,68,68';
    textColor = '#fecaca';
    accentColor = 'rgba(248,113,113,0.5)';
  } else if (cell.color === 'blue') {
    glassBg = 'linear-gradient(145deg, rgba(59,130,246,0.18) 0%, rgba(37,99,235,0.08) 50%, rgba(30,58,138,0.15) 100%)';
    glassBorder = 'rgba(96,165,250,0.4)';
    glowRgb = '59,130,246';
    textColor = '#bfdbfe';
    accentColor = 'rgba(96,165,250,0.5)';
  } else if (cell.color === 'neutral') {
    glassBg = 'linear-gradient(145deg, rgba(148,163,184,0.12) 0%, rgba(100,116,139,0.06) 50%, rgba(51,65,85,0.15) 100%)';
    glassBorder = 'rgba(203,213,225,0.3)';
    glowRgb = '148,163,184';
    textColor = '#e2e8f0';
    accentColor = 'rgba(203,213,225,0.4)';
  } else if (cell.color === 'assassin') {
    glassBg = 'linear-gradient(145deg, rgba(220,38,38,0.15) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.8) 100%)';
    glassBorder = 'rgba(220,38,38,0.6)';
    glowRgb = '220,38,38';
    textColor = '#fca5a5';
    accentColor = 'rgba(220,38,38,0.7)';
  }

  const isClickable = canGuess && !revealed;

  return (
    <motion.button
      onClick={() => isClickable && onGuess(cell.index)}
      disabled={!isClickable}
      whileHover={isClickable ? { scale: 1.04, y: -3 } : {}}
      whileTap={isClickable ? { scale: 0.97 } : {}}
      animate={revealed ? { scale: [1, 1.06, 1] } : {}}
      transition={{ duration: 0.35 }}
      className={`relative rounded-2xl font-bold text-sm sm:text-base py-3 px-2 aspect-[5/3] flex items-center justify-center text-center transition overflow-hidden ${
        isClickable ? 'cursor-pointer' : 'cursor-default'
      }`}
      style={{
        // ✅ Liquid Glass — الخلفية نفسها شفافة
        background: glassBg,
        backdropFilter: 'blur(16px) saturate(160%)',
        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
        border: `1.5px solid ${glassBorder}`,
        color: textColor,
        boxShadow: revealed
          ? `0 8px 28px -8px rgba(${glowRgb}, 0.55), inset 0 0 24px rgba(${glowRgb}, 0.12), inset 0 1px 0 rgba(255,255,255,0.15)`
          : `0 4px 16px -8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)`,
        opacity: revealed ? 0.85 : 1,
      }}
    >
      {/* ✅ Top shine line — إحساس زجاج */}
      <span
        className="pointer-events-none absolute inset-x-3 top-0 h-px"
        style={{
          background: `linear-gradient(90deg,
            transparent,
            rgba(255,255,255,0.5) 50%,
            transparent)`,
        }}
      />

      {/* ✅ Subtle radial highlight — لمعة داخلية علوية */}
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
        }}
      />

      {/* ✅ Accent glow عند الـ hover */}
      {isClickable && (
        <span
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at center, rgba(${glowRgb}, 0.15), transparent 70%)`,
          }}
        />
      )}

      {/* ✅ X mark — خطوط ناعمة بتترسم */}
      {revealed && (
        <motion.svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id={`xGrad-${cell.index}`}
              x1="0%" y1="0%" x2="100%" y2="100%"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0.7" />
              <stop offset="50%" stopColor="white" stopOpacity="0.3" />
              <stop offset="100%" stopColor="white" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <motion.line
            x1="15" y1="15" x2="85" y2="85"
            stroke={`url(#xGrad-${cell.index})`}
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
          />
          <motion.line
            x1="85" y1="15" x2="15" y2="85"
            stroke={`url(#xGrad-${cell.index})`}
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.25, ease: 'easeOut' }}
          />
        </motion.svg>
      )}

      {/* ✅ Word */}
      <span
        className="relative leading-tight z-10 font-bold transition-opacity duration-300"
        style={{
          opacity: revealed ? 0.55 : 1,
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        }}
      >
        {cell.word}
      </span>

      {/* ✅ Assassin skull */}
      {revealed && cell.color === 'assassin' && (
        <motion.span
          className="absolute top-1 right-1 text-base z-30"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300 }}
        >
          💀
        </motion.span>
      )}

      {/* ✅ Captain indicator (dot) — لو الكابتن يشوف اللون */}
      {canSeeColors && !revealed && (
        <span
          className="pointer-events-none absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full"
          style={{
            background: `rgb(${glowRgb})`,
            boxShadow: `0 0 6px rgba(${glowRgb}, 0.9)`,
          }}
        />
      )}
    </motion.button>
  );
};

// =====================================================
// 💬 Chat Component
// =====================================================
const ChatPanel = ({ chat, onSend, me, players, isMobileOpen, onClose }) => {
  const [channel, setChannel] = useState('general');
  const [text, setText] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const myTeam = me?.team;
  const isAdmin = me?.isAdmin;

  // Auto-switch to team channel
  useEffect(() => {
    if (myTeam && !isAdmin) setChannel(myTeam);
  }, [myTeam, isAdmin]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat?.length, channel]);

  const filteredChat = useMemo(() => {
    return (chat || []).filter((m) => m.channel === channel);
  }, [chat, channel]);

  const channels = [
    { id: 'general', label: '📢 عام', color: '#94a3b8' },
    ...(myTeam === 'red' || isAdmin ? [{ id: 'red', label: '🔴 فريق أحمر', color: C.red }] : []),
    ...(myTeam === 'blue' || isAdmin ? [{ id: 'blue', label: '🔵 فريق أزرق', color: C.blue }] : []),
  ];

  const handleSend = () => {
    const clean = text.trim();
    if (!clean) return;
    onSend(clean, channel);
    setText('');
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed lg:relative
        inset-y-0 left-0
        w-80 max-w-[85vw]
        lg:w-80 lg:max-w-none
        z-50 lg:z-auto
        transition-transform duration-300
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        h-full
        flex flex-col
      `}>
        <GlassCard className="h-full flex flex-col rounded-none lg:rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2">
              <span className="text-lg">💬</span>
              <span className="font-bold">الشات</span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Channels */}
          <div className="flex gap-1 p-2 border-b" style={{ borderColor: C.border }}>
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setChannel(ch.id)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-bold transition ${
                  channel === ch.id ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
                style={{
                  background: channel === ch.id ? `${ch.color}25` : 'transparent',
                  border: channel === ch.id ? `1px solid ${ch.color}80` : '1px solid transparent',
                }}
              >
                {ch.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            {filteredChat.length === 0 && (
              <p className="text-center text-xs text-slate-600 italic py-6">
                مفيش رسايل لسه
              </p>
            )}
            {filteredChat.map((m) => {
              const isMe = m.playerId === me?.id || (m.isAdmin && isAdmin);
              const teamColor = m.team === 'red' ? C.red : m.team === 'blue' ? C.blue : C.textMuted;

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <span
                      className="text-[10px] font-bold"
                      style={{ color: m.isAdmin ? C.amber : teamColor }}
                    >
                      {m.playerName}
                    </span>
                    {m.isCaptain && <span className="text-[10px]">👑</span>}
                    {m.isAdmin && <span className="text-[10px]">🎩</span>}
                  </div>
                  <div
                    className="rounded-2xl px-3 py-1.5 max-w-full text-sm break-words"
                    style={{
                      background: isMe
                        ? `${teamColor}30`
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isMe ? teamColor + '60' : 'rgba(255,255,255,0.08)'}`,
                      color: C.text,
                    }}
                  >
                    {m.text}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Input */}
          <div className="p-2 border-t" style={{ borderColor: C.border }}>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKey}
                placeholder="اكتب رسالة..."
                maxLength={200}
                className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-cyan-400/60 transition placeholder:text-slate-600"
              />
              <motion.button
                onClick={handleSend}
                disabled={!text.trim()}
                whileTap={{ scale: 0.94 }}
                className="px-4 rounded-xl font-bold transition disabled:opacity-40"
                style={{
                  background: `linear-gradient(135deg, #22d3ee, #a855f7)`,
                  color: '#0a0a1a',
                }}
              >
                ↑
              </motion.button>
            </div>
          </div>
        </GlassCard>
      </div>
    </>
  );
};


// =====================================================
// 📖 Rules Modal
// =====================================================
const RulesModal = ({ open, onClose }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-start justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ y: -40, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -40, opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="my-8 w-full max-w-2xl"
          >
            <GlassCard glow={C.amber} className="p-0">
              {/* Header */}
              <div
                className="px-6 py-4 border-b flex items-center justify-between"
                style={{ borderColor: C.border, background: `linear-gradient(90deg, ${C.amber}10, transparent)` }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${C.amber}20`, border: `1px solid ${C.amber}50` }}
                  >
                    <span className="text-xl">📖</span>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: C.amber }}>
                      HOW TO PLAY
                    </p>
                    <h2 className="text-xl font-black text-white">قواعد كلمة السر</h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-white text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="p-5 max-h-[75vh] overflow-y-auto space-y-5 text-sm leading-relaxed">

                {/* Concept */}
                <div>
                  <h3 className="font-black text-lg mb-2 flex items-center gap-2" style={{ color: C.amber }}>
                    🎯 الفكرة
                  </h3>
                  <p className="text-slate-300">
                    فيه لوحة فيها <strong className="text-white">25 كلمة</strong>.
                    كل كلمة ليها لون سري (أحمر، أزرق، محايد، أو أسود) — بس الكابتن بس اللي شايف الألوان.
                    الكابتن بيدي تلميح، وفريقه لازم يخمن الكلمات بلونهم.
                  </p>
                </div>

                {/* Board colors */}
                <div>
                  <h3 className="font-black text-lg mb-2 flex items-center gap-2" style={{ color: C.amber }}>
                    🎨 ألوان اللوحة
                  </h3>
                  <div className="space-y-2">
                    {[
                      { color: C.red, label: '🔴 أحمر (9 كلمات)', desc: 'فريق أحمر — لو فريقك الأحمر خدهم كلهم، يكسب.' },
                      { color: C.blue, label: '🔵 أزرق (8 كلمات)', desc: 'فريق أزرق — لو فريقك الأزرق خدهم كلهم، يكسب.' },
                      { color: C.neutral, label: '⚪ محايد (7 كلمات)', desc: 'مش بتاع حد — لو خمنته، دورك يروح للفريق التاني.' },
                      { color: C.red, label: '💀 أسود (1 كلمة)', desc: 'القاتل! لو أي فريق خمنه، الفريق التاني يكسب فورًا.' },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg"
                        style={{
                          background: `${item.color}10`,
                          border: `1px solid ${item.color}30`,
                        }}
                      >
                        <span className="text-lg shrink-0">{item.label.split(' ')[0]}</span>
                        <div>
                          <p className="font-bold text-white">{item.label.substring(item.label.indexOf(' ') + 1)}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Roles */}
                <div>
                  <h3 className="font-black text-lg mb-2 flex items-center gap-2" style={{ color: C.amber }}>
                    👥 الأدوار
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg" style={{ background: `${C.amber}10`, border: `1px solid ${C.amber}40` }}>
                      <p className="font-bold text-amber-300 mb-1">👑 الكابتن</p>
                      <p className="text-slate-300 text-xs">
                        بيشوف ألوان الكلمات. بيدي تلميح بكلمة واحدة + رقم. مش بيخمن بنفسه.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ background: `rgba(255,255,255,0.03)`, border: `1px solid ${C.border}` }}>
                      <p className="font-bold text-white mb-1">🕵️ أفراد الفريق</p>
                      <p className="text-slate-300 text-xs">
                        مبيشوفوش ألوان. بيخمنوا الكلمات بناءً على تلميح الكابتن. وبعد ما يخلصوا، بيدوسوا "إنهاء الدور".
                      </p>
                    </div>
                  </div>
                </div>

                {/* How to play */}
                <div>
                  <h3 className="font-black text-lg mb-2 flex items-center gap-2" style={{ color: C.amber }}>
                    🎮 طريقة اللعب
                  </h3>
                  <ol className="space-y-2 list-decimal list-inside marker:text-amber-400">
                    <li className="text-slate-300">
                      الكابتن بيكتب <strong className="text-white">كلمة واحدة</strong> + <strong className="text-white">رقم</strong> (عدد الكلمات اللي بتوصفهم)
                    </li>
                    <li className="text-slate-300">
                      <span className="text-amber-300">مثال:</span> الكابتن عنده "شمس، نور، قمر" — يقول "<strong>إضاءة — 3</strong>"
                    </li>
                    <li className="text-slate-300">
                      فريقه يتناقشوا <strong className="text-white">في الشات</strong> وبعدين يضغطوا على الكلمة اللي عايزين يخمنوها
                    </li>
                    <li className="text-slate-300">
                      لو صح ✅ → الفريق يكمل
                    </li>
                    <li className="text-slate-300">
                      لو غلط ❌ (محايد أو لون الخصم) → الدور يروح للفريق التاني
                    </li>
                    <li className="text-slate-300">
                      لما يخلصوا تخميناتهم، <strong className="text-white">أي لاعب في الفريق</strong> يدوس "إنهاء الدور"
                    </li>
                  </ol>
                </div>

                {/* Hint rules */}
                <div>
                  <h3 className="font-black text-lg mb-2 flex items-center gap-2" style={{ color: C.red }}>
                    ⚠️ ممنوع في التلميح
                  </h3>
                  <ul className="space-y-1 text-slate-300">
                    <li>❌ إنك تستخدم كلمة موجودة على اللوحة</li>
                    <li>❌ إنك تقول رقم مكان الكلمة</li>
                    <li>❌ إنك تشاور أو تستخدم إشارات</li>
                    <li>❌ إنك تقول الكلمة بالإنجليزي أو لغة تانية</li>
                    <li>❌ إنك تستخدم جزء من الكلمة نفسها</li>
                    <li>❌ إنك تقول "زي" أو "يشبه" الكلمة</li>
                  </ul>
                </div>

                {/* Examples — Section 1 */}
                <div>
                  <h3 className="font-black text-lg mb-2 flex items-center gap-2" style={{ color: C.amber }}>
                    💡 إزاي تعطي تلميح صح — أمثلة
                  </h3>
                  
                  <div className="mb-3 p-3 rounded-lg" style={{ background: `${C.amber}10`, border: `1px solid ${C.amber}40` }}>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      <strong className="text-amber-300">القاعدة الذهبية:</strong> التلميح لازم يكون <strong className="text-white">كلمة واحدة</strong> + <strong className="text-white">رقم</strong>.
                      الكلمة تشير <strong className="text-white">للمعنى العام</strong>، مش للكلمة نفسها.
                    </p>
                  </div>

                  {/* Example 1: ميدان */}
                  <div className="mb-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🎯</span>
                      <p className="font-black text-white">مثال 1: الكلمة السرية هي "<span className="text-amber-400">ميدان</span>"</p>
                    </div>
                    
                    <div className="space-y-2 pr-2">
                      <p className="text-[11px] font-bold text-red-400 mb-1">❌ تلميحات غلط:</p>
                      <div className="space-y-1.5">
                        {[
                          '"شارع" — مرادف قريب جدًا (بيخليها سهلة)',
                          '"تقاطع طرق" — جملة مش كلمة',
                          '"التحرير" — اسم ميدان (يعتبر كشف)',
                          '"مكان واقفين فيه" — وصف مباشر',
                          '"ميد" — جزء من الكلمة',
                        ].map((t, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <span className="text-red-400 shrink-0">✗</span>
                            <span className="text-slate-400">{t}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] font-bold text-emerald-400 mb-1 mt-3">✅ تلميحات صح:</p>
                      <div className="space-y-1.5">
                        {[
                          '"وسع — 2" — يشير لمعنى الاتساع (ومعاه كلمة تانية على اللوحة)',
                          '"تجمعات — 3" — يشير لأن الناس بتتجمع فيه',
                          '"وسط البلد — 2" — يشير للموقع النسبي',
                          '"دائري — 2" — يشير للشكل',
                        ].map((t, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <span className="text-emerald-400 shrink-0">✓</span>
                            <span className="text-slate-300">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Example 2: فندق */}
                  <div className="mb-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🏨</span>
                      <p className="font-black text-white">مثال 2: الكلمة السرية هي "<span className="text-amber-400">فندق</span>"</p>
                    </div>
                    
                    <div className="space-y-2 pr-2">
                      <p className="text-[11px] font-bold text-red-400 mb-1">❌ تلميحات غلط:</p>
                      <div className="space-y-1.5">
                        {[
                          '"بيت ضيافة" — مرادف مباشر',
                          '"مكان ننام فيه" — وصف مباشر (جملة)',
                          '"نوم" — كلمة قريبة جدًا للمعنى',
                          '"سرير" — وصف مباشر',
                          '"5 نجوم" — جملة مش كلمة',
                        ].map((t, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <span className="text-red-400 shrink-0">✗</span>
                            <span className="text-slate-400">{t}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] font-bold text-emerald-400 mb-1 mt-3">✅ تلميحات صح:</p>
                      <div className="space-y-1.5">
                        {[
                          '"مسافرين — 2" — يشير للمعنى العام (مع كلمة تانية)',
                          '"إقامة — 1" — مصطلح قريب بس مش مرادف',
                          '"خدمة — 2" — يشير للخدمة في المكان',
                          '"طوابق — 1" — يشير لمبنى كبير',
                        ].map((t, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <span className="text-emerald-400 shrink-0">✓</span>
                            <span className="text-slate-300">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Example 3: قمر */}
                  <div className="mb-3 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">🌙</span>
                      <p className="font-black text-white">مثال 3: الكلمة السرية هي "<span className="text-amber-400">قمر</span>"</p>
                    </div>
                    
                    <div className="space-y-2 pr-2">
                      <p className="text-[11px] font-bold text-red-400 mb-1">❌ تلميحات غلط:</p>
                      <div className="space-y-1.5">
                        {[
                          '"بينور في السما" — جملة كاملة',
                          '"ليلي" — وصف مباشر',
                          '"أبيض" — وصف مباشر',
                          '"شمس" — موجودة على اللوحة',
                          '"قمرة" — جزء من الكلمة',
                        ].map((t, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <span className="text-red-400 shrink-0">✗</span>
                            <span className="text-slate-400">{t}</span>
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] font-bold text-emerald-400 mb-1 mt-3">✅ تلميحات صح:</p>
                      <div className="space-y-1.5">
                        {[
                          '"إضاءة — 3" — يشير للإضاءة (مع شمس ونور)',
                          '"أجرام — 1" — مصطلح فلكي يشير للكواكب',
                          '"شِعري — 2" — يشير للكلمة في الأشعار والأغاني',
                          '"دائري — 2" — يشير للشكل',
                        ].map((t, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <span className="text-emerald-400 shrink-0">✓</span>
                            <span className="text-slate-300">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Quick summary */}
                  <div className="p-3 rounded-lg" style={{ background: `${C.amber}10`, border: `1px solid ${C.amber}40` }}>
                    <p className="text-xs text-slate-300 leading-relaxed mb-2">
                      <strong className="text-amber-300">💡 خلاصة:</strong> التلميح الحلو بيعتمد على:
                    </p>
                    <ul className="space-y-1 text-xs text-slate-300 pr-3">
                      <li>1️⃣ <strong className="text-white">المعنى العام</strong> (مش المعنى المباشر)</li>
                      <li>2️⃣ <strong className="text-white">كلمات مرتبطة</strong> موجودة على اللوحة كمان</li>
                      <li>3️⃣ <strong className="text-white">مصطلحات</strong> أو <strong className="text-white">صفات عامة</strong> (لون، شكل، حجم)</li>
                      <li>4️⃣ <strong className="text-white">كلمات من مجالات بعيدة</strong> (شِعر، تاريخ، رياضة)</li>
                    </ul>
                  </div>
                </div>

                {/* Winning */}
                <div>
                  <h3 className="font-black text-lg mb-2 flex items-center gap-2" style={{ color: '#10b981' }}>
                    🏆 الفوز
                  </h3>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg" style={{ background: `#10b98115`, border: `1px solid #10b98140` }}>
                      <p className="font-bold text-emerald-300 mb-1">✅ فوز عادي</p>
                      <p className="text-slate-300 text-xs">
                        أول فريق يخلص كل كلماته (9 حمر أو 8 زرق) يكسب.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg" style={{ background: `${C.red}15`, border: `1px solid ${C.red}40` }}>
                      <p className="font-bold text-red-300 mb-1">💀 فوز بالقاتل</p>
                      <p className="text-slate-300 text-xs">
                        لو فريق خمن الكلمة السودا، الفريق التاني يكسب فورًا.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat */}
                <div>
                  <h3 className="font-black text-lg mb-2 flex items-center gap-2" style={{ color: C.amber }}>
                    💬 الشات
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-300 text-xs">
                      <span>📢</span>
                      <span><strong className="text-white">عام</strong> — الكل يشوفه</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 text-xs">
                      <span>🔴</span>
                      <span><strong className="text-white">فريق أحمر</strong> — الأحمر بس (الفريق التاني مش بيشوف)</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300 text-xs">
                      <span>🔵</span>
                      <span><strong className="text-white">فريق أزرق</strong> — الأزرق بس (الفريق التاني مش بيشوف)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div
                className="px-6 py-4 border-t flex justify-center"
                style={{ borderColor: C.border, background: C.bg1 }}
              >
                <GlassButton variant="amber" onClick={onClose}>
                  ✅ فهمت، يلا نبدأ
                </GlassButton>
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// =====================================================
// 🎮 MAIN
// =====================================================
export default function Codenames({
  socket, roomCode, playerId, playerName, isAdmin = false, players = [], onExit,
}) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [hintWord, setHintWord] = useState('');
  const [hintNumber, setHintNumber] = useState(2);
  const [chatOpenMobile, setChatOpenMobile] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);  


  const { play: playSound, stopAll: stopAllSounds } = useSoundEffects();
  const prevPhaseRef = useRef(null);
  const prevBoardRef = useRef(null);

  // Socket
  useEffect(() => {
    if (!socket) return;
    const onState = (s) => setState(s);
    const onError = ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3500);
    };

    socket.on('cn_state', onState);
    socket.on('cn_error', onError);

    // ✅ الأدمن واللاعبين الاتنين بيدخلوا من هنا
    socket.emit('cn_join', { roomCode, playerId, playerName, isAdmin });

    return () => {
      socket.off('cn_state', onState);
      socket.off('cn_error', onError);
      socket.emit('cn_leave', { roomCode });
    };
  }, [socket, roomCode, playerId, playerName, isAdmin]);

  // Phase sounds
  useEffect(() => {
    if (!state) return;
    const prev = prevPhaseRef.current;
    const cur = state.phase;
    if (prev === cur) return;
    stopAllSounds();
    if (cur === 'playing') playSound('ready');
    else if (cur === 'ended') playSound('win');
    prevPhaseRef.current = cur;
  }, [state?.phase, playSound, stopAllSounds, state]);

  // Detect reveals for sounds
  useEffect(() => {
    if (!state?.board || state.phase !== 'playing') return;
    const prevBoard = prevBoardRef.current;
    if (prevBoard) {
      const curRevealed = state.board.filter((c) => c.revealed).length;
      const prevRevealed = prevBoard.filter((c) => c.revealed).length;
      if (curRevealed > prevRevealed) {
        // Find newly revealed cell
        const newIdx = state.board.findIndex((c, i) => c.revealed && !prevBoard[i]?.revealed);
        if (newIdx !== -1) {
          const cell = state.board[newIdx];
          if (cell.color === 'assassin') playSound('wrong');
          else playSound('correct');
        }
      }
    }
    prevBoardRef.current = state.board;
  }, [state?.board, state?.phase, playSound]);

  const emit = useCallback((ev, payload) => {
    socket?.emit(ev, { roomCode, ...payload });
  }, [socket, roomCode]);

  const handleHintSubmit = () => {
    if (!hintWord.trim()) return;
    emit('cn_submit_hint', { word: hintWord.trim(), number: hintNumber });
    setHintWord('');
  };

  const handleChatSend = (text, channel) => {
    emit('cn_chat_send', { text, channel });
  };

  if (!state) {
    return (
      <div dir="rtl" className="relative min-h-screen bg-[#050510] text-white flex items-center justify-center">
        <BackgroundFX />
        <div className="text-center">
          <motion.div
            className="w-16 h-16 rounded-full mx-auto mb-4"
            style={{ border: '3px solid transparent', borderTopColor: '#dc2626', borderRightColor: '#2563eb' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-slate-400 tracking-wider">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const { phase, me } = state;
  const canSeeColors = me?.canSeeColors;
  const myTeam = me?.team;

  // ============================================================
  // HUD
  // ============================================================
  const renderHUD = () => (
    <div className="relative z-30 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      <GlassCard className="px-3 sm:px-4 py-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button onClick={onExit} className="text-slate-400 hover:text-white text-xs flex items-center gap-1">
              <span>←</span><span>خروج</span>
            </button>
            {isAdmin && (
              <motion.button
                onClick={() => { if (window.confirm('ترجع للشاشة الرئيسية؟')) onExit(); }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="rounded-lg px-2.5 py-1 text-[11px] font-bold flex items-center gap-1"
                style={{ background: `${C.amber}15`, border: `1px solid ${C.amber}40`, color: C.amber }}
              >
                <span>🏠</span><span className="hidden sm:inline">الرئيسية</span>
              </motion.button>
            )}
          </div>

          {/* Score */}
          {phase === 'playing' && (
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className={`text-center px-3 py-1 rounded-lg transition ${state.currentTeam === 'red' ? 'ring-2 ring-red-500' : ''}`}
                style={{ background: `${C.red}15` }}
              >
                <p className="text-[8px] uppercase tracking-widest" style={{ color: C.red }}>أحمر</p>
                <p className="text-lg font-black tabular-nums" style={{ color: C.red }}>
                  {state.teams.red.wordsLeft}
                </p>
              </div>
              <span className="text-slate-600">—</span>
              <div
                className={`text-center px-3 py-1 rounded-lg transition ${state.currentTeam === 'blue' ? 'ring-2 ring-blue-500' : ''}`}
                style={{ background: `${C.blue}15` }}
              >
                <p className="text-[8px] uppercase tracking-widest" style={{ color: C.blue }}>أزرق</p>
                <p className="text-lg font-black tabular-nums" style={{ color: C.blue }}>
                  {state.teams.blue.wordsLeft}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {me.team && (
              <div
                className="text-[10px] font-bold px-2 py-1 rounded-lg"
                style={{
                  background: `${me.team === 'red' ? C.red : C.blue}20`,
                  color: me.team === 'red' ? C.red : C.blue,
                  border: `1px solid ${me.team === 'red' ? C.red : C.blue}50`,
                }}
              >
                {me.team === 'red' ? '🔴' : '🔵'} {TEAM_LABEL[me.team]}
                {me.isCaptain && ' 👑'}
              </div>
            )}
            {/* ✅ زرار القواعد */}
            <motion.button
              onClick={() => setRulesOpen(true)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="rounded-lg px-2.5 py-1 text-[11px] font-bold flex items-center gap-1"
              style={{
                background: `${C.amber}15`,
                border: `1px solid ${C.amber}40`,
                color: C.amber,
              }}
              title="قواعد اللعب"
            >
              <span>📖</span>
              <span className="hidden sm:inline">القواعد</span>
            </motion.button>
            <button
              onClick={() => setChatOpenMobile(true)}
              className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg bg-white/5"
            >
              💬
            </button>
            <div className="text-xs text-slate-500 font-mono hidden sm:block">{roomCode}</div>
          </div>

        </div>
      </GlassCard>
    </div>
  );

  // ============================================================
  // LOBBY
  // ============================================================
  const renderLobby = () => {
    const redTeam = state.players.filter((p) => p.team === 'red');
    const blueTeam = state.players.filter((p) => p.team === 'blue');
    const unassigned = state.players.filter((p) => !p.team);

    const canStart =
      redTeam.length >= 2 &&
      blueTeam.length >= 2 &&
      state.teams.red.captainId &&
      state.teams.blue.captainId;

    const renderTeamCard = (teamKey) => {
      const team = teamKey === 'red' ? redTeam : blueTeam;
      const color = teamKey === 'red' ? C.red : C.blue;
      const captainId = state.teams[teamKey].captainId;
      const isMyTeam = myTeam === teamKey;

      return (
        <GlassCard accent={color} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{teamKey === 'red' ? '🔴' : '🔵'}</span>
              <h3 className="text-lg font-black" style={{ color }}>
                {TEAM_LABEL[teamKey]}
              </h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>
              {team.length} / 9
            </span>
          </div>

          <div className="space-y-1.5 mb-3 min-h-[60px]">
            {team.length === 0 && (
              <p className="text-xs italic" style={{ color: C.textMuted }}>فاضي — انضم!</p>
            )}
            {team.map((p) => {
              const isCaptain = p.id === captainId;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg"
                  style={{
                    background: `${color}10`,
                    border: `1px solid ${isCaptain ? color + '60' : color + '20'}`,
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm truncate">{p.name}</span>
                    {isCaptain && <span className="text-sm">👑</span>}
                    {p.id === me.id && <span className="text-[10px]" style={{ color: C.amber }}>أنت</span>}
                  </div>
                  {isAdmin && !isCaptain && (
                    <button
                      onClick={() => emit('cn_set_captain', { playerId: p.id, team: teamKey })}
                      className="text-[10px] px-2 py-0.5 rounded"
                      style={{ background: `${C.amber}20`, color: C.amber, border: `1px solid ${C.amber}40` }}
                    >
                      عيّن كابتن
                    </button>
                  )}
                  {isAdmin && isCaptain && (
                    <button
                      onClick={() => emit('cn_remove_captain', { team: teamKey })}
                      className="text-[10px] px-2 py-0.5 rounded"
                      style={{ background: `${C.red}20`, color: C.red, border: `1px solid ${C.red}40` }}
                    >
                      إزالة
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* أنا في الفريق ده → زرار خروج */}
          {isMyTeam && (
            <GlassButton
              variant="neutral"
              size="sm"
              onClick={() => emit('cn_leave_team')}
              className="w-full"
            >
              اخرج
            </GlassButton>
          )}

          {/* مش في أي فريق → زرار انضمام */}
          {!isMyTeam && !myTeam && (
            <GlassButton
              variant={teamKey === 'red' ? 'red' : 'blue'}
              size="sm"
              onClick={() => emit('cn_select_team', { team: teamKey })}
              className="w-full"
            >
              انضم
            </GlassButton>
          )}

          {/* في فريق تاني → رسالة توضيحية */}
          {!isMyTeam && myTeam && (
            <p className="text-center text-[10px] italic" style={{ color: C.textMuted }}>
              اخرج من فريقك الأول لو عايز تنضم هنا
            </p>
          )}
          {!isAdmin && isMyTeam && (
            <GlassButton
              variant="neutral"
              size="sm"
              onClick={() => emit('cn_leave_team')}
              className="w-full"
            >
              اخرج
            </GlassButton>
          )}
        </GlassCard>
      );
    };

    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        <GlassCard className="p-6 text-center">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-6xl mb-3"
          >
            🎯
          </motion.div>
          <h2 className="text-3xl font-black mb-1">
            <span className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              كلمة السر
            </span>
          </h2>
          <p className="text-slate-400 text-sm">
            كل فريق لازم يكون فيه <span className="text-amber-400 font-bold">كابتن 👑</span> + لاعب على الأقل
          </p>
        </GlassCard>

        {unassigned.length > 0 && (
          <GlassCard className="p-3">
            <p className="text-xs mb-2" style={{ color: C.textDim }}>في انتظار الانضمام ({unassigned.length}):</p>
            <div className="flex flex-wrap gap-2">
              {unassigned.map((p) => (
                <span key={p.id} className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                  {p.name} {p.id === me.id && '(أنت)'}
                </span>
              ))}
            </div>
          </GlassCard>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {renderTeamCard('red')}
          {renderTeamCard('blue')}
        </div>

        {isAdmin && (
          <GlassButton
            variant={canStart ? 'success' : 'neutral'}
            size="lg"
            disabled={!canStart}
            onClick={() => emit('cn_start')}
            className="w-full"
          >
            {canStart ? '🎬 ابدأ اللعبة' : 'محتاج كابتنين + لاعب في كل فريق'}
          </GlassButton>
        )}
        {!isAdmin && (
          <p className="text-center text-slate-500 text-sm italic">
            في انتظار المُيسّر يبدأ اللعبة...
          </p>
        )}
      </div>
    );
  };

  // ============================================================
  // GAME BOARD
  // ============================================================
  const renderBoard = () => {
    const isMyTurn = myTeam === state.currentTeam;
    const isMyCaptain = me.isCaptain && isMyTurn;
    const canGuess = isMyTurn && !me.isCaptain && me.team;
    const awaitingHint = isMyTurn && !state.hint;

    return (
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4">
        <div className="flex gap-4">

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* Status bar */}
            <GlassCard
              className="p-3 mb-4"
              accent={state.currentTeam === 'red' ? C.red : C.blue}
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: state.currentTeam === 'red' ? C.red : C.blue,
                      boxShadow: `0 0 16px ${state.currentTeam === 'red' ? C.red : C.blue}`,
                    }}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>الدور</p>
                    <p className="text-base font-black" style={{ color: state.currentTeam === 'red' ? C.red : C.blue }}>
                      {TEAM_LABEL[state.currentTeam]}
                      {isMyTurn && <span className="text-xs text-amber-400 mr-2"> (دورك!)</span>}
                    </p>
                  </div>
                </div>

                {state.hint && (
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>تخمينات</p>
                    <p className="text-lg font-black tabular-nums text-white">
                      {state.guessesLeft} / {state.hint.number + 1}
                    </p>
                  </div>
                )}
                {/* ✅ أي لاعب في الفريق يقدر ينهي الدور (مش الكابتن) */}
                {canGuess && state.hint && (
                  <GlassButton
                    variant="neutral"
                    size="sm"
                    onClick={() => emit('cn_end_turn')}
                  >
                    ✋ خلصنا — إنهاء الدور
                  </GlassButton>
                )}
              </div>
            </GlassCard>

            {/* Captain's hint form */}
            <AnimatePresence>
              {isMyCaptain && awaitingHint && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4"
                >
                  <GlassCard accent={C.amber} className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">👑</span>
                      <div>
                        <p className="text-sm font-black text-amber-400">دور الكابتن — أعطي تلميح</p>
                        <p className="text-[10px]" style={{ color: C.textMuted }}>
                          كلمة واحدة + رقم (عدد الكلمات اللي بتوصفهم)
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-col sm:flex-row">
                      <input
                        type="text"
                        value={hintWord}
                        onChange={(e) => setHintWord(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleHintSubmit(); }}
                        placeholder="مثال: إضاءة"
                        maxLength={30}
                        className="flex-1 bg-white/[0.06] border-2 border-amber-400/40 rounded-xl px-4 py-3 text-lg font-bold text-white outline-none focus:border-amber-400 transition placeholder:text-slate-600"
                      />
                      <div className="flex items-center gap-2 bg-white/[0.06] border-2 border-amber-400/40 rounded-xl px-3">
                        <span className="text-xs" style={{ color: C.textDim }}>الرقم:</span>
                        <select
                          value={hintNumber}
                          onChange={(e) => setHintNumber(parseInt(e.target.value))}
                          className="bg-transparent text-lg font-bold text-white outline-none cursor-pointer py-3"
                        >
                          {[1,2,3,4,5,6,7,8,9].map((n) => (
                            <option key={n} value={n} className="bg-[#0a0a1a]">{n}</option>
                          ))}
                        </select>
                      </div>
                      <GlassButton
                        variant="amber"
                        size="lg"
                        disabled={!hintWord.trim()}
                        onClick={handleHintSubmit}
                      >
                        📢 أرسل التلميح
                      </GlassButton>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Team captain view (non-turn) */}
            {isMyCaptain && !awaitingHint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4"
              >
                <GlassCard className="p-3 text-center">
                  <p className="text-xs" style={{ color: C.textDim }}>
                    ✅ التلميح اتسجل: <span className="font-black text-white">"{state.hint.word}" — {state.hint.number}</span>
                    <br />
                    <span className="text-[10px]" style={{ color: C.textMuted }}>
                      فريقتك بتخمن دلوقتي...
                    </span>
                  </p>
                </GlassCard>
              </motion.div>
            )}

            {/* Guesser waiting for hint */}
            {canGuess && awaitingHint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4"
              >
                <GlassCard className="p-3 text-center">
                  <motion.p
                    className="text-sm"
                    style={{ color: C.amber }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ⏳ في انتظار تلميح الكابتن...
                  </motion.p>
                </GlassCard>
              </motion.div>
            )}

            {/* Hint shown to guessers */}
            {canGuess && state.hint && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4"
              >
                <GlassCard accent={C.amber} className="p-4 text-center">
                  <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: C.textMuted }}>
                    تلميح الكابتن
                  </p>
                  <p className="text-2xl font-black text-white mb-2">
                    "{state.hint.word}" <span className="text-amber-400">— {state.hint.number}</span>
                  </p>
                  <p className="text-xs" style={{ color: C.amber }}>
                    🎯 عندك {state.guessesLeft} تخمين — اضغط على أي كلمة
                  </p>
                  <p className="text-[10px] mt-2" style={{ color: C.textMuted }}>
                    💬 اتفقوا مع فريقك في الشات، ولما تخلصوا دوس "إنهاء الدور"
                  </p>
                </GlassCard>
              </motion.div>
            )}

            {/* Board */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {state.board.map((cell) => (
                <WordCell
                  key={cell.index}
                  cell={cell}
                  canSeeColors={canSeeColors}
                  canGuess={canGuess}
                  onGuess={(i) => emit('cn_guess', { index: i })}
                  isCurrentTeam={isMyTurn}
                />
              ))}
            </div>

            {/* Bottom hint */}
            {canSeeColors && (
              <div className="mt-4 text-center">
                <p className="text-xs" style={{ color: C.textMuted }}>
                  👑 أنت الكابتن — بتشوف الألوان
                </p>
              </div>
            )}
            {canGuess && (
              <div className="mt-4 text-center">
                <p className="text-xs" style={{ color: C.textMuted }}>
                  👀 مفيش ألوان — لازم تخمن من التلميح
                </p>
              </div>
            )}
          </div>

          {/* Chat Sidebar (desktop) */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-4 h-[calc(100vh-100px)]">
              <ChatPanel
                chat={state.chat}
                onSend={handleChatSend}
                me={me}
                players={state.players}
                isMobileOpen={true}
                onClose={() => {}}
              />
            </div>
          </div>
        </div>

        {/* Chat (mobile) */}
        <div className="lg:hidden">
          <ChatPanel
            chat={state.chat}
            onSend={handleChatSend}
            me={me}
            players={state.players}
            isMobileOpen={chatOpenMobile}
            onClose={() => setChatOpenMobile(false)}
          />
        </div>
      </div>
    );
  };

  // ============================================================
  // ENDED
  // ============================================================
  const renderEnded = () => {
    const winnerColor = state.winner === 'red' ? C.red : C.blue;
    const isWinner = myTeam === state.winner;
    const winnerLabel = TEAM_LABEL[state.winner];

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 relative">
        <Confetti />

        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="relative z-30 text-center"
        >
          <motion.div
            className="text-8xl mb-4"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {isWinner ? '🏆' : '😔'}
          </motion.div>
          <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: C.textMuted }}>
            الفائز
          </p>
          <motion.h2
            className="text-5xl sm:text-6xl font-black mb-4"
            style={{
              color: winnerColor,
              textShadow: `0 0 40px ${winnerColor}, 0 0 80px ${winnerColor}60`,
            }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {winnerLabel}
          </motion.h2>

          {isWinner && myTeam && (
            <p className="text-emerald-400 text-lg font-bold">🎉 فريقك فاز!</p>
          )}

          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="rounded-2xl p-4" style={{ background: `${C.red}15`, border: `1px solid ${C.red}40` }}>
              <p className="text-xs" style={{ color: C.textDim }}>🔴 أحمر</p>
              <p className="text-3xl font-black tabular-nums" style={{ color: C.red }}>
                {state.teams.red.wordsLeft}
              </p>
              <p className="text-[10px]" style={{ color: C.textMuted }}>متبقي</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: `${C.blue}15`, border: `1px solid ${C.blue}40` }}>
              <p className="text-xs" style={{ color: C.textDim }}>🔵 أزرق</p>
              <p className="text-3xl font-black tabular-nums" style={{ color: C.blue }}>
                {state.teams.blue.wordsLeft}
              </p>
              <p className="text-[10px]" style={{ color: C.textMuted }}>متبقي</p>
            </div>
          </div>
        </motion.div>

        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 relative z-30"
          >
            <GlassButton
              variant="success"
              size="lg"
              onClick={() => emit('cn_reset')}
              className="w-full"
            >
              🔄 العب تاني
            </GlassButton>
          </motion.div>
        )}
      </div>
    );
  };

  // ============================================================
  // MAIN
  // ============================================================
  return (
    <div dir="rtl" className="relative min-h-screen text-white overflow-hidden">
      <BackgroundFX />
      {renderHUD()}

      <AnimatePresence mode="wait">
        {phase === 'lobby' && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderLobby()}
          </motion.div>
        )}
        {phase === 'playing' && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderBoard()}
          </motion.div>
        )}
        {phase === 'ended' && (
          <motion.div key="ended" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderEnded()}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]"
          >
            <div className="rounded-2xl p-[1.5px] overflow-hidden">
              <motion.div
                className="absolute inset-[-150%]"
                style={{ background: 'conic-gradient(from 0deg, transparent 0%, #ef4444 20%, #fbbf24 40%, transparent 60%)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
              <div className="relative rounded-2xl bg-[#0a0a1a] px-6 py-3 font-bold">⚠️ {error}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Rules Modal */}
      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />
    </div>
  );
}