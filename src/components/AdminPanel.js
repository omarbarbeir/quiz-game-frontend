import React, { useState, useRef, useEffect } from 'react';
import { FaCrown, FaRedo, FaSignOutAlt, FaTimes, FaTrophy, FaVolumeUp, FaRandom, FaBell, FaPlay, FaImage, FaArrowLeft, FaRedoAlt } from 'react-icons/fa';
import CategorySelector from './CategorySelector';
import Whiteboard from './Whiteboard';
import CardGame from './CardGame';
import TicTacToe from './TicTacToe';
import Timer from './Timer'
import GridGame from './GridGame';
import BingoGame from './BingoGame';
import BattleshipGame from './BattleshipGame';
import SwordOfKnowledge from './SwordOfKnowledge';
import BracketGame from './BracketGame';
import CrimeGameAdmin from './CrimeGameAdmin';

const AdminPanel = ({ 
  roomCode, players, activePlayer, currentQuestion, onScoreChange, onPlayQuestion,
  onPlayRandomQuestion, onResetBuzzer, onEndGame, onLeaveRoom, onAdminBuzzer,
  gameStatus, categories, selectedCategory, selectedSubcategory, onCategorySelect,
  onSubcategorySelect, socket, questions, buzzerLocked, isAdmin, cardGameState,
  onExitCardGame
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

  const handleBackToCategories = () => {
    onCategorySelect(null);
    onSubcategorySelect(null);
  };

  useEffect(() => {
    const handlePauseAudioEvent = () => {
      if (audioRef.current) { setPausedTime(audioRef.current.currentTime); audioRef.current.pause(); setAudioPlaying(false); }
    };
    const handleContinueAudioEvent = (time) => {
      if (audioRef.current) { audioRef.current.currentTime = time; audioRef.current.play().then(() => setAudioPlaying(true)).catch(err => console.error(err)); }
    };
    const handlePauseAudio2Event = () => {
      if (audioRef2.current) { setPausedTime2(audioRef2.current.currentTime); audioRef2.current.pause(); setAudio2Playing(false); }
    };
    const handleContinueAudio2Event = (time) => {
      if (audioRef2.current) { audioRef2.current.currentTime = time; audioRef2.current.play().then(() => setAudio2Playing(true)).catch(err => console.error(err)); }
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
  }, [socket, roomCode]);

  useEffect(() => {
    if (currentQuestion) {
      if (audioRef.current && !currentQuestion.image) {
        audioRef.current.src = `${process.env.PUBLIC_URL}${currentQuestion.audio}`;
        audioRef.current.load();
        setAudioPlaying(false);
        setPausedTime(0);
      }
      if (currentQuestion.audio2 && audioRef2.current) {
        audioRef2.current.src = `${process.env.PUBLIC_URL}${currentQuestion.audio2}`;
        audioRef2.current.load();
        setAudio2Playing(false);
        setPausedTime2(0);
      }
    }
  }, [currentQuestion]);


  useEffect(() => {
    if (selectedCategory === 'grid-game' && currentQuestion?.category !== 'grid-game') {
      onPlayQuestion({ id: 'grid-game', category: 'grid-game', text: 'الجدول', answer: '' });
    }
  }, [selectedCategory, currentQuestion, onPlayQuestion]);

  // Auto‑start Bingo when the category is selected
  useEffect(() => {
    if (selectedCategory === 'bingo' && currentQuestion?.category !== 'bingo') {
      onPlayQuestion({ id: 'bingo', category: 'bingo', text: 'بينجو', answer: '' });
    }
  }, [selectedCategory, currentQuestion, onPlayQuestion]);

  // Auto‑start Battleship when category selected
  useEffect(() => {
    if (selectedCategory === 'battleship' && currentQuestion?.category !== 'battleship') {
      onPlayQuestion({ id: 'battleship', category: 'battleship', text: 'حرب السفن', answer: '' });
    }
  }, [selectedCategory, currentQuestion, onPlayQuestion]);

  // Auto‑start Sword of Knowledge when category selected
  useEffect(() => {
    if (selectedCategory === 'sword-of-knowledge' && currentQuestion?.category !== 'sword-of-knowledge') {
      onPlayQuestion({ id: 'sword-of-knowledge', category: 'sword-of-knowledge', text: 'سيف المعرفة', answer: '' });
    }
  }, [selectedCategory, currentQuestion, onPlayQuestion]);

  useEffect(() => {
    if (selectedCategory === 'round16' && currentQuestion?.category !== 'round16') {
      onPlayQuestion({ id: 'round16', category: 'round16', text: 'دور الـ١٦', answer: '' });
    }
  }, [selectedCategory, currentQuestion, onPlayQuestion]);

  useEffect(() => {
    if (selectedCategory === 'crime-game' && currentQuestion?.category !== 'crime-game') {
      onPlayQuestion({ id: 'crime-game', category: 'crime-game', text: 'حل الجرائم', answer: '' });
      socket.emit('crime_start', { roomCode });
    }
  }, [selectedCategory, currentQuestion, socket, roomCode, onPlayQuestion]);


  // ====== Tic Tac Toe Mode ======
  if (selectedCategory === 'tic-tac-toe') {
    const adminPlayer = players.find(p => p.isAdmin);
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div className="flex items-center gap-3">
            <FaCrown className="text-yellow-400 text-2xl" />
            <h1 className="text-2xl font-bold">لوحة المسؤول – Tic Tac Toe</h1>
          </div>
          <div className="bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl bg-indigo-800 px-3 py-1 rounded">{roomCode}</span>
          </div>
        </div>
        <button onClick={() => handleBackToCategories()} className="mb-4 bg-indigo-700 hover:bg-indigo-800 py-2 px-4 rounded-lg flex items-center justify-center gap-2">
          <FaArrowLeft /> العودة للفئات
        </button>
        <TicTacToe
          socket={socket}
          roomCode={roomCode}
          players={players}
          currentPlayer={adminPlayer}
          isAdmin={true}
          onExit={handleBackToCategories}
        />
      </div>
    );
  }

  // useEffect(() => {
  //   if (selectedCategory === 'grid-game' && currentQuestion?.category !== 'grid-game') {
  //     onPlayQuestion({ id: 'grid-game', category: 'grid-game', text: 'الجدول', answer: '' });
  //   }
  // }, [selectedCategory, currentQuestion, onPlayQuestion]);

  // ====== Grid Game Mode ======
  if (selectedCategory === 'grid-game') {
    const adminPlayer = players.find(p => p.isAdmin);
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div className="flex items-center gap-3">
            <FaCrown className="text-yellow-400 text-2xl" />
            <h1 className="text-2xl font-bold">لوحة المسؤول - الجدول</h1>
          </div>
          <div className="bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl bg-indigo-800 px-3 py-1 rounded">{roomCode}</span>
          </div>
        </div>
        <button onClick={handleBackToCategories} className="mb-4 bg-indigo-700 hover:bg-indigo-800 py-2 px-4 rounded-lg flex items-center justify-center gap-2">
          <FaArrowLeft /> العودة للفئات
        </button>
        <GridGame socket={socket} roomCode={roomCode} playerId={adminPlayer?.id} />
      </div>
    );
  }

  // ====== Bingo Game Mode ======
  if (selectedCategory === 'bingo') {
    const adminPlayer = players.find(p => p.isAdmin);
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div className="flex items-center gap-3">
            <FaCrown className="text-yellow-400 text-2xl" />
            <h1 className="text-2xl font-bold">لوحة المسؤول - بينجو</h1>
          </div>
          <div className="bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl bg-indigo-800 px-3 py-1 rounded">{roomCode}</span>
          </div>
        </div>
        <button onClick={handleBackToCategories} className="mb-4 bg-indigo-700 hover:bg-indigo-800 py-2 px-4 rounded-lg flex items-center justify-center gap-2">
          <FaArrowLeft /> العودة للفئات
        </button>
        <BingoGame socket={socket} roomCode={roomCode} playerId={adminPlayer?.id} />
      </div>
    );
  }

  // ====== Battleship Game Mode ======
  if (selectedCategory === 'battleship') {
    const adminPlayer = players.find(p => p.isAdmin);
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div className="flex items-center gap-3">
            <FaCrown className="text-yellow-400 text-2xl" />
            <h1 className="text-2xl font-bold">لوحة المسؤول - حرب السفن</h1>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl">{roomCode}</span>
          </div>
        </div>
        <button onClick={handleBackToCategories} className="mb-4 bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg flex items-center gap-2">
          <FaArrowLeft /> العودة للفئات
        </button>
        <BattleshipGame socket={socket} roomCode={roomCode} playerId={adminPlayer?.id} />
      </div>
    );
  }


  if (selectedCategory === 'crime-game') {
    const adminPlayer = players.find(p => p.isAdmin);
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div className="flex items-center gap-3">
            <FaCrown className="text-yellow-400 text-2xl" />
            <h1 className="text-2xl font-bold">لوحة المسؤول – حل الجرائم</h1>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl">{roomCode}</span>
          </div>
        </div>
        <button onClick={handleBackToCategories} className="mb-4 bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg flex items-center gap-2">
          <FaArrowLeft /> العودة للفئات
        </button>
        <CrimeGameAdmin socket={socket} roomCode={roomCode} />
      </div>
    );
  }

// ====== Sword of Knowledge Mode ======
  if (selectedCategory === 'sword-of-knowledge') {
    const adminPlayer = players.find(p => p.isAdmin);
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div className="flex items-center gap-3">
            <FaCrown className="text-yellow-400 text-2xl" />
            <h1 className="text-2xl font-bold">لوحة المسؤول – سيف المعرفة</h1>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl">{roomCode}</span>
          </div>
        </div>
        <button onClick={handleBackToCategories} className="mb-4 bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg flex items-center gap-2">
          <FaArrowLeft /> العودة للفئات
        </button>
        <button onClick={() => socket.emit('sok_reset', { roomCode })} className="mb-4 ml-2 bg-red-600 hover:bg-red-500 py-2 px-4 rounded-lg flex items-center gap-2">
          <FaRedoAlt /> إعادة اللعبة
        </button>
        <SwordOfKnowledge
          socket={socket}
          roomCode={roomCode}
          players={players}
          currentPlayer={adminPlayer}
          isAdmin={true}
          onExit={handleBackToCategories}
        />
      </div>
    );
  }

  if (selectedCategory === 'round16') {
    const adminPlayer = players.find(p => p.isAdmin);
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div className="flex items-center gap-3">
            <FaCrown className="text-yellow-400 text-2xl" />
            <h1 className="text-2xl font-bold">لوحة المسؤول – دور الـ١٦</h1>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl">{roomCode}</span>
          </div>
        </div>
        <button onClick={handleBackToCategories} className="mb-4 bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg flex items-center gap-2">
          <FaArrowLeft /> العودة للفئات
        </button>
        <BracketGame
          socket={socket}
          roomCode={roomCode}
          players={players}
          currentPlayer={adminPlayer}
          isAdmin={true}
        />
      </div>
    );
  }



  // ====== Card Game Mode ======
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
        <button onClick={() => { if (onExitCardGame) onExitCardGame(); handleBackToCategories(); }} className="mb-4 bg-indigo-700 hover:bg-indigo-800 py-2 px-4 rounded-lg flex items-center justify-center gap-2">
          <FaArrowLeft /> العودة للفئات
        </button>
        {adminPlayer ? (
          <CardGame socket={socket} roomCode={roomCode} players={players} currentPlayer={adminPlayer} isAdmin={true} onExit={() => { if (onExitCardGame) onExitCardGame(); handleBackToCategories(); }} />
        ) : (
          <div className="bg-red-600 rounded-xl p-6 text-center"><h2 className="text-xl font-bold mb-2">خطأ في تحميل اللعبة</h2><p>لم يتم العثور على بيانات المسؤول. يرجى إعادة تحميل الصفحة.</p></div>
        )}
      </div>
    );
  }

  

  // ====== Normal Admin View ======
  return (
    <div className="w-full">
      {showReloadWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-indigo-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center">تحذير!</h2>
            <p className="text-lg mb-6 text-center">إعادة التحميل ستنهي اللعبة لجميع اللاعبين</p>
            <div className="flex gap-4">
              <button onClick={() => { setShowReloadWarning(false); window.location.reload(); }} className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-bold">خروج على أي حال</button>
              <button onClick={() => setShowReloadWarning(false)} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold">متابعة المسؤول</button>
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

      {selectedCategory && selectedCategory !== 'card-game' && (
        <button onClick={handleBackToCategories} className="mb-4 bg-indigo-700 hover:bg-indigo-800 py-2 px-4 rounded-lg flex items-center justify-center gap-2">
          <FaArrowLeft /> العودة للفئات
        </button>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Player list with shimmer border */}
          <div className="relative p-[2px] rounded-xl overflow-hidden">
            {/* Shimmer border */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 animate-shimmer rounded-xl" />
            <div className="relative bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">اللاعبون</h2>
                <span className="bg-gray-700 px-3 py-1 rounded-full text-cyan-300">
                  {players.length} {players.length === 1 ? 'لاعب' : 'لاعبين'}
                </span>
              </div>
              <div className="space-y-3">
                {players.map(player => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                      activePlayer === player.id
                        ? 'bg-gradient-to-r from-orange-600 to-pink-600 shadow-lg shadow-orange-500/20'
                        : 'bg-gray-800/70 hover:bg-gray-700/70'
                    } ${player.isAdmin ? 'border-2 border-yellow-400' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        player.isAdmin ? 'bg-yellow-500' : 'bg-gradient-to-r from-cyan-600 to-purple-600'
                      }`}>
                        {player.isAdmin ? (
                          <FaCrown className="text-yellow-800" />
                        ) : (
                          <span className="font-bold">{player.name.charAt(0)}</span>
                        )}
                      </div>
                      <span className="font-medium flex items-center gap-2">
                        {player.name}
                        {player.isAdmin && <FaCrown className="text-yellow-400" />}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onScoreChange(player.id, -1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 transition-colors"
                      >
                        <FaTimes />
                      </button>
                      <span className="font-bold text-lg min-w-[40px] text-center">
                        {player.score}
                      </span>
                      <button
                        onClick={() => onScoreChange(player.id, 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500 hover:bg-green-600 transition-colors"
                      >
                        ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        {/* Active player banner (already updated) */}
        {activePlayer ? (
          <div className="relative p-[2px] rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 animate-shimmer rounded-xl" />
            <div className="relative bg-gradient-to-r from-cyan-600 to-purple-700 rounded-xl p-4 shadow-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between">
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                  <div className="bg-cyan-700 w-12 h-12 rounded-full flex items-center justify-center">
                    <span className="font-bold text-xl">{activePlayerData?.name?.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{activePlayerData?.name} يجيب!</h3>
                    <p className="text-cyan-100">بانتظار قرارك في التصحيح...</p>
                  </div>
                </div>
                <button onClick={onResetBuzzer} className="bg-cyan-800 hover:bg-cyan-900 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <FaRedo /> إعادة الزر
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Inactive admin buzzer panel – updated dark glass style */
          <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-cyan-500/20">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div className="bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center">
                  <FaBell className="text-xl text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">تحكم الزر</h3>
                  <p className="text-gray-300">اضغط للضغط كمسؤول</p>
                </div>
              </div>
              <button
                onClick={onAdminBuzzer}
                disabled={buzzerLocked || !currentQuestion}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  buzzerLocked || !currentQuestion
                    ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                    : 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 shadow-lg shadow-cyan-500/20'
                }`}
              >
                <FaBell /> ضغط المسؤول
              </button>
            </div>
          </div>
        )}
      </div>

        <div className="space-y-6">
          <CategorySelector 
            categories={categories}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onSelectCategory={onCategorySelect}
            onSelectSubcategory={onSubcategorySelect}
            isAdmin={isAdmin}
          />

          {selectedCategory && (categories.find(c => c.id === selectedCategory)?.subcategories.length > 0 ? selectedSubcategory : true) && (
            <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold">
                    {categories.find(c => c.id === selectedCategory)?.name}
                    {selectedSubcategory && ` - ${categories.find(c => c.id === selectedCategory)?.subcategories.find(s => s.id === selectedSubcategory)?.name}`}
                  </h2>
                  {selectedSubcategory && (
                    <button onClick={() => onSubcategorySelect(null)} className="flex items-center gap-1 text-sm text-indigo-300 hover:text-white mt-1">
                      <FaArrowLeft /> تغيير الفئة الفرعية
                    </button>
                  )}
                </div>
                <button onClick={handleNextQuestion} disabled={loadingNext} className={`mt-3 sm:mt-0 bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 rounded flex items-center gap-1 ${loadingNext ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <FaRandom /> {loadingNext ? 'جاري التحميل...' : 'السؤال التالي'}
                </button>
              </div>

              {/* -------- CURRENT QUESTION DISPLAY -------- */}
              {currentQuestion && (
                <div className="mt-4 space-y-4">
                  {/* ----- FLAGS: hide image from admin, show only answer ----- */}
                  {selectedCategory === 'flags' ? (
                    <>
                      <div className="bg-indigo-700 p-4 rounded-lg text-center">
                        <p className="text-lg font-bold">صورة العلم مخفية عن المسؤول</p>
                      </div>
                      <div className="bg-green-600 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">الإجابة:</h3>
                        <p className="text-lg font-bold">{currentQuestion.answer}</p>
                      </div>
                    </>
                  ) : selectedCategory === 'spy' ? (
                      <div className="bg-gray-800 p-6 rounded-lg text-center border border-gray-700 shadow-xl">
                        <div className="bg-gray-700 p-4 rounded-lg mb-6">
                          <p className="text-xl font-bold text-yellow-300">🕵️ تم توزيع الكلمة على اللاعبين</p>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                          <button
                            onClick={() => socket.emit('start_spy_voting', roomCode)}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
                          >
                            <FaBell /> فتح باب التصويت
                          </button>
                          
                          <button
                            onClick={() => socket.emit('end_spy_voting', roomCode)}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all"
                          >
                            <FaTrophy /> إنهاء التصويت والنتيجة
                          </button>
                        </div>
                      </div>
                    ) : selectedCategory === 'whoami' ? (
                    /* ----- WHOAMI: admin sees a summary (photos assigned) ----- */
                    <div className="bg-indigo-700 p-4 rounded-lg text-center">
                      <p className="text-lg font-bold">{currentQuestion.text}</p>
                    </div>
                  ) : currentQuestion.category === 'whiteboard' ? null : currentQuestion.image ? (
                    <>
                      <div className="bg-indigo-700 p-4 rounded-lg text-center">
                        <img src={`${process.env.PUBLIC_URL}${currentQuestion.image}`} alt="Question" className="object-contain rounded-lg max-h-64 mx-auto" />
                      </div>
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
                    <>
                      {currentQuestion.category === 'reverse' ? (
                        <div className="bg-gradient-to-r from-orange-700 to-amber-700 p-6 rounded-lg">
                          <h3 className="font-semibold mb-2 text-center">الكلمة المعكوسة:</h3>
                          <p className="text-2xl font-bold text-center mb-4">{currentQuestion.text}</p>
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
                  )}
                </div>
              )}
            </div>
          )}

          {selectedCategory === 'whiteboard' && currentQuestion?.category === 'whiteboard' && (
            <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
              <Timer socket={socket} roomCode={roomCode} isAdmin={true} />
              <h2 className="text-xl font-semibold mb-3">السبورة التعاونية</h2>
              <Whiteboard socket={socket} roomCode={roomCode} isAdmin={true} />
            </div>
          )}

          {/* Audio controls (unchanged) */}
          {currentQuestion && !currentQuestion.image && currentQuestion.audio && (
            <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
              <h2 className="text-xl font-semibold mb-3">{selectedCategory === 'music' ? "تحكم موسيقى معكوسة" : "تحكم السؤال"}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <button onClick={handlePlayAudio} disabled={audioPlaying} className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 ${audioPlaying ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}><FaVolumeUp className="text-lg" /><span className="text-sm">تشغيل</span></button>
                <button onClick={handleContinueAudio} disabled={audioPlaying || pausedTime === 0} className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 ${audioPlaying || pausedTime === 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}><FaPlay className="text-lg" /><span className="text-sm">استئناف</span></button>
                <button onClick={handlePauseAudio} disabled={!audioPlaying} className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 ${!audioPlaying ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'}`}><FaVolumeUp className="text-lg" /><span className="text-sm">إيقاف مؤقت</span></button>
                <button onClick={handleStopAudio} className="py-2 rounded-lg bg-red-600 hover:bg-red-700 flex flex-col items-center justify-center gap-1"><FaVolumeUp className="text-lg" /><span className="text-sm">إيقاف</span></button>
                <button onClick={handleReplayAudio} className="py-2 rounded-lg bg-purple-600 hover:bg-purple-700 flex flex-col items-center justify-center gap-1"><FaVolumeUp className="text-lg" /><span className="text-sm">إعادة تشغيل</span></button>
              </div>
              <audio ref={audioRef} className="w-full mt-4" onPlay={() => setAudioPlaying(true)} onPause={() => setAudioPlaying(false)} onEnded={() => setAudioPlaying(false)} onError={(e) => console.error("Audio error:", e)} />
            </div>
          )}

          {currentQuestion && currentQuestion.audio2 && (
            <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
              <h2 className="text-xl font-semibold mb-3">{selectedCategory === 'music' ? "تحكم موسيقى طبيعية" : "تحكم الصوت 2"}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <button onClick={handlePlayAudio2} disabled={audio2Playing} className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 ${audio2Playing ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}><FaVolumeUp className="text-lg" /><span className="text-sm">تشغيل</span></button>
                <button onClick={handleContinueAudio2} disabled={audio2Playing || pausedTime2 === 0} className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 ${audio2Playing || pausedTime2 === 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}><FaPlay className="text-lg" /><span className="text-sm">استئناف</span></button>
                <button onClick={handlePauseAudio2} disabled={!audio2Playing} className={`py-2 rounded-lg flex flex-col items-center justify-center gap-1 ${!audio2Playing ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700'}`}><FaVolumeUp className="text-lg" /><span className="text-sm">إيقاف مؤقت</span></button>
                <button onClick={handleStopAudio2} className="py-2 rounded-lg bg-red-600 hover:bg-red-700 flex flex-col items-center justify-center gap-1"><FaVolumeUp className="text-lg" /><span className="text-sm">إيقاف</span></button>
                <button onClick={handleReplayAudio2} className="py-2 rounded-lg bg-purple-600 hover:bg-purple-700 flex flex-col items-center justify-center gap-1"><FaVolumeUp className="text-lg" /><span className="text-sm">إعادة تشغيل</span></button>
              </div>
              <audio ref={audioRef2} className="w-full mt-4" onPlay={() => setAudio2Playing(true)} onPause={() => setAudio2Playing(false)} onEnded={() => setAudio2Playing(false)} onError={(e) => console.error("Audio2 error:", e)} />
            </div>
          )}

          <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
            <h2 className="text-xl font-semibold mb-3">تحكم اللعبة</h2>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={onResetBuzzer} className="bg-amber-600 hover:bg-amber-700 py-3 rounded-lg flex flex-col items-center justify-center"><FaRedo className="text-xl mb-1" />إعادة الزر</button>
              <button onClick={onEndGame} className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 py-3 rounded-lg flex flex-col items-center justify-center"><FaTrophy className="text-xl mb-1" />إنهاء اللعبة</button>
            </div>
            <button onClick={() => setShowReloadWarning(true)} className="w-full mt-4 bg-indigo-700 hover:bg-indigo-800 py-3 rounded-lg flex items-center justify-center gap-2"><FaRedo /> إعادة تحميل الصفحة</button>
            <button onClick={onLeaveRoom} className="w-full mt-4 bg-indigo-700 hover:bg-indigo-900 py-3 rounded-lg flex items-center justify-center gap-2"><FaSignOutAlt /> مغادرة الغرفة</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;