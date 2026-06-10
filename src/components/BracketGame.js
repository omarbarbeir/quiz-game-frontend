import React, { useState, useEffect } from 'react';
import { FaRandom, FaRedo, FaArrowRight, FaTimes } from 'react-icons/fa';

const BracketGame = ({ socket, roomCode, currentPlayer, isAdmin }) => {
  const [gameState, setGameState] = useState(null);
  const [inputs, setInputs] = useState(Array(16).fill(''));
  const [votedMatches, setVotedMatches] = useState({});

  useEffect(() => {
    if (!socket) return;
    socket.emit('bracket_init', { roomCode });
    socket.on('bracket_state', (state) => {
      setGameState(state);
      setVotedMatches({});
    });
    return () => socket.off('bracket_state');
  }, [socket, roomCode]);

  const handleInputChange = (index, value) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const randomize = () => {
    const names = inputs.filter(name => name.trim() !== '');
    if (names.length === 0) return;
    socket.emit('bracket_randomize', { roomCode, names });
  };

  const resetBracket = () => {
    socket.emit('bracket_reset', { roomCode });
    setInputs(Array(16).fill(''));
  };

  const vote = (roundIndex, matchIndex, choice) => {
    const key = `${roundIndex}-${matchIndex}`;
    if (votedMatches[key]) return;
    socket.emit('bracket_vote', { roomCode, roundIndex, matchIndex, choice, playerId: currentPlayer?.id });
    setVotedMatches(prev => ({ ...prev, [key]: true }));
  };

  const nextRound = () => {
    socket.emit('bracket_next_round', { roomCode });
  };

  if (!gameState) {
    return <div className="bg-gray-900 rounded-xl p-6 text-center text-white text-2xl">جاري تحميل دور الـ١٦...</div>;
  }

  const { rounds, currentRoundIndex } = gameState;
  const currentRound = rounds[currentRoundIndex];
  const roundNames = ['دور الـ١٦', 'ربع النهائي', 'نصف النهائي', 'النهائي'];

  const allMatchesHaveVotes = currentRound.matches.length > 0 &&
    currentRound.matches.every(m => m.voters && m.voters.length > 0);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 rounded-xl p-6 shadow-2xl w-full border border-cyan-500/20">
      <h2 className="text-3xl font-extrabold text-center mb-6">
        <span className="bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent">
          🏆 دور الـ١٦ 🏆
        </span>
      </h2>

      {isAdmin && (
        <div className="mb-6 flex flex-wrap gap-2 justify-center">
          {currentRoundIndex === 0 && currentRound.matches.length === 0 && (
            <>
              <div className="grid grid-cols-4 gap-2 mb-4 w-full">
                {inputs.map((value, idx) => (
                  <input
                    key={idx}
                    type="text"
                    value={value}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    placeholder={`إسم ${idx + 1}`}
                    className="bg-gray-800/70 border border-gray-600 focus:border-cyan-500 text-white rounded-lg px-3 py-2 text-sm outline-none transition-colors"
                    dir="rtl"
                  />
                ))}
              </div>
              <button onClick={randomize} className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-purple-500/20">
                <FaRandom /> توزيع عشوائي
              </button>
            </>
          )}

          <button onClick={resetBracket} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg flex items-center gap-2 font-bold">
            <FaRedo /> إعادة تعيين
          </button>

          {allMatchesHaveVotes && currentRoundIndex < 3 && (
            <button onClick={nextRound} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-yellow-500/20">
              الانتقال للدور التالي <FaArrowRight />
            </button>
          )}
        </div>
      )}

      {currentRound.matches.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-purple-500/30">
          <div className="flex justify-center min-w-[600px] py-4">
            {/* Left side */}
            <div className="flex flex-col justify-around mr-4 sm:mr-8">
              {currentRound.matches
                .filter((_, idx) => idx < currentRound.matches.length / 2)
                .map((match, relativeIdx) => {
                  const matchIdx = relativeIdx;
                  const key = `${currentRoundIndex}-${matchIdx}`;
                  const hasVoted = votedMatches[key];
                  const isMatchActive = currentRoundIndex === gameState.currentRoundIndex && !match.winner;
                  return (
                    <MatchCard
                      key={matchIdx}
                      match={match}
                      hasVoted={hasVoted}
                      isMatchActive={isMatchActive}
                      onVote={(choice) => vote(currentRoundIndex, matchIdx, choice)}
                    />
                  );
                })}
            </div>

            {/* Right side */}
            <div className="flex flex-col justify-around ml-4 sm:ml-8">
              {currentRound.matches
                .filter((_, idx) => idx >= currentRound.matches.length / 2)
                .map((match, relativeIdx) => {
                  const matchIdx = currentRound.matches.length / 2 + relativeIdx;
                  const key = `${currentRoundIndex}-${matchIdx}`;
                  const hasVoted = votedMatches[key];
                  const isMatchActive = currentRoundIndex === gameState.currentRoundIndex && !match.winner;
                  return (
                    <MatchCard
                      key={matchIdx}
                      match={match}
                      hasVoted={hasVoted}
                      isMatchActive={isMatchActive}
                      onVote={(choice) => vote(currentRoundIndex, matchIdx, choice)}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400">
          {isAdmin ? 'أدخل أسماء الفرق واضغط "توزيع عشوائي"' : 'بانتظار المسؤول لبدء الدورة'}
        </div>
      )}

      <div className="text-center text-gray-300 text-sm mt-4">
        {roundNames[currentRoundIndex]}
      </div>
    </div>
  );
};

// ── Restyled MatchCard ─────────────────────────────────────────
const MatchCard = ({ match, hasVoted, isMatchActive, onVote }) => {
  return (
    <div className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 mb-4 w-52 shadow-lg">
      <div className="flex flex-col gap-3">
        {/* Team 1 */}
        <div className={`py-3 px-4 rounded-xl text-center transition-all duration-300 ${
          match.winner === match.team1
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg shadow-green-500/20'
            : isMatchActive
              ? 'bg-gray-700/80 border-2 border-cyan-500'
              : 'bg-gray-700/80 border border-gray-600'
        }`}>
          <span className="text-white font-bold text-sm">{match.team1}</span>
          {match.votes && (
            <span className="text-xs text-gray-300 block mt-1">
              {match.votes[match.team1] || 0} صوت
            </span>
          )}
        </div>

        <span className="text-gray-400 text-center text-xs font-bold">⚔️ VS ⚔️</span>

        {/* Team 2 */}
        <div className={`py-3 px-4 rounded-xl text-center transition-all duration-300 ${
          match.winner === match.team2
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg shadow-green-500/20'
            : isMatchActive
              ? 'bg-gray-700/80 border-2 border-pink-500'
              : 'bg-gray-700/80 border border-gray-600'
        }`}>
          <span className="text-white font-bold text-sm">{match.team2}</span>
          {match.votes && (
            <span className="text-xs text-gray-300 block mt-1">
              {match.votes[match.team2] || 0} صوت
            </span>
          )}
        </div>
      </div>

      {/* Voting buttons */}
      {isMatchActive && (
        <div className="mt-3 flex gap-2 justify-center">
          <button
            onClick={() => onVote(match.team1)}
            disabled={hasVoted}
            className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all duration-200 ${
              hasVoted
                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-500/20'
            }`}
          >
            تصويت
          </button>
          <button
            onClick={() => onVote(match.team2)}
            disabled={hasVoted}
            className={`py-1.5 px-4 rounded-lg text-xs font-bold transition-all duration-200 ${
              hasVoted
                ? 'bg-gray-600 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-md shadow-purple-500/20'
            }`}
          >
            تصويت
          </button>
        </div>
      )}

      {/* Winner announcement */}
      {match.winner && (
        <div className="mt-3 text-center">
          <span className="text-yellow-300 text-sm font-bold flex items-center justify-center gap-1">
            <FaArrowRight /> {match.winner}
          </span>
        </div>
      )}

      {hasVoted && !match.winner && (
        <div className="mt-2 text-center text-green-400 text-xs">✓ تم التصويت</div>
      )}
    </div>
  );
};

export default BracketGame;