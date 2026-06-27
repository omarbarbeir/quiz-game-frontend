import React, { useState, useEffect } from 'react';

const MAX_ATTEMPTS = 6;
const ARABIC_LETTERS = 'أإآاإبتثجحخدذرزسشصضطظعغفقكلمنهويةىؤئء'.split(''); 
const NUMBERS = '0123456789'.split('');
const ALL_KEYS = [...ARABIC_LETTERS, ...NUMBERS];

const HangmanGame = ({ socket, roomCode, isAdmin }) => {
  const [state, setState] = useState({
    display: '',
    guessedLetters: [],
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    gameOver: false,
    won: false,
    word: '',
    hint: '', 
    remaining: 0,
  });

  useEffect(() => {
    if (!socket || !roomCode) return;

    const onState = (newState) => {
      if (!newState) return;
      setState(newState);
    };

    socket.on('hangman_state', onState);
    socket.emit('hangman_get_state', { roomCode });

    return () => {
      socket.off('hangman_state', onState);
    };
  }, [roomCode, socket]);

  const handleGuess = (char) => {
    if (state.gameOver) return;
    if (state.guessedLetters.includes(char)) return; 

    socket.emit('hangman_guess', { roomCode, letter: char });
  };

  const handleReset = () => {
    socket.emit('hangman_reset', { roomCode });
  };

  const renderHangman = () => {
    const stage = Math.min(state.attempts, MAX_ATTEMPTS);
    return (
      <div className="flex justify-center my-4">
        <svg viewBox="0 0 200 250" className="w-48 h-64 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
          <line x1="30" y1="230" x2="170" y2="230" stroke="#4b5563" strokeWidth="6" strokeLinecap="round" />
          <line x1="100" y1="230" x2="100" y2="20" stroke="#4b5563" strokeWidth="6" strokeLinecap="round" />
          <line x1="100" y1="20" x2="130" y2="20" stroke="#4b5563" strokeWidth="6" strokeLinecap="round" />
          <line x1="130" y1="20" x2="130" y2="40" stroke="#4b5563" strokeWidth="6" strokeLinecap="round" />
          <line x1="130" y1="40" x2="130" y2="42" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" />
          <g filter="url(#glow)">
            {stage >= 1 && <circle cx="100" cy="60" r="18" fill="none" stroke="#22d3ee" strokeWidth="4" />}
            {stage >= 2 && <line x1="100" y1="78" x2="100" y2="140" stroke="#22d3ee" strokeWidth="4" />}
            {stage >= 3 && <line x1="100" y1="100" x2="60" y2="120" stroke="#22d3ee" strokeWidth="4" />}
            {stage >= 4 && <line x1="100" y1="100" x2="140" y2="120" stroke="#22d3ee" strokeWidth="4" />}
            {stage >= 5 && <line x1="100" y1="140" x2="70" y2="180" stroke="#22d3ee" strokeWidth="4" />}
            {stage >= 6 && <line x1="100" y1="140" x2="130" y2="180" stroke="#22d3ee" strokeWidth="4" />}
          </g>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>
    );
  };

  const wordParts = state.display ? state.display.split('   ') : [];

  return (
    <div className="bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 rounded-xl p-6 shadow-2xl border border-cyan-500/20 max-w-full" dir="rtl">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-4 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
        🔠 الرجل المشنوق
      </h2>

      {renderHangman()}

      <div className="text-center my-4">
        
        {state.hint && (
          <div className="mb-4">
            <span className="inline-block bg-purple-900/50 text-purple-200 px-4 py-1.5 rounded-full text-sm sm:text-base font-bold border border-purple-500/30 shadow-sm shadow-purple-500/20">
              💡 تلميح: {state.hint}
            </span>
          </div>
        )}

        <div className="flex flex-wrap justify-center items-end gap-y-6 text-white bg-gray-900/60 p-6 rounded-xl border border-cyan-500/20 shadow-inner shadow-cyan-500/10 mb-6">
          {wordParts.map((wordPart, wordIndex, arr) => (
            <React.Fragment key={wordIndex}>
              <div className="flex gap-1.5 sm:gap-2 mx-1">
                {wordPart.split(' ').map((c, i) => (
                  <span 
                    key={i} 
                    className="flex justify-center items-center min-w-[2.5rem] sm:min-w-[3.5rem] h-12 sm:h-16 text-3xl sm:text-4xl font-bold border-b-4 border-cyan-500/60 bg-gray-800/40 rounded-t-lg shadow-sm pb-1"
                  >
                    {c === '_' ? '' : c}
                  </span>
                ))}
              </div>
              
              {wordIndex < arr.length - 1 && (
                <div className="flex items-center text-purple-400 font-bold text-3xl sm:text-4xl mx-2 sm:mx-4 opacity-80 select-none pb-2">
                  /
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 text-gray-400 text-xs sm:text-sm">
          <span className="bg-gray-800/50 px-3 py-1 rounded-lg">
            المحاولات: <span className={`font-bold ${state.attempts >= state.maxAttempts ? 'text-red-400' : 'text-cyan-300'}`}>{state.attempts}</span> / {state.maxAttempts}
          </span>
          <span className="bg-gray-800/50 px-3 py-1 rounded-lg">
            المتبقي حله: <span className="font-bold text-yellow-300">{state.remaining}</span>
          </span>
        </div>
      </div>

      {state.gameOver && (
        <div className={`p-4 rounded-xl mb-4 text-center ${state.won ? 'bg-green-600/80' : 'bg-red-600/80'} border-2 ${state.won ? 'border-green-400' : 'border-red-400'} shadow-lg animate-pulse`}>
          <p className="text-white font-bold text-base sm:text-xl">
            {state.won ? '🎉 تهانينا! لقد فزت!' : '😢 للأسف، خسرت! الكلمة كانت: ' + state.word}
          </p>
        </div>
      )}

      {/* تعديل زراير الحروف هنا كبرناها وظبطنا شكلها */}
      <div className="grid grid-cols-6 sm:grid-cols-7 gap-2 sm:gap-3 mb-4">
        {ALL_KEYS.map(char => {
          const isNum = !ARABIC_LETTERS.includes(char);
          const isGuessed = state.guessedLetters.includes(char);

          return (
            <button
              key={char}
              onClick={() => handleGuess(char)}
              disabled={state.gameOver || isGuessed}
              className={`
                flex justify-center items-center h-12 sm:h-16 text-xl sm:text-3xl rounded-xl font-bold transition-all duration-200 shadow-md
                ${isGuessed
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-40 line-through'
                  : isNum
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 hover:scale-105 text-white'
                    : 'bg-gradient-to-br from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 hover:scale-105 text-white'
                }
              `}
            >
              {char}
            </button>
          );
        })}
      </div>

      {isAdmin && (
        <button
          onClick={handleReset}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 p-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all duration-200 mt-2 hover:scale-[1.02]"
        >
          🔄 تغيير الكلمة (كلمة جديدة)
        </button>
      )}
    </div>
  );
};

export default HangmanGame;