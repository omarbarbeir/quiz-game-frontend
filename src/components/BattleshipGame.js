import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaRedo, FaArrowsAltH, FaArrowsAltV, FaBomb, FaTimes } from 'react-icons/fa';

import waterSoundFile from '../assets/water.mp3';
import explosionSoundFile from '../assets/explosion.mp3';

// Ship definitions with enhanced glossy colors
const ships = [
  { id: 'carrier',    name: 'حاملة طائرات', length: 5, baseColor: '#ef4444', glowColor: '#f87171' },
  { id: 'battleship', name: 'سفينة حربية',   length: 4, baseColor: '#10b981', glowColor: '#34d399' },
  { id: 'cruiser',    name: 'طراد',          length: 3, baseColor: '#f59e0b', glowColor: '#fbbf24' },
  { id: 'submarine',  name: 'غواصة',         length: 3, baseColor: '#3b82f6', glowColor: '#60a5fa' },
  { id: 'destroyer',  name: 'مدمرة بحرية',    length: 2, baseColor: '#8b5cf6', glowColor: '#a78bfa' },
];

const BattleshipGame = ({ socket, roomCode, playerId }) => {
  const rows = 11, cols = 11, playRows = 10, playCols = 10;
  const emptyGrid = Array.from({ length: rows }, () => Array(cols).fill(null));
  const [grid, setGrid] = useState(emptyGrid);
  const [placedShips, setPlacedShips] = useState([]);
  const [selectedShip, setSelectedShip] = useState(null);
  const [orientation, setOrientation] = useState('horizontal');
  const [destroyMode, setDestroyMode] = useState(false);

  // Load state from server
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

  const handleCellClick = (row, col) => {
    if (row < 1 || row > playRows || col < 1 || col > playCols) return;
    const cellValue = grid[row][col];

    if (destroyMode) {
      if (cellValue === null) {
        const waterSound = new Audio(waterSoundFile);
        waterSound.play().catch(err => console.error('Water play error:', err));
        const newGrid = grid.map(r => [...r]);
        newGrid[row][col] = 'miss';
        setGrid(newGrid);
        socket.emit('battleship_miss', { roomCode, playerId, row, col });
      } else if (cellValue && !cellValue.startsWith('hit-') && cellValue !== 'miss') {
        const explosionSound = new Audio(explosionSoundFile);
        explosionSound.play().catch(err => console.error('Explosion play error:', err));
        const shipId = cellValue;
        const newGrid = grid.map(r => [...r]);
        newGrid[row][col] = `hit-${shipId}`;
        setGrid(newGrid);
        socket.emit('battleship_destroy', { roomCode, playerId, row, col, shipId });
      }
      return;
    }

    // Placement mode
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

  // Helper to get glossy style for a ship (used in button and grid cell)
  const getGlossyStyle = (baseColor, glowColor) => ({
    background: `linear-gradient(135deg, ${baseColor}, ${glowColor})`,
    boxShadow: `0 2px 5px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.4)`,
    border: 'none',
  });

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

      {/* Ship selection buttons – ALWAYS visible (no condition on destroyMode) */}
      <div className="flex flex-wrap gap-2 mb-3 justify-center">
        {ships.map(ship => (
          <button
            key={ship.id}
            onClick={() => setSelectedShip(prev => prev === ship.id ? null : ship.id)}
            disabled={placedShips.some(s => s.shipId === ship.id)}
            className="px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1 transition-all duration-200"
            style={{
              ...getGlossyStyle(ship.baseColor, ship.glowColor),
              opacity: placedShips.some(s => s.shipId === ship.id) ? 0.5 : 1,
              transform: selectedShip === ship.id ? 'scale(1.05)' : 'scale(1)',
              boxShadow: selectedShip === ship.id ? `0 0 0 2px #22d3ee, ${getGlossyStyle(ship.baseColor, ship.glowColor).boxShadow}` : getGlossyStyle(ship.baseColor, ship.glowColor).boxShadow,
              color: 'white',
              textShadow: '0 1px 1px black',
            }}
          >
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ship.baseColor }}></span>
            {ship.name} ({ship.length})
          </button>
        ))}
        <button
          onClick={toggleOrientation}
          className="px-3 py-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-cyan-300 font-bold text-xs flex items-center gap-1 border border-cyan-500/50"
        >
          {orientation === 'horizontal' ? <FaArrowsAltH /> : <FaArrowsAltV />} {orientation === 'horizontal' ? 'أفقي' : 'عمودي'}
        </button>
      </div>

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
                    const shipObj = (!isHit && !isMiss && cellValue) ? ships.find(s => s.id === cellValue) : null;
                    const originalShip = hitShipId ? ships.find(s => s.id === hitShipId) : null;

                    let cellStyle = {};
                    if (isMiss) {
                      cellStyle = { backgroundColor: 'white' };
                    } else if (isHit && originalShip) {
                      cellStyle = { background: `linear-gradient(135deg, ${originalShip.baseColor}, ${originalShip.glowColor})`, opacity: 0.7 };
                    } else if (shipObj) {
                      cellStyle = { background: `linear-gradient(135deg, ${shipObj.baseColor}, ${shipObj.glowColor})`, boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)' };
                    } else {
                      cellStyle = { backgroundColor: '#1f2937' };
                    }

                    return (
                      <td
                        key={c}
                        onClick={() => handleCellClick(r, c)}
                        className="h-8 w-8 sm:h-10 sm:w-10 border border-purple-500/20 cursor-pointer transition-all duration-150 hover:opacity-80 relative"
                        style={cellStyle}
                      >
                        {isMiss && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-black font-bold text-lg">✕</span>
                          </div>
                        )}
                        {isHit && originalShip && (
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