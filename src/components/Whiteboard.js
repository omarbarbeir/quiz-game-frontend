import React, { useRef, useEffect } from 'react';
import { FaEraser, FaPaintBrush, FaTrash } from 'react-icons/fa';

const Whiteboard = ({ socket, roomCode }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawingRef = useRef(false);
  const brushColorRef = useRef('#ffffff');
  const brushSizeRef = useRef(5);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const setCanvasSize = () => {
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Set background
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    
    setCanvasSize();
    
    const handleResize = () => {
      setCanvasSize();
      if (socket) {
        socket.emit('get_whiteboard_state', roomCode);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [socket, roomCode]);
  
  useEffect(() => {
    if (!socket) return;
    
    const handleStrokeStarted = (stroke) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(stroke.startX, stroke.startY);
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.lineCap = 'round';
    };
    
    const handleStrokeUpdated = ({ strokeId, x, y }) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineTo(x, y);
      ctx.stroke();
    };
    
    const handleWhiteboardCleared = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    
    const handleWhiteboardState = (whiteboard) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Clear canvas
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Redraw all strokes
      whiteboard.strokes.forEach(stroke => {
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.size;
        ctx.lineCap = 'round';
        ctx.stroke();
      });
    };
    
    socket.on('stroke_started', handleStrokeStarted);
    socket.on('stroke_updated', handleStrokeUpdated);
    socket.on('whiteboard_cleared', handleWhiteboardCleared);
    socket.on('whiteboard_state', handleWhiteboardState);
    
    // Request current whiteboard state
    socket.emit('get_whiteboard_state', roomCode);
    
    return () => {
      socket.off('stroke_started', handleStrokeStarted);
      socket.off('stroke_updated', handleStrokeUpdated);
      socket.off('whiteboard_cleared', handleWhiteboardCleared);
      socket.off('whiteboard_state', handleWhiteboardState);
    };
  }, [socket, roomCode]);

  // Fix for "Unable to preventDefault" error
  useEffect(() => {
    const preventTouch = (e) => {
      if (isDrawingRef.current) {
        e.preventDefault();
      }
    };
    
    // Add event listener with passive: false to allow preventDefault
    document.addEventListener('touchmove', preventTouch, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', preventTouch);
    };
  }, []);

  const startDrawing = (e) => {
    isDrawingRef.current = true;
    
    // Prevent default to stop page scrolling
    if (e.type.includes('touch')) {
      e.preventDefault();
    }
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get coordinates based on event type
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (!clientX || !clientY) return;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Emit start drawing event
    if (socket) {
      socket.emit('start_drawing', { 
        roomCode, 
        startX: x, 
        startY: y,
        color: brushColorRef.current,
        size: brushSizeRef.current
      });
    }
  };
  
  const draw = (e) => {
    if (!isDrawingRef.current) return;
    
    // Prevent default to stop page scrolling
    if (e.type.includes('touch')) {
      e.preventDefault();
    }
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Get coordinates based on event type
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (!clientX || !clientY) return;
    
    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;
    
    // Emit drawing update
    if (socket) {
      socket.emit('update_drawing', { 
        roomCode, 
        x: currentX, 
        y: currentY 
      });
    }
  };
  
  const endDrawing = () => {
    isDrawingRef.current = false;
    if (socket) {
      socket.emit('end_drawing', { roomCode });
    }
  };
  
  const setBrushColor = (color) => {
    brushColorRef.current = color;
  };
  
  const setBrushSize = (size) => {
    brushSizeRef.current = size;
  };
  
  const clearWhiteboard = () => {
    if (socket) {
      socket.emit('clear_whiteboard', { roomCode });
    }
  };

  return (
    <div className="relative mt-4">
      <div 
        ref={containerRef} 
        className="relative w-full bg-indigo-900 rounded-lg border-2 border-indigo-700"
        style={{ height: '50vh' }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          style={{ touchAction: 'none' }} // Prevent browser touch actions
        />
      </div>
      
      <div className="mt-3 flex flex-wrap gap-3 items-center justify-center">
        <div className="flex items-center gap-2">
          <FaPaintBrush className="text-indigo-300" />
          <div className="flex gap-1">
            {['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map(c => (
              <button
                key={c}
                onClick={() => setBrushColor(c)}
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 ${
                  brushColorRef.current === c 
                    ? 'border-white' 
                    : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-indigo-300 text-sm sm:text-base">الحجم:</span>
          <select 
            defaultValue={5}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="bg-indigo-700 border border-indigo-600 text-white rounded px-2 py-1 text-sm sm:text-base"
          >
            <option value={2}>صغير</option>
            <option value={5}>متوسط</option>
            <option value={10}>كبير</option>
            <option value={20}>كبير جداً</option>
          </select>
        </div>
        
        <button
          onClick={clearWhiteboard}
          className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded flex items-center gap-2 text-sm sm:text-base"
        >
          <FaTrash /> مسح السبورة
        </button>
      </div>
    </div>
  );
};

export default Whiteboard;