// components/WhiteboardRound.jsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaEraser, FaPaintBrush, FaTrash, FaSignOutAlt,
  FaDownload, FaCircle, FaPen, FaBolt
} from 'react-icons/fa';
import Timer from './Timer';

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const CANVAS_BG = '#0f2027';

const COLORS = [
  '#ffffff', // white
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#a16207', // brown
];

const SIZES = [
  { label: 'صغير', value: 2 },
  { label: 'وسط', value: 5 },
  { label: 'كبير', value: 10 },
  { label: 'ضخم', value: 20 },
];

/* ─────────────────────────────────────────────
   Particles — subtle emerald dots
───────────────────────────────────────────── */
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.22,
      dy: (Math.random() - 0.5) * 0.22,
      alpha: Math.random() * 0.45 + 0.12,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(80,220,180,${p.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" style={{ opacity: 0.4 }} />;
}

/* ─────────────────────────────────────────────
   MAIN
───────────────────────────────────────────── */
export default function WhiteboardRound({
  socket,
  roomCode,
  isAdmin,
  players = [],
  playerId,
  onLeaveRoom,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawingRef = useRef(false);
  const brushColorRef = useRef('#ffffff');
  const brushSizeRef = useRef(5);

  const [tool, setTool] = useState('brush');
  const [color, setColor] = useState('#ffffff');
  const [size, setSize] = useState(5);
  const [showToolbar, setShowToolbar] = useState(true);

  // ── Canvas sizing + state ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const setCanvasSize = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      ctx.fillStyle = CANVAS_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    setCanvasSize();

    const handleResize = () => {
      setCanvasSize();
      if (socket) socket.emit('get_whiteboard_state', roomCode);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [socket, roomCode]);

  // ── Socket listeners ──
  useEffect(() => {
    if (!socket) return;

    const handleStrokeStarted = (stroke) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(stroke.startX, stroke.startY);
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    const handleStrokeUpdated = ({ x, y }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const handleWhiteboardCleared = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = CANVAS_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const handleWhiteboardState = (whiteboard) => {
      const canvas = canvasRef.current;
      if (!canvas || !whiteboard) return;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = CANVAS_BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      (whiteboard.strokes || []).forEach(stroke => {
        if (!stroke.points || stroke.points.length === 0) return;
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      });
    };

    socket.on('stroke_started', handleStrokeStarted);
    socket.on('stroke_updated', handleStrokeUpdated);
    socket.on('whiteboard_cleared', handleWhiteboardCleared);
    socket.on('whiteboard_state', handleWhiteboardState);

    socket.emit('get_whiteboard_state', roomCode);

    return () => {
      socket.off('stroke_started', handleStrokeStarted);
      socket.off('stroke_updated', handleStrokeUpdated);
      socket.off('whiteboard_cleared', handleWhiteboardCleared);
      socket.off('whiteboard_state', handleWhiteboardState);
    };
  }, [socket, roomCode]);

  // ── Drawing handlers ──
  const getPointFromEvent = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    if (clientX == null || clientY == null) return null;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    if (e.type.includes('touch')) e.preventDefault();
    const point = getPointFromEvent(e);
    if (!point) return;

    isDrawingRef.current = true;

    const strokeColor = tool === 'eraser' ? CANVAS_BG : brushColorRef.current;
    const strokeSize = tool === 'eraser' ? brushSizeRef.current * 3 : brushSizeRef.current;

    if (socket) {
      socket.emit('start_drawing', {
        roomCode,
        startX: point.x,
        startY: point.y,
        color: strokeColor,
        size: strokeSize,
      });
    }
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    if (e.type.includes('touch')) e.preventDefault();
    const point = getPointFromEvent(e);
    if (!point) return;
    if (socket) {
      socket.emit('update_drawing', { roomCode, x: point.x, y: point.y });
    }
  };

  const endDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (socket) socket.emit('end_drawing', { roomCode });
  };

  const setBrushColor = (c) => {
    brushColorRef.current = c;
    setColor(c);
    setTool('brush');
  };

  const setBrushSize = (s) => {
    brushSizeRef.current = s;
    setSize(s);
  };

  const clearWhiteboard = () => {
    if (socket) socket.emit('clear_whiteboard', { roomCode });
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whiteboard-${roomCode}-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'e' || e.key === 'E') setTool('eraser');
      if (e.key === 'b' || e.key === 'B') setTool('brush');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #061a1a 0%, #0b2828 40%, #0a2222 70%, #051515 100%)',
        fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
      }}
    >
      <ParticleField />

      {/* Ambient glow */}
      <div
        className="pointer-events-none fixed"
        style={{
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
          top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(60px)',
        }}
      />

      {/* ─── Top bar ─── */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-emerald-500/15 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <FaPen className="text-emerald-400/70 text-sm" />
            <span className="text-emerald-100 text-sm font-bold tracking-wide">السبورة التعاونية</span>
          </div>
          <span className="hidden sm:block w-px h-4 bg-emerald-800/40" />
          <span className="hidden sm:inline text-emerald-200/40 text-xs">{players.length} لاعبين</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <Timer socket={socket} roomCode={roomCode} isAdmin={isAdmin} />
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-700/40 bg-emerald-950/40 backdrop-blur-sm text-emerald-300/80 text-xs tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {roomCode}
          </div>
          <button
            onClick={onLeaveRoom}
            className="text-emerald-200/40 hover:text-emerald-200/90 transition-colors text-xs flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-500/10"
          >
            <FaSignOutAlt className="text-[10px]" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </div>

      {/* ─── Canvas area ─── */}
      <div className="relative flex-1 p-2 sm:p-4 pb-0">
        <div
          ref={containerRef}
          className="relative w-full h-full rounded-2xl overflow-hidden"
          style={{
            background: CANVAS_BG,
            border: '1px solid rgba(16,185,129,0.2)',
            boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5), 0 0 40px rgba(16,185,129,0.08)',
          }}
        >
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none" style={{
            borderTop: '2px solid rgba(16,185,129,0.4)',
            borderLeft: '2px solid rgba(16,185,129,0.4)',
            borderTopLeftRadius: '16px',
          }} />
          <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none" style={{
            borderTop: '2px solid rgba(16,185,129,0.4)',
            borderRight: '2px solid rgba(16,185,129,0.4)',
            borderTopRightRadius: '16px',
          }} />
          <div className="absolute bottom-0 left-0 w-8 h-8 pointer-events-none" style={{
            borderBottom: '2px solid rgba(16,185,129,0.4)',
            borderLeft: '2px solid rgba(16,185,129,0.4)',
            borderBottomLeftRadius: '16px',
          }} />
          <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none" style={{
            borderBottom: '2px solid rgba(16,185,129,0.4)',
            borderRight: '2px solid rgba(16,185,129,0.4)',
            borderBottomRightRadius: '16px',
          }} />

          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
            className="absolute inset-0 w-full h-full"
            style={{
              touchAction: 'none',
              cursor: tool === 'eraser' ? 'cell' : 'crosshair',
            }}
          />
        </div>

        {/* Toolbar hide/show button */}
        <button
          onClick={() => setShowToolbar(s => !s)}
          className="absolute top-4 right-6 z-20 w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-emerald-200 flex items-center justify-center hover:bg-emerald-800/80 transition-colors"
          title={showToolbar ? 'إخفاء الأدوات' : 'إظهار الأدوات'}
        >
          {showToolbar ? '▾' : '▴'}
        </button>
      </div>

      {/* ─── Floating toolbar ─── */}
      <AnimatePresence>
        {showToolbar && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative z-20 px-2 sm:px-4 pb-3 pt-2"
          >
            <div
              className="mx-auto max-w-fit flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 rounded-2xl backdrop-blur-xl"
              style={{
                background: 'linear-gradient(155deg, rgba(6,26,26,0.85), rgba(11,40,40,0.85))',
                border: '1px solid rgba(16,185,129,0.25)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(80,220,180,0.08)',
              }}
            >
              {/* Tools */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setTool('brush')}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    tool === 'brush'
                      ? 'bg-emerald-500 text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                      : 'bg-slate-800/60 text-emerald-200/60 hover:bg-slate-700/60'
                  }`}
                  title="قلم (B)"
                >
                  <FaPaintBrush className="text-sm" />
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    tool === 'eraser'
                      ? 'bg-emerald-500 text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                      : 'bg-slate-800/60 text-emerald-200/60 hover:bg-slate-700/60'
                  }`}
                  title="ممحاة (E)"
                >
                  <FaEraser className="text-sm" />
                </button>
              </div>

              <span className="w-px h-6 bg-emerald-700/40" />

              {/* Colors */}
              <div className="flex items-center gap-1">
                {COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setBrushColor(c)}
                    className={`relative w-7 h-7 rounded-full transition-all ${
                      color === c && tool === 'brush'
                        ? 'scale-110'
                        : 'hover:scale-110'
                    }`}
                    style={{
                      backgroundColor: c,
                      border: color === c && tool === 'brush'
                        ? '2px solid #ffffff'
                        : '2px solid rgba(255,255,255,0.15)',
                      boxShadow: color === c && tool === 'brush'
                        ? `0 0 14px ${c}`
                        : 'none',
                    }}
                    title={c}
                  />
                ))}
              </div>

              <span className="w-px h-6 bg-emerald-700/40" />

              {/* Sizes */}
              <div className="flex items-center gap-1">
                {SIZES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setBrushSize(s.value)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      size === s.value
                        ? 'bg-emerald-500/30 border-emerald-400/70'
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-700/60'
                    }`}
                    style={{ border: '1.5px solid' }}
                    title={s.label}
                  >
                    <div
                      className="rounded-full"
                      style={{
                        width: Math.min(s.value + 2, 14),
                        height: Math.min(s.value + 2, 14),
                        backgroundColor: tool === 'eraser' ? '#94a3b8' : color,
                      }}
                    />
                  </button>
                ))}
              </div>

              <span className="w-px h-6 bg-emerald-700/40" />

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={downloadImage}
                  className="w-10 h-10 rounded-xl bg-slate-800/60 text-emerald-200/80 hover:bg-slate-700/60 hover:text-emerald-100 flex items-center justify-center transition-all"
                  title="حفظ الصورة"
                >
                  <FaDownload className="text-sm" />
                </button>
                <button
                  onClick={clearWhiteboard}
                  className="w-10 h-10 rounded-xl bg-rose-900/60 text-rose-200 hover:bg-rose-800/80 flex items-center justify-center transition-all"
                  title="مسح الكل"
                >
                  <FaTrash className="text-sm" />
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}