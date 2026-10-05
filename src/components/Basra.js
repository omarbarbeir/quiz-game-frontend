import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RulesModal from './RulesModal';
// =====================================================
// 🎨 Colors
// =====================================================
const C = {
  bg0: '#050510',
  bg1: '#0a0a14',
  card: '#111122',
  border: '#1e1e35',
  red: '#dc2626',
  blue: '#2563eb',
  green: '#10b981',
  amber: '#f59e0b',
  purple: '#a855f7',
  text: '#e5e7eb',
  textDim: '#94a3b8',
  textMuted: '#64748b',
};

// =====================================================
// 🖼️ Face Card Images config
// =====================================================
const USE_FACE_IMAGES = true;
const SUIT_CODE = { hearts: 'H', diamonds: 'D', clubs: 'C', spades: 'S' };
const faceImageUrl = (card) =>
  `https://deckofcardsapi.com/static/img/${card.rank}${SUIT_CODE[card.suit]}.png`;

// =====================================================
// 🎴 Playing Card
// =====================================================

// ✅ عرض A كـ 1
const displayRank = (rank) => rank === 'A' ? '1' : rank;
const SUIT_SYMBOL = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠' };

const PlayingCard = ({
  card,
  size = 'md',
  faceDown = false,
  selected = false,
  glowing = false,
  onClick,
  disabled = false,
}) => {
  const sizes = {
    xs: { w: 46, h: 64, rankSize: 15, suitSize: 12, centerSize: 30, bigWordSize: 18 },
    sm: { w: 58, h: 82, rankSize: 18, suitSize: 14, centerSize: 38, bigWordSize: 22 },
    md: { w: 78, h: 110, rankSize: 24, suitSize: 18, centerSize: 52, bigWordSize: 28 },
    lg: { w: 98, h: 138, rankSize: 30, suitSize: 22, centerSize: 66, bigWordSize: 34 },
    xl: { w: 118, h: 166, rankSize: 36, suitSize: 26, centerSize: 80, bigWordSize: 40 },
  };
  const s = sizes[size] || sizes.md;

  if (faceDown || !card || !card.rank) {
    return (
      <div
        onClick={!disabled ? onClick : undefined}
        style={{
          width: s.w,
          height: s.h,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #312e81 0%, #7c3aed 50%, #312e81 100%)',
          border: '2px solid #a855f7',
          boxShadow: 'inset 0 0 20px rgba(168,85,247,0.4), 0 4px 10px rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: onClick && !disabled ? 'pointer' : 'default',
          userSelect: 'none',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            fontSize: s.centerSize * 0.85,
            color: '#e9d5ff',
            textShadow: '0 0 10px rgba(233,213,255,0.6)',
            fontWeight: 900,
          }}
        >
          ♠
        </span>
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const color = isRed ? '#dc2626' : '#0f172a';
  const symbol = SUIT_SYMBOL[card.suit];

  const arabicNames = { J: 'ولد', Q: 'بنت', K: 'شايب' };
  const isFace = card.rank === 'J' || card.rank === 'Q' || card.rank === 'K';
  const displayText = isFace ? arabicNames[card.rank] : displayRank(card.rank);

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={{
        width: s.w,
        height: s.h,
        borderRadius: 8,
        background: 'linear-gradient(145deg, #fefefe, #e8e8f0)',
        border: '1.5px solid #cbd5e1',
        position: 'relative',
        cursor: onClick && !disabled ? 'pointer' : 'default',
        filter: selected
          ? 'drop-shadow(0 0 14px #fbbf24) drop-shadow(0 0 24px #fbbf24)'
          : glowing
          ? 'drop-shadow(0 0 12px #10b981) drop-shadow(0 0 22px #10b981)'
          : 'drop-shadow(0 4px 8px rgba(0,0,0,0.7))',
        transition: 'filter 0.2s, transform 0.2s',
        transform: selected ? 'translateY(-8px)' : 'translateY(0)',
        userSelect: 'none',
        overflow: 'hidden',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 4,
          left: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          lineHeight: 1,
          color,
        }}
      >
        <span style={{ fontSize: s.rankSize, fontWeight: 900, letterSpacing: '-0.5px' }}>
          {displayRank(card.rank)}
        </span>
        <span style={{ fontSize: s.suitSize, marginTop: 2 }}>{symbol}</span>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
        }}
      >
        {isFace ? (
          <span
            style={{
              fontSize: s.bigWordSize,
              fontWeight: 900,
              color,
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              letterSpacing: '-1px',
            }}
          >
            {displayText}
          </span>
        ) : (
          <span style={{ fontSize: s.centerSize }}>{symbol}</span>
        )}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 4,
          right: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          lineHeight: 1,
          color,
          transform: 'rotate(180deg)',
        }}
      >
        <span style={{ fontSize: s.rankSize, fontWeight: 900, letterSpacing: '-0.5px' }}>
          {displayRank(card.rank)}
        </span>
        <span style={{ fontSize: s.suitSize, marginTop: 2 }}>{symbol}</span>
      </div>

      {isFace && USE_FACE_IMAGES && (
        <img
          src={faceImageUrl(card)}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            zIndex: 3,
            pointerEvents: 'none',
          }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      )}
    </div>
  );
};

// =====================================================
// 🃏 Card Stack
// =====================================================
const CardStack = ({ count, size = 'xs', accent = null }) => {
  const sizes = { xs: { w: 26, h: 38 }, sm: { w: 32, h: 46 } };
  const { w, h } = sizes[size] || sizes.xs;
  const layers = Math.min(count, 5);

  return (
    <div className="relative" style={{ width: w + 6, height: h + 6 }}>
      {Array.from({ length: layers }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded"
          style={{
            left: i * 1.5,
            top: i * 1.5,
            width: w,
            height: h,
            background: accent
              ? `linear-gradient(135deg, ${accent}60, ${accent}30)`
              : 'linear-gradient(135deg, #312e81, #7c3aed)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        />
      ))}
      <div
        className="absolute font-black flex items-center justify-center text-white"
        style={{
          left: (layers - 1) * 1.5,
          top: (layers - 1) * 1.5,
          width: w,
          height: h,
          fontSize: 11,
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
        }}
      >
        {count}
      </div>
    </div>
  );
};

// =====================================================
// 🎮 MODES Modal
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-full max-w-md"
        >
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #111122, #0a0a14)',
              border: `1.5px solid ${C.purple}40`,
              boxShadow: `0 20px 60px -10px ${C.purple}55`,
            }}
          >
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <h2 className="text-xl font-black flex items-center gap-2">
                <span>🎮</span>
                <span>اختر الطور</span>
              </h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="p-3 space-y-2">
              {MODES.map((m) => {
                const isCurrent = m.id === currentMode;
                const canClick = m.available && !isCurrent;
                return (
                  <motion.button
                    key={m.id}
                    disabled={!canClick}
                    onClick={() => { if (canClick) { onSelect(m.id); onClose(); } }}
                    whileHover={canClick ? { scale: 1.02 } : {}}
                    whileTap={canClick ? { scale: 0.98 } : {}}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-right disabled:cursor-default"
                    style={{
                      background: isCurrent ? `${C.amber}20` : m.available ? `${C.purple}15` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isCurrent ? C.amber + '80' : m.available ? C.purple + '60' : C.border}`,
                      opacity: m.available ? 1 : 0.5,
                      boxShadow: isCurrent ? `0 0 20px -6px ${C.amber}` : 'none',
                    }}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <div className="flex-1 text-right">
                      <p className="font-black text-white text-lg">{m.name}</p>
                      <p className="text-xs" style={{ color: C.textMuted }}>{m.desc}</p>
                    </div>
                    {isCurrent && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: `${C.amber}30`, color: C.amber, border: `1px solid ${C.amber}80` }}>
                        ▶ الحالي
                      </span>
                    )}
                    {m.available && !isCurrent && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: `${C.green}20`, color: C.green, border: `1px solid ${C.green}60` }}>
                        ✓ مفعّل
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="px-5 py-4 border-t text-center" style={{ borderColor: C.border, background: C.bg1 }}>
              <p className="text-[10px]" style={{ color: C.textMuted }}>
                تنبيه: تبديل الطور هيمسح اللعبة الحالية
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// =====================================================
// 🎴 Basra Pile Popup
// =====================================================
const BasraPilePopup = ({ open, onClose, cards, playerName }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-full max-w-lg"
        >
          <div
            className="rounded-2xl p-5 max-h-[80vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(145deg, #111122, #0a0a14)',
              border: `1.5px solid ${C.amber}60`,
              boxShadow: `0 20px 60px -10px ${C.amber}55`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black flex items-center gap-2" style={{ color: C.amber }}>
                <span>⭐</span>
                <span>كروت البصرة — {playerName}</span>
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
            </div>

            {cards.length === 0 ? (
              <p className="text-center py-8" style={{ color: C.textMuted }}>مفيش كروت بصرة</p>
            ) : (
              <div className="flex flex-wrap gap-3 justify-center">
                {cards.map((card) => (
                  <div key={card.id} className="text-center">
                    <PlayingCard card={card} size="lg" />
                    <div className="mt-1 text-xs font-bold" style={{ color: C.amber }}>
                      +{card.points}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// =====================================================
// 🎯 Capture Options Popup
// =====================================================
const CaptureOptionsPopup = ({ open, options, onSelect, onCancel }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[95] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-full max-w-lg"
        >
          <div
            className="rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
            style={{
              background: 'linear-gradient(145deg, #111122, #0a0a14)',
              border: `1.5px solid ${C.green}80`,
              boxShadow: `0 20px 60px -10px ${C.green}55`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black flex items-center gap-2" style={{ color: C.green }}>
                <span>🎯</span>
                <span>اختر الاحتمال</span>
              </h3>
              <button onClick={onCancel} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
            </div>

            <p className="text-xs mb-4" style={{ color: C.textMuted }}>
              فيه أكتر من طريقة للأخد — اختار اللي يناسبك
            </p>

            <div className="space-y-3">
              {options.map((opt, i) => (
                <motion.button
                  key={i}
                  onClick={() => onSelect(opt)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full rounded-xl p-3 text-right"
                  style={{
                    background: opt.isBasra
                      ? `linear-gradient(135deg, ${C.amber}20, ${C.amber}08)`
                      : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${opt.isBasra ? C.amber + '80' : C.green + '60'}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-black" style={{ color: opt.isBasra ? C.amber : C.green }}>
                      {opt.isBasra ? `⭐ بصرة +${opt.basraPoints}` : opt.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.08)', color: C.textDim }}>
                      {opt.captured.length} كروت
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 justify-end" dir="rtl">
                    {opt.captured.map((c) => (
                      <div key={c.id} style={{ transform: 'scale(0.6)', transformOrigin: 'top right' }}>
                        <PlayingCard card={c} size="md" />
                      </div>
                    ))}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// =====================================================
// ✅ Client-side helpers
// =====================================================
function getValueClient(card) {
  if (card.rank === 'A') return 1;
  if (card.rank === 'J' || card.rank === 'Q' || card.rank === 'K') return null;
  return parseInt(card.rank, 10);
}

function findSubsetsSummingToClient(cards, target) {
  const results = [];
  const n = cards.length;
  const values = cards.map(c => getValueClient(c));

  function backtrack(start, current, sum) {
    if (sum === target && current.length >= 2) {
      results.push([...current]);
      return;
    }
    if (sum >= target || start >= n) return;
    for (let i = start; i < n; i++) {
      const v = values[i];
      if (v === null) continue;
      if (sum + v > target) continue;
      current.push(cards[i]);
      backtrack(i + 1, current, sum + v);
      current.pop();
    }
  }
  backtrack(0, [], 0);
  return results;
}

function getAllOptionsClient(playedCard, tableCards) {
  if (tableCards.length === 0) return [];
  const rank = playedCard.rank;

  // J
  if (rank === 'J') {
    if (tableCards.length === 1 && tableCards[0].rank === 'J') {
      return [{ captured: [...tableCards], isBasra: true, basraPoints: 25, label: 'بصرة 25' }];
    }
    return [{ captured: [...tableCards], isBasra: false, basraPoints: 0, label: 'ياخد كل الأرض' }];
  }

  // Q, K
  if (rank === 'Q' || rank === 'K') {
    const matching = tableCards.filter(c => c.rank === rank);
    if (matching.length === 0) return [];
    const isBasra = matching.length === tableCards.length;
    return [{ captured: matching, isBasra, basraPoints: isBasra ? 10 : 0, label: `مطابقة ${rank}` }];
  }

  // Numbers
  const value = getValueClient(playedCard);
  const rankMatches = tableCards.filter(c => c.rank === rank);
  const otherCards = tableCards.filter(c => c.rank !== rank && c.rank !== 'J' && c.rank !== 'Q' && c.rank !== 'K');

  if (rankMatches.length > 0) {
    const subsets = findSubsetsSummingToClient(otherCards, value);

    // ✅ لو فيه subset = كل الباقي → خد كل حاجة
    const allSubset = otherCards.length > 0
      ? subsets.find(s => s.length === otherCards.length)
      : null;

    if (allSubset) {
      const combined = [...rankMatches, ...allSubset];
      const isBasra = combined.length === tableCards.length;
      return [{
        captured: combined,
        isBasra,
        basraPoints: isBasra ? 10 : 0,
        label: `مطابقة ${rank} + جمع ${value}`,
      }];
    }

    // ✅ لو فيه subsets → خيارات (مطابقة + كل subset)
    if (subsets.length > 0) {
      return subsets.map(subset => {
        const combined = [...rankMatches, ...subset];
        const isBasra = combined.length === tableCards.length;
        return {
          captured: combined,
          isBasra,
          basraPoints: isBasra ? 10 : 0,
          label: `مطابقة ${rank} + جمع ${value}`,
        };
      });
    }

    // ✅ مفيش subsets → مطابقة لوحدها
    const isBasra = rankMatches.length === tableCards.length;
    return [{
      captured: rankMatches,
      isBasra,
      basraPoints: isBasra ? 10 : 0,
      label: `مطابقة ${rank}`,
    }];
  }

  // ✅ جمع بس
  const subsets = findSubsetsSummingToClient(otherCards, value);
  return subsets.map(subset => {
    const isBasra = subset.length === tableCards.length;
    return {
      captured: subset,
      isBasra,
      basraPoints: isBasra ? 10 : 0,
      label: `جمع ${value}`,
    };
  });
}

// =====================================================
// 🎮 MAIN COMPONENT
// =====================================================
export default function Basra({
  socket, roomCode, playerId, playerName, isAdmin = false, players = [], onExit,
}) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [showBasraPopup, setShowBasraPopup] = useState(null);
  const [showModes, setShowModes] = useState(false);
  const [captureOptions, setCaptureOptions] = useState(null);
  const [showOptionsPopup, setShowOptionsPopup] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Socket
  useEffect(() => {
    if (!socket) return;
    const onState = (s) => {
      setState(s);
      if (s.me && !s.me.isTurn) setSelectedCardId(null);
    };
    const onError = ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3500);
    };

    socket.on('basra_state', onState);
    socket.on('basra_error', onError);

    // ✅ الأدمن واللاعبين بيدخلوا من نفس الـ join event
    socket.emit('basra_join', { roomCode, playerId, playerName, isAdmin });

    return () => {
      socket.off('basra_state', onState);
      socket.off('basra_error', onError);
      socket.emit('basra_leave', { roomCode });
    };
  }, [socket, roomCode, playerId, playerName, isAdmin]);

  // ✅ الأدمن يبعت ترتيب اللاعبين من الغرفة الأصلية
  useEffect(() => {
    if (!isAdmin || !socket || !roomCode) return;
    if (!players || players.length === 0) return;
    // ✅ نشيل فلتر الأدمن — الأدمن بقى لاعب عادي
    const playerIds = players.map(p => p.id);
    
    const t1 = setTimeout(() => socket.emit('basra_set_order', { roomCode, playerIds }), 300);
    const t2 = setTimeout(() => socket.emit('basra_set_order', { roomCode, playerIds }), 1000);
    const t3 = setTimeout(() => socket.emit('basra_set_order', { roomCode, playerIds }), 2500);
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isAdmin, socket, roomCode, players]);

  const emit = useCallback((ev, payload) => {
    socket?.emit(ev, { roomCode, ...payload });
  }, [socket, roomCode]);

  // All possible capture options for selected card
  const allOptions = React.useMemo(() => {
    if (!state?.me?.isTurn || !selectedCardId || !state.me.hand) return [];
    const card = state.me.hand.find(c => c.id === selectedCardId);
    if (!card) return [];
    return getAllOptionsClient(card, state.tableCards);
  }, [selectedCardId, state]);

  const predictedCapture = allOptions.length > 0 ? allOptions[0] : null;

  if (!state) {
    return (
      <div dir="rtl" className="relative min-h-screen bg-[#050510] text-white flex items-center justify-center">
        <motion.div
          className="w-16 h-16 rounded-full"
          style={{ border: '3px solid transparent', borderTopColor: '#a855f7', borderRightColor: '#fbbf24' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  const { me, phase, isAdmin: iAmAdmin } = state;
  const myTurn = me?.isTurn;

  // ============================================================
  // HUD
  // ============================================================
  const renderHUD = () => (
    <div className="relative z-30 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      <div
        className="rounded-2xl px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.2))',
          backdropFilter: 'blur(16px)',
          border: `1.5px solid ${C.border}`,
        }}
      >
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="text-slate-400 hover:text-white text-xs flex items-center gap-1">
            <span>←</span><span>خروج</span>
          </button>
          

            {/* ✅ زرار القواعد — بس في اللوبي */}
            {phase === 'waiting' && (
              <motion.button
                onClick={() => setShowRules(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-xl px-3 py-1.5 text-xs font-black flex items-center gap-1.5"
                style={{
                  background: `linear-gradient(135deg, ${C.blue}40, ${C.blue}15)`,
                  border: `2px solid ${C.blue}`,
                  color: 'white',
                  boxShadow: `0 0 20px -5px ${C.blue}`,
                }}>
                <span>📜</span>
                <span className="hidden sm:inline">القواعد</span>
              </motion.button>
            )}

          {/* ✅ زرار الأطوار — أكبر وأوضح */}
          <motion.button
            onClick={() => setShowModes(true)}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="rounded-xl px-4 py-2 text-sm font-black flex items-center gap-2 shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${C.purple}40, ${C.purple}15)`,
              border: `2px solid ${C.purple}`,
              color: 'white',
              boxShadow: `0 0 20px -5px ${C.purple}`,
            }}
          >
            <span className="text-lg">🎮</span>
            <span>تغيير الطور</span>
          </motion.button>
          
          {/* ✅ شارة الطور الحالي — أكبر وأوضح */}
          <span className="rounded-xl px-3 py-2 text-sm font-black flex items-center gap-1.5"
            style={{
              background: `linear-gradient(135deg, ${C.green}40, ${C.green}15)`,
              border: `2px solid ${C.green}`,
              color: 'white',
              boxShadow: `0 0 20px -5px ${C.green}`,
            }}>
            🃏 بصرة
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-[8px] uppercase tracking-widest" style={{ color: C.textMuted }}>الديل</p>
            <p className="text-sm font-black text-white">{state.deckCount}</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] uppercase tracking-widest" style={{ color: C.textMuted }}>الأرض</p>
            <p className="text-sm font-black text-white">{state.tableCards.length}</p>
          </div>
          <div className="text-center">
            <p className="text-[8px] uppercase tracking-widest" style={{ color: C.textMuted }}>الدور</p>
            <p className="text-sm font-black" style={{ color: C.amber }}>
              {state.currentTurnName || '—'}
            </p>
          </div>
        </div>

        <div className="text-xs font-mono hidden sm:block" style={{ color: C.textMuted }}>{roomCode}</div>
      </div>
    </div>
  );

  // ============================================================
  // Admin Controls
  // ============================================================
  const renderAdminControls = () => {
    const canChangeDeck = !state.dealt && state.deckCount === 0;

    return (
      <div className="mt-6">
        <div
          className="rounded-2xl p-4 sm:p-5"
          style={{
            background: 'linear-gradient(145deg, rgba(168,85,247,0.08), rgba(0,0,0,0.2))',
            border: `1.5px solid ${C.purple}40`,
          }}
        >
          <h3 className="text-sm font-black mb-4 flex items-center gap-2" style={{ color: C.purple }}>
            <span>🎩</span><span>لوحة الأدمن</span>
          </h3>

          {/* ✅ اختيار حجم الديل */}
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: C.textMuted }}>
              حجم الديل
            </p>
            <div className="grid grid-cols-2 gap-2">
              <motion.button
                onClick={() => emit('basra_set_deck_multiplier', { multiplier: 1 })}
                disabled={!canChangeDeck}
                whileHover={canChangeDeck ? { scale: 1.02 } : {}}
                whileTap={canChangeDeck ? { scale: 0.98 } : {}}
                className="rounded-xl py-3 px-3 font-black text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: state.deckMultiplier === 1
                    ? `linear-gradient(135deg, ${C.green}40, ${C.green}15)`
                    : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${state.deckMultiplier === 1 ? C.green : C.border}`,
                  color: state.deckMultiplier === 1 ? 'white' : C.textDim,
                  boxShadow: state.deckMultiplier === 1 ? `0 0 20px -8px ${C.green}` : 'none',
                }}
              >
                <span className="text-lg">🃏</span>
                <span>عادي (52)</span>
                {state.deckMultiplier === 1 && <span className="text-xs">✓</span>}
              </motion.button>

              <motion.button
                onClick={() => emit('basra_set_deck_multiplier', { multiplier: 2 })}
                disabled={!canChangeDeck}
                whileHover={canChangeDeck ? { scale: 1.02 } : {}}
                whileTap={canChangeDeck ? { scale: 0.98 } : {}}
                className="rounded-xl py-3 px-3 font-black text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: state.deckMultiplier === 2
                    ? `linear-gradient(135deg, ${C.purple}40, ${C.purple}15)`
                    : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${state.deckMultiplier === 2 ? C.purple : C.border}`,
                  color: state.deckMultiplier === 2 ? 'white' : C.textDim,
                  boxShadow: state.deckMultiplier === 2 ? `0 0 20px -8px ${C.purple}` : 'none',
                }}
              >
                <span className="text-lg">🎴</span>
                <span>دوبل (104)</span>
                {state.deckMultiplier === 2 && <span className="text-xs">✓</span>}
              </motion.button>
            </div>
            {!canChangeDeck && (
              <p className="text-[10px] mt-2" style={{ color: C.textMuted }}>
                💡 لازم تعمل Reset الأول لو عايز تغير الحجم
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <motion.button
              disabled={state.dealt || state.deckCount > 0}
              onClick={() => emit('basra_shuffle')}
              whileHover={!state.dealt && state.deckCount === 0 ? { scale: 1.03 } : {}}
              whileTap={!state.dealt && state.deckCount === 0 ? { scale: 0.97 } : {}}
              className="rounded-xl py-4 px-4 font-black text-base flex flex-col items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: state.deckCount > 0
                  ? `linear-gradient(135deg, ${C.green}30, ${C.green}15)`
                  : `linear-gradient(135deg, ${C.blue}30, ${C.blue}15)`,
                border: `1.5px solid ${state.deckCount > 0 ? C.green : C.blue}60`,
                color: state.deckCount > 0 ? C.green : C.blue,
              }}
            >
              <span className="text-2xl">🔄</span>
              <span>{state.deckCount > 0 ? 'الديل جاهز' : 'اقلب الورق'}</span>
            </motion.button>

            <motion.button
              disabled={state.dealt || state.deckCount === 0 || state.players.length < 2}
              onClick={() => emit('basra_deal')}
              whileHover={!state.dealt && state.deckCount > 0 && state.players.length >= 2 ? { scale: 1.03 } : {}}
              whileTap={!state.dealt && state.deckCount > 0 && state.players.length >= 2 ? { scale: 0.97 } : {}}
              className="rounded-xl py-4 px-4 font-black text-base flex flex-col items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${C.amber}30, ${C.amber}15)`,
                border: `1.5px solid ${C.amber}60`,
                color: C.amber,
              }}
            >
              <span className="text-2xl">🃏</span>
              <span>وزّع الورق</span>
            </motion.button>

            <motion.button
              disabled={!state.dealt || phase === 'playing'}
              onClick={() => emit('basra_start')}
              whileHover={state.dealt && phase !== 'playing' ? { scale: 1.03 } : {}}
              whileTap={state.dealt && phase !== 'playing' ? { scale: 0.97 } : {}}
              className="rounded-xl py-4 px-4 font-black text-base flex flex-col items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${C.green}30, ${C.green}15)`,
                border: `1.5px solid ${C.green}60`,
                color: C.green,
              }}
            >
              <span className="text-2xl">🎬</span>
              <span>ابدأ اللعب</span>
            </motion.button>
          </div>

          <div className="mt-4 pt-4 flex justify-between items-center" style={{ borderTop: `1px solid ${C.border}` }}>
            <div className="text-xs" style={{ color: C.textDim }}>
              عدد اللاعبين: <span className="font-black text-white">{state.players.length}</span>
            </div>
            {phase !== 'waiting' && (
              <button
                onClick={() => { if (window.confirm('إعادة تعيين اللعبة؟')) emit('basra_reset'); }}
                className="text-xs font-bold px-3 py-1.5 rounded-lg"
                style={{ background: `${C.red}15`, border: `1px solid ${C.red}40`, color: C.red }}
              >
                🔄 إعادة تعيين
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // Lobby
  // ============================================================
  const renderLobby = () => (
    <div className="mt-6">
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.15))',
          border: `1.5px solid ${C.border}`,
        }}
      >
        <h3 className="text-sm font-black mb-3 flex items-center gap-2" style={{ color: C.textDim }}>
          <span>👥</span><span>اللاعبين ({state.players.length})</span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {state.players.map((p) => (
            <div
              key={p.id}
              className="px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2"
              style={{
                background: p.isMe ? `${C.purple}25` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${p.isMe ? C.purple + '60' : C.border}`,
                color: p.isMe ? C.purple : C.text,
              }}
            >
              {p.isTurn && <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }}>🎯</motion.span>}
              <span>{p.name}</span>
              {p.isMe && <span className="text-[10px]">(أنت)</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // Turn Banner
  // ============================================================
  const renderTurnBanner = () => {
    if (!myTurn && !state.currentTurnName) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3 rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
        style={{
          background: myTurn
            ? `linear-gradient(135deg, ${C.green}30, ${C.green}10)`
            : `linear-gradient(135deg, ${C.amber}25, ${C.amber}08)`,
          border: `1.5px solid ${myTurn ? C.green : C.amber}`,
          boxShadow: myTurn ? `0 0 30px -8px ${C.green}` : `0 0 20px -8px ${C.amber}`,
        }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-3 h-3 rounded-full shrink-0"
            style={{
              background: myTurn ? C.green : C.amber,
              boxShadow: `0 0 12px ${myTurn ? C.green : C.amber}`,
            }}
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <div>
            <p className="text-[10px] uppercase tracking-widest" style={{ color: myTurn ? C.green : C.amber }}>
              {myTurn ? 'دورك الآن' : 'دور'}
            </p>
            <p className="text-xl font-black text-white">
              {myTurn ? '🎯 العب!' : state.currentTurnName}
            </p>
          </div>
        </div>

        {myTurn && (
          <motion.span
            className="text-3xl"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            👆
          </motion.span>
        )}
      </motion.div>
    );
  };

  // ============================================================
  // Opponents
  // ============================================================
  const renderOpponents = () => {
    const others = state.players.filter(p => !p.isMe);
    if (others.length === 0) return null;

    return (
      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-widest mb-2 px-1" style={{ color: C.textMuted }}>
          الخصوم
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {others.map((p) => (
            <motion.div
              key={p.id}
              className="shrink-0 rounded-xl p-2 flex flex-col items-center gap-1 min-w-[110px]"
              style={{
                background: p.isTurn
                  ? `linear-gradient(145deg, ${C.amber}25, ${C.amber}08)`
                  : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${p.isTurn ? C.amber + '80' : C.border}`,
                boxShadow: p.isTurn ? `0 0 20px -6px ${C.amber}80` : 'none',
              }}
            >
              <p className="text-xs font-black truncate max-w-full" style={{ color: p.isTurn ? C.amber : 'white' }}>
                {p.isTurn && '🎯 '}{p.name}
              </p>
              <CardStack count={p.cardCount} size="xs" />
              <div className="flex items-center gap-1.5 text-[10px]">
                <span style={{ color: C.green }}>✓{p.regularCount}</span>
                {p.basraCount > 0 && (
                  <span
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded font-black"
                    style={{
                      background: `${C.amber}25`,
                      color: C.amber,
                      border: `1px solid ${C.amber}60`,
                    }}
                  >
                    ⭐{p.basraCount}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // ============================================================
  // Table
  // ============================================================
  const renderTable = () => {
    const capturedIds = new Set(
      predictedCapture ? predictedCapture.captured.map(c => c.id) : []
    );

    const tableCount = state.tableCards.length;
    let cardSize = 'lg';
    if (tableCount > 12) cardSize = 'sm';
    else if (tableCount > 8) cardSize = 'md';

    return (
      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-widest mb-2 px-1" style={{ color: C.textMuted }}>
          الأرض ({tableCount})
        </p>
        <div
          className="rounded-2xl p-4 flex flex-wrap gap-2 justify-center items-center"
          style={{
            background: 'linear-gradient(145deg, rgba(16,185,129,0.08), rgba(0,0,0,0.25))',
            border: `1.5px solid ${C.green}40`,
            minHeight: 130,
          }}
        >
          {tableCount === 0 ? (
            <p className="text-sm" style={{ color: C.textMuted }}>الأرض فاضية</p>
          ) : (
            state.tableCards.map((card) => (
              <motion.div
                key={card.id}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <PlayingCard
                  card={card}
                  size={cardSize}
                  glowing={capturedIds.has(card.id)}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  };

  // ============================================================
  // Hand
  // ============================================================
  const renderHand = () => {
    if (!me) return null;

    return (
      <div>
        <p className="text-[10px] uppercase tracking-widest mb-2 px-1 flex items-center justify-between" style={{ color: C.textMuted }}>
          <span>كروتك ({me.hand.length})</span>
          {myTurn && (
            <motion.span
              className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: `${C.green}25`, color: C.green, border: `1px solid ${C.green}60` }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🎯 دورك
            </motion.span>
          )}
        </p>

        <div
          className="rounded-2xl p-4 flex gap-2 justify-center flex-wrap"
          style={{
            background: myTurn
              ? 'linear-gradient(145deg, rgba(16,185,129,0.1), rgba(0,0,0,0.25))'
              : 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.15))',
            border: `1.5px solid ${myTurn ? C.green + '60' : C.border}`,
          }}
        >
          {me.hand.length === 0 ? (
            <p className="text-sm" style={{ color: C.textMuted }}>مفيش كروت</p>
          ) : (
            me.hand.map((card) => (
              <motion.div
                key={card.id}
                layout
                onClick={() => {
                  if (!myTurn) return;
                  setSelectedCardId(prev => prev === card.id ? null : card.id);
                }}
                style={{ cursor: myTurn ? 'pointer' : 'default' }}
              >
                <PlayingCard
                  card={card}
                  size="xl"
                  selected={selectedCardId === card.id}
                  disabled={!myTurn}
                />
              </motion.div>
            ))
          )}
        </div>

        {/* Action bar */}
        <AnimatePresence>
          {myTurn && selectedCardId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-3 flex gap-2"
            >
              <button
                onClick={() => {
                  if (allOptions.length === 0) {
                    emit('basra_play', { cardId: selectedCardId });
                    setSelectedCardId(null);
                  } else if (allOptions.length === 1) {
                    emit('basra_play', {
                      cardId: selectedCardId,
                      chosenCapturedIds: allOptions[0].captured.map(c => c.id),
                    });
                    setSelectedCardId(null);
                  } else {
                    setCaptureOptions(allOptions);
                    setShowOptionsPopup(true);
                  }
                }}
                className="flex-1 rounded-xl py-3 font-black text-base flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${C.green}40, ${C.green}20)`,
                  border: `1.5px solid ${C.green}`,
                  color: 'white',
                  boxShadow: `0 0 30px -8px ${C.green}`,
                }}
              >
                <span>▶️</span>
                <span>
                  العب
                  {allOptions.length > 1 && (
                    <span style={{ color: C.amber }}> ({allOptions.length} احتمالات)</span>
                  )}
                  {allOptions.length === 1 && allOptions[0].basraPoints > 0 && (
                    <span style={{ color: C.amber }}> (بصرة +{allOptions[0].basraPoints})</span>
                  )}
                </span>
              </button>
              <button
                onClick={() => setSelectedCardId(null)}
                className="rounded-xl px-5 py-3 font-black text-sm"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: `1.5px solid ${C.border}`,
                  color: C.textDim,
                }}
              >
                ✖ إلغاء
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Piles */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowBasraPopup({ cards: me.basraCards, name: me.name })}
            className="rounded-xl p-3 text-right flex items-center justify-between gap-2"
            style={{
              background: me.basraCards.length > 0
                ? `linear-gradient(135deg, ${C.amber}25, ${C.amber}08)`
                : 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${me.basraCards.length > 0 ? C.amber + '60' : C.border}`,
            }}
          >
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest" style={{ color: C.amber }}>
                ⭐ كروت البصرة
              </p>
              <p className="text-lg font-black" style={{ color: me.basraCards.length > 0 ? C.amber : C.textMuted }}>
                {me.basraCards.length} <span className="text-xs">({me.basraPoints} نقطة)</span>
              </p>
            </div>
            <span className="text-2xl">{me.basraCards.length > 0 ? '👁️' : '—'}</span>
          </button>

          <div
            className="rounded-xl p-3 text-right flex items-center justify-between gap-2"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1.5px solid ${C.border}`,
            }}
          >
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest" style={{ color: C.textMuted }}>
                ✓ الورق العادي
              </p>
              <p className="text-lg font-black text-white">{me.capturedCards.length}</p>
            </div>
            <span className="text-2xl">🃏</span>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // Game End
  // ============================================================
  const renderGameEnd = () => {
    const sortedScores = Object.entries(state.scores)
      .map(([id, s]) => ({ id, ...s }))
      .sort((a, b) => b.total - a.total);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto px-4 py-6"
      >
        <div className="text-center mb-6">
          <motion.div
            className="text-7xl mb-4 inline-block"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🏆
          </motion.div>
          <h2 className="text-3xl font-black mb-2">
            <span
              style={{
                background: 'linear-gradient(135deg, #fbbf24, #f97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              خلصت اللعبة!
            </span>
          </h2>
          <p className="text-sm" style={{ color: C.textDim }}>الترتيب النهائي</p>
        </div>

        <div className="space-y-2">
          {sortedScores.map((s, i) => {
            const isMe = s.id === me?.id;
            const isWinner = i === 0;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: isWinner
                    ? `linear-gradient(135deg, ${C.amber}25, ${C.amber}08)`
                    : isMe
                    ? `${C.purple}15`
                    : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isWinner ? C.amber + '80' : isMe ? C.purple + '60' : C.border}`,
                  boxShadow: isWinner ? `0 0 30px -8px ${C.amber}80` : 'none',
                }}
              >
                <span className="text-2xl shrink-0">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white truncate">
                    {s.name} {isMe && <span className="text-[10px]" style={{ color: C.purple }}>(أنت)</span>}
                  </p>
                  <p className="text-[10px]" style={{ color: C.textMuted }}>
                    ✓ {s.regular} عادي {s.basra > 0 && `+ ⭐ ${s.basra} بصرة`}
                  </p>
                </div>
                <div className="text-2xl font-black shrink-0" style={{ color: isWinner ? C.amber : 'white' }}>
                  {s.total}
                </div>
              </motion.div>
            );
          })}
        </div>

        {iAmAdmin && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onClick={() => emit('basra_reset')}
            className="w-full mt-6 rounded-xl py-4 font-black text-lg"
            style={{
              background: `linear-gradient(135deg, ${C.green}40, ${C.green}20)`,
              border: `1.5px solid ${C.green}`,
              color: 'white',
              boxShadow: `0 0 30px -8px ${C.green}`,
            }}
          >
            🔄 العب تاني
          </motion.button>
        )}
      </motion.div>
    );
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div dir="rtl" className="relative min-h-screen text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#050510]" />
        <motion.div
          className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent 65%)' }}
          animate={{ x: [0, 60, 0], y: [0, 50, 0] }}
          transition={{ duration: 24, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent 65%)' }}
          animate={{ x: [0, -60, 0], y: [0, -50, 0] }}
          transition={{ duration: 28, repeat: Infinity }}
        />
      </div>

      {renderHUD()}

      <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-4 py-4">
        <AnimatePresence mode="wait">
          {phase === 'waiting' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center py-6">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="text-6xl mb-3"
                >
                  🎴
                </motion.div>
                <h2 className="text-3xl font-black mb-1">
                  <span
                    style={{
                      background: 'linear-gradient(135deg, #a855f7, #fbbf24)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                   🃏 بصرة
                  </span>
                </h2>
                <p className="text-sm" style={{ color: C.textDim }}>
                  الأكثر عدد كروت يفوز
                </p>
              </div>

              {iAmAdmin && renderAdminControls()}
              {renderLobby()}

              {iAmAdmin && !state.dealt && state.deckCount === 0 && (
                <p className="text-center text-xs mt-4" style={{ color: C.textMuted }}>
                  💡 اختار حجم الديل ثم اضغط "اقلب الورق"
                </p>
              )}
              {iAmAdmin && state.deckCount > 0 && !state.dealt && (
                <p className="text-center text-xs mt-4" style={{ color: C.amber }}>
                  ⚠️ اضغط "وزّع الورق" عشان تبدأ
                </p>
              )}
              {!iAmAdmin && (
                <p className="text-center text-sm mt-6" style={{ color: C.textMuted }}>
                  في انتظار المُيسّر...
                </p>
              )}
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderTurnBanner()}
              {renderOpponents()}
              {renderTable()}
              {renderHand()}
            </motion.div>
          )}

          {phase === 'gameEnd' && (
            <motion.div
              key="end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderGameEnd()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ✅ ModesModal بالبروبس الجديدة */}
      <ModesModal
        open={showModes}
        onClose={() => setShowModes(false)}
        currentMode="basra"
        onSelect={(mode) => {
          socket.emit('kotshina_switch_mode', { roomCode, mode, fromMode: 'basra' });
        }}
      />

      <RulesModal
        open={showRules}
        onClose={() => setShowRules(false)}
        gameId="basra"
      />

      <BasraPilePopup
        open={!!showBasraPopup}
        onClose={() => setShowBasraPopup(null)}
        cards={showBasraPopup?.cards || []}
        playerName={showBasraPopup?.name || ''}
      />

      <CaptureOptionsPopup
        open={showOptionsPopup}
        options={captureOptions || []}
        onSelect={(opt) => {
          emit('basra_play', {
            cardId: selectedCardId,
            chosenCapturedIds: opt.captured.map(c => c.id),
          });
          setSelectedCardId(null);
          setShowOptionsPopup(false);
          setCaptureOptions(null);
        }}
        onCancel={() => {
          setShowOptionsPopup(false);
          setCaptureOptions(null);
        }}
      />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl font-bold text-sm"
            style={{
              background: `linear-gradient(135deg, ${C.red}, ${C.red}cc)`,
              color: 'white',
              boxShadow: `0 10px 40px -10px ${C.red}`,
            }}
          >
            ⚠️ {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}