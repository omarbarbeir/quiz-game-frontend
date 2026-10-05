import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RulesModal from './RulesModal';
const C = {
  bg0: '#050510', bg1: '#0a0a14', border: '#1e1e35',
  red: '#dc2626', green: '#10b981', amber: '#f59e0b',
  purple: '#a855f7', blue: '#2563eb',
  text: '#e5e7eb', textDim: '#94a3b8', textMuted: '#64748b',
};

const SUIT_SYMBOL = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };
const SUIT_CODE = { hearts: 'H', diamonds: 'D', clubs: 'C', spades: 'S' };
const USE_FACE_IMAGES = true;
const displayRank = (rank) => rank === 'A' ? '1' : rank;

const SUIT_LABEL = { 1: 'سهل (نوع واحد)', 2: 'متوسط (نوعين)', 4: 'صعب (4 أنواع)' };

// =====================================================
// 🎴 PlayingCard
// =====================================================
const PlayingCard = ({ card, size = 'xs', faceDown = false, selected = false, onClick, disabled = false }) => {
  const sizes = {
    xxs: { w: 30, h: 42, rankSize: 10, suitSize: 8, centerSize: 20, bigWordSize: 12 },
    xs: { w: 38, h: 54, rankSize: 12, suitSize: 10, centerSize: 24, bigWordSize: 14 },
    sm: { w: 48, h: 68, rankSize: 15, suitSize: 12, centerSize: 32, bigWordSize: 18 },
  };
  const s = sizes[size] || sizes.xs;

  if (faceDown || !card || !card.rank) {
    return (
      <div onClick={!disabled ? onClick : undefined}
        style={{
          width: s.w, height: s.h, borderRadius: 5,
          background: 'linear-gradient(135deg, #312e81 0%, #7c3aed 50%, #312e81 100%)',
          border: '1.5px solid #a855f7',
          boxShadow: 'inset 0 0 8px rgba(168,85,247,0.3), 0 2px 3px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: onClick && !disabled ? 'pointer' : 'default',
          userSelect: 'none', position: 'relative', overflow: 'hidden',
        }}>
        <span style={{ fontSize: s.centerSize * 0.7, color: '#c4b5fd', fontWeight: 900 }}>♠</span>
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const color = isRed ? '#dc2626' : '#0f172a';
  const symbol = SUIT_SYMBOL[card.suit];
  const arabicNames = { J: 'ولد', Q: 'بنت', K: 'شايب' };
  const isFace = card.rank === 'J' || card.rank === 'Q' || card.rank === 'K';
  const displayText = isFace ? arabicNames[card.rank] : displayRank(card.rank);
  const faceImg = isFace && USE_FACE_IMAGES
    ? `https://deckofcardsapi.com/static/img/${card.rank}${SUIT_CODE[card.suit]}.png`
    : null;

  return (
    <div onClick={!disabled ? onClick : undefined}
      style={{
        width: s.w, height: s.h, borderRadius: 5,
        background: 'linear-gradient(145deg, #fefefe, #e8e8f0)',
        border: selected ? '2px solid #f59e0b' : '1px solid #cbd5e1',
        position: 'relative',
        cursor: onClick && !disabled ? 'pointer' : 'default',
        filter: selected ? 'drop-shadow(0 0 8px #fbbf24)' : 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))',
        transition: 'filter 0.15s, transform 0.15s',
        transform: selected ? 'translateY(-3px)' : 'translateY(0)',
        userSelect: 'none', overflow: 'hidden',
      }}>
      <div style={{ position: 'absolute', top: 2, left: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, color }}>
        <span style={{ fontSize: s.rankSize, fontWeight: 900 }}>{displayRank(card.rank)}</span>
        <span style={{ fontSize: s.suitSize }}>{symbol}</span>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {isFace ? <span style={{ fontSize: s.bigWordSize, fontWeight: 900 }}>{displayText}</span>
                 : <span style={{ fontSize: s.centerSize }}>{symbol}</span>}
      </div>
      {faceImg && (
        <img src={faceImg} alt="" draggable={false}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 2, pointerEvents: 'none' }} />
      )}
    </div>
  );
};

// =====================================================
// 🎮 ModesModal
// =====================================================
const MODES = [
  { id: 'basra', name: 'بصرة', emoji: '🃏', available: true, desc: 'أكتر كروت تفوز' },
  { id: 'bank', name: 'بنك', emoji: '🏦', available: true, desc: 'الأكثر ورق يفوز' },
  { id: 'shayeb', name: 'الشايب', emoji: '👑', available: true, desc: 'آخر واحد معاه الشايب' },
  { id: 'crazy8', name: 'Crazy 8', emoji: '🎴', available: true, desc: 'اللي يخلّص إيده الأول' },
  { id: 'solitaire', name: 'سوليتير', emoji: '🃏', available: true, desc: 'لعبة فردية' },
  { id: 'spider', name: 'سبايدر', emoji: '🕷️', available: true, desc: 'التحدي الأصعب' },
];

const ModesModal = ({ open, onClose, onSelect, currentMode }) => (
  <AnimatePresence>
    {open && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-full max-w-md">
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #111122, #0a0a14)', border: `1.5px solid ${C.purple}40` }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <h2 className="text-2xl font-black flex items-center gap-2"><span>🎮</span><span>اختر الطور</span></h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="p-3 space-y-2">
              {MODES.map(m => {
                const isCurrent = m.id === currentMode;
                const canClick = m.available && !isCurrent;
                return (
                  <motion.button key={m.id} disabled={!canClick}
                    onClick={() => { if (canClick) { onSelect(m.id); onClose(); } }}
                    whileHover={canClick ? { scale: 1.02 } : {}} whileTap={canClick ? { scale: 0.98 } : {}}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-right disabled:cursor-default"
                    style={{
                      background: isCurrent ? `${C.amber}20` : m.available ? `${C.purple}15` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isCurrent ? C.amber + '80' : m.available ? C.purple + '60' : C.border}`,
                      opacity: m.available ? 1 : 0.5,
                    }}>
                    <span className="text-2xl">{m.emoji}</span>
                    <div className="flex-1 text-right">
                      <p className="font-black text-white text-lg">{m.name}</p>
                      <p className="text-xs" style={{ color: C.textMuted }}>{m.desc}</p>
                    </div>
                    {isCurrent && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: `${C.amber}30`, color: C.amber, border: `1px solid ${C.amber}80` }}>▶ الحالي</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// =====================================================
// 🎮 Main Component
// =====================================================
export default function Spider({ socket, roomCode, playerId, playerName, isAdmin = false, onExit }) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [showModes, setShowModes] = useState(false);
  const [selected, setSelected] = useState(null);
  const [pendingSuitCount, setPendingSuitCount] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    if (!socket) return;
    const onState = (s) => setState(s);
    const onError = ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    };
    socket.on('spider_state', onState);
    socket.on('spider_error', onError);

    // ✅ الأدمن واللاعبين بيدخلوا من نفس الـ join event
    socket.emit('spider_join', { roomCode, playerId, playerName, isAdmin });

    return () => {
      socket.off('spider_state', onState);
      socket.off('spider_error', onError);
      socket.emit('spider_leave', { roomCode });
    };
  }, [socket, roomCode, playerId, playerName, isAdmin]);

  const emit = useCallback((ev, payload) => {
    socket?.emit(ev, { roomCode, ...payload });
  }, [socket, roomCode]);

  if (!state) {
    return (
      <div dir="rtl" className="relative min-h-screen bg-[#050510] text-white flex items-center justify-center">
        <motion.div className="w-16 h-16 rounded-full"
          style={{ border: '3px solid transparent', borderTopColor: C.purple, borderRightColor: C.amber }}
          animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
      </div>
    );
  }

  const { me, isAdmin: iAmAdmin } = state;
  const game = me?.game;

  if (!game) {
    return (
      <div dir="rtl" className="relative min-h-screen bg-[#050510] text-white flex items-center justify-center">
        <p>مفيش لعبة — حاول تاني</p>
      </div>
    );
  }

  const handleCardClick = (colIdx, cardIdx) => {
    const col = game.tableau[colIdx];
    const card = col[cardIdx];
    if (!card.faceUp) return;

    if (selected) {
      if (selected.fromCol === colIdx && selected.cardIndex === cardIdx) {
        setSelected(null);
        return;
      }
      emit('spider_move', { fromCol: selected.fromCol, cardIndex: selected.cardIndex, toCol: colIdx });
      setSelected(null);
    } else {
      setSelected({ fromCol: colIdx, cardIndex: cardIdx });
    }
  };

  const handleColumnClick = (colIdx) => {
    if (!selected) return;
    emit('spider_move', { fromCol: selected.fromCol, cardIndex: selected.cardIndex, toCol: colIdx });
    setSelected(null);
  };

  const isSelected = (colIdx, cardIdx) => {
    return selected && selected.fromCol === colIdx && selected.cardIndex === cardIdx;
  };

  const colHeight = (col) => {
    let h = 0;
    col.forEach((c) => {
      h += c.faceUp ? 24 : 12;
    });
    return h + 60;
  };

  const handleNewGame = (suitCount) => {
    if (game && game.moves > 0 && !game.gameWon) {
      if (!window.confirm('هتبدأ لعبة جديدة وتخسر الحالية. متأكد؟')) return;
    }
    emit('spider_new_game', { suitCount });
    setPendingSuitCount(null);
  };

  return (
    <div dir="rtl" className="relative min-h-screen text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#050510]" />
        <motion.div className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full blur-3xl opacity-20"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent 65%)' }}
          animate={{ x: [0, 60, 0], y: [0, 50, 0] }} transition={{ duration: 24, repeat: Infinity }} />
      </div>

      {/* HUD */}
      <div className="relative z-30 max-w-5xl mx-auto px-2 sm:px-3 pt-2">
        <div className="rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2 flex-wrap"
          style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.2))', border: `1.5px solid ${C.border}` }}>
          <div className="flex items-center gap-1.5">
            <button onClick={onExit} className="text-slate-400 hover:text-white text-xs flex items-center gap-1">
              <span>←</span><span>خروج</span>
            </button>
            {/* ✅ زرار القواعد */}
            <motion.button
              onClick={() => setShowRules(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-lg px-2 py-1 text-[10px] font-bold flex items-center gap-1"
              style={{
                background: `${C.blue}15`,
                border: `1px solid ${C.blue}40`,
                color: C.blue,
              }}>
              <span>📜</span>
              <span>القواعد</span>
            </motion.button>

            <motion.button onClick={() => setShowModes(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="rounded-lg px-2 py-1 text-[10px] font-bold flex items-center gap-1"
              style={{ background: `${C.purple}15`, border: `1px solid ${C.purple}40`, color: C.purple }}>
              <span>🎮</span><span>الأطوار</span>
            </motion.button>

            {/* ✅ زرار الترتيب */}
            <motion.button onClick={() => setShowLeaderboard(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="rounded-lg px-2 py-1 text-[10px] font-bold flex items-center gap-1"
              style={{ background: `${C.amber}15`, border: `1px solid ${C.amber}40`, color: C.amber }}>
              <span>🏆</span><span>الترتيب</span>
            </motion.button>

            <span className="rounded-lg px-2 py-1 text-[11px] font-black"
              style={{ background: `${C.purple}25`, border: `1px solid ${C.purple}60`, color: C.purple }}>
              🕷️ سبايدر
            </span>
            {iAmAdmin && (
              <span className="rounded-lg px-2 py-1 text-[10px] font-black"
                style={{ background: `${C.amber}25`, border: `1px solid ${C.amber}60`, color: C.amber }}>
                🎩 أدمن
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span style={{ color: C.textMuted }}>حركات: <b style={{ color: 'white' }}>{game.moves}</b></span>
            <span style={{ color: C.textMuted }}>
              تسلسلات: <b style={{ color: game.completedSets > 0 ? C.green : 'white' }}>{game.completedSets}/8</b>
            </span>
            <button
              onClick={() => setPendingSuitCount('show')}
              className="rounded-lg px-2 py-1 font-bold"
              style={{ background: `${C.green}20`, border: `1px solid ${C.green}60`, color: C.green }}>
              🔄 جديد
            </button>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="relative z-10 max-w-5xl mx-auto px-1 py-3">
        {/* Top row: stock + completed sets */}
        <div className="flex items-center justify-between gap-2 mb-3 overflow-x-auto pb-2 px-1">
          {/* Stock */}
          <div className="flex items-center gap-1.5">
            {game.stock.length > 0 ? (
              Array.from({ length: Math.min(5, Math.ceil(game.stock.length / 10)) }).map((_, i) => (
                <div key={i} onClick={() => emit('spider_draw')} style={{ cursor: 'pointer' }}>
                  <PlayingCard faceDown size="xs" />
                </div>
              ))
            ) : (
              <div style={{
                width: 38, height: 54, borderRadius: 5,
                border: `1.5px dashed ${C.textDim}40`,
                background: 'rgba(255,255,255,0.02)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: C.textDim, fontSize: 18,
              }}>
                ✕
              </div>
            )}
            <span className="text-[10px]" style={{ color: C.textMuted }}>
              {Math.ceil(game.stock.length / 10)} سحبات
            </span>
          </div>

          {/* Completed Sets indicator */}
          <div className="flex items-center gap-1 flex-wrap justify-end">
            <span className="text-[10px] font-black" style={{ color: C.textMuted }}>التسلسلات:</span>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                width: 20, height: 28, borderRadius: 3,
                background: i < game.completedSets ? `linear-gradient(135deg, ${C.green}60, ${C.green}30)` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${i < game.completedSets ? C.green : C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12,
              }}>
                {i < game.completedSets ? '★' : ''}
              </div>
            ))}
          </div>
        </div>

        {/* Tableau - 10 columns */}
        <div className="grid grid-cols-10 gap-0.5 sm:gap-1 justify-items-center">
          {game.tableau.map((col, colIdx) => (
            <div key={colIdx} className="w-full flex justify-center"
              onClick={(e) => {
                if (e.target === e.currentTarget) handleColumnClick(colIdx);
              }}>
              <div
                style={{
                  position: 'relative',
                  width: 38,
                  height: colHeight(col),
                  cursor: selected ? 'pointer' : 'default',
                }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) handleColumnClick(colIdx);
                }}
              >
                {col.length === 0 && (
                  <div style={{
                    width: 38, height: 54, borderRadius: 5,
                    border: `1.5px dashed ${C.textDim}30`,
                    background: 'rgba(255,255,255,0.01)',
                  }} />
                )}
                {col.map((card, cardIdx) => {
                  const topOffset = col.slice(0, cardIdx).reduce((sum, c) => sum + (c.faceUp ? 24 : 12), 0);
                  return (
                    <div key={card.id}
                      style={{ position: 'absolute', top: topOffset, left: 0, zIndex: cardIdx + 1 }}
                      onClick={() => handleCardClick(colIdx, cardIdx)}>
                      <PlayingCard
                        card={card}
                        size="xs"
                        faceDown={!card.faceUp}
                        selected={isSelected(colIdx, cardIdx)}
                        disabled={!card.faceUp}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty Picker Popup */}
      <AnimatePresence>
        {pendingSuitCount === 'show' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[92] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setPendingSuitCount(null); }}>
            <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="rounded-3xl p-6 max-w-md w-full"
              style={{ background: 'linear-gradient(145deg, #111122, #0a0a14)', border: `2px solid ${C.purple}80` }}>
              <h3 className="text-xl font-black text-center mb-4" style={{ color: C.purple }}>
                اختر المستوى
              </h3>
              <div className="space-y-2">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleNewGame(1)}
                  className="w-full rounded-xl py-4 px-4 flex items-center justify-between"
                  style={{ background: `${C.green}25`, border: `2px solid ${C.green}` }}>
                  <div className="text-right">
                    <p className="font-black text-white text-lg">🌱 سهل</p>
                    <p className="text-xs" style={{ color: C.textMuted }}>نوع واحد (♠)</p>
                  </div>
                  <span className="text-xs font-black" style={{ color: C.green }}>8 مجموعات ♠</span>
                </motion.button>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleNewGame(2)}
                  className="w-full rounded-xl py-4 px-4 flex items-center justify-between"
                  style={{ background: `${C.amber}25`, border: `2px solid ${C.amber}` }}>
                  <div className="text-right">
                    <p className="font-black text-white text-lg">🌤️ متوسط</p>
                    <p className="text-xs" style={{ color: C.textMuted }}>نوعين (♠ + ♥)</p>
                  </div>
                  <span className="text-xs font-black" style={{ color: C.amber }}>4 + 4 مجموعات</span>
                </motion.button>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => handleNewGame(4)}
                  className="w-full rounded-xl py-4 px-4 flex items-center justify-between"
                  style={{ background: `${C.red}25`, border: `2px solid ${C.red}` }}>
                  <div className="text-right">
                    <p className="font-black text-white text-lg">🔥 صعب</p>
                    <p className="text-xs" style={{ color: C.textMuted }}>4 أنواع</p>
                  </div>
                  <span className="text-xs font-black" style={{ color: C.red }}>2 × 4 مجموعات</span>
                </motion.button>
              </div>
              <button onClick={() => setPendingSuitCount(null)}
                className="w-full mt-3 rounded-xl py-2 text-sm font-black"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, color: C.textDim }}>
                إلغاء
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[93] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowLeaderboard(false); }}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl rounded-2xl p-5 max-h-[80vh] overflow-y-auto"
              style={{ background: 'linear-gradient(145deg, #111122, #0a0a14)', border: `1.5px solid ${C.amber}60`, boxShadow: `0 20px 60px -10px ${C.amber}55` }}>
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
                  {[...state.players]
                    .sort((a, b) => {
                      if (a.gameWon !== b.gameWon) return a.gameWon ? -1 : 1;
                      if (b.completedSets !== a.completedSets) return b.completedSets - a.completedSets;
                      return a.moves - b.moves;
                    })
                    .map((p, i) => (
                      <motion.div key={p.id}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{
                          background: p.gameWon ? `linear-gradient(135deg, ${C.green}25, ${C.green}08)` : 'rgba(255,255,255,0.03)',
                          border: `1.5px solid ${p.gameWon ? C.green + '80' : C.border}`,
                        }}>
                        <span className="text-2xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
                        <div className="flex-1">
                          <p className="font-black text-white">
                            {p.name}
                            {p.isAdmin && <span className="text-[10px] mr-2" style={{ color: C.amber }}>🎩</span>}
                          </p>
                          <p className="text-[10px]" style={{ color: C.textMuted }}>
                            {p.completedSets}/8 تسلسل • {p.moves} حركة • {p.elapsed}ث • {SUIT_LABEL[p.suitCount]}
                          </p>
                        </div>
                        {p.gameWon && (
                          <span className="text-xs px-2 py-1 rounded-full font-black"
                            style={{ background: `${C.green}30`, color: C.green, border: `1px solid ${C.green}` }}>
                            ✅ فاز!
                          </span>
                        )}
                      </motion.div>
                    ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Win popup */}
      <AnimatePresence>
        {game.gameWon && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
              className="rounded-3xl px-10 py-8 text-center"
              style={{ background: `linear-gradient(135deg, ${C.green}40, ${C.green}10)`, border: `3px solid ${C.green}`, boxShadow: `0 0 60px ${C.green}` }}>
              <motion.div className="text-8xl mb-3"
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                🕷️
              </motion.div>
              <h2 className="text-3xl font-black mb-2 text-white">مبروك! خلّصت 8 تسلسلات! 🎊</h2>
              <p className="text-lg mb-4" style={{ color: C.textDim }}>
                بـ {game.moves} حركة في {Math.floor((Date.now() - game.startTime) / 1000)} ثانية
              </p>
              <button onClick={() => setPendingSuitCount('show')}
                className="rounded-xl px-6 py-3 font-black text-white"
                style={{ background: `linear-gradient(135deg, ${C.green}60, ${C.green}30)`, border: `2px solid ${C.green}` }}>
                🎮 لعبة جديدة
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ModesModal open={showModes} onClose={() => setShowModes(false)} currentMode="spider"
        onSelect={(mode) => socket.emit('kotshina_switch_mode', { roomCode, mode, fromMode: 'spider' })} />

      <RulesModal
        open={showRules}
        onClose={() => setShowRules(false)}
        gameId="spider"
      />

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl font-bold text-sm"
            style={{ background: `linear-gradient(135deg, ${C.red}, ${C.red}cc)`, color: 'white' }}>
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}