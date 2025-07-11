import React, { useState } from 'react';
import { FaPlus, FaSignInAlt } from 'react-icons/fa';

const RoomJoin = ({ onCreateRoom, onJoinRoom }) => {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  return (
    <div className="max-w-md mx-auto bg-indigo-800 rounded-xl shadow-2xl p-8 mt-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Quiz Game</h1>
        <p className="text-indigo-300">Join or create a room to start playing!</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-lg mb-2">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full bg-indigo-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter your name"
          />
        </div>

        <div>
          <label className="block text-lg mb-2">Room Code</label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className="w-full bg-indigo-700 text-white rounded-lg px-4 py-3 font-mono text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter room code"
            maxLength={4}
          />
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <button
            onClick={() => onJoinRoom(roomCode, playerName)}
            disabled={!roomCode || !playerName}
            className={`flex items-center justify-center gap-2 py-4 rounded-lg font-bold transition-all ${
              !roomCode || !playerName
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 active:scale-95'
            }`}
          >
            <FaSignInAlt /> Join Room
          </button>
          
          <button
            onClick={onCreateRoom}
            disabled={!playerName}
            className={`flex items-center justify-center gap-2 py-4 rounded-lg font-bold transition-all ${
              !playerName
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95'
            }`}
          >
            <FaPlus /> Create New Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomJoin;