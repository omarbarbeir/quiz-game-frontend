import React, { useState, useRef, useEffect } from 'react';
import { FaLock, FaSignOutAlt, FaTrophy, FaVolumeUp, FaRedo, FaImage } from 'react-icons/fa';

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
  socket,
  isAdmin,
  setCurrentQuestion,
  setActivePlayer,
  setBuzzerLocked,
  setGameStatus
}) => {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showReloadWarning, setShowReloadWarning] = useState(false);
  const audioRef = useRef(null);
  const isActivePlayer = activePlayer === playerId;
  const [pausedTime, setPausedTime] = useState(0);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  // Only show image if it's from Random Photos category
  const shouldShowImage = currentQuestion?.image && 
                         currentQuestion?.category === 'random-photos' && 
                         currentQuestion?.subcategory;
  
  useEffect(() => {
    const handlePlayAudio = () => {
      if (audioRef.current && !activePlayer && !shouldShowImage) {
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
    
    // Handle individual photo questions
    const handlePlayerPhotoQuestion = (photoData) => {
      if (photoData.playerId === playerId) {
        setCurrentQuestion(photoData);
        setActivePlayer(null);
        setBuzzerLocked(false);
        setGameStatus('playing');
      }
    };
    
    socket.on('play_audio', handlePlayAudio);
    socket.on('pause_audio', handlePauseAudio);
    socket.on('continue_audio', handleContinueAudio);
    socket.on('player_photo_question', handlePlayerPhotoQuestion);
    
    return () => {
      socket.off('play_audio', handlePlayAudio);
      socket.off('pause_audio', handlePauseAudio);
      socket.off('continue_audio', handleContinueAudio);
      socket.off('player_photo_question', handlePlayerPhotoQuestion);
    };
  }, [socket, activePlayer, currentQuestion, shouldShowImage, playerId, setCurrentQuestion, setActivePlayer, setBuzzerLocked, setGameStatus]);
  
  useEffect(() => {
    if (currentQuestion && audioRef.current && !shouldShowImage) {
      const audioUrl = `${process.env.PUBLIC_URL}${currentQuestion.audio}`;
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      setAudioPlaying(false);
      setPausedTime(0);
    }
  }, [currentQuestion, shouldShowImage]);

  return (
    <div className="max-w-6xl mx-auto">
      {showReloadWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-indigo-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Warning!</h2>
            <p className="text-lg mb-6 text-center">
              If you reload this page you will quit and lose your score
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowReloadWarning(false);
                  window.location.reload();
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold"
              >
                Quit Anyway
              </button>
              <button
                onClick={() => setShowReloadWarning(false)}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold"
              >
                Stay in Game
              </button>
            </div>
          </div>
        </div>
      )}

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

        {/* <div className="lg:col-span-1">
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
        </div> */}
        
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

              <button
                onClick={onLeaveRoom}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 py-3 rounded-lg font-bold"
              >
                Leave Game
              </button>
            </div>
          ) : (
            <>
              {shouldShowImage ? (
                <div className="bg-indigo-800 rounded-xl p-6 shadow-lg text-center">
                  <div className="mb-4">
                    <div className="flex justify-center mb-3">
                      <FaImage className="text-4xl text-indigo-300" />
                    </div>
                    <h2 className="text-xl font-semibold">
                      Random Photos: {currentQuestion.subcategory}
                    </h2>
                    <p className="text-indigo-300 mt-2">
                      Your unique photo to identify
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <img 
                      src={`${process.env.PUBLIC_URL}${currentQuestion.image}`} 
                      alt="Your unique question" 
                      className="h-[590px] w-[530px] mx-auto rounded-lg"
                    />
                      <div className="mt-4 bg-green-600 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Answer:</h3>
                        <p className="text-3xl font-bold">{currentQuestion.answer}</p>
                      </div>
                  </div>
                </div>
              ) : currentQuestion?.audio ? (
                <div className="bg-indigo-800 rounded-xl p-6 shadow-lg text-center">
                  <div className="mb-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                      audioPlaying 
                        ? 'bg-green-500 animate-pulse' 
                        : 'bg-indigo-600'
                    }`}>
                      <FaVolumeUp className="text-2xl" />
                    </div>
                    <h2 className="text-xl font-semibold">Current Question</h2>
                    <p className="mt-2 text-indigo-300">
                      {audioPlaying ? "Audio is playing..." : "Waiting for audio..."}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    {activePlayer && (
                      <button
                        onClick={() => {
                          if (audioRef.current) {
                            audioRef.current.play()
                              .then(() => setAudioPlaying(true))
                              .catch(error => console.error("Audio play failed:", error));
                          }
                        }}
                        className="bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg flex items-center justify-center gap-2 mx-auto"
                      >
                        <FaVolumeUp /> Play Question Again
                      </button>
                    )}
                    
                    <audio 
                      ref={audioRef}
                      className="w-full mt-4"
                      onPlay={() => setAudioPlaying(true)}
                      onPause={() => setAudioPlaying(false)}
                      onEnded={() => setAudioPlaying(false)}
                      onError={(e) => console.error("Audio error:", e)}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-indigo-800 rounded-xl p-8 shadow-lg text-center">
                  <h2 className="text-xl font-semibold">Waiting for Question</h2>
                  <p className="text-indigo-300">The quiz master will start the game soon...</p>
                </div>
              )}

              <div className="bg-gradient-to-br from-rose-800 to-pink-800 rounded-xl p-6 shadow-lg">
                <button
                  onClick={onBuzzerPress}
                  disabled={buzzerLocked || !currentQuestion || gameStatus !== 'playing' || activePlayer}
                  className={`w-full py-8 rounded-xl text-3xl font-bold flex flex-col items-center justify-center transform transition-all ${
                    isActivePlayer
                      ? 'bg-green-500'
                      : activePlayer
                        ? 'bg-gray-700 cursor-not-allowed'
                        : buzzerLocked || !currentQuestion || gameStatus !== 'playing'
                          ? 'bg-gray-700 cursor-not-allowed'
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
          
          {/* <button
            onClick={() => setShowReloadWarning(true)}
            className="mt-4 bg-indigo-700 hover:bg-indigo-800 py-2 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <FaRedo /> Reload Page
          </button> */}
          
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