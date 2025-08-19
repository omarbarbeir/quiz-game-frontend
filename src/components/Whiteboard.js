import React, { useRef, useEffect, useState } from 'react';
import { FaEraser, FaPaintBrush, FaTrash, FaClock, FaPause, FaPlay, FaRedo } from 'react-icons/fa';

const Whiteboard = ({ socket, roomCode, isAdmin }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isDrawingRef = useRef(false);
  const brushColorRef = useRef('#ffffff');
  const brushSizeRef = useRef(5);
  const [tool, setTool] = useState('brush');
  const [timeLeft, setTimeLeft] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const setCanvasSize = () => {
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
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
      
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
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

    // Timer event handlers
    const handleTimerStarted = (duration) => {
      setTimeLeft(duration);
      setTimerRunning(true);
    };
    
    const handleTimerUpdate = (time) => {
      setTimeLeft(time);
    };
    
    const handleTimerEnd = () => {
      setTimerRunning(false);
      setTimeLeft(0);
    };

    const handleTimerStopped = () => {
      setTimerRunning(false);
    };

    const handleTimerContinued = (time) => {
      setTimeLeft(time);
      setTimerRunning(true);
    };

    const handleTimerReset = () => {
      setTimeLeft(120);
      setTimerRunning(false);
    };

    socket.on('stroke_started', handleStrokeStarted);
    socket.on('stroke_updated', handleStrokeUpdated);
    socket.on('whiteboard_cleared', handleWhiteboardCleared);
    socket.on('whiteboard_state', handleWhiteboardState);
    socket.on('timer_started', handleTimerStarted);
    socket.on('timer_update', handleTimerUpdate);
    socket.on('timer_end', handleTimerEnd);
    socket.on('timer_stopped', handleTimerStopped);
    socket.on('timer_continued', handleTimerContinued);
    socket.on('timer_reset', handleTimerReset);
    
    socket.emit('get_whiteboard_state', roomCode);
    
    return () => {
      socket.off('stroke_started', handleStrokeStarted);
      socket.off('stroke_updated', handleStrokeUpdated);
      socket.off('whiteboard_cleared', handleWhiteboardCleared);
      socket.off('whiteboard_state', handleWhiteboardState);
      socket.off('timer_started', handleTimerStarted);
      socket.off('timer_update', handleTimerUpdate);
      socket.off('timer_end', handleTimerEnd);
      socket.off('timer_stopped', handleTimerStopped);
      socket.off('timer_continued', handleTimerContinued);
      socket.off('timer_reset', handleTimerReset);
    };
  }, [socket, roomCode]);

  const startCountdown = () => {
    if (socket) {
      socket.emit('start_timer', { roomCode, duration: 120 });
    }
  };

  const stopTimer = () => {
    if (socket) {
      socket.emit('stop_timer', { roomCode });
    }
  };

  const continueTimer = () => {
    if (socket) {
      socket.emit('continue_timer', { roomCode, currentTime: timeLeft });
    }
  };

  const resetTimer = () => {
    if (socket) {
      socket.emit('reset_timer', { roomCode });
    }
  };

  useEffect(() => {
    const preventTouch = (e) => {
      if (isDrawingRef.current) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', preventTouch, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', preventTouch);
      clearInterval(timerRef.current);
    };
  }, []);

  const startDrawing = (e) => {
    isDrawingRef.current = true;
    
    if (e.type.includes('touch')) {
      e.preventDefault();
    }
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (!clientX || !clientY) return;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    let strokeColor, strokeSize;
    if (tool === 'eraser') {
      strokeColor = '#1e293b';
      strokeSize = brushSizeRef.current * 3;
    } else {
      strokeColor = brushColorRef.current;
      strokeSize = brushSizeRef.current;
    }
    
    if (socket) {
      socket.emit('start_drawing', { 
        roomCode, 
        startX: x, 
        startY: y,
        color: strokeColor,
        size: strokeSize
      });
    }
  };
  
  const draw = (e) => {
    if (!isDrawingRef.current) return;
    
    if (e.type.includes('touch')) {
      e.preventDefault();
    }
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (!clientX || !clientY) return;
    
    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;
    
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

  const formatTime = (seconds) => {
    if (seconds === null) return '2:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="relative mt-4">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center bg-indigo-800 px-4 py-2 rounded-full">
          <FaClock className="mr-2" />
          <span className="text-xl font-bold">
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>
      
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
          style={{ touchAction: 'none' }}
        />
      </div>
      
      <div className="mt-3 flex flex-wrap gap-3 items-center justify-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTool('brush')}
            className={`px-3 py-2 rounded flex items-center gap-2 ${
              tool === 'brush' ? 'bg-indigo-600' : 'bg-indigo-700'
            }`}
          >
            <FaPaintBrush /> قلم
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`px-3 py-2 rounded flex items-center gap-2 ${
              tool === 'eraser' ? 'bg-indigo-600' : 'bg-indigo-700'
            }`}
          >
            <FaEraser /> ممحاة
          </button>
        </div>
        
        {tool === 'brush' && (
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
        )}
        
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
        
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={startCountdown}
              disabled={timerRunning}
              className={`px-3 py-2 rounded flex items-center gap-2 ${
                timerRunning 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <FaPlay /> بدء المؤقت
            </button>
            
            <button
              onClick={stopTimer}
              disabled={!timerRunning}
              className={`px-3 py-2 rounded flex items-center gap-2 ${
                !timerRunning 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-yellow-600 hover:bg-yellow-700'
              }`}
            >
              <FaPause /> إيقاف
            </button>
            
            <button
              onClick={continueTimer}
              disabled={timerRunning || timeLeft === null || timeLeft === 0}
              className={`px-3 py-2 rounded flex items-center gap-2 ${
                timerRunning || timeLeft === null || timeLeft === 0
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <FaPlay /> استئناف
            </button>
            
            <button
              onClick={resetTimer}
              className="px-3 py-2 rounded flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              <FaRedo /> إعادة تعيين
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Whiteboard;