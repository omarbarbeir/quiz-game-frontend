// components/WhoSaidRound.jsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStepForward, FaSignOutAlt, FaCrown, FaPlus, FaMinus,
  FaLock, FaBolt, FaFilm, FaEye, FaPaperPlane,
  FaCheck, FaTimes, FaSearch, FaTimesCircle
} from 'react-icons/fa';


// ─────────────────────────────────────────────
//  normalize — نفس اللي في السيرفر (للـ autocomplete)
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
   Cinematic Glass — Deep Navy + Gold
───────────────────────────────────────────── */
const glassBase = `
  relative overflow-hidden
  bg-indigo-950/30 backdrop-blur-md
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

function CinematicButton({ children, onClick, disabled, variant = 'default', className = '' }) {
  const vars = {
    default: 'border-amber-700/40 text-amber-100/90 hover:border-amber-400/70 hover:bg-amber-950/25',
    reveal:  'border-amber-400/70 text-amber-100 hover:border-amber-300/90 bg-gradient-to-r from-amber-950/40 to-indigo-950/40',
    danger:  'border-rose-400/70 text-rose-100 hover:border-rose-300/90 bg-gradient-to-r from-rose-950/50 to-red-950/40',
    next:    'border-indigo-400/60 text-indigo-100 hover:border-indigo-300/80 bg-gradient-to-r from-indigo-950/60 to-slate-950/40',
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
        bg-indigo-950/30 backdrop-blur-md border
        shadow-[inset_0_1px_0_rgba(255,220,150,0.06),0_4px_16px_rgba(0,0,0,0.5)]
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
        const isGold = Math.random() > 0.5;
        ctx.fillStyle = isGold ? `rgba(255,200,120,${d.alpha})` : `rgba(160,180,255,${d.alpha})`;
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
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 40%, transparent 20%, rgba(5,5,20,0.88) 100%)' }} />
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 2px,#000 2px,#000 4px)' }} />
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
              <span className="text-indigo-50/90 text-sm flex items-center gap-1 truncate">
                {p.isAdmin && <FaCrown className="text-amber-400 text-[10px] shrink-0" />}
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
                  ? 'border-amber-500/60 text-amber-200 bg-amber-950/50'
                  : 'border-indigo-900/40 text-indigo-100/40'
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
      style={{ background: 'rgba(5,5,20,0.94)', backdropFilter: 'blur(12px)' }}
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        className="max-w-lg text-center px-6"
      >
        <div className="text-7xl mb-6">🎬</div>
        <h2 className="text-amber-50 text-3xl font-bold mb-6">مين قال الجملة دي؟</h2>

        <div className="space-y-4 text-right bg-indigo-950/40 border border-amber-700/30 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-amber-400 font-bold text-xl">١</span>
            <p className="text-indigo-100/90 leading-relaxed">
              {isAdmin ? 'اضغط "إظهار الجملة" عشان تظهر للكل' : 'استنى المسؤول يظهر الجملة'}
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-400 font-bold text-xl">٢</span>
            <p className="text-indigo-100/90 leading-relaxed">
              اضغط <span className="text-amber-300 font-bold">البازر</span> لو عرفت اسم الفيلم
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-400 font-bold text-xl">٣</span>
            <p className="text-indigo-100/90 leading-relaxed">
              صح → <span className="text-emerald-300 font-bold">+1</span> · غلط → <span className="text-rose-300 font-bold">-1</span>
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
            background: 'linear-gradient(90deg, rgba(255,180,80,0.15), rgba(255,220,140,0.6), rgba(255,180,80,0.15))',
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
          className={`w-full py-8 rounded-2xl text-2xl font-bold flex items-center justify-center gap-3 transition-all
            ${isActivePlayer
              ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 cursor-not-allowed'
              : activePlayer
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : buzzerLocked || !canBuzz
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-br from-amber-600 via-amber-700 to-indigo-800 text-amber-50 hover:from-amber-500 hover:to-indigo-700 active:scale-[0.98] shadow-[0_0_30px_rgba(255,180,80,0.4)]'}
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
      style={{ background: 'rgba(30,0,5,0.75)', backdropFilter: 'blur(10px)' }}
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
      style={{ background: 'rgba(0,30,20,0.75)', backdropFilter: 'blur(10px)' }}
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
          <span className="font-bold text-emerald-50">{playerName}</span> جابها صح
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
      style={{ background: 'rgba(15,10,0,0.82)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
        onClick={(e) => e.stopPropagation()}
        className="max-w-sm w-full rounded-2xl p-6 text-center border-2 border-amber-400/70 bg-gradient-to-b from-indigo-950 to-slate-950 shadow-2xl"
      >
        <div className="text-5xl mb-4">🎬</div>
        <h2 className="text-amber-200 text-sm font-bold tracking-widest uppercase mb-3">
          اسم الفيلم
        </h2>
        <p
          className="text-amber-50 text-3xl font-bold mb-6 leading-tight"
          style={{ textShadow: '0 0 20px rgba(255,200,100,0.5)' }}
        >
          {answer}
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-100 font-bold hover:bg-amber-500/30 transition-colors"
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
export default function WhoSaidRound({
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

  const isActivePlayer = activePlayer === playerId;
  const activePlayerData = players.find(p => p.id === activePlayer);
  const revealed = !!currentQuestion?.revealed;
  const answerAlreadyRevealed = !!currentQuestion?.answerRevealed;
  const canBuzz = !!currentQuestion && revealed && !activePlayer && !answerAlreadyRevealed;

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

    const onAnswerRevealed = (data) => {
      setRevealAnswer({ answer: data.answer });
    };

    socket.on('who_said_wrong', onWrong);
    socket.on('who_said_correct', onCorrect);
    socket.on('who_said_answer_revealed', onAnswerRevealed);

    return () => {
      socket.off('who_said_wrong', onWrong);
      socket.off('who_said_correct', onCorrect);
      socket.off('who_said_answer_revealed', onAnswerRevealed);
    };
  }, [socket]);

  useEffect(() => {
    setInput('');
    setSuggestions([]);
    setLocalSubmitted(false);
  }, [currentQuestion?.id]);

  const handleInputChange = (val) => {
    setInput(val);
    const typed = val.trim();
    if (typed.length > 0 && currentQuestion?.allAnswers) {
      const nTyped = normalizeAr(typed);
      const matches = currentQuestion.allAnswers
        .filter(a => {
          if (a === typed) return false; // مش اقتراح لو مطابق تماماً لما كتب
          const nA = normalizeAr(a);
          // لو اللي كتبه موجود جوه الاسم بعد الـ normalize → اقتراح
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
    socket.emit('who_said_submit', {
      roomCode,
      playerId,
      answer: input.trim(),
    });
  };

  const handleReveal = () => {
    socket.emit('who_said_reveal', { roomCode });
  };

  const handleRevealAnswer = () => {
    socket.emit('who_said_reveal_answer', { roomCode });
  };

  const handleNext = () => {
    socket.emit('who_said_next', { roomCode });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #050818 0%, #0d1430 45%, #101838 75%, #050818 100%)',
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

      <AnimatePresence>
        {showWrong && (
          <PopupWrong
            playerName={showWrong.playerName}
            onClose={() => setShowWrong(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCorrect && (
          <PopupCorrect
            playerName={showCorrect.playerName}
            onClose={() => setShowCorrect(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {revealAnswer && (
          <PopupRevealAnswer
            answer={revealAnswer.answer}
            onClose={() => setRevealAnswer(null)}
          />
        )}
      </AnimatePresence>

      <div
        className="pointer-events-none fixed"
        style={{
          width: 650, height: 650, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,180,80,0.12) 0%, transparent 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -60%)',
          filter: 'blur(50px)',
        }}
      />

      {/* top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <FaFilm className="text-amber-400/60 text-sm" />
          <span className="text-amber-200/40 text-[10px] tracking-[0.3em] uppercase">مين قال الجملة</span>
          <span className="w-px h-4 bg-indigo-700/40" />
          <span className="text-indigo-100/40 text-xs">{players.length} لاعبين</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-700/40 bg-indigo-950/50 backdrop-blur-sm text-amber-300/80 text-xs tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          {roomCode}
        </div>
        <button
          onClick={onLeaveRoom}
          className="text-indigo-200/25 hover:text-indigo-200/70 transition-colors text-xs tracking-wide flex items-center gap-1"
        >
          <FaSignOutAlt className="text-[10px]" /> خروج
        </button>
      </div>

      {/* headline */}
      <div className="relative z-10 text-center pt-3 pb-4 px-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-amber-50 text-3xl font-bold tracking-tight mb-1"
          style={{ letterSpacing: '-0.01em', textShadow: '0 0 20px rgba(255,180,80,0.35)' }}
        >
          مين قال الجملة دي؟
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="text-amber-200/30 text-[10px] tracking-[0.35em] uppercase"
        >
          {isAdmin ? 'لوحة التحكم' : 'شاشة اللاعب'}
        </motion.p>
      </div>

      {/* main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 gap-3 overflow-y-auto pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="w-full flex flex-col items-center gap-3 max-w-2xl"
        >

          {/* ═══════ 👁️ REVEAL ANSWER — فوق خالص، بعيد عن الباقي ═══════ */}
          {isAdmin && revealed && (
            <div className="w-full max-w-md mb-3">
              <CinematicButton
                variant="danger"
                onClick={handleRevealAnswer}
                disabled={answerAlreadyRevealed}
                className="w-full !py-4 !text-sm"
              >
                <FaEye /> {answerAlreadyRevealed ? '✓ الإجابة مكشوفة' : 'اكشف الإجابة الصح'}
              </CinematicButton>
            </div>
          )}

          {/* ═══════ Sentence display ═══════ */}
          <GlassCard className="p-8 w-full max-w-2xl text-center">
            {revealed && currentQuestion?.text ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-amber-300/50 text-[10px] tracking-[0.4em] uppercase mb-4">الجملة</p>
                <p
                  className="text-amber-50 text-2xl sm:text-3xl font-bold leading-relaxed"
                  style={{ textShadow: '0 0 20px rgba(255,180,80,0.3)' }}
                >
                  «{currentQuestion.text}»
                </p>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center py-6">
                <motion.div
                  animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.85, 0.4] }}
                  transition={{ duration: 2.4, repeat: Infinity }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,180,80,0.2), rgba(120,140,255,0.05))',
                    border: '2px solid rgba(255,200,120,0.3)',
                    boxShadow: '0 0 50px rgba(255,180,80,0.25)',
                  }}
                >
                  <FaFilm className="text-3xl text-amber-300" />
                </motion.div>
                <p className="text-amber-100 text-lg font-bold mb-1">🎬 الجملة مخفية</p>
                <p className="text-indigo-200/40 text-xs tracking-widest">
                  {isAdmin ? 'اضغط "إظهار الجملة" عشان تظهر للكل' : 'في انتظار ظهور الجملة من المسؤول'}
                </p>
              </div>
            )}
          </GlassCard>

          {/* ═══════ Admin controls — باقي الأزرار ═══════ */}
          {isAdmin && (
            <div className="w-full max-w-md space-y-3 mt-3">
              {!revealed ? (
                <CinematicButton
                  variant="reveal"
                  onClick={handleReveal}
                  className="w-full !py-3.5 !text-sm"
                >
                  <FaEye /> إظهار الجملة
                </CinematicButton>
              ) : (
                <CinematicButton
                  variant="next"
                  onClick={handleNext}
                  className="w-full !py-3.5 !text-sm"
                >
                  <FaStepForward /> الجملة التالية
                </CinematicButton>
              )}

              {activePlayer && (
                <CinematicButton
                  variant="reset"
                  onClick={onResetBuzzer}
                  className="w-full !py-3 !text-sm"
                >
                  <FaTimesCircle /> إرجاع البازر
                </CinematicButton>
              )}
            </div>
          )}

          {/* ═══════ Buzzer / Input area ═══════ */}
          {revealed && !answerAlreadyRevealed && (
            <div className="w-full max-w-md">
              {isActivePlayer && !localSubmitted && (
                <GlassCard className="p-5">
                  <div className="text-center mb-4">
                    <p className="text-amber-300/70 text-[10px] tracking-[0.3em] uppercase mb-2">
                      🎤 دورك دلوقتي
                    </p>
                    <p className="text-amber-50 text-lg font-bold">
                      اكتب اسم الفيلم
                    </p>
                  </div>

                  <div className="relative mb-3">
                    <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400/50 text-sm" />
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="اكتب اسم الفيلم..."
                      autoFocus
                      dir="rtl"
                      className="w-full bg-black/50 border border-amber-700/40 focus:border-amber-400/70 rounded-xl pr-10 pl-4 py-3 text-amber-50 text-right outline-none transition-colors"
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
                            className="w-full text-right px-3 py-2 bg-amber-950/30 border border-amber-800/30 rounded-lg text-amber-100 text-sm hover:bg-amber-900/50 transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <CinematicButton
                    variant="submit"
                    onClick={handleSubmit}
                    disabled={!input.trim()}
                    className="w-full !py-3"
                  >
                    <FaPaperPlane /> إرسال الإجابة
                  </CinematicButton>
                </GlassCard>
              )}

              {activePlayer && !isActivePlayer && (
                <GlassCard className="p-4 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-amber-100 text-sm">
                    <span className="font-bold">
                      {activePlayerData?.isAdmin ? 'المسؤول' : activePlayerData?.name}
                    </span> ضغط على الزر... في انتظار إجابته
                  </span>
                </GlassCard>
              )}

              {isActivePlayer && localSubmitted && (
                <GlassCard className="p-4 text-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block mr-2" />
                  <span className="text-emerald-100 text-sm">تم إرسال إجابتك...</span>
                </GlassCard>
              )}

              {!activePlayer && (
                <Buzzer
                  isActivePlayer={isActivePlayer}
                  activePlayer={activePlayer}
                  buzzerLocked={buzzerLocked}
                  onBuzzerPress={onBuzzerPress}
                  canBuzz={canBuzz}
                />
              )}
            </div>
          )}

          {answerAlreadyRevealed && (
            <GlassCard className="p-4 w-full max-w-md text-center border border-amber-700/40">
              <p className="text-amber-200/80 text-sm">
                👁️ الإجابة اتكشفت — اضغط "الجملة التالية" للمتابعة
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