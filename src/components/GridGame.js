// components/GridGame.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaSignOutAlt, FaRedo } from 'react-icons/fa';

const ROWS = 29;
const COLS = 10;

export default function GridGame({ socket, roomCode, playerId, onLeaveRoom }) {
  const [grid, setGrid] = useState(() =>
    Array.from({ length: ROWS }, () => Array(COLS).fill(''))
  );

  useEffect(() => {
    if (!socket || !playerId) return;
    socket.emit('grid_game_init', { roomCode, playerId });
    const handleGridState = (state) => {
      if (state?.grid) setGrid(state.grid);
    };
    socket.on('grid_game_state', handleGridState);
    return () => socket.off('grid_game_state', handleGridState);
  }, [socket, roomCode, playerId]);

  const updateCell = useCallback((row, col, value) => {
    setGrid(prev =>
      prev.map((r, ri) =>
        ri === row ? r.map((c, ci) => (ci === col ? value : c)) : r
      )
    );
    socket.emit('grid_cell_update', { roomCode, playerId, row, col, value });
  }, [socket, roomCode, playerId]);

  const handleKeyDown = (e, row, col) => {
    const focusCell = (r, c) => {
      const el = document.querySelector(`[data-cell="${r}-${c}"]`);
      if (el) { el.focus(); el.select(); }
    };
    if (e.key === 'Enter') {
      e.preventDefault();
      let nextCol = col + 1;
      let nextRow = row;
      if (nextCol >= COLS) { nextCol = 0; nextRow = (row + 1) % ROWS; }
      focusCell(nextRow, nextCol);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusCell((row + 1) % ROWS, col);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusCell((row - 1 + ROWS) % ROWS, col);
    } else if (e.key === 'ArrowRight' && e.target.selectionStart === 0) {
      e.preventDefault();
      focusCell(row, (col - 1 + COLS) % COLS);
    } else if (e.key === 'ArrowLeft' && e.target.selectionStart === e.target.value.length) {
      e.preventDefault();
      focusCell(row, (col + 1) % COLS);
    }
  };

  const resetGrid = () => {
    if (!window.confirm('سيتم مسح كل الكتابات. متأكد؟')) return;
    setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill('')));
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        socket.emit('grid_cell_update', { roomCode, playerId, row: r, col: c, value: '' });
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0b1020 0%, #141a35 30%, #1a1440 60%, #0d1228 100%)',
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      }}
    >
      {/* ═══ Ambient glows — هادية وأنيقة ═══ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 w-[650px] h-[650px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18), transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-40 left-0 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.14), transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.06), transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* ═══ Top bar — Liquid Glass داكن ═══ */}
      <div
        className="relative z-10 flex items-center justify-between px-4 py-3"
        style={{
          background: 'linear-gradient(180deg, rgba(30,27,75,0.55), rgba(15,23,42,0.4))',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(139,92,246,0.15)',
          boxShadow: 'inset 0 1px 0 rgba(167,139,250,0.12), 0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.35), rgba(34,211,238,0.25))',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 14px rgba(139,92,246,0.25)',
              border: '1px solid rgba(167,139,250,0.3)',
            }}
          >
            🚌
          </div>
          <div>
            <div className="text-indigo-50 text-sm font-bold tracking-wide leading-tight">أتوبيس كومبليت</div>
            <div className="text-indigo-300/50 text-[9px] tracking-[0.25em] uppercase font-medium">Bus Complete</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-indigo-200/90 text-[11px] tracking-widest font-mono font-semibold"
            style={{
              background: 'rgba(139,92,246,0.15)',
              border: '1px solid rgba(167,139,250,0.25)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {roomCode}
          </div>

          <button
            onClick={resetGrid}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-300/60 hover:text-indigo-100 hover:bg-indigo-500/15 active:scale-95 transition-all"
            style={{ border: '1px solid rgba(139,92,246,0.2)' }}
            title="مسح الجدول"
          >
            <FaRedo size={11} />
          </button>

          {onLeaveRoom && (
            <button
              onClick={onLeaveRoom}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-300/60 hover:text-indigo-100 hover:bg-indigo-500/15 active:scale-95 transition-all"
              style={{ border: '1px solid rgba(139,92,246,0.2)' }}
              title="خروج"
            >
              <FaSignOutAlt size={11} />
            </button>
          )}
        </div>
      </div>

      {/* ═══ Hint bar ═══ */}
      <div
        className="relative z-10 px-4 py-1.5 flex items-center justify-center gap-3 text-indigo-300/50 text-[10px] tracking-widest"
        style={{
          background: 'rgba(15,23,42,0.35)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(139,92,246,0.08)',
        }}
      >
        <span>↵ للشمال</span>
        <span className="text-indigo-500/30">•</span>
        <span>↑↓ تنقّل رأسي</span>
        <span className="text-indigo-500/30">•</span>
        <span>اسحب أفقياً ←→</span>
      </div>

      {/* ═══ Grid ═══ */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <div
          className="absolute inset-0 overflow-auto taboo-scroll p-3 sm:p-4"
          dir="rtl"
        >
          <div
            className="mx-auto rounded-2xl p-3"
            style={{
              minWidth: 800,
              maxWidth: 1080,
              background: 'linear-gradient(180deg, rgba(30,27,75,0.55), rgba(15,23,42,0.5))',
              backdropFilter: 'blur(20px) saturate(160%)',
              WebkitBackdropFilter: 'blur(20px) saturate(160%)',
              border: '1px solid rgba(139,92,246,0.2)',
              boxShadow:
                'inset 0 1px 0 rgba(167,139,250,0.15), 0 20px 60px rgba(0,0,0,0.4), 0 0 60px rgba(139,92,246,0.06)',
            }}
          >
            <table className="w-full border-collapse" dir="rtl">
              {/* Header row */}
              <thead>
                <tr
                  className="sticky top-0 z-20"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(139,92,246,0.3), rgba(99,102,241,0.3), rgba(34,211,238,0.25))',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                  }}
                >
                  {Array.from({ length: COLS }, (_, ci) => (
                    <th
                      key={ci}
                      className="p-1"
                      style={{
                        borderRight: ci === 0 ? 'none' : '1px solid rgba(167,139,250,0.15)',
                      }}
                    >
                      <input
                        type="text"
                        data-cell={`0-${ci}`}
                        value={grid[0][ci]}
                        onChange={(e) => updateCell(0, ci, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, 0, ci)}
                        placeholder="عنوان"
                        spellCheck={false}
                        autoComplete="off"
                        dir="rtl"
                        className="w-full bg-transparent text-indigo-50 text-center font-bold outline-none rounded-lg px-2 py-2 text-sm placeholder-indigo-200/25 transition-all
                          focus:bg-indigo-500/25
                          focus:shadow-[0_0_14px_rgba(139,92,246,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]"
                      />
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {Array.from({ length: ROWS - 1 }, (_, ri) => {
                  const actualRow = ri + 1;
                  const isEven = actualRow % 2 === 0;
                  return (
                    <tr
                      key={actualRow}
                      style={{
                        background: isEven
                          ? 'rgba(30,27,75,0.15)'
                          : 'rgba(15,23,42,0.15)',
                      }}
                    >
                      {Array.from({ length: COLS }, (_, ci) => (
                        <td
                          key={ci}
                          className="p-0.5"
                          style={{
                            borderRight: ci === 0 ? 'none' : '1px solid rgba(139,92,246,0.08)',
                            borderBottom: '1px solid rgba(139,92,246,0.08)',
                          }}
                        >
                          <input
                            type="text"
                            data-cell={`${actualRow}-${ci}`}
                            value={grid[actualRow][ci]}
                            onChange={(e) => updateCell(actualRow, ci, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, actualRow, ci)}
                            spellCheck={false}
                            autoComplete="off"
                            dir="rtl"
                            className="w-full bg-transparent text-slate-100 text-center outline-none rounded-lg px-2 py-2 text-sm transition-all duration-150
                              placeholder-slate-500/40
                              hover:bg-indigo-500/[0.08]
                              focus:bg-gradient-to-r focus:from-indigo-500/20 focus:to-cyan-500/20
                              focus:shadow-[0_0_12px_rgba(34,211,238,0.3),inset_0_1px_0_rgba(255,255,255,0.08)]"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ═══ Footer legend ═══ */}
      <div
        className="relative z-10 px-4 py-1.5 flex items-center justify-center gap-4 text-[10px] text-indigo-300/50 tracking-widest"
        style={{
          background: 'rgba(15,23,42,0.35)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(139,92,246,0.08)',
        }}
      >
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-sm"
            style={{
              background: 'linear-gradient(90deg, rgba(139,92,246,0.7), rgba(34,211,238,0.6))',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)',
              border: '1px solid rgba(167,139,250,0.4)',
            }}
          />
          صف العناوين
        </span>
        <span className="text-indigo-500/30">•</span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-sm"
            style={{
              background: 'rgba(30,27,75,0.7)',
              border: '1px solid rgba(139,92,246,0.25)',
            }}
          />
          خانات اللعب
        </span>
      </div>
    </div>
  );
}