// components/BattleshipRound.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRedo, FaArrowsAltH, FaArrowsAltV, FaBomb, FaSignOutAlt,
  FaShip, FaCheck, FaTimes, FaTrophy, FaArrowLeft, FaUsers
} from 'react-icons/fa';

import waterSoundFile from '../assets/water.mp3';
import explosionSoundFile from '../assets/explosion.mp3';

const PLAY_ROWS = 10, PLAY_COLS = 10;

const SHIPS = [
  { id: 'carrier',    name: 'حاملة طائرات', length: 5, hull: '#7f1d1d', deck: '#dc2626', detail: '#fca5a5', dark: '#450a0a' },
  { id: 'battleship', name: 'سفينة حربية',  length: 4, hull: '#064e3b', deck: '#059669', detail: '#6ee7b7', dark: '#022c22' },
  { id: 'cruiser',    name: 'طراد',         length: 3, hull: '#78350f', deck: '#d97706', detail: '#fcd34d', dark: '#451a03' },
  { id: 'submarine',  name: 'غواصة',        length: 3, hull: '#1e3a8a', deck: '#2563eb', detail: '#93c5fd', dark: '#0c1e4a' },
  { id: 'destroyer',  name: 'مدمرة بحرية',   length: 2, hull: '#4c1d95', deck: '#7c3aed', detail: '#c4b5fd', dark: '#2e1065' },
];

const COL_LABELS = ['A','B','C','D','E','F','G','H','I','J'];

/* ═══════════════════════════════════════════
   Detect ship part position for rendering
═══════════════════════════════════════════ */
function getShipCellsFromGrid(grid, shipId) {
  const cells = [];
  for (let r = 1; r <= PLAY_ROWS; r++) {
    for (let c = 1; c <= PLAY_COLS; c++) {
      const v = grid[r]?.[c];
      const id = v?.startsWith?.('hit-') || v?.startsWith?.('sunk-')
        ? v.replace(/^(hit|sunk)-/, '')
        : v;
      if (id === shipId) cells.push({ r, c });
    }
  }
  return cells;
}

/* ═══════════════════════════════════════════
   Ship SVG
═══════════════════════════════════════════ */
function ShipSVG({ shipId, part, orientation, isHit, isSunk }) {
  const ship = SHIPS.find(s => s.id === shipId);
  if (!ship) return null;
  const isH = orientation === 'h';

  const hullFill = isSunk ? '#18181b' : ship.hull;
  const deckFill = isHit ? '#3f3f46' : isSunk ? '#27272a' : ship.deck;
  const detailFill = isHit || isSunk ? '#52525b' : ship.detail;

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full block">
      <defs>
        <linearGradient id={`g-${shipId}-${part}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={deckFill} />
          <stop offset="55%" stopColor={deckFill} />
          <stop offset="55%" stopColor={hullFill} />
          <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
      </defs>

      {part === 'start' && (
        <>
          <path d="M 0 30 Q 0 20 15 20 L 100 20 L 100 80 L 15 80 Q 0 80 0 70 Z"
            fill={`url(#g-${shipId}-${part})`} stroke={ship.dark} strokeWidth="2" />
          <rect x="18" y="26" width="80" height="6" fill={detailFill} opacity="0.55" />
          <rect x="30" y="34" width="20" height="12" rx="2" fill={ship.dark} />
          <line x1="48" y1="20" x2="48" y2="10" stroke={ship.dark} strokeWidth="2" />
          <circle cx="48" cy="9" r="2" fill={detailFill} />
        </>
      )}

      {part === 'middle' && (
        <>
          <rect x="0" y="20" width="100" height="60" fill={`url(#g-${shipId}-${part})`} stroke={ship.dark} strokeWidth="2" />
          <rect x="0" y="26" width="100" height="6" fill={detailFill} opacity="0.55" />
          <rect x="25" y="42" width="14" height="12" rx="2" fill={ship.dark} />
          {ship.length >= 5 && <rect x="60" y="42" width="14" height="12" rx="2" fill={ship.dark} />}
        </>
      )}

      {part === 'end' && (
        <>
          <path d="M 0 20 L 85 20 Q 100 20 100 32 L 100 68 Q 100 80 85 80 L 0 80 Z"
            fill={`url(#g-${shipId}-${part})`} stroke={ship.dark} strokeWidth="2" />
          <rect x="0" y="26" width="82" height="6" fill={detailFill} opacity="0.55" />
          <line x1="90" y1="20" x2="90" y2="12" stroke={ship.dark} strokeWidth="1.5" />
          <path d="M 90 12 L 100 14 L 90 16 Z" fill="#ef4444" />
        </>
      )}

      {part === 'single' && (
        <>
          <path d="M 5 30 Q 0 30 0 38 L 0 62 Q 0 70 5 70 L 90 70 Q 100 70 100 60 L 100 40 Q 100 30 90 30 Z"
            fill={`url(#g-${shipId}-${part})`} stroke={ship.dark} strokeWidth="2" />
          <rect x="8" y="36" width="82" height="5" fill={detailFill} opacity="0.55" />
          <rect x="38" y="24" width="16" height="10" rx="1" fill={ship.dark} />
        </>
      )}

      {/* shine */}
      <rect x="0" y="0" width="100" height="100" fill="url(#g-shine)" pointerEvents="none" opacity="0.15" />

      {/* hit fire */}
      {isHit && !isSunk && (
        <g>
          <circle cx="50" cy="50" r="14" fill="#450a0a" />
          <circle cx="50" cy="50" r="8" fill="#7f1d1d" />
          <circle cx="50" cy="50" r="4" fill="#dc2626" />
          <path d="M 20 30 L 25 45 L 15 55 L 25 70" stroke="#fbbf24" strokeWidth="1.2" fill="none" opacity="0.5" />
          <path d="M 80 30 L 75 45 L 85 55 L 75 70" stroke="#fbbf24" strokeWidth="1.2" fill="none" opacity="0.5" />
        </g>
      )}

      {/* sunk overlay */}
      {isSunk && (
        <rect x="0" y="20" width="100" height="60" fill="#000" opacity="0.5" />
      )}

      <defs>
        <linearGradient id="g-shine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ═══════════════════════════════════════════
   Cell Renderer
═══════════════════════════════════════════ */
function GridCell({ r, c, grid, shipLookup, onClick, clickable, hideShips, onlyShots }) {
  const value = grid[r]?.[c];

  // Empty / miss
  if (value === null) {
    return (
      <div onClick={clickable ? onClick : undefined}
        className={`aspect-square rounded-[3px] transition-all ${clickable ? 'cursor-crosshair hover:brightness-125' : ''}`}
        style={{
          background: 'linear-gradient(155deg, #1e3a5f, #142a48)',
          border: '1px solid rgba(103,232,249,0.15)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        }} />
    );
  }

  if (value === 'miss') {
    return (
      <div className="aspect-square rounded-[3px] flex items-center justify-center"
        style={{
          background: 'linear-gradient(155deg, #2a4a72, #1a3355)',
          border: '1px solid rgba(103,232,249,0.2)',
          boxShadow: 'inset 0 0 8px rgba(103,232,249,0.15)',
        }}>
        <svg viewBox="0 0 40 40" className="w-2/3 h-2/3">
          <line x1="11" y1="11" x2="29" y2="29" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" />
          <line x1="29" y1="11" x2="11" y2="29" stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // Ship cell
  const isHit = value.startsWith?.('hit-');
  const isSunk = value.startsWith?.('sunk-');
  const shipId = value.replace(/^(hit|sunk)-/, '');

  // إذا enemyGrid و في وضع شفاف (بدون ship) → نعرض fire/sunk marker فقط
  if (hideShips) {
    return (
      <div className="aspect-square rounded-[3px] flex items-center justify-center"
        style={{
          background: isSunk
            ? 'linear-gradient(155deg, #3f3f46, #18181b)'
            : 'linear-gradient(155deg, #7f1d1d, #450a0a)',
          border: `1px solid ${isSunk ? 'rgba(161,161,170,0.4)' : 'rgba(220,38,38,0.5)'}`,
          boxShadow: isSunk ? 'inset 0 0 8px rgba(0,0,0,0.6)' : '0 0 10px rgba(220,38,38,0.4)',
        }}>
        {!isSunk && (
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="w-3 h-3 rounded-full"
            style={{
              background: 'radial-gradient(circle, #fbbf24, #dc2626)',
              boxShadow: '0 0 12px #fbbf24',
            }}
          />
        )}
        {isSunk && <span className="text-[10px] font-bold text-zinc-400">×</span>}
      </div>
    );
  }

  // Find part position
  const cells = shipLookup[shipId] || [];
  let part = 'single', orient = 'h';
  if (cells.length > 1) {
    const first = cells[0], last = cells[cells.length - 1];
    orient = first.r === last.r ? 'h' : 'v';
    if (r === first.r && c === first.c) part = 'start';
    else if (r === last.r && c === last.c) part = 'end';
    else part = 'middle';
  }

  return (
    <div
      onClick={clickable ? onClick : undefined}
      className={`aspect-square overflow-hidden relative ${clickable ? 'cursor-pointer' : ''}`}
      style={{
        borderRadius: part === 'start' && orient === 'h' ? '8px 0 0 8px'
                    : part === 'end' && orient === 'h' ? '0 8px 8px 0'
                    : part === 'start' && orient === 'v' ? '8px 8px 0 0'
                    : part === 'end' && orient === 'v' ? '0 0 8px 8px'
                    : part === 'single' ? '8px'
                    : '1px',
      }}
    >
      <div className="w-full h-full" style={orient === 'h' ? {} : { transform: 'rotate(90deg)' }}>
        <ShipSVG shipId={shipId} part={part} orientation={orient} isHit={isHit} isSunk={isSunk} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN
═══════════════════════════════════════════ */
export default function BattleshipRound({ socket, roomCode, players, playerId, isAdmin, onLeaveRoom }) {
  const [gameState, setGameState] = useState(null);
  const [selectedShip, setSelectedShip] = useState(null);
  const [orientation, setOrientation] = useState('horizontal');
  const [pickedX, setPickedX] = useState(null);
  const [pickedO, setPickedO] = useState(null);
  const [screen, setScreen] = useState('loading'); // loading | pick | wait | game

  const waterAudioRef = useRef(null);
  const explosionAudioRef = useRef(null);

  // Init audio
  useEffect(() => {
    waterAudioRef.current = new Audio(waterSoundFile);
    waterAudioRef.current.volume = 0.4;
    explosionAudioRef.current = new Audio(explosionSoundFile);
    explosionAudioRef.current.volume = 0.5;
  }, []);

  // Socket
  useEffect(() => {
    if (!socket) return;
    socket.emit('battleship_init', { roomCode, playerId });

    const handleState = (data) => {
      setGameState(data);
      setScreen('game');
    };
    const handleSound = ({ type }) => {
      const audio = type === 'water' ? waterAudioRef.current : explosionAudioRef.current;
      if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
    };

    socket.on('battleship_state', handleState);
    socket.on('battleship_sound', handleSound);
    return () => {
      socket.off('battleship_state', handleState);
      socket.off('battleship_sound', handleSound);
    };
  }, [socket, roomCode, playerId]);

  // Decide screen
  useEffect(() => {
    if (gameState) { setScreen('game'); return; }
    if (isAdmin) setScreen('pick');
    else setScreen('wait');
  }, [gameState, isAdmin]);

  const startGame = () => {
    if (!pickedX || !pickedO) return;
    socket.emit('battleship_start', { roomCode, playerX: pickedX, playerO: pickedO });
  };
  const backToPicker = () => {
    socket.emit('battleship_reset', { roomCode });
    setGameState(null);
    setPickedX(null);
    setPickedO(null);
  };

  const handlePlacementClick = (r, c) => {
    if (!gameState || gameState.spectator) return;
    if (gameState.phase !== 'placement' || gameState.ready) return;
    const value = gameState.ownGrid?.[r]?.[c];
    if (value && !value.startsWith?.('hit-')) {
      socket.emit('battleship_remove', { roomCode, playerId, shipId: value });
      return;
    }
    if (!selectedShip) return;
    const ship = SHIPS.find(s => s.id === selectedShip);
    if (!ship) return;
    const positions = [];
    for (let i = 0; i < ship.length; i++) {
      const rr = orientation === 'horizontal' ? r : r + i;
      const cc = orientation === 'horizontal' ? c + i : c;
      if (rr < 1 || rr > PLAY_ROWS || cc < 1 || cc > PLAY_COLS) return;
      if (gameState.ownGrid[rr][cc] !== null) return;
      positions.push({ r: rr, c: cc });
    }
    socket.emit('battleship_place', { roomCode, playerId, shipId: ship.id, positions });
    setSelectedShip(null);
  };

  const handleAttack = (r, c) => {
    if (!gameState || gameState.spectator) return;
    if (gameState.phase !== 'battle' || gameState.winner) return;
    if (gameState.turn !== playerId) return;
    if (gameState.enemyGrid?.[r]?.[c] !== null) return;
    socket.emit('battleship_attack', { roomCode, playerId, row: r, col: c });
  };

  const handleReady = () => socket.emit('battleship_ready', { roomCode, playerId });

  // shipLookup from ownGrid for rendering placement/battle
  const shipLookup = React.useMemo(() => {
    if (!gameState?.ownGrid) return {};
    const map = {};
    SHIPS.forEach(s => { map[s.id] = getShipCellsFromGrid(gameState.ownGrid, s.id); });
    return map;
  }, [gameState?.ownGrid]);

  /* ═══════════════════════════════════════
     RENDER
  ═══════════════════════════════════════ */
  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #050c18 0%, #0a1428 40%, #071020 70%, #050c18 100%)',
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      }}>

      {/* Radar bg */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3"
        style={{
          background: 'rgba(5,12,24,0.7)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderBottom: '1px solid rgba(34,211,238,0.15)',
        }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(37,99,235,0.2))',
              border: '1px solid rgba(34,211,238,0.3)',
            }}>
            <FaShip className="text-cyan-300 text-base" />
          </div>
          <div>
            <div className="text-cyan-50 text-sm font-bold tracking-widest leading-tight">حرب السفن</div>
            <div className="text-cyan-300/40 text-[9px] tracking-[0.3em] uppercase">Battleship</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-cyan-300/80 text-[11px] tracking-widest font-mono"
            style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            {roomCode}
          </div>
          {gameState && !gameState.spectator && isAdmin && (
            <button onClick={backToPicker}
              className="px-3 h-8 rounded-lg flex items-center gap-1.5 text-rose-300/70 hover:text-rose-200 hover:bg-rose-500/10 text-xs font-bold transition-all"
              style={{ border: '1px solid rgba(244,63,94,0.25)' }}>
              <FaRedo size={10} />
              <span className="hidden sm:inline">جديد</span>
            </button>
          )}
          {onLeaveRoom && (
            <button onClick={onLeaveRoom}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-cyan-300/60 hover:text-cyan-100 hover:bg-cyan-500/10 transition-all"
              style={{ border: '1px solid rgba(34,211,238,0.2)' }}>
              <FaSignOutAlt size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Main */}
      <div className="relative z-10 flex-1 overflow-y-auto taboo-scroll px-3 sm:px-4 py-4">
        <div className="mx-auto w-full max-w-5xl flex flex-col gap-4">

          {/* ═══ Screen: Loading ═══ */}
          {screen === 'loading' && (
            <div className="text-center py-20 text-cyan-300/60">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="text-4xl mb-4 inline-block">⚓</motion.div>
              <p className="text-sm tracking-widest">جاري التحميل...</p>
            </div>
          )}

          {/* ═══ Screen: Wait (non-admin) ═══ */}
          {screen === 'wait' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4">⚓</motion.div>
              <h2 className="text-2xl font-black text-cyan-50 mb-2">بانتظار الأدمن</h2>
              <p className="text-cyan-300/60 text-sm">سيختار اللاعبين ويبدأ المعركة...</p>
            </motion.div>
          )}

          {/* ═══ Screen: Pick (admin) ═══ */}
          {screen === 'pick' && isAdmin && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto w-full">
              <div className="text-center mb-5">
                <h2 className="text-2xl font-black text-cyan-50 mb-1">اختر اللاعبين</h2>
                <p className="text-cyan-300/50 text-xs">اللاعب الأول يبدأ الهجوم</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(251,191,36,0.1)', border: '1.5px solid rgba(251,191,36,0.4)' }}>
                  <div className="text-amber-300 text-[10px] tracking-widest uppercase mb-1">يبدأ أولاً</div>
                  <div className="text-cyan-50 text-sm font-bold truncate">{pickedX?.name || '—'}</div>
                </div>
                <div className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(34,211,238,0.1)', border: '1.5px solid rgba(34,211,238,0.4)' }}>
                  <div className="text-cyan-300 text-[10px] tracking-widest uppercase mb-1">يلعب ثانياً</div>
                  <div className="text-cyan-50 text-sm font-bold truncate">{pickedO?.name || '—'}</div>
                </div>
              </div>

              <div className="space-y-2 mb-4 max-h-[45vh] overflow-y-auto">
                {players.map(p => {
                  const isX = pickedX?.id === p.id;
                  const isO = pickedO?.id === p.id;
                  return (
                    <div key={p.id} className="rounded-xl p-3 flex items-center gap-2"
                      style={{
                        background: isX ? 'rgba(251,191,36,0.15)' : isO ? 'rgba(34,211,238,0.15)' : 'rgba(10,15,26,0.5)',
                        border: `1px solid ${isX ? 'rgba(251,191,36,0.5)' : isO ? 'rgba(34,211,238,0.5)' : 'rgba(34,211,238,0.1)'}`,
                      }}>
                      <div className="flex-1 text-cyan-100 text-sm font-bold truncate flex items-center gap-1.5">
                        {p.isAdmin && <span className="text-amber-400 text-xs">👑</span>}
                        {p.name}
                      </div>
                      <button
                        onClick={() => {
                          if (pickedO?.id !== p.id)
                            setPickedX(prev => prev?.id === p.id ? null : p);
                        }}
                        className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all ${
                          isX ? 'bg-amber-500 text-slate-950' : 'bg-slate-800/60 text-amber-300/70 hover:bg-amber-500/20'
                        }`}>
                        الأول
                      </button>
                      <button
                        onClick={() => {
                          if (pickedX?.id !== p.id)
                            setPickedO(prev => prev?.id === p.id ? null : p);
                        }}
                        className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all ${
                          isO ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800/60 text-cyan-300/70 hover:bg-cyan-500/20'
                        }`}>
                        الثاني
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

              <button disabled={!pickedX || !pickedO} onClick={startGame}
                className={`w-full py-3 rounded-2xl font-black text-base tracking-wide transition-all ${
                  pickedX && pickedO ? 'text-slate-950 hover:scale-[1.02]' : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
                }`}
                style={pickedX && pickedO ? {
                  background: 'linear-gradient(155deg, #22d3ee, #0891b2)',
                  boxShadow: '0 10px 30px rgba(34,211,238,0.35)',
                } : {}}>
                <FaCheck className="inline ml-2" /> ابدأ المعركة
              </button>
            </motion.div>
          )}

          {/* ═══ Screen: Game ═══ */}
          {screen === 'game' && gameState && (
            <>
              {gameState.spectator ? (
                <SpectatorView gameState={gameState} />
              ) : (
                <>
                  {/* Turn indicator */}
                  {gameState.phase === 'battle' && !gameState.winner && (
                    <div className="text-center py-2">
                      <p className={`text-base font-bold tracking-widest ${gameState.turn === playerId ? 'text-cyan-300 animate-pulse' : 'text-cyan-300/40'}`}>
                        {gameState.turn === playerId ? '🎯 دورك — اضرب!' : `⏳ دور ${gameState.turn === gameState.playerX.id ? gameState.playerX.name : gameState.playerO.name}`}
                      </p>
                    </div>
                  )}

                  {/* Placement: Ship selector */}
                  {gameState.phase === 'placement' && !gameState.ready && (
                    <div className="rounded-2xl p-3"
                      style={{
                        background: 'linear-gradient(155deg, rgba(15,23,42,0.7), rgba(7,16,32,0.6))',
                        backdropFilter: 'blur(20px) saturate(160%)',
                        border: '1px solid rgba(34,211,238,0.15)',
                      }}>
                      <p className="text-cyan-300/50 text-[10px] tracking-widest uppercase mb-2 text-center">
                        الأسطول — اختر قطعة ثم اضغط على الخلية
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {SHIPS.map(ship => {
                          const isPlaced = gameState.ships?.some(s => s.shipId === ship.id);
                          const isSelected = selectedShip === ship.id;
                          return (
                            <button key={ship.id}
                              onClick={() => !isPlaced && setSelectedShip(prev => prev === ship.id ? null : ship.id)}
                              disabled={isPlaced}
                              className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                                isPlaced ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'
                              }`}
                              style={{
                                background: isSelected ? `linear-gradient(155deg, ${ship.deck}, ${ship.dark})` : `linear-gradient(155deg, ${ship.hull}66, ${ship.dark}55)`,
                                border: `1.5px solid ${isSelected ? ship.detail : ship.deck + '55'}`,
                                boxShadow: isSelected ? `0 0 18px ${ship.detail}80` : 'inset 0 1px 0 rgba(255,255,255,0.1)',
                                color: '#f1f5f9',
                              }}>
                              <span className="flex gap-[2px]">
                                {Array.from({ length: ship.length }).map((_, i) => (
                                  <span key={i} className="w-1.5 h-3 rounded-sm" style={{ background: ship.detail }} />
                                ))}
                              </span>
                              <span className="hidden sm:inline">{ship.name}</span>
                              <span className="sm:hidden">{ship.length}</span>
                            </button>
                          );
                        })}
                        <button onClick={() => setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal')}
                          className="px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-2 text-cyan-300"
                          style={{ background: 'rgba(15,23,42,0.8)', border: '1.5px solid rgba(34,211,238,0.35)' }}>
                          {orientation === 'horizontal' ? <FaArrowsAltH /> : <FaArrowsAltV />}
                          {orientation === 'horizontal' ? 'أفقي' : 'عمودي'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Boards */}
                  <div className={`grid grid-cols-1 ${gameState.phase === 'battle' ? 'lg:grid-cols-2' : ''} gap-4`}>
                    {/* Enemy Board (battle only) */}
                    {gameState.phase === 'battle' && (
                      <BoardWrapper title="🌊 مياه العدو" subtitle={gameState.turn === playerId ? 'اضرب هنا' : 'بانتظار دورك'} highlight={gameState.turn === playerId}>
                        <Board grid={gameState.enemyGrid} shipLookup={{}} onCellClick={handleAttack} clickable={gameState.turn === playerId && !gameState.winner} hideShips />
                      </BoardWrapper>
                    )}

                    {/* Own Board */}
                    <BoardWrapper
                      title="🚢 أسطولي"
                      subtitle={gameState.phase === 'placement' ? (gameState.ready ? '✓ جاهز' : 'ضع القطع') : 'مياهك'}
                      highlight={false}
                    >
                      <Board grid={gameState.ownGrid} shipLookup={shipLookup}
                        onCellClick={handlePlacementClick}
                        clickable={gameState.phase === 'placement' && !gameState.ready} />
                    </BoardWrapper>
                  </div>

                  {/* Ready button */}
                  {gameState.phase === 'placement' && !gameState.ready && (
                    <button onClick={handleReady}
                      disabled={(gameState.ships?.length || 0) < SHIPS.length}
                      className={`w-full max-w-md mx-auto py-3 rounded-2xl font-black tracking-wide transition-all ${
                        (gameState.ships?.length || 0) >= SHIPS.length
                          ? 'text-slate-950 hover:scale-[1.02]'
                          : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
                      }`}
                      style={(gameState.ships?.length || 0) >= SHIPS.length ? {
                        background: 'linear-gradient(155deg, #10b981, #047857)',
                        boxShadow: '0 10px 25px rgba(16,185,129,0.35)',
                      } : {}}>
                      <FaCheck className="inline ml-2" />
                      {(gameState.ships?.length || 0) >= SHIPS.length
                        ? 'جاهز للمعركة'
                        : `ضع باقي القطع (${gameState.ships?.length || 0}/${SHIPS.length})`}
                    </button>
                  )}

                  {gameState.phase === 'placement' && gameState.ready && (
                    <p className="text-center text-emerald-400 text-sm font-bold tracking-widest py-3">
                      ✓ تم التجهيز — بانتظار الخصم...
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Winner popup */}
      <AnimatePresence>
        {gameState?.winner && gameState.myId && (
          <WinnerPopup
            isWinner={gameState.winner === gameState.myId}
            winnerName={gameState.winner === gameState.playerX.id ? gameState.playerX.name : gameState.playerO.name}
            onNewRound={isAdmin ? backToPicker : null}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Sub components
═══════════════════════════════════════════ */
function BoardWrapper({ title, subtitle, highlight, children }) {
  return (
    <div className="rounded-2xl p-3 sm:p-4"
      style={{
        background: 'linear-gradient(155deg, rgba(15,23,42,0.75), rgba(7,16,32,0.65))',
        backdropFilter: 'blur(20px) saturate(160%)',
        WebkitBackdropFilter: 'blur(20px) saturate(160%)',
        border: `1.5px solid ${highlight ? 'rgba(34,211,238,0.6)' : 'rgba(34,211,238,0.25)'}`,
        boxShadow: highlight
          ? '0 0 40px rgba(34,211,238,0.25), inset 0 1px 0 rgba(34,211,238,0.15)'
          : 'inset 0 1px 0 rgba(34,211,238,0.08), 0 20px 60px rgba(0,0,0,0.5)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-cyan-100 text-sm font-bold tracking-widest">{title}</h3>
        <span className={`text-[10px] tracking-widest ${highlight ? 'text-cyan-300' : 'text-cyan-300/40'}`}>{subtitle}</span>
      </div>
      {children}
    </div>
  );
}

function Board({ grid, shipLookup, onCellClick, clickable, hideShips }) {
  if (!grid) return null;
  return (
    <div className="grid gap-[2px] sm:gap-[3px]"
      style={{ gridTemplateColumns: `20px repeat(${PLAY_COLS}, minmax(0, 1fr))` }}>
      <div />
      {COL_LABELS.map(l => (
        <div key={l} className="flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-cyan-300/50"
          style={{ fontFamily: 'monospace' }}>{l}</div>
      ))}
      {Array.from({ length: PLAY_ROWS }, (_, ri) => {
        const r = ri + 1;
        return (
          <React.Fragment key={r}>
            <div className="flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-cyan-300/50"
              style={{ fontFamily: 'monospace' }}>{r}</div>
            {Array.from({ length: PLAY_COLS }, (_, ci) => {
              const c = ci + 1;
              return (
                <GridCell key={c} r={r} c={c} grid={grid} shipLookup={shipLookup}
                  onClick={() => onCellClick(r, c)} clickable={clickable} hideShips={hideShips} />
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function SpectatorView({ gameState }) {
  return (
    <div className="text-center py-16 max-w-md mx-auto">
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}
        className="text-6xl mb-4">👀</motion.div>
      <h2 className="text-2xl font-black text-cyan-50 mb-2">مشاهدة المعركة</h2>
      <p className="text-cyan-300/60 text-sm">
        {gameState.playerX?.name} ⚔️ {gameState.playerO?.name}
      </p>
      <p className="text-cyan-300/40 text-xs mt-4 tracking-widest">
        {gameState.phase === 'placement' ? 'توزيع القطع...' :
          gameState.winner ? `🏆 الفائز: ${gameState.winner === gameState.playerX.id ? gameState.playerX.name : gameState.playerO.name}` :
            `دور: ${gameState.turn === gameState.playerX.id ? gameState.playerX.name : gameState.playerO.name}`}
      </p>
    </div>
  );
}

function WinnerPopup({ isWinner, winnerName, onNewRound }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(5,8,15,0.9)', backdropFilter: 'blur(14px)' }}>
      {[...Array(20)].map((_, i) => (
        <motion.div key={i}
          initial={{ y: -40, opacity: 0, x: 0 }}
          animate={{ y: 700, opacity: [0, 1, 0], x: (i - 10) * 22, rotate: 720 }}
          transition={{ duration: 2.5, delay: i * 0.06, repeat: Infinity }}
          className="absolute top-0 left-1/2 w-2.5 h-2.5 rounded-sm pointer-events-none"
          style={{ background: ['#fbbf24', '#22d3ee', '#f472b6', '#34d399', '#a78bfa'][i % 5] }} />
      ))}
      <motion.div initial={{ scale: 0.7, y: 30 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="relative max-w-sm w-full rounded-3xl p-8 text-center"
        style={{
          background: isWinner
            ? 'linear-gradient(155deg, rgba(251,191,36,0.35), rgba(120,53,15,0.6))'
            : 'linear-gradient(155deg, rgba(34,211,238,0.25), rgba(8,145,178,0.4))',
          backdropFilter: 'blur(24px)',
          border: `2px solid ${isWinner ? 'rgba(251,191,36,0.7)' : 'rgba(34,211,238,0.5)'}`,
          boxShadow: isWinner ? '0 0 80px rgba(251,191,36,0.5)' : '0 0 60px rgba(34,211,238,0.3)',
        }}>
        <motion.div animate={{ rotate: [0, -12, 12, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }} className="text-7xl mb-4">
          {isWinner ? '🏆' : '⚓'}
        </motion.div>
        <h2 className="text-3xl font-black text-slate-50 mb-2">
          {isWinner ? '🎉 فزت!' : '😔 خسرت'}
        </h2>
        <p className="text-slate-100/90 font-bold mb-6">{winnerName}</p>
        {onNewRound && (
          <button onClick={onNewRound}
            className="w-full py-3 rounded-xl font-bold text-slate-950 flex items-center justify-center gap-2"
            style={{
              background: isWinner ? 'linear-gradient(155deg, #fbbf24, #d97706)' : 'linear-gradient(155deg, #22d3ee, #0891b2)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            }}>
            <FaRedo /> لعبة جديدة
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}