import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

const GridGame = ({ socket, roomCode, playerId }) => {
  const rows = 29;          // 1 header + 28 data rows
  const cols = 9;

  const emptyGrid = Array.from({ length: rows }, () => Array(cols).fill(''));
  const [grid, setGrid] = useState(emptyGrid);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [popupCell, setPopupCell] = useState(null);

  const lastClick = useRef({ time: 0, row: -1, col: -1 });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!socket || !playerId) return;
    socket.emit('grid_game_init', { roomCode, playerId });

    const handleGridState = (state) => {
      if (state && state.grid) {
        setGrid(state.grid);
      }
    };
    socket.on('grid_game_state', handleGridState);
    return () => socket.off('grid_game_state', handleGridState);
  }, [socket, roomCode, playerId]);

  const updateCell = useCallback(
    (row, col, value) => {
      setGrid((prev) => {
        const newGrid = prev.map((r, ri) =>
          ri === row ? r.map((c, ci) => (ci === col ? value : c)) : r
        );
        return newGrid;
      });
      socket.emit('grid_cell_update', { roomCode, playerId, row, col, value });
    },
    [socket, roomCode, playerId]
  );

  const focusNextUsingTabIndex = (currentIdx) => {
    setTimeout(() => {
      let nextIdx = currentIdx + 1;
      const totalCells = rows * cols;
      if (nextIdx > totalCells) nextIdx = 1;

      const nextEl = document.querySelector(`[data-index="grid-${nextIdx}"]`);
      if (nextEl) {
        nextEl.focus();
        nextEl.select();
      }
    }, 30);
  };

  const handleKeyDown = (e, currentIdx) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      focusNextUsingTabIndex(currentIdx);
    }
  };

  const handleCellClick = (e, row, col, value) => {
    if (!value.trim()) return;
    const now = Date.now();
    const prev = lastClick.current;
    if (now - prev.time < 300 && prev.row === row && prev.col === col) {
      setPopupCell({ row, col, value });
      lastClick.current = { time: 0, row: -1, col: -1 };
    } else {
      lastClick.current = { time: now, row, col };
    }
  };

  const closePopup = () => setPopupCell(null);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 rounded-xl p-6 shadow-2xl w-full border border-cyan-500/20">
      <h2 className="text-3xl font-extrabold mb-6 text-center">
        <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
          ⚔️ تحدي الجدول ⚔️
        </span>
      </h2>

      {/* الاعتماد هنا بالكامل على الهيكلة المرنة الفليكس لضمان استجابة كيبورد الجوال */}
      <div className="overflow-auto max-h-[70vh] rounded-xl border border-purple-500/30 shadow-inner shadow-purple-500/10">
        <div className="flex flex-col w-full p-1" style={{ minWidth: '800px' }}>
          
          {/* الهيدر (العناوين) */}
          <div className="flex flex-row-reverse bg-gradient-to-r from-cyan-900/80 via-indigo-900/80 to-purple-900/80 backdrop-blur-sm sticky top-0 z-10 p-2 border-b border-cyan-500/20">
            {Array.from({ length: cols }, (_, colIdx) => {
              const uniqueIdx = colIdx + 1;
              return (
                <div key={colIdx} className="flex-1 px-1">
                  <input
                    id={`cell-0-${colIdx}`}
                    type="text"
                    value={grid[0][colIdx]}
                    onChange={(e) => updateCell(0, colIdx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, uniqueIdx)}
                    onClick={(e) => handleCellClick(e, 0, colIdx, grid[0][colIdx])}
                    data-index={`grid-${uniqueIdx}`}
                    className="w-full bg-transparent text-cyan-300 text-center font-bold outline-none placeholder-cyan-700 px-2 py-1 transition-all duration-200 focus:bg-cyan-900/40 focus:scale-105 rounded"
                    placeholder="اسماء الخانات"
                    dir="rtl"
                  />
                </div>
              );
            })}
          </div>

          {/* صفوف البيانات */}
          {Array.from({ length: rows - 1 }, (_, rowIdx) => {
            const actualRow = rowIdx + 1;
            const isEvenRow = actualRow % 2 === 0;
            return (
              <div
                key={actualRow}
                className={`flex flex-row-reverse p-1 border-b border-purple-500/10 transition-all duration-300 ${
                  isEvenRow
                    ? 'bg-gray-900/60 hover:bg-gray-800/80'
                    : 'bg-indigo-950/40 hover:bg-indigo-900/60'
                }`}
              >
                {Array.from({ length: cols }, (_, colIdx) => {
                  const uniqueIdx = (actualRow * cols) + colIdx + 1;

                  return (
                    <div key={colIdx} className="flex-1 px-1">
                      <input
                        id={`cell-${actualRow}-${colIdx}`}
                        type="text"
                        value={grid[actualRow][colIdx]}
                        onChange={(e) => updateCell(actualRow, colIdx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, uniqueIdx)}
                        onClick={(e) => handleCellClick(e, actualRow, colIdx, grid[actualRow][colIdx])}
                        data-index={`grid-${uniqueIdx}`}
                        className="w-full bg-gray-800/50 text-white text-center outline-none rounded-lg px-2 py-1.5 transition-all duration-200
                                   focus:bg-gradient-to-r focus:from-purple-600/40 focus:to-cyan-600/40 focus:scale-105 focus:shadow-lg focus:shadow-cyan-500/20
                                   hover:bg-gray-700/60 hover:shadow-md hover:shadow-cyan-500/10
                                   border border-transparent focus:border-cyan-400/50"
                        placeholder=""
                        dir="rtl"
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-sm text-cyan-400/70 mt-3 text-center flex items-center justify-center gap-2">
        <span>⌨️ اضغط Enter للانتقال للخلية التالية</span>
        {isMobile && <span className="text-purple-400">• 📱 اسحب أفقياً</span>}
      </p>

      {popupCell && isMobile && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={closePopup}
        >
          <div
            className="bg-gradient-to-br from-gray-900 to-indigo-950 rounded-2xl p-6 max-w-sm w-full text-center relative border border-cyan-400/30 shadow-2xl shadow-cyan-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closePopup} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl transition-colors">
              <FaTimes />
            </button>
            <h3 className="text-xl font-bold text-cyan-300 mb-4">🔍 المحتوى</h3>
            <div className="bg-gray-800/80 p-5 rounded-xl text-white text-3xl font-extrabold break-words border border-purple-500/30 shadow-inner shadow-purple-500/10">
              {popupCell.value}
            </div>
            <button
              onClick={closePopup}
              className="mt-6 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 px-6 py-2.5 rounded-xl font-bold transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/20"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridGame;