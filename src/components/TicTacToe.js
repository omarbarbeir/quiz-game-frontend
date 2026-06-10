import React, { useState, useEffect } from 'react';
import { FaTimes, FaCircle, FaRedo, FaHome } from 'react-icons/fa';

const TicTacToe = ({ socket, roomCode, players, currentPlayer, isAdmin, onExit }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState('X');
  const [winner, setWinner] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerX, setPlayerX] = useState(null);
  const [playerO, setPlayerO] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('tic_tac_toe_state', (state) => {
      setBoard(state.board);
      setTurn(state.turn);
      setWinner(state.winner);
      setPlayerX(state.playerX);
      setPlayerO(state.playerO);
      setGameStarted(true);
    });

    socket.on('tic_tac_toe_reset', () => {
      setBoard(Array(9).fill(null));
      setTurn('X');
      setWinner(null);
      setGameStarted(true);
    });

    return () => {
      socket.off('tic_tac_toe_state');
      socket.off('tic_tac_toe_reset');
    };
  }, [socket]);

  const startGame = () => {
    if (!isAdmin) return;
    const nonAdmins = players.filter(p => !p.isAdmin);
    if (nonAdmins.length < 2) return alert('تحتاج لاعبين اثنين على الأقل');
    const xPlayer = nonAdmins[0];
    const oPlayer = nonAdmins[1];
    socket.emit('tic_tac_toe_start', { roomCode, playerX: xPlayer, playerO: oPlayer });
  };

  const handleClick = (index) => {
    if (board[index] || winner || !gameStarted) return;
    if (currentPlayer && (
      (turn === 'X' && currentPlayer.id !== playerX?.id) ||
      (turn === 'O' && currentPlayer.id !== playerO?.id)
    )) return;

    socket.emit('tic_tac_toe_move', { roomCode, index, playerId: currentPlayer?.id });
  };

  const resetGame = () => {
    socket.emit('tic_tac_toe_reset', { roomCode });
  };

  if (!gameStarted) {
    return (
      <div className="relative p-[2px] rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 animate-shimmer rounded-xl" />
        <div className="relative bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 rounded-xl p-8 text-center">
          <h2 className="text-3xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
              ⭕❌ Tic Tac Toe
            </span>
          </h2>
          {isAdmin ? (
            <button onClick={startGame} className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-cyan-500/20">
              بدء اللعبة
            </button>
          ) : (
            <p className="text-gray-300 text-lg">بانتظار المسؤول لبدء اللعبة…</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-[2px] rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 animate-shimmer rounded-xl" />
      <div className="relative bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 rounded-xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-extrabold">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 bg-clip-text text-transparent">
              ⭕❌ Tic Tac Toe
            </span>
          </h2>
          <div className="flex gap-2">
            {isAdmin && (
              <button onClick={resetGame} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-colors">
                <FaRedo /> إعادة
              </button>
            )}
            {onExit && (
              <button onClick={onExit} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <FaHome /> خروج
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-4 text-lg">
            <span className={`font-bold ${turn === 'X' ? 'text-cyan-400' : 'text-gray-400'}`}>
              {playerX?.name || 'X'} (X)
            </span>
            <span className="text-gray-500">VS</span>
            <span className={`font-bold ${turn === 'O' ? 'text-pink-400' : 'text-gray-400'}`}>
              {playerO?.name || 'O'} (O)
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            الدور: <span className="font-bold text-white">{turn === 'X' ? playerX?.name : playerO?.name}</span>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {board.map((cell, idx) => (
            <button
              key={idx}
              onClick={() => handleClick(idx)}
              disabled={!!cell || !!winner}
              className="h-20 bg-gray-800/50 hover:bg-gray-700/60 disabled:opacity-50 rounded-xl flex items-center justify-center text-4xl font-bold border border-purple-500/20 transition-all duration-200 hover:border-cyan-400/50"
            >
              {cell === 'X' && <FaTimes className="text-cyan-400" />}
              {cell === 'O' && <FaCircle className="text-pink-400" />}
            </button>
          ))}
        </div>

        {winner && (
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-400/30">
            <p className="text-2xl font-bold text-center text-yellow-300">
              {winner === 'X' ? `${playerX?.name} فاز! 🎉` : winner === 'O' ? `${playerO?.name} فاز! 🎉` : 'تعادل! 🤝'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicTacToe;