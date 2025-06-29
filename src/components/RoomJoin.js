
import React, { useState } from 'react';

const RoomJoin = ({ onCreateRoom, onJoinRoom }) => {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-indigo-800 rounded-xl shadow-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Audio Quiz Master</h1>
        <p className="text-indigo-200">Real-time multiplayer trivia with audio questions</p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-indigo-700 border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter your name"
          />
        </div>
        
        <div className="flex flex-col gap-4">
          <button
            onClick={() => onCreateRoom()}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02]"
          >
            Create New Game Room
          </button>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-indigo-500"></div>
            <span className="flex-shrink mx-4 text-indigo-300">or</span>
            <div className="flex-grow border-t border-indigo-500"></div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Room Code</label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 rounded-lg bg-indigo-700 border border-indigo-600 focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
              placeholder="Enter room code"
            />
          </div>
          
          <button
            onClick={() => onJoinRoom(roomCode, playerName)}
            disabled={!roomCode || !playerName}
            className={`w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-bold transition-all ${
              !roomCode || !playerName 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.02]'
            }`}
          >
            Join Existing Room
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-center text-indigo-300 text-sm">
        <p>As admin, you'll control the game and questions</p>
        <p>As player, you'll be able to buzz in to answer</p>
      </div>
    </div>
  );
};

export default RoomJoin;