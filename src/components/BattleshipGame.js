import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaRedo, FaArrowsAltH, FaArrowsAltV, FaBomb, FaTimes } from 'react-icons/fa';

const ships = [
  { id: 'carrier',    name: 'حاملة طائرات', length: 5, color: 'bg-red-600 border-red-400' },
  { id: 'battleship', name: 'سفينة حربية',   length: 4, color: 'bg-green-600 border-green-400' },
  { id: 'cruiser',    name: 'طراد',          length: 3, color: 'bg-orange-500 border-orange-400' },
  { id: 'submarine',  name: 'غواصة',         length: 3, color: 'bg-blue-600 border-blue-400' },
  { id: 'destroyer',  name: 'مدمرة بحرية',    length: 2, color: 'bg-purple-600 border-purple-400' },
];

const BattleshipGame = ({ socket, roomCode, playerId }) => {
  const rows = 11, cols = 11, playRows = 10, playCols = 10;
  const emptyGrid = Array.from({ length: rows }, () => Array(cols).fill(null));
  const [grid, setGrid] = useState(emptyGrid);
  const [placedShips, setPlacedShips] = useState([]);
  const [selectedShip, setSelectedShip] = useState(null);
  const [orientation, setOrientation] = useState('horizontal');
  const [destroyMode, setDestroyMode] = useState(false);

  // Preloaded audio refs – work reliably on mobile
  const waterAudio = useRef(null);
  const explosionAudio = useRef(null);

  useEffect(() => {
    waterAudio.current = new Audio('/sounds/water.mp3');
    explosionAudio.current = new Audio('/sounds/explosion.mp3');
  }, []);

  useEffect(() => {
    if (!socket || !playerId) return;
    socket.emit('battleship_init', { roomCode, playerId });

    const handleState = (state) => {
      if (state) {
        if (state.grid) setGrid(state.grid);
        if (state.placedShips) setPlacedShips(state.placedShips);
      }
    };
    socket.on('battleship_state', handleState);
    return () => socket.off('battleship_state', handleState);
  }, [socket, roomCode, playerId]);

  const resetBoard = () => {
    setGrid(emptyGrid);
    setPlacedShips([]);
    setSelectedShip(null);
    setDestroyMode(false);
    socket.emit('battleship_reset', { roomCode, playerId });
  };

  const toggleDestroyMode = () => {
    setDestroyMode(prev => !prev);
    setSelectedShip(null);
  };

  const playSound = (audioRef) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  const handleCellClick = (row, col) => {
    if (row < 1 || row > playRows || col < 1 || col > playCols) return;
    const cellValue = grid[row][col];

    // ========== DESTROY MODE ==========
    if (destroyMode) {
      if (cellValue === null) {
        // Empty → water sound + white miss
        playSound(waterAudio);
        const newGrid = grid.map(r => [...r]);
        newGrid[row][col] = 'miss';
        setGrid(newGrid);
        socket.emit('battleship_miss', { roomCode, playerId, row, col });
      } else if (cellValue && !cellValue.startsWith('hit-') && cellValue !== 'miss') {
        // Ship → explosion sound + red X overlay
        playSound(explosionAudio);
        const shipId = cellValue;
        const newGrid = grid.map(r => [...r]);
        newGrid[row][col] = `hit-${shipId}`;
        setGrid(newGrid);
        socket.emit('battleship_destroy', { roomCode, playerId, row, col, shipId });
      }
      return;
    }

    // ========== PLACEMENT MODE ==========
    if (cellValue && !cellValue.startsWith('hit-') && cellValue !== 'miss') {
      removeShip(cellValue);
      return;
    }

    if (selectedShip) {
      const ship = ships.find(s => s.id === selectedShip);
      if (!ship) return;

      const positions = [];
      for (let i = 0; i < ship.length; i++) {
        const r = orientation === 'horizontal' ? row : row + i;
        const c = orientation === 'horizontal' ? col + i : col;
        if (r < 1 || r > playRows || c < 1 || c > playCols) return;
        if (grid[r][c] !== null) return;
        positions.push({ r, c });
      }

      if (placedShips.some(s => s.shipId === ship.id)) return;

      const newGrid = grid.map(r => [...r]);
      positions.forEach(({ r, c }) => { newGrid[r][c] = ship.id; });
      setGrid(newGrid);
      const newPlaced = [...placedShips, { shipId: ship.id, positions }];
      setPlacedShips(newPlaced);
      socket.emit('battleship_place', { roomCode, playerId, shipId: ship.id, positions });
      setSelectedShip(null);
    }
  };

  const removeShip = (shipId) => {
    const shipData = placedShips.find(s => s.shipId === shipId);
    if (!shipData) return;
    const newGrid = grid.map(r => [...r]);
    shipData.positions.forEach(({ r, c }) => {
      if (!newGrid[r][c]?.startsWith?.('hit-') && newGrid[r][c] !== 'miss') {
        newGrid[r][c] = null;
      }
    });
    setGrid(newGrid);
    const newPlaced = placedShips.filter(s => s.shipId !== shipId);
    setPlacedShips(newPlaced);
    socket.emit('battleship_remove', { roomCode, playerId, shipId });
  };

  const toggleOrientation = () => setOrientation(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');

  return (
    <div className="bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 rounded-xl p-6 shadow-2xl w-full border border-cyan-500/20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-extrabold text-center flex-1">
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent drop-shadow-lg">
            🚢 حرب السفن 🚢
          </span>
        </h2>
        <div className="flex gap-2">
          <button onClick={resetBoard} className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-bold"><FaRedo /> إعادة</button>
          <button onClick={toggleDestroyMode} className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-bold ${destroyMode ? 'bg-gray-900 text-red-400 border border-red-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
            {destroyMode ? <FaTimes /> : <FaBomb />} {destroyMode ? 'إلغاء التدمير' : 'تدمير'}
          </button>
        </div>
      </div>

      {!destroyMode && (
        <div className="flex flex-wrap gap-2 mb-3 justify-center">
          {ships.map(ship => (
            <button key={ship.id} onClick={() => setSelectedShip(prev => prev === ship.id ? null : ship.id)}
              disabled={placedShips.some(s => s.shipId === ship.id)}
              className={`px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 ${
                placedShips.some(s => s.shipId === ship.id) ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : selectedShip === ship.id ? `${ship.color} text-white scale-105` : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}>
              <span className={`w-3 h-3 rounded-full ${ship.color.split(' ')[0]}`}></span>
              {ship.name} ({ship.length})
            </button>
          ))}
          <button onClick={toggleOrientation} className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-cyan-300 font-bold text-xs flex items-center gap-1">
            {orientation === 'horizontal' ? <FaArrowsAltH /> : <FaArrowsAltV />} {orientation === 'horizontal' ? 'أفقي' : 'عمودي'}
          </button>
        </div>
      )}

      <div className="overflow-auto rounded-xl border border-purple-500/30 shadow-inner shadow-purple-500/10">
        <table className="w-full border-collapse" style={{ minWidth: '400px' }}>
          <thead>
            <tr>
              <th className="bg-gray-800 p-1 border border-purple-500/20 text-center text-gray-400 text-xs w-6"></th>
              {Array.from({ length: playCols }, (_, i) => (
                <th key={i} className="bg-gray-800 p-1 border border-purple-500/20 text-center text-cyan-300 font-bold text-xs">{String.fromCharCode(65 + i)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: playRows }, (_, rowIdx) => {
              const r = rowIdx + 1;
              return (
                <tr key={r}>
                  <td className="bg-gray-800 p-1 border border-purple-500/20 text-center text-cyan-300 font-bold text-xs w-6">{r}</td>
                  {Array.from({ length: playCols }, (_, colIdx) => {
                    const c = colIdx + 1;
                    const cellValue = grid[r][c];
                    const isHit = cellValue?.startsWith?.('hit-');
                    const isMiss = cellValue === 'miss';
                    const hitShipId = isHit ? cellValue.replace('hit-', '') : null;
                    const shipObj = !isHit && !isMiss && cellValue ? ships.find(s => s.id === cellValue) : null;
                    const originalShip = hitShipId ? ships.find(s => s.id === hitShipId) : null;

                    return (
                      <td key={c} onClick={() => handleCellClick(r, c)}
                        className={`h-8 w-8 sm:h-10 sm:w-10 border border-purple-500/20 cursor-pointer transition-all duration-150 hover:opacity-80 relative ${
                          isMiss ? 'bg-white' :
                          isHit ? (originalShip ? `${originalShip.color} bg-opacity-80` : 'bg-gray-950') :
                          shipObj ? `${shipObj.color} bg-opacity-80` :
                          'bg-gray-900/70'
                        }`}>
                        {/* Missed empty square: white background, black X */}
                        {isMiss && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-black font-bold text-lg">✕</span>
                          </div>
                        )}
                        {/* Hit ship square: white transparent overlay, red X */}
                        {isHit && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-sm">
                            <span className="text-red-600 font-bold text-lg">✕</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-cyan-400/70 mt-2 text-center">
        {destroyMode ? 'وضع التدمير نشط – اضغط على خلية' : 'اختر سفينة ثم اضغط على الخلية لوضعها. اضغط على سفينة موضوعة لإزالتها.'}
      </p>
    </div>
  );
};

export default BattleshipGame;