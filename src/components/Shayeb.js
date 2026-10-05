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
const faceImageUrl = (card) =>
  `https://deckofcardsapi.com/static/img/${card.rank}${SUIT_CODE[card.suit]}.png`;

const displayRank = (rank) => rank === 'A' ? '1' : rank;

// =====================================================
// 🎴 PlayingCard
// =====================================================
const PlayingCard = ({
  card, size = 'md', faceDown = false, selected = false,
  glowing = false, onClick, disabled = false, highlight = false,
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
      <div onClick={!disabled ? onClick : undefined}
        style={{
          width: s.w, height: s.h, borderRadius: 8,
          background: 'linear-gradient(135deg, #312e81 0%, #7c3aed 50%, #312e81 100%)',
          border: '2px solid #a855f7',
          boxShadow: 'inset 0 0 20px rgba(168,85,247,0.4), 0 4px 10px rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: onClick && !disabled ? 'pointer' : 'default',
          userSelect: 'none', position: 'relative', overflow: 'hidden',
        }}>
        <span style={{ fontSize: s.centerSize * 0.85, color: '#e9d5ff', fontWeight: 900 }}>♠</span>
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
    <div onClick={!disabled ? onClick : undefined}
      style={{
        width: s.w, height: s.h, borderRadius: 8,
        background: 'linear-gradient(145deg, #fefefe, #e8e8f0)',
        border: highlight ? '2px solid #f59e0b' : '1.5px solid #cbd5e1',
        position: 'relative',
        cursor: onClick && !disabled ? 'pointer' : 'default',
        filter: selected
          ? 'drop-shadow(0 0 14px #fbbf24) drop-shadow(0 0 24px #fbbf24)'
          : highlight
          ? 'drop-shadow(0 0 10px #f59e0b)'
          : glowing ? 'drop-shadow(0 0 12px #10b981) drop-shadow(0 0 22px #10b981)'
          : 'drop-shadow(0 4px 8px rgba(0,0,0,0.7))',
        transition: 'filter 0.2s, transform 0.2s',
        transform: selected ? 'translateY(-8px)' : 'translateY(0)',
        userSelect: 'none', overflow: 'hidden',
      }}>
      <div style={{ position: 'absolute', top: 4, left: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, color }}>
        <span style={{ fontSize: s.rankSize, fontWeight: 900 }}>{displayRank(card.rank)}</span>
        <span style={{ fontSize: s.suitSize, marginTop: 2 }}>{symbol}</span>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {isFace ? <span style={{ fontSize: s.bigWordSize, fontWeight: 900 }}>{displayText}</span>
                 : <span style={{ fontSize: s.centerSize }}>{symbol}</span>}
      </div>
      <div style={{ position: 'absolute', bottom: 4, right: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, color, transform: 'rotate(180deg)' }}>
        <span style={{ fontSize: s.rankSize, fontWeight: 900 }}>{displayRank(card.rank)}</span>
        <span style={{ fontSize: s.suitSize, marginTop: 2 }}>{symbol}</span>
      </div>
      {isFace && USE_FACE_IMAGES && (
        <img src={faceImageUrl(card)} alt="" draggable={false}
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 3, pointerEvents: 'none' }} />
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
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="w-full max-w-md">
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #111122, #0a0a14)', border: `1.5px solid ${C.purple}40`, boxShadow: `0 20px 60px -10px ${C.purple}55` }}>
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <h2 className="text-2xl font-black flex items-center gap-2"><span>🎮</span><span>اختر الطور</span></h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="p-3 space-y-2">
              {MODES.map((m) => {
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
                      boxShadow: isCurrent ? `0 0 20px -6px ${C.amber}` : 'none',
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
                    {m.available && !isCurrent && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{ background: `${C.green}20`, color: C.green, border: `1px solid ${C.green}60` }}>✓ مفعّل</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
            <div className="px-5 py-4 border-t text-center" style={{ borderColor: C.border, background: C.bg1 }}>
              <p className="text-[10px]" style={{ color: C.textMuted }}>تنبيه: تبديل الطور هيمسح اللعبة الحالية</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// =====================================================
// 👑 Shayeb Main
// =====================================================
export default function Shayeb({
  socket, roomCode, playerId, playerName, isAdmin = false, onExit, players = [],
}) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [showModes, setShowModes] = useState(false);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    if (!socket) return;
    const onState = (s) => setState(s);
    const onError = ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3500);
    };
    socket.on('shayeb_state', onState);
    socket.on('shayeb_error', onError);

    // ✅ الأدمن واللاعبين بيدخلوا من نفس الـ join event
    socket.emit('shayeb_join', { roomCode, playerId, playerName, isAdmin });

    return () => {
      socket.off('shayeb_state', onState);
      socket.off('shayeb_error', onError);
      socket.emit('shayeb_leave', { roomCode });
    };
  }, [socket, roomCode, playerId, playerName, isAdmin]);

  // ✅ الأدمن يبعت ترتيب اللاعبين الصح (من الغرفة الأصلية)
  useEffect(() => {
    if (!isAdmin || !socket || !roomCode) return;
    if (!players || players.length === 0) return;
    // ✅ نشيل فلتر الأدمن — الأدمن بقى لاعب عادي
    const playerIds = players.map(p => p.id);
    
    const t1 = setTimeout(() => socket.emit('shayeb_set_order', { roomCode, playerIds }), 300);
    const t2 = setTimeout(() => socket.emit('shayeb_set_order', { roomCode, playerIds }), 1000);
    const t3 = setTimeout(() => socket.emit('shayeb_set_order', { roomCode, playerIds }), 2500);
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isAdmin, socket, roomCode, players]);

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

  const { me, phase, isAdmin: iAmAdmin, players: gamePlayers } = state;
  const isMyTurn = me?.isTurn;
  const alreadyDrew = state.lastDraw && me && state.lastDraw.playerId === me.id;
  const canDraw = isMyTurn && !alreadyDrew && !me?.isFinished;
  const canEndTurn = isMyTurn && alreadyDrew;
  const myHand = me?.hand || [];
  const iAmReady = me?.isReady;

  // ============================================================
  // HUD
  // ============================================================
  const renderHUD = () => (
    <div className="relative z-30 max-w-7xl mx-auto px-3 sm:px-4 pt-3">
      <div className="rounded-2xl px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.2))', backdropFilter: 'blur(16px)', border: `1.5px solid ${C.border}` }}>
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


          <motion.button onClick={() => setShowModes(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="rounded-xl px-4 py-2 text-sm font-black flex items-center gap-2"
            style={{ background: `linear-gradient(135deg, ${C.purple}40, ${C.purple}15)`, border: `2px solid ${C.purple}`, color: 'white', boxShadow: `0 0 20px -5px ${C.purple}` }}>
            <span className="text-lg">🎮</span><span>تغيير الطور</span>
          </motion.button>
          <span className="rounded-xl px-3 py-2 text-sm font-black flex items-center gap-1.5"
            style={{ background: `linear-gradient(135deg, ${C.amber}40, ${C.amber}15)`, border: `2px solid ${C.amber}`, color: 'white', boxShadow: `0 0 20px -5px ${C.amber}` }}>
            👑 الشايب
          </span>
        </div>
        <div className="flex items-center gap-3">
        <div className="text-center">
          <p className="text-[8px] uppercase tracking-widest" style={{ color: C.textMuted }}>الطاولة</p>
          <p className="text-sm font-black text-white">
            {state.tableCardsCount}
            {state.deckMultiplier === 2 && (
              <span className="text-[9px] ml-1 px-1 rounded" style={{ background: `${C.purple}30`, color: C.purple }}>
                ×2
              </span>
            )}
          </p>
        </div>
          <div className="text-center">
            <p className="text-[8px] uppercase tracking-widest" style={{ color: C.textMuted }}>الدور</p>
            <p className="text-sm font-black" style={{ color: C.amber }}>{state.currentTurnName || '—'}</p>
          </div>
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

      {/* ✅ اختيار حجم الديل */}
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: C.textMuted }}>
          حجم الديل
        </p>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            onClick={() => emit('shayeb_set_deck_multiplier', { multiplier: 1 })}
            disabled={state.phase !== 'waiting'}
            whileHover={state.phase === 'waiting' ? { scale: 1.02 } : {}}
            whileTap={state.phase === 'waiting' ? { scale: 0.98 } : {}}
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
            onClick={() => emit('shayeb_set_deck_multiplier', { multiplier: 2 })}
            disabled={state.phase !== 'waiting'}
            whileHover={state.phase === 'waiting' ? { scale: 1.02 } : {}}
            whileTap={state.phase === 'waiting' ? { scale: 0.98 } : {}}
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
        {state.phase !== 'waiting' && (
          <p className="text-[10px] mt-2" style={{ color: C.textMuted }}>
            💡 لازم تعمل Reset الأول لو عايز تغير الحجم
          </p>
        )}
      </div>


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          disabled={state.dealt}
          onClick={() => emit('shayeb_start')}
          className="rounded-xl py-4 px-4 font-black text-base flex flex-col items-center gap-1.5 disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${C.green}30, ${C.green}15)`, border: `1.5px solid ${C.green}60`, color: C.green }}>
          <span className="text-2xl">🎬</span><span>ابدأ اللعب ووزّع</span>
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          disabled={phase === 'waiting'}
          onClick={() => { if (window.confirm('إعادة تعيين؟')) emit('shayeb_reset'); }}
          className="rounded-xl py-4 px-4 font-black text-base flex flex-col items-center gap-1.5 disabled:opacity-40"
          style={{ background: `linear-gradient(135deg, ${C.red}30, ${C.red}15)`, border: `1.5px solid ${C.red}60`, color: C.red }}>
          <span className="text-2xl">🔄</span><span>إعادة تعيين</span>
        </motion.button>
      </div>
      <div className="mt-4 pt-4 text-xs" style={{ borderTop: `1px solid ${C.border}`, color: C.textDim }}>
        عدد اللاعبين: <span className="font-black text-white">{state.players.length}</span>
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
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================================
  // ✨ Revealing Phase
  // ============================================================
  const renderRevealing = () => {
    const totalPlayers = gamePlayers.length;
    const readyCount = gamePlayers.filter(p => p.isReady).length;
    const allReady = readyCount === totalPlayers;

    const ranksCount = {};
    myHand.forEach(c => {
      ranksCount[c.rank] = (ranksCount[c.rank] || 0) + 1;
    });
    const getPairsForRank = (rank) => Math.floor((ranksCount[rank] || 0) / 2);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="text-center mb-5">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}
            className="text-5xl mb-3">👀</motion.div>
          <h2 className="text-3xl font-black mb-2">
            <span style={{ background: 'linear-gradient(135deg, #fbbf24, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              شوف ورقك
            </span>
          </h2>
          <p className="text-sm" style={{ color: C.textDim }}>
            الكروت المتشابهة هتنزل على الطاولة لما تدوس "جاهز"
          </p>
        </div>

        <div className="mb-4 rounded-xl p-3"
          style={{ background: `${C.purple}15`, border: `1.5px solid ${C.purple}60` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-black" style={{ color: C.purple }}>
              جاهزين: {readyCount} / {totalPlayers}
            </span>
            {allReady && <span className="text-xs font-black" style={{ color: C.green }}>🎉 الكل جاهز!</span>}
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <motion.div className="h-full"
              style={{ background: `linear-gradient(90deg, ${C.green}, ${C.amber})` }}
              animate={{ width: `${(readyCount / totalPlayers) * 100}%` }}
              transition={{ type: 'spring', stiffness: 100 }} />
          </div>
        </div>

        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-widest mb-2 px-1 font-black" style={{ color: C.textMuted }}>
            كروتك ({myHand.length})
          </p>
          <div className="rounded-2xl p-4 flex flex-wrap gap-2 justify-center"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))',
              border: `1.5px solid ${C.amber}60`,
            }}>
            {myHand.map(card => {
              const isPair = getPairsForRank(card.rank) > 0;
              return (
                <motion.div key={card.id} layout
                  initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 200 }}>
                  <PlayingCard card={card} size="lg" highlight={isPair} />
                </motion.div>
              );
            })}
          </div>
        </div>

        {!iAmReady ? (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => emit('shayeb_ready')}
            className="w-full rounded-2xl py-5 font-black text-lg flex items-center justify-center gap-3"
            style={{
              background: `linear-gradient(135deg, ${C.green}50, ${C.green}20)`,
              border: `2px solid ${C.green}`,
              color: 'white',
              boxShadow: `0 0 40px -8px ${C.green}`,
            }}>
            <span className="text-3xl">✓</span>
            <span>جاهز — نزّل المتشابهات وابدأ</span>
          </motion.button>
        ) : (
          <div className="rounded-2xl py-5 text-center font-black text-lg"
            style={{
              background: `${C.amber}15`,
              border: `2px solid ${C.amber}60`,
              color: C.amber,
            }}>
            ⏳ في انتظار باقي اللاعبين... ({readyCount}/{totalPlayers})
          </div>
        )}
      </motion.div>
    );
  };

  // ============================================================
  // Players Row
  // ============================================================
  const renderPlayersRow = () => (
    <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
      {gamePlayers.map(p => (
        <motion.div key={p.id}
          className="shrink-0 rounded-xl p-2.5 flex flex-col items-center gap-1 min-w-[110px]"
          style={{
            background: p.isTurn
              ? `linear-gradient(145deg, ${C.amber}25, ${C.amber}08)`
              : p.isFinished
              ? `linear-gradient(145deg, ${C.green}15, ${C.green}05)`
              : 'rgba(255,255,255,0.03)',
            border: `1.5px solid ${p.isFinished ? C.green + '80' : p.isTurn ? C.amber + '80' : C.border}`,
            boxShadow: p.isTurn ? `0 0 20px -6px ${C.amber}80` : 'none',
            opacity: p.isFinished ? 0.75 : 1,
          }}>
          <p className="text-xs font-black truncate max-w-full"
            style={{ color: p.isFinished ? C.green : p.isTurn ? C.amber : 'white' }}>
            {p.isTurn && '🎯 '}{p.name}
          </p>
          {p.isFinished ? (
            <span className="text-[11px] font-black px-2 py-0.5 rounded"
              style={{ background: `${C.green}25`, color: C.green }}>
              #{p.rank} ✓
            </span>
          ) : (
            <span className="text-[11px] font-black px-2 py-0.5 rounded"
              style={{ background: 'rgba(255,255,255,0.08)', color: C.textDim }}>
              {p.handCount} 🃏
            </span>
          )}
          {p.isTarget && isMyTurn && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
              style={{ background: `${C.purple}30`, color: C.purple }}>
              🎯 هدفك
            </span>
          )}
        </motion.div>
      ))}
    </div>
  );

  // ============================================================
  // Target Hand
  // ============================================================
  const renderTargetHand = () => {
    if (!isMyTurn || !state.targetHand) return null;
    if (alreadyDrew) return null;

    return (
      <div className="mb-3">
        <p className="text-[11px] uppercase tracking-widest mb-2 px-1 font-black" style={{ color: C.purple }}>
          🎴 اسحب من {state.targetName} — اختار كارت
        </p>
        <div className="rounded-2xl p-4 flex flex-wrap gap-2 justify-center"
          style={{
            background: `linear-gradient(145deg, ${C.purple}15, rgba(0,0,0,0.25))`,
            border: `2px dashed ${C.purple}80`,
          }}>
          {state.targetHand.length === 0 ? (
            <p className="text-sm" style={{ color: C.textMuted }}>اللاعب ده خلص ورق</p>
          ) : (
            state.targetHand.map((card) => (
              <motion.div key={card.id}
                whileHover={{ y: -8, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => emit('shayeb_draw', { cardId: card.id })}
                style={{ cursor: 'pointer' }}>
                <PlayingCard faceDown size="lg" />
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  };

  // ============================================================
  // Last Draw Banner
  // ============================================================
  const renderLastDraw = () => {
    if (!state.lastDraw || !alreadyDrew) return null;
    const d = state.lastDraw;
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="mb-3 rounded-2xl p-4 flex items-center gap-3 flex-wrap"
        style={{
          background: d.paired
            ? `linear-gradient(135deg, ${C.green}30, ${C.green}10)`
            : `linear-gradient(135deg, ${C.amber}25, ${C.amber}08)`,
          border: `1.5px solid ${d.paired ? C.green : C.amber}`,
        }}>
        <span className="text-3xl">{d.paired ? '🎉' : '🎴'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest font-black"
            style={{ color: d.paired ? C.green : C.amber }}>
            {d.paired ? 'طابق! نزل الاتنين على الطاولة' : 'مفيش مطابقة — الكارت في إيدك'}
          </p>
          <p className="text-sm font-bold text-white mt-0.5">
            سحبت من {d.targetName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PlayingCard card={d.card} size="sm" />
          {d.matchCard && (
            <>
              <span className="text-2xl font-black" style={{ color: C.green }}>+</span>
              <PlayingCard card={d.matchCard} size="sm" glowing />
            </>
          )}
        </div>
      </motion.div>
    );
  };

  // ============================================================
  // My Hand
  // ============================================================
  const renderMyHand = () => {
    if (!me) return null;
    return (
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[10px] uppercase tracking-widest font-black" style={{ color: C.textMuted }}>
            كروتك ({myHand.length})
            {me.isFinished && <span className="ml-2" style={{ color: C.green }}>#{me.rank} ✓ خلّصت</span>}
          </p>
          <motion.button
            onClick={() => emit('shayeb_shuffle_hand')}
            disabled={me.isFinished}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="rounded-lg px-3 py-1 text-xs font-black flex items-center gap-1 disabled:opacity-40"
            style={{ background: `${C.blue}25`, border: `1.5px solid ${C.blue}60`, color: C.blue }}>
            🔀 خلط
          </motion.button>
        </div>
        <div className="rounded-2xl p-4 flex flex-wrap gap-2 justify-center"
          style={{
            background: me.isFinished
              ? `linear-gradient(145deg, ${C.green}10, rgba(0,0,0,0.2))`
              : 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.15))',
            border: `1.5px solid ${me.isFinished ? C.green + '60' : C.border}`,
          }}>
          {myHand.length === 0 ? (
            <p className="text-sm" style={{ color: me.isFinished ? C.green : C.textMuted }}>
              {me.isFinished ? `🎉 خلّصت في المركز #${me.rank}` : 'إيدك فاضية'}
            </p>
          ) : (
            myHand.map(card => (
              <motion.div key={card.id} layout
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}>
                <PlayingCard card={card} size="lg" />
              </motion.div>
            ))
          )}
        </div>
      </div>
    );
  };

  // ============================================================
  // Action bar
  // ============================================================
  const renderActionBar = () => {
    if (!me || me.isFinished) return null;
    if (!isMyTurn) return null;

    if (canEndTurn) {
      return (
        <motion.button
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => emit('shayeb_end_turn')}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="w-full rounded-xl py-4 font-black text-lg flex items-center justify-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${C.green}50, ${C.green}20)`,
            border: `2px solid ${C.green}`,
            color: 'white',
            boxShadow: `0 0 30px -8px ${C.green}`,
          }}>
          <span className="text-2xl">➡️</span>
          <span>إنهاء الدور</span>
        </motion.button>
      );
    }

    if (canDraw) {
      return (
        <div className="rounded-xl py-3 px-4 text-center font-black text-sm"
          style={{ background: `${C.purple}15`, border: `1.5px solid ${C.purple}40`, color: C.purple }}>
          👆 اختار كارت من ورق {state.targetName}
        </div>
      );
    }

    return null;
  };

  // ============================================================
  // Game End
  // ============================================================
  const renderGameEnd = () => {
    const sorted = Object.entries(state.scores)
      .map(([id, s]) => ({ id, ...s }))
      .sort((a, b) => a.rank - b.rank);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <motion.div className="text-7xl mb-4 inline-block"
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            👑
          </motion.div>
          <h2 className="text-3xl font-black mb-2">
            <span style={{ background: 'linear-gradient(135deg, #fbbf24, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              خلصت اللعبة!
            </span>
          </h2>
          <p className="text-sm" style={{ color: C.textDim }}>الترتيب النهائي</p>
        </div>

        <div className="space-y-2">
          {sorted.map((s, i) => {
            const isMe = s.id === me?.id;
            const isSheikh = i === sorted.length - 1;
            return (
              <motion.div key={s.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: isSheikh ? `linear-gradient(135deg, ${C.red}25, ${C.red}08)`
                            : i === 0 ? `linear-gradient(135deg, ${C.amber}25, ${C.amber}08)`
                            : isMe ? `${C.purple}15` : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${isSheikh ? C.red + '80' : i === 0 ? C.amber + '80' : isMe ? C.purple + '60' : C.border}`,
                }}>
                <span className="text-2xl shrink-0">
                  {isSheikh ? '👑' : i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${s.rank}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white truncate">
                    {s.name} {isMe && <span className="text-[10px]" style={{ color: C.purple }}>(أنت)</span>}
                  </p>
                  <p className="text-[10px]" style={{ color: C.textMuted }}>
                    المركز #{s.rank} {isSheikh && '— معاه الشايب 👑'}
                  </p>
                </div>
                <div className="text-2xl font-black shrink-0" style={{ color: isSheikh ? C.red : i === 0 ? C.amber : 'white' }}>
                  {s.points}
                </div>
              </motion.div>
            );
          })}
        </div>

        {iAmAdmin && (
          <button onClick={() => emit('shayeb_reset')}
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
    <div dir="rtl" className="relative min-h-screen text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#050510]" />
        <motion.div className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent 65%)' }}
          animate={{ x: [0, 60, 0], y: [0, 50, 0] }} transition={{ duration: 24, repeat: Infinity }} />
        <motion.div className="absolute -bottom-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent 65%)' }}
          animate={{ x: [0, -60, 0], y: [0, -50, 0] }} transition={{ duration: 28, repeat: Infinity }} />
      </div>

      {renderHUD()}

      <div className="relative z-10 max-w-4xl mx-auto px-3 sm:px-4 py-4">
        <AnimatePresence mode="wait">
          {phase === 'waiting' && (
            <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center py-6">
                <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}
                  className="text-6xl mb-3">👑</motion.div>
                <h2 className="text-4xl sm:text-5xl font-black mb-2">
                  <span style={{ background: 'linear-gradient(135deg, #fbbf24, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    👑 الشايب
                  </span>
                </h2>
                <p className="text-sm" style={{ color: C.textDim }}>آخر واحد معاه الشايب = خسران</p>
              </div>
              {iAmAdmin && renderAdminControls()}
              {renderLobby()}
              {!iAmAdmin && <p className="text-center text-sm mt-6" style={{ color: C.textMuted }}>في انتظار المُيسّر...</p>}
            </motion.div>
          )}

          {phase === 'revealing' && (
            <motion.div key="revealing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderRevealing()}
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderPlayersRow()}
              {renderLastDraw()}
              {renderTargetHand()}
              {renderMyHand()}
              {renderActionBar()}
            </motion.div>
          )}

          {phase === 'gameEnd' && (
            <motion.div key="end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderGameEnd()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ModesModal
        open={showModes}
        onClose={() => setShowModes(false)}
        currentMode="shayeb"
        onSelect={(mode) => {
          socket.emit('kotshina_switch_mode', { roomCode, mode, fromMode: 'shayeb' });
        }}
      />

      <RulesModal
        open={showRules}
        onClose={() => setShowRules(false)}
        gameId="shayeb"
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