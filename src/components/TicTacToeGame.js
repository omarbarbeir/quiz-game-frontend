import React, { useState, useEffect, useRef } from 'react';
import { FaPause, FaPlay, FaForward, FaUndo, FaSignOutAlt, FaRandom } from 'react-icons/fa';

const TicTacToeGame = ({ 
  players, 
  currentPlayerId,
  roomCode, 
  socket,
  isAdmin,
  board,
  onSquareClick,
  currentPlayerIndex,
  winner,
  onNextPlayer,
  onResetGame,
  onNewRound,
  onLeaveGame,
  currentRound
}) => {
  const [timerSeconds, setTimerSeconds] = useState(20);
  const [timerActive, setTimerActive] = useState(true);
  const timerRef = useRef(null);
  
  // Player colors
  const playerColors = [
    'bg-red-500', 
    'bg-blue-500', 
    'bg-green-500', 
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500'
  ];
  
  // Player symbols
  const playerSymbols = ['X', 'O', '△', '□', '◯', '☆'];

  // Initialize player data
  const playerData = players.map((player, index) => ({
    ...player,
    color: playerColors[index],
    symbol: playerSymbols[index]
  }));

  // Current player
  const currentPlayer = playerData[currentPlayerIndex];
  
  // Move to next player
  const nextPlayer = () => {
    onNextPlayer();
  };

  // Reset timer
  const resetTimer = () => {
    setTimerSeconds(20);
  };

  // Toggle timer
  const toggleTimer = () => {
    setTimerActive(!timerActive);
  };

  // Timer effect
  useEffect(() => {
    if (timerActive && !winner) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            nextPlayer();
            return 20;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(timerRef.current);
  }, [timerActive, winner]);

  // Reset timer when player changes
  useEffect(() => {
    resetTimer();
  }, [currentPlayerIndex]);

  // Render game board with photos
  const renderBoard = () => {
    return (
      <div className="grid grid-cols-4 gap-2 w-full max-w-md mx-auto">
        {/* Top Row - Logo and Photos */}
        <div className="col-span-1 row-span-1 flex items-center justify-center p-2">
          <div className="w-full h-full flex items-center justify-center font-bold text-lg bg-indigo-700 rounded-lg">
            LOGO
          </div>
        </div>
        <div className="col-span-1 row-span-1 flex items-center justify-center p-2">
          <img 
            src={currentRound?.logo1} 
            alt="Top Row 1" 
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        <div className="col-span-1 row-span-1 flex items-center justify-center p-2">
          <img 
            src={currentRound?.logo2} 
            alt="Top Row 2" 
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        <div className="col-span-1 row-span-1 flex items-center justify-center p-2">
          <img 
            src={currentRound?.logo3} 
            alt="Top Row 3" 
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        
        {/* Left Column - Photos */}
        <div className="col-span-1 row-span-1 flex items-center justify-center p-2">
          <img 
            src={currentRound?.logoleft1} 
            alt="Left Column 1" 
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        {renderPlayableSquare(4)}
        {renderPlayableSquare(5)}
        {renderPlayableSquare(6)}
        
        <div className="col-span-1 row-span-1 flex items-center justify-center p-2">
          <img 
            src={currentRound?.logoleft2} 
            alt="Left Column 2" 
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        {renderPlayableSquare(7)}
        {renderPlayableSquare(8)}
        {renderPlayableSquare(9)}
        
        <div className="col-span-1 row-span-1 flex items-center justify-center p-2">
          <img 
            src={currentRound?.logoleft3} 
            alt="Left Column 3" 
            className="w-full h-full object-contain rounded-lg"
          />
        </div>
        {renderPlayableSquare(10)}
        {renderPlayableSquare(11)}
        {renderPlayableSquare(12)}
        
        {/* Bottom Row - Playable squares */}
        <div className="col-span-1 row-span-1"></div> {/* Empty space for alignment */}
        {renderPlayableSquare(13)}
        {renderPlayableSquare(14)}
        {renderPlayableSquare(15)}
      </div>
    );
  };

  const renderPlayableSquare = (index) => (
    <div 
      key={index}
      onClick={() => onSquareClick(index)}
      className={`
        aspect-square flex items-center justify-center text-3xl font-bold
        border-4 border-indigo-700 rounded-lg cursor-pointer
        transition-all duration-200 hover:scale-105
        ${board[index] !== null ? playerData[board[index]]?.color + ' text-white' : 'bg-indigo-800'}
      `}
    >
      {board[index] !== null ? playerData[board[index]]?.symbol : ''}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">تيك تاك تو</h1>
        <button
          onClick={onLeaveGame}
          className="bg-indigo-700 hover:bg-indigo-800 py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <FaSignOutAlt /> العودة إلى المسابقة
        </button>
      </div>

      {/* Player status */}
      <div className="bg-indigo-800 rounded-xl p-4 mb-6">
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          {playerData.map((player, index) => (
            <div 
              key={player.id}
              className={`flex items-center gap-2 p-2 rounded-lg ${
                currentPlayerIndex === index ? 'ring-4 ring-yellow-500' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${player.color}`}></div>
              <span className="font-medium">
                {player.name} ({player.symbol})
              </span>
            </div>
          ))}
        </div>

        <div className="text-center py-3">
          {winner ? (
            <div className="text-2xl font-bold">
              الفائز: <span className={`${playerData.find(p => p.id === winner.id)?.color} px-3 py-1 rounded-lg`}>{winner.name}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <div className="text-xl">
                اللاعب الحالي: <span className="font-bold">{currentPlayer.name}</span>
              </div>
              <div className="text-xl">
                الوقت: <span className="font-mono">{timerSeconds} ثانية</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game board */}
      <div className="mb-8">
        {renderBoard()}
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="bg-indigo-800 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-3">تحكم المشرف</h3>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={toggleTimer}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                timerActive ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {timerActive ? <FaPause /> : <FaPlay />}
              {timerActive ? 'إيقاف المؤقت' : 'تشغيل المؤقت'}
            </button>
            
            <button
              onClick={nextPlayer}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <FaForward /> اللاعب التالي
            </button>
            
            <button
              onClick={onResetGame}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
            >
              <FaUndo /> إعادة المربعات
            </button>
            
            <button
              onClick={onNewRound}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 flex items-center gap-2"
            >
              <FaRandom /> جولة جديدة
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicTacToeGame;