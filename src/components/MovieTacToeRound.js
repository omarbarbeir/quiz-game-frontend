// components/MovieTacToeRound.jsx
// 🎬 XO السينمائية / كورة — TTT + Connect4 · فردي + جماعي (Fullscreen + Liquid Glass)
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome, FaLock, FaCrown, FaSignOutAlt, FaRedo,
  FaFilm, FaFutbol, FaUsers, FaUser, FaThLarge, FaCircle,
} from 'react-icons/fa';

/* ==================== Theme ==================== */
const C = {
  bg0: '#08090d',
  bg1: '#0f1117',
  surface: '#151822',
  surface2: '#1a1e2b',
  border: 'rgba(255,255,255,0.08)',
  text: '#e5e7eb',
  muted: '#94a3b8',
  dim: '#64748b',
  cinema:   { primary: '#f59e0b', light: '#fbbf24', rgb: '245,158,11' },
  football: { primary: '#22c55e', light: '#4ade80', rgb: '34,197,94' },
  neutral:  { rgb: '148,163,184' },
  danger:   { rgb: '220,38,38' },
};

const PALETTE = [
  { name: 'قرمزي', hex: '#e6395b' },
  { name: 'أزرق', hex: '#3b82f6' },
  { name: 'أخضر', hex: '#10b981' },
  { name: 'برتقالي', hex: '#f7941d' },
  { name: 'وردي', hex: '#ec4899' },
  { name: 'فيروزي', hex: '#14b8a6' },
  { name: 'ذهبي', hex: '#eab308' },
  { name: 'سماوي', hex: '#0ea5e9' },
];

const CATEGORY_INFO = {
  cinema:   { emoji: '🎬', title: 'سينما', desc: 'ممثلين وأفلام مصرية وعربية', theme: C.cinema },
  football: { emoji: '⚽', title: 'كورة', desc: 'لاعبين وأندية عالمية', theme: C.football },
};

const C4_ROWS = 6;
const C4_COLS = 7;

function initials(label = '') {
  return label.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('');
}
function otherTeam(t) { return t === 1 ? 2 : 1; }

/* ==================== Sound ==================== */
const SOUND_PATHS = {
  click:   '/sounds/click.mp3',
  correct: '/sounds/correct.mp3',
  wrong:   '/sounds/wrong.mp3',
  win:     '/sounds/win.mp3',
  place:   '/sounds/place.mp3',
};

class SoundEngine {
  constructor(paths = {}) { this.paths = paths; this.enabled = true; this.cache = {}; }
  setEnabled(v) { this.enabled = !!v; }
  play(name) {
    if (!this.enabled) return;
    const url = this.paths[name];
    if (!url) return;
    try { const a = new Audio(url); a.volume = 0.7; a.play().catch(() => {}); } catch {}
  }
}

/* ==================== Glass components ==================== */
function GlassBtn({ children, onClick, disabled, accent, variant = 'default', style = {}, className = '', title }) {
  const accentRGB = accent?.rgb || (variant === 'danger' ? C.danger.rgb : C.neutral.rgb);
  const isPrimary = variant === 'primary' && accent;
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';

  let bg, border, color, shadow;
  if (disabled) {
    bg = 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))';
    border = '1px solid rgba(255,255,255,0.05)';
    color = C.dim;
    shadow = 'none';
  } else if (isDanger) {
    bg = 'linear-gradient(135deg, rgba(220,38,38,0.42), rgba(220,38,38,0.1))';
    border = '1px solid rgba(220,38,38,0.6)';
    color = '#fecaca';
    shadow = '0 8px 20px rgba(220,38,38,0.3), inset 0 1px 1px rgba(255,255,255,0.18)';
  } else if (isPrimary) {
    bg = `linear-gradient(135deg, rgba(${accentRGB},0.55), rgba(${accentRGB},0.12))`;
    border = `1px solid rgba(${accentRGB},0.7)`;
    color = '#fff';
    shadow = `0 10px 24px rgba(${accentRGB},0.4), inset 0 1px 1px rgba(255,255,255,0.28), inset 0 0 20px rgba(${accentRGB},0.15)`;
  } else if (isGhost) {
    bg = 'rgba(255,255,255,0.02)';
    border = '1px solid rgba(255,255,255,0.1)';
    color = C.muted;
    shadow = 'none';
  } else {
    bg = 'linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))';
    border = '1px solid rgba(255,255,255,0.14)';
    color = C.text;
    shadow = '0 6px 18px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.18)';
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={!disabled ? { y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.96 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative rounded-xl font-black overflow-hidden ${className}`}
      style={{
        background: bg,
        backdropFilter: 'blur(20px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
        border,
        color,
        boxShadow: shadow,
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: '10px 18px',
        ...style,
      }}
    >
      {!disabled && (
        <span
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: '50%',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.16), transparent)',
            borderRadius: 'inherit',
          }} />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
}

function GlassPanel({ children, accent, className = '', style = {} }) {
  const accentRGB = accent?.rgb || C.neutral.rgb;
  return (
    <div
      className={`relative rounded-2xl ${className}`}
      style={{
        background: `linear-gradient(145deg, rgba(${accentRGB},0.08), rgba(21,24,34,0.7))`,
        backdropFilter: 'blur(20px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
        border: `1px solid rgba(${accentRGB},0.2)`,
        boxShadow: `0 12px 40px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.08)`,
        ...style,
      }}>
      <span className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />
      {children}
    </div>
  );
}

/* ==================== Header ==================== */
function Header({ title, onExit, accent, extra, phaseLabel }) {
  const accentRGB = accent?.rgb || C.neutral.rgb;
  return (
    <header
      className="relative z-20 flex items-center justify-between px-3 sm:px-5 py-2.5 gap-3"
      style={{
        background: `linear-gradient(90deg, ${C.bg1}ee, ${C.bg0}cc, ${C.bg1}ee)`,
        backdropFilter: 'blur(20px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
        borderBottom: `1px solid rgba(${accentRGB},0.2)`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(${accentRGB},0.08)`,
      }}>
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-xl sm:text-2xl" style={{ filter: `drop-shadow(0 0 10px rgba(${accentRGB},0.7))` }}>
          🎮
        </span>
        <h1
          className="font-black text-sm sm:text-base whitespace-nowrap"
          style={{
            background: `linear-gradient(135deg, #fff, rgba(${accentRGB},1))`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
          {title}
        </h1>
        {phaseLabel && (
          <span
            className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full font-black"
            style={{
              background: `rgba(${accentRGB},0.15)`,
              color: `rgb(${accentRGB})`,
              border: `1px solid rgba(${accentRGB},0.4)`,
            }}>
            {phaseLabel}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {extra}
        {onExit && (
          <GlassBtn onClick={onExit} variant="danger" style={{ padding: '8px 12px' }}>
            <FaSignOutAlt size={12} />
            <span className="hidden sm:inline text-xs">خروج</span>
          </GlassBtn>
        )}
      </div>
    </header>
  );
}

/* ==================== Choice Cards ==================== */
function ChoiceCard({ emoji, title, desc, onClick, accent, disabled = false }) {
  const accentRGB = accent?.rgb || C.neutral.rgb;
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { y: -5, scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="relative rounded-2xl p-6 text-center overflow-hidden flex-1 min-w-[200px]"
      style={{
        background: `linear-gradient(145deg, rgba(${accentRGB},0.18), rgba(${accentRGB},0.03))`,
        backdropFilter: 'blur(20px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.5)',
        border: `1.5px solid rgba(${accentRGB},0.5)`,
        boxShadow: `0 14px 36px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.18), 0 0 24px rgba(${accentRGB},0.15)`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}>
      <span
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: '40%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.14), transparent)',
        }} />
      <div className="relative z-10">
        <div className="text-5xl mb-3" style={{ filter: `drop-shadow(0 6px 14px rgba(${accentRGB},0.5))` }}>{emoji}</div>
        <div className="text-xl font-black text-white mb-1">{title}</div>
        <div className="text-xs" style={{ color: C.muted }}>{desc}</div>
      </div>
    </motion.button>
  );
}

function Waiting({ text, accent }) {
  const accentRGB = accent?.rgb || C.neutral.rgb;
  return (
    <div className="text-center py-8">
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        className="text-4xl mb-3"
        style={{ filter: `drop-shadow(0 0 12px rgba(${accentRGB},0.5))` }}>
        ⏳
      </motion.div>
      <p className="text-sm font-bold" style={{ color: C.muted }}>{text}</p>
    </div>
  );
}

/* ==================== Setup Shell ==================== */
function SetupShell({ children, accent, title, subtitle, emoji }) {
  const accentRGB = accent?.rgb || C.neutral.rgb;
  return (
    <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        className="w-full max-w-4xl my-auto">
        <GlassPanel accent={accent} className="p-6 sm:p-8">
          <div className="text-center mb-6">
            {emoji && (
              <div className="text-5xl mb-2" style={{ filter: `drop-shadow(0 0 16px rgba(${accentRGB},0.7))` }}>{emoji}</div>
            )}
            <h2
              className="text-2xl sm:text-3xl font-black mb-1"
              style={{
                background: `linear-gradient(135deg, #fff, rgba(${accentRGB},1))`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
              {title}
            </h2>
            {subtitle && <p className="text-xs sm:text-sm" style={{ color: C.muted }}>{subtitle}</p>}
          </div>
          {children}
        </GlassPanel>
      </motion.div>
    </div>
  );
}

/* ==================== Board Clue ==================== */
function ClueHeader({ item, small, accent }) {
  const [imgFailed, setImgFailed] = useState(false);
  const accentRGB = accent?.rgb || C.neutral.rgb;
  const label = item?.label || '';
  const image = item?.image;
  const sz = small ? 42 : 52;
  return (
    <div className="flex flex-col items-center justify-center gap-1 p-1 select-none">
      {image && !imgFailed ? (
        <img
          src={image}
          alt={label}
          onError={() => setImgFailed(true)}
          className="rounded-full object-cover"
          style={{
            width: sz, height: sz,
            border: `2px solid rgba(${accentRGB},0.6)`,
            boxShadow: `0 0 12px rgba(${accentRGB},0.3), inset 0 1px 1px rgba(255,255,255,0.2)`,
          }} />
      ) : (
        <div
          className="rounded-full flex items-center justify-center font-black"
          style={{
            width: sz, height: sz,
            fontSize: sz * 0.38,
            background: `linear-gradient(145deg, rgba(${accentRGB},0.28), rgba(${accentRGB},0.06))`,
            border: `2px solid rgba(${accentRGB},0.55)`,
            color: C.text,
            textShadow: '0 1px 3px rgba(0,0,0,0.6)',
          }}>
          {initials(label)}
        </div>
      )}
      <div
        className={`text-center font-bold leading-tight ${small ? 'text-[9px]' : 'text-[10px]'}`}
        style={{ color: C.text, maxWidth: small ? 60 : 80, textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}>
        {label}
      </div>
    </div>
  );
}

/* ==================== TTT Cell ==================== */
function TttCell({ cell, cellTeam, isSelected, isPending, pendingColor, onClick, clickable, accent }) {
  const accentRGB = accent?.rgb || C.neutral.rgb;
  const common = {
    background: cell && cellTeam
      ? `linear-gradient(145deg, ${cellTeam.color}30, ${cellTeam.color}08)`
      : 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.22))',
    backdropFilter: 'blur(14px) saturate(1.4)',
    WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
    border: `2.5px solid ${cell && cellTeam ? cellTeam.color
      : isSelected ? `rgb(${accentRGB})`
      : isPending ? pendingColor
      : 'rgba(255,255,255,0.08)'}`,
    boxShadow: cell && cellTeam
      ? `0 0 24px ${cellTeam.color}66, inset 0 1px 1px rgba(255,255,255,0.12)`
      : isPending
        ? `0 0 20px ${pendingColor}66, inset 0 1px 1px rgba(255,255,255,0.12)`
        : isSelected
          ? `0 0 20px rgba(${accentRGB},0.4), inset 0 1px 1px rgba(255,255,255,0.12)`
          : 'inset 0 1px 1px rgba(255,255,255,0.06)',
    cursor: clickable ? 'pointer' : 'default',
    transition: 'all 0.25s',
  };

  if (cell && cellTeam) return (
    <motion.div
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center overflow-hidden"
      style={common}>
      <div className="text-[13px] font-black mb-1 leading-tight truncate w-full" style={{ color: cellTeam.color }}>
        {cellTeam.name}
      </div>
      <div className="text-xs font-bold leading-tight break-words text-center" style={{ color: C.text }}>
        {cell.text}
      </div>
    </motion.div>
  );

  if (isPending) return (
    <div className="aspect-square rounded-2xl flex items-center justify-center overflow-hidden" style={common}>
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        className="text-[10px] font-black"
        style={{ color: pendingColor }}>
        قيد التصويت...
      </motion.span>
    </div>
  );

  return (
    <button
      onClick={onClick}
      disabled={!clickable}
      className="aspect-square rounded-2xl flex items-center justify-center overflow-hidden"
      style={common}>
      <span className="text-2xl opacity-40" style={{ color: C.dim }}>?</span>
    </button>
  );
}

/* ==================== C4 Cell ==================== */
function C4Cell({ cell, cellTeam, isPending, pendingColor, isHighlighted, activeColor }) {
  const fill = cell && cellTeam
    ? `radial-gradient(circle at 30% 25%, ${cellTeam.color}ff, ${cellTeam.color}90)`
    : isPending
      ? `radial-gradient(circle at 30% 25%, ${pendingColor}dd, ${pendingColor}80)`
      : isHighlighted
        ? 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.1), rgba(255,255,255,0.02))'
        : 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.06), rgba(0,0,0,0.35))';
  const border = cell && cellTeam
    ? `3px solid ${cellTeam.color}`
    : isHighlighted
      ? `3px solid ${activeColor}`
      : isPending
        ? `3px solid ${pendingColor}`
        : '3px solid rgba(255,255,255,0.1)';
  return (
    <div className="w-full h-full flex items-center justify-center p-1">
      <motion.div
        initial={cell ? { scale: 0.3, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: '100%',
          aspectRatio: '1',
          maxWidth: 76,
          background: fill,
          border,
          boxShadow: cell
            ? `0 0 22px ${cellTeam.color}80, inset 0 3px 4px rgba(255,255,255,0.35), inset 0 -3px 5px rgba(0,0,0,0.3)`
            : isPending
              ? `0 0 22px ${pendingColor}80, inset 0 3px 4px rgba(255,255,255,0.3)`
              : isHighlighted
                ? `0 0 18px ${activeColor}66`
                : 'inset 0 3px 5px rgba(0,0,0,0.5)',
        }}>
        {cell && (
          <span
            className="text-[9px] font-black text-white text-center px-1 leading-tight break-words"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}>
            {cell.text}
          </span>
        )}
        {isPending && (
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="text-[10px] font-bold text-white">...</motion.span>
        )}
      </motion.div>
    </div>
  );
}

/* ==================== Team chat ==================== */
function ChatBox({ accent, team, messages, input, setInput, onSend }) {
  const boxRef = useRef(null);
  const accentRGB = accent?.rgb || C.neutral.rgb;

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [messages]);

  return (
    <GlassPanel accent={accent} className="h-full flex flex-col p-4" style={{ minHeight: 320 }}>
      <div className="flex items-center gap-2 font-black mb-3 text-sm"
        style={{ color: `rgb(${accentRGB})` }}>
        <FaLock size={12} />
        <span>شات {team?.name || 'فريق'}</span>
      </div>
      <div
        ref={boxRef}
        className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3 pr-1"
        style={{ maxHeight: 320 }}>
        {messages.length === 0 && (
          <div className="text-xs" style={{ color: C.dim }}>محدش كتب حاجة لسه</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className="text-sm">
            <span className="font-black" style={{ color: `rgb(${accentRGB})` }}>{m.who}:</span>{' '}
            <span style={{ color: C.text }}>{m.text}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onSend()}
          placeholder="اكتب رسالة..."
          className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
          style={{
            background: 'rgba(0,0,0,0.3)',
            border: `1px solid rgba(${accentRGB},0.3)`,
            color: C.text,
          }} />
        <GlassBtn onClick={onSend} accent={accent} style={{ padding: '8px 14px', fontSize: 12 }}>
          إرسال
        </GlassBtn>
      </div>
    </GlassPanel>
  );
}

/* ==================== Winner Screen ==================== */
function WinnerModal({ winner, game, teamOf, isAdmin, onNewRound, onReset, onExit }) {
  const confetti = useMemo(() => Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 2,
    color: ['#f59e0b', '#22c55e', '#eab308', '#ef4444', '#06b6d4'][i % 5],
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
  })), []);

  const winningTeam = !winner.draw && winner.team ? teamOf(winner.team) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.85), rgba(0,0,0,0.95))' }}>
      {!winner.draw && confetti.map(c => (
        <div
          key={c.id}
          style={{
            position: 'absolute',
            top: -20,
            left: `${c.left}%`,
            width: c.size,
            height: c.size * 1.6,
            background: c.color,
            borderRadius: 2,
            animation: `mtttFall ${c.duration}s linear ${c.delay}s infinite`,
            transform: `rotate(${c.rotate}deg)`,
            pointerEvents: 'none',
            boxShadow: `0 0 8px ${c.color}80`,
          }} />
      ))}
      <style>{`
        @keyframes mtttFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>

      <motion.div
        initial={{ scale: 0.75, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="relative max-w-md w-full text-center"
        style={{ zIndex: 10 }}>
        <GlassPanel accent={winningTeam ? { rgb: hexToRgb(winningTeam.color) } : undefined} className="p-8">
          {winner.draw ? (
            <>
              <div className="text-7xl mb-3">🤝</div>
              <h2 className="text-3xl font-black mb-2" style={{ color: C.text }}>تعادل!</h2>
              <p className="text-sm" style={{ color: C.muted }}>الأرض امتلت والنتيجة متساوية</p>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0.4, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="text-8xl mb-3"
                style={{ filter: `drop-shadow(0 0 24px ${winningTeam?.color || '#fff'})` }}>
                🏆
              </motion.div>
              <h2
                className="text-4xl font-black mb-2"
                style={{
                  background: `linear-gradient(135deg, #fff, ${winningTeam?.color || '#fff'})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                {winningTeam?.name || 'الفريق'} فاز!
              </h2>
              {winner.byMajority && !winner.byDisconnect && (
                <p className="text-sm mb-4" style={{ color: C.muted }}>بالأغلبية (أكتر مربعات)</p>
              )}
              {winner.byDisconnect && (
                <p className="text-sm mb-4" style={{ color: C.muted }}>الفريق التاني انسحب</p>
              )}
            </>
          )}

          <div className="flex justify-center gap-3 mt-6 flex-wrap">
            {isAdmin && (
              <>
                <GlassBtn onClick={onNewRound} accent={{ rgb: winningTeam ? hexToRgb(winningTeam.color) : C.neutral.rgb }} variant="primary">
                  <FaRedo size={12} /> مجموعة جديدة
                </GlassBtn>
                <GlassBtn onClick={onReset} variant="ghost">
                  ↩️ من الأول
                </GlassBtn>
              </>
            )}
            <GlassBtn onClick={onExit} variant="danger">
              <FaHome size={12} /> خروج
            </GlassBtn>
          </div>
          {!isAdmin && (
            <p className="text-xs mt-4" style={{ color: C.dim }}>بانتظار المُيسّر للبدء من جديد...</p>
          )}
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}

function hexToRgb(hex) {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return '255,255,255';
  return m.map(x => parseInt(x, 16)).join(',');
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function MovieTacToeRound({ socket, roomCode, players, currentPlayer, isAdmin, onExit }) {
  const [game, setGame] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerKind, setTimerKind] = useState('answer');
  const [myTeamChat, setMyTeamChat] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');

  // Admin local state for setup
  const [captain1Id, setCaptain1Id] = useState('');
  const [captain2Id, setCaptain2Id] = useState('');
  const [team1Draft, setTeam1Draft] = useState({ name: '', color: '' });
  const [team2Draft, setTeam2Draft] = useState({ name: '', color: '' });
  const [soloDraft1, setSoloDraft1] = useState({ name: '', color: '' });
  const [soloDraft2, setSoloDraft2] = useState({ name: '', color: '' });

  const soundRef = useRef(null);
  const lastWinnerKey = useRef(null);
  const myId = currentPlayer?.id;

  // Sound init
  useEffect(() => { soundRef.current = new SoundEngine(SOUND_PATHS); }, []);
  const playSound = (n) => soundRef.current?.play(n);

  const playerName = useCallback(
    id => players.find(p => p.id === id)?.name || '???',
    [players]
  );

  const myTeam = useMemo(() => {
    if (!game) return null;
    if (game.team1?.memberIds?.includes(myId)) return 1;
    if (game.team2?.memberIds?.includes(myId)) return 2;
    return null;
  }, [game, myId]);

  const teamOf = useCallback(
    n => game ? (n === 1 ? game.team1 : game.team2) : null,
    [game]
  );

  // Category-based accent
  const accent = useMemo(() => {
    if (!game?.category) return C.neutral;
    return CATEGORY_INFO[game.category]?.theme || C.neutral;
  }, [game?.category]);

  /* ---------- Socket ---------- */
  useEffect(() => {
    if (!socket || !roomCode) return;
    socket.emit('mttt_init', { roomCode, playerId: myId });

    const onState = s => {
      setGame(s);
      if (s.team1) setTeam1Draft({ name: s.team1.name || '', color: s.team1.color || '' });
      if (s.team2) setTeam2Draft({ name: s.team2.name || '', color: s.team2.color || '' });
    };
    const onTimer = ({ timeLeft, kind }) => { setTimeLeft(timeLeft); setTimerKind(kind); };
    const onHistory = ({ messages }) => setMyTeamChat(messages || []);
    const onMsg = ({ entry }) => setMyTeamChat(prev => [...prev, entry]);

    socket.on('mttt_state', onState);
    socket.on('mttt_timer', onTimer);
    socket.on('mttt_chat_history', onHistory);
    socket.on('mttt_chat_message', onMsg);

    return () => {
      socket.off('mttt_state', onState);
      socket.off('mttt_timer', onTimer);
      socket.off('mttt_chat_history', onHistory);
      socket.off('mttt_chat_message', onMsg);
    };
  }, [socket, roomCode, myId]);

  // Play sound on win
  useEffect(() => {
    if (game?.phase === 'ended' && game.winner) {
      const key = `${game.groupId}-${game.winner.team}-${game.cells.filter(Boolean).length}`;
      if (lastWinnerKey.current !== key) {
        lastWinnerKey.current = key;
        playSound('win');
      }
    }
  }, [game]);

  /* ---------- Emit helpers ---------- */
  const emit = (ev, payload = {}) => socket.emit(ev, { roomCode, ...payload });
  const setMode = m => emit('mttt_admin_set_mode', { mode: m });
  const setCategory = c => emit('mttt_admin_set_category', { category: c });
  const setGameType = gt => emit('mttt_admin_set_gametype', { gameType: gt });
  const submitCaptains = () => captain1Id && captain2Id && captain1Id !== captain2Id &&
    emit('mttt_set_captains', { captain1Id, captain2Id });
  const saveTeamInfo = (t, d) => emit('mttt_set_team_info', { playerId: myId, team: t, name: d.name, color: d.color });
  const draftPick = id => emit('mttt_draft_pick', { playerId: myId, pickedId: id });
  const claimSlot = (slot, d) => d.name.trim() && d.color &&
    emit('mttt_claim_solo_slot', { playerId: myId, slot, name: d.name, color: d.color });
  const selectCell = i => emit('mttt_select_cell', { playerId: myId, cellIndex: i });
  const selectCol = c => emit('mttt_select_col', { playerId: myId, col: c });
  const submitAnswer = () => {
    if (!answerInput.trim()) return;
    emit('mttt_submit_answer', { playerId: myId, text: answerInput });
    setAnswerInput('');
  };
  const vote = ok => emit('mttt_vote', { playerId: myId, correct: ok });
  const sendChat = () => {
    if (!chatInput.trim()) return;
    emit('mttt_chat_send', { playerId: myId, text: chatInput });
    setChatInput('');
  };
  const newRound = () => emit('mttt_new_round');
  const resetAll = () => emit('mttt_reset');

  /* ---------- Loading ---------- */
  if (!game) {
    return (
      <div className="fixed inset-0 z-[900] flex items-center justify-center"
        style={{ background: `radial-gradient(circle at 50% 40%, ${C.bg1}, ${C.bg0})` }}>
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto rounded-full"
            style={{
              border: '3px solid transparent',
              borderTopColor: C.cinema.primary,
              borderRightColor: C.football.primary,
            }} />
          <p className="mt-4 text-sm font-black" style={{ color: C.muted }}>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const nonAdmins = players.filter(p => !p.isAdmin);
  const isTTT = game.gameType === 'ttt';
  const isC4 = game.gameType === 'c4';
  const active = teamOf(game.activeTeam);
  const isVoting = !!game.pendingAnswer;
  const isTeamMode = game.mode === 'team';
  const canActForMyTeam = myTeam === game.activeTeam;
  const canVote = isVoting && myTeam && myTeam !== game.pendingAnswer?.team;
  const timerMax = timerKind === 'vote' ? 20 : 45;
  const timerPct = Math.max(0, Math.min(100, (timeLeft / timerMax) * 100));

  const selectedCellIndex = game.selectedCell;
  const selectedColIndex = game.selectedCol;

  const selectedRowItem = selectedCellIndex !== null
    ? (isTTT
        ? game.rowItems[Math.floor(selectedCellIndex / 3)]
        : game.rowItems[Math.floor(selectedCellIndex / C4_COLS)])
    : null;
  const selectedColItem = selectedCellIndex !== null
    ? (isTTT
        ? game.colItems[selectedCellIndex % 3]
        : game.colItems[selectedCellIndex % C4_COLS])
    : null;

  /* ============================================================
     SETUP SCREENS
     ============================================================ */

  /* -------- MODE -------- */
  if (game.phase === 'mode') return (
    <Shell>
      <Header title="XO السينمائية / كورة" accent={accent} onExit={onExit} phaseLabel="اختيار النمط" />
      <SetupShell accent={accent} emoji="🎮" title="اختر نمط اللعب" subtitle="فردي ولا فريقي؟">
        {isAdmin ? (
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <ChoiceCard emoji="👤" title="لعب فردي" desc="لاعب ضد لاعب" accent={accent} onClick={() => setMode('solo')} />
            <ChoiceCard emoji="👥" title="لعب جماعي" desc="فريقين + قادة" accent={accent} onClick={() => setMode('team')} />
          </div>
        ) : <Waiting text="بانتظار الأدمن لاختيار النمط..." accent={accent} />}
      </SetupShell>
    </Shell>
  );

  /* -------- CATEGORY -------- */
  if (game.phase === 'category') return (
    <Shell>
      <Header title="XO السينمائية / كورة" accent={accent} onExit={onExit} phaseLabel="اختيار الفئة" />
      <SetupShell accent={accent} emoji="🎯" title="اختر الفئة" subtitle="سينما ولا كورة؟">
        {isAdmin ? (
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <ChoiceCard emoji="🎬" title="سينما" desc="ممثلين وأفلام مصرية" accent={C.cinema} onClick={() => setCategory('cinema')} />
            <ChoiceCard emoji="⚽" title="كورة" desc="لاعبين وأندية عالمية" accent={C.football} onClick={() => setCategory('football')} />
          </div>
        ) : <Waiting text="بانتظار الأدمن لاختيار الفئة..." accent={accent} />}
      </SetupShell>
    </Shell>
  );

  /* -------- GAME TYPE -------- */
  if (game.phase === 'gameType') return (
    <Shell>
      <Header title={`${CATEGORY_INFO[game.category]?.title} — اختر النوع`} accent={accent} onExit={onExit} phaseLabel="اختيار اللعبة" />
      <SetupShell accent={accent} emoji={CATEGORY_INFO[game.category]?.emoji} title="اختر نوع اللعبة" subtitle="إكس أو عادي ولا كونكت فور؟">
        {isAdmin ? (
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <ChoiceCard emoji="⭕" title="Tic Tac Toe" desc="3×3 — اربح بـ 3 في خط" accent={accent} onClick={() => setGameType('ttt')} />
            <ChoiceCard emoji="🔴" title="Connect 4" desc="6×7 — اربح بـ 4 في خط" accent={accent} onClick={() => setGameType('c4')} />
          </div>
        ) : <Waiting text="بانتظار الأدمن لاختيار نوع اللعبة..." accent={accent} />}
      </SetupShell>
    </Shell>
  );

  /* -------- CAPTAINS -------- */
  if (game.phase === 'captains') return (
    <Shell>
      <Header title="اختيار القادة" accent={accent} onExit={onExit} phaseLabel="القادة" />
      <SetupShell accent={accent} emoji="👑" title="اختر قادة الفريقين" subtitle="كل قائد هيسمي فريقه ويختار الأعضاء">
        {isAdmin ? (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <PlayerSelect
                label="👑 قائد الفريق الأول"
                value={captain1Id}
                onChange={setCaptain1Id}
                options={nonAdmins.filter(p => p.id !== captain2Id)}
                accent={accent} />
              <PlayerSelect
                label="👑 قائد الفريق الثاني"
                value={captain2Id}
                onChange={setCaptain2Id}
                options={nonAdmins.filter(p => p.id !== captain1Id)}
                accent={accent} />
            </div>
            <div className="flex justify-center mt-6">
              <GlassBtn
                onClick={submitCaptains}
                disabled={!captain1Id || !captain2Id || captain1Id === captain2Id}
                accent={accent}
                variant="primary"
                style={{ padding: '12px 32px' }}>
                ✓ تأكيد القادة
              </GlassBtn>
            </div>
          </>
        ) : <Waiting text="بانتظار الأدمن لتحديد القادة..." accent={accent} />}
      </SetupShell>
    </Shell>
  );

  /* -------- TEAM SETUP -------- */
  if (game.phase === 'team_setup') {
    const iAmCaptain1 = myId === game.team1.captainId;
    const iAmCaptain2 = myId === game.team2.captainId;
    const currentDraftTeam = teamOf(game.draftTurn);
    const iAmCurrentCaptain = myId === currentDraftTeam?.captainId;
    return (
      <Shell>
        <Header title="تجهيز الفرق" accent={accent} onExit={onExit} phaseLabel="الفرق" />
        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="text-center mb-2">
              <h2 className="text-2xl font-black" style={{ color: C.text }}>⚔️ تجهيز الفرق</h2>
              <p className="text-xs" style={{ color: C.muted }}>كل قائد يسمي فريقه، يختار لونه، ويسحب أعضاء</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <TeamInfoForm
                label={`الفريق 1 — ${playerName(game.team1.captainId)}`}
                editable={iAmCaptain1}
                draft={team1Draft}
                setDraft={setTeam1Draft}
                otherColor={team2Draft.color}
                onSave={d => saveTeamInfo(1, d)}
                saved={game.team1}
                accent={accent} />
              <TeamInfoForm
                label={`الفريق 2 — ${playerName(game.team2.captainId)}`}
                editable={iAmCaptain2}
                draft={team2Draft}
                setDraft={setTeam2Draft}
                otherColor={team1Draft.color}
                onSave={d => saveTeamInfo(2, d)}
                saved={game.team2}
                accent={accent} />
            </div>

            {game.draftPool.length > 0 && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-2">
                  <span
                    className="inline-block px-4 py-1.5 rounded-full font-black text-sm"
                    style={{
                      background: currentDraftTeam?.color
                        ? `linear-gradient(135deg, ${currentDraftTeam.color}, ${currentDraftTeam.color}90)`
                        : `linear-gradient(135deg, rgba(${accent.rgb},0.6), rgba(${accent.rgb},0.2))`,
                      color: '#0a0b10',
                      boxShadow: `0 6px 20px ${currentDraftTeam?.color || `rgba(${accent.rgb},0.4)`}66`,
                    }}>
                    🎯 دور {currentDraftTeam?.name || 'الفريق'}
                    {iAmCurrentCaptain && ' (دورك!)'}
                  </span>
                </motion.div>

                <GlassPanel accent={accent} className="p-4">
                  <div className="text-xs font-black mb-2" style={{ color: C.muted }}>اللاعبون المتاحون</div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {game.draftPool.map(id => (
                      <motion.button
                        key={id}
                        onClick={() => iAmCurrentCaptain && draftPick(id)}
                        disabled={!iAmCurrentCaptain}
                        whileHover={iAmCurrentCaptain ? { y: -2, scale: 1.03 } : {}}
                        whileTap={iAmCurrentCaptain ? { scale: 0.97 } : {}}
                        className="px-4 py-2 rounded-xl font-bold text-sm"
                        style={{
                          background: `linear-gradient(145deg, rgba(${accent.rgb},0.2), rgba(${accent.rgb},0.05))`,
                          backdropFilter: 'blur(12px)',
                          border: `1px solid rgba(${accent.rgb},0.4)`,
                          color: C.text,
                          cursor: iAmCurrentCaptain ? 'pointer' : 'not-allowed',
                          opacity: iAmCurrentCaptain ? 1 : 0.5,
                        }}>
                        {playerName(id)}
                      </motion.button>
                    ))}
                  </div>
                </GlassPanel>

                <div className="grid sm:grid-cols-2 gap-4">
                  <RosterCard team={game.team1} playerName={playerName} />
                  <RosterCard team={game.team2} playerName={playerName} />
                </div>
              </>
            )}

            <p className="text-center text-xs mt-4" style={{ color: C.dim }}>
              ⚡ اللعبة هتبدأ أوتوماتيك لما الفريقين يخلصوا
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  /* -------- SOLO SLOTS -------- */
  if (game.phase === 'solo_slots') {
    const mySlot = game.team1.captainId === myId ? 1 : game.team2.captainId === myId ? 2 : null;
    return (
      <Shell>
        <Header title="XO فردي" accent={accent} onExit={onExit} phaseLabel="الأسماء والألوان" />
        <SetupShell accent={accent} emoji="✍️" title="اكتب اسمك واختار لونك" subtitle="اللي يخلص الأول يبدأ اللعبة أوتوماتيك">
          <div className="grid sm:grid-cols-2 gap-4">
            <SoloSlot slot={1} team={game.team1} otherColor={game.team2.color}
              myId={myId} mySlot={mySlot} draft={soloDraft1} setDraft={setSoloDraft1}
              onClaim={() => claimSlot(1, soloDraft1)} accent={accent} />
            <SoloSlot slot={2} team={game.team2} otherColor={game.team1.color}
              myId={myId} mySlot={mySlot} draft={soloDraft2} setDraft={setSoloDraft2}
              onClaim={() => claimSlot(2, soloDraft2)} accent={accent} />
          </div>
        </SetupShell>
      </Shell>
    );
  }

  /* ============================================================
     PLAYING / ENDED
     ============================================================ */
  const timerColor = isVoting
    ? teamOf(game.pendingAnswer.team)?.color
    : active?.color;

  return (
    <Shell>
      <Header
        title={`${CATEGORY_INFO[game.category]?.emoji} ${CATEGORY_INFO[game.category]?.title} — ${isTTT ? 'XO' : 'Connect 4'}`}
        accent={accent}
        onExit={onExit}
        phaseLabel={isTeamMode ? 'فريقي' : 'فردي'}
        extra={isAdmin && (
          <>
            <GlassBtn onClick={newRound} accent={accent} style={{ padding: '8px 12px' }}>
              <FaRedo size={11} />
              <span className="hidden sm:inline text-xs">مجموعة</span>
            </GlassBtn>
            <GlassBtn onClick={resetAll} variant="ghost" style={{ padding: '8px 12px' }}>
              <span className="text-xs">↩️</span>
            </GlassBtn>
          </>
        )} />

      <div className="relative z-10 flex-1 overflow-hidden p-3 sm:p-5 flex flex-col">

        {/* ---- Timer Bar ---- */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-2 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <span
              className="px-4 py-1.5 rounded-full font-black text-sm"
              style={{
                background: timerColor
                  ? `linear-gradient(135deg, ${timerColor}, ${timerColor}90)`
                  : `rgba(${accent.rgb},0.3)`,
                color: '#0a0b10',
                boxShadow: `0 4px 16px ${timerColor || `rgba(${accent.rgb},0.4)`}66`,
              }}>
              {isVoting
                ? `⏳ ${teamOf(game.pendingAnswer.team)?.name} — بانتظار التصويت`
                : `🎯 دور: ${active?.name}`}
            </span>
            <span className="text-xs font-black tabular-nums" style={{ color: C.muted }}>
              {timeLeft}s
            </span>
          </div>
          <div className="w-72 h-1.5 rounded-full overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.5)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)' }}>
            <motion.div
              animate={{ width: `${timerPct}%` }}
              transition={{ duration: 1, ease: 'linear' }}
              className="h-full rounded-full"
              style={{
                background: timerColor
                  ? `linear-gradient(90deg, ${timerColor}, ${timerColor}cc)`
                  : `linear-gradient(90deg, rgb(${accent.rgb}), rgba(${accent.rgb},0.5))`,
                boxShadow: `0 0 12px ${timerColor || `rgba(${accent.rgb},0.6)`}`,
              }} />
          </div>
        </motion.div>

        {/* ---- Main area ---- */}
        <div className={`flex-1 flex ${isTeamMode && myTeam ? 'lg:flex-row flex-col' : ''} gap-4 overflow-hidden`}>

          {/* Board column */}
          <div className={`flex-1 flex flex-col gap-3 overflow-y-auto min-w-0 ${
            (game.phase === 'playing' && selectedCellIndex !== null) || isVoting
              ? 'pb-48 sm:pb-44'
              : 'pb-4'
          }`}>

            {/* ============ TTT BOARD ============ */}
            {isTTT && (
              <div className="flex justify-center">
                <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'minmax(72px,auto) repeat(3,1fr)', maxWidth: 560, width: '100%' }}>
                  <div />
                  {game.colItems.map((item, i) => (
                    <ClueHeader key={'c'+i} item={item} accent={accent} />
                  ))}
                  {game.rowItems.map((rowItem, r) => (
                    <React.Fragment key={'r'+r}>
                      <ClueHeader item={rowItem} accent={accent} />
                      {[0,1,2].map(c => {
                        const idx = r * 3 + c;
                        const cell = game.cells[idx];
                        const isSelected = selectedCellIndex === idx;
                        const isPending = isVoting && game.pendingAnswer.cellIndex === idx;
                        return (
                          <TttCell
                            key={idx}
                            cell={cell}
                            cellTeam={cell ? teamOf(cell.team) : null}
                            isSelected={isSelected}
                            isPending={isPending}
                            pendingColor={isPending ? teamOf(game.pendingAnswer.team)?.color : null}
                            onClick={() => selectCell(idx)}
                            clickable={!cell && game.phase === 'playing' && !isVoting && canActForMyTeam}
                            accent={accent} />
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* ============ C4 BOARD ============ */}
            {isC4 && (() => {
              const CELL = 76;
              const GAP = 4;
              const ROW_W = 68;
              return (
                <div className="overflow-x-auto overflow-y-hidden pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <div style={{
                    minWidth: ROW_W + C4_COLS * (CELL + GAP),
                    width: 'max-content',
                    margin: '0 auto',
                  }}>
                    {/* Col headers */}
                    <div style={{ display: 'flex', paddingBottom: GAP }}>
                      <div style={{ width: ROW_W, minWidth: ROW_W, flexShrink: 0 }} />
                      <div style={{ display: 'flex', gap: GAP }}>
                        {game.colItems.map((item, c) => (
                          <button
                            key={'ch'+c}
                            onClick={() => canActForMyTeam && !isVoting && game.phase === 'playing' && selectCol(c)}
                            style={{
                              width: CELL, minWidth: CELL, flexShrink: 0,
                              background: selectedColIndex === c ? `rgba(${accent.rgb},0.14)` : 'transparent',
                              border: `1.5px solid ${selectedColIndex === c ? `rgba(${accent.rgb},0.6)` : 'transparent'}`,
                              borderRadius: 12,
                              padding: 2,
                              cursor: canActForMyTeam && !isVoting && game.phase === 'playing' ? 'pointer' : 'default',
                              transition: 'all 0.2s',
                            }}>
                            <ClueHeader item={item} small accent={accent} />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rows */}
                    {game.rowItems.map((rowItem, r) => (
                      <div key={'row'+r} style={{ display: 'flex', marginTop: GAP, minHeight: CELL }}>
                        <div style={{
                          width: ROW_W, minWidth: ROW_W, flexShrink: 0, height: CELL,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <ClueHeader item={rowItem} small accent={accent} />
                        </div>
                        <div style={{ display: 'flex', gap: GAP }}>
                          {Array.from({ length: C4_COLS }, (_, c) => {
                            const idx = r * C4_COLS + c;
                            const cell = game.cells[idx];
                            const isPending = isVoting && game.pendingAnswer?.cellIndex === idx;
                            const isHighlighted = selectedColIndex === c && !cell && canActForMyTeam && !isVoting && game.phase === 'playing';
                            return (
                              <div key={c} style={{ width: CELL, minWidth: CELL, height: CELL }}>
                                <C4Cell
                                  cell={cell}
                                  cellTeam={cell ? teamOf(cell.team) : null}
                                  isPending={isPending}
                                  pendingColor={isPending ? teamOf(game.pendingAnswer?.team)?.color : null}
                                  isHighlighted={isHighlighted}
                                  activeColor={active?.color} />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ---- Chat ---- */}
          {isTeamMode && myTeam && (
            <div className="lg:w-72 shrink-0">
              <ChatBox
                accent={{ rgb: hexToRgb(teamOf(myTeam)?.color) || accent.rgb }}
                team={teamOf(myTeam)}
                messages={myTeamChat}
                input={chatInput}
                setInput={setChatInput}
                onSend={sendChat} />
            </div>
          )}
        </div>
      </div>

      {/* ═════ الطبقة العائمة السفلية: إدخال الإجابة / الانتظار / التصويت ═════ */}
      <AnimatePresence>
        {/* ---- Answer Input ---- */}
        {game.phase === 'playing' && !isVoting && selectedCellIndex !== null && canActForMyTeam && (
          <motion.div
            key="answer-overlay"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed left-0 right-0 bottom-0 z-[60] px-3 sm:px-4 pb-3 sm:pb-4"
            style={{
              background: 'linear-gradient(to top, rgba(5,5,15,0.98) 0%, rgba(5,5,15,0.9) 60%, transparent 100%)',
              paddingTop: 40,
            }}>
            <GlassPanel accent={accent} className="p-4 max-w-xl mx-auto">
              <div className="text-sm font-black mb-2 text-center" style={{ color: C.text }}>
                <span style={{ color: active?.color }}>{selectedRowItem?.label}</span>
                <span className="mx-2" style={{ color: C.dim }}>×</span>
                <span style={{ color: active?.color }}>{selectedColItem?.label}</span>
              </div>
              <div className="flex gap-2">
                <input
                  value={answerInput}
                  onChange={e => setAnswerInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitAnswer()}
                  placeholder="اكتب اسم الفنان اللي يحقق الشرطين..."
                  autoFocus
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: 'rgba(0,0,0,0.35)',
                    border: `1px solid rgba(${accent.rgb},0.3)`,
                    color: C.text,
                  }} />
                <GlassBtn
                  onClick={submitAnswer}
                  disabled={!answerInput.trim()}
                  accent={{ rgb: hexToRgb(active?.color) || accent.rgb }}
                  variant="primary"
                  style={{ padding: '10px 20px', fontSize: 13 }}>
                  اعتماد
                </GlassBtn>
              </div>
            </GlassPanel>
          </motion.div>
        )}

        {/* ---- Waiting for my team ---- */}
        {game.phase === 'playing' && !isVoting && selectedCellIndex !== null && !canActForMyTeam && (
          <motion.div
            key="wait-overlay"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed left-0 right-0 bottom-0 z-[60] px-3 sm:px-4 pb-3 sm:pb-4"
            style={{
              background: 'linear-gradient(to top, rgba(5,5,15,0.98) 0%, rgba(5,5,15,0.9) 60%, transparent 100%)',
              paddingTop: 40,
            }}>
            <GlassPanel accent={accent} className="p-4 max-w-xl mx-auto text-center">
              <div className="text-xs mb-1" style={{ color: C.muted }}>{active?.name} اختار:</div>
              <div className="text-lg font-black mb-1" style={{ color: active?.color }}>
                <span>{selectedRowItem?.label}</span>
                <span className="mx-2" style={{ color: C.dim }}>×</span>
                <span>{selectedColItem?.label}</span>
              </div>
              <div className="text-xs animate-pulse" style={{ color: C.dim }}>
                ⏳ في انتظار إجابتهم...
              </div>
            </GlassPanel>
          </motion.div>
        )}

        {/* ---- Voting ---- */}
        {isVoting && (
          <motion.div
            key="vote-overlay"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="fixed left-0 right-0 bottom-0 z-[60] px-3 sm:px-4 pb-3 sm:pb-4"
            style={{
              background: 'linear-gradient(to top, rgba(5,5,15,0.98) 0%, rgba(5,5,15,0.9) 60%, transparent 100%)',
              paddingTop: 40,
            }}>
            <GlassPanel accent={accent} className="p-4 sm:p-5 max-w-xl mx-auto text-center">
              <div className="text-xs mb-1" style={{ color: C.muted }}>
                {teamOf(game.pendingAnswer.team)?.name} قال إن الإجابة هي:
              </div>
              <div className="text-xl sm:text-2xl font-black mb-3"
                style={{ color: teamOf(game.pendingAnswer.team)?.color }}>
                {game.pendingAnswer.text}
              </div>
              {canVote ? (
                (() => {
                  const alreadyVoted = game.votes && game.votes[myId] !== undefined;
                  return alreadyVoted ? (
                    <div className="text-sm font-black" style={{ color: C.football.primary }}>
                      ✅ تم التصويت — بانتظار باقي أعضاء فريقك
                      <div className="text-xs mt-1" style={{ color: C.muted }}>
                        ({game.voteCount} من {game.voteNeeded} صوّتوا)
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-2 sm:gap-3">
                      <GlassBtn
                        onClick={() => vote(true)}
                        accent={{ rgb: '34,197,94' }}
                        variant="primary"
                        style={{ padding: '10px 24px', fontSize: 14 }}>
                        ✅ صحيح
                      </GlassBtn>
                      <GlassBtn
                        onClick={() => vote(false)}
                        variant="danger"
                        style={{ padding: '10px 24px', fontSize: 14 }}>
                        ❌ غلط
                      </GlassBtn>
                    </div>
                  );
                })()
              ) : (
                <div className="text-sm" style={{ color: C.muted }}>
                  ⏳ في انتظار تصويت {teamOf(otherTeam(game.pendingAnswer.team))?.name}...
                  {game.voteNeeded > 0 && (
                    <div className="text-xs mt-1" style={{ color: C.dim }}>
                      ({game.voteCount} من {game.voteNeeded} صوّتوا)
                    </div>
                  )}
                </div>
              )}
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ---- Winner modal ---- */}
      <AnimatePresence>
        {game.phase === 'ended' && game.winner && (
          <WinnerModal
            winner={game.winner}
            game={game}
            teamOf={teamOf}
            isAdmin={isAdmin}
            onNewRound={newRound}
            onReset={resetAll}
            onExit={onExit} />
        )}
      </AnimatePresence>
    </Shell>
  );
}

/* ============================================================
   Sub Components
   ============================================================ */
function Shell({ children }) {
  return (
    <div className="fixed inset-0 z-[900] flex flex-col overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 50% -10%, ${C.bg1} 0%, ${C.bg0} 60%, #000 100%)`,
      }}>
      {/* نقاط خلفية ناعمة */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)`,
          backgroundSize: '44px 44px',
        }} />
      {children}
    </div>
  );
}

function PlayerSelect({ label, value, onChange, options, accent }) {
  return (
    <GlassPanel accent={accent} className="p-4">
      <div className="font-black mb-2 text-sm" style={{ color: C.text }}>{label}</div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
        style={{
          background: 'rgba(0,0,0,0.35)',
          border: `1px solid rgba(${accent.rgb},0.3)`,
          color: C.text,
        }}>
        <option value="">اختر لاعب</option>
        {options.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
    </GlassPanel>
  );
}

function ColorSwatchPicker({ value, onChange, disabledHex, disabled }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PALETTE.map(c => {
        const isDisabled = disabledHex === c.hex;
        const isSelected = value === c.hex;
        return (
          <motion.button
            key={c.hex}
            type="button"
            disabled={disabled || isDisabled}
            onClick={() => onChange(c.hex)}
            title={c.name}
            whileHover={!disabled && !isDisabled ? { scale: 1.1 } : {}}
            whileTap={!disabled && !isDisabled ? { scale: 0.9 } : {}}
            className="rounded-full"
            style={{
              width: 32, height: 32,
              background: `radial-gradient(circle at 30% 25%, ${c.hex}, ${c.hex}cc)`,
              boxShadow: isSelected
                ? `0 0 0 3px ${C.bg0}, 0 0 0 5px ${c.hex}, 0 0 20px ${c.hex}80`
                : `0 4px 12px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3)`,
              opacity: disabled || isDisabled ? 0.25 : 1,
              cursor: disabled || isDisabled ? 'not-allowed' : 'pointer',
              border: '1px solid rgba(255,255,255,0.2)',
            }} />
        );
      })}
    </div>
  );
}

function TeamInfoForm({ label, editable, draft, setDraft, otherColor, onSave, saved, accent }) {
  const ready = draft.name?.trim() && draft.color && draft.color !== otherColor;
  return (
    <GlassPanel accent={accent} className="p-4">
      <div className="font-black mb-2 text-sm" style={{ color: C.text }}>{label}</div>
      {saved?.name && saved?.color && (
        <div className="mb-2 text-xs font-bold flex items-center gap-2" style={{ color: saved.color }}>
          <span className="w-3 h-3 rounded-full" style={{ background: saved.color }} />
          محفوظ: {saved.name}
        </div>
      )}
      <input
        value={draft.name}
        disabled={!editable}
        onChange={e => setDraft({ ...draft, name: e.target.value })}
        placeholder="اسم الفريق"
        className="w-full mb-3 px-3 py-2 rounded-xl text-sm outline-none disabled:opacity-50"
        style={{
          background: 'rgba(0,0,0,0.35)',
          border: `1px solid rgba(${accent.rgb},0.3)`,
          color: C.text,
        }} />
      <ColorSwatchPicker
        value={draft.color}
        onChange={hex => setDraft({ ...draft, color: hex })}
        disabledHex={otherColor}
        disabled={!editable} />
      {editable ? (
        <div className="mt-3">
          <GlassBtn onClick={() => onSave(draft)} disabled={!ready} accent={accent} variant="primary" style={{ padding: '8px 20px', fontSize: 13 }}>
            💾 حفظ
          </GlassBtn>
        </div>
      ) : (
        <p className="text-xs mt-2" style={{ color: C.dim }}>بانتظار القائد...</p>
      )}
    </GlassPanel>
  );
}

function SoloSlot({ slot, team, otherColor, myId, mySlot, draft, setDraft, onClaim, accent }) {
  const claimed = !!team.captainId;
  const isMe = team.captainId === myId;
  const blocked = mySlot !== null && mySlot !== slot && !claimed;

  if (claimed) return (
    <GlassPanel accent={{ rgb: hexToRgb(team.color) }} className="p-4">
      <div className="text-xs font-bold mb-1" style={{ color: C.muted }}>اللاعب {slot}</div>
      <div className="text-xl font-black flex items-center gap-2" style={{ color: team.color }}>
        {team.name}
        {isMe && <span className="text-xs" style={{ color: C.muted }}>(أنت)</span>}
      </div>
    </GlassPanel>
  );

  const ready = draft.name?.trim() && draft.color && draft.color !== otherColor;

  return (
    <GlassPanel accent={accent} className="p-4">
      <div className="text-sm font-black mb-3" style={{ color: C.text }}>✍️ اللاعب {slot}</div>
      {blocked ? (
        <p className="text-xs" style={{ color: C.dim }}>معاك خانة تانية بالفعل</p>
      ) : (
        <>
          <input
            value={draft.name}
            onChange={e => setDraft({ ...draft, name: e.target.value })}
            placeholder="اكتب اسمك"
            className="w-full mb-3 px-3 py-2 rounded-xl text-sm outline-none"
            style={{
              background: 'rgba(0,0,0,0.35)',
              border: `1px solid rgba(${accent.rgb},0.3)`,
              color: C.text,
            }} />
          <ColorSwatchPicker
            value={draft.color}
            onChange={hex => setDraft({ ...draft, color: hex })}
            disabledHex={otherColor} />
          <div className="mt-3">
            <GlassBtn onClick={onClaim} disabled={!ready} accent={accent} variant="primary" style={{ padding: '8px 20px', fontSize: 13 }}>
              ✓ تأكيد
            </GlassBtn>
          </div>
        </>
      )}
    </GlassPanel>
  );
}

function RosterCard({ team, playerName }) {
  const rgb = hexToRgb(team.color) || '148,163,184';
  return (
    <GlassPanel accent={{ rgb }} className="p-4">
      <div className="font-black mb-2 text-sm flex items-center gap-2" style={{ color: team.color }}>
        <span className="w-3 h-3 rounded-full" style={{ background: team.color, boxShadow: `0 0 10px ${team.color}` }} />
        {team.name || 'فريق'}
      </div>
      <div className="flex flex-wrap gap-2">
        {team.memberIds?.map(id => (
          <span
            key={id}
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: `linear-gradient(145deg, ${team.color}22, ${team.color}08)`,
              border: `1px solid ${team.color}80`,
              color: C.text,
            }}>
            {playerName(id)}
          </span>
        ))}
      </div>
    </GlassPanel>
  );
}