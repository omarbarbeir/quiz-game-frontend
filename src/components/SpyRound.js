import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────
   Liquid-glass primitives
───────────────────────────────────────────── */
const glassBase = `
  relative overflow-hidden
  bg-white/5 backdrop-blur-md
  border border-white/10
  shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_32px_rgba(0,0,0,0.45)]
  rounded-2xl
`;

function GlassCard({ children, className = '', onClick, disabled }) {
  return (
    <motion.div
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: 1.018, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.975 }}
      transition={{ type: 'spring', stiffness: 340, damping: 26 }}
      className={`${glassBase} ${onClick && !disabled ? 'cursor-pointer' : ''} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/10 to-transparent rotate-[25deg] blur-sm" />
      </div>
      {children}
    </motion.div>
  );
}

function GlassButton({ children, onClick, disabled, variant = 'default', className = '' }) {
  const vars = {
    default: 'border-white/15 text-white/90',
    danger:  'border-red-500/40 text-red-300 hover:border-red-400/60',
    accent:  'border-red-700/50 text-red-200 hover:border-red-500/60 bg-red-900/20',
    green:   'border-emerald-700/50 text-emerald-200 hover:border-emerald-500/60 bg-emerald-900/20',
  };
  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.04, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={`
        relative overflow-hidden px-6 py-3 rounded-xl font-semibold text-sm tracking-wide
        bg-white/5 backdrop-blur-md border
        shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.35)]
        transition-colors duration-200
        ${vars[variant]}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <span className="pointer-events-none absolute inset-0 rounded-xl overflow-hidden">
        <span className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/10 to-transparent rotate-[30deg] blur-[2px]" />
      </span>
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

/* ─────────────────────────────────────────────
   Particles / Noir / Badge
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
    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.3,
      dx: (Math.random() - 0.5) * 0.25, dy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.5 + 0.15,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      dots.forEach(d => {
        d.x += d.dx; d.y += d.dy;
        if (d.x < 0) d.x = canvas.width; if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height; if (d.y > canvas.height) d.y = 0;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,60,60,${d.alpha})`; ctx.fill();
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
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 30%, rgba(0,0,0,0.72) 100%)' }} />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)' }} />
    </div>
  );
}

function RoomBadge({ roomCode }) {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-red-800/50 bg-red-950/30 backdrop-blur-sm text-red-300/80 text-xs tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      {roomCode}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Voting action bar
───────────────────────────────────────────── */
function VotingActionBar({ socket, roomCode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="relative z-20 w-full flex justify-center px-6 pt-2 pb-1"
    >
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md"
        style={{ background: 'rgba(10,0,0,0.55)' }}
      >
        <GlassButton variant="accent" onClick={() => socket.emit('start_spy_voting', roomCode)}>
          🗳️ فتح التصويت
        </GlassButton>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   ScoreStrip — كل اللاعبين بما فيهم الأدمن (👑)
───────────────────────────────────────────── */
function ScoreStrip({ players }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return (
    <GlassCard className="px-5 py-3 max-w-sm w-full">
      <p className="text-white/30 text-xs tracking-widest uppercase mb-3">الترتيب</p>
      <div className="space-y-2">
        {sorted.map((p, i) => (
          <div key={p.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white/25 text-xs w-4">{i + 1}</span>
              <span className="text-white/75 text-sm flex items-center gap-1">
                {p.isAdmin && <span className="text-amber-400">👑</span>}
                {p.name}
              </span>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                i === 0 ? 'border-amber-600/50 text-amber-300 bg-amber-950/30' : 'border-white/10 text-white/40'
              }`}
            >
              {p.score} نقطة
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

/* ─────────────────────────────────────────────
   WordCard — نفس التصميم للكل (الأدمن لاعب)
───────────────────────────────────────────── */
function WordCard({ text, isSpy }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <GlassCard className="p-8 text-center max-w-sm w-full mx-auto select-none">
      <p className="text-white/90 text-xs tracking-widest uppercase mb-6">الكلمة السرية</p>
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="cursor-pointer"
            onClick={() => setRevealed(true)}
          >
            <div className="w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center border border-white/10 bg-white/5">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            </div>
            <p className="text-white/50 text-sm">اضغط لإظهار كلمتك</p>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, scale: 0.85, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <motion.p
              initial={{ letterSpacing: '0.5em', opacity: 0 }}
              animate={{ letterSpacing: '0.05em', opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-white text-4xl font-bold tracking-wide"
            >
              {text}
            </motion.p>
            {isSpy ? (
              <div className="mt-4 flex flex-col items-center gap-1">
                <p className="text-white/80 text-xs tracking-widest">لا تقولها لأحد 🤫</p>
              </div>
            ) : (
              <p className="text-white/80 text-xs mt-4">لا تقولها لحد 🤫</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

/* ─────────────────────────────────────────────
   VOTE MODAL — Noir + End Voting Button
───────────────────────────────────────────── */
function VoteModal({ players, playerId, onVote, votedFor, voteProgress, onEndVoting }) {
  const others   = players.filter(p => p.id !== playerId);
  const allVoted = !!voteProgress?.allVoted;
  const voted    = voteProgress?.voted ?? 0;
  const total    = voteProgress?.total ?? players.length;
  const progress = total > 0 ? (voted / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(12px)' }}
    >
      <div
        className="pointer-events-none absolute"
        style={{
          width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(180,20,20,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)' }}
      />

      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        className="relative z-10 w-full max-w-md"
      >
        <GlassCard className="p-7">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-800/50 bg-red-950/30 text-red-300/80 text-[10px] tracking-[0.3em] uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              التصويت جاري
            </div>
            <h2 className="text-white text-2xl font-bold mb-1" style={{ letterSpacing: '-0.01em' }}>
              مين الجاسوس؟
            </h2>
            <p className="text-white/35 text-xs tracking-widest">اختر لاعبًا واحدًا فقط</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/40 text-xs tracking-widest">الأصوات</span>
              <span className="text-white/60 text-xs font-mono">{voted} / {total}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                className="h-full bg-gradient-to-r from-red-800 via-red-600 to-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {others.map((p, i) => {
              const isPicked = votedFor === p.id;
              return (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                  whileHover={votedFor ? {} : { scale: 1.03, y: -1 }}
                  whileTap={votedFor ? {} : { scale: 0.97 }}
                  onClick={votedFor ? undefined : () => onVote(p.id)}
                  disabled={!!votedFor}
                  className={`
                    relative overflow-hidden px-4 py-3.5 rounded-xl
                    border backdrop-blur-md text-sm font-semibold
                    transition-colors duration-200
                    ${isPicked
                      ? 'border-red-500/60 bg-red-950/40 text-red-200 shadow-[0_0_20px_rgba(180,20,20,0.25)]'
                      : 'border-white/10 bg-white/5 text-white/80 hover:border-white/25'}
                    ${votedFor && !isPicked ? 'opacity-30' : ''}
                    ${votedFor ? 'cursor-not-allowed' : ''}
                  `}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isPicked && <span className="text-red-400">●</span>}
                    {p.isAdmin && <span className="text-amber-400">👑</span>}
                    {p.name}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {votedFor && (
              <motion.p
                key="confirmed"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-center text-red-400/70 text-xs tracking-widest mb-4"
              >
                ✓ تم تسجيل تصويتك
              </motion.p>
            )}
          </AnimatePresence>

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-5" />

          <GlassButton
            variant={allVoted ? 'danger' : 'default'}
            disabled={!allVoted}
            onClick={onEndVoting}
            className="w-full justify-center !py-4"
          >
            {allVoted
              ? '🏁 إنهاء التصويت وإعلان النتيجة'
              : `⏳ بانتظار باقي اللاعبين (${voted}/${total})`}
          </GlassButton>

          <p className="text-center text-white/25 text-[10px] tracking-widest mt-3">
            {allVoted
              ? 'الجميع صوّت — يمكنك الإعلان الآن'
              : 'الزرار هيتفعّل لما الكل يصوّت'}
          </p>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   RESULT MODAL — Noir + SPYIMAGES الأصلية
───────────────────────────────────────────── */
function ResultModal({ spyResult, players, onClose, onNewRound, isAdmin }) {
  const spyName = players.find(p => p.id === spyResult.spyId)?.name ?? '—';
  const caught  = spyResult.spyCaught;
  const publicUrl = process.env.PUBLIC_URL || '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(14px)' }}
    >
      <div
        className="pointer-events-none absolute"
        style={{
          width: 560, height: 560, borderRadius: '50%',
          background: caught
            ? 'radial-gradient(circle, rgba(200,20,20,0.22) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(60,60,80,0.18) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)' }}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="relative z-10 w-full max-w-md"
      >
        <GlassCard className="p-7">
          {/* ✅ صورة النتيجة الأصلية — نفس المسار */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 240, damping: 16, delay: 0.1 }}
            className="flex justify-center mb-4"
          >
            <img
              src={caught
                ? `${publicUrl}/SPYIMAGES/spy-caught.png`
                : `${publicUrl}/SPYIMAGES/spy-escaped.png`}
              alt={caught ? 'Caught' : 'Escaped'}
              className="w-[420px] max-w-full h-[180px] object-contain drop-shadow-lg"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </motion.div>

          <div className="text-center mb-6">
            <div
              className={`inline-block px-3 py-1 rounded-full border text-[10px] tracking-[0.3em] uppercase mb-3 ${
                caught
                  ? 'border-red-700/50 bg-red-950/40 text-red-300/80'
                  : 'border-white/15 bg-white/5 text-white/50'
              }`}
            >
              {caught ? 'تم اكتشافه' : 'فرّ بنجاح'}
            </div>
            <h2
              className={`text-2xl font-bold mb-2 ${caught ? 'text-red-400' : 'text-white/75'}`}
              style={{ letterSpacing: '-0.01em' }}
            >
              {caught ? 'الجاسوس اتكشف!' : 'الجاسوس هرب!'}
            </h2>
            <p className="text-white/50 text-sm">
              الجاسوس كان: <span className="text-white font-bold">{spyName}</span>
            </p>
            <p className="text-white/25 text-[11px] tracking-widest mt-2">
              {caught ? 'اللي صوّت صح بياخد نقطة' : 'الجاسوس بس اللي بياخد نقطة'}
            </p>
          </div>

          <div className="space-y-2 mb-6 max-h-56 overflow-y-auto pr-1" dir="rtl">
            {spyResult.roundScores?.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className={`flex justify-between items-center px-4 py-2.5 rounded-xl border ${
                  s.pointsEarned > 0
                    ? 'bg-red-950/40 border-red-800/40'
                    : 'bg-white/[0.03] border-white/[0.07]'
                }`}
              >
                <span className="text-white/85 text-sm flex items-center gap-2">
                  {s.isSpy && <span className="text-base">🕵️</span>}
                  {s.isAdmin && <span className="text-amber-400">👑</span>}
                  {s.name}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    s.pointsEarned > 0
                      ? 'bg-red-900/70 text-red-300'
                      : 'bg-white/5 text-white/25'
                  }`}
                >
                  {s.pointsEarned > 0 ? '+1 نقطة' : '٠'}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {isAdmin && (
              <GlassButton
                variant="green"
                onClick={onNewRound}
                className="w-full justify-center !py-3.5"
              >
                🔄 جولة جديدة
              </GlassButton>
            )}
            <GlassButton
              onClick={onClose}
              className="w-full justify-center !py-3"
            >
              إغلاق
            </GlassButton>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export default function SpyRound({
  currentQuestion,
  players,
  playerId,
  isAdmin,
  socket,
  roomCode,
  showSpyVoteModal,
  votedFor,
  spyResult,
  onVote,
  onCloseResult,
  onLeaveRoom,
  onNewRound,
  onBackToCategories,
}) {
  const isSpy    = !!currentQuestion?.isSpy;
  const wordText = currentQuestion?.text ?? '';
  const showVotingBar = !!currentQuestion;

  const [voteProgress, setVoteProgress] = useState({ voted: 0, total: 0, allVoted: false });

  useEffect(() => {
    if (showSpyVoteModal) {
      setVoteProgress({
        voted: 0,
        total: players.length,
        allVoted: false,
      });
    } else {
      setVoteProgress({ voted: 0, total: 0, allVoted: false });
    }
  }, [showSpyVoteModal, players.length]);

  useEffect(() => {
    if (!socket) return;
    const onProgress = (data) => setVoteProgress(data);
    socket.on('spy_vote_progress', onProgress);
    return () => socket.off('spy_vote_progress', onProgress);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handleBackToLobby = () => {
      if (onBackToCategories) onBackToCategories();
    };

    socket.on('spy_back_to_lobby', handleBackToLobby);
    return () => {
      socket.off('spy_back_to_lobby', handleBackToLobby);
    };
  }, [socket, onBackToCategories]);

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #110808 40%, #150505 70%, #0d0d0d 100%)',
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      }}
    >
      <ParticleField />
      <NoirOverlay />

      <div
        className="pointer-events-none fixed"
        style={{
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(180,20,20,0.12) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-white/20 text-xs tracking-widest uppercase">جاسوس</span>
          <span className="w-px h-4 bg-white/10" />
          <span className="text-white/45 text-xs">{players.length} لاعبين</span>
        </div>
        <RoomBadge roomCode={roomCode} />
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => {
                // ✅ نرسل للسيرفر يبث لكل اللاعبين
                socket.emit('spy_cleanup', { roomCode });
                // الأدمن نفسه سيستقبل spy_back_to_lobby وسينفّذ onBackToCategories
              }}
              className="text-white/25 hover:text-white/60 transition-colors text-xs tracking-wide"
            >
              ← الفئات
            </button>
          )}
          <button
            onClick={onLeaveRoom}
            className="text-white/25 hover:text-white/60 transition-colors text-xs tracking-wide"
          >
            خروج ↗
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showVotingBar && (
          <VotingActionBar socket={socket} roomCode={roomCode} />
        )}
      </AnimatePresence>

      <div className="relative z-10 text-center pt-3 pb-5 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-white/90 text-3xl font-bold tracking-tight mb-1"
          style={{ letterSpacing: '-0.01em' }}
        >
          جولة الجاسوس
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-white/28 text-xs tracking-widest"
        >
          {isAdmin ? 'لوحة التحكم' : 'شاشة اللاعب'}
        </motion.p>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 gap-5 overflow-y-auto pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full flex flex-col items-center gap-5"
        >
          <WordCard text={wordText} isSpy={isSpy} />
          <ScoreStrip players={players} />
        </motion.div>
      </div>

      <AnimatePresence>
        {showSpyVoteModal && (
          <VoteModal
            players={players}
            playerId={playerId}
            onVote={onVote}
            votedFor={votedFor}
            voteProgress={voteProgress}
            onEndVoting={() => socket.emit('end_spy_voting', roomCode)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {spyResult && (
          <ResultModal
            spyResult={spyResult}
            players={players}
            onClose={onCloseResult}
            isAdmin={isAdmin}
            onNewRound={() => {
              onCloseResult();
              if (onNewRound) onNewRound();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}