import React, { useState, useEffect } from 'react';
import { FaRedo, FaClock } from 'react-icons/fa';

const TicTacToe = ({ isAdmin, socket, roomCode, players }) => {
  // Define the rounds with image data
  const rounds = [
    {
      logo1: "/Net/acmilan.jpg",
      logo2: "/Net/africa_cup.jpg",
      logo3: "/Net/Africa_Map.jpg",
      logoleft1: "/Net/ajax.jpg",
      logoleft2: "/Net/alex_ferg.jpg",
      logoleft3: "/Net/Argentina.jpg",
    },
    {
      logo1: "/Net/arsenal.jpg",
      logo2: "/Net/aston_villa.jpg",
      logo3: "/Net/atletico_madrid.jpg",
      logoleft1: "/Net/barcelona.jpg",
      logoleft2: "/Net/bayern_munich.jpg",
      logoleft3: "/Net/benfica.jpg",
    },
    {
      logo1: "/Net/borussia_dortmund.jpg",
      logo2: "/Net/brazil.jpg",
      logo3: "/Net/chelsea.jpg",
      logoleft1: "/Net/copa_america.jpg",
      logoleft2: "/Net/diego_maradona.jpg",
      logoleft3: "/Net/england.jpg",
    }
  ];
  
  const [currentRound, setCurrentRound] = useState(0);
  const [squares, setSquares] = useState(Array(6).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [timer, setTimer] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // Player colors
  const playerColors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 
    'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'
  ];

  // Initialize game
  useEffect(() => {
    setIsTimerRunning(true);
    socket.emit('init_tic_tac_toe', { 
      roomCode, 
      squares: Array(6).fill(null),
      currentPlayer: 0,
      currentRound: 0
    });
  }, []);

  // Handle square click
  const handleSquareClick = (index) => {
    if (!isAdmin || !isTimerRunning) return;
    
    const newSquares = [...squares];
    newSquares[index] = {
      playerId: players[currentPlayer].id,
      playerName: players[currentPlayer].name,
      color: playerColors[currentPlayer]
    };
    
    setSquares(newSquares);
    socket.emit('update_tic_tac_toe', { 
      roomCode, 
      squares: newSquares,
      currentPlayer
    });
  };

  // Reset all squares
  const resetSquares = () => {
    const newSquares = Array(6).fill(null);
    setSquares(newSquares);
    setTimer(30);
    setIsTimerRunning(true);
    
    socket.emit('update_tic_tac_toe', { 
      roomCode, 
      squares: newSquares,
      currentPlayer
    });
  };

  // Change current player
  const changePlayer = () => {
    const nextPlayer = (currentPlayer + 1) % players.length;
    setCurrentPlayer(nextPlayer);
    
    socket.emit('change_tic_tac_toe_player', { 
      roomCode, 
      playerIndex: nextPlayer 
    });
  };

  // Move to next round
  const nextRound = () => {
    const nextRound = (currentRound + 1) % rounds.length;
    setCurrentRound(nextRound);
    resetSquares();
    
    socket.emit('change_tic_tac_toe_round', { 
      roomCode, 
      round: nextRound 
    });
  };

  // Socket listeners
  useEffect(() => {
    const handleTicTacToeInit = (data) => {
      if (data.roomCode === roomCode) {
        setSquares(data.squares);
        setCurrentPlayer(data.currentPlayer);
        setCurrentRound(data.currentRound);
        setTimer(30);
        setIsTimerRunning(true);
      }
    };

    const handleTicTacToeUpdate = (data) => {
      if (data.roomCode === roomCode) {
        setSquares(data.squares);
        setCurrentPlayer(data.currentPlayer);
      }
    };

    const handlePlayerChange = (data) => {
      if (data.roomCode === roomCode) {
        setCurrentPlayer(data.playerIndex);
      }
    };

    const handleRoundChange = (data) => {
      if (data.roomCode === roomCode) {
        setCurrentRound(data.round);
        resetSquares();
      }
    };

    socket.on('tic_tac_toe_initialized', handleTicTacToeInit);
    socket.on('tic_tac_toe_updated', handleTicTacToeUpdate);
    socket.on('tic_tac_toe_player_changed', handlePlayerChange);
    socket.on('tic_tac_toe_round_changed', handleRoundChange);

    return () => {
      socket.off('tic_tac_toe_initialized', handleTicTacToeInit);
      socket.off('tic_tac_toe_updated', handleTicTacToeUpdate);
      socket.off('tic_tac_toe_player_changed', handlePlayerChange);
      socket.off('tic_tac_toe_round_changed', handleRoundChange);
    };
  }, [socket, roomCode]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerRunning(false);
    }
    
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  // Get images for current round
  const leftImages = [
    rounds[currentRound].logoleft1,
    rounds[currentRound].logoleft2,
    rounds[currentRound].logoleft3,
    rounds[currentRound].logoleft1,
    rounds[currentRound].logoleft2,
    rounds[currentRound].logoleft3,
  ];
  
  const rightImages = [
    rounds[currentRound].logo1,
    rounds[currentRound].logo2,
    rounds[currentRound].logo3,
    rounds[currentRound].logo1,
    rounds[currentRound].logo2,
    rounds[currentRound].logo3,
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-800 rounded-xl p-6 shadow-lg">
      <div className="grid grid-cols-2 gap-8">
        {/* Left Column - Player Squares */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {leftImages.map((image, index) => (
              <div 
                key={`left-${index}`}
                onClick={() => handleSquareClick(index)}
                className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer overflow-hidden relative
                  ${squares[index] ? squares[index].color : 'bg-indigo-700 hover:bg-indigo-600'} 
                  ${isAdmin && isTimerRunning ? 'hover:opacity-90' : ''}`}
              >
                {squares[index] ? (
                  <span className="text-white font-bold text-center px-2 truncate">
                    {squares[index].playerName}
                  </span>
                ) : (
                  <img 
                    src={image} 
                    alt={`Left ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h3 className="font-bold text-lg mb-2">المربعات</h3>
          </div>
        </div>
        
        {/* Right Column - Image Squares */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {rightImages.map((image, index) => (
              <div 
                key={`right-${index}`}
                className={`aspect-square rounded-lg flex items-center justify-center overflow-hidden
                  ${squares[index] ? squares[index].color : 'bg-indigo-700'}`}
              >
                {!squares[index] && (
                  <img 
                    src={image} 
                    alt={`Right ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h3 className="font-bold text-lg mb-2">بيغربول</h3>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-indigo-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Current Player:</span>
            <div className={`w-6 h-6 rounded-full ${playerColors[currentPlayer]}`}></div>
            <span className="font-bold">{players[currentPlayer]?.name || 'Player'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <FaClock className="text-amber-400" />
            <span className="font-mono text-xl">{timer.toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="mt-6 grid grid-cols-3 gap-4">
          <button 
            onClick={resetSquares}
            className="bg-amber-600 hover:bg-amber-700 py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <FaRedo /> إعادة المربعات
          </button>
          
          <button 
            onClick={changePlayer}
            className="bg-blue-600 hover:bg-blue-700 py-3 rounded-lg"
          >
            تغيير الدور
          </button>
          
          <button 
            onClick={nextRound}
            className="bg-green-600 hover:bg-green-700 py-3 rounded-lg"
          >
            الترميلان
          </button>
        </div>
      )}
    </div>
  );
};

export default TicTacToe;