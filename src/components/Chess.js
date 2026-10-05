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

const PIECES = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' },
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// =====================================================
// Chess Board
// =====================================================
const ChessBoard = ({
  board, myColor, legalMoves, selected, onSquareClick, lastMove,
  flipped, size,
}) => {
  if (!board) return null;

  const displayBoard = flipped
    ? board.map(row => [...row].reverse()).reverse()
    : board;

  const rowIdx = (i) => (flipped ? 7 - i : i);
  const colIdx = (j) => (flipped ? 7 - j : j);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(8, ${size}px)`,
        gridTemplateRows: `repeat(8, ${size}px)`,
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0,0,0,0.6), 0 0 0 3px rgba(168,85,247,0.3)',
        background: '#312e81',
      }}
    >
      {displayBoard.map((row, i) =>
        row.map((piece, j) => {
          const r = rowIdx(i);
          const c = colIdx(j);
          const isLight = (r + c) % 2 === 0;
          const isSelected = selected && selected.row === r && selected.col === c;
          const isLegal = legalMoves[`${selected?.row},${selected?.col}`]?.some(
            m => m.row === r && m.col === c
          );
          const isLastFrom = lastMove && lastMove.from.row === r && lastMove.from.col === c;
          const isLastTo = lastMove && lastMove.to.row === r && lastMove.to.col === c;

          let bg = isLight ? '#ebecd0' : '#739552';
          if (isSelected) bg = '#f7ec74';
          else if (isLastFrom || isLastTo) bg = isLight ? '#f5f682' : '#b9ca43';

          return (
            <div
              key={`${r}-${c}`}
              onClick={() => onSquareClick(r, c)}
              style={{
                width: size, height: size, background: bg,
                position: 'relative', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', userSelect: 'none',
              }}
            >
              {isLegal && !piece && (
                <div style={{
                  position: 'absolute', width: size * 0.3, height: size * 0.3,
                  borderRadius: '50%', background: 'rgba(0,0,0,0.25)',
                  pointerEvents: 'none',
                }} />
              )}
              {isLegal && piece && (
                <div style={{
                  position: 'absolute', inset: 0,
                  border: `${Math.max(3, size * 0.08)}px solid rgba(0,0,0,0.25)`,
                  borderRadius: '50%', pointerEvents: 'none',
                }} />
              )}
              {piece && (
                <span style={{
                  fontSize: size * 0.8, lineHeight: 1,
                  color: piece.color === 'w' ? '#ffffff' : '#0f0f0f',
                  textShadow: piece.color === 'w'
                    ? '0 0 2px #000, 0 0 3px #000, 0 2px 3px rgba(0,0,0,0.5)'
                    : '0 0 2px rgba(255,255,255,0.5), 0 2px 3px rgba(0,0,0,0.7)',
                  pointerEvents: 'none', fontWeight: 900,
                }}>
                  {PIECES[piece.color][piece.type]}
                </span>
              )}
              {j === 0 && (
                <span style={{
                  position: 'absolute', top: 1, left: 3,
                  fontSize: Math.max(8, size * 0.16), fontWeight: 900,
                  color: isLight ? '#739552' : '#ebecd0', pointerEvents: 'none',
                }}>{8 - r}</span>
              )}
              {i === 7 && (
                <span style={{
                  position: 'absolute', bottom: 1, right: 3,
                  fontSize: Math.max(8, size * 0.16), fontWeight: 900,
                  color: isLight ? '#739552' : '#ebecd0', pointerEvents: 'none',
                }}>{FILES[c]}</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

// =====================================================
// Main Component
// =====================================================
export default function Chess({
  socket, roomCode, playerId, playerName, isAdmin = false, onExit, players: roomPlayers = [],
}) {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [boardSize, setBoardSize] = useState(60);

  // ✅ الـ join: الأدمن واللاعب بيدخلوا بنفس الـ event، بس بفلاج مختلف
  useEffect(() => {
    if (!socket) return;
    const onState = (s) => {
      setState(s);
      if (s.myColor && s.turn !== s.myColor) setSelected(null);
      if (s.status === 'checkmate' || s.status === 'stalemate' || s.status === 'draw') setSelected(null);
    };
    const onError = ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    };
    socket.on('chess_state', onState);
    socket.on('chess_error', onError);

    socket.emit('chess_join', { roomCode, playerId, playerName, isAdmin });

    return () => {
      socket.off('chess_state', onState);
      socket.off('chess_error', onError);
      socket.emit('chess_leave', { roomCode });
    };
  }, [socket, roomCode, playerId, playerName, isAdmin]);

  // ✅ ترتيب اللاعبين — دلوقتي الأدمن داخل معاهم
  useEffect(() => {
    if (!isAdmin || !socket || !roomCode) return;
    if (!roomPlayers || roomPlayers.length === 0) return;
    const playerIds = roomPlayers.map(p => p.id);
    const t1 = setTimeout(() => socket.emit('chess_set_order', { roomCode, playerIds }), 300);
    const t2 = setTimeout(() => socket.emit('chess_set_order', { roomCode, playerIds }), 1000);
    const t3 = setTimeout(() => socket.emit('chess_set_order', { roomCode, playerIds }), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isAdmin, socket, roomCode, roomPlayers]);

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const horizontalPad = 24;
      const verticalPad = 240;
      const maxByW = (vw - horizontalPad) / 8;
      const maxByH = (vh - verticalPad) / 8;
      const s = Math.min(maxByW, maxByH);
      setBoardSize(Math.max(34, Math.min(s, 78)));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);

  const emit = useCallback((ev, payload) => {
    socket?.emit(ev, { roomCode, ...payload });
  }, [socket, roomCode]);

  const handleSquareClick = useCallback((r, c) => {
    if (!state || state.phase !== 'playing') return;
    if (state.myColor !== state.turn) return;

    const piece = state.board?.[r]?.[c];

    if (selected) {
      const key = `${selected.row},${selected.col}`;
      const moves = state.legalMoves[key] || [];
      const target = moves.find(m => m.row === r && m.col === c);
      if (target) {
        emit('chess_move', {
          fromRow: selected.row, fromCol: selected.col,
          toRow: r, toCol: c,
        });
        setSelected(null);
        return;
      }
      if (piece && piece.color === state.myColor) {
        setSelected({ row: r, col: c });
        return;
      }
      setSelected(null);
      return;
    }

    if (piece && piece.color === state.myColor) {
      setSelected({ row: r, col: c });
    }
  }, [state, selected, emit]);

  if (!state) {
    return (
      <div dir="rtl" className="relative min-h-screen bg-[#050510] text-white flex items-center justify-center">
        <motion.div className="w-16 h-16 rounded-full"
          style={{ border: '3px solid transparent', borderTopColor: C.purple, borderRightColor: C.amber }}
          animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
      </div>
    );
  }

  const {
    phase, isAdmin: iAmAdmin, board, turn, status, winner, myColor,
    legalMoves, lastMove, players, moveHistory, pendingPromotion, whiteId, blackId,
  } = state;

  const flipped = myColor === 'b';
  const isMyTurn = myColor === turn && status !== 'checkmate' && status !== 'stalemate' && status !== 'draw';

  const whitePlayer = players.find(p => p.id === whiteId);
  const blackPlayer = players.find(p => p.id === blackId);

  // HUD
  const renderHUD = () => (
    <div className="relative z-30 w-full max-w-5xl mx-auto px-3 sm:px-4 pt-3">
      <div className="rounded-2xl px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap"
        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(0,0,0,0.2))', backdropFilter: 'blur(16px)', border: `1.5px solid ${C.border}` }}>
        <div className="flex items-center gap-2">
          <button onClick={onExit} className="text-slate-400 hover:text-white text-xs flex items-center gap-1">
            <span>←</span><span>خروج</span>
          </button>
          <motion.button
            onClick={() => setShowRules(true)}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="rounded-xl px-3 py-1.5 text-xs font-black flex items-center gap-1.5"
            style={{ background: `linear-gradient(135deg, ${C.blue}40, ${C.blue}15)`, border: `2px solid ${C.blue}`, color: 'white' }}>
            <span>📜</span><span className="hidden sm:inline">القواعد</span>
          </motion.button>
          <span className="rounded-xl px-3 py-1.5 text-xs font-black"
            style={{ background: `linear-gradient(135deg, ${C.amber}40, ${C.amber}15)`, border: `2px solid ${C.amber}`, color: 'white' }}>
            ♟️ شطرنج
          </span>
          {iAmAdmin && (
            <span className="rounded-xl px-2 py-1 text-[10px] font-black"
              style={{ background: `${C.purple}25`, border: `1px solid ${C.purple}`, color: C.purple }}>
              👑 أدمن
            </span>
          )}
        </div>

        {phase === 'playing' && (
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-[8px] uppercase tracking-widest" style={{ color: C.textMuted }}>الدور</p>
              <p className="text-sm font-black" style={{ color: C.amber }}>
                {turn === 'w' ? '♔ أبيض' : '♚ أسود'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[8px] uppercase tracking-widest" style={{ color: C.textMuted }}>الحالة</p>
              <p className="text-sm font-black" style={{
                color: status === 'check' ? C.amber
                     : status === 'checkmate' ? C.red
                     : status === 'stalemate' || status === 'draw' ? C.blue
                     : C.green
              }}>
                {status === 'check' ? '⚠️ كش'
                  : status === 'checkmate' ? '🏁 كش مات'
                  : status === 'stalemate' ? '🤝 تعادل'
                  : status === 'draw' ? '🤝 تعادل'
                  : '▶️ شغّال'}
              </p>
            </div>
          </div>
        )}

        <div className="text-xs font-mono hidden sm:block" style={{ color: C.textMuted }}>{roomCode}</div>
      </div>
    </div>
  );

  const renderLobby = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="text-center py-6">
        <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}
          className="text-6xl mb-3">♟️</motion.div>
        <h2 className="text-4xl sm:text-5xl font-black mb-2">
          <span style={{ background: 'linear-gradient(135deg, #fbbf24, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            شطرنج
          </span>
        </h2>
        <p className="text-sm" style={{ color: C.textDim }}>2 لاعبين — الأبيض يبدأ</p>
      </div>

      <div className="mt-4 rounded-2xl p-4"
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
              {p.isAdmin && <span>👑</span>}
              <span>{p.name}</span>
              {p.isMe && <span className="text-[10px]">(أنت)</span>}
            </div>
          ))}
        </div>
      </div>

      {iAmAdmin && (
        <div className="mt-4 rounded-2xl p-4"
          style={{ background: 'linear-gradient(145deg, rgba(168,85,247,0.08), rgba(0,0,0,0.2))', border: `1.5px solid ${C.purple}40` }}>
          <h3 className="text-sm font-black mb-3 flex items-center gap-2" style={{ color: C.purple }}>
            <span>🎩</span><span>لوحة الأدمن</span>
          </h3>
          <motion.button
            disabled={state.players.length < 2}
            onClick={() => setShowStartModal(true)}
            whileHover={state.players.length >= 2 ? { scale: 1.02 } : {}}
            whileTap={state.players.length >= 2 ? { scale: 0.98 } : {}}
            className="w-full rounded-xl py-4 font-black text-base flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${C.green}30, ${C.green}15)`, border: `1.5px solid ${C.green}60`, color: C.green }}>
            <span className="text-2xl">🎬</span>
            <span>ابدأ اللعبة</span>
          </motion.button>
          {state.players.length < 2 && (
            <p className="text-xs text-center mt-2" style={{ color: C.textMuted }}>محتاج لاعبين على الأقل</p>
          )}
        </div>
      )}

      {!iAmAdmin && (
        <p className="text-center text-sm mt-6" style={{ color: C.textMuted }}>في انتظار المُيسّر...</p>
      )}
    </motion.div>
  );

  const renderPlayerBar = (p, colorLabel, isCurrentTurn) => {
    if (!p) return null;
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{
          background: isCurrentTurn
            ? `linear-gradient(135deg, ${colorLabel === 'w' ? C.blue : C.purple}30, transparent)`
            : 'rgba(255,255,255,0.03)',
          border: `1.5px solid ${isCurrentTurn ? (colorLabel === 'w' ? C.blue : C.purple) : C.border}`,
          minWidth: 140,
        }}>
        <span style={{ fontSize: 22, color: colorLabel === 'w' ? '#fff' : '#0f0f0f', textShadow: colorLabel === 'w' ? '0 0 2px #000' : '0 0 2px #fff' }}>
          {colorLabel === 'w' ? '♔' : '♚'}
        </span>
        <span className="text-sm font-black truncate">{p.name}</span>
        {p.isMe && <span className="text-[10px] px-1 rounded" style={{ background: C.purple, color: 'white' }}>أنت</span>}
      </div>
    );
  };

  const renderBoardView = () => {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="w-full flex flex-col items-center px-2 py-3">
        <div className="w-full max-w-md flex justify-center mb-2">
          {renderPlayerBar(
            myColor === 'w' ? blackPlayer : whitePlayer,
            myColor === 'w' ? 'b' : 'w',
            turn === (myColor === 'w' ? 'b' : 'w')
          )}
        </div>

        <ChessBoard
          board={board} myColor={myColor} legalMoves={legalMoves}
          selected={selected} onSquareClick={handleSquareClick}
          lastMove={lastMove} flipped={flipped} size={boardSize}
        />

        <div className="w-full max-w-md flex justify-center mt-2">
          {renderPlayerBar(
            myColor === 'w' ? whitePlayer : blackPlayer,
            myColor || 'w',
            turn === (myColor || 'w')
          )}
        </div>

        {phase === 'playing' && (
          <div className="mt-3 text-center">
            {status === 'check' && isMyTurn && (
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1, repeat: Infinity }}
                className="px-4 py-2 rounded-xl inline-block font-black"
                style={{ background: `${C.amber}25`, border: `1.5px solid ${C.amber}`, color: C.amber }}>
                ⚠️ كش! لازم تحمي ملكك
              </motion.div>
            )}
            {isMyTurn && status === 'playing' && (
              <div className="px-4 py-2 rounded-xl inline-block font-black text-sm"
                style={{ background: `${C.green}20`, border: `1.5px solid ${C.green}60`, color: C.green }}>
                🎯 دورك
              </div>
            )}
          </div>
        )}

        {iAmAdmin && (
          <div className="mt-3">
            <button
              onClick={() => { if (window.confirm('إعادة تعيين اللعبة؟')) emit('chess_reset'); }}
              className="text-xs font-bold px-4 py-2 rounded-xl"
              style={{ background: `${C.red}15`, border: `1px solid ${C.red}40`, color: C.red }}>
              🔄 إعادة تعيين
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div dir="rtl" className="relative min-h-screen text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 20% 20%, rgba(168,85,247,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(251,191,36,0.08) 0%, transparent 50%), #050510',
        }} />

      <div className="relative z-30">{renderHUD()}</div>

      <div className="relative z-10 w-full">
        <AnimatePresence mode="wait">
          {phase === 'waiting' && <div key="lobby">{renderLobby()}</div>}
          {phase === 'playing' && <div key="playing">{renderBoardView()}</div>}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showStartModal && (
          <StartModal
            players={state.players}
            onClose={() => setShowStartModal(false)}
            onStart={(w, b) => {
              emit('chess_start', { whiteId: w, blackId: b });
              setShowStartModal(false);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingPromotion && (
          <PromotionPopup onSelect={(p) => emit('chess_promote', { promotion: p })} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(status === 'checkmate' || status === 'stalemate' || status === 'draw') && (
          <EndPopup
            status={status} winner={winner} players={players}
            myColor={myColor} onExit={onExit}
            isAdmin={iAmAdmin} onReset={() => emit('chess_reset')}
          />
        )}
      </AnimatePresence>

      <RulesModal open={showRules} onClose={() => setShowRules(false)} gameId="chess" />

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className="fixed top-4 inset-x-0 z-[100] flex justify-center pointer-events-none">
            <div className="px-5 py-3 rounded-xl font-bold text-sm"
              style={{
                background: 'rgba(220, 38, 38, 0.35)',
                backdropFilter: 'blur(20px)',
                border: '1.5px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
              }}>
              ⚠️ {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Start Modal
const StartModal = ({ players, onClose, onStart }) => {
  const [whiteId, setWhiteId] = useState(players[0]?.id || null);
  const [blackId, setBlackId] = useState(players[1]?.id || null);

  useEffect(() => {
    if (whiteId && blackId && whiteId === blackId) {
      const other = players.find(p => p.id !== whiteId);
      if (other) setBlackId(other.id);
    }
  }, [whiteId, blackId, players]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[95] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl p-5"
        style={{ background: 'linear-gradient(145deg, #111122, #0a0a14)', border: `2px solid ${C.purple}60` }}>
        <h3 className="text-xl font-black mb-4 text-center" style={{ color: C.purple }}>ابدأ اللعبة</h3>

        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-widest mb-2 font-black" style={{ color: C.textMuted }}>
            اللاعب الأبيض (يبدأ)
          </p>
          <div className="space-y-1">
            {players.map(p => (
              <button key={p.id} onClick={() => setWhiteId(p.id)}
                className="w-full rounded-xl p-2 text-right flex items-center justify-between text-sm"
                style={{
                  background: whiteId === p.id ? `${C.blue}30` : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${whiteId === p.id ? C.blue : C.border}`,
                }}>
                <span className="font-black flex items-center gap-1">
                  {p.isAdmin && <span>👑</span>}
                  {p.name}
                  {p.isMe && <span className="text-[10px] opacity-70">(أنت)</span>}
                </span>
                {whiteId === p.id && <span style={{ color: C.blue }}>♔</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-widest mb-2 font-black" style={{ color: C.textMuted }}>
            اللاعب الأسود
          </p>
          <div className="space-y-1">
            {players.filter(p => p.id !== whiteId).map(p => (
              <button key={p.id} onClick={() => setBlackId(p.id)}
                className="w-full rounded-xl p-2 text-right flex items-center justify-between text-sm"
                style={{
                  background: blackId === p.id ? `${C.purple}30` : 'rgba(255,255,255,0.04)',
                  border: `1.5px solid ${blackId === p.id ? C.purple : C.border}`,
                }}>
                <span className="font-black flex items-center gap-1">
                  {p.isAdmin && <span>👑</span>}
                  {p.name}
                  {p.isMe && <span className="text-[10px] opacity-70">(أنت)</span>}
                </span>
                {blackId === p.id && <span style={{ color: C.purple }}>♚</span>}
              </button>
            ))}
          </div>
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
  );
};

// Promotion Popup
const PromotionPopup = ({ onSelect }) => {
  const pieces = [
    { id: 'q', label: '♕', name: 'ملكة' },
    { id: 'r', label: '♖', name: 'قلعة' },
    { id: 'b', label: '♗', name: 'فيل' },
    { id: 'n', label: '♘', name: 'حصان' },
  ];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-[96] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }}
        className="rounded-3xl p-6 max-w-sm w-full text-center"
        style={{ background: 'linear-gradient(145deg, #111122, #0a0a14)', border: `2px solid ${C.amber}80`, boxShadow: `0 0 60px -10px ${C.amber}` }}>
        <h3 className="text-xl font-black mb-4" style={{ color: C.amber }}>ترقية البيدق!</h3>
        <p className="text-xs mb-4" style={{ color: C.textMuted }}>اختار القطعة الجديدة</p>
        <div className="grid grid-cols-2 gap-3">
          {pieces.map(p => (
            <button key={p.id} onClick={() => onSelect(p.id)}
              className="rounded-2xl py-4 flex flex-col items-center gap-1"
              style={{ background: 'rgba(255,255,255,0.05)', border: `2px solid ${C.amber}60` }}>
              <span style={{ fontSize: 42, color: 'white', textShadow: '0 0 3px #000' }}>{p.label}</span>
              <span className="text-xs font-black">{p.name}</span>
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// End Popup
const EndPopup = ({ status, winner, players, myColor, onExit, isAdmin, onReset }) => {
  const winnerPlayer = players.find(p => p.color === winner);
  const winnerName = winnerPlayer?.name || (winner === 'w' ? 'الأبيض' : 'الأسود');
  const iWon = myColor === winner;

  const getInfo = () => {
    if (status === 'checkmate') return { title: '🏁 كش مات!', subtitle: `${winnerName} كسب`, color: C.amber };
    if (status === 'stalemate') return { title: '🤝 تعادل', subtitle: 'مافيش حركات متاحة', color: C.blue };
    if (status === 'draw') return { title: '🤝 تعادل', subtitle: 'القطع غير كافية', color: C.blue };
    return { title: 'خلصت', subtitle: '', color: C.text };
  };
  const info = getInfo();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-[97] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.5, y: 30 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring' }}
        className="rounded-3xl px-8 py-8 text-center max-w-md w-full"
        style={{ background: 'linear-gradient(145deg, #111122, #0a0a14)', border: `3px solid ${info.color}`, boxShadow: `0 0 80px -10px ${info.color}` }}>
        <motion.div className="text-7xl mb-3"
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          {status === 'checkmate' ? '👑' : '🤝'}
        </motion.div>
        <h2 className="text-3xl font-black mb-1" style={{ color: info.color }}>{info.title}</h2>
        <p className="text-lg text-white mb-6">{info.subtitle}</p>
        {iWon && <p className="text-sm mb-4" style={{ color: C.green }}>🎉 مبروك!</p>}

        <div className="flex gap-2">
          <button onClick={onExit}
            className="flex-1 rounded-xl py-3 font-black text-sm"
            style={{ background: 'rgba(255,255,255,0.05)', border: `1.5px solid ${C.border}`, color: C.textDim }}>
            خروج
          </button>
          {isAdmin && (
            <button onClick={onReset}
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