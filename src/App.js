import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import "./App.css"
const socket = io("major-yak-omarelbarbeir-c17604b8.koyeb.app", {
  transports: ["websocket"]
});function App() {
  const [roomId, setRoomId] = useState('');
  const [showRoomId, setShowRoomId] = useState(false);
  const [player, setPlayer] = useState('');
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameStatus, setGameStatus] = useState('waiting');
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0 });

  useEffect(() => {
    socket.on('roomCreated', (id, player) => {
      setRoomId(id);
      setPlayer(player);
      setShowRoomId(true);
    });

    socket.on('joinedRoom', (id, player) => {
      setRoomId(id);
      setPlayer(player);
    });

    socket.on('gameUpdate', (data) => {
      setBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
      setGameStatus(data.status);
      setWinner(data.winner);
      setScores(data.scores || { X: 0, O: 0 }); // Add fallback
    });
    

    socket.on('joinError', (message) => {
      alert(message);
    });

    return () => {
      socket.off('roomCreated');
      socket.off('joinedRoom');
      socket.off('gameUpdate');
      socket.off('joinError');
    };
  }, []);

  const createRoom = () => {
    socket.emit('createRoom');
  };

  const joinRoom = () => {
    if(roomId) socket.emit('joinRoom', roomId);
  };

  const handleCellClick = (index) => {
    if(
      !board[index] && 
      player === currentPlayer && 
      gameStatus === 'playing'
    ) {
      socket.emit('move', roomId, index, player);
    }
  };

  const resetGame = () => {
    socket.emit('reset', roomId);
  };


  return(

    <div className="game-container bg-blue-200 h-screen">
    <h1 className='font-bold text-2xl'>Tic Tac Toe</h1>


    {showRoomId && (
        <div className="w-[350px] flex justify-center items-center flex-col p-4 gap-y-4 bg-white/60 rounded-lg shadow-md">
          <p className='font-bold'>Room ID: {roomId}</p>
          <button className='bg-red-600 hover:bg-red-800 text-white' onClick={() => navigator.clipboard.writeText(roomId)}>
            Copy Room ID
          </button>
        </div>
    )}
    
    {!player && (
      <div className="p-3 flex flex-col gap-y-5 m-3">

        <button className='bg-red-600 text-white hover:bg-red-800' onClick={createRoom}>Create New Game</button>
        <div className="join-section">
          <input
          className='border-none'
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <button className='bg-yellow-600 hover:bg-yellow-700 font-bold text-white' onClick={joinRoom}>Join Game</button>
        </div>
      </div>
    )}

    {player && (
      <div className="game-status">
        {gameStatus === 'waiting' && <p>Waiting for opponent...</p>}
        {gameStatus === 'playing' && (
          <p>{currentPlayer === player ? 'Your turn' : "Opponent's turn"}</p>        )}
        {gameStatus === 'ended' && (
          <p>{winner === 'draw' ? "It's a draw!" : `${winner} wins!`}</p>
        )}
      </div>
    )}

    <div className="board">
      {board.map((cell, index) => (
        <button
          key={index}
          className={`cell ${cell || 'empty'}`}
          onClick={() => handleCellClick(index)}
          disabled={!player || gameStatus !== 'playing' || cell}
        >
          {cell}
        </button>
      ))}
    </div>

    <div className="w-[200px] h-[100px] flex flex-col justify-center items-center font-bold text-xl bg-white/80 shadow-md rounded-md">
      <div className="score-item">
        <span className="score-label">Player X : </span>
        <span className="score-value">{scores?.X ?? 0}</span>
      </div>
      <div className="score-item">
        <span className="score-label">Player O : </span>
        <span className="score-value">{scores?.O ?? 0}</span>
      </div>
    </div>

    {gameStatus === 'ended' && (
      <button className='bg-red-600 mt-3 shadow-md' onClick={resetGame}>Play Again</button>
    )}
  </div>

  );
}

export default App;
