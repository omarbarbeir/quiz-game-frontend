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
  green: '#10b981',
  amber: '#f59e0b',
  purple: '#a855f7',
  text: '#e5e7eb',
  textDim: '#94a3b8',
  textMuted: '#64748b',
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
      // ready: '/sounds/ready.mp3',
      win: '/sounds/win.mp3',
      // tick: '/sounds/tick.mp3',
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
// 💎 LIQUID GLASS BUTTON
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
    xl: 'px-10 py-5 text-xl',
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

      <span
        className={`relative block rounded-xl ${sizes[size]} font-bold transition-colors duration-300`}
        style={{
          color: v.text,
          background: `linear-gradient(180deg,
            rgba(255,255,255,0.06) 0%,
            rgba(255,255,255,0.02) 100%)`,
        }}
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg,
              transparent,
              rgba(255,255,255,0.4) 50%,
              transparent)`,
          }}
        />
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

// =====================================================
// 🪟 LIQUID GLASS CARD
// =====================================================
const GlassCard = ({ children, className = '', accent = null }) => (
  <div
    className={`relative rounded-2xl overflow-hidden ${className}`}
    style={{
      background: `linear-gradient(145deg,
        rgba(255,255,255,0.04),
        rgba(255,255,255,0.01) 50%,
        rgba(0,0,0,0.15))`,
      backdropFilter: 'blur(16px) saturate(160%)',
      WebkitBackdropFilter: 'blur(16px) saturate(160%)',
      border: `1.5px solid ${accent ? accent + '40' : 'rgba(255,255,255,0.08)'}`,
      boxShadow: accent
        ? `0 8px 28px -8px ${accent}55, inset 0 0 24px ${accent}12, inset 0 1px 0 rgba(255,255,255,0.15)`
        : `0 8px 28px -8px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)`,
    }}
  >
    <span
      className="pointer-events-none absolute inset-x-3 top-0 h-px"
      style={{
        background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.5) 50%, transparent)`,
      }}
    />
    <span
      className="pointer-events-none absolute inset-0 rounded-2xl"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.06) 0%, transparent 60%)`,
      }}
    />
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
        <div className="text-3xl font-black tabular-nums" style={{ color }}>{Math.ceil(value)}</div>
        {label && <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{label}</div>}
      </div>
    </div>
  );
};

// =====================================================
// 📖 Rules Modal
// =====================================================
const RulesModal = ({ open, onClose }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-start justify-center p-4 overflow-y-auto taboo-scroll"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ y: -40, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -40, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          className="my-8 w-full max-w-2xl"
        >
          <GlassCard accent={C.amber} className="p-0">
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ borderColor: C.border, background: `linear-gradient(90deg, ${C.amber}10, transparent)` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${C.amber}20`, border: `1px solid ${C.amber}50` }}>
                  <span className="text-xl">📖</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: C.amber }}>
                    HOW TO PLAY
                  </p>
                  <h2 className="text-xl font-black text-white">قواعد الكلمات الممنوعة</h2>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="taboo-scroll p-5 max-h-[75vh] overflow-y-auto space-y-5 text-sm leading-relaxed">

              <div>
                <h3 className="font-black text-lg mb-2 flex items-center gap-2" style={{ color: C.amber }}>
                  🎯 الفكرة
                </h3>
                <p className="text-slate-300">
                  لعبة فريقين. كل دور، <strong className="text-white">راوي</strong> من فريق يشوف كلمة + 5 كلمات <strong className="text-red-300">ممنوعة</strong>،
                  ومحتاج يوصّف الكلمة لفريقه بدون ما يستخدم أي كلمة من الممنوعات.
                  فريقه لازم يخمن الكلمة الصح.
                </p>
              </div>

              <div>
                <h3 className="font-black text-lg mb-2 flex items-center gap-2 " style={{ color: C.amber }}>
                  🎲 الجولات والبطاقات
                </h3>
                <p className="text-slate-300 mb-3">
                  اللعبة عبارة عن <strong className="text-white">6 أدوار</strong> — كل مستوى عنده عدد بطاقات مختلف:
                </p>
                <div className="space-y-2">
                  {[
                    { label: 'الدور 1', team: '🔴 أحمر', diff: '🟢 سهل', cards: 6, color: C.red },
                    { label: 'الدور 2', team: '🔵 أزرق', diff: '🟢 سهل', cards: 6, color: C.blue },
                    { label: 'الدور 3', team: '🔴 أحمر', diff: '🟡 متوسط', cards: 4, color: C.red },
                    { label: 'الدور 4', team: '🔵 أزرق', diff: '🟡 متوسط', cards: 4, color: C.blue },
                    { label: 'الدور 5', team: '🔴 أحمر', diff: '🔴 صعب', cards: 3, color: C.red },
                    { label: 'الدور 6', team: '🔵 أزرق', diff: '🔴 صعب', cards: 3, color: C.blue },
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg"
                      style={{ background: `${t.color}10`, border: `1px solid ${t.color}30` }}>
                      <span className="text-xs font-bold" style={{ color: t.color }}>{t.label}</span>
                      <span className="text-xs text-slate-300">{t.team}</span>
                      <span className="text-xs">{t.diff}</span>
                      <span className="text-xs ml-auto text-white font-bold">{t.cards} بطاقات</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-3 rounded-lg" style={{ background: `${C.amber}10`, border: `1px solid ${C.amber}40` }}>
                  <p className="text-xs text-slate-300">
                    <strong className="text-amber-300">💡 المجموع:</strong> 13 بطاقة لكل فريق = <strong className="text-white">26 نقطة max</strong> في اللعبة كلها
                  </p>
                </div>

                <p className="text-xs text-slate-400 mt-2">
                  كل دور = <strong className="text-white">60 ثانية</strong> أو لحد ما البطاقات تخلص.
                  الراوي بيتغير عشوائي كل دور.
                </p>
              </div>

              <div>
                <h3 className="font-black text-lg mb-2 flex items-center gap-2" style={{ color: C.amber }}>
                  👤 الأدوار
                </h3>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg" style={{ background: `${C.amber}10`, border: `1px solid ${C.amber}40` }}>
                    <p className="font-bold text-amber-300 mb-1">🎙️ الراوي</p>
                    <p className="text-slate-300 text-xs">
                      يشوف البطاقة (الكلمة + الممنوعات). بيكتب تلميحات في شات فريقه. مش بيقول الكلمة نفسها.
                      بيدوس "✅ صح" لما فريقه يخمن صح.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: `rgba(255,255,255,0.03)`, border: `1px solid ${C.border}` }}>
                    <p className="font-bold text-white mb-1">🕵️ الفريق</p>
                    <p className="text-slate-300 text-xs">
                      بيشوف تلميحات الراوي في شات الفريق، ويحاول يخمن الكلمة.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ background: `${C.red}10`, border: `1px solid ${C.red}40` }}>
                    <p className="font-bold text-red-300 mb-1">🚨 الفريق الخصم</p>
                    <p className="text-slate-300 text-xs">
                      بيراقب. لو الراوي قال كلمة من الممنوعات، يدوس زرار "🚨 غشاش"
                      → الفريق الراوي يخسر نقطة، والدور يروح للخصم فورًا.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-black text-lg mb-2 flex items-center gap-2" style={{ color: C.amber }}>
                  🎮 طريقة اللعب
                </h3>
                <ol className="space-y-2 list-decimal list-inside marker:text-amber-400">
                  <li className="text-slate-300">الراوي يقرأ الكلمة والممنوعات <strong className="text-white">على شاشته فقط</strong></li>
                  <li className="text-slate-300">يكتب تلميح في <strong className="text-white">شات فريقه</strong> (قناة الفريق)</li>
                  <li className="text-slate-300">الفريق يقرأ ويخمن في نفس الشات</li>
                  <li className="text-slate-300">لما حد يقول الكلمة الصح → الراوي يدوس <strong className="text-emerald-400">✅ صح</strong> → نقطة للفريق + بطاقة جديدة</li>
                  <li className="text-slate-300">لو البطاقة صعبة → الراوي يدوس <strong className="text-amber-400">⏭️ Pass</strong> (2 بس في الدور) → بطاقة جديدة</li>
                  <li className="text-slate-300">لو قال كلمة ممنوعة → أي حد من الخصم يدوس <strong className="text-red-400">🚨 غشاش</strong></li>
                </ol>
              </div>

              <div>
                <h3 className="font-black text-lg mb-2 flex items-center gap-2" style={{ color: C.red }}>
                  ⚠️ ممنوع في التلميح
                </h3>
                <ul className="space-y-1 text-slate-300">
                  <li>❌ إنك تستخدم أي كلمة من قائمة الممنوعات الخمسة</li>
                  <li>❌ إنك تقول الكلمة نفسها</li>
                  <li>❌ إنك تستخدم جزء من الكلمة</li>
                  <li>❌ إنك تستخدم لغة تانية (إنجليزي)</li>
                  <li>❌ إنك تكتب حروف أو أرقام تشير للكلمة</li>
                </ul>
              </div>

              <div>
                <h3 className="font-black text-lg mb-2 flex items-center gap-2" style={{ color: C.amber }}>
                  💡 مثال
                </h3>
                <div className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
                  <div className="text-center mb-3">
                    <p className="text-xs text-slate-500 mb-1">البطاقة</p>
                    <p className="text-2xl font-black text-white mb-2">🚗 عربية</p>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {['عجلة', 'طريق', 'سواقة', 'بنزين', 'مواصلات'].map((f, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: `${C.red}20`, color: '#fca5a5', border: `1px solid ${C.red}40` }}>
                          ✗ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <p className="text-red-300">
                      ❌ "حاجة بتمشي على 4 عجلات على الطريق" (استخدم "عجلة" و"طريق")
                    </p>
                    <p className="text-emerald-300">
                      ✅ "حاجة بتنقل الناس من مكان لمكان، وفي منها أنواع كتير، وفي منها تكسي وأتوبيس"
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-black text-lg mb-2 flex items-center gap-2" style={{ color: '#10b981' }}>
                  🏆 الفوز
                </h3>
                <p className="text-slate-300">
                  بعد الـ 6 أدوار، <strong className="text-white">الفريق اللي عنده أعلى مجموع نقاط</strong> يكسب.
                  لو الفريقين تعادلوا → تعادل.
                </p>
              </div>

            </div>

            <div className="px-6 py-4 border-t flex justify-center"
              style={{ borderColor: C.border, background: C.bg1 }}>
              <GlassButton variant="amber" onClick={onClose}>✅ فهمت، يلا نبدأ</GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// =====================================================
// 💬 Chat Panel
// =====================================================
const ChatPanel = ({ chat, onSend, me, players, isMobileOpen, onClose }) => {
  const [channel, setChannel] = useState('general');
  const [text, setText] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const myTeam = me?.team;
  const isAdmin = me?.isAdmin;

  useEffect(() => {
    if (myTeam && !isAdmin) setChannel(myTeam);
  }, [myTeam, isAdmin]);

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
    ...(myTeam === 'red' || isAdmin ? [{ id: 'red', label: '🔴 أحمر', color: C.red }] : []),
    ...(myTeam === 'blue' || isAdmin ? [{ id: 'blue', label: '🔵 أزرق', color: C.blue }] : []),
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
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
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
          <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: C.border }}>
            <div className="flex items-center gap-2">
              <span className="text-lg">💬</span>
              <span className="font-bold">الشات</span>
            </div>
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white text-2xl leading-none">×</button>
          </div>

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

          <div ref={scrollRef} className="taboo-scroll flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
            {filteredChat.length === 0 && (
              <p className="text-center text-xs text-slate-600 italic py-6">مفيش رسايل لسه</p>
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
                    <span className="text-[10px] font-bold"
                      style={{ color: m.isAdmin ? C.amber : teamColor }}>
                      {m.playerName}
                    </span>
                    {m.isDescriber && <span className="text-[10px]" title="الراوي">🎙️</span>}
                    {m.isAdmin && <span className="text-[10px]" title="أدمن">🎩</span>}
                  </div>
                  <div
                    className="rounded-2xl px-3 py-1.5 max-w-full text-sm break-words"
                    style={{
                      background: isMe ? `${teamColor}30` : 'rgba(255,255,255,0.05)',
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
// 🎴 Card Display
// =====================================================
const CardDisplay = ({ card, difficulty, timeLeft, passesLeft, cardsRemaining, cardsTotal, onCorrect, onPass, isDescriber }) => {
  const diffLabel = { easy: 'سهل', medium: 'متوسط', hard: 'صعب' }[difficulty];
  const diffColor = { easy: '#10b981', medium: '#f59e0b', hard: '#dc2626' }[difficulty];
  const pct = cardsTotal > 0 ? ((cardsTotal - cardsRemaining) / cardsTotal) * 100 : 0;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
      className="w-full"
    >
      <GlassCard accent={diffColor} className="p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1 rounded-full font-black"
              style={{ background: `${diffColor}25`, color: diffColor, border: `1px solid ${diffColor}60` }}>
              {diffLabel === 'سهل' ? '🟢' : diffLabel === 'متوسط' ? '🟡' : '🔴'} {diffLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}` }}>
            <span className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>البطاقات</span>
            <span className="text-lg font-black tabular-nums" style={{ color: diffColor }}>
              {cardsRemaining}
            </span>
            <span className="text-xs" style={{ color: C.textMuted }}>/ {cardsTotal}</span>
          </div>

          <CountdownRing value={timeLeft} total={60} size={70} color={timeLeft <= 10 ? '#ef4444' : diffColor} />

          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>Pass</p>
            <p className="text-xl font-black tabular-nums" style={{ color: C.amber }}>
              {passesLeft}
            </p>
          </div>
        </div>

        <div className="h-1.5 rounded-full overflow-hidden mb-6"
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${diffColor}, ${diffColor}80)`,
              boxShadow: `0 0 12px ${diffColor}80`,
            }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <div className="text-center mb-6">
          <p className="text-[10px] uppercase tracking-[0.4em] mb-3" style={{ color: C.textMuted }}>
            الكلمة المطلوبة
          </p>
          <motion.h1
            key={card.word}
            className="text-5xl sm:text-6xl font-black mb-2"
            style={{
              background: `linear-gradient(135deg, #fff, ${diffColor})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: `drop-shadow(0 0 30px ${diffColor}60)`,
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {card.word}
          </motion.h1>
        </div>

        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-widest mb-3 text-center" style={{ color: C.red }}>
            ⛔ ممنوع تستخدم
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {card.forbidden.map((f, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="px-4 py-2 rounded-xl font-bold text-sm"
                style={{
                  background: `${C.red}15`,
                  border: `1.5px solid ${C.red}50`,
                  color: '#fca5a5',
                  textDecoration: 'line-through',
                  textDecorationColor: C.red,
                }}
              >
                ✗ {f}
              </motion.span>
            ))}
          </div>
        </div>

        {isDescriber && (
          <div className="flex gap-3 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
            <GlassButton
              variant="success"
              size="lg"
              onClick={onCorrect}
              className="flex-1"
            >
              ✅ صح ({cardsRemaining - 1} متبقي)
            </GlassButton>
            <GlassButton
              variant="amber"
              size="lg"
              onClick={onPass}
              disabled={passesLeft <= 0}
              className="flex-1"
            >
              ⏭️ Pass ({passesLeft})
            </GlassButton>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

// =====================================================
// 🎮 MAIN
// =====================================================
export default function Taboo({
  socket, roomCode, playerId, playerName, isAdmin = false, players = [], onExit,
}) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [rulesOpen, setRulesOpen] = useState(false);
  const [chatOpenMobile, setChatOpenMobile] = useState(false);
  const [showConfirmCheat, setShowConfirmCheat] = useState(false);

  const { play: playSound, stopAll: stopAllSounds } = useSoundEffects();
  const prevPhaseRef = useRef(null);
  const tickRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    const onState = (s) => setState(s);
    const onError = ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3500);
    };

    socket.on('tb_state', onState);
    socket.on('tb_error', onError);

    // ✅ الأدمن واللاعبين بيدخلوا من نفس الـ join event
    socket.emit('tb_join', { roomCode, playerId, playerName, isAdmin });

    return () => {
      socket.off('tb_state', onState);
      socket.off('tb_error', onError);
      socket.emit('tb_leave', { roomCode });
    };
  }, [socket, roomCode, playerId, playerName, isAdmin]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!state) return;
    const prev = prevPhaseRef.current;
    const cur = state.phase;
    if (prev === cur) return;
    stopAllSounds();
    if (cur === 'playing') playSound('ready');
    else if (cur === 'gameEnd') playSound('win');
    prevPhaseRef.current = cur;
  }, [state?.phase, playSound, stopAllSounds, state]);

  const timeLeft = state?.phase === 'playing'
    ? Math.max(0, Math.ceil((state.phaseStartedAt + 60000 - now) / 1000))
    : 0;

  useEffect(() => {
    if (state?.phase !== 'playing') return;
    if (timeLeft <= 5 && timeLeft > 0 && tickRef.current !== timeLeft) {
      tickRef.current = timeLeft;
      playSound('tick');
    }
    if (timeLeft > 5) tickRef.current = null;
  }, [state?.phase, timeLeft, playSound]);

  const emit = useCallback((ev, payload) => {
    socket?.emit(ev, { roomCode, ...payload });
  }, [socket, roomCode]);

  if (!state) {
    return (
      <div dir="rtl" className="relative min-h-screen bg-[#050510] text-white flex items-center justify-center">
        <BackgroundFX />
        <div className="text-center">
          <motion.div
            className="w-16 h-16 rounded-full mx-auto mb-4"
            style={{ border: '3px solid transparent', borderTopColor: '#dc2626', borderRightColor: '#2563eb' }}
            animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-slate-400 tracking-wider">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const { phase, me } = state;
  const isPlaying = phase === 'playing';
  const isReviewing = phase === 'reviewing';
  const isGameEnd = phase === 'gameEnd';
  const myTeam = me?.team;
  const isDescriber = me?.isDescriber;
  const canSeeCard = isDescriber;
  const amOnCurrentTeam = myTeam === state.currentTeam;
  const amOpposingTeam = myTeam && myTeam !== state.currentTeam;

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
            {me.isAdmin && (
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

          {(isPlaying || isReviewing || isGameEnd) && (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className={`text-center px-3 py-1 rounded-lg transition ${state.currentTeam === 'red' ? 'ring-2 ring-red-500' : ''}`}
                style={{ background: `${C.red}15` }}>
                <p className="text-[8px] uppercase tracking-widest" style={{ color: C.red }}>أحمر</p>
                <p className="text-lg font-black tabular-nums" style={{ color: C.red }}>{state.scores.red}</p>
              </div>
              <div className="text-center text-xs" style={{ color: C.textMuted }}>
                <p className="text-[8px] uppercase tracking-widest">الدور</p>
                <p className="font-black text-sm">{state.turnIndex + 1}/{state.totalTurns}</p>
              </div>
              <div className={`text-center px-3 py-1 rounded-lg transition ${state.currentTeam === 'blue' ? 'ring-2 ring-blue-500' : ''}`}
                style={{ background: `${C.blue}15` }}>
                <p className="text-[8px] uppercase tracking-widest" style={{ color: C.blue }}>أزرق</p>
                <p className="text-lg font-black tabular-nums" style={{ color: C.blue }}>{state.scores.blue}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {myTeam && (
              <div className="text-[10px] font-bold px-2 py-1 rounded-lg"
                style={{
                  background: `${myTeam === 'red' ? C.red : C.blue}20`,
                  color: myTeam === 'red' ? C.red : C.blue,
                  border: `1px solid ${myTeam === 'red' ? C.red : C.blue}50`,
                }}>
                {myTeam === 'red' ? '🔴' : '🔵'} {TEAM_LABEL[myTeam]}
                {isDescriber && ' 🎙️'}
              </div>
            )}
            <motion.button
              onClick={() => setRulesOpen(true)}
              whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
              className="rounded-lg px-2.5 py-1 text-[11px] font-bold flex items-center gap-1"
              style={{ background: `${C.amber}15`, border: `1px solid ${C.amber}40`, color: C.amber }}
              title="قواعد اللعب"
            >
              <span>📖</span>
              <span className="hidden sm:inline">القواعد</span>
            </motion.button>
            <button onClick={() => setChatOpenMobile(true)} className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg bg-white/5">
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

    const canStart = redTeam.length >= 2 && blueTeam.length >= 2;

    const renderTeamCard = (teamKey) => {
      const team = teamKey === 'red' ? redTeam : blueTeam;
      const color = teamKey === 'red' ? C.red : C.blue;
      const isMyTeam = myTeam === teamKey;

      return (
        <GlassCard accent={color} className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{teamKey === 'red' ? '🔴' : '🔵'}</span>
              <h3 className="text-lg font-black" style={{ color }}>{TEAM_LABEL[teamKey]}</h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: `${color}20`, color }}>
              {team.length}
            </span>
          </div>

          <div className="space-y-1.5 mb-3 min-h-[60px]">
            {team.length === 0 && <p className="text-xs italic" style={{ color: C.textMuted }}>فاضي — انضم!</p>}
            {team.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 p-2 rounded-lg"
                style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
                <span className="text-sm truncate">{p.name}</span>
                {p.id === me.id && <span className="text-[10px]" style={{ color: C.amber }}>أنت</span>}
              </div>
            ))}
          </div>

          {isMyTeam && (
            <GlassButton variant="neutral" size="sm"
              onClick={() => emit('tb_leave_team')} className="w-full">
              اخرج
            </GlassButton>
          )}
          {!isMyTeam && !myTeam && (
            <GlassButton variant={teamKey === 'red' ? 'red' : 'blue'} size="sm"
              onClick={() => emit('tb_select_team', { team: teamKey })} className="w-full">
              انضم
            </GlassButton>
          )}
          {!isMyTeam && myTeam && (
            <p className="text-center text-[10px] italic" style={{ color: C.textMuted }}>
              اخرج من فريقك الأول لو عايز تنضم هنا
            </p>
          )}
        </GlassCard>
      );
    };

    return (
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        <GlassCard className="p-6 text-center">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-6xl mb-3">
            🚫
          </motion.div>
          <h2 className="text-3xl font-black mb-1">
            <span className="bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              الكلمات الممنوعة
            </span>
          </h2>
          <p className="text-slate-400 text-sm">6 أدوار · 3 مستويات · 60 ثانية لكل دور</p>
          <button
            onClick={() => setRulesOpen(true)}
            className="mt-3 text-xs px-4 py-2 rounded-lg font-bold"
            style={{ background: `${C.amber}15`, border: `1px solid ${C.amber}40`, color: C.amber }}
          >
            📖 اقرأ القواعد أول
          </button>
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
          <GlassButton variant={canStart ? 'success' : 'neutral'} size="lg"
            disabled={!canStart} onClick={() => emit('tb_start')} className="w-full">
            {canStart ? '🎬 ابدأ اللعبة' : 'محتاج لاعبين على الأقل في كل فريق'}
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
  // PLAYING / REVIEWING
  // ============================================================
  const renderPlayingOrReviewing = () => {
    const currentTeamColor = state.currentTeam === 'red' ? C.red : C.blue;

    return (
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4">
        <div className="flex gap-4">

          <div className="flex-1 min-w-0">

            <GlassCard accent={currentTeamColor} className="p-3 mb-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="w-3 h-3 rounded-full"
                    style={{ background: currentTeamColor, boxShadow: `0 0 16px ${currentTeamColor}` }}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>الدور الحالي</p>
                    <p className="text-base font-black" style={{ color: currentTeamColor }}>
                      {TEAM_LABEL[state.currentTeam]}
                      {amOnCurrentTeam && <span className="text-xs text-amber-400 mr-2"> (دورك!)</span>}
                    </p>
                  </div>
                </div>

                {state.currentDifficultyLabel && (
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>الصعوبة</p>
                    <p className="text-sm font-black text-white">
                      {state.currentDifficulty === 'easy' ? '🟢' : state.currentDifficulty === 'medium' ? '🟡' : '🔴'} {state.currentDifficultyLabel}
                    </p>
                  </div>
                )}

                {state.currentDescriberName && (
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>الراوي</p>
                    <p className="text-sm font-black text-amber-300">🎙️ {state.currentDescriberName}</p>
                  </div>
                )}

                {isPlaying && amOpposingTeam && (
                  <motion.button
                    onClick={() => setShowConfirmCheat(true)}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="rounded-xl px-4 py-2 font-black text-sm flex items-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${C.red}30, ${C.red}15)`,
                      border: `1.5px solid ${C.red}80`,
                      color: '#fca5a5',
                    }}
                    animate={{
                      boxShadow: [
                        `0 0 15px -4px ${C.red}80`,
                        `0 0 30px -4px ${C.red}`,
                        `0 0 15px -4px ${C.red}80`,
                      ],
                    }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  >
                    🚨 غشاش!
                  </motion.button>
                )}

                {isPlaying && isAdmin && !amOpposingTeam && !amOnCurrentTeam && (
                  <motion.button
                    onClick={() => setShowConfirmCheat(true)}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="rounded-xl px-4 py-2 font-black text-sm flex items-center gap-2"
                    style={{
                      background: `linear-gradient(135deg, ${C.red}30, ${C.red}15)`,
                      border: `1.5px solid ${C.red}80`,
                      color: '#fca5a5',
                    }}
                  >
                    🚨 غشاش!
                  </motion.button>
                )}

                {isAdmin && isPlaying && (
                  <GlassButton variant="neutral" size="sm" onClick={() => emit('tb_force_end_turn')}>
                    ⏹️ إنهاء
                  </GlassButton>
                )}
              </div>
            </GlassCard>

            {isReviewing && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
                <GlassCard accent={C.green} className="p-4 text-center">
                  <motion.p
                    className="text-sm font-bold"
                    style={{ color: C.green }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {getReviewMessage()}
                  </motion.p>
                </GlassCard>
              </motion.div>
            )}

            {isPlaying && canSeeCard && state.currentCard && (
              <div className="mb-4">
                <CardDisplay
                  card={state.currentCard}
                  difficulty={state.currentDifficulty}
                  timeLeft={timeLeft}
                  passesLeft={state.passesLeft}
                  cardsRemaining={state.cardsRemainingInTurn}
                  cardsTotal={state.cardsTotalInTurn}
                  isDescriber={isDescriber}
                  onCorrect={() => emit('tb_correct')}
                  onPass={() => emit('tb_pass')}
                />
              </div>
            )}

            {isPlaying && !canSeeCard && (
              <>
                <div className="mb-4">
                  <GlassCard accent={currentTeamColor} className="p-4">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-widest" style={{ color: C.textMuted }}>البطاقات</span>
                        <span className="text-2xl font-black tabular-nums" style={{ color: currentTeamColor }}>
                          {state.cardsRemainingInTurn}
                        </span>
                        <span className="text-sm" style={{ color: C.textMuted }}>/ {state.cardsTotalInTurn}</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-xs px-2 py-1 rounded-lg font-bold"
                          style={{ background: `${C.green}15`, color: C.green, border: `1px solid ${C.green}40` }}>
                          ✅ {state.turnCards.filter(t => t.result === 'correct').length} صح
                        </span>
                        <span className="text-xs px-2 py-1 rounded-lg font-bold"
                          style={{ background: `${C.amber}15`, color: C.amber, border: `1px solid ${C.amber}40` }}>
                          ⏭️ {state.turnCards.filter(t => t.result === 'passed').length} Pass
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${currentTeamColor}, ${currentTeamColor}80)`,
                          boxShadow: `0 0 12px ${currentTeamColor}80`,
                        }}
                        animate={{ width: `${state.cardsTotalInTurn > 0 ? ((state.cardsTotalInTurn - state.cardsRemainingInTurn) / state.cardsTotalInTurn) * 100 : 0}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </GlassCard>
                </div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-4">
                  <GlassCard accent={currentTeamColor} className="p-6 text-center">
                    <motion.div
                      className="text-6xl mb-4 inline-block"
                      animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      💬
                    </motion.div>
                    <h3 className="text-xl font-black text-white mb-2">
                      {amOnCurrentTeam ? 'في انتظار تلميحات الراوي...' : 'الفريق التاني بيلعب دلوقتي'}
                    </h3>
                    <p className="text-sm" style={{ color: C.textDim }}>
                      {amOnCurrentTeam
                        ? `اتفقوا مع فريقك في شات ${TEAM_LABEL[myTeam]} (تحت)`
                        : 'ركز — لو الراوي قال كلمة ممنوعة، دوس 🚨 غشاش'}
                    </p>

                    <div className="flex justify-center mt-6">
                      <CountdownRing
                        value={timeLeft}
                        total={60}
                        size={110}
                        color={timeLeft <= 10 ? '#ef4444' : currentTeamColor}
                        label="ثانية"
                      />
                    </div>
                  </GlassCard>
                </motion.div>
              </>
            )}

            {state.turnCards && state.turnCards.length > 0 && (
              <GlassCard className="p-4">
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: C.textMuted }}>
                  كلمات الدور ده ({state.turnCards.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {state.turnCards.map((t, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5"
                      style={{
                        background: t.result === 'correct' ? `${C.green}20` : `${C.amber}20`,
                        border: `1px solid ${t.result === 'correct' ? C.green : C.amber}60`,
                        color: t.result === 'correct' ? '#6ee7b7' : '#fcd34d',
                      }}
                    >
                      {t.result === 'correct' ? '✅' : '⏭️'} {t.word}
                    </motion.span>
                  ))}
                </div>
              </GlassCard>
            )}

            {state.cheatEvents && state.cheatEvents.length > 0 && (
              <GlassCard className="p-3 mt-4" accent={C.red}>
                <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: C.red }}>
                  🚨 آخر اتهامات الغش
                </p>
                <div className="taboo-scroll space-y-1 max-h-32 overflow-y-auto">
                  {state.cheatEvents.slice(-3).reverse().map((e, i) => (
                    <p key={i} className="text-xs" style={{ color: C.textDim }}>
                      <span style={{ color: C.amber }}>{e.accuserName}</span> اتهم{' '}
                      <span style={{ color: C.red }}>{e.describerName}</span> بالغش —{' '}
                      <span style={{ color: C.red }}>-1</span> لـ {TEAM_LABEL[e.team]}
                    </p>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>

          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-4 h-[calc(100vh-100px)]">
              <ChatPanel
                chat={state.chat}
                onSend={(text, channel) => emit('tb_chat_send', { text, channel })}
                me={me}
                players={state.players}
                isMobileOpen={true}
                onClose={() => {}}
              />
            </div>
          </div>
        </div>

        <div className="lg:hidden">
          <ChatPanel
            chat={state.chat}
            onSend={(text, channel) => emit('tb_chat_send', { text, channel })}
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
  // GAME END
  // ============================================================
  const renderGameEnd = () => {
    const redScore = state.scores.red;
    const blueScore = state.scores.blue;
    let winner = null;
    if (redScore > blueScore) winner = 'red';
    else if (blueScore > redScore) winner = 'blue';

    const isWinner = myTeam === winner;

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 relative">
        {winner && <Confetti />}

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
            {winner ? (isWinner ? '🏆' : '😔') : '🤝'}
          </motion.div>
          <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: C.textMuted }}>
            {winner ? 'الفائز' : 'تعادل'}
          </p>
          <motion.h2
            className="text-5xl sm:text-6xl font-black mb-4"
            style={{
              color: winner === 'red' ? C.red : winner === 'blue' ? C.blue : C.amber,
              textShadow: winner
                ? `0 0 40px ${winner === 'red' ? C.red : C.blue}, 0 0 80px ${winner === 'red' ? C.red : C.blue}60`
                : '0 0 40px rgba(245,158,11,0.6)',
            }}
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {winner ? TEAM_LABEL[winner] : 'الاتنين كسبوا!'}
          </motion.h2>

          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="rounded-2xl p-6" style={{ background: `${C.red}15`, border: `2px solid ${C.red}60` }}>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: C.red }}>🔴 أحمر</p>
              <p className="text-5xl font-black tabular-nums" style={{ color: C.red }}>{redScore}</p>
            </div>
            <div className="rounded-2xl p-6" style={{ background: `${C.blue}15`, border: `2px solid ${C.blue}60` }}>
              <p className="text-xs uppercase tracking-widest mb-2" style={{ color: C.blue }}>🔵 أزرق</p>
              <p className="text-5xl font-black tabular-nums" style={{ color: C.blue }}>{blueScore}</p>
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
            <GlassButton variant="success" size="lg" onClick={() => emit('tb_reset')} className="w-full">
              🔄 العب تاني
            </GlassButton>
          </motion.div>
        )}
      </div>
    );
  };

  const getReviewMessage = () => {
    if (!state) return '';
    const justPlayedTeam = TEAM_LABEL[state.currentTeam];
    const isRoundComplete = state.turnIndex % 2 === 1;  // 1، 3، 5 = الفريق التاني خلص
    if (isRoundComplete) {
      return `✅ خلصت اللفة — استعدوا للفة اللي بعدها!`;
    } else {
      const nextTeam = state.currentTeam === 'red' ? 'blue' : 'red';
      return `✅ خلص دور ${justPlayedTeam} — الدور على ${TEAM_LABEL[nextTeam]}!`;
    }
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
        {(phase === 'playing' || phase === 'reviewing') && (
          <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderPlayingOrReviewing()}
          </motion.div>
        )}
        {phase === 'gameEnd' && (
          <motion.div key="gameEnd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {renderGameEnd()}
          </motion.div>
        )}
      </AnimatePresence>

      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />

      <AnimatePresence>
        {showConfirmCheat && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowConfirmCheat(false); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm"
            >
              <GlassCard accent={C.red} className="p-6 text-center">
                <motion.div
                  className="text-6xl mb-4 inline-block"
                  animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  🚨
                </motion.div>
                <h3 className="text-xl font-black mb-3 text-white">اتهام بالغش</h3>
                <p className="text-sm mb-2" style={{ color: C.textDim }}>
                  الراوي <span style={{ color: C.amber }}>{state.currentDescriberName}</span>
                </p>
                <p className="text-sm mb-6" style={{ color: C.textDim }}>
                  استخدم كلمة من الممنوعات؟
                </p>

                <div className="p-3 rounded-xl mb-4"
                  style={{ background: `${C.red}10`, border: `1px solid ${C.red}40` }}>
                  <p className="text-xs" style={{ color: '#fca5a5' }}>
                    النتيجة: <strong>-1 نقطة</strong> لـ {TEAM_LABEL[state.currentTeam]}،
                    والدور يروح للفريق التاني فورًا.
                  </p>
                </div>

                <div className="flex gap-3">
                  <GlassButton variant="neutral" size="md" onClick={() => setShowConfirmCheat(false)} className="flex-1">
                    ✖ إلغاء
                  </GlassButton>
                  <GlassButton variant="red" size="md" onClick={() => { emit('tb_cheat'); setShowConfirmCheat(false); }} className="flex-1">
                    🚨 ثبّت الاتهام
                  </GlassButton>
                </div>
              </GlassCard>
            </motion.div>
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
    </div>
  );
}