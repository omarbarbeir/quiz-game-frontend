import React, { useState, useRef, useEffect } from 'react';
import { FaCrown, FaRedo, FaSignOutAlt, FaTimes, FaTrophy, FaVolumeUp, FaRandom, FaBell, FaPlay, FaEye, FaEyeSlash } from 'react-icons/fa';
import CategorySelector from './CategorySelector';

const AdminPanel = ({ 
  roomCode, 
  players, 
  activePlayer, 
  currentQuestion, 
  onScoreChange, 
  onPlayQuestion,
  onPlayRandomQuestion,
  onResetBuzzer, 
  onEndGame, 
  onLeaveRoom,
  onAdminBuzzer,
  gameStatus,
  categories,
  selectedCategory,
  onCategorySelect,
  socket,
  questions,
  buzzerLocked
}) => {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showQuestionText, setShowQuestionText] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showReloadWarning, setShowReloadWarning] = useState(false);
  const audioRef = useRef(null);
  const [pausedTime, setPausedTime] = useState(0);

  const activePlayerData = players.find(p => p.id === activePlayer);
  const adminPlayer = players.find(p => p.isAdmin);

  useEffect(() => {
    setShowQuestionText(false);
    setShowAnswer(false);
  }, [currentQuestion]);

  const handlePlayAudio = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setAudioPlaying(true))
        .catch(error => console.error("Audio play failed:", error));
      socket.emit('play_audio', roomCode);
    }
  };
  
  const handleContinueAudio = () => {
    if (audioRef.current && pausedTime > 0) {
      audioRef.current.currentTime = pausedTime;
      audioRef.current.play()
        .then(() => setAudioPlaying(true))
        .catch(error => console.error("Audio continue failed:", error));
      socket.emit('continue_audio', roomCode, pausedTime);
    }
  };

  const handlePauseAudio = () => {
    if (audioRef.current) {
      setPausedTime(audioRef.current.currentTime);
      audioRef.current.pause();
      setAudioPlaying(false);
      socket.emit('pause_audio', roomCode);
    }
  };

  const handleStopAudio = () => {
    if (audioRef.current) {
      setPausedTime(0);
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setAudioPlaying(false);
      socket.emit('stop_audio', roomCode);
    }
  };

  const handleReplayAudio = () => {
    handleStopAudio();
    setTimeout(handlePlayAudio, 100);
  };

  const handleNextQuestion = () => {
    onPlayRandomQuestion();
  };

  useEffect(() => {
    const handlePauseAudioEvent = () => {
      if (audioRef.current) {
        setPausedTime(audioRef.current.currentTime);
        audioRef.current.pause();
        setAudioPlaying(false);
      }
    };

    const handleContinueAudioEvent = (time) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        audioRef.current.play()
          .then(() => setAudioPlaying(true))
          .catch(error => console.error("Audio continue failed:", error));
      }
    };

    socket.on('pause_audio', handlePauseAudioEvent);
    socket.on('continue_audio', handleContinueAudioEvent);

    return () => {
      socket.off('pause_audio', handlePauseAudioEvent);
      socket.off('continue_audio', handleContinueAudioEvent);
    };
  }, [socket, roomCode]);

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
      {/* Reload Warning Modal */}
      {showReloadWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-indigo-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Warning!</h2>
            <p className="text-lg mb-6 text-center">
              Reloading will end the game for all players
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
                Continue Admin
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FaCrown className="text-yellow-400 text-2xl" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>
        
        <div className="bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-3">
          <span className="font-medium">Room Code:</span>
          <span className="font-mono text-xl bg-indigo-800 px-3 py-1 rounded">{roomCode}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Players</h2>
              <span className="bg-indigo-700 px-3 py-1 rounded-full">
                {players.length} {players.length === 1 ? 'player' : 'players'}
              </span>
            </div>
            
            <div className="space-y-3">
              {players.map(player => (
                <div 
                  key={player.id} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    activePlayer === player.id 
                      ? 'bg-gradient-to-r from-amber-700 to-amber-600' 
                      : 'bg-indigo-700'
                  } ${player.isAdmin ? 'border-2 border-yellow-400' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      player.isAdmin ? 'bg-yellow-500' : 'bg-indigo-600'
                    }`}>
                      {player.isAdmin ? <FaCrown className="text-yellow-800" /> : <span className="font-bold">{player.name.charAt(0)}</span>}
                    </div>
                    <span className="font-medium flex items-center gap-2">
                      {player.name} 
                      {player.isAdmin && <FaCrown className="text-yellow-400" />}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onScoreChange(player.id, -1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600"
                    >
                      <FaTimes />
                    </button>
                    
                    <span className="font-bold text-lg min-w-[40px] text-center">
                      {player.score}
                    </span>
                    
                    <button 
                      onClick={() => onScoreChange(player.id, 1)}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500 hover:bg-green-600"
                    >
                      ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Buzzer Control */}
          {activePlayer ? (
            <div className="bg-gradient-to-r from-amber-700 to-amber-600 rounded-xl p-4 shadow-lg animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-800 w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="font-bold text-xl">{activePlayerData?.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{activePlayerData?.name} is answering!</h3>
                    <p className="text-amber-100">Awaiting your scoring decision...</p>
                  </div>
                </div>
                
                <button 
                  onClick={onResetBuzzer}
                  className="bg-amber-700 hover:bg-amber-800 px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaRedo /> Reset Buzzer
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-800 w-12 h-12 rounded-full flex items-center justify-center">
                    <FaBell className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Buzzer Control</h3>
                    <p className="text-blue-100">Press to buzz as admin</p>
                  </div>
                </div>
                
                <button 
                  onClick={onAdminBuzzer}
                  disabled={buzzerLocked || !currentQuestion}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    buzzerLocked || !currentQuestion
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <FaBell /> Admin Buzz
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Game Controls */}
        <div className="space-y-6">
          {/* Category Selector */}
          <CategorySelector 
            categories={categories}
            onSelectCategory={onCategorySelect}
            selectedCategory={selectedCategory}
          />
          
          {/* Question Display */}
          {selectedCategory && (
            <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {categories.find(c => c.id === selectedCategory)?.name} Questions
                </h2>
                <button
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 rounded flex items-center gap-1"
                >
                  <FaRandom /> Next Question
                </button>
              </div>
              
              <div className="space-y-4">
                {currentQuestion ? (
                  <>
                    <div className="bg-indigo-700 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Question:</h3>
                      <p className="text-lg">{currentQuestion.text}</p>
                    </div>
                    
                    <div className="bg-green-700 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Answer:</h3>
                      <p className="text-lg font-bold">{currentQuestion.answer}</p>
                    </div>
                  </>
                ) : (
                  <div className="bg-indigo-700 p-4 rounded-lg text-center">
                    <p>Click "Next Question" to start</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Question Controls */}
          {currentQuestion && (
            <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
              <h2 className="text-xl font-semibold mb-3">Question Controls</h2>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handlePlayAudio}
                  disabled={audioPlaying}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                    audioPlaying 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <FaVolumeUp /> Play
                </button>
                
                <button
                  onClick={handleContinueAudio}
                  disabled={audioPlaying || pausedTime === 0}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                    audioPlaying || pausedTime === 0
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <FaPlay /> Continue
                </button>
                
                <button
                  onClick={handlePauseAudio}
                  disabled={!audioPlaying}
                  className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 ${
                    !audioPlaying 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  <FaVolumeUp /> Pause
                </button>
                
                <button
                  onClick={handleStopAudio}
                  className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <FaVolumeUp /> Stop
                </button>
                
                <button
                  onClick={handleReplayAudio}
                  className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  <FaVolumeUp /> Replay
                </button>
              </div>
              
              {/* Audio element for admin */}
              <audio 
                ref={audioRef}
                className="w-full mt-4"
                onPlay={() => setAudioPlaying(true)}
                onPause={() => setAudioPlaying(false)}
                onEnded={() => setAudioPlaying(false)}
                onError={(e) => console.error("Audio error:", e)}
              />
            </div>
          )}
          
          {/* Game Controls */}
          <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
            <h2 className="text-xl font-semibold mb-3">Game Controls</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onResetBuzzer}
                className="bg-amber-600 hover:bg-amber-700 py-3 rounded-lg flex flex-col items-center justify-center"
              >
                <FaRedo className="text-xl mb-1" />
                Reset Buzzer
              </button>
              
              <button
                onClick={onEndGame}
                className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 py-3 rounded-lg flex flex-col items-center justify-center"
              >
                <FaTrophy className="text-xl mb-1" />
                End Game
              </button>
            </div>
            
            <button
              onClick={() => setShowReloadWarning(true)}
              className="w-full mt-4 bg-indigo-700 hover:bg-indigo-800 py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <FaRedo /> Reload Page
            </button>
            
            <button
              onClick={onLeaveRoom}
              className="w-full mt-4 bg-indigo-700 hover:bg-indigo-900 py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <FaSignOutAlt /> Leave Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;