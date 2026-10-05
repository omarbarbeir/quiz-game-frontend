import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RulesModal from './RulesModal';

const C = {
  bg0: '#050510', border: '#1e1e35',
  red: '#dc2626', green: '#10b981',
  amber: '#f59e0b', purple: '#a855f7',
  blue: '#2563eb', pink: '#ec4899',
  text: '#e5e7eb', textDim: '#94a3b8', textMuted: '#64748b',
};

const THEME_LIST = [
  { id: 'animals', name: 'حيوانات', emoji: '🐶' },
  { id: 'fruits', name: 'فواكه', emoji: '🍎' },
  { id: 'vehicles', name: 'عربيات', emoji: '🚗' },
  { id: 'landmarks', name: 'معالم', emoji: '🗽' },
  { id: 'nature', name: 'طبيعة', emoji: '🌳' },
  { id: 'sports', name: 'رياضة', emoji: '⚽' },
  { id: 'objects', name: 'أشياء', emoji: '🎮' },
];

// =====================================================
// 🖼️ Twemoji URL — cdnjs أساسي، jsdelivr احتياطي
// =====================================================
function emojiToCodepoint(emoji) {
  const codepoints = [];
  for (const char of emoji) {
    const cp = char.codePointAt(0);
    if (cp === 0xFE0F) continue;
    codepoints.push(cp.toString(16));
  }
  return codepoints.join('-');
}

function twemojiPrimary(emoji) {
  const cp = emojiToCodepoint(emoji);
  return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${cp}.svg`;
}
function twemojiFallback(emoji) {
  const cp = emojiToCodepoint(emoji);
  return `https://cdn.jsdelivr.net/npm/twemoji@14.0.2/assets/svg/${cp}.svg`;
}

// =====================================================
// 🔊 Audio (Web Audio API)
// =====================================================
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (e) { return null; }
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}
function playTones(freqs, durations, gainVal = 0.06, type = 'sine') {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.connect(gain);
  gain.connect(ctx.destination);
  let t = ctx.currentTime;
  freqs.forEach((f, i) => { osc.frequency.setValueAtTime(f, t); t += durations[i]; });
  const totalDur = t - ctx.currentTime;
  gain.gain.setValueAtTime(gainVal, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + totalDur);
  osc.start(ctx.currentTime);
  osc.stop(t + 0.02);
}
const playFlip = () => playTones([350, 550], [0.03, 0.05], 0.05, 'triangle');
const playMatch = () => {
  playTones([523, 659, 784], [0.07, 0.07, 0.16], 0.09, 'sine');
  setTimeout(() => playTones([1046], [0.18], 0.06, 'sine'), 140);
};
const playMiss = () => playTones([280, 180], [0.09, 0.16], 0.06, 'sawtooth');


// =====================================================
// 🎴 Memory Card — الإيموجي نص أساسي، الصورة تحسين اختياري
// =====================================================
const MemoryCard = ({ card, width, height, onClick, disabled, isFlipped, isMatched }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
    setImgFailed(false);
  }, [card.imageUrl]);

  const flipped = isFlipped || isMatched;
  const showImage = flipped && card.imageUrl && imgLoaded && !imgFailed;

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={{
        width, height, perspective: 800,
        cursor: !disabled && !flipped ? 'pointer' : 'default',
      }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          width: '100%', height: '100%', position: 'relative',
          transformStyle: 'preserve-3d', willChange: 'transform',
        }}
      >
        {/* الوش (المقلوب) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          borderRadius: 8,
          background: 'linear-gradient(135deg, #312e81 0%, #7c3aed 50%, #312e81 100%)',
          border: `1.5px solid ${C.purple}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `inset 0 0 12px rgba(168,85,247,0.35)`,
        }}>
          <span style={{ fontSize: width * 0.42, color: '#c4b5fd', fontWeight: 900 }}>?</span>
        </div>

        {/* الضهر (الإيموجي + الصورة اختياريًا) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          borderRadius: 8,
          background: isMatched
            ? `linear-gradient(135deg, ${C.green}40, ${C.green}15)`
            : `linear-gradient(145deg, #fefefe, #e8e8f0)`,
          border: isMatched ? `2px solid ${C.green}` : '1.5px solid #cbd5e1',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 3,
          overflow: 'hidden',
          boxShadow: isMatched ? `0 0 14px ${C.green}80` : 'none',
        }}>
          {/* ✅ الإيموجي كنص — مضمون يظهر فورًا على كل المتصفحات */}
          {flipped && card.emoji && (
            <span style={{
              fontSize: Math.min(width, height) * 0.62,
              lineHeight: 1,
              userSelect: 'none',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
              visibility: showImage ? 'hidden' : 'visible',
            }}>
              {card.emoji}
            </span>
          )}

          {/* الصورة تحميل اختياري — بتظهر بس لو نجحت */}
          {flipped && card.imageUrl && !imgFailed && (
            <img
              src={card.imageUrl}
              alt=""
              draggable={false}
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgFailed(true)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                padding: 3,
                pointerEvents: 'none',
                userSelect: 'none',
                opacity: showImage ? 1 : 0,
                transition: 'opacity 0.2s',
              }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

// =====================================================
// 🎮 Main Component
// =====================================================
export default function MemoryGrid({
  socket, roomCode, playerId, playerName, isAdmin = false, onExit, players: roomPlayers = [],
}) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [showMatchPopup, setShowMatchPopup] = useState(null);
  const [showMissPopup, setShowMissPopup] = useState(null);
  const [dims, setDims] = useState({ w: 70, h: 98 });
  const [elapsed, setElapsed] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const prevStateRef = useRef(null);

  // 🔊 Socket
  useEffect(() => {
    if (!socket) return;
    const onState = (s) => {
      const prev = prevStateRef.current;
      if (s.lastMatch && (!prev || prev.lastMatch?.timestamp !== s.lastMatch.timestamp)) {
        playMatch();
        setShowMatchPopup(s.lastMatch);
        setTimeout(() => setShowMatchPopup(null), 1800);
      }
      if (s.lastMiss && (!prev || !prev.lastMiss)) {
        playMiss();
        setShowMissPopup(s.lastMiss);
        setTimeout(() => setShowMissPopup(null), 1500);
      } else if (!s.lastMiss) {
        setShowMissPopup(null);
      }
      prevStateRef.current = s;
      setState(s);
    };
    const onError = ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    };

    socket.on('memory_state', onState);
    socket.on('memory_error', onError);

    // ✅ الأدمن واللاعبين بيدخلوا من نفس الـ join event
    socket.emit('memory_join', { roomCode, playerId, playerName, isAdmin });

    return () => {
      socket.off('memory_state', onState);
      socket.off('memory_error', onError);
      socket.emit('memory_leave', { roomCode });
    };
  }, [socket, roomCode, playerId, playerName, isAdmin]);

  // ✅ بعت ترتيب اللاعبين
  useEffect(() => {
    if (!isAdmin || !socket || !roomCode) return;
    if (!roomPlayers || roomPlayers.length === 0) return;
    // ✅ نشيل فلتر الأدمن — الأدمن بقى لاعب عادي
    const playerIds = roomPlayers.map(p => p.id);
    const t1 = setTimeout(() => socket.emit('memory_set_order', { roomCode, playerIds }), 300);
    const t2 = setTimeout(() => socket.emit('memory_set_order', { roomCode, playerIds }), 1000);
    const t3 = setTimeout(() => socket.emit('memory_set_order', { roomCode, playerIds }), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isAdmin, socket, roomCode, roomPlayers]);

  // ✅ حساب حجم الكارت
  useEffect(() => {
    const calc = () => {
      const cols = state?.gridSize?.cols || 4;
      const vw = window.innerWidth;
      const isMobile = vw < 640;
      const gap = cols > 6 ? 6 : 8;
      const horizontalPad = isMobile ? 8 : 48;
      const widthFromWidth = (vw - horizontalPad - (cols - 1) * gap) / cols;
      let w;
      if (isMobile) {
        const minMobileWidth = cols > 6 ? 55 : 75;
        w = Math.max(minMobileWidth, Math.min(widthFromWidth, 95));
      } else {
        w = Math.min(widthFromWidth, 150);
        w = Math.max(w, 95);
      }
      const aspect = isMobile ? 1.4 : 1.25;
      const h = w * aspect;
      setDims({ w: Math.floor(w), h: Math.floor(h) });
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [state?.gridSize?.cols]);

  // ⏱️ عدّاد الوقت للعب الفردي
  useEffect(() => {
    if (!state?.isSolo || !state?.startTime || state?.phase !== 'playing') {
      setElapsed(0);
      return;
    }
    const tick = () => setElapsed(Math.floor((Date.now() - state.startTime) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [state?.isSolo, state?.startTime, state?.phase]);

  const emit = useCallback((ev, payload) => {
    socket?.emit(ev, { roomCode, ...payload });
  }, [socket, roomCode]);

  const handleCardClick = useCallback((idx) => {
    playFlip();
    socket?.emit('memory_flip', { roomCode, cardIndex: idx });
  }, [socket, roomCode]);

  if (!state) {
    return (
      <div dir="rtl" className="relative min-h-screen  bg-[#050510] text-white flex items-center justify-center">
        <motion.div className="w-16 h-16 rounded-full"
          style={{ border: '3px solid transparent', borderTopColor: C.purple, borderRightColor: C.amber }}
          animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
      </div>
    );
  }

  const { me, phase, isAdmin: iAmAdmin, players, grid, gridSize, currentTurn, currentTurnName, isSolo, startTime } = state;
  const isMyTurn = me?.isTurn;
  const myScore = me?.score || 0;
  const totalPairs = (gridSize.rows * gridSize.cols) / 2;
  const matchedPairs = grid.filter(c => c.matched).length / 2;
  const cols = gridSize.cols;

  // ============================================================
  // HUD
  // ============================================================
  const renderHUD = () => (
    <div className="relative z-30 max-w-7xl mx-auto px-3 sm:px-4 pt-3 ">
      <div className="rounded-2xl px-3 sm:px-4 py-2.5 flex items-center  justify-between gap-3 flex-wrap"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.2))', backdropFilter: 'blur(16px)', border: `1.5px solid ${C.border}` }}>
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="text-slate-400 hover:text-white text-xs flex items-center gap-1">
            <span>←</span><span>خروج</span>
          </button>
          <span className="rounded-xl px-3 py-1.5 text-xs font-black"
            style={{ background: `linear-gradient(135deg, ${C.pink}40, ${C.pink}15)`, border: `2px solid ${C.pink}`, color: 'white' }}>
            🧠 الذاكرة {isSolo && '(فردي)'}
          </span>
          {iAmAdmin && (
            <span className="rounded-lg px-2 py-1 text-[10px] font-black"
              style={{ background: `${C.amber}25`, border: `1px solid ${C.amber}60`, color: C.amber }}>
              🎩 أدمن
            </span>
          )}
          <motion.button onClick={() => setShowLeaderboard(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="rounded-lg px-2.5 py-1 text-[11px] font-bold flex items-center gap-1"
            style={{ background: `${C.amber}15`, border: `1px solid ${C.amber}40`, color: C.amber }}>
            <span>🏆</span><span>الترتيب</span>
          </motion.button>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-center">
            <p className="text-[8px] uppercase tracking-widest" style={{ color: C.textMuted }}>التقدم</p>
            <p className="text-sm font-black text-white">{matchedPairs}/{totalPairs}</p>
          </div>
          {isSolo ? (
            <>
              <div className="text-center">
                <p className="text-[8px] uppercase tracking-widest" style={{ color: C.textMuted }}>الوقت</p>
                <p className="text-sm font-black" style={{ color: C.blue }}>{elapsed}ث</p>
              </div>
              <div className="text-center">
                <p className="text-[8px] uppercase tracking-widest" style={{ color: C.textMuted }}>حركاتك</p>
                <p className="text-sm font-black" style={{ color: C.amber }}>{me?.moves || 0}</p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <p className="text-[8px] uppercase tracking-widest" style={{ color: C.textMuted }}>الدور</p>
                <p className="text-sm font-black" style={{ color: C.amber }}>{currentTurnName || '—'}</p>
              </div>
              {me && (
                <div className="text-center">
                  <p className="text-[8px] uppercase tracking-widest" style={{ color: C.textMuted }}>نقاطك</p>
                  <p className="text-sm font-black" style={{ color: C.green }}>{myScore}</p>
                </div>
              )}
            </>
          )}
        </div>
        <div className="text-xs font-mono hidden sm:block" style={{ color: C.textMuted }}>{roomCode}</div>
      </div>
    </div>
  );

  // ============================================================
  // Admin Controls
  // ============================================================
  const renderAdminControls = () => (
    <div className="mt-6 rounded-2xl p-4 sm:p-5"
      style={{ background: 'linear-gradient(145deg, rgba(168,85,247,0.08), rgba(0,0,0,0.2))', border: `1.5px solid ${C.purple}40` }}>
      <h3 className="text-sm font-black mb-4 flex items-center gap-2" style={{ color: C.purple }}>
        <span>🎩</span><span>لوحة الأدمن</span>
      </h3>

      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: C.textMuted }}>الثيم</p>
        <div className="grid grid-cols-4 gap-2">
          {THEME_LIST.map(t => {
            const active = state.theme === t.id;
            return (
              <motion.button key={t.id}
                onClick={() => emit('memory_set_theme', { theme: t.id })}
                disabled={state.phase === 'playing'}
                whileHover={state.phase !== 'playing' ? { scale: 1.05 } : {}}
                whileTap={state.phase !== 'playing' ? { scale: 0.95 } : {}}
                className="rounded-xl py-2 px-1 font-black text-[10px] flex flex-col items-center gap-0.5 disabled:opacity-40"
                style={{
                  background: active ? `linear-gradient(135deg, ${C.pink}40, ${C.pink}15)` : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${active ? C.pink : C.border}`,
                  color: active ? 'white' : C.textDim,
                }}>
                <span className="text-lg">{t.emoji}</span>
                <span>{t.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: C.textMuted }}>مستوى الصعوبة</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'easy', name: 'سهل', emoji: '🌱', desc: '4×4', color: C.green },
            { id: 'medium', name: 'متوسط', emoji: '🌤️', desc: '6×6', color: C.amber },
            { id: 'hard', name: 'صعب', emoji: '🔥', desc: '8×8', color: C.red },
          ].map(d => {
            const active = state.difficulty === d.id;
            return (
              <motion.button key={d.id}
                onClick={() => emit('memory_set_difficulty', { difficulty: d.id })}
                disabled={state.phase === 'playing'}
                whileHover={state.phase !== 'playing' ? { scale: 1.02 } : {}}
                whileTap={state.phase !== 'playing' ? { scale: 0.98 } : {}}
                className="rounded-xl py-3 px-2 font-black text-xs flex flex-col items-center gap-1 disabled:opacity-40"
                style={{
                  background: active ? `linear-gradient(135deg, ${d.color}40, ${d.color}15)` : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${active ? d.color : C.border}`,
                  color: active ? 'white' : C.textDim,
                }}>
                <span className="text-xl">{d.emoji}</span>
                <span>{d.name}</span>
                <span className="text-[10px] opacity-70">{d.desc}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          disabled={state.phase === 'playing'}
          onClick={() => emit('memory_start')}
          className="rounded-xl py-4 px-4 font-black text-base flex flex-col items-center gap-1.5 disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${C.green}30, ${C.green}15)`, border: `1.5px solid ${C.green}60`, color: C.green }}>
          <span className="text-2xl">🎬</span><span>ابدأ اللعب</span>
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          disabled={state.phase === 'waiting'}
          onClick={() => { if (window.confirm('إعادة تعيين؟')) emit('memory_reset'); }}
          className="rounded-xl py-4 px-4 font-black text-base flex flex-col items-center gap-1.5 disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${C.red}30, ${C.red}15)`, border: `1.5px solid ${C.red}60`, color: C.red }}>
          <span className="text-2xl">🔄</span><span>إعادة تعيين</span>
        </motion.button>
      </div>
      <div className="mt-4 pt-4 text-xs" style={{ borderTop: `1px solid ${C.border}`, color: C.textDim }}>
        عدد اللاعبين: <span className="font-black text-white">{state.players.length}</span>
        {state.players.length === 1 && (
          <span className="mr-2 text-[10px]" style={{ color: C.pink }}>(وضع فردي)</span>
        )}
      </div>
    </div>
  );

  // ============================================================
  // Lobby
  // ============================================================
  const renderLobby = () => (
    <div className="mt-6 rounded-2xl p-4"
      style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.15))', border: `1.5px solid ${C.border}` }}>
      <h3 className="text-sm font-black mb-3 flex items-center gap-2" style={{ color: C.textDim }}>
        <span>👥</span><span>اللاعبين ({state.players.length})</span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {state.players.map(p => (
          <div key={p.id} className="px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2"
            style={{
              background: p.isMe ? `${C.purple}25` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${p.isMe ? C.purple + '60' : C.border}`,
              color: p.isMe ? C.purple : C.text,
            }}>
            <span>{p.name}</span>
            {p.isMe && <span className="text-[10px]">(أنت)</span>}
            {p.isAdmin && <span className="text-[10px]">🎩</span>}
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================================
  // Players Row
  // ============================================================
  const renderPlayersRow = () => {
    if (isSolo) return null;
    return (
      <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
        {players.map(p => (
          <motion.div key={p.id}
            className="shrink-0 rounded-xl p-2 flex flex-col items-center gap-1 min-w-[90px]"
            style={{
              background: p.isTurn ? `linear-gradient(145deg, ${C.amber}25, ${C.amber}08)` : 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${p.isTurn ? C.amber + '80' : C.border}`,
            }}>
            <p className="text-xs font-black truncate max-w-full"
              style={{ color: p.isTurn ? C.amber : 'white' }}>
              {p.isTurn && '🎯 '}{p.name}{p.isAdmin && ' 🎩'}
            </p>
            <span className="text-base font-black" style={{ color: C.green }}>
              {p.score} 🎴
            </span>
          </motion.div>
        ))}
      </div>
    );
  };

  // ============================================================
  // Grid
  // ============================================================
  const renderGrid = () => (
    <div className="w-full overflow-x-auto  pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div className="grid mx-auto "
        style={{
          gridTemplateColumns: `repeat(${cols}, ${dims.w}px)`,
          gridAutoRows: `${dims.h}px`,
          gap: `${cols > 6 ? 6 : 8}px`,
          width: 'fit-content',
          paddingLeft: 4, paddingRight: 4,
        }}>
        {grid.map((card, idx) => (
          <MemoryCard
            key={card.id}
            card={card}
            width={dims.w}
            height={dims.h}
            isFlipped={card.flipped}
            isMatched={card.matched}
            disabled={!isMyTurn || state.flippedCards.length >= 2}
            onClick={() => {
              if (!isMyTurn) return;
              if (state.flippedCards.length >= 2) return;
              handleCardClick(idx);
            }}
          />
        ))}
      </div>
    </div>
  );

  // ============================================================
  // Turn Banner
  // ============================================================
  const renderTurnBanner = () => {
    if (isSolo) {
      return (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-2 rounded-2xl px-4 py-2 flex items-center justify-between gap-3"
          style={{ background: `linear-gradient(135deg, ${C.pink}25, ${C.pink}08)`, border: `1.5px solid ${C.pink}80` }}>
          <div className="flex items-center gap-2">
            <motion.div className="w-2.5 h-2.5 rounded-full"
              style={{ background: C.pink, boxShadow: `0 0 10px ${C.pink}` }}
              animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
            <p className="text-sm font-black text-white">🎯 اختار كرتين — طابق الأزواج</p>
          </div>
          {state.flippedCards.length === 1 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: `${C.amber}30`, color: C.amber }}>
              اختار الكارت التاني
            </span>
          )}
        </motion.div>
      );
    }
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="mb-2 rounded-2xl px-4 py-2 flex items-center justify-between gap-3"
        style={{
          background: isMyTurn ? `linear-gradient(135deg, ${C.green}30, ${C.green}10)` : `linear-gradient(135deg, ${C.amber}25, ${C.amber}08)`,
          border: `1.5px solid ${isMyTurn ? C.green : C.amber}`,
        }}>
        <div className="flex items-center gap-2">
          <motion.div className="w-2.5 h-2.5 rounded-full"
            style={{ background: isMyTurn ? C.green : C.amber, boxShadow: `0 0 10px ${isMyTurn ? C.green : C.amber}` }}
            animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
          <p className="text-sm font-black text-white">
            {isMyTurn ? '🎯 دورك — اختار كرتين' : `دور: ${currentTurnName}`}
          </p>
        </div>
        {isMyTurn && state.flippedCards.length === 1 && (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{ background: `${C.amber}30`, color: C.amber }}>
            اختار الكارت التاني
          </span>
        )}
      </motion.div>
    );
  };

  // ============================================================
  // Game End
  // ============================================================
  const renderGameEnd = () => {
    if (isSolo) {
      const myScore = Object.values(state.scores)[0];
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <motion.div className="text-7xl mb-4 inline-block"
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              🎉
            </motion.div>
            <h2 className="text-3xl font-black mb-2">
              <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                خلّصت!
              </span>
            </h2>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: `linear-gradient(135deg, ${C.blue}25, ${C.blue}08)`, border: `1.5px solid ${C.blue}60` }}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">⏱️</span>
                <p className="font-black text-white">الوقت</p>
              </div>
              <p className="text-3xl font-black" style={{ color: C.blue }}>{elapsed}ث</p>
            </div>
            <div className="rounded-2xl p-4 flex items-center justify-between"
              style={{ background: `linear-gradient(135deg, ${C.amber}25, ${C.amber}08)`, border: `1.5px solid ${C.amber}60` }}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎯</span>
                <p className="font-black text-white">الحركات</p>
              </div>
              <p className="text-3xl font-black" style={{ color: C.amber }}>{myScore?.moves || 0}</p>
            </div>
          </div>
          {iAmAdmin && (
            <button onClick={() => emit('memory_reset')}
              className="w-full mt-6 rounded-xl py-4 font-black text-lg"
              style={{ background: `linear-gradient(135deg, ${C.green}40, ${C.green}20)`, border: `1.5px solid ${C.green}`, color: 'white' }}>
              🔄 العب تاني
            </button>
          )}
        </motion.div>
      );
    }

    const sorted = Object.entries(state.scores).map(([id, s]) => ({ id, ...s })).sort((a, b) => b.score - a.score);
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <motion.div className="text-7xl mb-4 inline-block"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            🏆
          </motion.div>
          <h2 className="text-3xl font-black mb-2">
            <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              خلصت اللعبة!
            </span>
          </h2>
        </div>
        <div className="space-y-2">
          {sorted.map((s, i) => {
            const isMe = s.id === me?.id;
            const isWinner = i === 0;
            return (
              <motion.div key={s.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: isWinner ? `linear-gradient(135deg, ${C.amber}25, ${C.amber}08)`
                            : isMe ? `${C.purple}15` : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isWinner ? C.amber + '80' : isMe ? C.purple + '60' : C.border}`,
                }}>
                <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                <div className="flex-1">
                  <p className="font-black text-white">
                    {s.name} {isMe && <span className="text-[10px]" style={{ color: C.purple }}>(أنت)</span>}
                  </p>
                  <p className="text-[10px]" style={{ color: C.textMuted }}>{s.moves} حركة</p>
                </div>
                <div className="text-2xl font-black" style={{ color: isWinner ? C.amber : 'white' }}>{s.score} 🎴</div>
              </motion.div>
            );
          })}
        </div>
        {iAmAdmin && (
          <button onClick={() => emit('memory_reset')}
            className="w-full mt-6 rounded-xl py-4 font-black text-lg"
            style={{ background: `linear-gradient(135deg, ${C.green}40, ${C.green}20)`, border: `1.5px solid ${C.green}`, color: 'white' }}>
            🔄 العب تاني
          </button>
        )}
      </motion.div>
    );
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div dir="rtl" className="taboo-scroll relative h-screen text-white overflow-y-auto">
      <div className="fixed inset-0 pointer-events-none "
        style={{
          background: 'radial-gradient(circle at 20% 20%, rgba(236,72,153,0.10) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(168,85,247,0.10) 0%, transparent 45%), #050510',
        }} />

      <div className="relative z-30 ">{renderHUD()}</div>

      <div className="relative z-10 w-full flex flex-col items-center px-2 py-3 ">
        <AnimatePresence mode="wait">
          {phase === 'waiting' && (
            <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-full max-w-4xl">
              <div className="text-center py-6">
                <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}
                  className="text-6xl mb-3">🧠</motion.div>
                <h2 className="text-4xl sm:text-5xl font-black mb-2">
                  <span style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    🧠 الذاكرة
                  </span>
                </h2>
                <p className="text-sm" style={{ color: C.textDim }}>
                  {state.players.length === 1 ? 'طابق كل الأزواج في أقل وقت' : 'طابق الأزواج — الأكثر يفوز'}
                </p>
              </div>
              {iAmAdmin && renderAdminControls()}
              {renderLobby()}
              {!iAmAdmin && <p className="text-center text-sm mt-6" style={{ color: C.textMuted }}>في انتظار المُيسّر...</p>}
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              <div className="max-w-7xl mx-auto px-1 ">
                {renderTurnBanner()}
                {renderPlayersRow()}
              </div>
              <div className="mt-2">{renderGrid()}</div>
            </motion.div>
          )}

          {phase === 'gameEnd' && (
            <motion.div key="end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
              {renderGameEnd()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Match Popup */}
      <AnimatePresence>
        {showMatchPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[96] flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ scale: 0.4, y: 30, rotate: -8 }} animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 1.4, opacity: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className="rounded-3xl px-8 py-6 text-center"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 60px rgba(16, 185, 129, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
              }}>
              {showMatchPopup.imageUrl && (
                <img src={showMatchPopup.imageUrl} alt="" draggable={false}
                  style={{ width: 72, height: 72, objectFit: 'contain', margin: '0 auto 8px' }}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              )}
              <p className="text-xl font-black text-white">{isSolo ? '🎉 ممتاز!' : `🎉 ${showMatchPopup.playerName}!`}</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.85)' }}>طابق زوج!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Miss Popup */}
      <AnimatePresence>
        {showMissPopup && (
          <div className="fixed top-20 inset-x-0 z-[96] flex justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="rounded-2xl px-5 py-3"
              style={{
                background: 'rgba(220, 38, 38, 0.18)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
              }}>
              <p className="text-sm font-black text-white">❌ مش متطابق!</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[94] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowLeaderboard(false); }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl rounded-2xl p-5 max-h-[80vh] overflow-y-auto"
              style={{ background: 'linear-gradient(145deg, #111122, #0a0a14)', border: `1.5px solid ${C.amber}60` }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black flex items-center gap-2" style={{ color: C.amber }}>
                  <span>🏆</span><span>ترتيب اللاعبين</span>
                </h2>
                <button onClick={() => setShowLeaderboard(false)} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
              </div>
              {state.players.length === 0 ? (
                <p className="text-center py-8" style={{ color: C.textMuted }}>مفيش لاعبين لسه...</p>
              ) : (
                <div className="space-y-2">
                  {[...state.players].sort((a, b) => b.score - a.score).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{
                        background: i === 0 ? `linear-gradient(135deg, ${C.amber}25, ${C.amber}08)` : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${i === 0 ? C.amber + '80' : C.border}`,
                      }}>
                      <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                      <div className="flex-1">
                        <p className="font-black text-white">
                          {p.name}
                          {p.isAdmin && <span className="text-[10px] mr-2" style={{ color: C.amber }}>🎩</span>}
                        </p>
                        <p className="text-[10px]" style={{ color: C.textMuted }}>{p.moves} حركة</p>
                      </div>
                      <div className="text-2xl font-black" style={{ color: i === 0 ? C.amber : 'white' }}>{p.score} 🎴</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className="fixed top-4 inset-x-0 z-[100] flex justify-center pointer-events-none">
            <div className="px-5 py-3 rounded-xl font-bold text-sm"
              style={{
                background: 'rgba(220, 38, 38, 0.3)',
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(255, 255, 255, 0.3)', color: 'white',
              }}>
              ⚠️ {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}