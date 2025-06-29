import React, { useState, useRef, useEffect } from 'react';
import { FaLock, FaSignOutAlt, FaTrophy, FaVolumeUp, FaEye, FaEyeSlash } from 'react-icons/fa';

const PlayerScreen = ({ 
  playerId,
  playerName, 
  roomCode, 
  players, 
  activePlayer, 
  currentQuestion, 
  onBuzzerPress, 
  buzzerLocked, 
  onLeaveRoom,
  gameStatus,
  socket
}) => {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showQuestionText, setShowQuestionText] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const audioRef = useRef(null);
  const isActivePlayer = activePlayer === playerId;
  const [pausedTime, setPausedTime] = useState(0);

  // Sort players by score (descending)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  // Handle socket events for audio control
  useEffect(() => {
    const handlePlayAudio = () => {
      if (audioRef.current && !activePlayer) {
        audioRef.current.play()
          .then(() => setAudioPlaying(true))
          .catch(error => console.error("Audio play failed:", error));
      }
    };
    
    const handlePauseAudio = () => {
      if (audioRef.current) {
        setPausedTime(audioRef.current.currentTime);
        audioRef.current.pause();
        setAudioPlaying(false);
      }
    };
    
    const handleContinueAudio = (time) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        audioRef.current.play()
          .then(() => setAudioPlaying(true))
          .catch(error => console.error("Audio continue failed:", error));
      }
    };
    
    socket.on('play_audio', handlePlayAudio);
    socket.on('pause_audio', handlePauseAudio);
    socket.on('continue_audio', handleContinueAudio);
    
    return () => {
      socket.off('play_audio', handlePlayAudio);
      socket.off('pause_audio', handlePauseAudio);
      socket.off('continue_audio', handleContinueAudio);
    };
  }, [socket, activePlayer]);
  
  // Set up audio element when question changes
  useEffect(() => {
    if (currentQuestion && audioRef.current) {
      const audioUrl = `${process.env.PUBLIC_URL}${currentQuestion.audio}`;
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      setAudioPlaying(false);
      setPausedTime(0);
    }
  }, [currentQuestion]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Quiz Player</h1>
          <p className="text-indigo-200">Welcome, {playerName}</p>
        </div>
        
        <div className="bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-3">
          <span className="font-medium">Room Code:</span>
          <span className="font-mono text-xl bg-indigo-800 px-3 py-1 rounded">{roomCode}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player List */}
        <div className="lg:col-span-1">
          <div className="bg-indigo-800 rounded-xl p-4 shadow-lg h-full">
            <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
            
            <div className="space-y-3">
              {sortedPlayers.map((player, index) => (
                <div 
                  key={player.id} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.id === playerId 
                      ? 'bg-gradient-to-r from-purple-700 to-indigo-700' 
                      : 'bg-indigo-700'
                  } ${
                    index === 0 ? 'border-2 border-amber-400' : ''
                  } ${player.isAdmin ? 'border-2 border-yellow-400' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-amber-500' : 'bg-indigo-600'
                    } ${player.isAdmin ? 'bg-yellow-500' : ''}`}>
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    <span className={`${player.id === playerId ? 'font-bold' : ''}`}>
                      {player.isAdmin ? "Quiz Master" : `Player ${index + 1}`}
                    </span>
                  </div>
                  <span className="font-bold">{player.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Game Area */}
        <div className="lg:col-span-2 space-y-6">
          {gameStatus === 'ended' ? (
            <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-6 shadow-lg text-center">
              <div className="flex justify-center mb-4">
                <FaTrophy className="text-5xl text-amber-300" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Game Ended!</h2>
              <p className="mb-6">The quiz master has ended the game.</p>
              
              {sortedPlayers.length > 0 && (
                <div className="bg-amber-800 bg-opacity-50 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-lg mb-3">Final Standings</h3>
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex flex-col items-center justify-center mb-4">
                      <span className="text-3xl font-bold text-amber-900">1</span>
                      <span className="text-xs font-bold text-amber-900">PLACE</span>
                    </div>
                  </div>
                  <p className="text-xl font-bold">
                    {sortedPlayers[0].isAdmin ? "Quiz Master" : "Player 1"} ({sortedPlayers[0].score} points)
                  </p>
                </div>
              )}

                    {showAnswer && currentQuestion && (
                      <div className="bg-indigo-700 p-3 rounded-lg mt-4 animate-fadeIn">
                        <p className="font-semibold">Answer:</p>
                        <p className="text-lg font-medium">{currentQuestion.answer}</p>
                      </div>
                    )}
              
              <button
                onClick={onLeaveRoom}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 py-3 rounded-lg font-bold"
              >
                Leave Game
              </button>
            </div>
          ) : (
            <>
              {/* Audio Status */}
              {currentQuestion ? (
                <div className="bg-indigo-800 rounded-xl p-6 shadow-lg text-center">
                  <div className="mb-4">
                    <div className="flex justify-center mb-3">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        audioPlaying 
                          ? 'bg-green-500 animate-pulse' 
                          : 'bg-indigo-600'
                      }`}>
                        <FaVolumeUp className="text-2xl" />
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold">Current Question</h2>
                    <p className="mt-2 text-indigo-300">
                      {audioPlaying ? "Audio is playing..." : "Waiting for audio..."}
                    </p>
                  </div>
                  
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => setShowQuestionText(!showQuestionText)}
                        className="bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg flex items-center gap-1"
                      >
                        {showQuestionText ? <FaEyeSlash /> : <FaEye />}
                        {showQuestionText ? ' Hide Question' : ' Show Question'}
                      </button>
                      <button
                        onClick={() => setShowAnswer(!showAnswer)}
                        className="bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg flex items-center gap-1"
                      >
                        {showAnswer ? <FaEyeSlash /> : <FaEye />}
                        {showAnswer ? ' Hide Answer' : ' Show Answer'}
                      </button>
                    </div>
                    
                    {showQuestionText && (
                      <div className="bg-indigo-700 p-3 rounded-lg">
                        <p className="font-semibold">Question:</p>
                        <p>{currentQuestion.text}</p>
                      </div>
                    )}
                    
                    {showAnswer && (
                      <div className="bg-indigo-700 p-3 rounded-lg">
                        <p className="font-semibold">Answer:</p>
                        <p>{currentQuestion.answer}</p>
                      </div>
                    )}
                  </div>
                  
                  {activePlayer && (
                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.play()
                            .then(() => setAudioPlaying(true))
                            .catch(error => console.error("Audio play failed:", error));
                        }
                      }}
                      className="bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 mx-auto mt-4"
                    >
                      <FaVolumeUp /> Play Question Again
                    </button>
                  )}
                  
                  {/* Audio element for player */}
                  <audio 
                    ref={audioRef}
                    className="w-full mt-4"
                    onPlay={() => setAudioPlaying(true)}
                    onPause={() => setAudioPlaying(false)}
                    onEnded={() => setAudioPlaying(false)}
                    onError={(e) => console.error("Audio error:", e)}
                  />
                </div>
              ) : (
                <div className="bg-indigo-800 rounded-xl p-8 shadow-lg text-center">
                  <h2 className="text-xl font-semibold mb-3">Waiting for Question</h2>
                  <p className="text-indigo-300">The quiz master will start the game soon...</p>
                </div>
              )}

              {/* Buzzer */}
              <div className="bg-gradient-to-br from-rose-800 to-pink-800 rounded-xl p-6 shadow-lg">
                <button
                  onClick={onBuzzerPress}
                  disabled={buzzerLocked || !currentQuestion || gameStatus !== 'playing' || activePlayer}
                  className={`w-full py-8 rounded-xl text-3xl font-bold flex flex-col items-center justify-center transform transition-all ${
                    isActivePlayer
                      ? 'bg-green-500' // Current player who buzzed
                      : activePlayer
                        ? 'bg-gray-700 cursor-not-allowed' // Someone else buzzed
                        : buzzerLocked || !currentQuestion || gameStatus !== 'playing'
                          ? 'bg-gray-700 cursor-not-allowed' // Other disabled states
                          : 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:scale-95'
                  }`}
                >
                  {isActivePlayer ? (
                    <span>YOU BUZZED!</span>
                  ) : activePlayer ? (
                    <>
                      <FaLock className="text-2xl mb-2" />
                      <span>BUZZER LOCKED</span>
                    </>
                  ) : buzzerLocked ? (
                    <>
                      <FaLock className="text-2xl mb-2" />
                      <span>BUZZER LOCKED</span>
                    </>
                  ) : (
                    <span>BUZZ IN!</span>
                  )}
                </button>
                
                {activePlayer && (
                  <div className="mt-4 text-center">
                    <p className="text-lg">
                      <span className="font-bold">
                        {players.find(p => p.id === activePlayer)?.isAdmin 
                          ? "Quiz Master" 
                          : "A Player"
                        } buzzed in!
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
          
          <button
            onClick={onLeaveRoom}
            className="w-full bg-indigo-700 hover:bg-indigo-900 py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <FaSignOutAlt /> Leave Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerScreen;