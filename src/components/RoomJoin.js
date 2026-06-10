import React, { useState } from 'react';

const RoomJoin = ({ onCreateRoom, onJoinRoom }) => {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleJoin = () => {
    if (roomCode && playerName) {
      onJoinRoom(roomCode, playerName);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      {/* Animated border wrapper */}
      <div className="relative p-[3px] rounded-2xl overflow-hidden max-w-md w-full mx-4">
        {/* shimmer border – moving cyan‑purple */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 animate-shimmer rounded-2xl" />
        
        <div className="relative bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 rounded-2xl p-8 shadow-2xl shadow-purple-500/10">
          <h2 className="text-3xl font-extrabold text-center mb-8">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              🏆 انضم للمسابقة 🏆
            </span>
          </h2>

          {/* Create room button */}
          <button
            onClick={onCreateRoom}
            className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 py-4 rounded-xl font-bold text-lg mb-6 transform transition-all duration-300 hover:scale-[1.02] shadow-lg shadow-purple-500/20 active:scale-95"
          >
            إنشاء غرفة جديدة
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
            <span className="text-gray-400 text-sm">أو</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
          </div>

          {/* Join existing room */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
                اسم اللاعب
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="ادخل اسمك"
                className="w-full bg-gray-800/50 border border-gray-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-white text-right outline-none transition-all duration-200 focus:bg-gray-800/80"
                dir="rtl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 text-right">
                رمز الغرفة
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="مثال: ABCD"
                maxLength={6}
                className="w-full bg-gray-800/50 border border-gray-700 focus:border-purple-500 rounded-xl px-4 py-3 text-white text-right outline-none transition-all duration-200 focus:bg-gray-800/80 tracking-widest font-mono"
                dir="rtl"
              />
            </div>

            <button
              onClick={handleJoin}
              disabled={!roomCode || !playerName}
              className={`w-full py-4 rounded-xl font-bold text-lg transform transition-all duration-300 ${
                roomCode && playerName
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:scale-[1.02] shadow-lg shadow-pink-500/20 active:scale-95'
                  : 'bg-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              انضم للغرفة
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            أدخل رمز الغرفة المكون من ٤ حروف للانضمام
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoomJoin;