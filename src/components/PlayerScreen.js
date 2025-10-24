import React, { useState, useRef, useEffect } from 'react';
import { FaLock, FaSignOutAlt, FaTrophy, FaVolumeUp, FaRedo } from 'react-icons/fa';
import Whiteboard from './Whiteboard';
import CardGame from './CardGame';

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
  setGameStatus,
  cardGameState,
  connectionStatus
}) => {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showReloadWarning, setShowReloadWarning] = useState(false);
  const audioRef = useRef(null);
  const isActivePlayer = activePlayer === playerId;
  const [pausedTime, setPausedTime] = useState(0);
  const [cardGameError, setCardGameError] = useState('');

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  const shouldShowImage = currentQuestion?.image && 
                         currentQuestion?.category === 'random-photos' && 
                         currentQuestion?.subcategory;
  
  const isReverseQuestion = currentQuestion?.category === 'reverse';
  
  useEffect(() => {
    const handlePlayAudio = () => {
      if (audioRef.current && !activePlayer && !shouldShowImage && !isReverseQuestion) {
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
    
    const handlePlayerPhotoQuestion = (photoData) => {
      if (photoData.playerId === playerId) {
        setCurrentQuestion(photoData);
        setActivePlayer(null);
        setBuzzerLocked(false);
        setGameStatus('playing');
      }
    };

    const handleCardGameStateUpdate = (gameState) => {
      console.log('🃏 Player received card game state:', gameState);
      setCardGameError('');
      if (gameState && gameState.gameStarted) {
        setCurrentQuestion({
          id: 'card-game',
          category: 'card-game',
          text: 'لعبة البطاقات',
          answer: ''
        });
        setGameStatus('playing');
      }
    };

    const handleCardGameError = (errorData) => {
      console.error('Card game error in player:', errorData);
      setCardGameError(errorData.message);
      
      if (errorData.message.includes('Game not found') || errorData.message.includes('Room not found')) {
        // Reset the game state
        setCurrentQuestion(null);
        setGameStatus('lobby');
      }
    };
    
    socket.on('play_audio', handlePlayAudio);
    socket.on('pause_audio', handlePauseAudio);
    socket.on('continue_audio', handleContinueAudio);
    socket.on('player_photo_question', handlePlayerPhotoQuestion);
    socket.on('card_game_state_update', handleCardGameStateUpdate);
    socket.on('card_game_error', handleCardGameError);
    
    return () => {
      socket.off('play_audio', handlePlayAudio);
      socket.off('pause_audio', handlePauseAudio);
      socket.off('continue_audio', handleContinueAudio);
      socket.off('player_photo_question', handlePlayerPhotoQuestion);
      socket.off('card_game_state_update', handleCardGameStateUpdate);
      socket.off('card_game_error', handleCardGameError);
    };
  }, [socket, activePlayer, currentQuestion, shouldShowImage, playerId, setCurrentQuestion, setActivePlayer, setBuzzerLocked, setGameStatus, isReverseQuestion]);
  
  useEffect(() => {
    if (currentQuestion && audioRef.current && !shouldShowImage && !isReverseQuestion) {
      const audioUrl = `${process.env.PUBLIC_URL}${currentQuestion.audio}`;
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      setAudioPlaying(false);
      setPausedTime(0);
    }
  }, [currentQuestion, shouldShowImage, isReverseQuestion]);

  // Render CardGame when in card game mode
  if (currentQuestion?.category === 'card-game' || cardGameState?.gameStarted) {
    const currentPlayer = players.find(p => p.id === playerId);
    
    if (!currentPlayer) {
      return (
        <div className="bg-red-600 rounded-xl p-6 text-center">
          <h2 className="text-xl font-bold">خطأ: لم يتم العثور على بيانات اللاعب</h2>
          <p>يرجى إعادة تحميل الصفحة أو مغادرة الغرفة والعودة مرة أخرى</p>
          <button
            onClick={onLeaveRoom}
            className="mt-4 bg-indigo-700 hover:bg-indigo-900 py-2 px-4 rounded-lg"
          >
            مغادرة الغرفة
          </button>
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-right">لاعب لعبة البطاقات</h1>
            <p className="text-indigo-200 text-right">مرحبًا، {playerName}</p>
          </div>
          
          <div className="bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl bg-indigo-800 px-3 py-1 rounded">{roomCode}</span>
          </div>
        </div>

        {cardGameError && (
          <div className="bg-red-600 rounded-lg p-3 mb-4">
            <p className="font-bold">خطأ في لعبة البطاقات:</p>
            <p>{cardGameError}</p>
            <button
              onClick={() => setCardGameError('')}
              className="mt-2 bg-red-700 hover:bg-red-800 py-1 px-3 rounded"
            >
              إغلاق
            </button>
          </div>
        )}

        <CardGame 
          socket={socket}
          roomCode={roomCode}
          players={players}
          currentPlayer={currentPlayer}
          isAdmin={false}
        />

        <button
          onClick={onLeaveRoom}
          className="w-full mt-6 bg-indigo-700 hover:bg-indigo-900 py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <FaSignOutAlt /> مغادرة الغرفة
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showReloadWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-indigo-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center">تحذير!</h2>
            <p className="text-lg mb-6 text-center">
              إذا قمت بإعادة تحميل الصفحة، ستخرج وستفقد نقاطك
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowReloadWarning(false);
                  window.location.reload();
                }}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold"
              >
                خروج على أي حال
              </button>
              <button
                onClick={() => setShowReloadWarning(false)}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold"
              >
                البقاء في اللعبة
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-right">لاعب المسابقة</h1>
          <p className="text-indigo-200 text-right">مرحبًا، {playerName}</p>
        </div>
        
        <div className="bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-3">
          <span className="font-medium">رمز الغرفة:</span>
          <span className="font-mono text-xl bg-indigo-800 px-3 py-1 rounded">{roomCode}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {gameStatus === 'ended' ? (
            <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-6 shadow-lg text-center">
              <div className="flex justify-center mb-4">
                <FaTrophy className="text-5xl text-amber-300" />
              </div>
              <h2 className="text-2xl font-bold mb-2">انتهت اللعبة!</h2>
              <p className="mb-6">أنهى المسؤول المسابقة.</p>
              
              {sortedPlayers.length > 0 && (
                <div className="bg-amber-800 bg-opacity-50 rounded-lg p-4 mb-6">
                  <h3 className="font-bold text-lg mb-3">النتائج النهائية</h3>
                  <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex flex-col items-center justify-center mb-4">
                      <span className="text-3xl font-bold text-amber-900">1</span>
                      <span className="text-xs font-bold text-amber-900">المركز</span>
                    </div>
                  </div>
                  <p className="text-xl font-bold">
                    {sortedPlayers[0].isAdmin ? "المسؤول" : "اللاعب الأول"} ({sortedPlayers[0].score} نقاط)
                  </p>
                </div>
              )}

              <button
                onClick={onLeaveRoom}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 py-3 rounded-lg font-bold"
              >
                مغادرة اللعبة
              </button>
            </div>
          ) : currentQuestion?.category === 'whiteboard' ? (
            <div className="bg-indigo-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-center">السبورة التعاونية</h2>
              <Whiteboard socket={socket} roomCode={roomCode} isAdmin={false} />
            </div>
          ) : (
            <>
              {shouldShowImage ? (
                <div className="bg-indigo-800 rounded-xl p-6 shadow-lg text-center">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">
                      أنا مين: {currentQuestion.subcategory}
                    </h2>
                    <p className="text-indigo-300 mt-2">
                      صورتك الفريدة لتتعرف عليها
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <div className="aspect-w-1 aspect-h-1">
                      <img 
                        src={`${process.env.PUBLIC_URL}${currentQuestion.image}`} 
                        alt="Your unique question" 
                        className="object-contain rounded-lg max-h-[60vh] mx-auto"
                      />
                    </div>
                      <div className="mt-4 bg-green-600 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">الإجابة:</h3>
                        <p className="text-3xl font-bold">{currentQuestion.answer}</p>
                      </div>
                  </div>
                </div>
              ) : isReverseQuestion ? (
                <div className="bg-indigo-800 rounded-xl p-6 shadow-lg">
                  <div className="mb-4 text-center">
                    <h2 className="text-xl font-semibold">الكلمات المعكوسة</h2>
                    <p className="text-indigo-300 mt-2">تحدي الكلمات المعكوسة</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2 text-center">السؤال:</h3>
                    <p className="text-2xl font-bold text-center mb-6">{currentQuestion.text}</p>
                    
                    <div className="bg-indigo-900 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2 text-center">تلميح:</h3>
                      <p className="text-lg text-center">{currentQuestion.bounc}</p>
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
                    <h2 className="text-xl font-semibold">السؤال الحالي</h2>
                    <p className="mt-2 text-indigo-300">
                      {audioPlaying ? "الصوت قيد التشغيل..." : "في انتظار الصوت..."}
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
                        <FaVolumeUp /> تشغيل السؤال مرة أخرى
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
                  <h2 className="text-xl font-semibold">في انتظار السؤال</h2>
                  <p className="text-indigo-300">سيبدأ المسؤول اللعبة قريبًا...</p>
                </div>
              )}

              <div className="bg-gradient-to-br from-rose-800 to-pink-800 rounded-xl p-6 shadow-lg">
                <button
                  onClick={onBuzzerPress}
                  disabled={buzzerLocked || !currentQuestion || gameStatus !== 'playing' || activePlayer || connectionStatus !== 'connected'}
                  className={`w-full py-8 rounded-xl text-3xl font-bold flex flex-col items-center justify-center transform transition-all ${
                    isActivePlayer
                      ? 'bg-green-500'
                      : activePlayer
                        ? 'bg-gray-700 cursor-not-allowed'
                        : buzzerLocked || !currentQuestion || gameStatus !== 'playing' || connectionStatus !== 'connected'
                          ? 'bg-gray-700 cursor-not-allowed'
                          : 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:scale-95'
                  }`}
                >
                  {isActivePlayer ? (
                    <span>لقد ضغطت!</span>
                  ) : activePlayer ? (
                    <>
                      <FaLock className="text-2xl mb-2" />
                      <span>تم قفل الزر</span>
                    </>
                  ) : buzzerLocked ? (
                    <>
                      <FaLock className="text-2xl mb-2" />
                      <span>تم قفل الزر</span>
                    </>
                  ) : connectionStatus !== 'connected' ? (
                    <span>الاتصال مقطوع</span>
                  ) : (
                    <span>اضغط للجواب!</span>
                  )}
                </button>
                
                {activePlayer && (
                  <div className="mt-4 text-center">
                    <p className="text-lg">
                      <span className="font-bold">
                        {players.find(p => p.id === activePlayer)?.isAdmin 
                          ? "المسؤول" 
                          : "لاعب"
                        } ضغط على الزر!
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
            <FaSignOutAlt /> مغادرة الغرفة
          </button>
        </div>

        <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">اللاعبون</h2>
            <span className="bg-indigo-700 px-3 py-1 rounded-full">
              {players.length} {players.length === 1 ? 'لاعب' : 'لاعبين'}
            </span>
          </div>
          
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
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
                    {player.isAdmin ? '👑' : <span className="font-bold">{player.name.charAt(0)}</span>}
                  </div>
                  <span className="font-medium">
                    {player.name} 
                    {player.isAdmin && ' (مسؤول)'}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">
                    {player.score}
                  </span>
                  {index === 0 && players.length > 1 && (
                    <span className="text-yellow-400">👑</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerScreen;