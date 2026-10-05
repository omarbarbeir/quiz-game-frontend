// components/FlagsRound.jsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStepForward, FaSignOutAlt, FaCrown, FaPlus, FaMinus,
  FaLock, FaBolt, FaFlag, FaEye, FaPaperPlane,
  FaCheck, FaTimes, FaSearch, FaGlobe, FaTimesCircle
} from 'react-icons/fa';

// ─────────────────────────────────────────────
//  normalize — للـ autocomplete
// ─────────────────────────────────────────────
function normalizeAr(str) {
  if (!str) return '';
  let s = str.toString().replace(/[\u064B-\u065F\u0670\u0640]/g, '');
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code === 0x0622 || code === 0x0623 || code === 0x0625 ||
        code === 0x0671 || code === 0x0672 || code === 0x0673) {
      out += '\u0627';
    } else if (code === 0x0649) {
      out += '\u064A';
    } else if (code === 0x0629) {
      out += '\u0647';
    } else if (code === 0x0624) {
      out += '\u0648';
    } else if (code === 0x0626 || code === 0x0621) {
      // skip
    } else if (code >= 0x0600 && code <= 0x06FF) {
      out += s[i];
    } else if ((code >= 0x0041 && code <= 0x005A) ||
               (code >= 0x0061 && code <= 0x007A) ||
               (code >= 0x0030 && code <= 0x0039)) {
      out += s[i].toLowerCase();
    }
  }
  return out;
}

/* ─────────────────────────────────────────────
   Diplomatic Glass primitives (Navy + Silver)
───────────────────────────────────────────── */
const glassBase = `
  relative overflow-hidden
  bg-slate-900/50 backdrop-blur-xl
  border border-sky-400/15
  shadow-[inset_0_1px_0_rgba(150,220,255,0.08),0_8px_32px_rgba(0,0,0,0.6)]
  rounded-2xl
`;

function GlassCard({ children, className = '' }) {
  return (
    <div className={`${glassBase} ${className}`}>
      <div className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-sky-200/[0.06] to-transparent rotate-[25deg] blur-sm" />
      </div>
      {children}
    </div>
  );
}

function DiploButton({ children, onClick, disabled, variant = 'default', className = '' }) {
  const vars = {
    default: 'border-sky-700/40 text-sky-100/90 hover:border-sky-400/70 hover:bg-sky-950/30',
    reveal:  'border-sky-400/60 text-sky-100 hover:border-sky-300/80 bg-gradient-to-r from-sky-950/50 to-blue-950/50',
    next:    'border-slate-400/50 text-slate-100 hover:border-slate-300/70 bg-gradient-to-r from-slate-900/60 to-slate-950/60',
    danger:  'border-rose-500/60 text-rose-100 hover:border-rose-400/80 bg-rose-950/40',
    submit:  'border-emerald-500/60 text-emerald-100 hover:border-emerald-400/80 bg-emerald-950/40',
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
        bg-slate-900/40 backdrop-blur-md border
        shadow-[inset_0_1px_0_rgba(150,220,255,0.06),0_4px_16px_rgba(0,0,0,0.5)]
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
   Particles — floating soft
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

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.3,
      dx: (Math.random() - 0.5) * 0.28,
      dy: (Math.random() - 0.5) * 0.28,
      alpha: Math.random() * 0.5 + 0.15,
      cool: Math.random() > 0.4,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.cool
          ? `rgba(140,220,255,${p.alpha})`
          : `rgba(220,220,240,${p.alpha * 0.8})`;
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
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, transparent 20%, rgba(5,10,25,0.9) 100%)' }} />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)' }} />
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 pointer-events-none"
        style={{
          width: '70%', height: '45%',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(120,200,255,0.15) 0%, transparent 65%)',
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
      <p className="text-sky-300/50 text-[10px] tracking-[0.3em] uppercase mb-3">الترتيب</p>
      <div className="space-y-2">
        {sorted.map((p, i) => (
          <div key={p.id} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-sky-200/40 text-xs w-4 font-mono shrink-0">{i + 1}</span>
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
                i === 0 ? 'border-sky-500/60 text-sky-200 bg-sky-950/50' : 'border-slate-700/40 text-slate-100/40'
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
   Intro overlay
───────────────────────────────────────────── */
function IntroOverlay({ onDismiss, isAdmin }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 cursor-pointer"
      style={{ background: 'rgba(5,10,25,0.94)', backdropFilter: 'blur(12px)' }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="max-w-lg text-center px-6"
      >
        <div className="text-7xl mb-6">🚩</div>
        <h2 className="text-sky-50 text-3xl font-bold mb-6">أعلام الدول</h2>

        <div className="space-y-4 text-right bg-slate-900/50 border border-sky-700/30 rounded-2xl p-6 mb-6">
          {isAdmin ? (
            <>
              <div className="flex items-start gap-3">
                <span className="text-sky-400 font-bold text-xl">١</span>
                <p className="text-slate-100/90 leading-relaxed">
                  اضغط <span className="text-sky-300 font-bold">"إظهار العلم"</span> لما تكون جاهز
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sky-400 font-bold text-xl">٢</span>
                <p className="text-slate-100/90 leading-relaxed">
                  اللاعبين يشوفوا العلم ويضغطوا البازر
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sky-400 font-bold text-xl">٣</span>
                <p className="text-slate-100/90 leading-relaxed">
                  اللي يضغط يكتب الإجابة ← صح = <span className="text-emerald-300 font-bold">+1</span> غلط = <span className="text-rose-300 font-bold">-1</span>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <span className="text-sky-400 font-bold text-xl">١</span>
                <p className="text-slate-100/90 leading-relaxed">
                  هيتظهر علم دولة على الشاشة
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sky-400 font-bold text-xl">٢</span>
                <p className="text-slate-100/90 leading-relaxed">
                  اضغط <span className="text-sky-300 font-bold">البازر</span> لو عرفت الدولة
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sky-400 font-bold text-xl">٣</span>
                <p className="text-slate-100/90 leading-relaxed">
                  اكتب اسم الدولة ← صح = <span className="text-emerald-300 font-bold">+1</span> غلط = <span className="text-rose-300 font-bold">-1</span>
                </p>
              </div>
            </>
          )}
        </div>

        <motion.p
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sky-300/70 text-sm"
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
            background: 'linear-gradient(90deg, rgba(120,200,255,0.15), rgba(200,230,255,0.55), rgba(120,200,255,0.15))',
            backgroundSize: '200% 100%',
          }}
        />
      )}
      <div className="relative rounded-2xl p-[1px]"
        style={{ background: 'linear-gradient(180deg, rgba(150,220,255,0.15), rgba(0,0,0,0.4))' }}
      >
        <button
          onClick={onBuzzerPress}
          disabled={buzzerLocked || !canBuzz || activePlayer}
          className={`w-full py-7 rounded-2xl text-xl font-bold flex items-center justify-center gap-3 transition-all
            ${isActivePlayer
              ? 'bg-gradient-to-br from-sky-400 to-blue-600 text-blue-950 cursor-not-allowed'
              : activePlayer
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : buzzerLocked || !canBuzz
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 text-white hover:from-sky-500 hover:to-indigo-600 active:scale-[0.98] shadow-[0_0_30px_rgba(100,180,255,0.45)]'}
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
   Popups
───────────────────────────────────────────── */
function PopupWrong({ playerName, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(40,0,5,0.75)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, rotate: -4 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-sm w-full rounded-2xl p-6 text-center border-2 border-rose-500/60 bg-gradient-to-b from-rose-950 to-red-950 shadow-2xl"
      >
        <motion.div
          animate={{ rotate: [0, -12, 12, -12, 0] }}
          transition={{ duration: 0.6 }}
          className="text-6xl mb-4"
        >
          ❌
        </motion.div>
        <h2 className="text-rose-100 text-2xl font-bold mb-2">إجابة غلط!</h2>
        <p className="text-rose-200/80 text-sm mb-1">
          <span className="font-bold text-rose-50">{playerName}</span> جاوب غلط
        </p>
        <p className="text-rose-200/60 text-xs mb-6">-1 نقطة</p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-100 font-bold hover:bg-rose-500/30 transition-colors"
        >
          حسناً
        </button>
      </motion.div>
    </motion.div>
  );
}

function PopupCorrect({ playerName, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,25,15,0.75)', backdropFilter: 'blur(10px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-sm w-full rounded-2xl p-6 text-center border-2 border-emerald-500/60 bg-gradient-to-b from-emerald-950 to-teal-950 shadow-2xl"
      >
        <motion.div
          animate={{ scale: [0.5, 1.3, 1] }}
          transition={{ duration: 0.6 }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>
        <h2 className="text-emerald-100 text-2xl font-bold mb-2">إجابة صح!</h2>
        <p className="text-emerald-200/80 text-sm mb-1">
          <span className="font-bold text-emerald-50">{playerName}</span> عرف الدولة
        </p>
        <p className="text-emerald-200/60 text-xs mb-6">+1 نقطة</p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-100 font-bold hover:bg-emerald-500/30 transition-colors"
        >
          تمام
        </button>
      </motion.div>
    </motion.div>
  );
}

function PopupRevealAnswer({ answer, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: 'rgba(5,15,30,0.82)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-sm w-full rounded-2xl p-6 text-center border-2 border-sky-400/70 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl"
      >
        <div className="text-5xl mb-4">🚩</div>
        <h2 className="text-sky-200 text-sm font-bold tracking-widest uppercase mb-3">
          الإجابة
        </h2>
        <p
          className="text-sky-50 text-3xl font-bold mb-6 leading-tight"
          style={{ textShadow: '0 0 20px rgba(120,200,255,0.6)' }}
        >
          {answer}
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-sky-500/20 border border-sky-500/50 text-sky-100 font-bold hover:bg-sky-500/30 transition-colors"
        >
          إغلاق
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export default function FlagsRound({
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
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [localSubmitted, setLocalSubmitted] = useState(false);

  const [showWrong, setShowWrong] = useState(null);
  const [showCorrect, setShowCorrect] = useState(null);
  const [revealAnswer, setRevealAnswer] = useState(null);

  const publicUrl = process.env.PUBLIC_URL || '';
  const isActivePlayer = activePlayer === playerId;
  const activePlayerData = players.find(p => p.id === activePlayer);

    const hasImage = !!currentQuestion?.image;
    const answeredCorrectly = !!currentQuestion?.answeredCorrectly;
    const canBuzz = hasImage && !activePlayer && !answeredCorrectly;

  // Listeners
  useEffect(() => {
    if (!socket) return;

    const onWrong = (data) => {
      setShowWrong({ playerName: data.playerName });
      setLocalSubmitted(false);
      setInput('');
      setSuggestions([]);
    };
    const onCorrect = (data) => {
      setShowCorrect({ playerName: data.playerName });
      setLocalSubmitted(false);
      setInput('');
      setSuggestions([]);
    };
    const onAnswerRevealed = (data) => setRevealAnswer({ answer: data.answer });

    socket.on('flags_wrong', onWrong);
    socket.on('flags_correct', onCorrect);
    socket.on('flags_answer_revealed', onAnswerRevealed);

    return () => {
      socket.off('flags_wrong', onWrong);
      socket.off('flags_correct', onCorrect);
      socket.off('flags_answer_revealed', onAnswerRevealed);
    };
  }, [socket]);

  // Reset input when question changes
  useEffect(() => {
    setInput('');
    setSuggestions([]);
    setLocalSubmitted(false);
  }, [currentQuestion?.id]);

  // Autocomplete — بسيط (يشتغل مع إجابات لاتينية وعربية)
    const handleInputChange = (val) => {
    setInput(val);
    const typed = val.trim();
    if (typed.length > 0 && currentQuestion?.allAnswers) {
        const nTyped = normalizeAr(typed);
        const matches = currentQuestion.allAnswers
        .filter(a => {
            if (a === typed) return false;
            const nA = normalizeAr(a);
            return nA.includes(nTyped) || nTyped.includes(nA);
        })
        .slice(0, 5);
        setSuggestions(matches);
    } else {
        setSuggestions([]);
    }
    };

  const pickSuggestion = (s) => {
    setInput(s);
    setSuggestions([]);
  };

  const handleSubmit = () => {
    if (!input.trim() || !isActivePlayer || localSubmitted) return;
    setLocalSubmitted(true);
    socket.emit('flags_submit', {
      roomCode,
      playerId,
      answer: input.trim(),
    });
  };

  const handleReveal = () => socket.emit('flags_reveal', { roomCode });
  const handleNext = () => socket.emit('flags_next', { roomCode });
  const handleRevealAnswer = () => socket.emit('flags_reveal_answer', { roomCode });

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #050a18 0%, #0d1730 45%, #101a35 75%, #050a18 100%)',
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

      {/* Popups */}
      <AnimatePresence>
        {showWrong && <PopupWrong playerName={showWrong.playerName} onClose={() => setShowWrong(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showCorrect && <PopupCorrect playerName={showCorrect.playerName} onClose={() => setShowCorrect(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {revealAnswer && <PopupRevealAnswer answer={revealAnswer.answer} onClose={() => setRevealAnswer(null)} />}
      </AnimatePresence>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <FaGlobe className="text-sky-400/70 text-sm" />
          <span className="text-sky-200/50 text-[10px] tracking-[0.3em] uppercase">أعلام الدول</span>
          <span className="w-px h-4 bg-slate-700/50" />
          <span className="text-slate-100/40 text-xs">{players.length} لاعبين</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-700/40 bg-slate-900/50 backdrop-blur-sm text-sky-300/80 text-xs tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
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
          className="text-sky-50 text-2xl sm:text-3xl font-bold tracking-tight"
          style={{ textShadow: '0 0 25px rgba(120,200,255,0.4)' }}
        >
          أعلام الدول
        </motion.h1>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 gap-4 overflow-y-auto pb-6 pt-2">
        <div className="w-full flex flex-col items-center gap-4 max-w-2xl">

          {/* ═══════ Flag Display ═══════ */}
          <GlassCard className="w-full max-w-2xl p-6 sm:p-10 min-h-[16rem] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">

              {/* ==== استعد (before image) ==== */}
              {!hasImage && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-6"
                >
                  <motion.div
                    animate={{
                      y: [0, -8, 0],
                      filter: [
                        'drop-shadow(0 0 15px rgba(120,200,255,0.4))',
                        'drop-shadow(0 0 35px rgba(120,200,255,0.8))',
                        'drop-shadow(0 0 15px rgba(120,200,255,0.4))',
                      ],
                    }}
                    transition={{ duration: 2.4, repeat: Infinity }}
                    className="text-7xl mb-4"
                  >
                    🚩
                  </motion.div>
                  <p className="text-3xl font-bold text-sky-50 mb-2"
                    style={{ textShadow: '0 0 30px rgba(120,200,255,0.5)' }}>
                    استعد!
                  </p>
                  <p className="text-sm text-sky-200/40 tracking-widest">
                    {isAdmin ? 'اضغط "إظهار العلم" لبدء الجولة' : 'في انتظار كشف العلم من المسؤول'}
                  </p>
                </motion.div>
              )}

              {/* ==== Flag shown ==== */}
              {hasImage && (
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, scale: 0.85, rotate: -2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <FaFlag className="text-sky-300/60 text-xs" />
                    <p className="text-sky-300/60 text-[10px] tracking-[0.4em] uppercase font-bold">
                      العلم
                    </p>
                    <FaFlag className="text-sky-300/60 text-xs" />
                  </div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 22 }}
                    className="relative"
                    style={{
                      maxWidth: '80%',
                      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.6))',
                    }}
                  >
                    <img
                      src={`${publicUrl}${currentQuestion.image}`}
                      alt="Flag"
                      className="rounded-xl object-contain max-h-[38vh] w-auto"
                      style={{
                        border: '3px solid rgba(150,220,255,0.3)',
                        boxShadow: '0 0 40px rgba(120,200,255,0.3), inset 0 0 20px rgba(0,0,0,0.2)',
                      }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center text-sky-200/50 text-xs tracking-widest mt-6"
                  >
                    مين يعرف اسم الدولة؟
                  </motion.p>
                </motion.div>
              )}

            </AnimatePresence>
          </GlassCard>

          {/* ═══════ Admin controls ═══════ */}
          {isAdmin && (
            <div className="w-full max-w-md grid grid-cols-2 gap-3">
              {!hasImage ? (
                <DiploButton
                  variant="reveal"
                  onClick={handleReveal}
                  className="!py-3.5 !text-sm col-span-2"
                >
                  <FaEye /> إظهار العلم
                </DiploButton>
              ) : (
                <>
                  <DiploButton
                    variant="next"
                    onClick={handleNext}
                    className="!py-3.5 !text-sm col-span-2"
                  >
                    <FaStepForward /> العلم التالي
                  </DiploButton>

                  <DiploButton
                    variant="danger"
                    onClick={handleRevealAnswer}
                    className="!py-3 !text-sm col-span-2"
                  >
                    <FaEye /> اكشف الإجابة
                  </DiploButton>
                </>
              )}

              {activePlayer && (
                <DiploButton
                  variant="reset"
                  onClick={onResetBuzzer}
                  className="!py-3 !text-sm col-span-2"
                >
                  <FaTimesCircle /> إرجاع البازر
                </DiploButton>
              )}
            </div>
          )}

          {/* ═══════ Buzzer / Input area ═══════ */}
          {hasImage && (
            <div className="w-full max-w-md">
              {/* اللي ضغط → Input */}
              {isActivePlayer && !localSubmitted && (
                <GlassCard className="p-5">
                  <div className="text-center mb-4">
                    <p className="text-sky-300/70 text-[10px] tracking-[0.3em] uppercase mb-2">
                      🎤 دورك دلوقتي
                    </p>
                    <p className="text-sky-50 text-lg font-bold">
                      اكتب اسم الدولة
                    </p>
                  </div>

                  <div className="relative mb-3">
                    <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-sky-400/50 text-sm" />
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="اكتب اسم الدولة..."
                      autoFocus
                      dir="rtl"
                      className="w-full bg-black/50 border border-sky-700/40 focus:border-sky-400/70 rounded-xl pr-10 pl-4 py-3 text-sky-50 text-right outline-none transition-colors"
                    />
                  </div>

                  <AnimatePresence>
                    {suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1.5 mb-3 overflow-hidden"
                      >
                        {suggestions.map(s => (
                          <button
                            key={s}
                            onClick={() => pickSuggestion(s)}
                            className="w-full text-right px-3 py-2 bg-sky-950/40 border border-sky-800/40 rounded-lg text-sky-100 text-sm hover:bg-sky-900/60 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <DiploButton
                    variant="submit"
                    onClick={handleSubmit}
                    disabled={!input.trim()}
                    className="w-full !py-3"
                  >
                    <FaPaperPlane /> إرسال الإجابة
                  </DiploButton>
                </GlassCard>
              )}

              {/* حد تاني ضغط */}
              {activePlayer && !isActivePlayer && (
                <GlassCard className="p-4 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  <span className="text-sky-100 text-sm">
                    <span className="font-bold">
                      {activePlayerData?.isAdmin ? 'المسؤول' : activePlayerData?.name}
                    </span> ضغط على الزر... في انتظار إجابته
                  </span>
                </GlassCard>
              )}

              {/* أنا بعت */}
              {isActivePlayer && localSubmitted && (
                <GlassCard className="p-4 text-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block mr-2" />
                  <span className="text-emerald-100 text-sm">تم إرسال إجابتك...</span>
                </GlassCard>
              )}

                {/* مفيش حد ضغط + لسه محدش جاوب صح → البازر */}
                {!activePlayer && !answeredCorrectly && (
                <Buzzer
                    isActivePlayer={isActivePlayer}
                    activePlayer={activePlayer}
                    buzzerLocked={buzzerLocked}
                    onBuzzerPress={onBuzzerPress}
                    canBuzz={canBuzz}
                />
                )}

                {/* ✅ لما حد جاوب صح — رسالة "تمت الإجابة" */}
                {answeredCorrectly && (
                <GlassCard className="p-4 w-full max-w-md text-center border border-emerald-600/40">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-2" />
                    <span className="text-emerald-200 text-sm">
                    ✓ تمت الإجابة على هذا العلم — اضغط "العلم التالي" للمتابعة
                    </span>
                </GlassCard>
                )}
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