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

function cellPos(n, size) {
  const row = Math.floor((n - 1) / 10);
  let col = (n - 1) % 10;
  if (row % 2 === 1) col = 9 - col;
  return {
    x: col * size,
    y: (9 - row) * size,
    cx: col * size + size / 2,
    cy: (9 - row) * size + size / 2,
    row, col,
  };
}

// =====================================================
// 🎲 Die
// =====================================================
const Die = ({ value, size = 60, rolling = false }) => {
  const dots = {
    1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
  };
  const grid = dots[value] || [];
  const dotSize = size * 0.16;
  return (
    <motion.div
      animate={rolling ? { rotate: [0, 360, -360, 0], scale: [1, 1.1, 1] } : { rotate: 0, scale: 1 }}
      transition={rolling ? { duration: 0.6, repeat: Infinity } : { duration: 0.2 }}
      style={{
        width: size, height: size, borderRadius: 12,
        background: 'linear-gradient(145deg, #ffffff, #d4d4d8)',
        border: '2px solid #9ca3af',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)',
        padding: size * 0.12, boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
      }}
    >
      {Array.from({ length: 9 }).map((_, i) => {
        const r = Math.floor(i / 3), c = i % 3;
        const hasDot = grid.some(([dr, dc]) => dr === r && dc === c);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {hasDot && <div style={{ width: dotSize, height: dotSize, borderRadius: '50%', background: '#1f2937' }} />}
          </div>
        );
      })}
    </motion.div>
  );
};

// =====================================================
// 🎮 Main
// =====================================================
export default function SnakesLadders({
  socket, roomCode, playerId, playerName, isAdmin = false, onExit, players: roomPlayers = [],
}) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [displayDice, setDisplayDice] = useState(1);
  const [cellSize, setCellSize] = useState(50);
  const [lastEvent, setLastEvent] = useState(null);
  const [displayPositions, setDisplayPositions] = useState({});

  // ✅ phase machine: idle → spinning → waiting → idle
  const [animPhase, setAnimPhase] = useState('idle');
  const pendingRef = useRef(null);
  const lastTsRef = useRef(0);
  const stateRef = useRef(null);

  // =========================================================
  // 🎯 EFFECT 1: استقبال state من السيرفر
  // =========================================================
  useEffect(() => {
    if (!socket) return;

    const onState = (s) => {
      stateRef.current = s;
      setState(s);

      const ts = s.lastRoll?.timestamp || 0;

      if (ts > lastTsRef.current) {
        // 🎲 رمية جديدة!
        console.log('🎲 NEW ROLL detected, ts=', ts);
        lastTsRef.current = ts;
        pendingRef.current = {
          positions: { ...s.positions },
          roll: s.lastRoll,
        };
        setAnimPhase('spinning');
      } else {
        // 🟢 مزامنة عادية بس لو مش في أنيميشن
        // (سيبها فاضية - useEffect 3 هو اللي هيمزامن)
      }
    };

    const onError = ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    };

    socket.on('snakes_state', onState);
    socket.on('snakes_error', onError);

    // ✅ الأدمن واللاعبين بيدخلوا من نفس الـ join event
    socket.emit('snakes_join', { roomCode, playerId, playerName, isAdmin });

    return () => {
      socket.off('snakes_state', onState);
      socket.off('snakes_error', onError);
      socket.emit('snakes_leave', { roomCode });
    };
  }, [socket, roomCode, playerId, playerName, isAdmin]);

  // =========================================================
  // 🎯 EFFECT 2: مرحلة اللف (3 ثواني)
  // =========================================================
  useEffect(() => {
    if (animPhase !== 'spinning') return;
    console.log('▶️ START SPINNING (3s)');

    setRolling(true);
    const spinInterval = setInterval(() => {
      setDisplayDice(Math.floor(Math.random() * 6) + 1);
    }, 80);

    const stopTimer = setTimeout(() => {
      clearInterval(spinInterval);
      if (pendingRef.current?.roll) {
        setDisplayDice(pendingRef.current.roll.value);
      }
      setRolling(false);  // ← ✅ وقف اللف البصري هنا
      console.log('⏸️ SPIN DONE → WAITING (6s)');
      setAnimPhase('waiting');
    }, 3000);

    return () => {
      clearInterval(spinInterval);
      clearTimeout(stopTimer);
    };
  }, [animPhase]);

  // =========================================================
  // 🎯 EFFECT 3: مرحلة الانتظار (6 ثواني) ثم الحركة
  // =========================================================
  useEffect(() => {
    if (animPhase !== 'waiting') return;

    const moveTimer = setTimeout(() => {
      const data = pendingRef.current;
      console.log('🎯 MOVING TOKEN NOW');
      if (data) {
        // 🎯 دلوقتي بس نحدّث المواقع
        setDisplayPositions(data.positions);

        // 📢 اعرض الحدث
        const roll = data.roll;
        if (roll.snake) setLastEvent({ type: 'snake', ...roll });
        else if (roll.ladder) setLastEvent({ type: 'ladder', ...roll });
        else if (roll.overshoot) setLastEvent({ type: 'overshoot', ...roll });
        else setLastEvent({ type: 'roll', ...roll });
        setTimeout(() => setLastEvent(null), 2200);
      }
      pendingRef.current = null;
      setAnimPhase('idle');
      console.log('✅ ANIMATION COMPLETE');
    }, 3000);

    return () => clearTimeout(moveTimer);
  }, [animPhase]);

  // =========================================================
  // 🎯 EFFECT 4: مزامنة أولية للمواقع (لما مفيش أنيميشن)
  // =========================================================
  useEffect(() => {
    if (animPhase !== 'idle') return;
    if (!state?.positions) return;
    setDisplayPositions({ ...state.positions });
  }, [state?.positions, animPhase]);

  // ترتيب اللاعبين
  useEffect(() => {
    if (!isAdmin || !socket || !roomCode) return;
    if (!roomPlayers?.length) return;
    // ✅ نشيل فلتر الأدمن — الأدمن بقى لاعب عادي
    const ids = roomPlayers.map(p => p.id);
    const t1 = setTimeout(() => socket.emit('snakes_set_order', { roomCode, playerIds: ids }), 300);
    const t2 = setTimeout(() => socket.emit('snakes_set_order', { roomCode, playerIds: ids }), 1000);
    const t3 = setTimeout(() => socket.emit('snakes_set_order', { roomCode, playerIds: ids }), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isAdmin, socket, roomCode, roomPlayers]);

  // حجم الخانة حسب الشاشة
  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const sizeByW = (vw - 20) / 10;
      const sizeByH = (vh - 280) / 10;
      setCellSize(Math.max(28, Math.min(sizeByW, sizeByH, 62)));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const emit = useCallback((ev, payload) => {
    socket?.emit(ev, { roomCode, ...payload });
  }, [socket, roomCode]);

  if (!state) {
    return (
      <div dir="rtl" className="relative min-h-screen bg-[#050510] text-white flex items-center justify-center">
        <motion.div className="w-16 h-16 rounded-full"
          style={{ border: '3px solid transparent', borderTopColor: C.amber, borderRightColor: C.purple }}
          animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
      </div>
    );
  }

  const { me, phase, isAdmin: iAmAdmin, currentTurn, currentTurnName,
    winner, players, ladders, snakes } = state;
  const myTurn = currentTurn === me?.id && phase === 'playing';
  const size = cellSize;
  const boardSize = size * 10;

  // ============================================================
  // HUD
  // ============================================================
  const renderHUD = () => (
    <div className="relative z-30 w-full max-w-5xl mx-auto px-3 sm:px-4 pt-3">
      <div className="rounded-2xl px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.2))', backdropFilter: 'blur(16px)', border: `1.5px solid ${C.border}` }}>
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
            🪜 السلم والثعبان
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-[8px] uppercase tracking-widest" style={{ color: C.textMuted }}>الدور</p>
            <p className="text-sm font-black" style={{ color: C.amber }}>{currentTurnName || '—'}</p>
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
          className="text-6xl mb-3">🪜</motion.div>
        <h2 className="text-4xl sm:text-5xl font-black mb-2">
          <span style={{ background: 'linear-gradient(135deg, #10b981, #dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            السلم والثعبان
          </span>
        </h2>
        <p className="text-sm" style={{ color: C.textDim }}>2-6 لاعبين — أول من يوصل 100 يفوز</p>
      </div>

      <div className="mt-4 rounded-2xl p-4"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.15))', border: `1.5px solid ${C.border}` }}>
        <h3 className="text-sm font-black mb-3" style={{ color: C.textDim }}>👥 اللاعبين ({players.length})</h3>
        <div className="flex flex-wrap gap-2">
          {players.map(p => (
            <div key={p.id} className="px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2"
              style={{
                background: p.isMe ? `${C.purple}25` : `${p.color}20`,
                border: `1.5px solid ${p.isMe ? C.purple : p.color}`,
                color: 'white',
              }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: p.color }} />
              <span>{p.name}</span>
              {p.isMe && <span className="text-[10px]">(أنت)</span>}
            </div>
          ))}
        </div>
      </div>

      {iAmAdmin && (
        <div className="mt-4 rounded-2xl p-4"
          style={{ background: 'linear-gradient(145deg, rgba(168,85,247,0.08), rgba(0,0,0,0.2))', border: `1.5px solid ${C.purple}40` }}>
          <h3 className="text-sm font-black mb-3" style={{ color: C.purple }}>🎩 لوحة الأدمن</h3>
          <motion.button
            disabled={players.length < 2 || players.length > 6}
            onClick={() => emit('snakes_start')}
            whileHover={players.length >= 2 && players.length <= 6 ? { scale: 1.02 } : {}}
            whileTap={players.length >= 2 && players.length <= 6 ? { scale: 0.98 } : {}}
            className="w-full rounded-xl py-4 font-black text-base flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${C.green}30, ${C.green}15)`, border: `1.5px solid ${C.green}60`, color: C.green }}>
            <span className="text-2xl">🎬</span><span>ابدأ اللعب</span>
          </motion.button>
          {players.length < 2 && <p className="text-xs text-center mt-2" style={{ color: C.textMuted }}>محتاج 2-6 لاعبين</p>}
        </div>
      )}
      {!iAmAdmin && <p className="text-center text-sm mt-6" style={{ color: C.textMuted }}>في انتظار المُيسّر...</p>}
    </motion.div>
  );

  // ============================================================
  // Board
  // ============================================================
  const renderBoard = () => {
    const cells = [];
    for (let n = 100; n >= 1; n--) {
      const pos = cellPos(n, size);
      const isDark = (pos.row + pos.col) % 2 === 1;
      const playersHere = players.filter(p => (displayPositions[p.id] ?? 0) === n);

      cells.push(
        <div
          key={n}
          style={{
            position: 'absolute',
            left: pos.x,
            top: pos.y,
            width: size,
            height: size,
            background: isDark ? '#c19a6b' : '#f0d9a8',
            border: '1px solid rgba(0,0,0,0.15)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: 2,
            fontSize: Math.max(8, size * 0.18),
            fontWeight: 900,
            color: 'rgba(0,0,0,0.55)',
            overflow: 'hidden',
            borderRadius: 2,
          }}
        >
          <span style={{ lineHeight: 1, alignSelf: 'flex-start' }}>{n}</span>

          {playersHere.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: '95%',
              pointerEvents: 'none',
            }}>
              {playersHere.map(p => (
                <motion.div
                  key={p.id}
                  layoutId={`token-${p.id}`}
                  style={{
                    width: size * 0.4,
                    height: size * 0.4,
                    borderRadius: '50%',
                    background: p.color,
                    border: '2px solid white',
                    boxShadow: `0 0 8px ${p.color}, 0 2px 4px rgba(0,0,0,0.5)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: size * 0.18,
                    color: 'white',
                    fontWeight: 900,
                    zIndex: 5,
                  }}
                  transition={{ type: 'spring', stiffness: 80, damping: 18, duration: 0.8 }}
                  title={p.name}
                >
                  {p.name?.[0]?.toUpperCase() || '?'}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className="relative mx-auto"
        style={{
          width: boardSize,
          height: boardSize,
          background: '#d4a574',
          border: '5px solid #3d1f08',
          borderRadius: 14,
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5), 0 12px 40px rgba(0,0,0,0.7)',
          direction: 'ltr',
        }}
      >
        {cells}

        <svg
          viewBox={`0 0 ${boardSize} ${boardSize}`}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
            pointerEvents: 'none',
            zIndex: 3,
          }}
        >
          {Object.entries(ladders).map(([from, to]) => {
            const p1 = cellPos(+from, size);
            const p2 = cellPos(to, size);
            const dx = p2.cx - p1.cx;
            const dy = p2.cy - p1.cy;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
            const railOffset = Math.max(3, size * 0.14);
            const railW = Math.max(2, size * 0.07);
            const rungW = Math.max(2, size * 0.06);
            const rungCount = Math.max(5, Math.floor(length / (size * 0.5)));

            return (
              <g key={`L-${from}`} transform={`translate(${p1.cx}, ${p1.cy}) rotate(${angle})`}>
                <line x1={0} y1={-railOffset} x2={length} y2={-railOffset}
                  stroke="#8b5a2b" strokeWidth={railW} strokeLinecap="round" />
                <line x1={0} y1={railOffset} x2={length} y2={railOffset}
                  stroke="#8b5a2b" strokeWidth={railW} strokeLinecap="round" />
                <line x1={0} y1={-railOffset - railW * 0.25} x2={length} y2={-railOffset - railW * 0.25}
                  stroke="#d4a373" strokeWidth={railW * 0.4} strokeLinecap="round" opacity={0.7} />
                <line x1={0} y1={railOffset - railW * 0.25} x2={length} y2={railOffset - railW * 0.25}
                  stroke="#d4a373" strokeWidth={railW * 0.4} strokeLinecap="round" opacity={0.7} />
                {Array.from({ length: rungCount }).map((_, i) => {
                  const t = (i + 1) / (rungCount + 1);
                  const x = length * t;
                  return (
                    <line key={i} x1={x} y1={-railOffset} x2={x} y2={railOffset}
                      stroke="#8b5a2b" strokeWidth={rungW} strokeLinecap="round" />
                  );
                })}
              </g>
            );
          })}

          {Object.entries(snakes).map(([from, to]) => {
            const p1 = cellPos(+from, size);
            const p2 = cellPos(to, size);
            const dx = p2.cx - p1.cx;
            const dy = p2.cy - p1.cy;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const mx = (p1.cx + p2.cx) / 2;
            const my = (p1.cy + p2.cy) / 2;
            const perpX = -dy / len;
            const perpY = dx / len;
            const curveAmp = Math.min(len * 0.25, size * 1.5);
            const cx = mx + perpX * curveAmp;
            const cy = my + perpY * curveAmp;
            const headR = Math.max(5, size * 0.22);
            const bodyW = Math.max(4, size * 0.16);

            return (
              <g key={`S-${from}`}>
                <path d={`M ${p1.cx} ${p1.cy} Q ${cx} ${cy} ${p2.cx} ${p2.cy}`}
                  stroke="#166534" strokeWidth={bodyW + 2} fill="none" strokeLinecap="round" opacity={0.95} />
                <path d={`M ${p1.cx} ${p1.cy} Q ${cx} ${cy} ${p2.cx} ${p2.cy}`}
                  stroke="#22c55e" strokeWidth={bodyW} fill="none" strokeLinecap="round" />
                <path d={`M ${p1.cx} ${p1.cy} Q ${cx} ${cy} ${p2.cx} ${p2.cy}`}
                  stroke="#86efac" strokeWidth={Math.max(1.5, bodyW * 0.35)} fill="none" strokeLinecap="round" opacity={0.6} />
                <circle cx={p1.cx} cy={p1.cy} r={headR} fill="#166534" />
                <circle cx={p1.cx} cy={p1.cy} r={headR - 1} fill="#22c55e" />
                <circle cx={p1.cx - headR * 0.35} cy={p1.cy - headR * 0.2} r={headR * 0.25} fill="white" />
                <circle cx={p1.cx + headR * 0.35} cy={p1.cy - headR * 0.2} r={headR * 0.25} fill="white" />
                <circle cx={p1.cx - headR * 0.35} cy={p1.cy - headR * 0.2} r={headR * 0.12} fill="black" />
                <circle cx={p1.cx + headR * 0.35} cy={p1.cy - headR * 0.2} r={headR * 0.12} fill="black" />
                <line x1={p1.cx} y1={p1.cy + headR * 0.6} x2={p1.cx} y2={p1.cy + headR * 1.1}
                  stroke="#dc2626" strokeWidth={Math.max(1, headR * 0.15)} strokeLinecap="round" />
                <line x1={p1.cx} y1={p1.cy + headR * 1.1} x2={p1.cx - headR * 0.25} y2={p1.cy + headR * 1.35}
                  stroke="#dc2626" strokeWidth={Math.max(1, headR * 0.15)} strokeLinecap="round" />
                <line x1={p1.cx} y1={p1.cy + headR * 1.1} x2={p1.cx + headR * 0.25} y2={p1.cy + headR * 1.35}
                  stroke="#dc2626" strokeWidth={Math.max(1, headR * 0.15)} strokeLinecap="round" />
                <circle cx={p2.cx} cy={p2.cy} r={bodyW * 0.6} fill="#166534" />
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  // ============================================================
  // Controls
  // ============================================================
  const renderControls = () => (
    <div className="w-full max-w-5xl mx-auto mt-3 px-2 flex flex-col items-center gap-3 pb-6">
      <div className="flex gap-2 overflow-x-auto pb-1 justify-center flex-wrap">
        {players.map(p => {
          const pos = displayPositions[p.id] ?? 0;
          return (
            <motion.div key={p.id}
              className="shrink-0 rounded-xl px-3 py-2 flex items-center gap-2 min-w-[110px]"
              style={{
                background: p.isTurn ? `${p.color}30` : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${p.isTurn ? p.color : C.border}`,
                boxShadow: p.isTurn ? `0 0 20px -6px ${p.color}` : 'none',
              }}>
              <div style={{
                width: 14, height: 14, borderRadius: '50%',
                background: p.color, border: '1.5px solid white',
                boxShadow: `0 0 6px ${p.color}`,
              }} />
              <div className="text-xs">
                <p className="font-black" style={{ color: p.isTurn ? 'white' : C.text }}>{p.name}</p>
                <p style={{ color: C.textMuted, fontSize: 10 }}>خانة {pos}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 flex-wrap justify-center">
        <Die value={displayDice} size={64} rolling={rolling} />

        {myTurn && !rolling && animPhase === 'idle' && (
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => emit('snakes_roll')}
            className="rounded-2xl px-8 py-4 font-black text-lg flex items-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${C.green}60, ${C.green}25)`,
              border: `2px solid ${C.green}`,
              color: 'white',
              boxShadow: `0 0 30px -5px ${C.green}`,
            }}>
            🎲 اقلب الزهر
          </motion.button>
        )}

        {rolling && (
          <div className="rounded-2xl px-6 py-3 font-black text-sm"
            style={{ background: `${C.amber}25`, border: `1.5px solid ${C.amber}`, color: C.amber }}>
            {animPhase === 'spinning' ? '🎲 جاري اللف...' : '⏳ جاري التحضير...'}
          </div>
        )}

        {!myTurn && phase === 'playing' && !rolling && (
          <div className="rounded-2xl px-6 py-3 font-black text-sm"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1.5px solid ${C.border}`, color: C.textDim }}>
            دور {currentTurnName}...
          </div>
        )}
      </div>

      <AnimatePresence>
        {lastEvent && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="rounded-2xl px-5 py-3 text-center font-black"
            style={{
              background:
                lastEvent.type === 'snake' ? `linear-gradient(135deg, ${C.red}50, ${C.red}20)` :
                lastEvent.type === 'ladder' ? `linear-gradient(135deg, ${C.green}50, ${C.green}20)` :
                lastEvent.type === 'overshoot' ? `linear-gradient(135deg, ${C.amber}50, ${C.amber}20)` :
                `linear-gradient(135deg, ${C.blue}50, ${C.blue}20)`,
              border: `2px solid ${
                lastEvent.type === 'snake' ? C.red :
                lastEvent.type === 'ladder' ? C.green :
                lastEvent.type === 'overshoot' ? C.amber :
                C.blue
              }`,
              color: 'white',
            }}
          >
            {lastEvent.type === 'snake' && (
              <span>🐍 <b>{lastEvent.playerName}</b> نزل من {lastEvent.from} إلى {lastEvent.to}!</span>
            )}
            {lastEvent.type === 'ladder' && (
              <span>🪜 <b>{lastEvent.playerName}</b> طلع من {lastEvent.from} إلى {lastEvent.to}!</span>
            )}
            {lastEvent.type === 'overshoot' && (
              <span>⚠️ <b>{lastEvent.playerName}</b> الرمية أكبر من 100 — محتاج رقم مظبوط!</span>
            )}
            {lastEvent.type === 'roll' && (
              <span>🎲 <b>{lastEvent.playerName}</b> اتحرك من {lastEvent.from} إلى {lastEvent.to}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ============================================================
  // End Popup
  // ============================================================
  const renderEndPopup = () => {
    if (phase !== 'gameEnd') return null;
    const winnerPlayer = players.find(p => p.id === winner);
    const iWon = winner === me?.id;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="fixed inset-0 z-[96] bg-black/85 flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.5, y: 30 }} animate={{ scale: 1, y: 0 }}
          className="rounded-3xl px-8 py-8 text-center max-w-md w-full"
          style={{
            background: 'linear-gradient(145deg, #111122, #0a0a14)',
            border: `3px solid ${iWon ? C.green : C.amber}`,
            boxShadow: `0 0 80px -10px ${iWon ? C.green : C.amber}`,
          }}>
          <motion.div className="text-7xl mb-3"
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            {iWon ? '🏆' : '🎉'}
          </motion.div>
          <h2 className="text-3xl font-black mb-2 text-white">
            {winnerPlayer?.name} وصل 100!
          </h2>
          {iWon && <p className="text-sm mb-4" style={{ color: C.green }}>🎉 مبروك!</p>}

          <div className="mt-4 space-y-1 text-right">
            {[...players].sort((a, b) => (displayPositions[b.id] ?? 0) - (displayPositions[a.id] ?? 0)).map((p, i) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg"
                style={{
                  background: p.id === winner ? `${C.amber}20` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${p.id === winner ? C.amber + '80' : C.border}`,
                }}>
                <div className="flex items-center gap-2">
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: p.color }} />
                  <span className="text-sm font-black">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''} {p.name}
                  </span>
                </div>
                <span style={{ color: 'white' }}>خانة {displayPositions[p.id] ?? 0}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex gap-2">
            <button onClick={onExit}
              className="flex-1 rounded-xl py-3 font-black text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1.5px solid ${C.border}`, color: C.textDim }}>
              خروج
            </button>
            {iAmAdmin && (
              <button onClick={() => emit('snakes_reset')}
                className="flex-1 rounded-xl py-3 font-black text-sm"
                style={{ background: `linear-gradient(135deg, ${C.green}40, ${C.green}15)`, border: `1.5px solid ${C.green}`, color: 'white' }}>
                🔄 العب تاني
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
        style={{
          background: 'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(220,38,38,0.08) 0%, transparent 50%), #050510',
        }} />

      <div className="relative z-30">{renderHUD()}</div>

      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {phase === 'waiting' && <div key="lobby">{renderLobby()}</div>}
          {phase === 'playing' && (
            <div key="playing" className="w-full flex flex-col items-center py-3">
              {renderBoard()}
              {renderControls()}
            </div>
          )}
        </AnimatePresence>
      </div>

      {iAmAdmin && phase === 'playing' && (
        <div className="fixed bottom-3 left-3 z-40">
          <button
            onClick={() => { if (window.confirm('إعادة تعيين؟')) emit('snakes_reset'); }}
            className="text-xs font-bold px-3 py-2 rounded-lg"
            style={{ background: `${C.red}25`, border: `1px solid ${C.red}60`, color: C.red }}>
            🔄 إعادة تعيين
          </button>
        </div>
      )}

      {renderEndPopup()}

      <RulesModal
        open={showRules}
        onClose={() => setShowRules(false)}
        gameId="snakes"
      />

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className="fixed top-4 inset-x-0 z-[100] flex justify-center pointer-events-none">
            <div className="px-5 py-3 rounded-xl font-bold text-sm"
              style={{ background: 'rgba(220, 38, 38, 0.35)', border: '1.5px solid rgba(255, 255, 255, 0.3)' }}>
              ⚠️ {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}