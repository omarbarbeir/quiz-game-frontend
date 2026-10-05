// components/CinemaRound.jsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStepForward, FaSignOutAlt, FaCrown, FaPlus, FaMinus,
  FaLock, FaBolt, FaFilm, FaUserTie, FaLightbulb,
  FaCheck, FaStar, FaVideo, FaTimesCircle,
  FaPlay
} from 'react-icons/fa';

/* ─────────────────────────────────────────────
   Premium Glass primitives
───────────────────────────────────────────── */
const glassBase = `
  relative overflow-hidden
  bg-slate-900/40 backdrop-blur-xl
  border border-amber-400/15
  shadow-[inset_0_1px_0_rgba(255,220,150,0.08),0_8px_32px_rgba(0,0,0,0.6)]
  rounded-2xl
`;

function GlassCard({ children, className = '' }) {
  return (
    <div className={`${glassBase} ${className}`}>
      <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-amber-200/[0.05] to-transparent rotate-[25deg] blur-sm" />
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Particles — elegant drifting sparkles
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

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.3,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.5 + 0.15,
      warm: Math.random() > 0.5,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.warm
          ? `rgba(255,200,120,${p.alpha})`
          : `rgba(200,180,255,${p.alpha * 0.7})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" style={{ opacity: 0.55 }} />;
}

function BackgroundGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, transparent 20%, rgba(8,5,20,0.85) 100%)' }} />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)' }} />
      {/* Top spotlight */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none"
        style={{
          width: '70%', height: '40%',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(255,200,120,0.16) 0%, transparent 65%)',
          filter: 'blur(40px)',
        }}
      />
      {/* Bottom side glows */}
      <div
        className="absolute bottom-0 left-0 w-1/3 h-1/3 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 0% 100%, rgba(180,120,255,0.15), transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-1/3 h-1/3 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 100% 100%, rgba(255,140,180,0.12), transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   ScoreStrip
───────────────────────────────────────────── */
function ScoreStrip({ players, isAdmin, onScoreChange }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return (
    <GlassCard className="px-5 py-3 max-w-md w-full">
      <p className="text-amber-300/50 text-[10px] tracking-[0.3em] uppercase mb-3">الترتيب</p>
      <div className="space-y-2">
        {sorted.map((p, i) => (
          <div key={p.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-amber-200/40 text-xs w-4 font-mono shrink-0">{i + 1}</span>
              <span className="text-slate-50/90 text-sm flex items-center gap-1 truncate">
                {p.isAdmin && <FaCrown className="text-amber-400 text-[10px] shrink-0" />}
                <span className="truncate">{p.name}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {isAdmin && onScoreChange && (
                <button onClick={() => onScoreChange(p.id, -1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-red-900/50 hover:bg-red-700/70 border border-red-700/50 text-red-200 transition-colors">
                  <FaMinus className="text-[10px]" />
                </button>
              )}
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border font-mono min-w-[36px] text-center ${
                i === 0 ? 'border-amber-500/60 text-amber-200 bg-amber-950/50' : 'border-slate-700/40 text-slate-100/40'
              }`}>
                {p.score}
              </span>
              {isAdmin && onScoreChange && (
                <button onClick={() => onScoreChange(p.id, 1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-900/50 hover:bg-emerald-700/70 border border-emerald-700/50 text-emerald-200 transition-colors">
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
   Subcategory Picker — 2 elegant cards
───────────────────────────────────────────── */
function SubcategoryPicker({ onPick }) {
  const options = [
    {
      id: 'history',
      label: 'قبل ٢٠٠٠',
      sub: 'أفلام كلاسيكية',
      emoji: '📽️',
      grad: 'from-rose-600/20 via-rose-500/10 to-transparent',
      border: 'rgba(244,63,94,0.5)',
      glow: 'rgba(244,63,94,0.3)',
      iconColor: 'text-rose-300',
    },
    {
      id: 'cinema',
      label: 'بعد ٢٠٠٠',
      sub: 'سينما حديثة',
      emoji: '🎬',
      grad: 'from-violet-600/20 via-violet-500/10 to-transparent',
      border: 'rgba(168,85,247,0.5)',
      glow: 'rgba(168,85,247,0.3)',
      iconColor: 'text-violet-300',
    },
  ];

  return (
    <div className="w-full max-w-2xl">
      <p className="text-center text-amber-200/50 text-[10px] tracking-[0.4em] uppercase mb-6">
        اختر الفئة
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt, i) => (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.15, type: 'spring', stiffness: 280, damping: 22 }}
            whileHover={{ scale: 1.05, y: -6 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPick(opt.id)}
            className="relative overflow-hidden rounded-3xl p-8 text-center"
            style={{
              background: `linear-gradient(155deg, ${opt.grad}), rgba(15,10,25,0.9)`,
              border: `1.5px solid ${opt.border}`,
              boxShadow: `0 8px 40px ${opt.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
            }}
          >
            {/* Shimmer on hover */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
                width: '50%',
              }}
            />

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
              className="text-6xl mb-4 drop-shadow-2xl"
            >
              {opt.emoji}
            </motion.div>
            <p className="text-2xl font-bold text-white mb-1">{opt.label}</p>
            <p className="text-xs text-white/40 tracking-widest">{opt.sub}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Actor Card — elegant chip with avatar
───────────────────────────────────────────── */
function ActorChip({ name, index }) {
  const initial = name.trim().charAt(0);
  return (
    <motion.div
      initial={{ opacity: 0, y: 25, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.13,
        type: 'spring',
        stiffness: 300,
        damping: 22,
      }}
      className="relative group"
    >
      <div
        className="relative flex items-center gap-3 px-4 py-3 rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(155deg, rgba(30,20,45,0.85), rgba(20,15,35,0.85))',
          border: '1.5px solid rgba(255,200,120,0.3)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,220,150,0.12)',
        }}
      >
        {/* Avatar circle */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
          style={{
            background: 'linear-gradient(155deg, #f59e0b, #b45309)',
            color: '#1e1b4b',
            boxShadow: '0 0 12px rgba(245,158,11,0.4)',
          }}
        >
          {initial}
        </div>
        <span className="text-amber-50 font-bold text-base sm:text-lg whitespace-nowrap">
          {name}
        </span>

        {/* Corner sparkle */}
        <motion.div
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
          className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-300"
        />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Main Screen — display area
───────────────────────────────────────────── */
function MainScreen({ currentQuestion, isAdmin }) {
  const actors = (currentQuestion?.text || '').split(' / ').map(s => s.trim()).filter(Boolean);
  const actorsRevealed = !!currentQuestion?.actorsRevealed;

  return (
    <div className="relative w-full max-w-3xl">
      {/* Ambient glow */}
      <div
        className="absolute -inset-6 rounded-3xl pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255,180,80,0.12), transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      <GlassCard className="relative p-6 sm:p-10 min-h-[16rem] flex flex-col items-center justify-center">
        {/* Decorative top line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,200,120,0.7), transparent)' }}
        />

        <AnimatePresence mode="wait">

          {/* ===== Waiting for actors ===== */}
          {!actorsRevealed && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                  filter: ['drop-shadow(0 0 15px rgba(255,180,80,0.4))', 'drop-shadow(0 0 35px rgba(255,180,80,0.8))', 'drop-shadow(0 0 15px rgba(255,180,80,0.4))'],
                }}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="text-7xl mb-5"
              >
                🎬
              </motion.div>
              <p className="text-3xl font-bold text-amber-50 mb-2"
                style={{ textShadow: '0 0 30px rgba(255,180,80,0.5)' }}>
                استعد!
              </p>
              <p className="text-sm text-amber-200/40 tracking-widest">
                {isAdmin ? 'اضغط "الأسماء" لعرض الممثلين' : 'في انتظار كشف الأسماء'}
              </p>
            </motion.div>
          )}

          {/* ===== Actors revealed ===== */}
          {actorsRevealed && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              {/* Header */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-amber-500/40" />
                <div className="flex items-center gap-2">
                  <FaStar className="text-amber-400 text-xs" />
                  <span className="text-amber-300/80 text-[10px] tracking-[0.4em] uppercase font-bold">
                    الممثلون
                  </span>
                  <FaStar className="text-amber-400 text-xs" />
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-amber-500/40" />
              </div>

              {/* Actor chips */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {actors.map((actor, i) => (
                  <ActorChip key={i} name={actor} index={i} />
                ))}
              </div>

              {/* Bottom hint */}
              <p className="text-center text-amber-200/50 text-xs tracking-widest mt-7">
                مين الفيلم؟
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </GlassCard>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Hint Card
───────────────────────────────────────────── */
function HintCard({ hint }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="relative w-full max-w-2xl"
    >
      <div
        className="relative rounded-2xl overflow-hidden p-5"
        style={{
          background: 'linear-gradient(155deg, rgba(255,237,213,0.98), rgba(254,215,170,0.95))',
          border: '2px solid rgba(245,158,11,0.6)',
          boxShadow: '0 10px 40px rgba(245,158,11,0.35), inset 0 1px 0 rgba(255,255,255,0.7)',
        }}
      >
        {/* Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.35 }}
            className="absolute w-1.5 h-1.5 rounded-full bg-amber-500"
            style={{
              top: `${10 + (i * 15) % 80}%`,
              left: `${5 + (i * 23) % 90}%`,
            }}
          />
        ))}

        <div className="relative flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(155deg, #f59e0b, #b45309)',
              boxShadow: '0 0 20px rgba(245,158,11,0.5)',
            }}
          >
            <FaLightbulb className="text-amber-950 text-xl" />
          </div>
          <div className="flex-1">
            <p className="text-amber-900/70 text-[10px] tracking-[0.3em] uppercase font-bold mb-1">
              تلميح
            </p>
            <p className="text-amber-950 font-bold text-base sm:text-lg leading-relaxed">
              {hint}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Answer Reveal — cinematic grand reveal
───────────────────────────────────────────── */
function AnswerReveal({ answer }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 240, damping: 18 }}
      className="relative w-full max-w-2xl"
    >
      <div
        className="relative rounded-3xl overflow-hidden p-8 sm:p-10 text-center"
        style={{
          background: 'linear-gradient(155deg, #0f0520, #1a0a2e, #0f0520)',
          border: '2px solid rgba(251,191,36,0.6)',
          boxShadow: '0 0 80px rgba(251,191,36,0.4), inset 0 0 60px rgba(120,40,180,0.15)',
        }}
      >
        {/* Animated border glow */}
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{ boxShadow: 'inset 0 0 40px rgba(255,200,120,0.3)' }}
        />

        {/* Top spotlight */}
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-32 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, rgba(255,220,140,0.6), transparent 60%)',
            filter: 'blur(20px)',
          }}
        />

        <div className="relative">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 18 }}
            className="inline-block mb-4"
          >
            <FaLightbulb className="text-3xl text-amber-400" />
          </motion.div>

          <p className="text-amber-300/70 text-[10px] tracking-[0.5em] uppercase font-bold mb-3">
            الفيلم
          </p>

          <motion.p
            initial={{ letterSpacing: '0.4em', opacity: 0, filter: 'blur(10px)' }}
            animate={{ letterSpacing: '0.02em', opacity: 1, filter: 'blur(0px)' }}
            transition={{ delay: 0.5, duration: 0.9 }}
            className="text-amber-50 text-3xl sm:text-5xl font-bold leading-tight"
            style={{ textShadow: '0 0 30px rgba(255,200,120,0.8), 0 0 60px rgba(255,140,80,0.5)' }}
          >
            {answer}
          </motion.p>
        </div>

        {/* Confetti sparkles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 0, x: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: -80,
              x: (i - 6) * 20,
              rotate: (i % 2 ? 1 : -1) * 360,
            }}
            transition={{ duration: 1.8, delay: 0.7 + i * 0.06 }}
            className="absolute bottom-10 left-1/2 w-2 h-2 rounded-sm pointer-events-none"
            style={{
              background: i % 3 === 0 ? '#fbbf24' : i % 3 === 1 ? '#f472b6' : '#a78bfa',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Reveal Button — elegant pill
───────────────────────────────────────────── */
function RevealButton({ icon, label, state, onClick, colors }) {
  const isActive = state === 'active';
  const isDone = state === 'done';

  return (
    <motion.button
      onClick={isActive ? onClick : undefined}
      disabled={!isActive}
      whileHover={isActive ? { scale: 1.05, y: -3 } : {}}
      whileTap={isActive ? { scale: 0.96 } : {}}
      transition={{ type: 'spring', stiffness: 340, damping: 24 }}
      className="relative flex items-center gap-3 px-5 py-3 rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        minWidth: '8rem',
        background: isActive
          ? `linear-gradient(155deg, ${colors.from}, ${colors.to})`
          : isDone
            ? 'linear-gradient(155deg, rgba(6,46,26,0.9), rgba(4,26,16,0.9))'
            : 'linear-gradient(155deg, rgba(20,15,30,0.7), rgba(12,8,20,0.7))',
        border: `1.5px solid ${isActive ? colors.border : isDone ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: isActive
          ? `0 6px 24px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`
          : isDone
            ? '0 0 15px rgba(34,197,94,0.15)'
            : 'none',
        cursor: isActive ? 'pointer' : 'not-allowed',
      }}
    >
      {isActive && (
        <motion.div
          animate={{ backgroundPosition: ['0% 0%', '200% 0%'] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.glow}, transparent)`,
            backgroundSize: '200% 100%',
          }}
        />
      )}

      <div className="relative z-10 flex items-center gap-2">
        {isDone ? (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 16 }}
          >
            <FaCheck className="text-emerald-400" />
          </motion.div>
        ) : (
          <span className={isActive ? 'text-white text-lg' : 'text-white/20 text-lg'}>
            {icon}
          </span>
        )}
        <span className={`text-sm font-bold tracking-wide ${
          isActive ? 'text-white' : isDone ? 'text-emerald-300' : 'text-white/20'
        }`}>
          {isDone ? 'تم' : label}
        </span>
      </div>
    </motion.button>
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
            background: 'linear-gradient(90deg, rgba(255,120,80,0.15), rgba(255,220,140,0.6), rgba(255,120,80,0.15))',
            backgroundSize: '200% 100%',
          }}
        />
      )}
      <div className="relative rounded-2xl p-[1px]"
        style={{ background: 'linear-gradient(180deg, rgba(255,200,120,0.15), rgba(0,0,0,0.4))' }}
      >
        <button
          onClick={onBuzzerPress}
          disabled={buzzerLocked || !canBuzz || activePlayer}
          className={`w-full py-6 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 transition-all
            ${isActivePlayer
              ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 cursor-not-allowed'
              : activePlayer
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : buzzerLocked || !canBuzz
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-br from-rose-600 via-red-600 to-amber-600 text-amber-50 hover:from-rose-500 hover:to-amber-500 active:scale-[0.98] shadow-[0_0_30px_rgba(255,140,80,0.4)]'}
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
   Intro Overlay
───────────────────────────────────────────── */
function IntroOverlay({ onDismiss, isAdmin }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
      style={{ background: 'rgba(8,4,15,0.94)', backdropFilter: 'blur(14px)' }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="max-w-lg text-center px-6"
      >
        <motion.div
          animate={{ rotate: [0, -6, 6, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-7xl mb-6"
        >
          🎬
        </motion.div>
        <h2 className="text-amber-50 text-3xl font-bold mb-6">سينما</h2>

        <div className="space-y-4 text-right bg-slate-900/50 border border-amber-700/30 rounded-2xl p-6 mb-6">
          {isAdmin ? (
            <>
              <div className="flex items-start gap-3">
                <span className="text-amber-400 font-bold text-xl">١</span>
                <p className="text-slate-100/90 leading-relaxed">
                  اختر <span className="text-amber-300 font-bold">قبل ٢٠٠٠</span> أو <span className="text-amber-300 font-bold">بعد ٢٠٠٠</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-400 font-bold text-xl">٢</span>
                <p className="text-slate-100/90 leading-relaxed">
                  اضغط <span className="text-amber-300 font-bold">"الأسماء"</span> لعرض الممثلين
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-400 font-bold text-xl">٣</span>
                <p className="text-slate-100/90 leading-relaxed">
                  <span className="text-amber-300 font-bold">"تلميح"</span> ثم <span className="text-amber-300 font-bold">"الإجابة"</span> عند الحاجة
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <span className="text-amber-400 font-bold text-xl">١</span>
                <p className="text-slate-100/90 leading-relaxed">
                  استنى المسؤول يعرض <span className="text-amber-300 font-bold">أسماء الممثلين</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-400 font-bold text-xl">٢</span>
                <p className="text-slate-100/90 leading-relaxed">
                  عرفت الفيلم؟ <span className="text-amber-300 font-bold">اضغط البازر</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-amber-400 font-bold text-xl">٣</span>
                <p className="text-slate-100/90 leading-relaxed">
                  لو مش عارف، في <span className="text-amber-300 font-bold">تلميح</span>
                </p>
              </div>
            </>
          )}
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
export default function CinemaRound({
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

  const subcategory = currentQuestion?.subcategory;
  const hasSubcategory = !!subcategory;
  const actorsRevealed = !!currentQuestion?.actorsRevealed;
  const hintRevealed = !!currentQuestion?.hintRevealed;
  const answerRevealed = !!currentQuestion?.answerRevealed;

  const canBuzz = hasSubcategory && actorsRevealed && !answerRevealed && !activePlayer;

  const handlePickSub = (sub) => {
    socket.emit('cinema_start', { roomCode, subcategory: sub });
  };

  const handleRevealActors = () => socket.emit('cinema_reveal_actors', { roomCode });
  const handleRevealHint = () => socket.emit('cinema_reveal_hint', { roomCode });
  const handleRevealAnswer = () => socket.emit('cinema_reveal_answer', { roomCode });
  const handleNext = () => socket.emit('cinema_next', { roomCode });

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0818 0%, #150d2a 40%, #1a0d28 70%, #0a0818 100%)',
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      }}
    >
      <ParticleField />
      <BackgroundGlow />

      <AnimatePresence>
        {showIntro && (
          <IntroOverlay isAdmin={isAdmin} onDismiss={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <FaFilm className="text-amber-400/70 text-sm" />
          <span className="text-amber-200/50 text-[10px] tracking-[0.3em] uppercase">سينما</span>
          <span className="w-px h-4 bg-slate-700/50" />
          <span className="text-slate-100/40 text-xs">{players.length} لاعبين</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-700/40 bg-slate-900/50 backdrop-blur-sm text-amber-300/80 text-xs tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          {roomCode}
        </div>
        <button
          onClick={onLeaveRoom}
          className="text-slate-200/30 hover:text-slate-200/80 transition-colors text-xs tracking-wide flex items-center gap-1"
        >
          <FaSignOutAlt className="text-[10px]" /> خروج
        </button>
      </div>

      {/* Headline */}
      <div className="relative z-10 text-center pt-1 pb-3 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-amber-50 text-2xl sm:text-3xl font-bold tracking-tight"
          style={{ textShadow: '0 0 25px rgba(255,180,80,0.4)' }}
        >
          {subcategory === 'history' ? '📽️ قبل ٢٠٠٠' : subcategory === 'cinema' ? '🎬 بعد ٢٠٠٠' : '🎬 سينما'}
        </motion.h1>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 gap-4 overflow-y-auto pb-6 pt-2">
        <div className="w-full flex flex-col items-center gap-4 max-w-3xl">

          {/* ═══════════════════════════════════════ */}
          {/* ADMIN — pick subcategory (if none yet) */}
          {/* ═══════════════════════════════════════ */}
          {isAdmin && !hasSubcategory && (
            <SubcategoryPicker onPick={handlePickSub} />
          )}

          {/* Player waiting for subcategory */}
          {!isAdmin && !hasSubcategory && (
            <GlassCard className="p-8 w-full max-w-md text-center">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="text-5xl mb-3"
              >
                🎬
              </motion.div>
              <p className="text-amber-100 text-lg font-bold mb-1">في انتظار المسؤول</p>
              <p className="text-amber-200/40 text-xs tracking-widest">
                سيختار فئة اللعبة قريبًا
              </p>
            </GlassCard>
          )}

          {/* ═══════════════════════════════════════ */}
          {/* MAIN SCREEN — after subcategory picked */}
          {/* ═══════════════════════════════════════ */}
          {hasSubcategory && (
            <MainScreen currentQuestion={currentQuestion} isAdmin={isAdmin} />
          )}

          {/* Hint */}
          <AnimatePresence>
            {hintRevealed && currentQuestion?.bounc && (
              <HintCard hint={currentQuestion.bounc} />
            )}
          </AnimatePresence>

          {/* Answer */}
          <AnimatePresence>
            {answerRevealed && currentQuestion?.answer && (
              <AnswerReveal answer={currentQuestion.answer} />
            )}
          </AnimatePresence>

          {/* ═══════════════════════════════════════ */}
          {/* ADMIN — reveal controls */}
          {/* ═══════════════════════════════════════ */}
          {isAdmin && hasSubcategory && (
            <div className="w-full max-w-2xl mt-3">
              <div className="flex items-center justify-center gap-3 flex-wrap">

                <RevealButton
                  icon={<FaUserTie />}
                  label="الأسماء"
                  state={actorsRevealed ? 'done' : 'active'}
                  onClick={handleRevealActors}
                  colors={{
                    from: 'rgba(225,29,72,0.6)', to: 'rgba(159,18,57,0.6)',
                    border: 'rgba(251,113,133,0.7)',
                    glow: 'rgba(251,113,133,0.5)',
                  }}
                />

                <RevealButton
                  icon={<FaLightbulb />}
                  label="تلميح"
                  state={!actorsRevealed ? 'disabled' : hintRevealed ? 'done' : 'active'}
                  onClick={handleRevealHint}
                  colors={{
                    from: 'rgba(245,158,11,0.6)', to: 'rgba(180,83,9,0.6)',
                    border: 'rgba(251,191,36,0.7)',
                    glow: 'rgba(251,191,36,0.5)',
                  }}
                />

                <RevealButton
                  icon={<FaVideo />}
                  label="الإجابة"
                  state={!actorsRevealed ? 'disabled' : answerRevealed ? 'done' : 'active'}
                  onClick={handleRevealAnswer}
                  colors={{
                    from: 'rgba(16,185,129,0.6)', to: 'rgba(6,95,70,0.6)',
                    border: 'rgba(52,211,153,0.7)',
                    glow: 'rgba(52,211,153,0.5)',
                  }}
                />

              </div>

              {/* Next button */}
              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 py-3.5 rounded-2xl font-bold text-sm tracking-wider flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(155deg, rgba(30,27,75,0.8), rgba(15,10,46,0.8))',
                  border: '1.5px solid rgba(255,200,120,0.35)',
                  color: '#fef3c7',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
              >
                <FaStepForward /> الفيلم التالي
              </motion.button>
            </div>
          )}

          {/* ═══════════════════════════════════════ */}
          {/* Buzzer status */}
          {/* ═══════════════════════════════════════ */}
          {activePlayer && (
            <GlassCard className="p-4 w-full max-w-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-slate-100 text-sm">
                  <span className="font-bold">
                    {activePlayerData?.isAdmin ? 'المسؤول' : activePlayerData?.name}
                  </span> ضغط على الزر!
                </span>
              </div>
              {isAdmin && (
                <motion.button
                  onClick={onResetBuzzer}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  style={{
                    background: 'rgba(249,115,22,0.2)',
                    border: '1.5px solid rgba(249,115,22,0.5)',
                    color: '#fed7aa',
                  }}
                >
                  <FaTimesCircle /> إرجاع البازر
                </motion.button>
              )}
            </GlassCard>
          )}

          {/* Buzzer */}
          {hasSubcategory && actorsRevealed && !answerRevealed && !activePlayer && (
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
        </div>
      </div>
    </div>
  );
}