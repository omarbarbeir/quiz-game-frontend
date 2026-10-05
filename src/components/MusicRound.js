// components/MusicRound.jsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlay, FaPause, FaStepForward, FaSignOutAlt,
  FaLock, FaCompactDisc, FaCrown, FaRedo, FaEye, FaEyeSlash,
  FaPlus, FaMinus
} from 'react-icons/fa';

/* ─────────────────────────────────────────────
   Glass primitives (Gold / Noir)
───────────────────────────────────────────── */
const glassBase = `
  relative overflow-hidden
  bg-amber-950/15 backdrop-blur-md
  border border-amber-800/25
  shadow-[inset_0_1px_0_rgba(255,210,130,0.08),0_8px_32px_rgba(0,0,0,0.55)]
  rounded-2xl
`;

function GlassCard({ children, className = '' }) {
  return (
    <div className={`${glassBase} ${className}`}>
      <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-amber-200/[0.06] to-transparent rotate-[25deg] blur-sm" />
      </div>
      {children}
    </div>
  );
}

function GoldButton({ children, onClick, disabled, variant = 'default', className = '' }) {
  const vars = {
    default: 'border-amber-800/40 text-amber-100/90 hover:border-amber-500/60 hover:bg-amber-950/20',
    play:    'border-emerald-700/50 text-emerald-200 hover:border-emerald-500/70 bg-emerald-950/25',
    pause:   'border-amber-500/60 text-amber-200 hover:border-amber-300/80 bg-amber-950/30',
    resume:  'border-amber-700/40 text-amber-200/80 hover:border-amber-500/60',
    next:    'border-amber-500/60 text-amber-100 hover:border-amber-300/80 bg-gradient-to-r from-amber-950/40 to-amber-900/30',
    reveal:  'border-cyan-700/50 text-cyan-200 hover:border-cyan-500/70 bg-cyan-950/25',
    reset:   'border-orange-700/50 text-orange-200 hover:border-orange-500/70 bg-orange-950/25',
    plus:    'border-emerald-700/60 text-emerald-200 hover:border-emerald-400/80 bg-emerald-950/30',
    minus:   'border-red-700/60 text-red-200 hover:border-red-400/80 bg-red-950/30',
  };
  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.04, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={`
        relative overflow-hidden px-4 py-2.5 rounded-xl font-semibold text-xs tracking-wide
        bg-amber-950/20 backdrop-blur-md border
        shadow-[inset_0_1px_0_rgba(255,210,130,0.08),0_4px_16px_rgba(0,0,0,0.45)]
        transition-colors duration-200
        ${vars[variant]}
        ${disabled ? 'opacity-35 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center justify-center gap-1.5">{children}</span>
    </motion.button>
  );
}

/* ─────────────────────────────────────────────
   Particles / Noir
───────────────────────────────────────────── */
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const dots = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.1 + 0.3,
      dx: (Math.random() - 0.5) * 0.22, dy: (Math.random() - 0.5) * 0.22,
      alpha: Math.random() * 0.45 + 0.15,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.dx; d.y += d.dy;
        if (d.x < 0) d.x = canvas.width; if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height; if (d.y > canvas.height) d.y = 0;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,165,90,${d.alpha})`; ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" style={{ opacity: 0.55 }} />;
}

function NoirOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 25%, rgba(0,0,0,0.78) 100%)' }} />
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)' }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   ScoreStrip — مع + و - للأدمن
───────────────────────────────────────────── */
function ScoreStrip({ players, isAdmin, onScoreChange }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return (
    <GlassCard className="px-5 py-3 max-w-md w-full">
      <p className="text-amber-300/40 text-[10px] tracking-[0.3em] uppercase mb-3">الترتيب</p>
      <div className="space-y-2">
        {sorted.map((p, i) => (
          <div key={p.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-amber-200/30 text-xs w-4 font-mono shrink-0">{i + 1}</span>
              <span className="text-amber-50/85 text-sm flex items-center gap-1 truncate">
                {p.isAdmin && <FaCrown className="text-amber-400 text-[10px] shrink-0" />}
                <span className="truncate">{p.name}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {isAdmin && onScoreChange && (
                <button
                  onClick={() => onScoreChange(p.id, -1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-red-900/50 hover:bg-red-700/70 border border-red-700/50 text-red-200 transition-colors"
                  title="خصم نقطة"
                >
                  <FaMinus className="text-[10px]" />
                </button>
              )}
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border font-mono min-w-[36px] text-center ${
                i === 0
                  ? 'border-amber-600/60 text-amber-200 bg-amber-950/40'
                  : 'border-amber-900/30 text-amber-100/40'
              }`}>
                {p.score}
              </span>
              {isAdmin && onScoreChange && (
                <button
                  onClick={() => onScoreChange(p.id, 1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-900/50 hover:bg-emerald-700/70 border border-emerald-700/50 text-emerald-200 transition-colors"
                  title="إضافة نقطة"
                >
                  <FaPlus className="text-[10px]" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ─────────────────────────────────────────────
   Vinyl
───────────────────────────────────────────── */
function Vinyl({ spinning, onClick }) {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <motion.div
        onClick={onClick}
        animate={{ rotate: spinning ? 360 : 0 }}
        transition={{ duration: 3.2, repeat: spinning ? Infinity : 0, ease: 'linear' }}
        className="relative w-full h-full rounded-full flex items-center justify-center cursor-pointer"
        style={{
          background: 'radial-gradient(circle, #1f1710 28%, #0e0a06 70%, #050403 100%)',
          border: '2px solid rgba(212,165,90,0.18)',
          boxShadow: '0 0 60px rgba(212,165,90,0.12), inset 0 0 30px rgba(0,0,0,0.8)',
        }}
      >
        <div className="absolute inset-3 rounded-full border border-amber-700/10" />
        <div className="absolute inset-6 rounded-full border border-amber-700/10" />
        <div className="absolute inset-9 rounded-full border border-amber-700/10" />
        <div className="absolute inset-12 rounded-full border border-amber-700/[0.07]" />
        <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_0_15px_rgba(212,165,90,0.6)]" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-amber-950" />
      </motion.div>
      {spinning && (
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ boxShadow: '0 0 70px rgba(212,165,90,0.35)' }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Buzzer
───────────────────────────────────────────── */
function Buzzer({ isActivePlayer, activePlayer, buzzerLocked, onBuzzerPress, canBuzz }) {
  return (
    <div className="relative p-[2px] rounded-2xl overflow-hidden">
      {canBuzz && (
        <motion.div
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, rgba(212,165,90,0.15), rgba(232,201,136,0.5), rgba(212,165,90,0.15))',
            backgroundSize: '200% 100%',
          }}
        />
      )}
      <div className="relative rounded-2xl p-[1px]"
        style={{ background: 'linear-gradient(180deg, rgba(212,165,90,0.15), rgba(0,0,0,0.4))' }}
      >
        <button
          onClick={onBuzzerPress}
          disabled={buzzerLocked || !canBuzz || activePlayer}
          className={`w-full py-6 rounded-2xl text-2xl font-bold flex items-center justify-center gap-3 transition-all
            ${isActivePlayer
              ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-amber-950 cursor-not-allowed'
              : activePlayer
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                : buzzerLocked || !canBuzz
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                  : 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-50 hover:from-amber-600 hover:to-amber-800 active:scale-[0.98] shadow-[0_0_30px_rgba(212,165,90,0.25)]'}
          `}
        >
          {isActivePlayer ? (
            <><FaLock /> لقد ضغطت!</>
          ) : activePlayer ? (
            <><FaLock /> تم قفل الزر</>
          ) : buzzerLocked || !canBuzz ? (
            <><FaLock /> تم قفل الزر</>
          ) : (
            <>اضغط للجواب!</>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Intro Overlay
───────────────────────────────────────────── */
function IntroOverlay({ onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
      style={{ background: 'rgba(0,0,0,0.94)', backdropFilter: 'blur(12px)' }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="max-w-lg text-center px-6"
      >
        <div className="text-7xl mb-6">🎵</div>
        <h2 className="text-amber-50 text-3xl font-bold mb-6">استمع للأغنية المعكوسة</h2>

        <div className="space-y-4 text-right bg-amber-950/30 border border-amber-800/30 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-amber-400 font-bold text-xl">١</span>
            <p className="text-amber-100/90 leading-relaxed">
              اضغط على زرار <span className="text-amber-400 font-bold">🔊 اضغط لتفعيل الصوت</span> أول حاجة
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-400 font-bold text-xl">٢</span>
            <p className="text-amber-100/90 leading-relaxed">
              اسمع الأغنية المعكوسة واستنتج <span className="text-amber-300 font-bold">اسم الأغنية والمغني</span>
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-400 font-bold text-xl">٣</span>
            <p className="text-amber-100/90 leading-relaxed">
              اضغط على <span className="text-amber-300 font-bold">البازر</span> عشان تجاوب
            </p>
          </div>
        </div>

        <motion.p
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-amber-300/70 text-sm"
        >
          اضغط في أي مكان للمتابعة
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export default function MusicRound({
  currentQuestion,
  players,
  playerId,
  isAdmin,
  socket,
  roomCode,
  onLeaveRoom,
  activePlayer,
  buzzerLocked,
  onBuzzerPress,
  onResetBuzzer,
  onScoreChange,   // ✅ جديد — من AdminPanel
}) {
  const audioRef1 = useRef(null);
  const audioRef2 = useRef(null);
  const [playing1, setPlaying1] = useState(false);
  const [playing2, setPlaying2] = useState(false);
  const [paused1, setPaused1]   = useState(0);
  const [paused2, setPaused2]   = useState(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);

  const publicUrl = process.env.PUBLIC_URL || '';
  const isActivePlayer = activePlayer === playerId;
  const activePlayerData = players.find(p => p.id === activePlayer);
  const canBuzz = !!currentQuestion && (playing1 || paused1 > 0 || isAdmin);

  // تحميل الأصوات لما السؤال يتغير
  useEffect(() => {
    if (!currentQuestion) return;
    if (audioRef1.current && currentQuestion.audio) {
      audioRef1.current.src = `${publicUrl}${currentQuestion.audio}`;
      audioRef1.current.load();
      audioRef1.current.muted = false;
      setPlaying1(false); setPaused1(0);
    }
    if (audioRef2.current && currentQuestion.audio2) {
      audioRef2.current.src = `${publicUrl}${currentQuestion.audio2}`;
      audioRef2.current.load();
      audioRef2.current.muted = false;
      setPlaying2(false); setPaused2(0);
    }
    setShowAnswer(false);
  }, [currentQuestion, publicUrl]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    const onPlay1 = () => {
      if (!audioRef1.current) return;
      audioRef1.current.muted = false;
      audioRef1.current.play().then(() => setPlaying1(true)).catch(() => setPlaying1(false));
    };
    const onPause1 = () => {
      if (!audioRef1.current) return;
      const t = audioRef1.current.currentTime;
      audioRef1.current.pause();
      audioRef1.current.muted = true;
      setPaused1(t);
      setPlaying1(false);
    };
    const onContinue1 = (time) => {
      if (!audioRef1.current) return;
      audioRef1.current.muted = false;
      audioRef1.current.currentTime = time;
      audioRef1.current.play().then(() => setPlaying1(true)).catch(() => setPlaying1(false));
    };
    const onStop1 = () => {
      if (!audioRef1.current) return;
      audioRef1.current.pause();
      audioRef1.current.muted = true;
      audioRef1.current.currentTime = 0;
      setPlaying1(false); setPaused1(0);
    };

    const onPlay2 = () => {
      if (!audioRef2.current) return;
      audioRef2.current.muted = false;
      audioRef2.current.play().then(() => setPlaying2(true)).catch(() => setPlaying2(false));
    };
    const onPause2 = () => {
      if (!audioRef2.current) return;
      const t = audioRef2.current.currentTime;
      audioRef2.current.pause();
      audioRef2.current.muted = true;
      setPaused2(t);
      setPlaying2(false);
    };
    const onContinue2 = (time) => {
      if (!audioRef2.current) return;
      audioRef2.current.muted = false;
      audioRef2.current.currentTime = time;
      audioRef2.current.play().then(() => setPlaying2(true)).catch(() => setPlaying2(false));
    };
    const onStop2 = () => {
      if (!audioRef2.current) return;
      audioRef2.current.pause();
      audioRef2.current.muted = true;
      audioRef2.current.currentTime = 0;
      setPlaying2(false); setPaused2(0);
    };

    socket.on('play_audio', onPlay1);
    socket.on('pause_audio', onPause1);
    socket.on('continue_audio', onContinue1);
    socket.on('stop_audio', onStop1);
    socket.on('play_audio2', onPlay2);
    socket.on('pause_audio2', onPause2);
    socket.on('continue_audio2', onContinue2);
    socket.on('stop_audio2', onStop2);

    return () => {
      socket.off('play_audio', onPlay1);
      socket.off('pause_audio', onPause1);
      socket.off('continue_audio', onContinue1);
      socket.off('stop_audio', onStop1);
      socket.off('play_audio2', onPlay2);
      socket.off('pause_audio2', onPause2);
      socket.off('continue_audio2', onContinue2);
      socket.off('stop_audio2', onStop2);
    };
  }, [socket]);

  // Admin handlers — Audio 1
  const adminPlay1 = () => {
    if (!audioRef1.current) return;
    audioRef1.current.muted = false;
    audioRef1.current.currentTime = 0;
    audioRef1.current.play().then(() => setPlaying1(true)).catch(() => setPlaying1(false));
    setPaused1(0);
    socket.emit('play_audio', roomCode);
  };
  const adminPause1 = () => {
    if (!audioRef1.current) return;
    const t = audioRef1.current.currentTime;
    audioRef1.current.pause();
    audioRef1.current.muted = true;
    setPaused1(t);
    setPlaying1(false);
    socket.emit('pause_audio', roomCode);
  };
  const adminContinue1 = () => {
    if (!audioRef1.current || paused1 <= 0) return;
    audioRef1.current.muted = false;
    audioRef1.current.currentTime = paused1;
    audioRef1.current.play().then(() => setPlaying1(true)).catch(() => setPlaying1(false));
    setPaused1(0);
    socket.emit('continue_audio', roomCode, paused1);
  };

  // Admin handlers — Audio 2
  const adminPlay2 = () => {
    if (!audioRef2.current) return;
    audioRef2.current.muted = false;
    audioRef2.current.currentTime = 0;
    audioRef2.current.play().then(() => setPlaying2(true)).catch(() => setPlaying2(false));
    setPaused2(0);
    socket.emit('play_audio2', roomCode);
  };
  const adminPause2 = () => {
    if (!audioRef2.current) return;
    const t = audioRef2.current.currentTime;
    audioRef2.current.pause();
    audioRef2.current.muted = true;
    setPaused2(t);
    setPlaying2(false);
    socket.emit('pause_audio2', roomCode);
  };
  const adminContinue2 = () => {
    if (!audioRef2.current || paused2 <= 0) return;
    audioRef2.current.muted = false;
    audioRef2.current.currentTime = paused2;
    audioRef2.current.play().then(() => setPlaying2(true)).catch(() => setPlaying2(false));
    setPaused2(0);
    socket.emit('continue_audio2', roomCode, paused2);
  };

  const handleNext = () => {
    socket.emit('music_next', { roomCode });
  };

  const unlockAudio = () => {
    const refs = [audioRef1.current, audioRef2.current].filter(Boolean);
    refs.forEach(ref => {
      const prevMuted = ref.muted;
      ref.muted = true;
      const p = ref.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          ref.pause();
          ref.currentTime = 0;
          ref.muted = prevMuted;
        }).catch(() => { ref.muted = prevMuted; });
      } else {
        ref.pause();
        ref.currentTime = 0;
        ref.muted = prevMuted;
      }
    });
    setAudioUnlocked(true);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0805 0%, #1a120a 40%, #0d0806 70%, #0a0805 100%)',
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      }}
    >
      <ParticleField />
      <NoirOverlay />

      <AnimatePresence>
        {showIntro && <IntroOverlay onDismiss={() => setShowIntro(false)} />}
      </AnimatePresence>

      <div
        className="pointer-events-none fixed"
        style={{
          width: 650, height: 650, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,165,90,0.13) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          filter: 'blur(50px)',
        }}
      />

      {/* top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <FaCompactDisc className="text-amber-500/50 text-sm" />
          <span className="text-amber-200/30 text-[10px] tracking-[0.3em] uppercase">أغاني معكوسة</span>
          <span className="w-px h-4 bg-amber-800/30" />
          <span className="text-amber-100/40 text-xs">{players.length} لاعبين</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-800/40 bg-amber-950/30 backdrop-blur-sm text-amber-300/80 text-xs tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          {roomCode}
        </div>
        <button
          onClick={onLeaveRoom}
          className="text-amber-200/25 hover:text-amber-200/70 transition-colors text-xs tracking-wide flex items-center gap-1"
        >
          <FaSignOutAlt className="text-[10px]" /> خروج
        </button>
      </div>

      {/* headline */}
      <div className="relative z-10 text-center pt-3 pb-4 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-amber-50/95 text-3xl font-bold tracking-tight mb-1"
        >
          الأغاني المعكوسة
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-amber-200/30 text-[10px] tracking-[0.35em] uppercase"
        >
          {isAdmin ? 'لوحة التحكم' : 'شاشة اللاعب'}
        </motion.p>
      </div>

      {/* main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 gap-4 overflow-y-auto pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full flex flex-col items-center gap-4 max-w-2xl"
        >
          {/* Audio unlock button */}
          {!isAdmin && !audioUnlocked && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={unlockAudio}
              className="w-full max-w-sm py-4 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-amber-50 font-bold text-lg shadow-lg shadow-amber-900/40 transition-transform"
            >
              🔊 اضغط لتفعيل الصوت
            </motion.button>
          )}

          {/* Vinyl */}
          <GlassCard className="p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-5">
              <Vinyl spinning={playing1} onClick={() => setShowIntro(true)} />
            </div>

            <AnimatePresence mode="wait">
              {playing1 ? (
                <motion.div key="p" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <p className="text-amber-100 text-lg font-bold mb-1">🎵 جاري التشغيل</p>
                  <p className="text-amber-200/40 text-xs tracking-widest">ركّز في الكلمات المعكوسة</p>
                </motion.div>
              ) : paused1 > 0 ? (
                <motion.div key="pa" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <p className="text-amber-300 text-lg font-bold mb-1">⏸ إيقاف مؤقت</p>
                  <p className="text-amber-200/40 text-xs tracking-widest">في انتظار الاستكمال</p>
                </motion.div>
              ) : (
                <motion.div key="w" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <p className="text-amber-100 text-lg font-bold mb-1">🎧 استعد!</p>
                  <p className="text-amber-200/40 text-xs tracking-widest">في انتظار تشغيل الأغنية</p>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* 🎯 Buzzer status + reset — للأدمن بس */}
          {isAdmin && activePlayer && (
            <div className="w-full max-w-md">
              <GlassCard className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-100 text-sm">
                    <span className="font-bold">
                      {activePlayerData?.isAdmin ? 'المسؤول' : activePlayerData?.name}
                    </span> ضغط على الزر!
                  </span>
                </div>
                <GoldButton variant="reset" onClick={onResetBuzzer} className="!py-2 !px-3">
                  <FaRedo /> إرجاع البازر
                </GoldButton>
              </GlassCard>
            </div>
          )}

          {/* Admin controls */}
          {isAdmin && (
            <div className="w-full grid grid-cols-1 gap-3">
              {/* Reveal button */}
              <GoldButton variant="reveal" onClick={() => setShowAnswer(s => !s)} className="!py-3 !text-sm">
                {showAnswer ? <><FaEyeSlash /> إخفاء الإجابة</> : <><FaEye /> اكشف الإجابة (للمسؤول)</>}
              </GoldButton>

              {/* Revealed answer */}
              <AnimatePresence>
                {showAnswer && currentQuestion && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <GlassCard className="p-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <p className="text-amber-300/50 text-[10px] tracking-[0.2em] uppercase mb-1">المغني</p>
                          <p className="text-amber-50 font-bold text-base">{currentQuestion.text || '—'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-amber-300/50 text-[10px] tracking-[0.2em] uppercase mb-1">الأغنية</p>
                          <p className="text-amber-50 font-bold text-base">{currentQuestion.answer || '—'}</p>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reversed controls */}
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-amber-300/60 text-[10px] tracking-[0.3em] uppercase">الأغنية المعكوسة</p>
                  {playing1 && (
                    <span className="text-[10px] text-amber-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> قيد التشغيل
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <GoldButton variant="play" disabled={playing1} onClick={adminPlay1} className="!py-3">
                    <FaPlay /> تشغيل
                  </GoldButton>
                  <GoldButton variant="pause" disabled={!playing1} onClick={adminPause1} className="!py-3">
                    <FaPause /> إيقاف
                  </GoldButton>
                  <GoldButton variant="resume" disabled={playing1 || paused1 === 0} onClick={adminContinue1} className="!py-3">
                    <FaPlay /> استكمال
                  </GoldButton>
                </div>
              </GlassCard>

              {/* Normal controls */}
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-amber-300/60 text-[10px] tracking-[0.3em] uppercase">الأغنية الأصلية</p>
                  {playing2 && (
                    <span className="text-[10px] text-amber-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> قيد التشغيل
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <GoldButton variant="play" disabled={playing2} onClick={adminPlay2} className="!py-3">
                    <FaPlay /> تشغيل
                  </GoldButton>
                  <GoldButton variant="pause" disabled={!playing2} onClick={adminPause2} className="!py-3">
                    <FaPause /> إيقاف
                  </GoldButton>
                  <GoldButton variant="resume" disabled={playing2 || paused2 === 0} onClick={adminContinue2} className="!py-3">
                    <FaPlay /> استكمال
                  </GoldButton>
                </div>
              </GlassCard>

              {/* Next song */}
              <GoldButton variant="next" onClick={handleNext} className="!py-3.5 !text-sm">
                <FaStepForward /> الأغنية التالية
              </GoldButton>
            </div>
          )}

          {/* Buzzer */}
          {canBuzz && (
            <div className="w-full max-w-md">
              <Buzzer
                isActivePlayer={isActivePlayer}
                activePlayer={activePlayer}
                buzzerLocked={buzzerLocked}
                onBuzzerPress={onBuzzerPress}
                canBuzz={canBuzz}
              />
            </div>
          )}

          {/* Score strip — مع + و - للأدمن */}
          <div className="flex justify-center w-full">
            <ScoreStrip
              players={players}
              isAdmin={isAdmin}
              onScoreChange={onScoreChange}
            />
          </div>
        </motion.div>
      </div>

      <audio ref={audioRef1} className="hidden" preload="auto" playsInline />
      <audio ref={audioRef2} className="hidden" preload="auto" playsInline />
    </div>
  );
}