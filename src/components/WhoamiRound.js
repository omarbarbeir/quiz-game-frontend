// components/WhoamiRound.jsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStepForward, FaSignOutAlt, FaCrown, FaPlus, FaMinus,
  FaEye, FaEyeSlash, FaRandom, FaRedo, FaUsers, FaImage
} from 'react-icons/fa';

/* ─────────────────────────────────────────────
   Rose/Purple Glass primitives
───────────────────────────────────────────── */
const glassBase = `
  relative overflow-hidden
  bg-fuchsia-950/20 backdrop-blur-md
  border border-fuchsia-500/20
  shadow-[inset_0_1px_0_rgba(255,150,220,0.08),0_8px_32px_rgba(0,0,0,0.55)]
  rounded-2xl
`;

function GlassCard({ children, className = '' }) {
  return (
    <div className={`${glassBase} ${className}`}>
      <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-fuchsia-300/[0.07] to-transparent rotate-[25deg] blur-sm" />
      </div>
      {children}
    </div>
  );
}

function NeonButton({ children, onClick, disabled, variant = 'default', className = '' }) {
  const vars = {
    default: 'border-fuchsia-700/40 text-fuchsia-100/90 hover:border-fuchsia-400/70 hover:bg-fuchsia-950/30',
    distribute: 'border-fuchsia-400/60 text-fuchsia-100 hover:border-fuchsia-300/80 bg-gradient-to-r from-fuchsia-950/50 to-rose-950/50',
    reset: 'border-orange-500/50 text-orange-200 hover:border-orange-400/70 bg-orange-950/25',
    next: 'border-violet-400/60 text-violet-100 hover:border-violet-300/80 bg-gradient-to-r from-violet-950/40 to-fuchsia-950/40',
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
        bg-fuchsia-950/20 backdrop-blur-md border
        shadow-[inset_0_1px_0_rgba(255,150,220,0.08),0_4px_16px_rgba(0,0,0,0.45)]
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
   Particles
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
    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.3 + 0.3,
      dx: (Math.random() - 0.5) * 0.26, dy: (Math.random() - 0.5) * 0.26,
      alpha: Math.random() * 0.5 + 0.15,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.dx; d.y += d.dy;
        if (d.x < 0) d.x = canvas.width; if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height; if (d.y > canvas.height) d.y = 0;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        const isPink = Math.random() > 0.5;
        ctx.fillStyle = isPink ? `rgba(255,130,200,${d.alpha})` : `rgba(200,120,255,${d.alpha})`;
        ctx.fill();
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
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 25%, rgba(10,0,15,0.82) 100%)' }} />
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)' }} />
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
      <p className="text-fuchsia-300/50 text-[10px] tracking-[0.3em] uppercase mb-3">الترتيب</p>
      <div className="space-y-2">
        {sorted.map((p, i) => (
          <div key={p.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-fuchsia-200/40 text-xs w-4 font-mono shrink-0">{i + 1}</span>
              <span className="text-fuchsia-50/90 text-sm flex items-center gap-1 truncate">
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
                  : 'border-fuchsia-900/40 text-fuchsia-100/40'
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
      style={{ background: 'rgba(10,2,15,0.94)', backdropFilter: 'blur(12px)' }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="max-w-lg text-center px-6"
      >
        <div className="text-7xl mb-6">🖼️</div>
        <h2 className="text-fuchsia-50 text-3xl font-bold mb-6">أنا مين؟</h2>

        <div className="space-y-4 text-right bg-fuchsia-950/30 border border-fuchsia-700/30 rounded-2xl p-6 mb-6">
          {isAdmin ? (
            <>
              <div className="flex items-start gap-3">
                <span className="text-fuchsia-400 font-bold text-xl">١</span>
                <p className="text-fuchsia-100/90 leading-relaxed">
                  اختر الفئة (أكل / ممثلين / كورة) واضغط <span className="text-fuchsia-300 font-bold">توزيع</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-fuchsia-400 font-bold text-xl">٢</span>
                <p className="text-fuchsia-100/90 leading-relaxed">
                  كل لاعب هيستلم صورة <span className="text-fuchsia-300 font-bold">سرية</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-fuchsia-400 font-bold text-xl">٣</span>
                <p className="text-fuchsia-100/90 leading-relaxed">
                  وزّع نقاط بـ <span className="text-fuchsia-300 font-bold">+ / -</span> حسب الإجابات
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <span className="text-fuchsia-400 font-bold text-xl">١</span>
                <p className="text-fuchsia-100/90 leading-relaxed">
                  هتستلم صورة <span className="text-fuchsia-300 font-bold">سرية</span> على موبايلك
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-fuchsia-400 font-bold text-xl">٢</span>
                <p className="text-fuchsia-100/90 leading-relaxed">
                  لفّ موبايلك عشان محدش يشوف، واسأل صحابك
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-fuchsia-400 font-bold text-xl">٣</span>
                <p className="text-fuchsia-100/90 leading-relaxed">
                  خمّن أنت مين / إيه اللي في الصورة
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
   MAIN
───────────────────────────────────────────── */
export default function WhoamiRound({
  currentQuestion,
  players,
  playerId,
  isAdmin,
  socket,
  roomCode,
  onLeaveRoom,
  onScoreChange,
}) {
  const [showIntro, setShowIntro] = useState(true);
  const [selectedSub, setSelectedSub] = useState('food');
  const [myImage, setMyImage] = useState(null);
  const [distributed, setDistributed] = useState(false);

  const publicUrl = process.env.PUBLIC_URL || '';

  // استقبال صورة اللاعب من السيرفر
  useEffect(() => {
    if (!socket) return;

    const onYourImage = (data) => {
      if (data.playerId === playerId) {
        setMyImage(data.question);
        setDistributed(true);
      }
    };

    const onDistributed = () => {
      setDistributed(true);
    };

    const onResetDone = () => {
      setMyImage(null);
      setDistributed(false);
    };

    socket.on('whoami_your_image', onYourImage);
    socket.on('whoami_distributed', onDistributed);
    socket.on('whoami_reset_done', onResetDone);

    return () => {
      socket.off('whoami_your_image', onYourImage);
      socket.off('whoami_distributed', onDistributed);
      socket.off('whoami_reset_done', onResetDone);
    };
  }, [socket, playerId]);

  const handleDistribute = () => {
    socket.emit('whoami_distribute', { roomCode, subcategory: selectedSub });
  };

  const handleReset = () => {
    socket.emit('whoami_reset', { roomCode });
  };

  const subcategories = [
    { id: 'food',     name: 'أكل',    icon: '🍽️' },
    { id: 'actors',   name: 'ممثلين', icon: '🎬' },
    { id: 'football', name: 'كورة',   icon: '⚽' },
  ];

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #12030f 0%, #1e0620 45%, #2a0828 75%, #12030f 100%)',
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

      <div
        className="pointer-events-none fixed"
        style={{
          width: 650, height: 650, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(220,80,180,0.15) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          filter: 'blur(50px)',
        }}
      />

      {/* top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <FaImage className="text-fuchsia-400/60 text-sm" />
          <span className="text-fuchsia-200/40 text-[10px] tracking-[0.3em] uppercase">أنا مين</span>
          <span className="w-px h-4 bg-fuchsia-800/40" />
          <span className="text-fuchsia-100/40 text-xs">{players.length} لاعبين</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-fuchsia-700/40 bg-fuchsia-950/40 backdrop-blur-sm text-fuchsia-300/80 text-xs tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
          {roomCode}
        </div>
        <button
          onClick={onLeaveRoom}
          className="text-fuchsia-200/25 hover:text-fuchsia-200/70 transition-colors text-xs tracking-wide flex items-center gap-1"
        >
          <FaSignOutAlt className="text-[10px]" /> خروج
        </button>
      </div>

      {/* headline */}
      <div className="relative z-10 text-center pt-3 pb-4 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-fuchsia-50 text-3xl font-bold tracking-tight mb-1"
          style={{ letterSpacing: '-0.01em', textShadow: '0 0 20px rgba(220,80,180,0.35)' }}
        >
          أنا مين؟
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

          {/* ═══════ ADMIN: distribute controls (قبل التوزيع) ═══════ */}
          {isAdmin && !distributed && (
            <GlassCard className="p-6 w-full max-w-md">
              <p className="text-fuchsia-300/60 text-[10px] tracking-[0.3em] uppercase text-center mb-4">
                اختر الفئة ووزّع الصور
              </p>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {subcategories.map(sub => (
                  <motion.button
                    key={sub.id}
                    onClick={() => setSelectedSub(sub.id)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`
                      py-3 rounded-xl border font-semibold text-sm transition-all
                      ${selectedSub === sub.id
                        ? 'border-fuchsia-400/80 bg-fuchsia-900/40 text-fuchsia-100 shadow-[0_0_20px_rgba(220,80,180,0.3)]'
                        : 'border-fuchsia-800/40 bg-fuchsia-950/20 text-fuchsia-200/60 hover:border-fuchsia-600/60'}
                    `}
                  >
                    <div className="text-2xl mb-1">{sub.icon}</div>
                    {sub.name}
                  </motion.button>
                ))}
              </div>

              <NeonButton
                variant="distribute"
                onClick={handleDistribute}
                className="w-full !py-3.5 !text-sm"
              >
                <FaRandom /> وزّع الصور على اللاعبين
              </NeonButton>
            </GlassCard>
          )}

          {/* ═══════ After distribute: admin reset + info ═══════ */}
          {isAdmin && distributed && (
            <GlassCard className="p-4 w-full max-w-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaUsers className="text-fuchsia-400" />
                <span className="text-fuchsia-100 text-sm">
                  تم توزيع الصور على <span className="font-bold">{players.length}</span> لاعبين
                </span>
              </div>
              <NeonButton variant="reset" onClick={handleReset} className="!py-2 !px-3">
                <FaRedo /> جولة جديدة
              </NeonButton>
            </GlassCard>
          )}

          {/* ═══════ Player / Admin own image ═══════ */}
            {distributed && myImage && (
            <GlassCard className="p-6 w-full max-w-md text-center">
                <p className="text-fuchsia-300/50 text-[10px] tracking-[0.3em] uppercase mb-4">
                صورتك السرية 🤫
                </p>

                <div className="mb-4">
                <img
                    src={`${publicUrl}${myImage.image}`}
                    alt="Your secret"
                    className="w-full max-h-[40vh] object-contain rounded-xl shadow-lg"
                    style={{ background: 'rgba(0,0,0,0.3)' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
                </div>

                {/* ✅ الإجابة دائمًا ظاهرة */}
                <div className="pt-3 border-t border-violet-500/30">
                <p className="text-violet-300/60 text-[10px] tracking-widest uppercase mb-2">
                    الإجابة
                </p>
                <p
                    className="text-violet-100 text-4xl font-bold"
                    style={{ textShadow: '0 0 20px rgba(180,120,255,0.5)' }}
                >
                    {myImage.answer}
                </p>
                </div>
            </GlassCard>
            )}

          {/* ═══════ Player waiting state (not distributed yet) ═══════ */}
          {!isAdmin && !distributed && (
            <GlassCard className="p-10 w-full max-w-md text-center">
              <div className="flex justify-center mb-5">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle, rgba(220,80,180,0.25), rgba(160,80,255,0.1))',
                    border: '2px solid rgba(255,150,220,0.35)',
                    boxShadow: '0 0 60px rgba(220,80,180,0.3)',
                  }}
                >
                  <FaImage className="text-3xl text-fuchsia-300" />
                </motion.div>
              </div>
              <p className="text-fuchsia-100 text-lg font-bold mb-1">⏳ في انتظار التوزيع</p>
              <p className="text-fuchsia-200/40 text-xs tracking-widest">
                الأدمن هيوزّع الصور قريب...
              </p>
            </GlassCard>
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