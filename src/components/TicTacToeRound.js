// components/TicTacToeRound.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSignOutAlt, FaRedo, FaArrowLeft, FaRobot, FaUsers,
  FaTrophy, FaHandshake, FaCrown, FaCheck
} from 'react-icons/fa';

/* ═══════════════════════════════════════════
   Winner logic
═══════════════════════════════════════════ */
const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];
function checkWinner(board) {
  for (const line of WIN_LINES) {
    const [a,b,c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return { winner: board[a], line };
  }
  if (board.every(c => c)) return { winner: 'draw', line: null };
  return { winner: null, line: null };
}

/* ═══════════════════════════════════════════
   Minimax AI
═══════════════════════════════════════════ */
function minimax(board, depth, isMax, aiSym, humanSym) {
  const { winner } = checkWinner(board);
  if (winner === aiSym) return { score: 10 - depth };
  if (winner === humanSym) return { score: depth - 10 };
  if (winner === 'draw') return { score: 0 };

  if (isMax) {
    let best = { score: -Infinity, index: -1 };
    for (let i = 0; i < 9; i++) {
      if (board[i]) continue;
      board[i] = aiSym;
      const r = minimax(board, depth + 1, false, aiSym, humanSym);
      board[i] = null;
      if (r.score > best.score) best = { score: r.score, index: i };
    }
    return best;
  } else {
    let best = { score: Infinity, index: -1 };
    for (let i = 0; i < 9; i++) {
      if (board[i]) continue;
      board[i] = humanSym;
      const r = minimax(board, depth + 1, true, aiSym, humanSym);
      board[i] = null;
      if (r.score < best.score) best = { score: r.score, index: i };
    }
    return best;
  }
}
function getAIMove(board, aiSym, humanSym, difficulty) {
  const empty = [];
  for (let i = 0; i < 9; i++) if (!board[i]) empty.push(i);
  if (empty.length === 0) return -1;
  if (difficulty === 'easy') return empty[Math.floor(Math.random() * empty.length)];
  if (difficulty === 'medium' && Math.random() < 0.35)
    return empty[Math.floor(Math.random() * empty.length)];
  return minimax([...board], 0, true, aiSym, humanSym).index;
}

/* ═══════════════════════════════════════════
   X & O Marks
═══════════════════════════════════════════ */
function XMark() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible p-3 sm:p-5">
      <motion.line x1="22" y1="22" x2="78" y2="78" stroke="#fbbf24" strokeWidth="10" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.7))' }} />
      <motion.line x1="78" y1="22" x2="22" y2="78" stroke="#fbbf24" strokeWidth="10" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut', delay: 0.18 }}
        style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.7))' }} />
    </svg>
  );
}
function OMark() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible p-3 sm:p-5">
      <motion.circle cx="50" cy="50" r="28" fill="none" stroke="#22d3ee" strokeWidth="10" strokeLinecap="round"
        initial={{ pathLength: 0, rotate: -90 }} animate={{ pathLength: 1, rotate: -90 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ transformOrigin: '50% 50%', filter: 'drop-shadow(0 0 8px rgba(34,211,238,0.7))' }} />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   Cell
═══════════════════════════════════════════ */
function Cell({ value, onClick, disabled, isWinning }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled && !value ? { scale: 1.03 } : {}}
      whileTap={!disabled && !value ? { scale: 0.96 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className="relative aspect-square rounded-2xl overflow-hidden"
      style={{
        background: isWinning
          ? 'linear-gradient(155deg, rgba(251,191,36,0.18), rgba(34,211,238,0.12))'
          : 'linear-gradient(155deg, rgba(30,27,75,0.5), rgba(15,23,42,0.5))',
        border: isWinning
          ? '2px solid rgba(251,191,36,0.6)'
          : '1px solid rgba(251,191,36,0.15)',
        boxShadow: isWinning
          ? '0 0 25px rgba(251,191,36,0.35), inset 0 1px 0 rgba(255,255,255,0.1)'
          : 'inset 0 1px 0 rgba(251,191,36,0.06), 0 4px 12px rgba(0,0,0,0.25)',
        cursor: disabled || value ? 'default' : 'pointer',
      }}
    >
      <AnimatePresence>
        {value === 'X' && <XMark />}
        {value === 'O' && <OMark />}
      </AnimatePresence>
    </motion.button>
  );
}

/* ═══════════════════════════════════════════
   MAIN
═══════════════════════════════════════════ */
export default function TicTacToeRound({
  socket, roomCode, players, playerId, isAdmin, onLeaveRoom
}) {
  const [screen, setScreen] = useState(isAdmin ? 'picker' : 'online-wait'); // picker | ai | online-pick | online | online-wait

  // AI mode
  const [difficulty, setDifficulty] = useState('medium');
  const [aiBoard, setAiBoard] = useState(Array(9).fill(null));
  const [aiTurn, setAiTurn] = useState('X');
  const [aiResult, setAiResult] = useState(null);
  const [aiWinningLine, setAiWinningLine] = useState(null);

  // ✅ نقرأ من localStorage عند البدء
    const [aiScore, setAiScore] = useState(() => {
    try {
        const saved = localStorage.getItem('ticTacToe_ai_score');
        if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { X: 0, O: 0, draw: 0 };
    });

    // ✅ نحفظ أي تغيير
    useEffect(() => {
    try {
        localStorage.setItem('ticTacToe_ai_score', JSON.stringify(aiScore));
    } catch (e) {}
    }, [aiScore]);

  const [aiThinking, setAiThinking] = useState(false);

  // Online mode
  const [onlineState, setOnlineState] = useState(null);

  // Admin picker for online
  const [pickedX, setPickedX] = useState(null);
  const [pickedO, setPickedO] = useState(null);

  // ─── Socket ───
  useEffect(() => {
    if (!socket || !roomCode) return;

    const onState = (state) => {
      setOnlineState({
        board: state.board,
        turn: state.turn,
        winner: state.winner,
        playerX: state.playerX,
        playerO: state.playerO,
        score: state.score || { X: 0, O: 0, draw: 0 },
      });
      setScreen('online');
    };

    const onClosed = () => {
      setOnlineState(null);
      setPickedX(null);
      setPickedO(null);
      setScreen('picker');
    };

    socket.emit('tic_tac_toe_get_state', { roomCode });
    socket.on('tic_tac_toe_state', onState);
    socket.on('game_closed', onClosed);

    return () => {
      socket.off('tic_tac_toe_state', onState);
      socket.off('game_closed', onClosed);
      // ⚠️ لا نُطلق close_game هنا — هذا ما كسر اللعبة
    };
  }, [socket, roomCode]);

  // ✅ حماية: لو وصل اللاعب لشاشة الاختيار بأي طريقة، أعده للانتظار
  useEffect(() => {
    if (!isAdmin && screen === 'picker') {
      setScreen('online-wait');
    }
  }, [isAdmin, screen]);

  // ─── AI effect ───
  useEffect(() => {
    if (screen !== 'ai' || aiTurn !== 'O' || aiResult) return;
    setAiThinking(true);
    const timer = setTimeout(() => {
      setAiBoard(prev => {
        if (!prev.some(c => c === null)) return prev;
        const move = getAIMove(prev, 'O', 'X', difficulty);
        if (move === -1) return prev;
        const next = [...prev];
        next[move] = 'O';
        const { winner, line } = checkWinner(next);
        if (winner) {
          setAiResult(winner);
          setAiWinningLine(line);
          setAiScore(s => ({ ...s, [winner]: s[winner] + 1 }));
        } else {
          setAiTurn('X');
        }
        return next;
      });
      setAiThinking(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [aiTurn, screen, aiResult, difficulty]);

  // ─── AI Handlers ───
  const handleAICell = (i) => {
    if (aiBoard[i] || aiResult || aiTurn === 'O') return;
    const next = [...aiBoard];
    next[i] = 'X';
    setAiBoard(next);
    const { winner, line } = checkWinner(next);
    if (winner) {
      setAiResult(winner);
      setAiWinningLine(line);
      setAiScore(s => ({ ...s, [winner]: s[winner] + 1 }));
    } else {
      setAiTurn('O');
    }
  };
  const newAIRound = () => {
    setAiBoard(Array(9).fill(null));
    setAiTurn('X');
    setAiResult(null);
    setAiWinningLine(null);
  };
  const resetAIScore = () => {
    setAiScore({ X: 0, O: 0, draw: 0 });
    newAIRound();
  };

  // ─── Online Handlers ───
  const handleOnlineCell = (i) => {
    if (!onlineState) return;
    if (onlineState.board[i] || onlineState.winner) return;
    const isMyTurn = (
      (onlineState.turn === 'X' && onlineState.playerX?.id === playerId) ||
      (onlineState.turn === 'O' && onlineState.playerO?.id === playerId)
    );
    if (!isMyTurn) return;
    socket.emit('tic_tac_toe_move', { roomCode, index: i, playerId });
  };
  const startOnlineGame = () => {
    if (!isAdmin || !pickedX || !pickedO) return;
    socket.emit('tic_tac_toe_start', { roomCode, playerX: pickedX, playerO: pickedO });
  };
  const resetOnlineGame = () => {
    if (!isAdmin) return;
    socket.emit('tic_tac_toe_reset', { roomCode });
  };
  const exitOnline = () => {
    socket.emit('close_game', { roomCode });
    setOnlineState(null);
    setPickedX(null);
    setPickedO(null);
    // ✅ الأدمن يرجع للاختيار، واللاعب يرجع للانتظار
    setScreen(isAdmin ? 'picker' : 'online-wait');
  };

  // ─── Derived ───
  const onlinePlayerX = onlineState?.playerX;
  const onlinePlayerO = onlineState?.playerO;
  const myOnlineSymbol = onlinePlayerX?.id === playerId ? 'X' :
                          onlinePlayerO?.id === playerId ? 'O' : null;
  const isMyOnlineTurn = onlineState && !onlineState.winner && (
    (onlineState.turn === 'X' && onlinePlayerX?.id === playerId) ||
    (onlineState.turn === 'O' && onlinePlayerO?.id === playerId)
  );

  // Picker helpers
  const togglePickX = (p) => {
    if (pickedO?.id === p.id) return;
    setPickedX(prev => prev?.id === p.id ? null : p);
  };
  const togglePickO = (p) => {
    if (pickedX?.id === p.id) return;
    setPickedO(prev => prev?.id === p.id ? null : p);
  };

    // ✅ الخروج الصريح — يُطلق close_game عند ضغط زر الخروج فقط
  const handleExit = () => {
    socket.emit('close_game', { roomCode });
    if (onLeaveRoom) onLeaveRoom();
  };

  /* ═══════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════ */
  return (
    <div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1425 35%, #0a1018 70%, #08090f 100%)',
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.1), transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-40 left-0 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.08), transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* ═══ Top bar ═══ */}
      <div
        className="relative z-10 flex items-center justify-between px-4 py-3"
        style={{
          background: 'rgba(10,15,26,0.55)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderBottom: '1px solid rgba(251,191,36,0.12)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.25), rgba(34,211,238,0.2))',
              border: '1px solid rgba(251,191,36,0.3)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >⭕❌</div>
          <div>
            <div className="text-slate-50 text-sm font-bold tracking-wide leading-tight">Tic Tac Toe</div>
            <div className="text-amber-300/50 text-[9px] tracking-[0.25em] uppercase">
              {screen === 'ai' ? 'vs AI' : screen === 'online' || screen === 'online-pick' || screen === 'online-wait' ? `Room ${roomCode}` : 'X O Board'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {screen === 'ai' && (
            <button onClick={resetAIScore}
              className="px-3 h-8 rounded-lg flex items-center gap-1.5 text-amber-200/60 hover:text-amber-100 hover:bg-amber-500/10 text-xs font-semibold transition-all"
              style={{ border: '1px solid rgba(251,191,36,0.2)' }}>
              <FaRedo size={10} /> تصفير
            </button>
          )}
          {screen !== 'picker' && (
            <button
              onClick={() => {
                if (screen === 'ai') { setScreen('picker'); newAIRound(); }
                else exitOnline();
              }}
              className="px-3 h-8 rounded-lg flex items-center gap-1.5 text-amber-200/60 hover:text-amber-100 hover:bg-amber-500/10 text-xs font-semibold transition-all"
              style={{ border: '1px solid rgba(251,191,36,0.2)' }}
            >
              <FaArrowLeft size={10} /> الأطوار
            </button>
          )}
          {onLeaveRoom && (
            <button onClick={handleExit}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-200/60 hover:text-amber-100 hover:bg-amber-500/10 transition-all"
              style={{ border: '1px solid rgba(251,191,36,0.2)' }}>
              <FaSignOutAlt size={11} />
            </button>
          )}
        </div>
      </div>

      {/* ═══ Main ═══ */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto py-4">

        {/* ═══ SCREEN: picker ═══ */}
        {screen === 'picker' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black text-slate-50 mb-1">اختر الطور</h2>
              <p className="text-slate-400 text-sm">ابدأ لعبة سريعة</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <motion.button
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setScreen('ai'); newAIRound(); }}
                className="relative overflow-hidden rounded-2xl p-5 text-right flex items-center gap-4"
                style={{
                  background: 'linear-gradient(155deg, rgba(34,211,238,0.15), rgba(6,182,212,0.08))',
                  border: '1px solid rgba(34,211,238,0.35)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 30px rgba(34,211,238,0.1)',
                }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.4), rgba(6,182,212,0.2))', border: '1px solid rgba(34,211,238,0.4)' }}>
                  <FaRobot className="text-2xl text-cyan-100" />
                </div>
                <div className="flex-1">
                  <div className="text-slate-50 font-black text-lg">ضد الكمبيوتر</div>
                  <div className="text-cyan-200/60 text-xs mt-0.5">العب لوحدك — 3 مستويات صعوبة</div>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setScreen(isAdmin ? 'online-pick' : 'online-wait'); setPickedX(null); setPickedO(null); }}
                className="relative overflow-hidden rounded-2xl p-5 text-right flex items-center gap-4"
                style={{
                  background: 'linear-gradient(155deg, rgba(251,191,36,0.15), rgba(217,119,6,0.08))',
                  border: '1px solid rgba(251,191,36,0.35)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 30px rgba(251,191,36,0.1)',
                }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.4), rgba(217,119,6,0.2))', border: '1px solid rgba(251,191,36,0.4)' }}>
                  <FaUsers className="text-2xl text-amber-100" />
                </div>
                <div className="flex-1">
                  <div className="text-slate-50 font-black text-lg">ضد لاعب آخر</div>
                  <div className="text-amber-200/60 text-xs mt-0.5">
                    {isAdmin ? 'اختر لاعبين وابدأ' : 'بانتظار الأدمن يبدأ'}
                  </div>
                </div>
              </motion.button>
            </div>

            {isAdmin && (
              <div className="mt-5 p-3 rounded-2xl"
                style={{ background: 'rgba(10,15,26,0.4)', border: '1px solid rgba(251,191,36,0.1)' }}>
                <p className="text-slate-400 text-xs mb-2 text-center">صعوبة الكمبيوتر</p>
                <div className="flex justify-center gap-2">
                  {[
                    { id: 'easy', label: 'سهل' },
                    { id: 'medium', label: 'متوسط' },
                    { id: 'hard', label: 'صعب' },
                  ].map(d => (
                    <button key={d.id} onClick={() => setDifficulty(d.id)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        difficulty === d.id ? 'bg-cyan-500 text-slate-950 shadow-lg scale-105' : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60'
                      }`}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ SCREEN: AI ═══ */}
        {screen === 'ai' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md flex flex-col items-center gap-4">

            {/* Score */}
            <div className="w-full grid grid-cols-3 gap-2">
              <div className={`rounded-2xl p-3 text-center transition-all ${aiTurn === 'X' && !aiResult ? 'scale-[1.03]' : ''}`}
                style={{
                  background: aiTurn === 'X' && !aiResult ? 'linear-gradient(155deg, rgba(251,191,36,0.2), rgba(217,119,6,0.1))' : 'rgba(10,15,26,0.5)',
                  border: `1.5px solid ${aiTurn === 'X' && !aiResult ? 'rgba(251,191,36,0.5)' : 'rgba(251,191,36,0.15)'}`,
                }}>
                <div className="text-amber-300 text-[10px] tracking-widest uppercase mb-0.5">X</div>
                <div className="text-slate-100 text-sm font-bold">أنت</div>
                <div className="text-amber-300 text-lg font-black mt-0.5">{aiScore.X}</div>
              </div>
              <div className="rounded-2xl p-3 text-center"
                style={{ background: 'rgba(10,15,26,0.5)', border: '1.5px solid rgba(148,163,184,0.15)' }}>
                <FaHandshake className="text-slate-500 text-xs mx-auto mb-1" />
                <div className="text-slate-400 text-[10px] tracking-widest uppercase">تعادل</div>
                <div className="text-slate-300 text-lg font-black mt-0.5">{aiScore.draw}</div>
              </div>
              <div className={`rounded-2xl p-3 text-center transition-all ${aiTurn === 'O' && !aiResult ? 'scale-[1.03]' : ''}`}
                style={{
                  background: aiTurn === 'O' && !aiResult ? 'linear-gradient(155deg, rgba(34,211,238,0.2), rgba(6,182,212,0.1))' : 'rgba(10,15,26,0.5)',
                  border: `1.5px solid ${aiTurn === 'O' && !aiResult ? 'rgba(34,211,238,0.5)' : 'rgba(34,211,238,0.15)'}`,
                }}>
                <div className="text-cyan-300 text-[10px] tracking-widest uppercase mb-0.5">O</div>
                <div className="text-slate-100 text-sm font-bold">كمبيوتر</div>
                <div className="text-cyan-300 text-lg font-black mt-0.5">{aiScore.O}</div>
              </div>
            </div>

            {!aiResult && (
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: aiTurn === 'X' ? '#fbbf24' : '#22d3ee' }} />
                <span className="text-slate-300">
                  {aiThinking ? 'الكمبيوتر يفكر...' : aiTurn === 'X' ? 'دورك' : 'دور الكمبيوتر'}
                </span>
              </div>
            )}

            <div className="w-full grid grid-cols-3 gap-2 p-3 rounded-3xl"
              style={{
                background: 'rgba(10,15,26,0.35)',
                border: '1px solid rgba(251,191,36,0.1)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 50px rgba(0,0,0,0.4)',
              }}>
              {aiBoard.map((cell, i) => (
                <Cell key={i} value={cell} isWinning={aiWinningLine?.includes(i)}
                  onClick={() => handleAICell(i)}
                  disabled={!!cell || !!aiResult || aiTurn === 'O'} />
              ))}
            </div>

            <p className="text-slate-500 text-[10px] tracking-widest">
              أنت X · الكمبيوتر O ({difficulty === 'easy' ? 'سهل' : difficulty === 'medium' ? 'متوسط' : 'صعب'})
            </p>
          </motion.div>
        )}

        {/* ═══ SCREEN: online-pick (admin) ═══ */}
        {screen === 'online-pick' && isAdmin && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <div className="text-center mb-5">
              <h2 className="text-2xl font-black text-slate-50 mb-1">اختر لاعبين</h2>
              <p className="text-slate-400 text-xs">X يبدأ أولاً</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(251,191,36,0.1)', border: '1.5px solid rgba(251,191,36,0.4)' }}>
                <div className="text-amber-300 text-[10px] tracking-widest uppercase mb-1">X</div>
                <div className="text-slate-100 text-sm font-bold truncate">
                  {pickedX?.name || '— لم يُختر —'}
                </div>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(34,211,238,0.1)', border: '1.5px solid rgba(34,211,238,0.4)' }}>
                <div className="text-cyan-300 text-[10px] tracking-widest uppercase mb-1">O</div>
                <div className="text-slate-100 text-sm font-bold truncate">
                  {pickedO?.name || '— لم يُختر —'}
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4 max-h-[45vh] overflow-y-auto">
                {players.map(p => {
                const isX = pickedX?.id === p.id;
                const isO = pickedO?.id === p.id;
                return (
                  <div key={p.id}
                    className="rounded-xl p-3 flex items-center gap-2"
                    style={{
                      background: isX ? 'rgba(251,191,36,0.15)' : isO ? 'rgba(34,211,238,0.15)' : 'rgba(10,15,26,0.5)',
                      border: `1px solid ${isX ? 'rgba(251,191,36,0.5)' : isO ? 'rgba(34,211,238,0.5)' : 'rgba(251,191,36,0.1)'}`,
                    }}>
                    <div className="flex-1 text-slate-100 text-sm font-bold truncate">{p.name}</div>
                    <button onClick={() => togglePickX(p)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all ${
                        isX ? 'bg-amber-500 text-slate-950' : 'bg-slate-800/60 text-amber-300/70 hover:bg-amber-500/20'
                      }`}>
                      X
                    </button>
                    <button onClick={() => togglePickO(p)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all ${
                        isO ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800/60 text-cyan-300/70 hover:bg-cyan-500/20'
                      }`}>
                      O
                    </button>
                  </div>
                );
              })}
                {players.length < 2 && (
                <div className="p-4 rounded-xl text-center text-amber-200/60 text-xs"
                    style={{ background: 'rgba(251,191,36,0.06)', border: '1px dashed rgba(251,191,36,0.25)' }}>
                    تحتاج لاعبين اثنين على الأقل
                </div>
                )}
            </div>

            <button
              disabled={!pickedX || !pickedO}
              onClick={startOnlineGame}
              className={`w-full py-3 rounded-2xl font-black text-base tracking-wide transition-all ${
                pickedX && pickedO
                  ? 'text-slate-950 shadow-lg scale-100 hover:scale-[1.02]'
                  : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
              }`}
              style={pickedX && pickedO ? {
                background: 'linear-gradient(155deg, #fbbf24, #d97706)',
                boxShadow: '0 10px 25px rgba(251,191,36,0.35)',
              } : {}}>
              <FaCheck className="inline ml-2" /> ابدأ المباراة
            </button>
          </motion.div>
        )}

        {/* ═══ SCREEN: online-wait (non-admin) ═══ */}
        {screen === 'online-wait' && !isAdmin && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4">⏳</motion.div>
            <h2 className="text-2xl font-black text-slate-50 mb-2">بانتظار الأدمن</h2>
            <p className="text-slate-400 text-sm">سيبدأ مباراة قريبًا...</p>
          </motion.div>
        )}

        {/* ═══ SCREEN: online ═══ */}
        {screen === 'online' && onlineState && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md flex flex-col items-center gap-4">

            {/* ✅ شريط الاسكور */}
            <div className="w-full grid grid-cols-3 gap-2">
            <div className="rounded-2xl p-3 text-center"
                style={{
                background: 'rgba(251,191,36,0.1)',
                border: '1.5px solid rgba(251,191,36,0.3)',
                }}>
                <div className="text-amber-300 text-[10px] tracking-widest uppercase mb-0.5">X فوز</div>
                <div className="text-amber-300 text-lg font-black">{onlineState.score?.X || 0}</div>
            </div>
            <div className="rounded-2xl p-3 text-center"
                style={{
                background: 'rgba(148,163,184,0.08)',
                border: '1.5px solid rgba(148,163,184,0.2)',
                }}>
                <FaHandshake className="text-slate-500 text-xs mx-auto mb-1" />
                <div className="text-slate-400 text-[10px] tracking-widest uppercase">تعادل</div>
                <div className="text-slate-300 text-lg font-black">{onlineState.score?.draw || 0}</div>
            </div>
            <div className="rounded-2xl p-3 text-center"
                style={{
                background: 'rgba(34,211,238,0.1)',
                border: '1.5px solid rgba(34,211,238,0.3)',
                }}>
                <div className="text-cyan-300 text-[10px] tracking-widest uppercase mb-0.5">O فوز</div>
                <div className="text-cyan-300 text-lg font-black">{onlineState.score?.O || 0}</div>
            </div>
            </div>



            {/* Players */}
            <div className="w-full grid grid-cols-2 gap-2">
              <div className="rounded-2xl p-3 text-center transition-all"
                style={{
                  background: onlineState.turn === 'X' && !onlineState.winner
                    ? 'linear-gradient(155deg, rgba(251,191,36,0.2), rgba(217,119,6,0.1))'
                    : 'rgba(10,15,26,0.5)',
                  border: `1.5px solid ${onlineState.turn === 'X' && !onlineState.winner ? 'rgba(251,191,36,0.5)' : 'rgba(251,191,36,0.15)'}`,
                }}>
                <div className="text-amber-300 text-[10px] tracking-widest uppercase mb-0.5">X {myOnlineSymbol === 'X' && '(أنت)'}</div>
                <div className="text-slate-100 text-sm font-bold truncate">{onlinePlayerX?.name || '—'}</div>
              </div>
              <div className="rounded-2xl p-3 text-center transition-all"
                style={{
                  background: onlineState.turn === 'O' && !onlineState.winner
                    ? 'linear-gradient(155deg, rgba(34,211,238,0.2), rgba(6,182,212,0.1))'
                    : 'rgba(10,15,26,0.5)',
                  border: `1.5px solid ${onlineState.turn === 'O' && !onlineState.winner ? 'rgba(34,211,238,0.5)' : 'rgba(34,211,238,0.15)'}`,
                }}>
                <div className="text-cyan-300 text-[10px] tracking-widest uppercase mb-0.5">O {myOnlineSymbol === 'O' && '(أنت)'}</div>
                <div className="text-slate-100 text-sm font-bold truncate">{onlinePlayerO?.name || '—'}</div>
              </div>
            </div>

            {!onlineState.winner && (
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full animate-pulse"
                  style={{ background: onlineState.turn === 'X' ? '#fbbf24' : '#22d3ee' }} />
                <span className="text-slate-300">
                  {myOnlineSymbol
                    ? (isMyOnlineTurn ? '🎯 دورك!' : `دور ${onlineState.turn === 'X' ? onlinePlayerX?.name : onlinePlayerO?.name}`)
                    : `دور ${onlineState.turn === 'X' ? onlinePlayerX?.name : onlinePlayerO?.name}`
                  }
                </span>
              </div>
            )}

            <div className="w-full grid grid-cols-3 gap-2 p-3 rounded-3xl"
              style={{
                background: 'rgba(10,15,26,0.35)',
                border: '1px solid rgba(251,191,36,0.1)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 50px rgba(0,0,0,0.4)',
              }}>
              {onlineState.board.map((cell, i) => (
                <Cell key={i}
                  value={cell}
                  isWinning={checkWinner(onlineState.board).line?.includes(i)}
                  onClick={() => handleOnlineCell(i)}
                  disabled={!!cell || !!onlineState.winner || !isMyOnlineTurn} />
              ))}
            </div>

            <p className="text-slate-500 text-[10px] tracking-widest">
              {myOnlineSymbol ? `أنت ${myOnlineSymbol}` : 'تشاهد المباراة'}
            </p>
          </motion.div>
        )}
      </div>

      {/* ═══ Winner Modal — للـ AI ═══ */}
      <AnimatePresence>
        {screen === 'ai' && aiResult && (
          <WinnerPopup
            winner={aiResult}
            xName="أنت"
            oName="الكمبيوتر"
            onNewRound={newAIRound}
            onBackToModes={() => { setScreen('picker'); newAIRound(); }}
          />
        )}
      </AnimatePresence>

      {/* ═══ Winner Modal — للـ Online ═══ */}
      <AnimatePresence>
        {screen === 'online' && onlineState?.winner && (
          <WinnerPopup
            winner={onlineState.winner}
            xName={onlinePlayerX?.name || 'X'}
            oName={onlinePlayerO?.name || 'O'}
            onNewRound={resetOnlineGame}
            onBackToModes={exitOnline}
            canReset={isAdmin}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Winner Popup
═══════════════════════════════════════════ */
function WinnerPopup({ winner, xName, oName, onNewRound, onBackToModes, canReset = true }) {
  const isDraw = winner === 'draw';
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,8,15,0.85)', backdropFilter: 'blur(12px)' }}
    >
      {/* Confetti */}
      {!isDraw && [...Array(14)].map((_, i) => (
        <motion.div key={i}
          initial={{ y: -40, opacity: 0, x: 0 }}
          animate={{ y: 600, opacity: [0, 1, 0], x: (i - 7) * 22, rotate: 540 }}
          transition={{ duration: 2.2, delay: i * 0.06, repeat: Infinity }}
          className="absolute top-0 left-1/2 w-2 h-2 rounded-sm pointer-events-none"
          style={{ background: ['#fbbf24', '#22d3ee', '#f472b6', '#34d399', '#a78bfa'][i % 5] }} />
      ))}

      <motion.div
        initial={{ scale: 0.7, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative max-w-sm w-full rounded-3xl p-7 text-center overflow-hidden"
        style={{
          background: winner === 'X'
            ? 'linear-gradient(155deg, rgba(251,191,36,0.25), rgba(120,53,15,0.5))'
            : winner === 'O'
              ? 'linear-gradient(155deg, rgba(34,211,238,0.25), rgba(8,145,178,0.4))'
              : 'linear-gradient(155deg, rgba(100,116,139,0.25), rgba(30,41,59,0.5))',
          border: `2px solid ${winner === 'X' ? 'rgba(251,191,36,0.6)' : winner === 'O' ? 'rgba(34,211,238,0.6)' : 'rgba(148,163,184,0.4)'}`,
          boxShadow: winner === 'X' ? '0 0 60px rgba(251,191,36,0.35)'
            : winner === 'O' ? '0 0 60px rgba(34,211,238,0.35)'
            : '0 0 40px rgba(100,116,139,0.25)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 16 }}
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4"
          style={{
            background: winner === 'X' ? 'linear-gradient(135deg, #fbbf24, #d97706)'
              : winner === 'O' ? 'linear-gradient(135deg, #22d3ee, #0891b2)'
              : 'linear-gradient(135deg, #94a3b8, #475569)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.25)',
          }}>
          {isDraw ? <FaHandshake className="text-3xl text-slate-900" /> : <FaTrophy className="text-3xl text-slate-900" />}
        </motion.div>

        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-3xl font-black text-slate-50 mb-2"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
          {winner === 'X' ? '🎉 X فاز!' : winner === 'O' ? '🎉 O فاز!' : '🤝 تعادل!'}
        </motion.h2>

        {!isDraw && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            className="text-slate-200/90 font-bold mb-1">
            {winner === 'X' ? xName : oName}
          </motion.p>
        )}

        <div className="flex flex-col gap-2 mt-5">
          {canReset ? (
            <button onClick={onNewRound}
              className="w-full py-3 rounded-xl font-bold text-slate-950 flex items-center justify-center gap-2"
              style={{
                background: winner === 'X' ? 'linear-gradient(155deg, #fbbf24, #d97706)'
                  : winner === 'O' ? 'linear-gradient(155deg, #22d3ee, #0891b2)'
                  : 'linear-gradient(155deg, #cbd5e1, #94a3b8)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              }}>
              <FaRedo /> جولة جديدة
            </button>
          ) : (
            <p className="text-slate-300/70 text-xs py-2">في انتظار الأدمن لبدء جولة جديدة</p>
          )}
          <button onClick={onBackToModes}
            className="w-full py-2.5 rounded-xl font-bold text-slate-200 hover:text-white transition-all text-sm"
            style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <FaArrowLeft className="inline ml-1" /> الأطوار
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}