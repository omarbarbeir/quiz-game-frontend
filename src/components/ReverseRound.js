// components/ReverseRound.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStepForward, FaSignOutAlt, FaLock, FaCrown, FaRedo,
  FaPlus, FaMinus, FaKeyboard, FaBolt
} from 'react-icons/fa';

/* ─────────────────────────────────────────────
   Cyber-Neon Glass primitives
───────────────────────────────────────────── */
const glassBase = `
  relative overflow-hidden
  bg-cyan-950/20 backdrop-blur-md
  border border-cyan-500/20
  shadow-[inset_0_1px_0_rgba(150,240,255,0.08),0_8px_32px_rgba(0,0,0,0.55)]
  rounded-2xl
`;

function GlassCard({ children, className = '' }) {
  return (
    <div className={`${glassBase} ${className}`}>
      <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-cyan-300/[0.07] to-transparent rotate-[25deg] blur-sm" />
      </div>
      {children}
    </div>
  );
}

function NeonButton({ children, onClick, disabled, variant = 'default', className = '' }) {
  const vars = {
    default: 'border-cyan-700/40 text-cyan-100/90 hover:border-cyan-400/70 hover:bg-cyan-950/30',
    next:    'border-cyan-400/60 text-cyan-100 hover:border-cyan-300/80 bg-gradient-to-r from-cyan-950/40 to-violet-950/40',
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
        bg-cyan-950/20 backdrop-blur-md border
        shadow-[inset_0_1px_0_rgba(150,240,255,0.08),0_4px_16px_rgba(0,0,0,0.45)]
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
   Particles / Scan overlay
───────────────────────────────────────────── */
function ParticleField() {
  const canvasRef = React.useRef(null);
  React.useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const dots = Array.from({ length: 65 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.3 + 0.3,
      dx: (Math.random() - 0.5) * 0.28, dy: (Math.random() - 0.5) * 0.28,
      alpha: Math.random() * 0.5 + 0.15,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.dx; d.y += d.dy;
        if (d.x < 0) d.x = canvas.width; if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height; if (d.y > canvas.height) d.y = 0;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        const isCyan = Math.random() > 0.5;
        ctx.fillStyle = isCyan ? `rgba(80,220,255,${d.alpha})` : `rgba(180,120,255,${d.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" style={{ opacity: 0.6 }} />;
}

function ScanOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 25%, rgba(0,0,10,0.82) 100%)' }} />
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)' }} />
      <motion.div
        className="absolute left-0 right-0 h-[2px]"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(80,220,255,0.5), transparent)' }}
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />
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
      <p className="text-cyan-300/50 text-[10px] tracking-[0.3em] uppercase mb-3">الترتيب</p>
      <div className="space-y-2">
        {sorted.map((p, i) => (
          <div key={p.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-cyan-200/40 text-xs w-4 font-mono shrink-0">{i + 1}</span>
              <span className="text-cyan-50/90 text-sm flex items-center gap-1 truncate">
                {p.isAdmin && <FaCrown className="text-cyan-400 text-[10px] shrink-0" />}
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
                  ? 'border-cyan-500/60 text-cyan-200 bg-cyan-950/50'
                  : 'border-cyan-900/40 text-cyan-100/40'
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
   Scrambled letters — ADMIN (RTL — يقرا من اليمين للشمال)
───────────────────────────────────────────── */
function ScrambledLetters({ text }) {
  const letters = (text || '').split(' ').filter(Boolean);
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 my-4" dir="rtl">
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: -10, rotate: 8 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 22 }}
          className="inline-flex items-center justify-center w-14 h-16 sm:w-16 sm:h-20 rounded-xl text-3xl sm:text-4xl font-bold select-none"
          style={{
            background: 'linear-gradient(180deg, rgba(80,220,255,0.18), rgba(120,80,255,0.18))',
            border: '1px solid rgba(120,220,255,0.35)',
            color: '#e8fbff',
            textShadow: '0 0 12px rgba(120,220,255,0.7)',
            boxShadow: 'inset 0 1px 0 rgba(180,240,255,0.18), 0 4px 14px rgba(0,0,0,0.5)',
          }}
        >
          {letter}
        </motion.span>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Buzzer — for players only
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
            background: 'linear-gradient(90deg, rgba(80,220,255,0.15), rgba(180,120,255,0.55), rgba(80,220,255,0.15))',
            backgroundSize: '200% 100%',
          }}
        />
      )}
      <div className="relative rounded-2xl p-[1px]"
        style={{ background: 'linear-gradient(180deg, rgba(120,220,255,0.15), rgba(0,0,0,0.4))' }}
      >
        <button
          onClick={onBuzzerPress}
          disabled={buzzerLocked || !canBuzz || activePlayer}
          className={`w-full py-10 rounded-2xl text-3xl font-bold flex items-center justify-center gap-3 transition-all
            ${isActivePlayer
              ? 'bg-gradient-to-br from-cyan-400 to-violet-500 text-cyan-950 cursor-not-allowed'
              : activePlayer
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : buzzerLocked || !canBuzz
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-br from-cyan-600 to-violet-700 text-white hover:from-cyan-500 hover:to-violet-600 active:scale-[0.98] shadow-[0_0_30px_rgba(100,180,255,0.35)]'}
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
   Intro overlay
───────────────────────────────────────────── */
function IntroOverlay({ onDismiss, isAdmin }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
      style={{ background: 'rgba(2,4,12,0.94)', backdropFilter: 'blur(12px)' }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="max-w-lg text-center px-6"
      >
        <div className="text-7xl mb-6">🔤</div>
        <h2 className="text-cyan-50 text-3xl font-bold mb-6">الكلمات المعكوسة</h2>

        <div className="space-y-4 text-right bg-cyan-950/30 border border-cyan-700/30 rounded-2xl p-6 mb-6">
          {isAdmin ? (
            <>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold text-xl">١</span>
                <p className="text-cyan-100/90 leading-relaxed">
                  هتشوف <span className="text-cyan-300 font-bold">الحروف المقلوبة</span> كبيرة في النص
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold text-xl">٢</span>
                <p className="text-cyan-100/90 leading-relaxed">
                  اقرأ الحروف للاعبين بصوت واضح
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold text-xl">٣</span>
                <p className="text-cyan-100/90 leading-relaxed">
                  لما حد يجاوب صح → اديله نقطة بـ <span className="text-cyan-300 font-bold">+</span>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold text-xl">١</span>
                <p className="text-cyan-100/90 leading-relaxed">
                  اسمع الحروف المقلوبة من المسؤول
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold text-xl">٢</span>
                <p className="text-cyan-100/90 leading-relaxed">
                  رتّب الحروف في دماغك واكتشف <span className="text-violet-300 font-bold">الكلمة الصح</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold text-xl">٣</span>
                <p className="text-cyan-100/90 leading-relaxed">
                  اضغط على <span className="text-cyan-300 font-bold">البازر</span> بأسرع وقت وجاوب
                </p>
              </div>
            </>
          )}
        </div>

        <motion.p
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-cyan-300/70 text-sm"
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
export default function ReverseRound({
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
  const canBuzz = !!currentQuestion;

  const handleNext = () => {
    socket.emit('reverse_next', { roomCode });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #030616 0%, #0a0f2c 45%, #130a2c 75%, #030616 100%)',
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      }}
    >
      <ParticleField />
      <ScanOverlay />

      <AnimatePresence>
        {showIntro && (
          <IntroOverlay
            isAdmin={isAdmin}
            onDismiss={() => setShowIntro(false)}
          />
        )}
      </AnimatePresence>

      {/* glow */}
      <div
        className="pointer-events-none fixed"
        style={{
          width: 650, height: 650, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(120,100,255,0.15) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          filter: 'blur(50px)',
        }}
      />

      {/* top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <FaKeyboard className="text-cyan-400/60 text-sm" />
          <span className="text-cyan-200/40 text-[10px] tracking-[0.3em] uppercase">كلمات معكوسة</span>
          <span className="w-px h-4 bg-cyan-800/40" />
          <span className="text-cyan-100/40 text-xs">{players.length} لاعبين</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-700/40 bg-cyan-950/40 backdrop-blur-sm text-cyan-300/80 text-xs tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          {roomCode}
        </div>
        <button
          onClick={onLeaveRoom}
          className="text-cyan-200/25 hover:text-cyan-200/70 transition-colors text-xs tracking-wide flex items-center gap-1"
        >
          <FaSignOutAlt className="text-[10px]" /> خروج
        </button>
      </div>

      {/* headline */}
      <div className="relative z-10 text-center pt-3 pb-4 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-cyan-50 text-3xl font-bold tracking-tight mb-1"
          style={{ letterSpacing: '-0.01em', textShadow: '0 0 20px rgba(80,200,255,0.35)' }}
        >
          الكلمات المعكوسة
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-cyan-200/30 text-[10px] tracking-[0.35em] uppercase"
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

          {/* ═══════ ADMIN VIEW ═══════ */}
          {isAdmin && (
            <>
              {/* Scrambled letters — big for admin to read aloud (RTL) */}
              <GlassCard className="p-8 w-full max-w-2xl">
                <div className="text-center mb-2">
                  <p className="text-cyan-300/50 text-[10px] tracking-[0.4em] uppercase">
                    ← اقرأ الحروف بصوت واضح
                  </p>
                </div>

                <ScrambledLetters text={currentQuestion?.text || ''} />
              </GlassCard>

              {/* Answer — always visible for admin */}
              {currentQuestion?.answer && (
                <GlassCard className="p-5 w-full max-w-2xl">
                  <p className="text-violet-300/50 text-[10px] tracking-[0.3em] uppercase text-center mb-1">
                    الإجابة (للمسؤول فقط)
                  </p>
                  <p
                    className="text-violet-100 text-3xl font-bold text-center"
                    style={{ textShadow: '0 0 20px rgba(180,120,255,0.5)' }}
                  >
                    {currentQuestion.answer}
                  </p>
                </GlassCard>
              )}

              {/* Buzzer status + reset — للأدمن بس */}
              {activePlayer && (
                <div className="w-full max-w-md">
                  <GlassCard className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-cyan-100 text-sm">
                        <span className="font-bold">
                          {activePlayerData?.isAdmin ? 'المسؤول' : activePlayerData?.name}
                        </span> ضغط على الزر!
                      </span>
                    </div>
                    <NeonButton variant="reset" onClick={onResetBuzzer} className="!py-2 !px-3">
                      <FaRedo /> إرجاع البازر
                    </NeonButton>
                  </GlassCard>
                </div>
              )}

              {/* Next word */}
              <div className="w-full max-w-md">
                <NeonButton variant="next" onClick={handleNext} className="w-full !py-3.5 !text-sm">
                  <FaStepForward /> الكلمة التالية
                </NeonButton>
              </div>
            </>
          )}

          {/* ═══════ PLAYER VIEW ═══════ */}
          {!isAdmin && (
            <GlassCard className="p-10 w-full max-w-md text-center">
              <div className="flex justify-center mb-5">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle, rgba(80,220,255,0.25), rgba(120,80,255,0.1))',
                    border: '2px solid rgba(120,220,255,0.35)',
                    boxShadow: '0 0 60px rgba(100,180,255,0.3)',
                  }}
                >
                  <FaKeyboard className="text-3xl text-cyan-300" />
                </motion.div>
              </div>
              <p className="text-cyan-100 text-lg font-bold mb-1">🎧 اسمع المسؤول</p>
              <p className="text-cyan-200/40 text-xs tracking-widest">
                ركّز في الحروف واضغط البازر لما تعرف الكلمة
              </p>
            </GlassCard>
          )}

          {/* Buzzer — للاعبين بس (الأدمن مش محتاجه) */}
          {!isAdmin && (
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