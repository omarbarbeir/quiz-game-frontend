import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RulesModal from './RulesModal';

const C = {
  bg0: '#050510', border: '#1e1e35',
  red: '#dc2626', green: '#10b981',
  amber: '#f59e0b', purple: '#a855f7',
  blue: '#2563eb', pink: '#ec4899',
  text: '#e5e7eb', textDim: '#94a3b8', textMuted: '#64748b',
};

// 🪵 Wood palette
const BOARD_BG = 'linear-gradient(135deg, #6b3410 0%, #4a2308 50%, #2d1405 100%)';
const POINT_LIGHT = 'linear-gradient(180deg, #f5deb3 0%, #e0c090 50%, #c9a56b 100%)';
const POINT_DARK  = 'linear-gradient(180deg, #8b4513 0%, #6b2d0a 50%, #3d1705 100%)';
const WHITE_C = 'radial-gradient(circle at 35% 30%, #ffffff 0%, #f0f0f0 40%, #b8b8b8 80%, #8a8a8a 100%)';
const BLACK_C = 'radial-gradient(circle at 35% 30%, #6b7280 0%, #374151 40%, #1f2937 80%, #030712 100%)';

// =====================================================
// 🎲 Die
// =====================================================
const Die = ({ value, size = 40, used = false }) => {
  const dots = {
    1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
  };
  const grid = dots[value] || [];
  const dotSize = size * 0.16;
  return (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: used ? '#4b5563' : 'linear-gradient(145deg, #ffffff, #d4d4d8)',
      border: '1.5px solid #9ca3af',
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)',
      padding: size * 0.12, boxShadow: used ? 'none' : '0 3px 8px rgba(0,0,0,0.5)',
      opacity: used ? 0.35 : 1, position: 'relative',
    }}>
      {Array.from({ length: 9 }).map((_, i) => {
        const r = Math.floor(i / 3), c = i % 3;
        const hasDot = grid.some(([dr, dc]) => dr === r && dc === c);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {hasDot && <div style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: used ? '#9ca3af' : '#1f2937' }} />}
          </div>
        );
      })}
    </div>
  );
};

// =====================================================
// 🎯 Point
// =====================================================
const Point = ({
  index, point, isTop, onClick, highlight, isSelected, lastMoveHighlight,
  isDark, maxCheckers = 5,
}) => {
  const count = point?.count || 0;
  const color = point?.color;
  const visible = Math.min(count, maxCheckers);
  const hasMore = count > maxCheckers;

  return (
    <div
      onClick={() => onClick && onClick(index)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: isTop ? 'flex-start' : 'flex-end',
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: 3,
        minWidth: 0,
        flex: 1,
      }}
    >
      {/* ✅ Triangle — مع تدرج وحدود ذهبية */}
      <div style={{
        position: 'absolute',
        top: isTop ? 0 : 'auto',
        bottom: isTop ? 'auto' : 0,
        left: '5%',
        right: '5%',
        height: '100%',
        background: isDark ? POINT_DARK : POINT_LIGHT,
        clipPath: isTop ? 'polygon(0 0, 100% 0, 50% 100%)' : 'polygon(50% 0, 100% 100%, 0 100%)',
        zIndex: 0,
        filter: isDark
          ? 'drop-shadow(0 2px 3px rgba(0,0,0,0.6))'
          : 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))',
      }} />

      {/* ✅ Base line — خط ذهبي رفيع في النهاية العريضة للمثلث */}
      <div style={{
        position: 'absolute',
        top: isTop ? 0 : 'auto',
        bottom: isTop ? 'auto' : 0,
        left: '5%',
        right: '5%',
        height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* Point number */}
      <div style={{
        position: 'absolute',
        top: isTop ? 4 : 'auto',
        bottom: isTop ? 'auto' : 4,
        fontSize: 8, fontWeight: 900,
        color: isDark ? 'rgba(255,200,140,0.5)' : 'rgba(80,40,10,0.55)',
        zIndex: 5, pointerEvents: 'none',
        fontFamily: 'monospace',
      }}>
        {index + 1}
      </div>

      {/* ✅ Checkers — عمودية، 3D sphere effect */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: isTop ? 'column' : 'column-reverse',
        alignItems: 'center',
        gap: 1,
        padding: 3,
        width: '100%',
        height: '100%',
      }}>
        {Array.from({ length: visible }).map((_, i) => (
          <div key={i} style={{
            width: '76%',
            aspectRatio: '1',
            borderRadius: '50%',
            background: color === 'w' ? WHITE_C : BLACK_C,
            border: `1px solid ${color === 'w' ? 'rgba(120,120,120,0.9)' : 'rgba(0,0,0,0.9)'}`,
            boxShadow: `
              0 2px 4px rgba(0,0,0,0.55),
              0 4px 8px rgba(0,0,0,0.25),
              inset 0 1px 2px rgba(255,255,255,0.5),
              inset 0 -2px 4px rgba(0,0,0,0.35)
            `,
            flexShrink: 0,
          }} />
        ))}
        {hasMore && (
          <div style={{
            fontSize: 10, fontWeight: 900, color: 'white',
            background: 'linear-gradient(145deg, #7c2d12, #450a0a)',
            borderRadius: 4,
            padding: '1px 5px', zIndex: 6, flexShrink: 0,
            border: '1px solid rgba(245,158,11,0.7)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.6)',
          }}>+{count - maxCheckers}</div>
        )}
      </div>

      {/* ✅ Glow — highlight (valid destination) */}
      {highlight && (
        <div style={{
          position: 'absolute', inset: 0,
          border: `3px solid ${C.green}`, borderRadius: 3,
          boxShadow: `0 0 16px ${C.green}, inset 0 0 16px ${C.green}60`,
          pointerEvents: 'none', zIndex: 10,
        }} />
      )}
      {/* ✅ Selected */}
      {isSelected && (
        <div style={{
          position: 'absolute', inset: 0,
          border: `3px solid ${C.blue}`, borderRadius: 3,
          boxShadow: `0 0 20px ${C.blue}, inset 0 0 20px ${C.blue}60`,
          pointerEvents: 'none', zIndex: 11,
        }} />
      )}
      {/* ✅ Last move highlight */}
      {lastMoveHighlight && !isSelected && !highlight && (
        <div style={{
          position: 'absolute', inset: 0,
          border: `2.5px solid ${C.amber}`, borderRadius: 3,
          boxShadow: `0 0 16px ${C.amber}, inset 0 0 16px ${C.amber}50`,
          pointerEvents: 'none', zIndex: 9,
        }} />
      )}
    </div>
  );
};

// =====================================================
// 🎮 Main
// =====================================================
export default function Backgammon({
  socket, roomCode, playerId, playerName, isAdmin = false, onExit, players: roomPlayers = [],
}) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 400);

  useEffect(() => {
    if (!socket) return;
    const onState = (s) => { setState(s); setSelectedPoint(null); };
    const onError = ({ message }) => { setError(message); setTimeout(() => setError(null), 3000); };
    socket.on('backgammon_state', onState);
    socket.on('backgammon_error', onError);

    // ✅ الأدمن واللاعبين بيدخلوا من نفس الـ join event
    socket.emit('backgammon_join', { roomCode, playerId, playerName, isAdmin });

    return () => {
      socket.off('backgammon_state', onState);
      socket.off('backgammon_error', onError);
      socket.emit('backgammon_leave', { roomCode });
    };
  }, [socket, roomCode, playerId, playerName, isAdmin]);

  useEffect(() => {
    const h = () => setVw(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    if (!isAdmin || !socket || !roomCode) return;
    if (!roomPlayers?.length) return;
    // ✅ نشيل فلتر الأدمن — الأدمن بقى لاعب عادي
    const ids = roomPlayers.map(p => p.id);
    const t1 = setTimeout(() => socket.emit('backgammon_set_order', { roomCode, playerIds: ids }), 300);
    const t2 = setTimeout(() => socket.emit('backgammon_set_order', { roomCode, playerIds: ids }), 1000);
    const t3 = setTimeout(() => socket.emit('backgammon_set_order', { roomCode, playerIds: ids }), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isAdmin, socket, roomCode, roomPlayers]);

  const emit = useCallback((ev, payload) => {
    socket?.emit(ev, { roomCode, ...payload });
  }, [socket, roomCode]);

  const handlePointClick = (index) => {
    if (!state || state.phase !== 'playing') return;
    if (state.myColor !== state.turn) return;
    if (state.remainingMoves.length === 0) return;

    const p = state.board[index];
    const myMovesFromHere = state.possibleMoves.filter(m =>
      m.fromType === 'board' && m.fromIndex === index
    );

    // لو في نقطة مختارة، حاول تتحرك
    if (selectedPoint !== null) {
      const toMove = state.possibleMoves.find(m =>
        m.fromType === 'board' && m.fromIndex === selectedPoint && m.toIndex === index
      );
      if (toMove) {
        emit('backgammon_move', {
          fromType: 'board', fromIndex: selectedPoint, toIndex: index, die: toMove.die,
        });
        setSelectedPoint(null);
        return;
      }
    }

    // لو ضغط على نقطة بتاعته وعندها حركات
    if (p.color === state.myColor && myMovesFromHere.length > 0) {
      setSelectedPoint(index);
      return;
    }
    setSelectedPoint(null);
  };

  const handleBarClick = () => {
    if (!state || state.myColor !== state.turn) return;
    if (state.bar[state.myColor] === 0) return;
    const barMoves = state.possibleMoves.filter(m => m.fromType === 'bar');
    if (barMoves.length === 0) {
      setError('مش قادر تدخل من البار');
      setTimeout(() => setError(null), 2000);
      return;
    }
    // نفّذ أول حركة متاحة
    emit('backgammon_move', {
      fromType: 'bar', fromIndex: -1, toIndex: barMoves[0].toIndex, die: barMoves[0].die,
    });
  };

  const handleBearOffClick = () => {
    if (!state || state.myColor !== state.turn) return;
    if (selectedPoint === null) return;
    const bearMove = state.possibleMoves.find(m =>
      m.fromType === 'board' && m.fromIndex === selectedPoint && m.bearOff
    );
    if (bearMove) {
      emit('backgammon_move', {
        fromType: 'board', fromIndex: selectedPoint, toIndex: -1, die: bearMove.die,
      });
      setSelectedPoint(null);
    }
  };

  if (!state) {
    return (
      <div dir="rtl" className="relative min-h-screen bg-[#050510] text-white flex items-center justify-center">
        <motion.div className="w-16 h-16 rounded-full"
          style={{ border: '3px solid transparent', borderTopColor: C.amber, borderRightColor: C.purple }}
          animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
      </div>
    );
  }

  const { me, phase, isAdmin: iAmAdmin, board, bar, off, turn, dice, remainingMoves,
    hasRolled, myColor, winner, possibleMoves, players, whiteId, blackId, lastMove } = state;
  const myTurn = myColor === turn && phase === 'playing';
  const canRoll = myTurn && !hasRolled;
  const whitePlayer = players.find(p => p.id === whiteId);
  const blackPlayer = players.find(p => p.id === blackId);

  const validDestinations = selectedPoint !== null
    ? possibleMoves.filter(m => m.fromType === 'board' && m.fromIndex === selectedPoint).map(m => m.toIndex)
    : [];

  const canBearOff = selectedPoint !== null &&
    possibleMoves.some(m => m.fromType === 'board' && m.fromIndex === selectedPoint && m.bearOff);

  // ============================================================
  // HUD
  // ============================================================
  const renderHUD = () => (
    <div className="relative z-30 w-full max-w-5xl mx-auto px-2 sm:px-4 pt-2">
      <div className="rounded-xl px-3 py-2 flex items-center justify-between gap-2 flex-wrap"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.2))', border: `1.5px solid ${C.border}` }}>
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="text-slate-400 hover:text-white text-xs flex items-center gap-1">
            <span>←</span><span>خروج</span>
          </button>
          <motion.button onClick={() => setShowRules(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="rounded-xl px-3 py-1.5 text-xs font-black flex items-center gap-1.5"
            style={{ background: `linear-gradient(135deg, ${C.blue}40, ${C.blue}15)`, border: `2px solid ${C.blue}`, color: 'white' }}>
            <span>📜</span><span className="hidden sm:inline">القواعد</span>
          </motion.button>
          <span className="rounded-xl px-3 py-1.5 text-xs font-black"
            style={{ background: `linear-gradient(135deg, ${C.amber}40, ${C.amber}15)`, border: `2px solid ${C.amber}`, color: 'white' }}>
            🎲 طاولة
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-center">
            <p className="text-[8px] uppercase tracking-widest" style={{ color: C.textMuted }}>الدور</p>
            <p className="text-sm font-black" style={{ color: C.amber }}>
              {turn === 'w' ? '⚪ أبيض' : '⚫ أسود'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[8px] uppercase tracking-widest" style={{ color: C.textMuted }}>خارج</p>
            <p className="text-sm font-black text-white">{off.w} / {off.b}</p>
          </div>
        </div>
        <div className="text-xs font-mono hidden sm:block" style={{ color: C.textMuted }}>{roomCode}</div>
      </div>
    </div>
  );

  // ============================================================
  // Lobby
  // ============================================================
  const renderLobby = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="w-full max-w-2xl mx-auto px-4 py-6">
      <div className="text-center py-6">
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}
          className="text-6xl mb-3">🎲</motion.div>
        <h2 className="text-4xl sm:text-5xl font-black mb-2">
          <span style={{ background: 'linear-gradient(135deg, #fbbf24, #dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            الطاولة
          </span>
        </h2>
        <p className="text-sm" style={{ color: C.textDim }}>المحبوسة — 2 لاعبين، كل واحد 15 حجرة</p>
      </div>

      <div className="mt-4 rounded-2xl p-4"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.15))', border: `1.5px solid ${C.border}` }}>
        <h3 className="text-sm font-black mb-3" style={{ color: C.textDim }}>👥 اللاعبين ({players.length})</h3>
        <div className="flex flex-wrap gap-2">
          {players.map(p => (
            <div key={p.id} className="px-3 py-1.5 rounded-lg text-sm font-bold"
              style={{
                background: p.isMe ? `${C.purple}25` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${p.isMe ? C.purple + '60' : C.border}`,
                color: p.isMe ? C.purple : C.text,
              }}>
              {p.name} {p.isMe && '(أنت)'}
            </div>
          ))}
        </div>
      </div>

      {iAmAdmin && (
        <div className="mt-4 rounded-2xl p-4"
          style={{ background: 'linear-gradient(145deg, rgba(168,85,247,0.08), rgba(0,0,0,0.2))', border: `1.5px solid ${C.purple}40` }}>
          <h3 className="text-sm font-black mb-3" style={{ color: C.purple }}>🎩 لوحة الأدمن</h3>
          <motion.button
            disabled={players.length < 2}
            onClick={() => setShowStartModal(true)}
            whileHover={players.length >= 2 ? { scale: 1.02 } : {}}
            whileTap={players.length >= 2 ? { scale: 0.98 } : {}}
            className="w-full rounded-xl py-4 font-black text-base flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${C.green}30, ${C.green}15)`, border: `1.5px solid ${C.green}60`, color: C.green }}>
            <span className="text-2xl">🎬</span><span>ابدأ اللعبة</span>
          </motion.button>
        </div>
      )}
      {!iAmAdmin && <p className="text-center text-sm mt-6" style={{ color: C.textMuted }}>في انتظار المُيسّر...</p>}
    </motion.div>
  );

  // ============================================================
  // Board
  // ============================================================
  const renderBoard = () => {
    // ✅ حجم البورد حسب عرض الشاشة
    const boardMaxW =
      vw >= 1600 ? 1200 :
      vw >= 1300 ? 1050 :
      vw >= 1000 ? 900  :
      vw >= 700  ? 750  :
      620;

    const boardMaxH =
      vw >= 1600 ? 900 :
      vw >= 1300 ? 800 :
      vw >= 1000 ? 720 :
      620;

    // ✅ ترتيب النقاط (LTR)
    const TOP = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
    const BOT = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

    const highlightFor = (idx) => selectedPoint !== null && validDestinations.includes(idx);

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr) 34px repeat(6, 1fr)',
          gridTemplateRows: '1fr 44px 1fr',
          gap: 2,
          direction: 'ltr',
          padding: 14,
          width: '100%',
          maxWidth: boardMaxW,
          height: `clamp(480px, 88vh, ${boardMaxH}px)`,
          margin: '0 auto',
          background: BOARD_BG,
          border: '6px solid #3d1f08',
          borderRadius: 16,
          boxShadow: `
            inset 0 0 80px rgba(0,0,0,0.85),
            inset 0 0 0 2px rgba(245,158,11,0.35),
            inset 0 0 0 4px rgba(120,53,15,0.7),
            0 20px 60px rgba(0,0,0,0.8),
            0 0 60px rgba(139,69,19,0.25)
          `,
          position: 'relative',
        }}
      >
        {/* ✅ نقوش خشبية — خطوط رفيعة */}
        <div style={{
          position: 'absolute', inset: 0,
          pointerEvents: 'none',
          borderRadius: 10,
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              rgba(0,0,0,0.08) 0px,
              rgba(0,0,0,0.08) 1px,
              transparent 1px,
              transparent 4px
            )
          `,
          opacity: 0.5,
          zIndex: 1,
        }} />

        {/* Top row (12 points) */}
        {TOP.map((idx, i) => {
          const col = i < 6 ? i + 1 : i + 2;
          const isDark = i % 2 === 1;
          const p = board[idx];
          return (
            <div key={`top-${idx}`} style={{ gridColumn: col, gridRow: 1, display: 'flex', zIndex: 2 }}>
              <Point
                index={idx}
                point={p}
                isTop={true}
                onClick={handlePointClick}
                highlight={highlightFor(idx)}
                isSelected={selectedPoint === idx}
                lastMoveHighlight={lastMove?.toIndex === idx}
                isDark={isDark}
                maxCheckers={5}
              />
            </div>
          );
        })}

        {/* ✅ Bar (middle horizontal) — خشب غامق + ذهبي */}
        <div style={{
          gridColumn: '1 / -1',
          gridRow: 2,
          background: 'linear-gradient(180deg, #2a1505 0%, #1a0a02 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 30,
          borderRadius: 6,
          boxShadow: `
            inset 0 4px 10px rgba(0,0,0,0.9),
            inset 0 -4px 10px rgba(0,0,0,0.9),
            inset 0 0 0 1px rgba(245,158,11,0.3)
          `,
          position: 'relative',
          zIndex: 3,
        }}>
          {/* Black bar (top side) */}
          <div onClick={handleBarClick} style={{
            display: 'flex', gap: 3, alignItems: 'center',
            padding: '4px 12px', borderRadius: 8, minHeight: 32,
            cursor: (myColor === 'b' && bar.b > 0 && myTurn) ? 'pointer' : 'default',
            background: (myColor === 'b' && bar.b > 0 && myTurn)
              ? 'linear-gradient(135deg, rgba(245,158,11,0.5), rgba(245,158,11,0.2))'
              : 'transparent',
            border: (myColor === 'b' && bar.b > 0 && myTurn) ? `2px solid ${C.amber}` : '2px solid transparent',
            boxShadow: (myColor === 'b' && bar.b > 0 && myTurn) ? `0 0 20px ${C.amber}80` : 'none',
            transition: 'all 0.2s',
          }}>
            {bar.b === 0 && <span style={{ color: '#d4a574', fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>BAR</span>}
            {Array.from({ length: Math.min(bar.b, 6) }).map((_, i) => (
              <div key={i} style={{
                width: 18, height: 18, borderRadius: '50%',
                background: BLACK_C,
                border: '1.5px solid rgba(0,0,0,0.9)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.3)',
              }} />
            ))}
            {bar.b > 6 && <span style={{ color: 'white', fontSize: 10, fontWeight: 900 }}>+{bar.b - 6}</span>}
          </div>

          {/* Center decoration */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}>
            <span style={{ color: '#fbbf24', fontSize: 14, fontWeight: 900, textShadow: '0 0 8px rgba(245,158,11,0.6)' }}>◄</span>
            <div style={{ width: 30, height: 1, background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)' }} />
            <span style={{ color: '#fbbf24', fontSize: 14, fontWeight: 900, textShadow: '0 0 8px rgba(245,158,11,0.6)' }}>►</span>
          </div>

          {/* White bar */}
          <div onClick={handleBarClick} style={{
            display: 'flex', gap: 3, alignItems: 'center',
            padding: '4px 12px', borderRadius: 8, minHeight: 32,
            cursor: (myColor === 'w' && bar.w > 0 && myTurn) ? 'pointer' : 'default',
            background: (myColor === 'w' && bar.w > 0 && myTurn)
              ? 'linear-gradient(135deg, rgba(245,158,11,0.5), rgba(245,158,11,0.2))'
              : 'transparent',
            border: (myColor === 'w' && bar.w > 0 && myTurn) ? `2px solid ${C.amber}` : '2px solid transparent',
            boxShadow: (myColor === 'w' && bar.w > 0 && myTurn) ? `0 0 20px ${C.amber}80` : 'none',
            transition: 'all 0.2s',
          }}>
            {bar.w === 0 && <span style={{ color: '#d4a574', fontSize: 10, fontWeight: 900, letterSpacing: 1 }}>BAR</span>}
            {Array.from({ length: Math.min(bar.w, 6) }).map((_, i) => (
              <div key={i} style={{
                width: 18, height: 18, borderRadius: '50%',
                background: WHITE_C,
                border: '1.5px solid rgba(120,120,120,0.9)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.55), inset 0 1px 2px rgba(255,255,255,0.6)',
              }} />
            ))}
            {bar.w > 6 && <span style={{ color: 'white', fontSize: 10, fontWeight: 900 }}>+{bar.w - 6}</span>}
          </div>
        </div>

        {/* Bottom row (12 points) */}
        {BOT.map((idx, i) => {
          const col = i < 6 ? i + 1 : i + 2;
          const isDark = i % 2 === 0;
          const p = board[idx];
          return (
            <div key={`bot-${idx}`} style={{ gridColumn: col, gridRow: 3, display: 'flex', zIndex: 2 }}>
              <Point
                index={idx}
                point={p}
                isTop={false}
                onClick={handlePointClick}
                highlight={highlightFor(idx)}
                isSelected={selectedPoint === idx}
                lastMoveHighlight={lastMove?.toIndex === idx}
                isDark={isDark}
                maxCheckers={5}
              />
            </div>
          );
        })}

        {/* ✅ OFF tray — على اليمين — شكل أحسن */}
        <div
          onClick={handleBearOffClick}
          style={{
            position: 'absolute',
            right: 6,
            top: '50%',
            transform: 'translateY(-50%)',
            background: canBearOff
              ? 'linear-gradient(135deg, rgba(16,185,129,0.5), rgba(5,150,105,0.25))'
              : 'linear-gradient(135deg, rgba(42,21,5,0.9), rgba(26,10,2,0.9))',
            border: canBearOff
              ? `2.5px solid ${C.green}`
              : '2px solid rgba(245,158,11,0.5)',
            borderRadius: 10,
            padding: '10px 6px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            alignItems: 'center',
            zIndex: 20,
            cursor: canBearOff ? 'pointer' : 'default',
            boxShadow: canBearOff
              ? `0 0 25px ${C.green}, inset 0 0 12px ${C.green}40`
              : '0 4px 12px rgba(0,0,0,0.7), inset 0 0 8px rgba(0,0,0,0.5)',
            transition: 'all 0.25s',
            minWidth: 34,
          }}
        >
          <p style={{
            color: '#fbbf24',
            fontSize: 8,
            fontWeight: 900,
            margin: 0,
            letterSpacing: 1.5,
            textShadow: '0 0 6px rgba(245,158,11,0.7)',
          }}>OFF</p>

          {/* White checkers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            {Array.from({ length: Math.min(off.w, 5) }).map((_, i) => (
              <div key={`ow${i}`} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: WHITE_C,
                border: '1px solid rgba(120,120,120,0.9)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.7)',
              }} />
            ))}
            {off.w > 5 && <span style={{ color: '#fbbf24', fontSize: 8, fontWeight: 900 }}>+{off.w - 5}</span>}
          </div>

          {/* Divider */}
          <div style={{
            width: '80%',
            height: 1.5,
            background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)',
            borderRadius: 1,
          }} />

          {/* Black checkers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            {Array.from({ length: Math.min(off.b, 5) }).map((_, i) => (
              <div key={`ob${i}`} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: BLACK_C,
                border: '1px solid rgba(0,0,0,0.9)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.3)',
              }} />
            ))}
            {off.b > 5 && <span style={{ color: '#fbbf24', fontSize: 8, fontWeight: 900 }}>+{off.b - 5}</span>}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // Controls
  // ============================================================
  const renderControls = () => (
    <div className="mt-3 flex flex-col items-center gap-2 pb-4">
      {/* اسم الخصم */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{
            background: (turn !== myColor) && phase === 'playing' ? `${C.amber}30` : 'rgba(255,255,255,0.05)',
            border: `1px solid ${(turn !== myColor) && phase === 'playing' ? C.amber : C.border}`,
          }}>
          <span style={{ fontSize: 14 }}>{myColor === 'w' ? '⚫' : '⚪'}</span>
          <span style={{ color: 'white' }}>{myColor === 'w' ? blackPlayer?.name : whitePlayer?.name}</span>
        </div>
      </div>

      {/* الزهر + العدّاد */}
      <div className="flex flex-col items-center gap-2">
        {dice.length > 0 && (
          <div className="text-xs font-black px-3 py-1 rounded-full"
            style={{
              background: remainingMoves.length > 0 ? `${C.green}25` : `${C.textMuted}15`,
              border: `1.5px solid ${remainingMoves.length > 0 ? C.green + '80' : C.border}`,
              color: remainingMoves.length > 0 ? C.green : C.textMuted,
            }}>
            {remainingMoves.length === 0
              ? '✅ خلصت حركاتك'
              : `🎲 متبقي ${remainingMoves.length} حركة`}
          </div>
        )}

        <div className="flex gap-2 items-center justify-center flex-wrap">
          {dice.length === 0 && hasRolled && (
            <span className="text-xs" style={{ color: C.textMuted }}>خلص الزهر</span>
          )}
          {dice.length === 0 && !hasRolled && (
            <span className="text-xs" style={{ color: C.textMuted }}>اقلب الزهر</span>
          )}
          {(() => {
            const rem = [...remainingMoves];
            return dice.map((d, i) => {
              const idx = rem.indexOf(d);
              const used = idx === -1;
              if (!used) rem.splice(idx, 1);
              return <Die key={i} value={d} size={46} used={used} />;
            });
          })()}
        </div>
      </div>

      {/* زرار اقلب الزهر */}
      {canRoll && (
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => emit('backgammon_roll')}
          className="rounded-2xl px-8 py-3 font-black text-base flex items-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${C.green}60, ${C.green}25)`,
            border: `2px solid ${C.green}`,
            color: 'white',
            boxShadow: `0 0 30px -5px ${C.green}`,
          }}>
          🎲 اقلب الزهر
        </motion.button>
      )}

      {/* زرار إنهاء الدور */}
      {myTurn && hasRolled && remainingMoves.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => emit('backgammon_end_turn')}
          className="rounded-xl px-6 py-2 font-black text-sm"
          style={{
            background: `linear-gradient(135deg, ${C.amber}50, ${C.amber}25)`,
            border: `1.5px solid ${C.amber}`,
            color: 'white',
          }}>
          ⏭️ إنهاء الدور
        </motion.button>
      )}

      {/* اسمي */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{
            background: myTurn ? `${C.green}30` : 'rgba(255,255,255,0.05)',
            border: `1px solid ${myTurn ? C.green : C.border}`,
          }}>
          <span style={{ fontSize: 14 }}>{myColor === 'w' ? '⚪' : '⚫'}</span>
          <span style={{ color: 'white' }}>{me?.name} {myColor === 'w' ? '(أبيض)' : '(أسود)'}</span>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // End Popup
  // ============================================================
  const renderEndPopup = () => {
    if (phase !== 'gameEnd') return null;
    const iWon = winner === myColor;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 z-[96] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.5, y: 30 }} animate={{ scale: 1, y: 0 }}
          className="rounded-3xl px-8 py-8 text-center max-w-md w-full"
          style={{
            background: 'linear-gradient(145deg, #111122, #0a0a14)',
            border: `3px solid ${iWon ? C.green : C.amber}`,
            boxShadow: `0 0 80px -10px ${iWon ? C.green : C.amber}`,
          }}>
          <motion.div className="text-7xl mb-3"
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            {iWon ? '🏆' : '😢'}
          </motion.div>
          <h2 className="text-3xl font-black mb-2 text-white">
            {winner === 'w' ? '⚪ الأبيض كسب!' : '⚫ الأسود كسب!'}
          </h2>
          {iWon && <p className="text-sm mb-4" style={{ color: C.green }}>🎉 مبروك!</p>}

          <div className="mt-4 space-y-2 text-right">
            <div className="flex items-center justify-between p-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
              <span className="text-sm font-black">⚪ {whitePlayer?.name}</span>
              <span style={{ color: 'white' }}>{off.w}/15</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}` }}>
              <span className="text-sm font-black">⚫ {blackPlayer?.name}</span>
              <span style={{ color: 'white' }}>{off.b}/15</span>
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <button onClick={onExit}
              className="flex-1 rounded-xl py-3 font-black text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1.5px solid ${C.border}`, color: C.textDim }}>
              خروج
            </button>
            {iAmAdmin && (
              <button onClick={() => emit('backgammon_reset')}
                className="flex-1 rounded-xl py-3 font-black text-sm"
                style={{ background: `linear-gradient(135deg, ${C.green}40, ${C.green}15)`, border: `1.5px solid ${C.green}`, color: 'white' }}>
                🔄 لعبة جديدة
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div dir="rtl" className="relative min-h-screen text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(139,69,19,0.15) 0%, transparent 60%), #050510' }} />

      <div className="relative z-30">{renderHUD()}</div>

      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {phase === 'waiting' && <div key="lobby">{renderLobby()}</div>}
          {phase === 'playing' && (
            <div key="playing" className="w-full px-1 sm:px-2">
              {renderBoard()}
              {renderControls()}
            </div>
          )}
        </AnimatePresence>
      </div>

      {iAmAdmin && phase === 'playing' && (
        <div className="fixed bottom-3 left-3 z-40">
          <button
            onClick={() => { if (window.confirm('إعادة تعيين؟')) emit('backgammon_reset'); }}
            className="text-xs font-bold px-3 py-2 rounded-lg"
            style={{ background: `${C.red}25`, border: `1px solid ${C.red}60`, color: C.red }}>
            🔄 إعادة تعيين
          </button>
        </div>
      )}

      {renderEndPopup()}

      <StartModal
        open={showStartModal}
        players={players}
        onClose={() => setShowStartModal(false)}
        onStart={(w, b) => {
          emit('backgammon_start', { whiteId: w, blackId: b });
          setShowStartModal(false);
        }}
      />

      <RulesModal
        open={showRules}
        onClose={() => setShowRules(false)}
        gameId="backgammon"
      />

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className="fixed top-4 inset-x-0 z-[100] flex justify-center pointer-events-none">
            <div className="px-5 py-3 rounded-xl font-bold text-sm"
              style={{ background: 'rgba(220, 38, 38, 0.35)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(255, 255, 255, 0.3)' }}>
              ⚠️ {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =====================================================
// Start Modal
// =====================================================
const StartModal = ({ open, players, onClose, onStart }) => {
  const [whiteId, setWhiteId] = useState(players[0]?.id || null);
  const [blackId, setBlackId] = useState(players[1]?.id || null);

  useEffect(() => {
    if (whiteId && blackId && whiteId === blackId) {
      const other = players.find(p => p.id !== whiteId);
      if (other) setBlackId(other.id);
    }
  }, [whiteId, blackId, players]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }}
            className="w-full max-w-md rounded-2xl p-5"
            style={{ background: 'linear-gradient(145deg, #111122, #0a0a14)', border: `2px solid ${C.amber}60` }}>
            <h3 className="text-xl font-black mb-4 text-center" style={{ color: C.amber }}>ابدأ اللعبة</h3>

            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-widest mb-2 font-black" style={{ color: C.textMuted }}>⚪ الأبيض (يبدأ)</p>
              {players.map(p => (
                <button key={p.id} onClick={() => setWhiteId(p.id)}
                  className="w-full rounded-xl p-2 text-right mb-1 font-black text-sm"
                  style={{
                    background: whiteId === p.id ? `${C.blue}30` : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${whiteId === p.id ? C.blue : C.border}`,
                  }}>
                  {p.name}
                </button>
              ))}
            </div>

            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-widest mb-2 font-black" style={{ color: C.textMuted }}>⚫ الأسود</p>
              {players.filter(p => p.id !== whiteId).map(p => (
                <button key={p.id} onClick={() => setBlackId(p.id)}
                  className="w-full rounded-xl p-2 text-right mb-1 font-black text-sm"
                  style={{
                    background: blackId === p.id ? `${C.purple}30` : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${blackId === p.id ? C.purple : C.border}`,
                  }}>
                  {p.name}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={onClose}
                className="flex-1 rounded-xl py-3 font-black text-sm"
                style={{ background: 'rgba(255,255,255,0.05)', border: `1.5px solid ${C.border}`, color: C.textDim }}>
                إلغاء
              </button>
              <button
                disabled={!whiteId || !blackId || whiteId === blackId}
                onClick={() => onStart(whiteId, blackId)}
                className="flex-1 rounded-xl py-3 font-black text-sm disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${C.green}40, ${C.green}15)`, border: `1.5px solid ${C.green}`, color: 'white' }}>
                ▶️ ابدأ
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};