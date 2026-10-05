// components/BingoRound.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPen, FaEraser, FaRedo, FaSignOutAlt, FaListOl,
  FaTimes, FaDice, FaCheck
} from 'react-icons/fa';

const SIZE = 5;
const LETTERS = ['B', 'I', 'N', 'G', 'O'];

const emptyGrid = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(''));
const emptyMarks = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(false));

/* Cross overlay */
function CrossLine({ delay = 0, color = '#fbbf24', strokeWidth = 6 }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
    >
      <motion.line
        x1="18" y1="18" x2="82" y2="82"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
      <motion.line
        x1="82" y1="18" x2="18" y2="82"
        stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, delay: delay + 0.18, ease: 'easeOut' }}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   MAIN
═══════════════════════════════════════════ */
export default function BingoRound({ socket, roomCode, playerId, isAdmin, onLeaveRoom }) {
  const [grid, setGrid] = useState(emptyGrid);
  const [marks, setMarks] = useState(emptyMarks);
  const [penActive, setPenActive] = useState(false);
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [showNumbers, setShowNumbers] = useState(false);

  // ─── Socket sync ───
  useEffect(() => {
    if (!socket || !playerId) return;
    socket.emit('bingo_init', { roomCode, playerId });

    const handleBingoState = (state) => {
      if (!state) return;
      if (state.grid) setGrid(state.grid);
      if (state.marks) setMarks(state.marks);
    };
    const handleCalled = (numbers) => setCalledNumbers(numbers || []);

    // ✅ عند خروج الأدمن — اخرج من اللعبة وارجع لشاشة الأزرار
    const handleAdminLeft = () => {
      if (onLeaveRoom) onLeaveRoom();
    };

    socket.on('bingo_state', handleBingoState);
    socket.on('bingo_called_numbers', handleCalled);
    socket.on('bingo_admin_left', handleAdminLeft);
    return () => {
      socket.off('bingo_state', handleBingoState);
      socket.off('bingo_called_numbers', handleCalled);
      socket.off('bingo_admin_left', handleAdminLeft);
    };
  }, [socket, roomCode, playerId, onLeaveRoom]);

  // ─── Cell update ───
  const updateCell = useCallback((row, col, value) => {
    setGrid(prev =>
      prev.map((r, ri) =>
        ri === row ? r.map((c, ci) => (ci === col ? value : c)) : r
      )
    );
    socket.emit('bingo_cell_update', { roomCode, playerId, row, col, value });
  }, [socket, roomCode, playerId]);

  // ─── Toggle mark ───
  const toggleMark = useCallback((row, col) => {
    const newValue = !marks[row][col];
    setMarks(prev =>
      prev.map((r, ri) =>
        ri === row ? r.map((c, ci) => (ci === col ? newValue : c)) : r
      )
    );
    socket.emit('bingo_mark_update', { roomCode, playerId, row, col, marked: newValue });
  }, [socket, roomCode, playerId, marks]);

  const resetBoard = () => {
    if (!window.confirm('سيتم مسح اللوحة بالكامل. متأكد؟')) return;
    setGrid(emptyGrid());
    setMarks(emptyMarks());
    socket.emit('bingo_reset', { roomCode, playerId });
  };

  const callNumber = () => {
    socket.emit('bingo_call_number', { roomCode });
  };


  const handleExit = () => {
    socket.emit('bingo_cleanup', { roomCode, playerId });
    if (onLeaveRoom) onLeaveRoom();
  };

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter' || penActive) return;
    e.preventDefault();
    const inputs = Array.from(document.querySelectorAll('.bingo-input'));
    const idx = inputs.indexOf(e.target);
    if (idx !== -1) {
      const next = inputs[(idx + 1) % inputs.length];
      next.focus();
      next.select();
    }
  };

  // ─── Completed lines ───
  const completedLines = useMemo(() => {
    const lines = [];
    for (let r = 0; r < SIZE; r++) {
      if (marks[r].every(Boolean)) lines.push({ type: 'row', index: r });
    }
    for (let c = 0; c < SIZE; c++) {
      if (marks.every(row => row[c])) lines.push({ type: 'col', index: c });
    }
    if ([0,1,2,3,4].every(i => marks[i][i])) lines.push({ type: 'diag', index: 0 });
    if ([0,1,2,3,4].every(i => marks[i][4 - i])) lines.push({ type: 'diag', index: 1 });
    return lines;
  }, [marks]);

  const crossedLetters = Math.min(completedLines.length, LETTERS.length);
  const hasBingo = crossedLetters >= LETTERS.length;

  const winningCells = useMemo(() => {
    const set = new Set();
    completedLines.forEach(line => {
      if (line.type === 'row') for (let c = 0; c < SIZE; c++) set.add(`${line.index}-${c}`);
      if (line.type === 'col') for (let r = 0; r < SIZE; r++) set.add(`${r}-${line.index}`);
      if (line.type === 'diag') {
        if (line.index === 0) for (let i = 0; i < SIZE; i++) set.add(`${i}-${i}`);
        else for (let i = 0; i < SIZE; i++) set.add(`${i}-${SIZE - 1 - i}`);
      }
    });
    return set;
  }, [completedLines]);

  // ✅ الأرقام اللي اللاعب كتبها بنفسه (للمودال الشخصي)
  const myEnteredNumbers = useMemo(() => {
    const set = new Set();
    grid.forEach(row => row.forEach(cell => {
      const n = parseInt(cell, 10);
      if (!isNaN(n) && n >= 1 && n <= 25) set.add(n);
    }));
    return set;
  }, [grid]);

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
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.1), transparent 70%)', filter: 'blur(80px)' }} />
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
          >🎯</div>
          <div>
            <div className="text-slate-50 text-sm font-bold tracking-wide leading-tight">بينجو</div>
            <div className="text-amber-300/50 text-[9px] tracking-[0.25em] uppercase">Bingo 5×5</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowNumbers(true)}
            className="px-3 h-8 rounded-lg flex items-center gap-1.5 text-amber-200/70 hover:text-amber-100 hover:bg-amber-500/10 text-xs font-semibold transition-all"
            style={{ border: '1px solid rgba(251,191,36,0.2)' }}
            title="أرقامي — لمعرفة ما كتبته"
          >
            <FaListOl size={11} />
            <span className="hidden sm:inline">أرقامي</span>
          </button>

          <button
            onClick={resetBoard}
            className="px-3 h-8 rounded-lg flex items-center gap-1.5 text-rose-300/70 hover:text-rose-200 hover:bg-rose-500/10 text-xs font-semibold transition-all"
            style={{ border: '1px solid rgba(244,63,94,0.2)' }}
            title="لعبة جديدة"
          >
            <FaRedo size={10} />
            <span className="hidden sm:inline">جديد</span>
          </button>

          {onLeaveRoom && (
            <button
              onClick={handleExit}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-200/60 hover:text-amber-100 hover:bg-amber-500/10 transition-all"
              style={{ border: '1px solid rgba(251,191,36,0.2)' }}
              title="خروج"
            >
              <FaSignOutAlt size={11} />
            </button>
          )}
        </div>
      </div>

      {/* ═══ Main scroll ═══ */}
      <div className="relative z-10 flex-1 overflow-y-auto taboo-scroll px-3 sm:px-4 py-4">
        <div className="mx-auto w-full max-w-3xl flex flex-col gap-4">

          {/* ═══ BINGO Letters Tracker ═══ */}
          <div
            className="rounded-3xl p-4"
            style={{
              background: 'linear-gradient(155deg, rgba(30,27,75,0.55), rgba(15,23,42,0.5))',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: `1px solid ${hasBingo ? 'rgba(251,191,36,0.6)' : 'rgba(139,92,246,0.2)'}`,
              boxShadow: hasBingo
                ? '0 0 40px rgba(251,191,36,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                : 'inset 0 1px 0 rgba(167,139,250,0.1), 0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            <div className="text-center mb-3">
              <p className="text-slate-400 text-[10px] tracking-[0.3em] uppercase">
                {hasBingo ? '🎉 BINGO! 🎉' : `أكمل ${LETTERS.length - crossedLetters} خطوط للفوز`}
              </p>
            </div>
            <div className="flex justify-center gap-2">
              {LETTERS.map((letter, i) => {
                const isCrossed = i < crossedLetters;
                return (
                  <motion.div
                    key={i}
                    initial={false}
                    animate={isCrossed ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.35 }}
                    className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center overflow-hidden"
                    style={{
                      background: isCrossed
                        ? 'linear-gradient(155deg, rgba(251,191,36,0.25), rgba(217,119,6,0.15))'
                        : 'rgba(30,27,75,0.5)',
                      border: `2px solid ${isCrossed ? 'rgba(251,191,36,0.7)' : 'rgba(139,92,246,0.25)'}`,
                      boxShadow: isCrossed
                        ? '0 0 20px rgba(251,191,36,0.4), inset 0 1px 0 rgba(255,255,255,0.15)'
                        : 'inset 0 1px 0 rgba(167,139,250,0.08)',
                    }}
                  >
                    <span
                      className="text-2xl sm:text-3xl font-black relative z-0"
                      style={{
                        color: isCrossed ? 'rgba(251,191,36,0.35)' : '#e2e8f0',
                        textShadow: isCrossed ? 'none' : '0 0 12px rgba(139,92,246,0.4)',
                        transition: 'color 0.3s, text-shadow 0.3s',
                      }}
                    >
                      {letter}
                    </span>
                    <AnimatePresence>
                      {isCrossed && <CrossLine color="#fbbf24" strokeWidth={5} />}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ═══ Called Number + Call button ═══ */}
          <div className="flex items-center gap-3">
            <div
              className="flex-1 rounded-2xl p-4 flex items-center justify-between"
              style={{
                background: 'linear-gradient(155deg, rgba(30,27,75,0.55), rgba(15,23,42,0.5))',
                backdropFilter: 'blur(20px) saturate(160%)',
                WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                border: '1px solid rgba(34,211,238,0.25)',
                boxShadow: 'inset 0 1px 0 rgba(34,211,238,0.1), 0 8px 25px rgba(0,0,0,0.3)',
              }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-slate-400 text-[10px] tracking-widest uppercase mb-0.5">آخر رقم</p>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={calledNumbers[calledNumbers.length - 1] || 'none'}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="text-4xl font-black text-center"
                    style={{
                      color: '#22d3ee',
                      textShadow: '0 0 20px rgba(34,211,238,0.6)',
                    }}
                  >
                    {calledNumbers[calledNumbers.length - 1] ?? '—'}
                  </motion.p>
                </AnimatePresence>
              </div>
              <FaDice className="text-3xl text-cyan-400/30 shrink-0" />
            </div>

            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={callNumber}
              disabled={calledNumbers.length >= 25}
              className={`px-5 sm:px-7 py-4 rounded-2xl font-black text-sm sm:text-base text-slate-950 flex items-center gap-2 shrink-0 ${
                calledNumbers.length >= 25 ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              style={{
                background: 'linear-gradient(155deg, #fbbf24, #d97706)',
                boxShadow: '0 10px 30px rgba(251,191,36,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
              }}
            >
              <FaDice /> استدعاء
            </motion.button>
          </div>

          {/* ✅ شريط الأرقام المستدعاة — كلها ظاهرة */}
          <div
            className="rounded-2xl p-3"
            style={{
              background: 'linear-gradient(155deg, rgba(30,27,75,0.55), rgba(15,23,42,0.5))',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid rgba(34,211,238,0.2)',
              boxShadow: 'inset 0 1px 0 rgba(34,211,238,0.08), 0 8px 25px rgba(0,0,0,0.3)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-[10px] tracking-widest uppercase">
                الأرقام المستدعاة ({calledNumbers.length}/25)
              </p>
              {calledNumbers.length > 0 && (
                <span className="text-cyan-300/50 text-[10px] tracking-widest">بترتيب الاستدعاء</span>
              )}
            </div>

            {calledNumbers.length === 0 ? (
              <p className="text-center text-slate-500 text-xs py-2">
                لسه ما فيش أرقام مستدعاة
              </p>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
                {calledNumbers.map((num, i) => (
                  <motion.div
                    key={num}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20, delay: i * 0.02 }}
                    className="aspect-square rounded-lg flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(155deg, rgba(34,211,238,0.2), rgba(6,182,212,0.1))',
                      border: '1.5px solid rgba(34,211,238,0.5)',
                      boxShadow: '0 0 8px rgba(34,211,238,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
                    }}
                  >
                    <span className="font-black text-cyan-100 text-sm">
                      {num}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* ═══ Bingo Board ═══ */}
          <div
            className="rounded-3xl p-3 sm:p-4"
            style={{
              background: 'linear-gradient(155deg, rgba(30,27,75,0.55), rgba(15,23,42,0.5))',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid rgba(139,92,246,0.2)',
              boxShadow: 'inset 0 1px 0 rgba(167,139,250,0.1), 0 20px 50px rgba(0,0,0,0.4)',
            }}
          >
            {/* Header letters */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-2">
              {LETTERS.map((l, i) => (
                <div
                  key={i}
                  className="text-center py-1.5 rounded-xl text-xs sm:text-sm font-black tracking-widest"
                  style={{
                    background: 'linear-gradient(155deg, rgba(139,92,246,0.25), rgba(34,211,238,0.15))',
                    border: '1px solid rgba(167,139,250,0.3)',
                    color: '#e2e8f0',
                    textShadow: '0 0 8px rgba(139,92,246,0.4)',
                  }}
                >
                  {l}
                </div>
              ))}
            </div>

            {/* 5x5 cells */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {Array.from({ length: SIZE }, (_, r) =>
                Array.from({ length: SIZE }, (_, c) => {
                  const isMarked = marks[r][c];
                  const isWinning = winningCells.has(`${r}-${c}`);
                  return (
                    <motion.div
                      key={`${r}-${c}`}
                      onClick={() => penActive && toggleMark(r, c)}
                      whileHover={penActive ? { scale: 1.03 } : {}}
                      whileTap={penActive ? { scale: 0.96 } : {}}
                      className="relative aspect-square rounded-2xl flex items-center justify-center overflow-hidden"
                      style={{
                        background: isWinning
                          ? 'linear-gradient(155deg, rgba(251,191,36,0.25), rgba(217,119,6,0.15))'
                          : isMarked
                            ? 'linear-gradient(155deg, rgba(251,191,36,0.15), rgba(217,119,6,0.08))'
                            : penActive
                              ? 'rgba(30,27,75,0.5)'
                              : 'rgba(15,23,42,0.5)',
                        border: isWinning
                          ? '2px solid rgba(251,191,36,0.7)'
                          : isMarked
                            ? '1.5px solid rgba(251,191,36,0.5)'
                            : penActive
                              ? '1.5px dashed rgba(167,139,250,0.4)'
                              : '1px solid rgba(139,92,246,0.15)',
                        boxShadow: isWinning
                          ? '0 0 20px rgba(251,191,36,0.35)'
                          : isMarked
                            ? '0 0 10px rgba(251,191,36,0.15), inset 0 1px 0 rgba(255,255,255,0.08)'
                            : 'inset 0 1px 0 rgba(167,139,250,0.05)',
                        cursor: penActive ? 'pointer' : 'default',
                      }}
                    >
                      {/* ✅ input بعرض كامل + محاذاة مركزية */}
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={grid[r][c]}
                        onChange={(e) => updateCell(r, c, e.target.value.replace(/[^0-9]/g, ''))}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        disabled={penActive}
                        className="bingo-input absolute inset-0 w-full h-full bg-transparent text-center font-black outline-none"
                        style={{
                          fontSize: 'clamp(20px, 4vw, 30px)',
                          color: isMarked ? '#fbbf24' : '#e2e8f0',
                          textShadow: isMarked ? '0 0 12px rgba(251,191,36,0.5)' : '0 0 10px rgba(139,92,246,0.3)',
                          caretColor: '#22d3ee',
                          lineHeight: '1',
                          padding: 0,
                          transition: 'color 0.25s, text-shadow 0.25s',
                          // ✅ عند تفعيل القلم: لا يستقبل input أي نقرة، فيصل النقر للأب
                          pointerEvents: penActive ? 'none' : 'auto',
                        }}
                      />
                      <AnimatePresence>
                        {isMarked && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0, rotate: -90 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="absolute inset-0 pointer-events-none flex items-center justify-center"
                          >
                            <div
                              className="w-3/4 h-3/4 rounded-full"
                              style={{
                                border: '3px solid rgba(251,191,36,0.55)',
                                boxShadow: '0 0 20px rgba(251,191,36,0.4), inset 0 0 15px rgba(251,191,36,0.15)',
                              }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setPenActive(!penActive)}
              className={`flex-1 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                penActive ? 'text-slate-950' : 'text-slate-200'
              }`}
              style={penActive ? {
                background: 'linear-gradient(155deg, #fbbf24, #d97706)',
                boxShadow: '0 10px 25px rgba(251,191,36,0.35)',
                border: '1.5px solid rgba(251,191,36,0.6)',
              } : {
                background: 'rgba(30,27,75,0.5)',
                border: '1.5px solid rgba(139,92,246,0.2)',
              }}
            >
              {penActive ? <FaEraser /> : <FaPen />}
              {penActive ? 'قلم التحديد نشط — اضغط على الخانات' : 'تفعيل قلم التحديد'}
            </motion.button>
          </div>

          <p className="text-center text-slate-500 text-[10px] tracking-widest">
            {penActive ? 'اضغط على الخانة لوضع علامة ✓' : 'اكتب الأرقام 1 → 25 · ↵ للتنقل'}
          </p>
        </div>
      </div>

      {/* ═══ Numbers Modal — مساعد شخصي ═══ */}
      <AnimatePresence>
        {showNumbers && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(5,8,15,0.85)', backdropFilter: 'blur(12px)' }}
            onClick={() => setShowNumbers(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl p-6"
              style={{
                background: 'linear-gradient(155deg, rgba(30,27,75,0.85), rgba(15,23,42,0.9))',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                border: '1.5px solid rgba(251,191,36,0.35)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <FaListOl className="text-amber-300 text-lg" />
                  <div>
                    <h3 className="text-slate-50 text-base font-bold leading-tight">أرقامي</h3>
                    <p className="text-amber-200/50 text-[10px] tracking-widest uppercase">
                      كتبت {myEnteredNumbers.size} من 25
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNumbers(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300/60 hover:text-slate-100 hover:bg-white/5 transition-all"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 25 }, (_, i) => i + 1).map(num => {
                  const isEntered = myEnteredNumbers.has(num);
                  return (
                    <motion.div
                      key={num}
                      initial={false}
                      animate={isEntered ? { scale: [1, 1.08, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className="aspect-square rounded-xl flex items-center justify-center relative overflow-hidden"
                      style={{
                        background: isEntered
                          ? 'linear-gradient(155deg, rgba(251,191,36,0.25), rgba(217,119,6,0.15))'
                          : 'rgba(15,23,42,0.5)',
                        border: isEntered
                          ? '1.5px solid rgba(251,191,36,0.6)'
                          : '1px solid rgba(139,92,246,0.15)',
                        boxShadow: isEntered
                          ? '0 0 15px rgba(251,191,36,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                          : 'inset 0 1px 0 rgba(167,139,250,0.05)',
                      }}
                    >
                      <span
                        className="font-black text-lg relative z-10"
                        style={{
                          color: isEntered ? '#fcd34d' : 'rgba(148,163,184,0.4)',
                          textShadow: isEntered ? '0 0 10px rgba(251,191,36,0.6)' : 'none',
                        }}
                      >
                        {num}
                      </span>
                      {isEntered && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(251,191,36,0.9)' }}
                        >
                          <FaCheck className="text-slate-950 text-[8px]" />
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <p className="text-center text-slate-500 text-[10px] tracking-widest mt-4">
                ذهبي = رقم كتبته في اللوحة
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ BINGO Win Popup ═══ */}
      <AnimatePresence>
        {hasBingo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: 'rgba(5,8,15,0.9)', backdropFilter: 'blur(14px)' }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: -40, opacity: 0, x: 0 }}
                animate={{ y: 700, opacity: [0, 1, 0], x: (i - 10) * 22, rotate: 720 }}
                transition={{ duration: 2.5, delay: i * 0.06, repeat: Infinity }}
                className="absolute top-0 left-1/2 w-2.5 h-2.5 rounded-sm pointer-events-none"
                style={{ background: ['#fbbf24', '#22d3ee', '#f472b6', '#34d399', '#a78bfa'][i % 5] }}
              />
            ))}

            <motion.div
              initial={{ scale: 0.6, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
              className="relative max-w-sm w-full rounded-3xl p-8 text-center overflow-hidden"
              style={{
                background: 'linear-gradient(155deg, rgba(251,191,36,0.35), rgba(120,53,15,0.6))',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '2px solid rgba(251,191,36,0.7)',
                boxShadow: '0 0 80px rgba(251,191,36,0.5)',
              }}
            >
              <motion.div
                animate={{ rotate: [0, -12, 12, -12, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-7xl mb-4"
              >
                🏆
              </motion.div>

              <h2 className="text-4xl font-black text-slate-50 mb-2"
                style={{ textShadow: '0 4px 30px rgba(251,191,36,0.6)' }}>
                BINGO!
              </h2>
              <p className="text-slate-100/90 font-bold mb-6">
                أكملت كل الحروف الخمسة! 🎉
              </p>

              <div className="flex justify-center gap-2 mb-6">
                {LETTERS.map((l, i) => (
                  <div key={i}
                    className="w-10 h-10 rounded-lg flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: 'rgba(251,191,36,0.3)',
                      border: '2px solid rgba(251,191,36,0.8)',
                    }}>
                    <span className="text-amber-100 font-black text-lg relative z-0">{l}</span>
                    <CrossLine color="#fff7ed" strokeWidth={5} />
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setMarks(emptyMarks());
                  setGrid(emptyGrid());
                  socket.emit('bingo_reset', { roomCode, playerId });
                }}
                className="w-full py-3 rounded-xl font-bold text-slate-950 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(155deg, #fbbf24, #d97706)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                }}
              >
                <FaRedo /> جولة جديدة
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}