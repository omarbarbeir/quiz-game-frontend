import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TEAM = {
  A: {
    gradient: 'from-cyan-400 via-blue-500 to-indigo-500',
    glowRgb: '34,211,238',
    solid: '#22d3ee',
  },
  B: {
    gradient: 'from-pink-400 via-fuchsia-500 to-purple-500',
    glowRgb: '236,72,153',
    solid: '#ec4899',
  },
};

// =====================================================
// 🔊 SOUND
// =====================================================
function useSoundEffects() {
  const soundsRef = useRef({});

  useEffect(() => {
    const files = {
      ready: '/sounds/ready.mp3',
      correct: '/sounds/correct.mp3',
      wrong: '/sounds/wrong.mp3',
      tick: '/sounds/tick.mp3',
      win: '/sounds/win.mp3',
    };
    Object.entries(files).forEach(([key, path]) => {
      try {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audio.volume = 0.5;
        soundsRef.current[key] = audio;
      } catch { /* ignore */ }
    });
  }, []);

  const play = useCallback((key) => {
    try {
      const audio = soundsRef.current[key];
      if (!audio) return;
      audio.currentTime = 0;
      const p = audio.play();
      if (p && p.catch) p.catch(() => {});
    } catch { /* ignore */ }
  }, []);

  const stop = useCallback((key) => {
    try {
      const audio = soundsRef.current[key];
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
    } catch { /* ignore */ }
  }, []);

  const stopAll = useCallback(() => {
    try {
      Object.values(soundsRef.current).forEach((audio) => {
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
      });
    } catch { /* ignore */ }
  }, []);

  return { play, stop, stopAll };
}

// =====================================================
// 🌌 BACKGROUND
// =====================================================
const BackgroundFX = ({ answeringTeam }) => {
  const tint = answeringTeam ? TEAM[answeringTeam] : null;
  return (
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
      <motion.div
        className="absolute top-1/3 left-1/2 w-[50vw] h-[50vw] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, #ec4899 0%, transparent 65%)' }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <AnimatePresence>
        {tint && (
          <motion.div
            key={answeringTeam}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              background: `radial-gradient(circle at center, rgba(${tint.glowRgb},0.10), transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 80%)',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050510_95%)]" />
    </div>
  );
};

// =====================================================
// 💎 GLASS BUTTON
// =====================================================
const GlassButton = ({
  children, onClick, disabled = false, variant = 'primary', size = 'md', className = '',
}) => {
  const variants = {
    primary: { c1: '#22d3ee', c2: '#a855f7', glow: '34,211,238' },
    danger: { c1: '#ef4444', c2: '#ec4899', glow: '239,68,68' },
    success: { c1: '#10b981', c2: '#22d3ee', glow: '16,185,129' },
    amber: { c1: '#fbbf24', c2: '#f97316', glow: '251,191,36' },
    neutral: { c1: '#64748b', c2: '#94a3b8', glow: '148,163,184' },
  };
  const v = variants[variant] || variants.primary;
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

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
          style={{
            background: `conic-gradient(from 0deg, transparent 0%, ${v.c1} 15%, ${v.c2} 30%, transparent 45%, transparent 100%)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        <span className="absolute inset-[1.5px] rounded-2xl bg-[#0a0a1a]" />
      </span>
      <span className={`relative block rounded-2xl ${sizes[size]} font-bold text-white backdrop-blur-xl bg-white/[0.04] group-hover:bg-white/[0.08] transition-colors duration-300`}>
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        {children}
      </span>
    </motion.button>
  );
};

// =====================================================
// 🪟 GLASS CARD
// =====================================================
const GlassCard = ({ children, className = '', accent = null }) => (
  <div className={`relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl overflow-hidden ${className}`}>
    {accent && (
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${accent}, transparent 70%)` }} />
    )}
    <span className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/[0.06] via-transparent to-transparent" />
    <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    <div className="relative">{children}</div>
  </div>
);

// =====================================================
// ⏱️ COUNTDOWN RING
// =====================================================
const CountdownRing = ({ value, total, size = 140, color = '#22d3ee', label }) => {
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? Math.max(0, Math.min(1, value / total)) : 0;
  const dashoffset = circumference * (1 - progress);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={radius} stroke={color} strokeWidth="4" fill="none"
          strokeDasharray={circumference} strokeDashoffset={dashoffset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s linear', filter: `drop-shadow(0 0 10px ${color})` }} />
      </svg>
      <div className="relative z-10 text-center">
        <motion.div key={value} initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }} className="text-4xl font-black tabular-nums" style={{ color }}>
          {value}
        </motion.div>
        {label && <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">{label}</div>}
      </div>
    </div>
  );
};

// =====================================================
// 🎊 CONFETTI
// =====================================================
const Confetti = () => {
  const colors = ['#22d3ee', '#a855f7', '#ec4899', '#fbbf24', '#10b981'];
  const pieces = Array.from({ length: 80 });
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-20">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 1.5;
        const duration = 3 + Math.random() * 2.5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 6 + Math.random() * 8;
        return (
          <motion.div key={i} className="absolute rounded-sm"
            style={{ left: `${left}%`, top: '-5%', width: size, height: size * 1.8, background: color }}
            initial={{ y: 0, rotate: 0, opacity: 1 }}
            animate={{ y: '110vh', rotate: 900 + Math.random() * 720, opacity: [1, 1, 1, 0] }}
            transition={{ duration, delay, ease: 'easeIn', repeat: Infinity, repeatDelay: Math.random() * 2 }} />
        );
      })}
    </div>
  );
};

// =====================================================
// ⏱️ COUNTDOWN HOOK
// =====================================================
function useCountdown(phaseStartedAt, durationMs, active) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!active || !phaseStartedAt || !durationMs) { setRemaining(0); return; }
    const tick = () => {
      const left = Math.max(0, Math.ceil((durationMs - (Date.now() - phaseStartedAt)) / 1000));
      setRemaining(left);
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [phaseStartedAt, durationMs, active]);
  return remaining;
}

// =====================================================
// 🎬 PHASE TRANSITION
// =====================================================
const phaseVariants = {
  initial: { opacity: 0, y: 30, scale: 0.96, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -30, scale: 0.96, filter: 'blur(8px)' },
};
const PhaseWrapper = ({ children, phaseKey }) => (
  <motion.div key={phaseKey} variants={phaseVariants} initial="initial" animate="animate" exit="exit"
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
    {children}
  </motion.div>
);

// =====================================================
// 🎮 MAIN
// =====================================================
export default function GuessOpponent({
  socket, roomCode, playerId, playerName, isAdmin = false, players = [], onExit,
}) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [localSubmitted, setLocalSubmitted] = useState(false);
  const [teamNameInput, setTeamNameInput] = useState('');

  const { play: playSound, stop: stopSound, stopAll: stopAllSounds } = useSoundEffects();
  const prevPhaseRef = useRef(null);
  const tickRef = useRef({ question: null, reveal: null });

  // ✅ نحتفظ بآخر اسم تم مزامنته للفريق عشان ما نـ resetش الـ input أثناء الكتابة
  const lastSyncedTeamNameRef = useRef('');
  // ✅ نحتفظ بحالة "القائد بيكتب دلوقتي"
  const isEditingTeamNameRef = useRef(false);

  useEffect(() => {
    if (!socket) return;
    const onState = (st) => setState(st);
    const onError = ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    };

    socket.on('guess_state', onState);
    socket.on('guess_error', onError);

    socket.emit('guess_join', { roomCode, playerId, playerName, isAdmin });

    return () => {
      socket.off('guess_state', onState);
      socket.off('guess_error', onError);
      socket.emit('guess_leave', { roomCode });
    };
    // eslint-disable-next-line
  }, [socket, roomCode, playerId, playerName, isAdmin]);

  useEffect(() => {
    if (!isAdmin || !socket) return;
    socket.emit('guess_sync_players', {
      roomCode,
      players: players.map((p) => ({ id: p.id, name: p.name })),
    });
  }, [players, isAdmin, socket, roomCode]);

  useEffect(() => {
    if (state?.phase === 'question') {
      setAnswerText('');
      setLocalSubmitted(false);
    }
  }, [state?.phase, state?.currentQuestion?.id, state?.roundNumber]);

  // ✅ مزامنة اسم الفريق للقائد — بس لما الاسم يتغير فعلاً ومش بيكتب دلوقتي
  useEffect(() => {
    if (!state || !state.me?.isCaptain) return;
    const myTeamKey = state.me.team;
    if (!myTeamKey) return;

    const serverName = state.teams[myTeamKey]?.name || '';
    if (!serverName) return;

    // لو الاسم اللي جاي من السيرفر مختلف عن آخر واحد زامنّاه
    // ولو مش بيكتب دلوقتي، نحدّث الـ input
    if (serverName !== lastSyncedTeamNameRef.current) {
      lastSyncedTeamNameRef.current = serverName;
      if (!isEditingTeamNameRef.current) {
        setTeamNameInput(serverName);
      }
    }
  }, [state]);

  const emit = useCallback((ev, payload) => {
    socket?.emit(ev, { roomCode, ...payload });
  }, [socket, roomCode]);

  const questionLeft = useCountdown(state?.phaseStartedAt, state?.phaseDurations?.question, state?.phase === 'question');
  const revealLeft = useCountdown(state?.phaseStartedAt, state?.phaseDurations?.reveal, state?.phase === 'reveal');

  useEffect(() => {
    if (!state) return;
    const prev = prevPhaseRef.current;
    const cur = state.phase;
    if (prev === cur) return;

    stopAllSounds();

    if (cur === 'ready') playSound('ready');
    else if (cur === 'gameover') playSound('win');
    prevPhaseRef.current = cur;
  }, [state?.phase, playSound, stopAllSounds, state]);

  useEffect(() => {
    if (!state) return;
    const checkTick = (phase, left) => {
      if (left <= 3 && left > 0 && tickRef.current[phase] !== left) {
        tickRef.current[phase] = left;
        playSound('tick');
      }
      if (left > 3) tickRef.current[phase] = null;
      if (left === 0 && tickRef.current[phase] !== 0) {
        tickRef.current[phase] = 0;
        stopSound('tick');
      }
    };
    if (state.phase === 'question') checkTick('question', questionLeft);
    else if (state.phase === 'reveal') checkTick('reveal', revealLeft);
  }, [state?.phase, questionLeft, revealLeft, playSound, stopSound, state]);

  if (!state) {
    return (
      <div dir="rtl" className="relative min-h-screen bg-[#050510] text-white flex items-center justify-center">
        <BackgroundFX answeringTeam={null} />
        <div className="relative z-10 text-center">
          <motion.div className="w-16 h-16 rounded-full mx-auto mb-4"
            style={{ border: '3px solid transparent', borderTopColor: '#22d3ee', borderRightColor: '#a855f7' }}
            animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
          <p className="text-slate-400 tracking-wider">جاري تجهيز الساحة...</p>
        </div>
      </div>
    );
  }

  const { phase, me } = state;
  const myTeam = me?.team;
  const answeringTeam = state.answeringTeam;
  const amAnswering = myTeam && myTeam === answeringTeam;
  const amGuessing = myTeam && myTeam !== answeringTeam;

  // ============ HUD ============
  const renderHUD = () => (
    <div className="relative z-10 max-w-6xl mx-auto px-4 pt-4">
      <GlassCard className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <button onClick={onExit} className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition">
            <span>←</span><span>خروج</span>
          </button>
          <div className="flex items-center gap-3 sm:gap-6 flex-1 justify-center">
            {['A', 'B'].map((teamKey, idx) => {
              const t = state.teams[teamKey];
              const isAnswering = answeringTeam === teamKey;
              const theme = TEAM[teamKey];
              return (
                <React.Fragment key={teamKey}>
                  {idx === 1 && <span className="text-slate-600 text-xl">—</span>}
                  <motion.div className="relative text-center px-3 sm:px-5 py-2 rounded-2xl"
                    animate={isAnswering ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                    transition={{ duration: 1.6, repeat: isAnswering ? Infinity : 0 }}>
                    {isAnswering && (
                      <motion.span className="absolute inset-0 rounded-2xl"
                        style={{
                          background: `linear-gradient(135deg, rgba(${theme.glowRgb},0.25), transparent)`,
                          boxShadow: `0 0 30px -8px rgba(${theme.glowRgb},0.9)`,
                        }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                    )}
                    <div className="relative">
                      <p className={`text-[10px] uppercase tracking-widest ${isAnswering ? 'text-white' : 'text-slate-500'}`}>
                        {t.name}
                      </p>
                      <motion.p key={t.score} initial={{ scale: 1.5, color: theme.solid }} animate={{ scale: 1, color: 'white' }}
                        transition={{ duration: 0.4 }} className="text-2xl sm:text-3xl font-black tabular-nums">
                        {t.score}
                      </motion.p>
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })}
          </div>
          <div className="flex flex-col items-end gap-1">
            {me?.isAdmin && (
              <span
                className="text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(168,85,247,0.2)',
                  border: '1px solid rgba(168,85,247,0.6)',
                  color: '#a855f7',
                }}
              >
                🎩 أدمن
              </span>
            )}
            <span className="text-[9px] text-slate-500 uppercase tracking-widest">
              {state.roundNumber > 0 ? `دور ${state.roundNumber}` : 'Room'}
            </span>
            <span className="text-xs font-mono text-cyan-400">{roomCode}</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );

  // ============ ADMIN LOBBY ============
  const renderAdminLobby = () => {
    const allPlayers = state.allPlayers || [];
    const onlinePlayers = allPlayers.filter((p) => p.isOnline);
    const unassignedOnline = onlinePlayers.filter((p) => !p.team);
    const allAssigned = unassignedOnline.length === 0;
    const captainsSelected = !!(state.teams.A.captainId && state.teams.B.captainId);
    const bothTeamsHavePlayers = state.teams.A.players.length > 0 && state.teams.B.players.length > 0;
    const canStart = captainsSelected && bothTeamsHavePlayers && allAssigned;

    const renderTeamPicker = (teamKey) => {
      const t = state.teams[teamKey];
      const otherTeamKey = teamKey === 'A' ? 'B' : 'A';
      const otherCaptain = state.teams[otherTeamKey].captainId;
      const theme = TEAM[teamKey];
      return (
        <GlassCard className="p-5" accent={theme.solid}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div className={`w-3 h-3 rounded-full bg-gradient-to-br ${theme.gradient}`}
                style={{ boxShadow: `0 0 12px ${theme.solid}` }}
                animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
              <h3 className="text-xl font-black">{t.name}</h3>
            </div>
            <span className="text-xs text-slate-400 px-2 py-1 rounded-full bg-white/5">
              {t.players.length} لاعب
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">القائد</p>
          <select className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm mb-4 outline-none focus:border-cyan-400/60 transition"
            value={t.captainId || ''}
            onChange={(e) => {
              const newCapA = teamKey === 'A' ? e.target.value : (state.teams.A.captainId || '');
              const newCapB = teamKey === 'B' ? e.target.value : (state.teams.B.captainId || '');
              emit('guess_select_captains', { captainA: newCapA, captainB: newCapB });
            }}>
            <option value="" className="bg-[#0a0a1a]">— اختر —</option>
            {allPlayers.filter((p) => p.id !== otherCaptain).map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0a0a1a]">
                {p.name} {p.isOnline ? '' : '(غير متصل)'}
              </option>
            ))}
          </select>
          <div className="space-y-1.5">
            {t.players.length === 0 && <p className="text-xs text-slate-600 italic">لا يوجد لاعبون بعد...</p>}
            <AnimatePresence>
              {t.players.map((p) => (
                <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 text-sm py-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.solid, boxShadow: `0 0 8px ${theme.solid}` }} />
                  <span>{p.name}</span>
                  {p.id === t.captainId && <span className="text-amber-400 text-xs">👑</span>}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </GlassCard>
      );
    };

    // ✅ معلومات الأدمن كلاعب
    const myTeamKey = me?.team;
    const myTeamName = myTeamKey ? state.teams[myTeamKey]?.name : null;
    const amCaptain = me?.isCaptain;

    return (
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* ✅ لوحة الأدمن نفسه كلاعب */}
        <GlassCard className="p-4 mb-4" accent="#a855f7">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[11px] font-black px-2 py-1 rounded-lg"
                style={{
                  background: 'rgba(168,85,247,0.2)',
                  border: '1px solid rgba(168,85,247,0.6)',
                  color: '#a855f7',
                }}
              >
                🎩 أنت الأدمن
              </span>
              <span className="text-xs text-slate-400">
                {myTeamKey
                  ? amCaptain
                    ? `قائد ${myTeamName} ⭐`
                    : `في ${myTeamName}`
                  : 'اختر فريقك للعب معاهم:'}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {!myTeamKey ? (
                <>
                  <GlassButton
                    size="sm"
                    variant="primary"
                    onClick={() => emit('guess_join_team', { team: 'A' })}
                  >
                    انضم لـ {state.teams.A.name}
                  </GlassButton>
                  <GlassButton
                    size="sm"
                    variant="danger"
                    onClick={() => emit('guess_join_team', { team: 'B' })}
                  >
                    انضم لـ {state.teams.B.name}
                  </GlassButton>
                </>
              ) : (
                !amCaptain && (
                  <GlassButton
                    size="sm"
                    variant="neutral"
                    onClick={() => emit('guess_leave_team', {})}
                  >
                    اخرج من الفريق
                  </GlassButton>
                )
              )}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 mb-6 text-center">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-5xl mb-2">
            🎭
          </motion.div>
          <h2 className="text-3xl font-black mb-1">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              خمّن جوابي
            </span>
          </h2>
          <p className="text-slate-400 text-sm">لوحة المُيسّر — اختر القادة ثم ابدأ المعركة</p>
        </GlassCard>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {renderTeamPicker('A')}
          {renderTeamPicker('B')}
        </div>

        <GlassCard className="p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">كل اللاعبين</h3>
            <span className="text-xs text-slate-500">{allPlayers.length}</span>
          </div>
          {allPlayers.length === 0 && (
            <p className="text-slate-600 text-sm italic text-center py-4">في انتظار انضمام اللاعبين...</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <AnimatePresence>
              {allPlayers.map((p) => {
                const t = p.team;
                const theme = t ? TEAM[t] : null;
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}
                    className="relative rounded-xl p-2.5 text-sm border overflow-hidden"
                    style={{
                      borderColor: theme ? `rgba(${theme.glowRgb},0.5)` : 'rgba(255,255,255,0.1)',
                      background: theme ? `rgba(${theme.glowRgb},0.08)` : 'rgba(255,255,255,0.02)',
                    }}>
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate flex items-center gap-1">
                        {p.isAdmin && <span title="أدمن">🎩</span>}
                        {p.name}
                      </span>
                      <span className="flex items-center gap-1 shrink-0 text-xs">
                        {p.isCaptain && <span>👑</span>}
                        {p.team && !p.isCaptain && <span style={{ color: theme?.solid }}>{p.team}</span>}
                        {!p.isOnline && <span className="text-slate-600">⚪</span>}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </GlassCard>

        <AnimatePresence>
          {captainsSelected && !allAssigned && onlinePlayers.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4">
              <GlassCard className="p-4" accent="#fbbf24">
                <div className="flex items-start gap-3">
                  <motion.span className="text-2xl shrink-0"
                    animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                    ⏳
                  </motion.span>
                  <div className="flex-1">
                    <p className="text-amber-300 font-bold text-sm mb-2">
                      في {unassignedOnline.length} لاعب لسه ما انضمش لفريق
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {unassignedOnline.map((p) => (
                        <span key={p.id} className="text-xs px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-200">
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <GlassButton variant={canStart ? 'success' : 'neutral'} size="lg" disabled={!canStart}
          onClick={() => emit('guess_start_game', {})} className="w-full">
          {!captainsSelected
            ? '👑 حدد قائدين أولاً'
            : !bothTeamsHavePlayers
            ? '👥 لازم كل فريق فيه لاعب'
            : !allAssigned
            ? `⏳ في ${unassignedOnline.length} لاعب لسه ما انضم`
            : '🎭 ابدأ المعركة'}
        </GlassButton>
      </div>
    );
  };

  // ============ PLAYER LOBBY ============
  const renderPlayerLobby = () => {
    const captainsSelected = !!(state.teams.A.captainId && state.teams.B.captainId);

    const renderTeam = (teamKey) => {
      const t = state.teams[teamKey];
      const isMyTeam = myTeam === teamKey;
      const iAmCaptain = me.isCaptain && isMyTeam;
      const theme = TEAM[teamKey];

      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: teamKey === 'A' ? 0.1 : 0.2 }}>
          <GlassCard className="p-5" accent={isMyTeam ? theme.solid : null}>
            {isMyTeam && (
              <motion.span className="absolute inset-0 rounded-3xl pointer-events-none"
                style={{ boxShadow: `inset 0 0 40px rgba(${theme.glowRgb},0.25)` }}
                animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.5, repeat: Infinity }} />
            )}
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${theme.gradient}`}
                    style={{ boxShadow: `0 0 10px ${theme.solid}` }} />
                  <h3 className="text-xl font-black">{t.name}</h3>
                </div>
                <span className="text-xs text-slate-400">{t.players.length} لاعب</span>
              </div>
              {/* ✅ اسم الفريق: قابل للتعديل لو أنا القائد */}
              {iAmCaptain ? (
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
                    ✏️ اسم فريقك (اكتب واضغط Enter)
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      value={teamNameInput}
                      onChange={(e) => {
                        isEditingTeamNameRef.current = true;
                        setTeamNameInput(e.target.value);
                      }}
                      onFocus={() => {
                        isEditingTeamNameRef.current = true;
                      }}
                      onBlur={() => {
                        isEditingTeamNameRef.current = false;
                        const clean = teamNameInput.trim();
                        if (clean && clean !== t.name) {
                          emit('guess_set_team_name', { name: clean });
                        } else if (!clean) {
                          setTeamNameInput(t.name);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.target.blur();
                        }
                      }}
                      maxLength={30}
                      placeholder="اسم الفريق"
                      className="w-full bg-white/5 border rounded-xl p-3 text-base font-bold outline-none transition"
                      style={{
                        borderColor: `rgba(${theme.glowRgb},0.4)`,
                        color: theme.solid,
                      }}
                    />
                    <span className="absolute bottom-1.5 left-3 text-[9px] text-slate-600">
                      {teamNameInput.length}/30
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
                    القائد
                  </p>
                  <p className="font-semibold" style={{ color: theme.solid }}>
                    {t.captainName || '— لم يتم اختياره —'}
                  </p>
                </div>
              )}
              <div className="space-y-1.5 mb-4 min-h-[40px]">
                {t.players.length === 0 && <p className="text-xs text-slate-600 italic">لا يوجد لاعبون</p>}
                {t.players.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <span>{p.name}</span>
                    {p.id === t.captainId && <span className="text-amber-400 text-xs">👑</span>}
                  </div>
                ))}
              </div>
              {!me.isCaptain && (
                <div className="mt-2">
                  {!captainsSelected ? (
                    <motion.div className="w-full rounded-2xl px-4 py-2 text-center text-xs font-bold text-slate-400 border border-slate-700 bg-slate-800/40"
                      animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                      🔒 في انتظار المُيسّر يختار القادة
                    </motion.div>
                  ) : isMyTeam ? (
                    <GlassButton variant="danger" size="sm" onClick={() => emit('guess_leave_team', {})} className="w-full">
                      اخرج من الفريق
                    </GlassButton>
                  ) : (
                    <GlassButton variant="primary" size="sm" onClick={() => emit('guess_join_team', { team: teamKey })} className="w-full">
                      انضم لـ {t.name}
                    </GlassButton>
                  )}
                </div>
              )}
              {iAmCaptain && (
                <motion.p className="text-xs text-center mt-2" style={{ color: theme.solid }}
                  animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}>
                  ⭐ أنت قائد هذا الفريق
                </motion.p>
              )}
            </div>
          </GlassCard>
        </motion.div>
      );
    };

    const allPlayers = state.allPlayers || [];
    const onlinePlayers = allPlayers.filter((p) => p.isOnline);
    const unassignedOnline = onlinePlayers.filter((p) => !p.team);
    const ready = captainsSelected && state.teams.A.players.length > 0 && state.teams.B.players.length > 0 && unassignedOnline.length === 0;

    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <GlassCard className="p-6 mb-6 text-center">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-5xl mb-2">
            🎭
          </motion.div>
          <h2 className="text-3xl font-black mb-1">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              خمّن جوابي
            </span>
          </h2>
          <p className="text-slate-400 text-sm">
            انضم لفريقك. الغرفة <span className="font-mono text-cyan-400">{roomCode}</span>
          </p>
        </GlassCard>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {renderTeam('A')}
          {renderTeam('B')}
        </div>
        <div className="text-center">
          {ready ? (
            <motion.p className="text-cyan-300 text-sm inline-flex items-center gap-2"
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              في انتظار المُيسّر يبدأ المعركة...
            </motion.p>
          ) : !captainsSelected ? (
            <p className="text-slate-500 text-sm">في انتظار المُيسّر يختار القادة...</p>
          ) : unassignedOnline.length > 0 ? (
            <p className="text-amber-300 text-sm">⏳ {unassignedOnline.length} لاعب لسه ما انضمش لفريق</p>
          ) : (
            <p className="text-slate-500 text-sm">في انتظار المُيسّر يبدأ المعركة...</p>
          )}
        </div>
      </div>
    );
  };

  // ============ READY ============
  const renderReady = () => {
    const theme = TEAM[answeringTeam] || TEAM.A;
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <motion.div initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
          <motion.div className="text-8xl mb-6 inline-block"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 12, -12, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}>
            🎭
          </motion.div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500 mb-4">
            دور رقم {state.roundNumber}
          </p>
          <motion.h2 className="text-4xl sm:text-5xl font-black mb-4"
            style={{ color: theme.solid, textShadow: `0 0 40px ${theme.solid}` }}
            animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            {state.teams[answeringTeam]?.name} هيتسأل
          </motion.h2>
          <p className="text-slate-400">الفريق التاني بيحاول يخمن...</p>
        </motion.div>
      </div>
    );
  };

  // ============ QUESTION ============
  const renderQuestion = () => {
    const totalSeconds = Math.ceil((state.phaseDurations?.question || 0) / 1000);
    const theme = TEAM[answeringTeam] || TEAM.A;
    const myTheme = myTeam ? TEAM[myTeam] : TEAM.A;
    const progress = state.submissionProgress || { submitted: 0, total: 0 };

    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* الدور */}
        <motion.div className="text-center mb-5" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: `rgba(${theme.glowRgb},0.12)`,
              border: `1px solid rgba(${theme.glowRgb},0.4)`,
            }}>
            <span className="text-[10px] uppercase tracking-widest text-slate-300">
              دور
            </span>
            <span className="font-bold text-sm" style={{ color: theme.solid }}>
              {state.teams[answeringTeam]?.name}
            </span>
          </div>
        </motion.div>

        {/* السؤال */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}>
          <GlassCard className="p-8 sm:p-10 mb-6" accent={theme.solid}>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">السؤال</p>
            <h3 className="text-2xl sm:text-3xl font-bold leading-relaxed">
              {state.currentQuestion?.question}
            </h3>
          </GlassCard>
        </motion.div>

        {/* تعليمات حسب الفريق */}
        <motion.div className="text-center mb-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {amAnswering ? (
            <p className="text-amber-300 font-bold">✍️ دورك تجاوب — حاول تكتب حاجة الفريق التاني ميتوقعهاش</p>
          ) : amGuessing ? (
            <p className="text-purple-300 font-bold">🎯 دورك تخمن — حاول تكتب اللي الفريق التاني متوقع تكتبه</p>
          ) : (
            <p className="text-slate-500">في انتظار اللاعبين...</p>
          )}
        </motion.div>

        {/* Input */}
        {(amAnswering || amGuessing) && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <GlassCard className="p-6 mb-4" accent={myTheme.solid}>
              <AnimatePresence mode="wait">
                {!localSubmitted && !me.hasSubmitted ? (
                  <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="space-y-3">
                    <div className="relative">
                      <input type="text" value={answerText} onChange={(e) => setAnswerText(e.target.value)}
                        maxLength={120} placeholder="اكتب إجابتك..." autoFocus
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-lg focus:outline-none focus:border-cyan-400/60 transition placeholder:text-slate-600"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && answerText.trim()) {
                            emit('guess_submit_answer', { text: answerText.trim() });
                            setLocalSubmitted(true);
                          }
                        }} />
                      <span className="absolute bottom-2 left-3 text-[10px] text-slate-600">
                        {answerText.length}/120
                      </span>
                    </div>
                    <GlassButton variant="primary" size="md" disabled={!answerText.trim()}
                      onClick={() => {
                        emit('guess_submit_answer', { text: answerText.trim() });
                        setLocalSubmitted(true);
                      }} className="w-full">
                      إرسال الإجابة
                    </GlassButton>
                  </motion.div>
                ) : (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                    <motion.div className="text-5xl mb-3" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
                      ✅
                    </motion.div>
                    <p className="text-emerald-400 font-bold mb-1">تم إرسال إجابتك</p>
                    <p className="text-xs text-slate-500">
                      {amAnswering ? 'في انتظار باقي اللاعبين...' : 'الفريق التاني مش هيشوف إجابتك لحد ما الجولة تخلص'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        )}

        {/* Countdown + Progress */}
        <div className="flex flex-col items-center gap-4 mt-6">
          <CountdownRing value={questionLeft} total={totalSeconds} color={theme.solid} size={120} label="ثانية" />
          <GlassCard className="px-5 py-2">
            <p className="text-xs text-slate-400">
              تم إرسال <span className="text-cyan-400 font-bold text-base">{progress.submitted}</span>
              <span className="text-slate-600"> / {progress.total}</span> إجابات
            </p>
          </GlassCard>
        </div>
      </div>
    );
  };

  // ============ REVEAL ============
  const renderReveal = () => {
    const r = state.roundResults;
    if (!r) return null;
    const answerTheme = TEAM[r.answeringTeam] || TEAM.A;
    const guessTheme = TEAM[r.guessingTeam] || TEAM.B;
    const points = r.teamPointsThisRound;

    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div className="text-center mb-6" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
          <motion.div className="text-6xl mb-3 inline-block"
            animate={points > 0 ? { rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] } : { x: [0, -10, 10, -5, 5, 0] }}
            transition={{ duration: points > 0 ? 1 : 0.5 }}>
            {points > 0 ? '🎉' : '😬'}
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-black mb-2" style={{ color: answerTheme.solid, textShadow: `0 0 30px ${answerTheme.solid}` }}>
            فريق {state.teams[r.answeringTeam]?.name}
          </h2>
          <p className="text-slate-400 text-sm">
            خد <span className="text-emerald-400 font-bold text-lg">{points}</span> نقطة من {r.answeringPlayers.length}
          </p>
        </motion.div>

        {/* السؤال */}
        <GlassCard className="p-4 mb-5" accent={answerTheme.solid}>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">السؤال</p>
          <p className="text-base font-bold">{state.currentQuestion?.question}</p>
        </GlassCard>

        {/* الفريق المُجيب */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="w-2 h-2 rounded-full" style={{ background: answerTheme.solid, boxShadow: `0 0 10px ${answerTheme.solid}` }} />
            <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: answerTheme.solid }}>
              {state.teams[r.answeringTeam]?.name} — المجاوب
            </h3>
          </div>
          <div className="space-y-2">
            {r.answeringPlayers.map((p, i) => (
              <motion.div key={p.playerId} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12 }}>
                <div className="relative rounded-2xl p-4 border-2 overflow-hidden"
                  style={{
                    borderColor: p.gotPoint ? '#10b981' : '#ef4444',
                    background: p.gotPoint ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    boxShadow: p.gotPoint
                      ? '0 0 30px -10px rgba(16,185,129,0.7)'
                      : '0 0 30px -10px rgba(239,68,68,0.7)',
                  }}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400 mb-1">{p.name}</p>
                      <p className="text-base font-bold truncate">"{p.answer}"</p>

                      {/* ✅ الحالة 1: إجابة مكررة مع زميل */}
                      {!p.gotPoint && p.duplicatedBy && p.duplicatedBy.length > 0 && (
                        <p className="text-[11px] text-orange-300 mt-1">
                          🔁 إجابتك متكررة مع: {p.duplicatedBy.join('، ')} — محدش بياخد نقطة
                        </p>
                      )}

                      {/* ✅ الحالة 2: اتوقعها الخصم */}
                      {!p.gotPoint && p.trappedBy && p.trappedBy.length > 0 && (
                        <p className="text-[11px] text-red-300 mt-1">
                          🎯 اتوقعها: {p.trappedBy.join('، ')}
                        </p>
                      )}

                      {/* ✅ الحالة 3: محدش توقعها → نقطة */}
                      {p.gotPoint && (
                        <p className="text-[11px] text-emerald-300 mt-1">
                          ✅ إجابة فريدة ومحدش خمّنها
                        </p>
                      )}

                      {/* ✅ الحالة 4: ماجابش خالص */}
                      {!p.gotPoint &&
                        (!p.trappedBy || p.trappedBy.length === 0) &&
                        (!p.duplicatedBy || p.duplicatedBy.length === 0) && (
                          <p className="text-[11px] text-slate-500 mt-1">لم يجب</p>
                        )}
                    </div>
                    <div className="text-3xl shrink-0">
                      {p.gotPoint ? '✅' : '❌'}
                    </div>
                  </div>
                  {p.gotPoint && (
                    <motion.span className="absolute inset-0 pointer-events-none"
                      style={{ background: 'linear-gradient(120deg, transparent 30%, rgba(16,185,129,0.3) 50%, transparent 70%)' }}
                      animate={{ x: ['-100%', '200%'] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }} />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* الفريق اللي خمن */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="w-2 h-2 rounded-full" style={{ background: guessTheme.solid, boxShadow: `0 0 10px ${guessTheme.solid}` }} />
            <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: guessTheme.solid }}>
              {state.teams[r.guessingTeam]?.name} — المخمّن
            </h3>
          </div>
          <div className="space-y-2">
            {r.guessingPlayers.map((p, i) => {
              const hit = p.matchedNames.length > 0;
              return (
                <motion.div key={p.playerId} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}>
                  <div className="rounded-2xl p-4 border"
                    style={{
                      borderColor: hit ? `rgba(${guessTheme.glowRgb},0.6)` : 'rgba(255,255,255,0.08)',
                      background: hit ? `rgba(${guessTheme.glowRgb},0.08)` : 'rgba(255,255,255,0.02)',
                    }}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 mb-1">{p.name}</p>
                        <p className="text-base font-bold truncate">"{p.answer}"</p>
                        {hit && (
                          <p className="text-[11px] mt-1" style={{ color: guessTheme.solid }}>
                            🎯 وقع {p.matchedNames.join('، ')}
                          </p>
                        )}
                        {!hit && <p className="text-[11px] text-slate-500 mt-1">ماوقعش حد</p>}
                      </div>
                      <div className="text-2xl shrink-0">{hit ? '🎯' : '💨'}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Countdown */}
        <div className="flex justify-center">
          <CountdownRing value={revealLeft} total={Math.ceil((state.phaseDurations?.reveal || 0) / 1000)}
            color={answerTheme.solid} size={100} label="للدور التالي" />
        </div>
      </div>
    );
  };

  // ============ GAME OVER ============
  const renderGameOver = () => {
    const winner = state.winnerTeam;
    const theme = TEAM[winner] || TEAM.A;
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 relative">
        <Confetti />
        <motion.div initial={{ opacity: 0, scale: 0.5, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }} className="relative z-30 text-center">
          <motion.div className="text-8xl mb-4"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            🏆
          </motion.div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-3">الفائز</p>
          <motion.h2 className="text-5xl sm:text-6xl font-black mb-4"
            style={{ color: theme.solid, textShadow: `0 0 40px ${theme.solid}, 0 0 80px ${theme.solid}60` }}
            animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            {state.teams[winner]?.name}
          </motion.h2>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4 my-8 relative z-30">
          {['A', 'B'].map((teamKey) => {
            const t = state.teams[teamKey];
            const th = TEAM[teamKey];
            const isWinner = teamKey === winner;
            return (
              <GlassCard key={teamKey} className={`p-5 text-center ${isWinner ? '' : 'opacity-60'}`}
                accent={isWinner ? th.solid : null}>
                {isWinner && (
                  <motion.span className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{ boxShadow: `inset 0 0 60px rgba(${th.glowRgb},0.4)` }}
                    animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                )}
                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 relative">{t.name}</p>
                <motion.p className="text-5xl font-black tabular-nums relative"
                  style={{ color: isWinner ? th.solid : 'white' }}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}>
                  {t.score}
                </motion.p>
              </GlassCard>
            );
          })}
        </motion.div>
        {me.isAdmin && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="relative z-30">
            <GlassButton variant="success" size="lg" onClick={() => emit('guess_reset_game', {})} className="w-full">
              🔄 العب تاني
            </GlassButton>
          </motion.div>
        )}
      </div>
    );
  };

  // ============ MAIN ============
  return (
    <div dir="rtl" className="relative min-h-screen text-white overflow-hidden">
      <BackgroundFX answeringTeam={answeringTeam} />
      {renderHUD()}
      <div className="relative z-10 pt-6 pb-12">
        <AnimatePresence mode="wait">
          {phase === 'lobby' && (
            <PhaseWrapper phaseKey="lobby">
              {me.isAdmin ? renderAdminLobby() : renderPlayerLobby()}
            </PhaseWrapper>
          )}
          {phase === 'ready' && <PhaseWrapper phaseKey="ready">{renderReady()}</PhaseWrapper>}
          {phase === 'question' && <PhaseWrapper phaseKey="question">{renderQuestion()}</PhaseWrapper>}
          {phase === 'reveal' && <PhaseWrapper phaseKey="reveal">{renderReveal()}</PhaseWrapper>}
          {phase === 'gameover' && <PhaseWrapper phaseKey="gameover">{renderGameOver()}</PhaseWrapper>}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }} className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
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