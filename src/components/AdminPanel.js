import React, { useState, useRef, useEffect } from 'react';
import { FaCrown, FaRedo, FaSignOutAlt, FaTimes, FaTrophy, FaVolumeUp, FaRandom, FaBell, FaPlay, FaImage, FaArrowLeft } from 'react-icons/fa';
import CategorySelector from './CategorySelector';
import Whiteboard from './Whiteboard';
import CardGame from './CardGame';

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
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect,
  socket,
  questions,
  buzzerLocked,
  isAdmin,
  randomPhotosCategory,
  cardGameState
}) => {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showReloadWarning, setShowReloadWarning] = useState(false);
  const audioRef = useRef(null);
  const [pausedTime, setPausedTime] = useState(0);
  
  const [audio2Playing, setAudio2Playing] = useState(false);
  const [pausedTime2, setPausedTime2] = useState(0);
  const audioRef2 = useRef(null);
  
  const [loadingNext, setLoadingNext] = useState(false);

  const activePlayerData = players.find(p => p.id === activePlayer);
  const adminPlayer = players.find(p => p.isAdmin);

  const handlePlayAudio = () => {
    if (audioRef.current && !currentQuestion?.image) {
      audioRef.current.play()
        .then(() => setAudioPlaying(true))
        .catch(error => console.error("Audio play failed:", error));
      socket.emit('play_audio', roomCode);
    }
  };
  
  const handleContinueAudio = () => {
    if (audioRef.current && pausedTime > 0 && !currentQuestion?.image) {
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

  const handlePlayAudio2 = () => {
    if (audioRef2.current) {
      audioRef2.current.play()
        .then(() => setAudio2Playing(true))
        .catch(error => console.error("Audio2 play failed:", error));
      socket.emit('play_audio2', roomCode);
    }
  };
  
  const handleContinueAudio2 = () => {
    if (audioRef2.current && pausedTime2 > 0) {
      audioRef2.current.currentTime = pausedTime2;
      audioRef2.current.play()
        .then(() => setAudio2Playing(true))
        .catch(error => console.error("Audio2 continue failed:", error));
      socket.emit('continue_audio2', roomCode, pausedTime2);
    }
  };

  const handlePauseAudio2 = () => {
    if (audioRef2.current) {
      setPausedTime2(audioRef2.current.currentTime);
      audioRef2.current.pause();
      setAudio2Playing(false);
      socket.emit('pause_audio2', roomCode);
    }
  };

  const handleStopAudio2 = () => {
    if (audioRef2.current) {
      setPausedTime2(0);
      audioRef2.current.pause();
      audioRef2.current.currentTime = 0;
      setAudio2Playing(false);
      socket.emit('stop_audio2', roomCode);
    }
  };

  const handleReplayAudio2 = () => {
    handleStopAudio2();
    setTimeout(handlePlayAudio2, 100);
  };

  const handleNextQuestion = () => {
    setLoadingNext(true);
    onPlayRandomQuestion();
    setTimeout(() => setLoadingNext(false), 1000);
  };

  // FIXED: Proper back to categories function
  const handleBackToCategories = () => {
    console.log('Back to categories clicked');
    onCategorySelect(null);
    onSubcategorySelect(null);
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
    
    const handlePauseAudio2Event = () => {
      if (audioRef2.current) {
        setPausedTime2(audioRef2.current.currentTime);
        audioRef2.current.pause();
        setAudio2Playing(false);
      }
    };

    const handleContinueAudio2Event = (time) => {
      if (audioRef2.current) {
        audioRef2.current.currentTime = time;
        audioRef2.current.play()
          .then(() => setAudio2Playing(true))
          .catch(error => console.error("Audio2 continue failed:", error));
      }
    };

    socket.on('pause_audio', handlePauseAudioEvent);
    socket.on('continue_audio', handleContinueAudioEvent);
    socket.on('pause_audio2', handlePauseAudio2Event);
    socket.on('continue_audio2', handleContinueAudio2Event);

    return () => {
      socket.off('pause_audio', handlePauseAudioEvent);
      socket.off('continue_audio', handleContinueAudioEvent);
      socket.off('pause_audio2', handlePauseAudio2Event);
      socket.off('continue_audio2', handleContinueAudio2Event);
    };
  }, [socket, roomCode, currentQuestion]);

  useEffect(() => {
    if (currentQuestion) {
      if (audioRef.current && !currentQuestion.image) {
        const audioUrl = `${process.env.PUBLIC_URL}${currentQuestion.audio}`;
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        setAudioPlaying(false);
        setPausedTime(0);
      }
      
      if (currentQuestion.audio2 && audioRef2.current) {
        const audioUrl2 = `${process.env.PUBLIC_URL}${currentQuestion.audio2}`;
        audioRef2.current.src = audioUrl2;
        audioRef2.current.load();
        setAudio2Playing(false);
        setPausedTime2(0);
      }
    }
  }, [currentQuestion]);

  // Render CardGame when selected
  if (selectedCategory === 'card-game' || cardGameState?.gameStarted) {
    const adminPlayer = players.find(p => p.isAdmin);
    
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div className="flex items-center gap-3">
            <FaCrown className="text-yellow-400 text-2xl" />
            <h1 className="text-2xl font-bold">لوحة المسؤول - لعبة البطاقات</h1>
          </div>
          
          <div className="bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl bg-indigo-800 px-3 py-1 rounded">{roomCode}</span>
          </div>
        </div>

        <button
          onClick={handleBackToCategories}
          className="mb-4 bg-indigo-700 hover:bg-indigo-800 py-2 px-4 rounded-lg flex items-center justify-center gap-2"
        >
          <FaArrowLeft /> العودة للفئات
        </button>

        {adminPlayer ? (
          <CardGame 
            socket={socket}
            roomCode={roomCode}
            players={players}
            currentPlayer={adminPlayer}
            isAdmin={true}
            onExit={handleBackToCategories}
          />
        ) : (
          <div className="bg-red-600 rounded-xl p-6 text-center">
            <h2 className="text-xl font-bold mb-2">خطأ في تحميل اللعبة</h2>
            <p>لم يتم العثور على بيانات المسؤول. يرجى إعادة تحميل الصفحة.</p>
          </div>
        )}
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
              إعادة التحميل ستنهي اللعبة لجميع اللاعبين
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
                متابعة المسؤول
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <div className="flex items-center gap-3">
          <FaCrown className="text-yellow-400 text-2xl" />
          <h1 className="text-2xl font-bold">لوحة المسؤول</h1>
        </div>
        
        <div className="bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-3">
          <span className="font-medium">رمز الغرفة:</span>
          <span className="font-mono text-xl bg-indigo-800 px-3 py-1 rounded">{roomCode}</span>
        </div>
      </div>

      {/* FIXED: Back button for other categories */}
      {selectedCategory && selectedCategory !== 'card-game' && (
        <button
          onClick={handleBackToCategories}
          className="mb-4 bg-indigo-700 hover:bg-indigo-800 py-2 px-4 rounded-lg flex items-center justify-center gap-2"
        >
          <FaArrowLeft /> العودة للفئات
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">اللاعبون</h2>
              <span className="bg-indigo-700 px-3 py-1 rounded-full">
                {players.length} {players.length === 1 ? 'لاعب' : 'لاعبين'}
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
          
          {activePlayer ? (
            <div className="bg-gradient-to-r from-amber-700 to-amber-600 rounded-xl p-4 shadow-lg animate-pulse">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                  <div className="bg-amber-800 w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="font-bold text-xl">{activePlayerData?.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{activePlayerData?.name} يجيب!</h3>
                    <p className="text-amber-100">بانتظار قرارك في التصحيح...</p>
                  </div>
                </div>
                
                <button 
                  onClick={onResetBuzzer}
                  className="bg-amber-700 hover:bg-amber-800 px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaRedo /> إعادة الزر
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-xl p-4 shadow-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                  <div className="bg-blue-800 w-12 h-12 rounded-full flex items-center justify-center">
                    <FaBell className="text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">تحكم الزر</h3>
                    <p className="text-blue-100">اضغط للضغط كمسؤول</p>
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
                  <FaBell /> ضغط المسؤول
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {!selectedCategory || (selectedCategory === 'random-photos' && !selectedSubcategory) ? (
            <CategorySelector 
              categories={categories}
              onSelectCategory={onCategorySelect}
              selectedCategory={selectedCategory}
              isAdmin={isAdmin}
            />
          ) : null}
          
          {selectedCategory === 'random-photos' && !selectedSubcategory && (
            <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
              <button
                onClick={handleBackToCategories}
                className="mb-4 flex items-center gap-2 text-indigo-300 hover:text-white"
              >
                <FaArrowLeft /> العودة للفئات
              </button>
              
              <h2 className="text-xl font-semibold mb-3">اختر الفئة الفرعية</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {randomPhotosCategory.subcategories.map(subcategory => (
                  <button
                    key={subcategory.id}
                    onClick={() => onSubcategorySelect(subcategory.id)}
                    className={`py-3 px-4 rounded-lg text-center transition-all ${
                      selectedSubcategory === subcategory.id
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 transform scale-105'
                        : 'bg-indigo-700 hover:bg-indigo-600'
                    }`}
                  >
                    {subcategory.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {selectedSubcategory && (
            <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">
                    {randomPhotosCategory.subcategories.find(s => s.id === selectedSubcategory)?.name}
                  </h2>
                  <button
                    onClick={() => {
                      onSubcategorySelect(null);
                    }}
                    className="flex items-center gap-1 text-sm text-indigo-300 hover:text-white mt-1"
                  >
                    <FaArrowLeft /> تغيير الفئة الفرعية
                  </button>
                </div>
                
                <button
                  onClick={handleNextQuestion}
                  disabled={loadingNext}
                  className={`mt-3 sm:mt-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 rounded flex items-center gap-1 ${
                    loadingNext ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FaRandom /> {loadingNext ? 'جاري التحميل...' : 'السؤال التالي'}
                </button>
              </div>
              
              {currentQuestion?.image && currentQuestion?.category === 'random-photos' && (
                <div className="mt-4">
                  <div className="aspect-w-1 aspect-h-1">
                    <img 
                      src={`${process.env.PUBLIC_URL}${currentQuestion.image}`} 
                      alt="Your unique photo" 
                      className="object-contain rounded-lg max-h-64 mx-auto"
                    />
                  </div>
                  <div className="mt-4 bg-green-600 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">الإجابة:</h3>
                    <p className="text-lg font-bold">{currentQuestion.answer}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {selectedCategory && selectedCategory !== 'random-photos' && selectedCategory !== 'photos' && selectedCategory !== 'whiteboard' && selectedCategory !== 'card-game' && (
            <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {categories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <button
                  onClick={handleNextQuestion}
                  className="mt-2 sm:mt-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 rounded flex items-center gap-1"
                >
                  <FaRandom /> السؤال التالي
                </button>
              </div>
              
              <div className="space-y-4">
                {currentQuestion ? (
                  <>
                    {selectedCategory === 'reverse' ? (
                      <div className="bg-gradient-to-r from-orange-700 to-amber-700 p-6 rounded-lg">
                        <h3 className="font-semibold mb-2 text-center">الكلمة المعكوسة:</h3>
                        <p className="text-2xl font-bold text-center mb-4">{currentQuestion.text}</p>
                      </div>
                    ) : currentQuestion.image ? (
                      <div className="bg-indigo-700 p-4 rounded-lg text-center">
                        <h3 className="font-semibold mb-2">سؤال بالصورة:</h3>
                        <div className="aspect-w-1 aspect-h-1">
                          <img 
                            src={`${process.env.PUBLIC_URL}${currentQuestion.image}`} 
                            alt="Question" 
                            className="object-contain rounded-lg max-h-64 mx-auto"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-indigo-700 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">السؤال:</h3>
                        <p className="text-lg">{currentQuestion.text}</p>
                      </div>
                    )}
                    
                    <div className="bg-green-600 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">الإجابة:</h3>
                      <p className="text-lg font-bold">{currentQuestion.answer}</p>
                    </div>

                    {currentQuestion.bounc && (
                      <div className="bg-red-700 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">تلميح:</h3>
                        <p className="text-lg font-bold">{currentQuestion.bounc}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-indigo-700 p-4 rounded-lg text-center">
                    <p>اضغط "السؤال التالي" للبدء</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {selectedCategory === 'photos' && (
            <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  الصور (للمسؤول فقط)
                </h2>
                <button
                  onClick={handleNextQuestion}
                  className="mt-2 sm:mt-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 rounded flex items-center gap-1"
                >
                  <FaRandom /> السؤال التالي
                </button>
              </div>
              
              <div className="space-y-4">
                {currentQuestion?.image && currentQuestion?.category === 'photos' ? (
                  <>
                    <div className="bg-indigo-700 p-4 rounded-lg text-center">
                      <div className="aspect-w-1 aspect-h-1">
                        <img 
                          src={`${process.env.PUBLIC_URL}${currentQuestion.image}`} 
                          alt="Question" 
                          className="object-contain rounded-lg max-h-64 mx-auto"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-green-600 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">الإجابة:</h3>
                      <p className="text-lg font-bold">{currentQuestion.answer}</p>
                    </div>

                    <div className="bg-red-700 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">تلميح:</h3>
                      <p className="text-lg font-bold">{currentQuestion.bounc}</p>
                    </div>
                  </>
                ) : (
                  <div className="bg-indigo-700 p-4 rounded-lg text-center">
                    <p>اضغط "السؤال التالي" للبدء</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {selectedCategory === 'whiteboard' && (
            <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">السبورة التعاونية</h2>
                <button
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 rounded flex items-center gap-1"
                >
                  <FaRandom /> إظهار السبورة
                </button>
              </div>
              
              {currentQuestion?.category === 'whiteboard' && (
                <Whiteboard socket={socket} roomCode={roomCode} isAdmin={true} />
              )}
            </div>
          )}
          
          {/* Main audio controls (reverse music) */}
          {currentQuestion && !currentQuestion.image && currentQuestion.audio && (
            <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
              <h2 className="text-xl font-semibold mb-3">
                {selectedCategory === 'music' ? "تحكم موسيقى معكوسة" : "تحكم السؤال"}
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <button
                  onClick={handlePlayAudio}
                  disabled={audioPlaying}
                  className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 ${
                    audioPlaying 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <FaVolumeUp className="text-lg" />
                  <span className="text-sm">تشغيل</span>
                </button>
                
                <button
                  onClick={handleContinueAudio}
                  disabled={audioPlaying || pausedTime === 0}
                  className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 ${
                    audioPlaying || pausedTime === 0
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <FaPlay className="text-lg" />
                  <span className="text-sm">استئناف</span>
                </button>
                
                <button
                  onClick={handlePauseAudio}
                  disabled={!audioPlaying}
                  className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 ${
                    !audioPlaying 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  <FaVolumeUp className="text-lg" />
                  <span className="text-sm">إيقاف مؤقت</span>
                </button>
                
                <button
                  onClick={handleStopAudio}
                  className="py-2 rounded-lg bg-red-600 hover:bg-red-700 flex flex-col items-center justify-center gap-1"
                >
                  <FaVolumeUp className="text-lg" />
                  <span className="text-sm">إيقاف</span>
                </button>
                
                <button
                  onClick={handleReplayAudio}
                  className="py-2 rounded-lg bg-purple-600 hover:bg-purple-700 flex flex-col items-center justify-center gap-1"
                >
                  <FaVolumeUp className="text-lg" />
                  <span className="text-sm">إعادة تشغيل</span>
                </button>
              </div>
              
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
          
          {/* Normal audio controls (audio2) */}
          {currentQuestion && currentQuestion.audio2 && (
            <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
              <h2 className="text-xl font-semibold mb-3">
                {selectedCategory === 'music' ? "تحكم موسيقى طبيعية" : "تحكم الصوت 2"}
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <button
                  onClick={handlePlayAudio2}
                  disabled={audio2Playing}
                  className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 ${
                    audio2Playing 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  <FaVolumeUp className="text-lg" />
                  <span className="text-sm">تشغيل</span>
                </button>
                
                <button
                  onClick={handleContinueAudio2}
                  disabled={audio2Playing || pausedTime2 === 0}
                  className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 ${
                    audio2Playing || pausedTime2 === 0
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <FaPlay className="text-lg" />
                  <span className="text-sm">استئناف</span>
                </button>
                
                <button
                  onClick={handlePauseAudio2}
                  disabled={!audio2Playing}
                  className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 ${
                    !audio2Playing 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-yellow-600 hover:bg-yellow-700'
                  }`}
                >
                  <FaVolumeUp className="text-lg" />
                  <span className="text-sm">إيقاف مؤقت</span>
                </button>
                
                <button
                  onClick={handleStopAudio2}
                  className="py-2 rounded-lg bg-red-600 hover:bg-red-700 flex flex-col items-center justify-center gap-1"
                >
                  <FaVolumeUp className="text-lg" />
                  <span className="text-sm">إيقاف</span>
                </button>
                
                <button
                  onClick={handleReplayAudio2}
                  className="py-2 rounded-lg bg-purple-600 hover:bg-purple-700 flex flex-col items-center justify-center gap-1"
                >
                  <FaVolumeUp className="text-lg" />
                  <span className="text-sm">إعادة تشغيل</span>
                </button>
              </div>
              
              <audio 
                ref={audioRef2}
                className="w-full mt-4"
                onPlay={() => setAudio2Playing(true)}
                onPause={() => setAudio2Playing(false)}
                onEnded={() => setAudio2Playing(false)}
                onError={(e) => console.error("Audio2 error:", e)}
              />
            </div>
          )}
          
          <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
            <h2 className="text-xl font-semibold mb-3">تحكم اللعبة</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onResetBuzzer}
                className="bg-amber-600 hover:bg-amber-700 py-3 rounded-lg flex flex-col items-center justify-center"
              >
                <FaRedo className="text-xl mb-1" />
                إعادة الزر
              </button>
              
              <button
                onClick={onEndGame}
                className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 py-3 rounded-lg flex flex-col items-center justify-center"
              >
                <FaTrophy className="text-xl mb-1" />
                إنهاء اللعبة
              </button>
            </div>
            
            <button
              onClick={() => setShowReloadWarning(true)}
              className="w-full mt-4 bg-indigo-700 hover:bg-indigo-800 py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <FaRedo /> إعادة تحميل الصفحة
            </button>
            
            <button
              onClick={onLeaveRoom}
              className="w-full mt-4 bg-indigo-700 hover:bg-indigo-900 py-3 rounded-lg flex items-center justify-center gap-2"
            >
              <FaSignOutAlt /> مغادرة الغرفة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;



const gameCategories = [
  { 
    id: 1, 
    name: 'الفئة 1', 
    description: 'أفلام كوميدي',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 2, 
    name: 'الفئة 2', 
    description: 'ممثلين غنوا في أفلام',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 3, 
    name: 'الفئة 3', 
    description: 'افلام بإسم البطل',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 4, 
    name: 'الفئة 4', 
    description: 'افلام رومانسية',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 5, 
    name: 'الفئة 5', 
    description: 'ممثلين عملوا أكتر من ٣ أفلام بطولة',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 6, 
    name: 'الفئة 6', 
    description: 'ممثلين مثلوا مع عادل إمام',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 7, 
    name: 'الفئة 7', 
    description: 'ممثلين مثلوا مع بعض في نفس الفيلم',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 8, 
    name: 'الفئة 8', 
    description: 'افلام فيهم حد شرب مخدرات',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 9, 
    name: 'الفئة 9', 
    description: 'ممثلين كانوا هربانين من البوليس في أي فيلم',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 10, 
    name: 'الفئة 10', 
    description: 'افلام اكشن',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 11, 
    name: 'الفئة 11', 
    description: 'افلام فيها حد من الابطال مات',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 12, 
    name: 'الفئة 12', 
    description: 'ممثلين مثلوا دور ظابط',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 13, 
    name: 'الفئة 13', 
    description: 'أفلام فيها فرح',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 14, 
    name: 'الفئة 14', 
    description: 'ممثلين ليهم مشاهد بيأكلوا فيها',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 15, 
    name: 'الفئة 15', 
    description: 'أفلام فيها عصابة',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 16, 
    name: 'الفئة 16', 
    description: 'أفلام فيها شخصية بتنتحل شخصية تانيه',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 17, 
    name: 'الفئة 17', 
    description: 'أفلام فيها مطاردة عربيات',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 18, 
    name: 'الفئة 18', 
    description: 'أفلام إسمها من ٣ كلمات',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 19, 
    name: 'الفئة 19', 
    description: 'ممثلين تقدر تذكر إسم شخصيتهم في فيلم علي الأقل',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 20, 
    name: 'الفئة 20', 
    description: 'فيلم ظهر فيه حمام سباحة',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 21, 
    name: 'الفئة 21', 
    description: 'أفلام البطل فيها دخل السجن',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 22, 
    name: 'الفئة 22', 
    description: 'ممثلين ليهم إخوات في فيلم',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 23, 
    name: 'الفئة 23', 
    description: 'ممثلين عملوا إعلان في التليفزيون',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 24, 
    name: 'الفئة 24', 
    description: 'أفلام ظهر فيها حيوان',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 25, 
    name: 'الفئة 25', 
    description: 'ممثلين تقدر تقول ليهم ٥ أفلام',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 26, 
    name: 'الفئة 26', 
    description: 'أفلام تقدر تقول منها ٣ إفيهات',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 27, 
    name: 'الفئة 27', 
    description: 'ممثلين عيطوا في أفلام',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 28, 
    name: 'الفئة 28', 
    description: 'أفلام حصل فيها جريمة قتل',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 29, 
    name: 'الفئة 29', 
    description: 'أفلام تقدر تقول فيها أسماء ٣ شخصيات في الفيلم غير البطل',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 30, 
    name: 'الفئة 30', 
    description: 'فيلم إسمه من كلمة واحدة',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 31, 
    name: 'الفئة 31', 
    description: 'ممثلات شاركوا في فيلم لأحمد حلمي',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 32, 
    name: 'الفئة 32', 
    description: 'ممثل أو ممثلة عملوا دور دكتور (طبيب)',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 33, 
    name: 'الفئة 33', 
    description: 'ممثلين اتقبض عليهم في فيلم',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 34, 
    name: 'الفئة 34', 
    description: 'أفلام بطليها بيتجوزوا في نهاية الفيلم',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 35, 
    name: 'الفئة 35', 
    description: 'فيلم و ٢ ممثلين موجودين فيه',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 36, 
    name: 'الفئة 36', 
    description: 'أفلام فيها مشهد في عربية',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 37, 
    name: 'الفئة 37', 
    description: 'أفلام فيها البطل بيقتل حد',
    rules: 'اجمع ٣ بطاقات'
  },
  { 
    id: 38, 
    name: 'الفئة 38', 
    description: 'أفلام بيحصل فيها انفصال بين اتنين (حتي إذا رجعوا بعد كده لبعض عادي)',
    rules: 'اجمع ٣ بطاقات'
  },
];