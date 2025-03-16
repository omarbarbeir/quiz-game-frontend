// import React, { useState, useEffect } from 'react';
// import io from 'socket.io-client';
// import "./App.css"
// const socket = io('http://localhost:3001');

// function App() {

//   const [roomId, setRoomId] = useState('');
//   const [showRoomId, setShowRoomId] = useState(false);
//   const [player, setPlayer] = useState('');
//   const [board, setBoard] = useState(Array(9).fill(null));
//   const [currentPlayer, setCurrentPlayer] = useState('X');
//   const [gameStatus, setGameStatus] = useState('waiting');
//   const [winner, setWinner] = useState(null);

//   useEffect(() => {
//     socket.on('roomCreated', (id, player) => {
//       setRoomId(id);
//       setPlayer(player);
//       setShowRoomId(true);
//     });

//     socket.on('joinedRoom', (id, player) => {
//       setRoomId(id);
//       setPlayer(player);
//     });

//     socket.on('gameUpdate', (data) => {
//       setBoard(data.board);
//       setCurrentPlayer(data.currentPlayer);
//       setGameStatus(data.status);
//       setWinner(data.winner);
//     });

//     socket.on('joinError', (message) => {
//       alert(message);
//     });

//     return () => {
//       socket.off('roomCreated');
//       socket.off('joinedRoom');
//       socket.off('gameUpdate');
//       socket.off('joinError');
//     };
//   }, []);

//   const createRoom = () => {
//     socket.emit('createRoom');
//   };

//   const joinRoom = () => {
//     if(roomId) socket.emit('joinRoom', roomId);
//   };

//   const handleCellClick = (index) => {
//     if(
//       !board[index] && 
//       player === currentPlayer && 
//       gameStatus === 'playing'
//     ) {
//       socket.emit('move', roomId, index, player);
//     }
//   };

//   const resetGame = () => {
//     socket.emit('reset', roomId);
//   };


//   return(

//     <div className="game-container">
//     <h1>Tic Tac Toe</h1>


//     {showRoomId && (
//         <div className="room-id">
//           <p>Room ID: {roomId}</p>
//           <button onClick={() => navigator.clipboard.writeText(roomId)}>
//             Copy Room ID
//           </button>
//         </div>
//     )}
    
//     {!player && (
//       <div className="room-controls">
//         <button onClick={createRoom}>Create New Game</button>
//         <div className="join-section">
//           <input
//             type="text"
//             placeholder="Enter Room ID"
//             value={roomId}
//             onChange={(e) => setRoomId(e.target.value)}
//           />
//           <button onClick={joinRoom}>Join Game</button>
//         </div>
//       </div>
//     )}

//     {player && (
//       <div className="game-status">
//         {gameStatus === 'waiting' && <p>Waiting for opponent...</p>}
//         {gameStatus === 'playing' && (
//           <p>{currentPlayer === player ? 'Your turn' : "Opponent's turn"}</p>        )}
//         {gameStatus === 'ended' && (
//           <p>{winner === 'draw' ? "It's a draw!" : `${winner} wins!`}</p>
//         )}
//       </div>
//     )}

//     <div className="board">
//       {board.map((cell, index) => (
//         <button
//           key={index}
//           className={`cell ${cell || 'empty'}`}
//           onClick={() => handleCellClick(index)}
//           disabled={!player || gameStatus !== 'playing' || cell}
//         >
//           {cell}
//         </button>
//       ))}
//     </div>

//     {gameStatus === 'ended' && (
//       <button onClick={resetGame}>Play Again</button>
//     )}
//   </div>

//   );
// }

// export default App;
