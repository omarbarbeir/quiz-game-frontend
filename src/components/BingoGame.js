import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaPen, FaEraser, FaRedo, FaTimes } from 'react-icons/fa';

const BingoGame = ({ socket, roomCode, playerId }) => {
  const size = 5;
  const emptyGrid = Array.from({ length: size }, () => Array(size).fill(''));
  const emptyMarks = Array.from({ length: size }, () => Array(size).fill(false));

  const [grid, setGrid] = useState(emptyGrid);
  const [marks, setMarks] = useState(emptyMarks);
  const [penActive, setPenActive] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Load personal grid + marks from server
  useEffect(() => {
    if (!socket || !playerId) return;
    socket.emit('bingo_init', { roomCode, playerId });

    const handleBingoState = (state) => {
      if (state) {
        if (state.grid) setGrid(state.grid);
        if (state.marks) setMarks(state.marks);
      }
    };
    socket.on('bingo_state', handleBingoState);
    return () => socket.off('bingo_state', handleBingoState);
  }, [socket, roomCode, playerId]);

  // Update cell number
  const updateCell = useCallback(
    (row, col, value) => {
      setGrid((prev) => {
        const newGrid = prev.map((r, ri) =>
          ri === row ? r.map((c, ci) => (ci === col ? value : c)) : r
        );
        return newGrid;
      });
      socket.emit('bingo_cell_update', { roomCode, playerId, row, col, value });
    },
    [socket, roomCode, playerId]
  );

  // Toggle mark on a cell
  const toggleMark = useCallback(
    (row, col) => {
      setMarks((prev) => {
        const newMarks = prev.map((r, ri) =>
          ri === row ? r.map((c, ci) => (ci === col ? !c : c)) : r
        );
        return newMarks;
      });
      socket.emit('bingo_mark_update', {
        roomCode,
        playerId,
        row,
        col,
        marked: !marks[row][col],
      });
    },
    [socket, roomCode, playerId, marks]
  );

  // Reset the entire board for this player
  const resetBoard = () => {
    setGrid(emptyGrid);
    setMarks(emptyMarks);
    socket.emit('bingo_reset', { roomCode, playerId });
  };

  // Handle cell click – if pen active, toggle mark; otherwise editing happens naturally via focus
  const handleCellClick = (row, col) => {
    if (penActive) {
      toggleMark(row, col);
    }
  };

  // RTL focus: move to left cell on Enter
  const focusNext = (row, col) => {
    let nextRow = row;
    let nextCol = col - 1;
    if (nextCol < 0) {
      nextCol = size - 1;
      nextRow -= 1;
      if (nextRow < 0) {
        nextRow = size - 1;
        nextCol = size - 1;
      }
    }
    setTimeout(() => {
      const el = document.getElementById(`bingo-${nextRow}-${nextCol}`);
      if (el) {
        el.focus();
        el.select();
      }
    }, 0);
  };

  const handleKeyDown = (e, row, col) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!penActive) {
        focusNext(row, col);
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 rounded-xl p-6 shadow-2xl w-full border border-cyan-500/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-center flex-1">
          <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
            🎯 بينجو 🎯
          </span>
        </h2>

        <div className="flex gap-2">
          {/* Reset button */}
          <button
            onClick={resetBoard}
            className="p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 font-bold transition-all duration-300 shadow-lg shadow-red-500/20"
          >
            <FaRedo />
            <span className="hidden sm:inline">لعبة جديدة</span>
          </button>

          {/* Pen toggle button */}
          <button
            onClick={() => setPenActive(!penActive)}
            className={`p-3 rounded-xl flex items-center gap-2 font-bold transition-all duration-300 ${
              penActive
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 shadow-lg shadow-yellow-500/20'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {penActive ? <FaEraser /> : <FaPen />}
            <span className="hidden sm:inline">
              {penActive ? 'إلغاء التحديد' : 'قلم التحديد'}
            </span>
          </button>
        </div>
      </div>

      {/* Rules button */}
      <div className="flex justify-end mb-2">
        <button onClick={() => setShowRules(true)} className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
          📜 القواعد
        </button>
      </div>

      {/* Rules modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-cyan-500/30 shadow-2xl relative">
            <button onClick={() => setShowRules(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">
              <FaTimes />
            </button>

            <h2 className="text-3xl font-extrabold text-center mb-6">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                📜 قواعد لعبة البينجو
              </span>
            </h2>

            <div className="space-y-6 text-gray-300 text-right leading-relaxed">
              <div>
                <h3 className="text-xl font-bold text-cyan-400 mb-2">🎯 الهدف</h3>
                <p>• اكتب الأرقام من 1 إلى 25 في الخانات الفارغة.</p>
                <p>• استخدم قلم التحديد (الأيقونة الجانبية) لتحديد الخانة عند استدعاء الرقم.</p>
                <p>• الهدف هو تكوين خط أفقي أو عمودي أو قطري مكتمل التحديد.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-400 mb-2">🖊️ الأدوات</h3>
                <p>• <strong>قلم التحديد:</strong> عند تفعيله، اضغط على أي خانة لتحديدها. تعطيله يسمح بتحرير الأرقام.</p>
                <p>• <strong>لعبة جديدة:</strong> يعيد تعيين كل الخانات لتلعب جولة جديدة.</p>
                <p>• <strong>Enter:</strong> ينتقل للخلية التالية (من اليمين لليسار).</p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-yellow-400 mb-2">📱 للجوال</h3>
                <p>• اسحب أفقياً لرؤية كل الأعمدة.</p>
                <p>• اضغط مرتين سريعتين على أي خانة لرؤية محتواها في نافذة منبثقة.</p>
              </div>
            </div>

            <button onClick={() => setShowRules(false)} className="mt-6 w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-xl font-bold text-lg">
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}

      <div className="overflow-auto max-h-[70vh] rounded-xl border border-purple-500/30 shadow-inner shadow-purple-500/10">
        <table className="w-full border-collapse" style={{ minWidth: '400px' }}>
          <tbody>
            {Array.from({ length: size }, (_, rowIdx) => (
              <tr
                key={rowIdx}
                className="bg-gray-900/60 hover:bg-gray-800/80 transition-all"
              >
                {Array.from({ length: size }, (_, colIdx) => (
                  <td key={colIdx} className="p-1 border border-purple-500/10">
                    <div
                      className={`relative w-full h-16 sm:h-20 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 ${
                        marks[rowIdx][colIdx]
                          ? 'bg-gradient-to-br from-yellow-400/30 to-orange-500/30 border-2 border-yellow-400 shadow-lg shadow-yellow-500/20'
                          : penActive
                            ? 'bg-gray-800/50 hover:bg-gray-700/60 border border-dashed border-gray-600'
                            : 'bg-gray-800/50 border border-transparent hover:bg-gray-700/60'
                      }`}
                      onClick={() => handleCellClick(rowIdx, colIdx)}
                    >
                      {marks[rowIdx][colIdx] && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-yellow-400 opacity-80"></div>
                        </div>
                      )}
                      <input
                        id={`bingo-${rowIdx}-${colIdx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={grid[rowIdx][colIdx]}
                        onChange={(e) =>
                          updateCell(rowIdx, colIdx, e.target.value.replace(/[^0-9]/g, ''))
                        }
                        onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                        onClick={(e) => e.stopPropagation()} // prevent double trigger
                        className={`w-full bg-transparent text-white text-center font-bold outline-none text-lg sm:text-2xl ${
                          marks[rowIdx][colIdx] ? 'text-yellow-300' : ''
                        }`}
                        placeholder=""
                        dir="rtl"
                        disabled={penActive} // when pen is active, disable direct editing
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-cyan-400/70 mt-3 text-center">
        ⌨️ اضغط Enter للانتقال للخلية السابقة{' '}
        {penActive
          ? '• القلم نشط – اضغط على الخلية لتحديدها'
          : '• اكتب الأرقام من 1 إلى 25'}
      </p>
    </div>
  );
};

export default BingoGame;