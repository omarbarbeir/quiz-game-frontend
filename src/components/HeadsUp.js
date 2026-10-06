import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// =====================================================
// 🎨 Tokens
// =====================================================
const TEAM = {
  A: { gradient: 'from-cyan-400 via-blue-500 to-indigo-500', glowRgb: '34,211,238', solid: '#22d3ee' },
  B: { gradient: 'from-pink-400 via-fuchsia-500 to-purple-500', glowRgb: '236,72,153', solid: '#ec4899' },
};

const CORRECT_COLOR = '#10b981';
const PASS_COLOR = '#ef4444';

// =====================================================
// 🔊 Sounds
// =====================================================
function useSoundEffects() {
  const ref = useRef({});
  useEffect(() => {
    const files = {
      correct: '/sounds/correct.mp3',
      pass: '/sounds/wrong.mp3',
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
const BackgroundFX = ({ accent }) => {
  const tint = accent ? TEAM[accent] : null;
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
      <AnimatePresence>
        {tint && (
          <motion.div
            key={accent}
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050510_95%)]" />
    </div>
  );
};

// =====================================================
// 💎 Glass Components
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
  const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-base', lg: 'px-8 py-4 text-lg' };
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
// 📱 Landscape Lock
// =====================================================
const LandscapeLock = () => (
  <div
    className="headsup-landscape-lock"
    style={{
      display: 'none',
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#050510',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
    }}
  >
    <motion.div
      animate={{ rotate: [0, 90, 90, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      style={{ fontSize: 64 }}
    >📱</motion.div>
    <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, textAlign: 'center' }}>
      لف الموبايل عرضاً
    </div>
    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
      اللعبة تعمل بالعرض فقط
    </div>
  </div>
);

// =====================================================
// 📱 Gyro Permission Modal
// =====================================================
const GyroPermissionModal = ({ isIOS, onEnable }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    style={{ background: 'rgba(5,5,16,0.96)', backdropFilter: 'blur(20px)' }}
  >
    <motion.div
      initial={{ scale: 0.85, y: 30 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="max-w-md w-full rounded-3xl p-8 text-center"
      style={{
        background: 'linear-gradient(160deg, rgba(34,211,238,0.15), rgba(168,85,247,0.10))',
        border: '2px solid rgba(34,211,238,0.45)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(34,211,238,0.25)',
      }}
    >
      <motion.div
        animate={{ rotate: [-10, 10, -10], y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-7xl mb-5"
      >
        📱
      </motion.div>
      <h2 className="text-2xl font-black text-white mb-3">
        فعّل حساس الحركة
      </h2>
      <p className="text-slate-300 text-sm mb-6 leading-relaxed">
        {isIOS
          ? 'على الأيفون، اضغط الزر بالأسفل للسماح للمتصفح باستخدام الجيروسكوب. من دونه اللعبة لن تعمل.'
          : 'لازم تسمح للمتصفح باستخدام حساس الحركة حتى تعمل اللعبة. اضغط الزر بالأسفل للتفعيل.'}
      </p>
      <motion.button
        whileHover={{ scale: 1.04, y: -2 }}
        whileTap={{ scale: 0.96 }}
        onClick={onEnable}
        className="w-full py-4 rounded-2xl font-black text-base text-[#050510]"
        style={{
          background: 'linear-gradient(135deg, #fbbf24, #f97316)',
          boxShadow: '0 12px 36px rgba(251,191,36,0.5)',
        }}
      >
        📱 فعّل الآن
      </motion.button>
      <p className="text-slate-500 text-[11px] mt-4 tracking-wide">
        لن تبدأ اللعبة حتى تفعّل الحساس
      </p>
    </motion.div>
  </motion.div>
);

// =====================================================
// ⏱️ Countdown
// =====================================================
function useCountdown(startedAt, durationMs, active) {
  const [rem, setRem] = useState(0);
  useEffect(() => {
    if (!active || !startedAt || !durationMs) { setRem(0); return; }
    const t = () => {
      const left = Math.max(0, (durationMs - (Date.now() - startedAt)) / 1000);
      setRem(left);
    };
    t();
    const id = setInterval(t, 100);
    return () => clearInterval(id);
  }, [startedAt, durationMs, active]);
  return rem;
}

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
// 📱 Gyroscope Hook
// =====================================================
function useGyro(active, onCorrect, onPass) {
  const baseBetaRef = useRef(null);
  const lastTriggerRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    baseBetaRef.current = null;

    const handler = (e) => {
      const beta = e.beta;
      if (beta == null) return;

      if (baseBetaRef.current === null) {
        baseBetaRef.current = beta;
        return;
      }

      const delta = beta - baseBetaRef.current;

      if (Math.abs(delta) < 12) {
        baseBetaRef.current = beta;
        return;
      }

      const now = Date.now();
      if (now - lastTriggerRef.current < 700) return;

      if (delta > 35) {
        lastTriggerRef.current = now;
        baseBetaRef.current = beta;
        if (navigator.vibrate) navigator.vibrate(60);
        onCorrect();
      }
      else if (delta < -35) {
        lastTriggerRef.current = now;
        baseBetaRef.current = beta;
        if (navigator.vibrate) navigator.vibrate(60);
        onPass();
      }
    };

    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, [active, onCorrect, onPass]);
}

async function requestMotionPermission() {
  try {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      const res = await DeviceOrientationEvent.requestPermission();
      return res === 'granted';
    }
    return true;
  } catch {
    return false;
  }
}

// =====================================================
// 🎮 MAIN
// =====================================================
export default function HeadsUp({
  socket, roomCode, playerId, playerName, isAdmin = false, players = [], onExit,
}) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [flash, setFlash] = useState(null);
  const [teamNameInput, setTeamNameInput] = useState('');
  const lastSyncedTeamNameRef = useRef('');
  const isEditingTeamNameRef = useRef(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  const { play: playSound, stopAll: stopAllSounds } = useSoundEffects();

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    const ua = navigator.userAgent || '';
    const isIPad = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) || isIPad);
  }, []);

  // ===== Socket =====
  useEffect(() => {
    if (!socket) return;
    const onState = (s) => setState(s);
    const onError = ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    };
    socket.on('headsUp_state', onState);
    socket.on('headsUp_error', onError);

    socket.emit('headsUp_join', { roomCode, playerId, playerName, isAdmin });

    return () => {
      socket.off('headsUp_state', onState);
      socket.off('headsUp_error', onError);
      socket.emit('headsUp_leave', { roomCode });
    };
  }, [socket, roomCode, playerId, playerName, isAdmin]);

  useEffect(() => {
    if (!isAdmin || !socket) return;
    socket.emit('headsUp_seed_players', {
      roomCode,
      players: players.filter((p) => !p.isAdmin).map((p) => ({ id: p.id, name: p.name })),
    });
  }, [players, isAdmin, socket, roomCode]);

  // ===== team name sync =====
  useEffect(() => {
    if (!state || !state.me?.isCaptain) return;
    const key = state.me.team;
    if (!key) return;
    const name = state.teams[key]?.name || '';
    if (!name) return;
    if (name !== lastSyncedTeamNameRef.current) {
      lastSyncedTeamNameRef.current = name;
      if (!isEditingTeamNameRef.current) setTeamNameInput(name);
    }
  }, [state]);

  const emit = useCallback((ev, payload) => {
    socket?.emit(ev, { roomCode, ...payload });
  }, [socket, roomCode]);

  const playingTimeLeft = useCountdown(state?.phaseStartedAt, state?.turnDuration, state?.phase === 'playing');
  const readyTimeLeft = useCountdown(state?.phaseStartedAt, state?.readyDuration, state?.phase === 'ready');

  const tickRef = useRef(null);
  useEffect(() => {
    if (state?.phase !== 'playing') return;
    const sec = Math.ceil(playingTimeLeft);
    if (sec <= 5 && sec > 0 && tickRef.current !== sec) {
      tickRef.current = sec;
      playSound('tick');
    }
    if (sec > 5) tickRef.current = null;
  }, [state?.phase, playingTimeLeft, playSound]);

  const prevPhaseRef = useRef(null);
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

  const handleCorrect = useCallback(() => {
    if (!state || state.phase !== 'playing') return;
    if (!state.me?.isPhoneHolder) return;
    emit('headsUp_correct');
    playSound('correct');
    setFlash('correct');
    setTimeout(() => setFlash(null), 400);
  }, [state, emit, playSound]);

  const handlePass = useCallback(() => {
    if (!state || state.phase !== 'playing') return;
    if (!state.me?.isPhoneHolder) return;
    emit('headsUp_pass');
    playSound('pass');
    setFlash('pass');
    setTimeout(() => setFlash(null), 400);
  }, [state, emit, playSound]);

  const isPhoneHolderPlaying =
    state?.phase === 'playing' && state.me?.isPhoneHolder;

  useGyro(isPhoneHolderPlaying && motionEnabled && isTouchDevice, handleCorrect, handlePass);

  useEffect(() => {
    if (!isPhoneHolderPlaying) return;
    const handler = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); handleCorrect(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); handlePass(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isPhoneHolderPlaying, handleCorrect, handlePass]);

  const enableMotion = useCallback(async () => {
    const ok = await requestMotionPermission();
    setMotionEnabled(ok);
    if (!ok) {
      setError('لم يتم منح الإذن. اضغط زر التفعيل مرة أخرى.');
      setTimeout(() => setError(null), 4000);
    }
    return ok;
  }, []);

  if (!state) {
    return (
      <div dir="rtl" className="relative min-h-screen bg-[#050510] text-white flex items-center justify-center">
        <BackgroundFX />
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

  const renderHUD = () => (
    <div className="relative z-10 max-w-6xl mx-auto px-4 pt-4">
      <GlassCard className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onExit} className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition">
              <span>←</span><span>خروج</span>
            </button>
            {me.isAdmin && (
              <motion.button
                onClick={() => {
                  if (window.confirm('ترجع للشاشة الرئيسية؟')) {
                    onExit();
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative rounded-xl p-[1.5px] overflow-hidden"
              >
                <motion.span
                  className="absolute inset-[-150%]"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0%, #22d3ee 20%, #a855f7 40%, transparent 60%, transparent 100%)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                <span className="relative block rounded-xl px-3 py-1.5 bg-[#0a0a1a] text-xs font-bold flex items-center gap-1.5">
                  <span>🏠</span>
                  <span>الرئيسية</span>
                </span>
              </motion.button>
            )}
            {isTouchDevice && !motionEnabled && (
              <motion.button
                onClick={enableMotion}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative rounded-xl p-[1.5px] overflow-hidden"
              >
                <motion.span
                  className="absolute inset-[-150%]"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0%, #fbbf24 20%, #f97316 40%, transparent 60%, transparent 100%)',
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
                <span className="relative block rounded-xl px-3 py-1.5 bg-[#0a0a1a] text-xs font-bold flex items-center gap-1.5">
                  <span>📱</span>
                  <span>فعّل الحركة</span>
                </span>
              </motion.button>
            )}
          </div>
          <div className="flex items-center gap-3 sm:gap-6 flex-1 justify-center">
            {state.mode === 'team' ? (
              <>
                {['A', 'B'].map((key, idx) => {
                  const t = state.teams[key];
                  const isAnswering = state.currentTurnTeam === key;
                  const th = TEAM[key];
                  return (
                    <React.Fragment key={key}>
                      {idx === 1 && <span className="text-slate-600 text-xl">—</span>}
                      <motion.div className="relative text-center px-3 sm:px-5 py-2 rounded-2xl"
                        animate={isAnswering ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                        transition={{ duration: 1.6, repeat: isAnswering ? Infinity : 0 }}>
                        {isAnswering && (
                          <motion.span className="absolute inset-0 rounded-2xl"
                            style={{
                              background: `linear-gradient(135deg, rgba(${th.glowRgb},0.25), transparent)`,
                              boxShadow: `0 0 30px -8px rgba(${th.glowRgb},0.9)`,
                            }}
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
                        )}
                        <div className="relative">
                          <p className={`text-[10px] uppercase tracking-widest ${isAnswering ? 'text-white' : 'text-slate-500'}`}>
                            {t.name}
                          </p>
                          <motion.p key={t.score} initial={{ scale: 1.5, color: th.solid }}
                            animate={{ scale: 1, color: 'white' }} transition={{ duration: 0.4 }}
                            className="text-2xl sm:text-3xl font-black tabular-nums">
                            {t.score}
                          </motion.p>
                        </div>
                      </motion.div>
                    </React.Fragment>
                  );
                })}
              </>
            ) : (
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">وضع فردي</p>
                <p className="text-sm font-bold text-cyan-400">كل واحد يحاول يجيب أعلى سكور</p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {me.isAdmin && (
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
              {state.roundNumber > 0 ? `جولة ${state.roundNumber}` : 'Room'}
            </span>
            <span className="text-xs font-mono text-cyan-400">{roomCode}</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );

  const renderAdminLobby = () => {
    const allPlayers = state.allPlayers || [];
    const onlinePlayers = allPlayers.filter((p) => p.isOnline);
    const unassignedOnline = onlinePlayers.filter((p) => !p.team);
    const captainsSelected = !!(state.teams.A.captainId && state.teams.B.captainId);
    const bothTeamsHavePlayers = state.teams.A.players.length > 0 && state.teams.B.players.length > 0;

    const canStart = !!(
      state.mode &&
      state.categoryId &&
      (state.mode === 'solo'
        ? onlinePlayers.length > 0
        : captainsSelected && bothTeamsHavePlayers && unassignedOnline.length === 0)
    );

    const myTeamKey = me?.team;
    const myTeamName = myTeamKey ? state.teams[myTeamKey]?.name : null;
    const amCaptain = me?.isCaptain;

    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

        <GlassCard className="p-4" accent="#a855f7">
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
                  : state.mode === 'team'
                  ? 'اختر فريقك للعب معاهم:'
                  : state.mode === 'solo'
                  ? 'هتلعب معاهم في وضع فردي'
                  : 'اختر المود أولاً'}
              </span>
            </div>
            {state.mode === 'team' && (
              <div className="flex gap-2 flex-wrap">
                {!myTeamKey ? (
                  <>
                    <GlassButton
                      size="sm"
                      variant="primary"
                      onClick={() => emit('headsUp_join_team', { team: 'A' })}
                    >
                      انضم لـ {state.teams.A.name}
                    </GlassButton>
                    <GlassButton
                      size="sm"
                      variant="danger"
                      onClick={() => emit('headsUp_join_team', { team: 'B' })}
                    >
                      انضم لـ {state.teams.B.name}
                    </GlassButton>
                  </>
                ) : (
                  !amCaptain && (
                    <GlassButton
                      size="sm"
                      variant="neutral"
                      onClick={() => emit('headsUp_leave_team', {})}
                    >
                      اخرج من الفريق
                    </GlassButton>
                  )
                )}
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6 text-center">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-5xl mb-2">
            🎯
          </motion.div>
          <h2 className="text-3xl font-black mb-1">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              البس على راسك
            </span>
          </h2>
          <p className="text-slate-400 text-sm">لوحة المُيسّر — اختر المود والفئة ثم ابدأ</p>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300 mb-3">المود</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'solo', name: 'فردي', icon: '👤', desc: 'كل واحد يحاول يجيب أعلى سكور' },
              { id: 'team', name: 'جماعي', icon: '👥', desc: 'فريقين بيتنافسوا' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => emit('headsUp_select_mode', { mode: m.id })}
                className={`relative rounded-2xl p-4 text-right transition ${
                  state.mode === m.id
                    ? 'bg-cyan-500/15 border-2 border-cyan-400'
                    : 'bg-white/[0.03] border-2 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{m.icon}</span>
                  <span className="font-black text-lg">{m.name}</span>
                </div>
                <p className="text-xs text-slate-400">{m.desc}</p>
                {state.mode === m.id && (
                  <motion.span
                    className="absolute top-3 left-3 w-6 h-6 rounded-full bg-cyan-400 text-[#0a0a1a] flex items-center justify-center font-black text-sm"
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                  >
                    ✓
                  </motion.span>
                )}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300 mb-3">
            الفئة ({state.categoriesList?.length || 0})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {(state.categoriesList || []).map((c) => (
              <button
                key={c.id}
                onClick={() => emit('headsUp_select_category', { categoryId: c.id })}
                className={`rounded-2xl p-3 text-center transition ${
                  state.categoryId === c.id
                    ? 'bg-purple-500/20 border-2 border-purple-400'
                    : 'bg-white/[0.03] border-2 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="text-3xl mb-1">{c.icon}</div>
                <div className="font-black">{c.name}</div>
                <div className="text-[10px] text-slate-500">{c.wordCount} كلمة</div>
              </button>
            ))}
          </div>
        </GlassCard>

        {state.mode === 'team' && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              {['A', 'B'].map((key) => {
                const t = state.teams[key];
                const otherKey = key === 'A' ? 'B' : 'A';
                const otherCaptain = state.teams[otherKey].captainId;
                const th = TEAM[key];
                return (
                  <GlassCard key={key} className="p-5" accent={th.solid}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full bg-gradient-to-br ${th.gradient}`}
                          style={{ boxShadow: `0 0 12px ${th.solid}` }} />
                        <h3 className="text-lg font-black">{t.name}</h3>
                      </div>
                      <span className="text-xs text-slate-400">{t.players.length} لاعب</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">القائد</p>
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm mb-3 outline-none focus:border-cyan-400/60"
                      value={t.captainId || ''}
                      onChange={(e) => {
                        const capA = key === 'A' ? e.target.value : (state.teams.A.captainId || '');
                        const capB = key === 'B' ? e.target.value : (state.teams.B.captainId || '');
                        emit('headsUp_select_captains', { captainA: capA, captainB: capB });
                      }}
                    >
                      <option value="" className="bg-[#0a0a1a]">— اختر —</option>
                      {allPlayers.filter((p) => p.id !== otherCaptain).map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#0a0a1a]">
                          {p.name} {p.isOnline ? '' : '(غير متصل)'}
                        </option>
                      ))}
                    </select>
                    <div className="space-y-1">
                      {t.players.map((p) => {
                        const isPAdmin = allPlayers.find((ap) => ap.id === p.id)?.isAdmin;
                        return (
                          <div key={p.id} className="text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: th.solid }} />
                            {isPAdmin && <span>🎩</span>}
                            <span>{p.name}</span>
                            {p.id === t.captainId && <span className="text-amber-400 text-xs">👑</span>}
                          </div>
                        );
                      })}
                    </div>
                  </GlassCard>
                );
              })}
            </div>

            {captainsSelected && unassignedOnline.length > 0 && (
              <GlassCard className="p-4" accent="#fbbf24">
                <p className="text-amber-300 font-bold text-sm mb-2">
                  ⏳ في {unassignedOnline.length} لاعب لسه ما انضمش لفريق:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {unassignedOnline.map((p) => (
                    <span key={p.id} className="text-xs px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-200">
                      {p.name}
                    </span>
                  ))}
                </div>
              </GlassCard>
            )}
          </>
        )}

        <GlassButton
          variant={canStart ? 'success' : 'neutral'}
          size="lg"
          disabled={!canStart}
          onClick={() => emit('headsUp_start_game', {})}
          className="w-full"
        >
          {!state.mode
            ? '👆 اختر المود أولاً'
            : !state.categoryId
            ? '📚 اختر فئة الكلمات'
            : state.mode === 'solo'
            ? '🎯 ابدأ اللعبة'
            : !captainsSelected
            ? '👑 حدد القادة'
            : unassignedOnline.length > 0
            ? `⏳ في ${unassignedOnline.length} لاعب لسه ما انضم`
            : '🎯 ابدأ اللعبة'}
        </GlassButton>
      </div>
    );
  };

  const renderPlayerLobby = () => {
    const captainsSelected = !!(state.teams.A.captainId && state.teams.B.captainId);

    if (state.mode === 'solo') {
      return (
        <div className="max-w-2xl mx-auto px-4 py-6 text-center">
          <GlassCard className="p-8">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }} className="text-6xl mb-4">
              👤
            </motion.div>
            <h2 className="text-3xl font-black mb-3">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                البس على راسك
              </span>
            </h2>
            <p className="text-slate-400 mb-6">وضع فردي — هتلعبوا واحد واحد</p>
            <motion.p className="text-cyan-300 text-sm"
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
              في انتظار المُيسّر يبدأ...
            </motion.p>
          </GlassCard>
        </div>
      );
    }

    const renderTeam = (key) => {
      const t = state.teams[key];
      const isMyTeam = me.team === key;
      const iAmCaptain = me.isCaptain && isMyTeam;
      const th = TEAM[key];

      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: key === 'A' ? 0.1 : 0.2 }}>
          <GlassCard className="p-5" accent={isMyTeam ? th.solid : null}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-br ${th.gradient}`}
                  style={{ boxShadow: `0 0 10px ${th.solid}` }} />
                <h3 className="text-xl font-black">{t.name}</h3>
              </div>
              <span className="text-xs text-slate-400">{t.players.length} لاعب</span>
            </div>

            {iAmCaptain ? (
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">
                  ✏️ اسم فريقك
                </p>
                <input
                  type="text"
                  value={teamNameInput}
                  onChange={(e) => {
                    isEditingTeamNameRef.current = true;
                    setTeamNameInput(e.target.value);
                  }}
                  onFocus={() => { isEditingTeamNameRef.current = true; }}
                  onBlur={() => {
                    isEditingTeamNameRef.current = false;
                    const clean = teamNameInput.trim();
                    if (clean && clean !== t.name) {
                      emit('headsUp_set_team_name', { name: clean });
                    } else if (!clean) setTeamNameInput(t.name);
                  }}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
                  maxLength={30}
                  className="w-full bg-white/5 border rounded-xl p-3 text-base font-bold outline-none"
                  style={{ borderColor: `rgba(${th.glowRgb},0.4)`, color: th.solid }}
                />
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2">القائد</p>
                <p className="font-semibold" style={{ color: th.solid }}>
                  {t.captainName || '— لم يتم اختياره —'}
                </p>
              </div>
            )}

            <div className="space-y-1.5 mb-4 min-h-[40px]">
              {t.players.length === 0 && <p className="text-xs text-slate-600 italic">فاضي</p>}
              {t.players.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  <span>{p.name}</span>
                  {p.id === t.captainId && <span className="text-amber-400 text-xs">👑</span>}
                </div>
              ))}
            </div>

            {!me.isCaptain && (
              <div>
                {!captainsSelected ? (
                  <div className="w-full rounded-2xl px-4 py-2 text-center text-xs font-bold text-slate-400 border border-slate-700 bg-slate-800/40">
                    🔒 في انتظار المُيسّر
                  </div>
                ) : isMyTeam ? (
                  <GlassButton variant="danger" size="sm" onClick={() => emit('headsUp_leave_team', {})} className="w-full">
                    اخرج من الفريق
                  </GlassButton>
                ) : (
                  <GlassButton variant="primary" size="sm" onClick={() => emit('headsUp_join_team', { team: key })} className="w-full">
                    انضم لـ {t.name}
                  </GlassButton>
                )}
              </div>
            )}
          </GlassCard>
        </motion.div>
      );
    };

    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <GlassCard className="p-6 mb-6 text-center">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-5xl mb-2">
            🎯
          </motion.div>
          <h2 className="text-3xl font-black mb-1">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              البس على راسك
            </span>
          </h2>
          <p className="text-slate-400 text-sm">
            انضم لفريقك. الغرفة <span className="font-mono text-cyan-400">{roomCode}</span>
          </p>
        </GlassCard>
        <div className="grid md:grid-cols-2 gap-4">
          {renderTeam('A')}
          {renderTeam('B')}
        </div>
      </div>
    );
  };

  const renderReady = () => {
    const theme = state.currentTurnTeam ? TEAM[state.currentTurnTeam] : null;
    const color = theme?.solid || '#22d3ee';

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500 mb-4">
          {state.mode === 'solo' ? 'الدور على' : 'دور'}
        </p>
        <motion.h2
          className="text-5xl sm:text-6xl font-black mb-4"
          style={{ color, textShadow: `0 0 40px ${color}` }}
          initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          {state.currentTurnPlayerName}
        </motion.h2>
        {state.currentTurnTeam && (
          <p className="text-lg text-slate-400 mb-8">{state.teams[state.currentTurnTeam].name}</p>
        )}

        <motion.div
          key={Math.ceil(readyTimeLeft)}
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-8xl font-black inline-block mb-8"
          style={{ color: '#fbbf24' }}
        >
          {Math.ceil(readyTimeLeft) || 1}
        </motion.div>

        <p className="text-slate-300 mb-6">ضع الموبايل على جبهتك بالعرض</p>

        {me.isPhoneHolder && !motionEnabled && isTouchDevice && (
          <div className="mb-4">
            <GlassButton variant="amber" size="lg" onClick={enableMotion}>
              📱 فعّل حساس الحركة
            </GlassButton>
          </div>
        )}
        {me.isPhoneHolder && (motionEnabled || !isTouchDevice) && (
          <p className="text-emerald-400 text-sm">
            {isTouchDevice ? '✅ الحركة مفعّلة' : '⌨️ استخدم الأسهم ↑ / ↓'}
          </p>
        )}
      </div>
    );
  };

  const renderPlaying = () => {
    const isHolder = me.isPhoneHolder;
    const flashColor = flash === 'correct' ? CORRECT_COLOR : flash === 'pass' ? PASS_COLOR : null;

    if (isHolder) {
      return (
        <div className="fixed inset-0 z-20" style={{ background: '#050510' }}>
          <AnimatePresence>
            {flashColor && (
              <motion.div
                key={flash}
                className="absolute inset-0 z-10"
                style={{ background: flashColor }}
                initial={{ opacity: 0.85 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </AnimatePresence>

          <div className="absolute top-0 left-0 right-0 h-[18%] flex items-center justify-center z-5">
            <div className="text-red-400/40 font-black text-2xl tracking-widest flex items-center gap-2">
              <span>⬆</span><span>PASS</span>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-8 pointer-events-none">
            <AnimatePresence mode="wait">
              <motion.h1
                key={state.currentWord}
                className="text-center font-black text-white leading-none"
                style={{
                  fontSize: 'clamp(3rem, 14vw, 10rem)',
                  textShadow: '0 0 40px rgba(255,255,255,0.4)',
                  wordBreak: 'break-word',
                }}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.9 }}
                transition={{ duration: 0.25 }}
              >
                {state.currentWord}
              </motion.h1>
            </AnimatePresence>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[18%] flex items-center justify-center z-5">
            <div className="text-emerald-400/40 font-black text-2xl tracking-widest flex items-center gap-2">
              <span>صحيح</span><span>⬇</span>
            </div>
          </div>

          <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/10">
              <p className="text-[10px] text-slate-400 uppercase">النقاط</p>
              <p className="text-2xl font-black text-emerald-400 tabular-nums">{state.turnScore}</p>
            </div>
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/10">
              <p className="text-[10px] text-slate-400 uppercase">الوقت</p>
              <p className={`text-2xl font-black tabular-nums ${playingTimeLeft <= 5 ? 'text-red-400' : 'text-cyan-400'}`}>
                {Math.ceil(playingTimeLeft)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <GlassCard className="p-6 mb-6 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">الكلمة الحالية</p>
          <AnimatePresence mode="wait">
            <motion.h1
              key={state.currentWord}
              className="text-4xl sm:text-5xl font-black"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
            >
              {state.currentWord}
            </motion.h1>
          </AnimatePresence>
          <div className="mt-3 text-sm text-slate-400">
            اللاعب: <span className="font-bold text-white">{state.currentTurnPlayerName}</span>
          </div>
        </GlassCard>

        <div className="flex flex-col items-center gap-4">
          <CountdownRing
            value={playingTimeLeft}
            total={state.turnDuration / 1000}
            size={160}
            color={playingTimeLeft <= 5 ? '#ef4444' : (state.currentTurnTeam ? TEAM[state.currentTurnTeam].solid : '#22d3ee')}
            label="ثانية"
          />
          <GlassCard className="px-6 py-3">
            <p className="text-sm text-slate-400">
              النقاط في الدور ده: <span className="text-2xl font-black text-emerald-400 tabular-nums">{state.turnScore}</span>
            </p>
          </GlassCard>
        </div>
      </div>
    );
  };

  const renderTurnEnd = () => {
    const theme = state.currentTurnTeam ? TEAM[state.currentTurnTeam] : null;
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div className="text-center mb-6" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}>
          <motion.div className="text-7xl mb-4"
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}>
            ⏰
          </motion.div>
          <h2 className="text-3xl font-black mb-2" style={{ color: theme?.solid || '#22d3ee' }}>
            خلص وقت {state.currentTurnPlayerName}!
          </h2>
          <p className="text-slate-400">جاب في الدور ده</p>
          <motion.p
            className="text-6xl font-black text-emerald-400 my-4 tabular-nums"
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            {state.turnScore}
          </motion.p>
        </motion.div>

        {state.turnLog?.length > 0 && (
          <GlassCard className="p-4">
            <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">الكلمات</p>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {state.turnLog.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl"
                  style={{
                    background: t.result === 'correct' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                  }}
                >
                  <span className="text-sm">{t.word}</span>
                  <span className="text-lg">{t.result === 'correct' ? '✅' : '❌'}</span>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    );
  };

  const renderBetweenRounds = () => {
    if (me.isAdmin) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
          <GlassCard className="p-6 text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="text-6xl mb-3"
            >
              ✨
            </motion.div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500 mb-2">بين الجولات</p>
            <h2 className="text-3xl font-black mb-2">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                الجولة {state.roundNumber} خلصت
              </span>
            </h2>
            <p className="text-slate-400 text-sm">
              {state.mode === 'team'
                ? `الفريق أ: ${state.teams.A.score} — الفريق ب: ${state.teams.B.score}`
                : `عدد اللاعبين: ${state.allPlayers.length}`}
            </p>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300 mb-3">
              🎯 اختر فئة الجولة الجاية
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {(state.categoriesList || []).map((c) => (
                <button
                  key={c.id}
                  onClick={() => emit('headsUp_select_category', { categoryId: c.id })}
                  className={`rounded-2xl p-3 text-center transition ${
                    state.categoryId === c.id
                      ? 'bg-purple-500/20 border-2 border-purple-400'
                      : 'bg-white/[0.03] border-2 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="text-3xl mb-1">{c.icon}</div>
                  <div className="font-black">{c.name}</div>
                  <div className="text-[10px] text-slate-500">{c.wordCount} كلمة</div>
                </button>
              ))}
            </div>
          </GlassCard>

          {state.mode === 'team' && (
            <div className="grid grid-cols-2 gap-4">
              {['A', 'B'].map((key) => {
                const t = state.teams[key];
                const th = TEAM[key];
                return (
                  <GlassCard key={key} className="p-4 text-center" accent={th.solid}>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-1">{t.name}</p>
                    <p className="text-4xl font-black tabular-nums" style={{ color: th.solid }}>
                      {t.score}
                    </p>
                  </GlassCard>
                );
              })}
            </div>
          )}

          <GlassButton
            variant="success"
            size="lg"
            disabled={!state.categoryId}
            onClick={() => emit('headsUp_start_next_round', {})}
            className="w-full"
          >
            {state.categoryId
              ? `🚀 ابدأ الجولة ${state.roundNumber + 1}`
              : '👆 اختر الفئة أولاً'}
          </GlassButton>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <GlassCard className="p-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            ⏸️
          </motion.div>
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500 mb-2">بين الجولات</p>
          <h2 className="text-3xl font-black mb-3">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              الجولة {state.roundNumber} خلصت
            </span>
          </h2>

          {state.mode === 'team' && (
            <div className="flex justify-center items-center gap-6 my-6">
              <div>
                <p className="text-xs text-slate-500">{state.teams.A.name}</p>
                <p className="text-3xl font-black" style={{ color: TEAM.A.solid }}>
                  {state.teams.A.score}
                </p>
              </div>
              <span className="text-slate-600 text-2xl">—</span>
              <div>
                <p className="text-xs text-slate-500">{state.teams.B.name}</p>
                <p className="text-3xl font-black" style={{ color: TEAM.B.solid }}>
                  {state.teams.B.score}
                </p>
              </div>
            </div>
          )}

          <motion.p
            className="text-cyan-300 text-sm inline-flex items-center gap-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            في انتظار المُيسّر يختار الفئة الجاية...
          </motion.p>
        </GlassCard>
      </div>
    );
  };

  const renderGameOver = () => {
    const isTeam = state.mode === 'team';
    const winner = isTeam
      ? (state.winnerTeam ? state.teams[state.winnerTeam] : null)
      : state.allPlayers.find((p) => p.id === state.winnerPlayerId);

    const winnerColor = isTeam
      ? (state.winnerTeam ? TEAM[state.winnerTeam].solid : '#fbbf24')
      : '#fbbf24';

    const soloLeaderboard = !isTeam
      ? Object.entries(state.scores || {})
          .map(([pid, sc]) => ({
            id: pid,
            name: state.allPlayers.find((p) => p.id === pid)?.name || '???',
            score: sc,
          }))
          .sort((a, b) => b.score - a.score)
      : null;

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
          <motion.h2 className="text-5xl sm:text-6xl font-black mb-4"
            style={{ color: winnerColor, textShadow: `0 0 40px ${winnerColor}` }}
            animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            {isTeam ? (winner?.name || '???') : (winner?.name || '???')}
          </motion.h2>
        </motion.div>

        {isTeam ? (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }} className="grid grid-cols-2 gap-4 my-8 relative z-30">
            {['A', 'B'].map((key) => {
              const t = state.teams[key];
              const th = TEAM[key];
              const isWinner = key === state.winnerTeam;
              return (
                <GlassCard key={key} className={`p-5 text-center ${isWinner ? '' : 'opacity-60'}`} accent={isWinner ? th.solid : null}>
                  <p className="text-xs uppercase tracking-widest text-slate-500 mb-2">{t.name}</p>
                  <motion.p className="text-5xl font-black tabular-nums"
                    style={{ color: isWinner ? th.solid : 'white' }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}>
                    {t.score}
                  </motion.p>
                </GlassCard>
              );
            })}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }} className="my-8 relative z-30">
            <GlassCard className="p-5">
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-3">الترتيب النهائي</p>
              <div className="space-y-2">
                {soloLeaderboard?.map((p, i) => (
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
                      <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '#' + (i + 1)}</span>
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
        )}

        {me.isAdmin && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }} className="relative z-30">
            <GlassButton variant="success" size="lg" onClick={() => emit('headsUp_reset_game', {})} className="w-full">
              🔄 العب تاني
            </GlassButton>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <>
      <style>{`
        @media screen and (orientation: portrait) and (max-width: 1024px) {
          .headsup-landscape-lock { display: flex !important; }
          .headsup-game-root { display: none !important; }
        }
      `}</style>

      <LandscapeLock />

      <div dir="rtl" className="headsup-game-root relative min-h-screen text-white overflow-hidden">
        {phase !== 'playing' || !me?.isPhoneHolder ? (
          <BackgroundFX accent={state.currentTurnTeam} />
        ) : null}

        {(phase !== 'playing' || me?.isAdmin) && renderHUD()}

        <div className="relative z-10 pt-6 pb-12">
          <AnimatePresence mode="wait">
            {phase === 'lobby' && (
              <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {me.isAdmin ? renderAdminLobby() : renderPlayerLobby()}
              </motion.div>
            )}
            {phase === 'ready' && (
              <motion.div key="ready" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
                {renderReady()}
              </motion.div>
            )}
            {phase === 'playing' && (
              <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {renderPlaying()}
              </motion.div>
            )}
            {phase === 'turnEnd' && (
              <motion.div key="turnEnd" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {renderTurnEnd()}
              </motion.div>
            )}
            {phase === 'betweenRounds' && (
              <motion.div key="betweenRounds" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {renderBetweenRounds()}
              </motion.div>
            )}
            {phase === 'gameover' && (
              <motion.div key="gameover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {renderGameOver()}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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

        <AnimatePresence>
          {isTouchDevice && !motionEnabled && me?.isPhoneHolder && phase === 'playing' && (
            <GyroPermissionModal isIOS={isIOS} onEnable={enableMotion} />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}