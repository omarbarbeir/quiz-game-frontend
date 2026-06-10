import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaStop, FaRedo } from 'react-icons/fa';

const Timer = ({ socket, roomCode, isAdmin }) => {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleSync = ({ seconds, running }) => {
      setSeconds(seconds);
      setRunning(running);
    };

    socket.on('timer_sync', handleSync);
    return () => socket.off('timer_sync', handleSync);
  }, [socket]);

  const emit = (sec, run) => socket.emit('timer_update', { roomCode, seconds: sec, running: run });

  const start  = () => emit(seconds, true);
  const pause  = () => emit(seconds, false);
  const stop   = () => emit(0, false);
  const restart = () => emit(0, true);

  const formatTime = (total) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-4 shadow-lg text-center mb-4 border border-purple-500/20">
      <h3 className="text-lg font-semibold mb-2">المؤقت</h3>
      <div className="text-4xl font-mono font-bold mb-3">{formatTime(seconds)}</div>
      {isAdmin && (
        <div className="flex justify-center gap-2 flex-wrap">
          {!running ? (
            <button onClick={start} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-1">
              <FaPlay /> بدء
            </button>
          ) : (
            <button onClick={pause} className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg flex items-center gap-1">
              <FaPause /> إيقاف مؤقت
            </button>
          )}
          <button onClick={stop} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-1">
            <FaStop /> إيقاف
          </button>
          <button onClick={restart} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-1">
            <FaRedo /> إعادة
          </button>
        </div>
      )}
      {!isAdmin && (
        <p className="text-sm text-indigo-200">يتحكم المسؤول بالمؤقت</p>
      )}
    </div>
  );
};

export default Timer;