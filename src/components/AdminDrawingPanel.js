import React, { useEffect } from 'react';
import { FaPlay, FaPause, FaStop, FaArrowLeft, FaTrash, FaSync } from 'react-icons/fa';

const AdminDrawingPanel = ({ 
  roomCode, 
  players, 
  currentDrawer,
  onSetDrawer,
  drawingTime,
  timerActive,
  onStartTimer,
  onPauseTimer,
  onContinueTimer,
  onStopTimer,
  onScoreChange,
  onBackToCategories,
  drawingPaths,
  onClearDrawing,
  onSyncDrawing
}) => {
  const canvasRef = React.useRef(null);
  const ctxRef = React.useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Set styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw existing paths
    drawingPaths.forEach(path => {
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.size;
      ctx.beginPath();
      ctx.moveTo(path.startX, path.startY);
      ctx.lineTo(path.endX, path.endY);
      ctx.stroke();
    });
  }, [drawingPaths]);

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    onClearDrawing();
  };

  const handleSync = () => {
    onSyncDrawing(drawingPaths);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Drawing Game - Admin Panel</h1>
        </div>
        
        <div className="bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-3">
          <span className="font-medium">Room Code:</span>
          <span className="font-mono text-xl bg-indigo-800 px-3 py-1 rounded">{roomCode}</span>
        </div>
      </div>

      <button
        onClick={onBackToCategories}
        className="mb-4 bg-indigo-700 hover:bg-indigo-800 py-2 px-4 rounded-lg flex items-center justify-center gap-2"
      >
        <FaArrowLeft /> Back to Categories
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-2 shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold text-indigo-900">
                Drawing Board
              </h2>
              <div className={`px-3 py-1 rounded-full font-bold ${
                timerActive ? 'bg-green-500 text-green-900' : 'bg-red-500 text-red-900'
              }`}>
                {Math.floor(drawingTime / 60)}:{drawingTime % 60 < 10 ? '0' : ''}{drawingTime % 60}
              </div>
            </div>
            
            <canvas
              ref={canvasRef}
              className="w-full h-[500px] bg-white rounded-lg border-2 border-indigo-300"
            />
            
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleClear}
                className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"
              >
                <FaTrash /> Clear Board
              </button>
              <button
                onClick={handleSync}
                className="bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1"
              >
                <FaSync /> Sync All
              </button>
            </div>
          </div>
          
          <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
            <h2 className="text-xl font-semibold mb-3">Timer Controls</h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onStartTimer(60)}
                disabled={timerActive}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                  timerActive 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <FaPlay /> Start (1 min)
              </button>
              
              <button
                onClick={onPauseTimer}
                disabled={!timerActive}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                  !timerActive 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                <FaPause /> Pause
              </button>
              
              <button
                onClick={onContinueTimer}
                disabled={timerActive}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                  timerActive 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <FaPlay /> Continue
              </button>
              
              <button
                onClick={onStopTimer}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <FaStop /> Stop
              </button>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
            <h2 className="text-xl font-semibold mb-3">Select Drawer</h2>
            <div className="space-y-3">
              {players.map(player => (
                <div 
                  key={player.id} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    currentDrawer === player.id 
                      ? 'bg-gradient-to-r from-amber-700 to-amber-600' 
                      : 'bg-indigo-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      player.isAdmin ? 'bg-yellow-500' : 'bg-indigo-600'
                    }`}>
                      {player.isAdmin ? <span className="text-yellow-800">QM</span> : <span className="font-bold">{player.name.charAt(0)}</span>}
                    </div>
                    <span className="font-medium">
                      {player.name} 
                      {player.isAdmin && " (Admin)"}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => onSetDrawer(player.id)}
                    disabled={player.isAdmin}
                    className={`px-3 py-1 rounded ${
                      player.isAdmin 
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-amber-600 hover:bg-amber-700'
                    }`}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
            <h2 className="text-xl font-semibold mb-3">Score Board</h2>
            <div className="space-y-3">
              {players.map(player => (
                <div 
                  key={player.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-indigo-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-600">
                      <span className="font-bold">{player.name.charAt(0)}</span>
                    </div>
                    <span className="font-medium">
                      {player.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onScoreChange(player.id, -1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600"
                    >
                      -
                    </button>
                    
                    <span className="font-bold text-lg min-w-[30px] text-center">
                      {player.score}
                    </span>
                    
                    <button 
                      onClick={() => onScoreChange(player.id, 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500 hover:bg-green-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDrawingPanel;