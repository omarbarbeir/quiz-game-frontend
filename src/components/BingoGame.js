import React, { useState, useEffect, useCallback } from 'react';
import { FaPen, FaEraser, FaRedo } from 'react-icons/fa';

const BingoGame = ({ socket, roomCode, playerId }) => {
  const size = 5;
  const emptyGrid = Array.from({ length: size }, () => Array(size).fill(''));
  const emptyMarks = Array.from({ length: size }, () => Array(size).fill(false));

  const [grid, setGrid] = useState(emptyGrid);
  const [marks, setMarks] = useState(emptyMarks);
  const [penActive, setPenActive] = useState(false);
  const [calledNumbers, setCalledNumbers] = useState([]);

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

  const toggleMark = useCallback(
    (row, col) => {
      setMarks((prev) => {
        const newMarks = prev.map((r, ri) =>
          ri === row ? r.map((c, ci) => (ci === col ? !c : c)) : r
        );
        return newMarks;
      });
      socket.emit('bingo_mark_update', { roomCode, playerId, row, col, marked: !marks[row][col] });
    },
    [socket, roomCode, playerId, marks]
  );

  const resetBoard = () => {
    setGrid(emptyGrid);
    setMarks(emptyMarks);
    socket.emit('bingo_reset', { roomCode, playerId });
  };

  useEffect(() => {
    if (!socket) return;
    socket.on('bingo_called_numbers', (numbers) => {
      setCalledNumbers(numbers);
    });
    return () => socket.off('bingo_called_numbers');
  }, [socket]);

  const callNumber = () => {
    socket.emit('bingo_call_number', { roomCode });
  };

  const handleCellClick = (row, col) => {
    if (penActive) {
      toggleMark(row, col);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !penActive) {
      e.preventDefault();
      const inputs = Array.from(document.querySelectorAll('.bingo-input'));
      const currentIdx = inputs.indexOf(e.target);
      if (currentIdx !== -1) {
        const nextInput = inputs[(currentIdx + 1) % inputs.length];
        nextInput.focus();
        nextInput.select();
      }
    }
  };

  return (
    <div dir="rtl" className="bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 rounded-xl p-6 shadow-2xl w-full border border-cyan-500/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-center flex-1">
          <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
            🎯 بينجو 🎯
          </span>
        </h2>

        <div className="flex gap-2">
          <button onClick={resetBoard} className="p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white flex items-center gap-2 font-bold transition-all duration-300 shadow-lg shadow-red-500/20">
            <FaRedo />
            <span className="hidden sm:inline">لعبة جديدة</span>
          </button>

          <button
            onClick={() => setPenActive(!penActive)}
            className={`p-3 rounded-xl flex items-center gap-2 font-bold transition-all duration-300 ${
              penActive
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-gray-900 shadow-lg shadow-yellow-500/20'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {penActive ? <FaEraser /> : <FaPen />}
            <span className="hidden sm:inline">{penActive ? 'إلغاء التحديد' : 'قلم التحديد'}</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="bg-gray-800/70 rounded-xl p-3 text-center flex-1 max-w-md">
          <p className="text-sm text-gray-400 mb-1">آخر رقم تم استدعاؤه</p>
          <p className="text-3xl font-bold text-yellow-400">
            {calledNumbers.length > 0 ? calledNumbers[calledNumbers.length - 1] : '—'}
          </p>
        </div>
        <button
          onClick={callNumber}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-500/20"
        >
          🎲 استدعاء رقم
        </button>
      </div>

      {calledNumbers.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center mb-4">
          {calledNumbers.map((num, idx) => (
            <span key={idx} className="bg-gray-700 text-white text-xs px-2 py-1 rounded-full">{num}</span>
          ))}
        </div>
      )}

      <div className="overflow-auto max-h-[70vh] rounded-xl border border-purple-500/30 shadow-inner shadow-purple-500/10">
        <table className="w-full border-collapse" style={{ minWidth: '400px' }}>
          <tbody>
            {Array.from({ length: size }, (_, rowIdx) => (
              <tr key={rowIdx} className="bg-gray-900/60 hover:bg-gray-800/80 transition-all">
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
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={grid[rowIdx][colIdx]}
                        onChange={(e) => updateCell(rowIdx, colIdx, e.target.value.replace(/[^0-9]/g, ''))}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className={`bingo-input w-full bg-transparent text-white text-center font-bold outline-none text-lg sm:text-2xl ${
                          marks[rowIdx][colIdx] ? 'text-yellow-300' : ''
                        }`}
                        disabled={penActive}
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
        ⌨️ اضغط Enter للانتقال للخلية التالية {penActive ? '• القلم نشط – اضغط على الخلية لتحديدها' : '• اكتب الأرقام من 1 إلى 25'}
      </p>
    </div>
  );
};

export default BingoGame;