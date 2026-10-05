// components/PutWordRound.jsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStepForward, FaSignOutAlt, FaCrown, FaPlus, FaMinus,
  FaLock, FaBolt, FaMusic, FaRedo, FaTimesCircle, FaMicrophone
} from 'react-icons/fa';

/* ─────────────────────────────────────────────
   Karaoke Neon Glass primitives (Purple + Magenta)
───────────────────────────────────────────── */
const glassBase = `
  relative overflow-hidden
  bg-purple-950/25 backdrop-blur-md
  border border-fuchsia-400/20
  shadow-[inset_0_1px_0_rgba(255,150,240,0.08),0_8px_32px_rgba(0,0,0,0.6)]
  rounded-2xl
`;

function GlassCard({ children, className = '' }) {
  return (
    <div className={`${glassBase} ${className}`}>
      <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-fuchsia-200/[0.06] to-transparent rotate-[25deg] blur-sm" />
      </div>
      {children}
    </div>
  );
}

function NeonButton({ children, onClick, disabled, variant = 'default', className = '' }) {
  const vars = {
    default: 'border-fuchsia-700/40 text-fuchsia-100/90 hover:border-fuchsia-400/70 hover:bg-fuchsia-950/30',
    next:    'border-fuchsia-400/60 text-fuchsia-100 hover:border-fuchsia-300/80 bg-gradient-to-r from-fuchsia-950/50 to-purple-950/50',
    reset:   'border-orange-500/50 text-orange-200 hover:border-orange-400/70 bg-orange-950/25',
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
        bg-purple-950/25 backdrop-blur-md border
        shadow-[inset_0_1px_0_rgba(255,150,240,0.08),0_4px_16px_rgba(0,0,0,0.5)]
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
   Particles — musical
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

    const symbols = ['♪', '♫', '♩', '♬', '🎵', '🎶'];
    const notes = Array.from({ length: 35 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 14 + 10,
      speed: Math.random() * 0.4 + 0.15,
      drift: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.35 + 0.1,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      hue: Math.random() > 0.5 ? 'magenta' : 'cyan',
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      notes.forEach(n => {
        n.y -= n.speed;
        n.x += n.drift;
        if (n.y < -30) { n.y = canvas.height + 20; n.x = Math.random() * canvas.width; }
        if (n.x < -30) n.x = canvas.width + 20;
        if (n.x > canvas.width + 30) n.x = -20;
        ctx.font = `${n.size}px serif`;
        ctx.fillStyle = n.hue === 'magenta'
          ? `rgba(255,120,240,${n.alpha})`
          : `rgba(120,240,255,${n.alpha})`;
        ctx.fillText(n.symbol, n.x, n.y);
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" style={{ opacity: 0.7 }} />;
}

function NoirOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 22%, rgba(15,0,25,0.88) 100%)' }} />
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)' }} />
    </div>
  );
}

/* ─────────────────────────────────────────────
   ScoreStrip — with +/- for admin
───────────────────────────────────────────── */
function ScoreStrip({ players, isAdmin, onScoreChange }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return (
    <GlassCard className="px-5 py-3 max-w-md w-full">
      <p className="text-fuchsia-300/50 text-[10px] tracking-[0.3em] uppercase mb-3">الترتيب</p>
      <div className="space-y-2">
        {sorted.map((p, i) => (
          <div key={p.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-fuchsia-200/40 text-xs w-4 font-mono shrink-0">{i + 1}</span>
              <span className="text-purple-50/90 text-sm flex items-center gap-1 truncate">
                {p.isAdmin && <FaCrown className="text-fuchsia-400 text-[10px] shrink-0" />}
                <span className="truncate">{p.name}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {isAdmin && onScoreChange && (
                <button
                  onClick={() => onScoreChange(p.id, -1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-red-900/50 hover:bg-red-700/70 border border-red-700/50 text-red-200 transition-colors"
                >
                  <FaMinus className="text-[10px]" />
                </button>
              )}
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border font-mono min-w-[36px] text-center ${
                i === 0
                  ? 'border-fuchsia-500/60 text-fuchsia-200 bg-fuchsia-950/50'
                  : 'border-purple-900/40 text-purple-100/40'
              }`}>
                {p.score}
              </span>
              {isAdmin && onScoreChange && (
                <button
                  onClick={() => onScoreChange(p.id, 1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-900/50 hover:bg-emerald-700/70 border border-emerald-700/50 text-emerald-200 transition-colors"
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
   Intro overlay
───────────────────────────────────────────── */
function IntroOverlay({ onDismiss, isAdmin }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
      style={{ background: 'rgba(15,0,25,0.94)', backdropFilter: 'blur(12px)' }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="max-w-lg text-center px-6"
      >
        <div className="text-7xl mb-6">🎤</div>
        <h2 className="text-fuchsia-50 text-3xl font-bold mb-6">حط كلمة في أغنية</h2>

        <div className="space-y-4 text-right bg-purple-950/30 border border-fuchsia-700/30 rounded-2xl p-6 mb-6">
          {isAdmin ? (
            <>
              <div className="flex items-start gap-3">
                <span className="text-fuchsia-400 font-bold text-xl">١</span>
                <p className="text-purple-100/90 leading-relaxed">
                  الكلمة بتظهر تلقائيًا على الشاشة
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-fuchsia-400 font-bold text-xl">٢</span>
                <p className="text-purple-100/90 leading-relaxed">
                  كل لاعب يفكر في <span className="text-fuchsia-300 font-bold">أغنية فيها الكلمة دي</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-fuchsia-400 font-bold text-xl">٣</span>
                <p className="text-purple-100/90 leading-relaxed">
                  اللي يعرف يدوس البازر ويقول اسم الأغنية
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-fuchsia-400 font-bold text-xl">٤</span>
                <p className="text-purple-100/90 leading-relaxed">
                  وزّع نقاط بـ <span className="text-fuchsia-300 font-bold">+ / -</span>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <span className="text-fuchsia-400 font-bold text-xl">١</span>
                <p className="text-purple-100/90 leading-relaxed">
                  هتظهر <span className="text-fuchsia-300 font-bold">كلمة عشوائية</span> على الشاشة
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-fuchsia-400 font-bold text-xl">٢</span>
                <p className="text-purple-100/90 leading-relaxed">
                  فكّر في <span className="text-fuchsia-300 font-bold">أغنية فيها الكلمة دي</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-fuchsia-400 font-bold text-xl">٣</span>
                <p className="text-purple-100/90 leading-relaxed">
                  اضغط البازر بأسرع وقت وقول اسم الأغنية
                </p>
              </div>
            </>
          )}
        </div>

        <motion.p
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-fuchsia-300/70 text-sm"
        >
          اضغط في أي مكان للمتابعة
        </motion.p>
      </motion.div>
    </motion.div>
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
            background: 'linear-gradient(90deg, rgba(255,120,240,0.15), rgba(120,240,255,0.6), rgba(255,120,240,0.15))',
            backgroundSize: '200% 100%',
          }}
        />
      )}
      <div className="relative rounded-2xl p-[1px]"
        style={{ background: 'linear-gradient(180deg, rgba(255,150,240,0.15), rgba(0,0,0,0.4))' }}
      >
        <button
          onClick={onBuzzerPress}
          disabled={buzzerLocked || !canBuzz || activePlayer}
          className={`w-full py-8 rounded-2xl text-2xl font-bold flex items-center justify-center gap-3 transition-all
            ${isActivePlayer
              ? 'bg-gradient-to-br from-fuchsia-400 to-purple-600 text-purple-950 cursor-not-allowed'
              : activePlayer
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : buzzerLocked || !canBuzz
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-700 text-white hover:from-fuchsia-500 hover:to-indigo-600 active:scale-[0.98] shadow-[0_0_30px_rgba(255,120,240,0.5)]'}
          `}
        >
          {isActivePlayer ? (
            <><FaLock /> لقد ضغطت!</>
          ) : activePlayer ? (
            <><FaLock /> تم قفل الزر</>
          ) : buzzerLocked || !canBuzz ? (
            <><FaLock /> تم قفل الزر</>
          ) : (
            <><FaBolt /> اضغط للجواب!</>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export default function PutWordRound({
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
  onScoreChange,
}) {
  const [showIntro, setShowIntro] = useState(true);

  const isActivePlayer = activePlayer === playerId;
  const activePlayerData = players.find(p => p.id === activePlayer);
  const canBuzz = !!currentQuestion && !activePlayer;

  const handleNext = () => {
    socket.emit('put_word_next', { roomCode });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f0318 0%, #1e0838 45%, #2a0a4a 75%, #0f0318 100%)',
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      }}
    >
      <ParticleField />
      <NoirOverlay />

      <AnimatePresence>
        {showIntro && (
          <IntroOverlay isAdmin={isAdmin} onDismiss={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {/* Glow */}
      <div
        className="pointer-events-none fixed"
        style={{
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,120,240,0.15) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          filter: 'blur(60px)',
        }}
      />

      {/* top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <FaMicrophone className="text-fuchsia-400/60 text-sm" />
          <span className="text-fuchsia-200/40 text-[10px] tracking-[0.3em] uppercase">حط كلمة في أغنية</span>
          <span className="w-px h-4 bg-purple-800/40" />
          <span className="text-purple-100/40 text-xs">{players.length} لاعبين</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-fuchsia-700/40 bg-purple-950/40 backdrop-blur-sm text-fuchsia-300/80 text-xs tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
          {roomCode}
        </div>
        <button
          onClick={onLeaveRoom}
          className="text-purple-200/25 hover:text-purple-200/70 transition-colors text-xs tracking-wide flex items-center gap-1"
        >
          <FaSignOutAlt className="text-[10px]" /> خروج
        </button>
      </div>

      {/* headline */}
      <div className="relative z-10 text-center pt-3 pb-4 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-fuchsia-50 text-3xl font-bold tracking-tight mb-1"
          style={{ letterSpacing: '-0.01em', textShadow: '0 0 20px rgba(255,120,240,0.4)' }}
        >
          حط كلمة في أغنية
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-fuchsia-200/30 text-[10px] tracking-[0.35em] uppercase"
        >
          {isAdmin ? 'لوحة التحكم' : 'شاشة اللاعب'}
        </motion.p>
      </div>

      {/* main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 gap-4 overflow-y-auto pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="w-full flex flex-col items-center gap-4 max-w-2xl"
        >

          {/* ═══════ The Word display ═══════ */}
          <GlassCard className="p-10 w-full max-w-2xl text-center">
            <div className="flex justify-center mb-5">
              <motion.div
                animate={{ scale: [1, 1.05, 1], rotate: [0, 3, -3, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'radial-gradient(circle, rgba(255,120,240,0.25), rgba(120,240,255,0.1))',
                  border: '2px solid rgba(255,150,240,0.4)',
                  boxShadow: '0 0 50px rgba(255,120,240,0.4)',
                }}
              >
                <FaMusic className="text-2xl text-fuchsia-200" />
              </motion.div>
            </div>

            {/* ✅ حالة "استعد" — لما مفيش كلمة بعد */}
            {!currentQuestion?.text ? (
              <div className="py-6">
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-fuchsia-100 text-5xl font-bold mb-4"
                  style={{ textShadow: '0 0 40px rgba(255,120,240,0.6)' }}
                >
                  استعد!
                </motion.p>
                <p className="text-fuchsia-200/40 text-xs tracking-widest">
                  {isAdmin ? 'اضغط "الكلمة التالية" لبدء الجولة' : 'في انتظار بدء الجولة من المسؤول'}
                </p>
              </div>
            ) : (
              <>
                <p className="text-fuchsia-300/60 text-[10px] tracking-[0.4em] uppercase mb-5">
                  الكلمة
                </p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentQuestion.id}
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    className="text-fuchsia-50 text-6xl sm:text-7xl font-bold leading-none"
                    style={{ textShadow: '0 0 30px rgba(255,120,240,0.6), 0 0 60px rgba(120,240,255,0.3)' }}
                  >
                    {currentQuestion.text}
                  </motion.p>
                </AnimatePresence>
                <p className="text-purple-200/40 text-xs tracking-widest mt-6">
                  فكّر في أغنية فيها الكلمة دي
                </p>
              </>
            )}
          </GlassCard>

          {/* ═══════ Buzzer status ═══════ */}
          {activePlayer && (
            <GlassCard className="p-4 w-full max-w-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
                <span className="text-fuchsia-100 text-sm">
                  <span className="font-bold">
                    {activePlayerData?.isAdmin ? 'المسؤول' : activePlayerData?.name}
                  </span> ضغط على الزر!
                </span>
              </div>
              {isAdmin && (
                <NeonButton variant="reset" onClick={onResetBuzzer} className="!py-2 !px-3">
                  <FaTimesCircle /> إرجاع البازر
                </NeonButton>
              )}
            </GlassCard>
          )}

          {/* ═══════ Admin controls ═══════ */}
          {isAdmin && (
            <div className="w-full max-w-md">
              <NeonButton
                variant="next"
                onClick={handleNext}
                className="w-full !py-3.5 !text-sm"
              >
                <FaStepForward /> الكلمة التالية
              </NeonButton>
            </div>
          )}

          {/* ═══════ Buzzer — للكل (أدمن + لاعبين) ═══════ */}
          {!activePlayer && (
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

          {/* Score strip */}
          <div className="flex justify-center w-full">
            <ScoreStrip
              players={players}
              isAdmin={isAdmin}
              onScoreChange={onScoreChange}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}