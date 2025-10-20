import React, { useState, useEffect } from 'react';
import { FaTimes, FaCircle, FaRedo, FaCrown, FaUserPlus, FaUserMinus } from 'react-icons/fa';

const TicTacToe = ({ socket, roomCode, playerId, playerName, players, isAdmin }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameStatus, setGameStatus] = useState('waiting');
  const [winner, setWinner] = useState(null);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [gameData, setGameData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleTicTacToeUpdate = (data) => {
      setGameData(data);
      setBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
      setGameStatus(data.status);
      setWinner(data.winner);
      setScores(data.scores || { X: 0, O: 0 });
      
      // Set current player's symbol
      if (data.playerSymbols && data.playerSymbols[playerId]) {
        setPlayerSymbol(data.playerSymbols[playerId]);
      } else {
        setPlayerSymbol(null);
      }
    };

    const handleTicTacToeStarted = () => {
      setGameStatus('waiting');
    };

    const handleTicTacToeError = (errorMsg) => {
      setError(errorMsg);
      setTimeout(() => setError(''), 3000);
    };

    socket.on('tictactoe_update', handleTicTacToeUpdate);
    socket.on('tictactoe_started', handleTicTacToeStarted);
    socket.on('tictactoe_error', handleTicTacToeError);

    return () => {
      socket.off('tictactoe_update', handleTicTacToeUpdate);
      socket.off('tictactoe_started', handleTicTacToeStarted);
      socket.off('tictactoe_error', handleTicTacToeError);
    };
  }, [socket, playerId]);

  const handleCellClick = (index) => {
    if (
      !board[index] && 
      playerSymbol === currentPlayer && 
      gameStatus === 'playing' &&
      playerSymbol
    ) {
      socket.emit('tictactoe_move', roomCode, index, playerId);
    }
  };

  const resetGame = () => {
    socket.emit('tictactoe_reset', roomCode);
  };

  const startGame = () => {
    socket.emit('start_tictactoe', roomCode);
  };

  const assignPlayer = (symbol) => {
    setError('');
    socket.emit('tictactoe_assign_player', roomCode, playerId, playerName, symbol);
  };

  const unassignPlayer = () => {
    socket.emit('tictactoe_unassign_player', roomCode, playerId);
  };

  const getPlayerName = (symbol) => {
    if (!gameData || !gameData.playerNames) return 'Waiting...';
    return gameData.playerNames[symbol] || 'Waiting...';
  };

  const isSymbolAvailable = (symbol) => {
    if (!gameData || !gameData.players) return true;
    return gameData.players[symbol] === null;
  };

  const renderCell = (value, index) => {
    return (
      <button
        key={index}
        className={`w-20 h-20 bg-indigo-700 border-2 border-indigo-600 rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${
          !value && playerSymbol === currentPlayer && gameStatus === 'playing' 
            ? 'hover:bg-indigo-600 cursor-pointer' 
            : 'cursor-default'
        } ${value === 'X' ? 'text-red-400' : value === 'O' ? 'text-green-400' : ''}`}
        onClick={() => handleCellClick(index)}
        disabled={!playerSymbol || gameStatus !== 'playing' || value || playerSymbol !== currentPlayer}
      >
        {value === 'X' ? <FaTimes className="text-3xl" /> : 
         value === 'O' ? <FaCircle className="text-2xl" /> : ''}
      </button>
    );
  };

  // Find admin and other players
  const adminPlayer = players.find(p => p.isAdmin);
  const otherPlayers = players.filter(p => !p.isAdmin && p.id !== playerId);

  return (
    <div className="bg-indigo-800 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Tic Tac Toe</h2>
      
      {error && (
        <div className="bg-red-600 text-white p-3 rounded-lg mb-4 text-center">
          {error}
        </div>
      )}

      {/* Player Assignment */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Player X */}
        <div className={`text-center p-3 rounded-lg ${
          gameData && gameData.players && gameData.players.X === playerId 
            ? 'bg-yellow-600 text-white' 
            : gameData && gameData.players && gameData.players.X
            ? 'bg-indigo-700'
            : 'bg-indigo-700'
        }`}>
          <div className="font-semibold">Player X</div>
          <div className="text-lg font-bold">{getPlayerName('X')}</div>
          {!playerSymbol && isSymbolAvailable('X') && (
            <button
              onClick={() => assignPlayer('X')}
              className="mt-2 bg-green-600 hover:bg-green-700 px-3 py-1 rounded flex items-center justify-center gap-1 w-full text-sm"
            >
              <FaUserPlus /> Join as X
            </button>
          )}
          {gameData && gameData.players && gameData.players.X === playerId && (
            <button
              onClick={unassignPlayer}
              className="mt-2 bg-red-600 hover:bg-red-700 px-3 py-1 rounded flex items-center justify-center gap-1 w-full text-sm"
            >
              <FaUserMinus /> Leave
            </button>
          )}
        </div>
        
        {/* Player O */}
        <div className={`text-center p-3 rounded-lg ${
          gameData && gameData.players && gameData.players.O === playerId 
            ? 'bg-yellow-600 text-white' 
            : gameData && gameData.players && gameData.players.O
            ? 'bg-indigo-700'
            : 'bg-indigo-700'
        }`}>
          <div className="font-semibold">Player O</div>
          <div className="text-lg font-bold">{getPlayerName('O')}</div>
          {!playerSymbol && isSymbolAvailable('O') && (
            <button
              onClick={() => assignPlayer('O')}
              className="mt-2 bg-green-600 hover:bg-green-700 px-3 py-1 rounded flex items-center justify-center gap-1 w-full text-sm"
            >
              <FaUserPlus /> Join as O
            </button>
          )}
          {gameData && gameData.players && gameData.players.O === playerId && (
            <button
              onClick={unassignPlayer}
              className="mt-2 bg-red-600 hover:bg-red-700 px-3 py-1 rounded flex items-center justify-center gap-1 w-full text-sm"
            >
              <FaUserMinus /> Leave
            </button>
          )}
        </div>
      </div>

      {/* Game Info */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center bg-indigo-700 p-3 rounded-lg">
          <div className="font-semibold">Score X</div>
          <div className="text-lg font-bold">{scores.X}</div>
        </div>
        
        <div className="text-center bg-indigo-700 p-3 rounded-lg">
          <div className="font-semibold">Status</div>
          <div className={`
            ${gameStatus === 'playing' ? 'text-green-400' : 
              gameStatus === 'ended' ? 'text-yellow-400' : 'text-gray-400'}
          `}>
            {gameStatus === 'waiting' ? 'Waiting for players...' : 
             gameStatus === 'playing' ? 'Playing' : 'Game Over'}
          </div>
        </div>
        
        <div className="text-center bg-indigo-700 p-3 rounded-lg">
          <div className="font-semibold">Score O</div>
          <div className="text-lg font-bold">{scores.O}</div>
        </div>
      </div>

      {/* Current Player Turn */}
      {gameStatus === 'playing' && (
        <div className="text-center mb-4">
          <p className="text-lg">
            {currentPlayer === playerSymbol ? (
              <span className="text-green-400 font-bold">Your turn!</span>
            ) : (
              <span className="text-yellow-400">{getPlayerName(currentPlayer)}'s turn</span>
            )}
          </p>
        </div>
      )}

      {/* Game Board */}
      <div className="flex justify-center mb-6">
        <div className="grid grid-cols-3 gap-2 bg-indigo-900 p-2 rounded-lg">
          {board.map((cell, index) => renderCell(cell, index))}
        </div>
      </div>

      {/* Game Result */}
      {gameStatus === 'ended' && winner && (
        <div className="text-center mb-4">
          <p className="text-xl font-bold">
            {winner === 'draw' ? "It's a draw!" : 
             winner === playerSymbol ? 
             <span className="text-green-400">You win! 🎉</span> : 
             <span className="text-red-400">{getPlayerName(winner)} wins!</span>}
          </p>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-3 justify-center">
        {isAdmin && gameStatus === 'waiting' && (
          <button
            onClick={startGame}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaCrown /> Start Game
          </button>
        )}
        
        {(gameStatus === 'ended' || isAdmin) && (
          <button
            onClick={resetGame}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaRedo /> {isAdmin ? 'Reset Game' : 'Play Again'}
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-indigo-300 text-sm">
        {!playerSymbol ? 
          "Choose a side (X or O) to play" :
          playerSymbol === currentPlayer && gameStatus === 'playing' ?
          "Click on an empty cell to make your move" :
          "Wait for your turn"}
      </div>

      {/* Players Info */}
      <div className="mt-4 bg-indigo-900 p-3 rounded-lg">
        <h3 className="font-semibold mb-2 text-center">Players in Room</h3>
        <div className="space-y-2">
          {players.map(player => (
            <div key={player.id} className="flex justify-between items-center">
              <span className={player.id === playerId ? 'text-yellow-300 font-bold' : ''}>
                {player.name} {player.isAdmin && <FaCrown className="inline text-yellow-400 ml-1" />}
              </span>
              <span className="text-sm text-indigo-300">
                {gameData && gameData.playerSymbols && gameData.playerSymbols[player.id] 
                  ? `Playing as ${gameData.playerSymbols[player.id]}` 
                  : 'Spectating'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;