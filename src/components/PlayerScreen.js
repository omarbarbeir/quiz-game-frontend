import React, { useState, useRef, useEffect } from 'react';
import { FaLock, FaSignOutAlt, FaTrophy, FaVolumeUp, FaRedo, FaTimes, FaCrown } from 'react-icons/fa';
import Whiteboard from './Whiteboard';
import CardGame from './CardGame';
import TicTacToe from './TicTacToe';
import Timer from './Timer';
import GridGame from './GridGame';
import BingoGame from './BingoGame';
import BattleshipGame from './BattleshipGame';
import SwordOfKnowledge from './SwordOfKnowledge';
import BracketGame from './BracketGame';

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
  onExitCardGame
}) => {
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showReloadWarning, setShowReloadWarning] = useState(false);
  const audioRef = useRef(null);
  const isActivePlayer = activePlayer === playerId;
  const [pausedTime, setPausedTime] = useState(0);

  const [showSpyVoteModal, setShowSpyVoteModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [votedFor, setVotedFor] = useState(null);
  const [spyResult, setSpyResult] = useState(null);

  const publicUrl = process.env.PUBLIC_URL || '';

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
  const isReverseQuestion = currentQuestion?.category === 'reverse';
  
  // ----- Socket listeners -----
  useEffect(() => {
    const handlePlayAudio = () => {
      if (audioRef.current && !activePlayer && !currentQuestion?.image) {
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
    
    // Handles both Whoami and Spy personalised data
    const handlePlayerPhotoQuestion = (photoData) => {
      if (photoData.playerId === playerId) {
        if (onExitCardGame) onExitCardGame();
        setCurrentQuestion(photoData.question);
        setActivePlayer(null);
        setBuzzerLocked(false);
        setGameStatus('playing');
      }
    };

    const handleCardGameStateUpdate = (gameState) => {
      console.log('🃏 Player received card game state:', gameState);
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

    // ⭐ NEW: enter TicTacToe mode when server sends game state
    const handleTicTacToeState = (state) => {
      setCurrentQuestion({
        id: 'tic-tac-toe',
        category: 'tic-tac-toe',
        text: 'Tic Tac Toe',
        answer: ''
      });
      setGameStatus('playing');
    };
    
    socket.on('play_audio', handlePlayAudio);
    socket.on('pause_audio', handlePauseAudio);
    socket.on('continue_audio', handleContinueAudio);
    socket.on('player_photo_question', handlePlayerPhotoQuestion);
    socket.on('card_game_state_update', handleCardGameStateUpdate);
    socket.on('tic_tac_toe_state', handleTicTacToeState);


    const handleOpenSpyVoting = () => {
      setShowSpyVoteModal(true);
      setVotedFor(null);
      setSpyResult(null);
    };

    const handleSpyVotingResults = (result) => {
      setShowSpyVoteModal(false);
      setSpyResult(result);
      // لو السيرفر بيبعت قائمة اللاعبين بالنقاط الجديدة ممكن تعملها Set هنا
    };

    socket.on('open_spy_voting', handleOpenSpyVoting);
    socket.on('spy_voting_results', handleSpyVotingResults);

    // ولا تنسى تحطهم في الـ return جوا הـ useEffect عشان يتمسحوا مع الـ unmount
    // socket.off('open_spy_voting', handleOpenSpyVoting);
    // socket.off('spy_voting_results', handleSpyVotingResults);
    
    return () => {
      socket.off('play_audio', handlePlayAudio);
      socket.off('pause_audio', handlePauseAudio);
      socket.off('continue_audio', handleContinueAudio);
      socket.off('player_photo_question', handlePlayerPhotoQuestion);
      socket.off('card_game_state_update', handleCardGameStateUpdate);
      socket.off('tic_tac_toe_state', handleTicTacToeState);
    };
  }, [socket, activePlayer, currentQuestion, playerId, setCurrentQuestion, setActivePlayer, setBuzzerLocked, setGameStatus, onExitCardGame]);
  
  // Load audio for audio questions
  useEffect(() => {
    if (currentQuestion && audioRef.current && !currentQuestion.image && currentQuestion.category !== 'spy') {
      const audioUrl = `${publicUrl}${currentQuestion.audio}`;
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      setAudioPlaying(false);
      setPausedTime(0);
    }
  }, [currentQuestion, publicUrl]);

  useEffect(() => {
    setSpyResult(null);
    setShowSpyVoteModal(false);
    setVotedFor(null);
  }, [currentQuestion]);

  // useEffect(() => {
  //   // استقبال قائمة اللاعبين المحدثة بالنقاط الجديدة من السيرفر
  //   socket.on('update_players', (updatedPlayers) => {
  //     setPlayers(updatedPlayers); // هنا setPlayers هتعمل بدون مشاكل
  //   });

  //   return () => {
  //     socket.off('update_players');
  //   };
  // }, [socket]);;

  // Render TicTacToe when in tic-tac-toe mode
  if (currentQuestion?.category === 'tic-tac-toe') {
    const currentPlayer = players.find(p => p.id === playerId);
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-right">Tic Tac Toe</h1>
            <p className="text-indigo-200 text-right">مرحبًا، {playerName}</p>
          </div>
          <div className="bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl bg-indigo-800 px-3 py-1 rounded">{roomCode}</span>
          </div>
        </div>

        <TicTacToe
          socket={socket}
          roomCode={roomCode}
          players={players}
          currentPlayer={currentPlayer}
          isAdmin={false}
        />

        <button onClick={onLeaveRoom} className="w-full mt-6 bg-indigo-700 hover:bg-indigo-900 py-3 rounded-lg flex items-center justify-center gap-2">
          <FaSignOutAlt /> مغادرة الغرفة
        </button>
      </div>
    );
  }

  // Render GridGame when in grid-game mode
  if (currentQuestion?.category === 'grid-game') {
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-right">الجدول التعاوني</h1>
            <p className="text-indigo-200 text-right">مرحبًا، {playerName}</p>
          </div>
          <div className="bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl bg-indigo-800 px-3 py-1 rounded">{roomCode}</span>
          </div>
        </div>
        <GridGame socket={socket} roomCode={roomCode} playerId={playerId} />
        <button onClick={onLeaveRoom} className="w-full mt-6 bg-indigo-700 hover:bg-indigo-900 py-3 rounded-lg flex items-center justify-center gap-2">
          <FaSignOutAlt /> مغادرة الغرفة
        </button>
      </div>
    );
  }

  // Render BingoGame when in bingo mode
  if (currentQuestion?.category === 'bingo') {
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-right">بينجو</h1>
            <p className="text-indigo-200 text-right">مرحبًا، {playerName}</p>
          </div>
          <div className="bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl bg-indigo-800 px-3 py-1 rounded">{roomCode}</span>
          </div>
        </div>
        <BingoGame socket={socket} roomCode={roomCode} playerId={playerId} />
        <button onClick={onLeaveRoom} className="w-full mt-6 bg-indigo-700 hover:bg-indigo-900 py-3 rounded-lg flex items-center justify-center gap-2">
          <FaSignOutAlt /> مغادرة الغرفة
        </button>
      </div>
    );
  }

  // Render Battleship when in battleship mode
  if (currentQuestion?.category === 'battleship') {
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-right">حرب السفن</h1>
            <p className="text-gray-300 text-right">مرحبًا، {playerName}</p>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl">{roomCode}</span>
          </div>
        </div>
        <BattleshipGame socket={socket} roomCode={roomCode} playerId={playerId} />
        <button onClick={onLeaveRoom} className="w-full mt-6 bg-red-600 hover:bg-red-500 py-3 rounded-lg flex items-center justify-center gap-2">
          <FaSignOutAlt /> مغادرة الغرفة
        </button>
      </div>
    );
  }

  // Render Sword of Knowledge when in sword-of-knowledge mode
  if (currentQuestion?.category === 'sword-of-knowledge') {
    const currentPlayer = players.find(p => p.id === playerId);
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-right">سيف المعرفة</h1>
            <p className="text-gray-300 text-right">مرحبًا، {playerName}</p>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl">{roomCode}</span>
          </div>
        </div>
        <SwordOfKnowledge
          socket={socket}
          roomCode={roomCode}
          players={players}
          currentPlayer={currentPlayer}
          isAdmin={false}
        />
        <button onClick={onLeaveRoom} className="w-full mt-6 bg-red-600 hover:bg-red-500 py-3 rounded-lg flex items-center justify-center gap-2">
          <FaSignOutAlt /> مغادرة الغرفة
        </button>
      </div>
    );
  }

  if (currentQuestion?.category === 'round16') {
    const currentPlayer = players.find(p => p.id === playerId);
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-right">دور الـ١٦</h1>
            <p className="text-gray-300 text-right">مرحبًا، {playerName}</p>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl">{roomCode}</span>
          </div>
        </div>
        <BracketGame
          socket={socket}
          roomCode={roomCode}
          players={players}
          currentPlayer={currentPlayer}
          isAdmin={false}
        />
        <button onClick={onLeaveRoom} className="w-full mt-6 bg-red-600 hover:bg-red-500 py-3 rounded-lg flex items-center justify-center gap-2">
          <FaSignOutAlt /> مغادرة الغرفة
        </button>
      </div>
    );
  }

  // Render CardGame when in card game mode
  if (currentQuestion?.category === 'card-game' || cardGameState?.gameStarted) {
    const currentPlayer = players.find(p => p.id === playerId);
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

        <CardGame 
          socket={socket}
          roomCode={roomCode}
          players={players}
          currentPlayer={currentPlayer}
          isAdmin={false}
          onExit={onExitCardGame}
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


  const handleVoteSubmit = (targetId) => {
    setVotedFor(targetId);
    socket.emit('submit_spy_vote', { roomCode, voterId: playerId, votedForId: targetId });
  };

  // ========== MAIN QUIZ VIEW ==========
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
                <Timer socket={socket} roomCode={roomCode} isAdmin={false} />
                <h2 className="text-xl font-semibold mb-4 text-center">السبورة التعاونية</h2>
                <Whiteboard socket={socket} roomCode={roomCode} isAdmin={false} />
              </div>
            ) : (
            <>
              {/* ===== SPY ROUND DISPLAY ===== */}
              {currentQuestion?.category === 'spy' ? (
                <div className="relative p-[2px] rounded-xl overflow-hidden">
                  {/* Shimmer border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 animate-shimmer rounded-xl" />
                  <div className="relative bg-gradient-to-br from-gray-900 via-indigo-950 to-gray-900 rounded-xl p-6 shadow-lg text-center">
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold text-cyan-300">جولة الجاسوس</h2>
                      <p className="text-gray-400 mt-2">انظر إلى كلمتك:</p>
                    </div>
                    <div className="bg-gray-800/70 p-6 rounded-lg border border-purple-500/20">
                      <p className="text-3xl font-bold text-yellow-300">
                        {currentQuestion.text}
                      </p>
                      {currentQuestion.text?.includes('Spy') && (
                        <p className="text-red-400 mt-4 text-lg">أنت الجاسوس! حاول التخفي!</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : currentQuestion?.image ? (
                /* ===== ANY IMAGE QUESTION (flags, whoami, etc.) ===== */
                <div className="bg-indigo-800 rounded-xl p-6 shadow-lg text-center">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold">
                      {currentQuestion.category === 'random-photos' ? `أنا مين: ${currentQuestion.subcategory || ''}` :
                       currentQuestion.category === 'flags' ? 'أعلام الدول' :
                       'سؤال بالصورة'}
                    </h2>
                    <p className="text-indigo-300 mt-2">
                      {currentQuestion.category === 'random-photos' ? 'صورتك الفريدة لتتعرف عليها' : ''}
                    </p>
                  </div>
                  <div className="mt-4">
                    <img 
                      src={`${publicUrl}${currentQuestion.image}`} 
                      alt="Question" 
                      className="object-contain rounded-lg max-h-[60vh] mx-auto"
                    />
                    {/* Answer box – hidden for flags */}
                    {currentQuestion.category !== 'flags' && (
                      <div className="mt-4 bg-green-600 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">الإجابة:</h3>
                        <p className="text-3xl font-bold">{currentQuestion.answer}</p>
                      </div>
                    )}
                    {currentQuestion.bounc && (
                      <div className="mt-4 bg-red-700 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">تلميح:</h3>
                        <p className="text-lg font-bold">{currentQuestion.bounc}</p>
                      </div>
                    )}
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
                /* ===== TEXT QUESTION DISPLAY ===== */
                currentQuestion && (currentQuestion.category === 'who-said' || currentQuestion.category === 'song-for' || currentQuestion.category === 'put-word-in-song') ? (
                  <div className="bg-indigo-800 rounded-xl p-6 shadow-lg text-center">
                    <div className="mb-4">
                      <h2 className="text-xl font-semibold">
                        {currentQuestion.category === 'who-said' ? 'مين قال الجملة دي' :
                         currentQuestion.category === 'song-for' ? 'أغنية لـ' :
                         'حط كلمة في أغنية'}
                      </h2>
                      <p className="text-indigo-300 mt-2">استمع للسؤال من المسؤول واضغط للجواب</p>
                    </div>
                    {/* No answer shown to players */}
                  </div>
                ) : (
                  <div className="bg-indigo-800 rounded-xl p-8 shadow-lg text-center">
                    <h2 className="text-xl font-semibold">في انتظار السؤال</h2>
                    <p className="text-indigo-300">سيبدأ المسؤول اللعبة قريبًا...</p>
                  </div>
                )
              )}

              {/* ----- BUZZER (show for all except spy) ----- */}
              {/* ----- BUZZER with animated border ----- */}
              {currentQuestion?.category !== 'spy' && (
                <div className="relative p-[2px] rounded-xl overflow-hidden">
                  {/* shimmer border only when buzzer is active (ready to press) */}
                  {(!buzzerLocked && !activePlayer && gameStatus === 'playing' && currentQuestion) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 animate-shimmer-fast rounded-xl" />
                  )}
                  <div className="relative bg-gradient-to-br from-cyan-900/90 to-purple-900/90 rounded-xl p-6 shadow-lg">
                    <button
                      onClick={() => {
                        if (!buzzerLocked && currentQuestion && gameStatus === 'playing' && !activePlayer) {
                          const audio = new Audio('/audio/bell.mp3');
                          audio.play().catch(err => console.error('Buzzer play error:', err));
                        }
                        onBuzzerPress();
                      }}
                      disabled={buzzerLocked || !currentQuestion || gameStatus !== 'playing' || activePlayer}
                      className={`w-full py-12 rounded-xl text-4xl font-bold flex flex-col items-center justify-center transform transition-all ${
                        isActivePlayer
                          ? 'bg-gradient-to-r from-cyan-400 to-purple-400 cursor-not-allowed shadow-lg shadow-cyan-500/20'
                          : activePlayer
                            ? 'bg-gray-700 cursor-not-allowed'
                            : buzzerLocked || !currentQuestion || gameStatus !== 'playing'
                              ? 'bg-gray-700 cursor-not-allowed'
                              : 'bg-gradient-to-br from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 active:scale-95 shadow-lg shadow-cyan-500/20'
                      }`}
                    >
                      {isActivePlayer ? (
                        <>
                          <FaLock className="text-3xl mb-2" />
                          <span>لقد ضغطت!</span>
                        </>
                      ) : activePlayer ? (
                        <>
                          <FaLock className="text-3xl mb-2" />
                          <span>تم قفل الزر</span>
                        </>
                      ) : buzzerLocked || !currentQuestion || gameStatus !== 'playing' ? (
                        <>
                          <FaLock className="text-3xl mb-2" />
                          <span>تم قفل الزر</span>
                        </>
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
                              : "لاعب"}
                            ضغط على الزر!
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
          
          <button
            onClick={onLeaveRoom}
            className="w-full bg-indigo-700 hover:bg-indigo-900 py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <FaSignOutAlt /> مغادرة الغرفة
          </button>
        </div>

        {/* Player list */}
        {/* <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
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
        </div> */}

        {/* زرار لوحة السكور (عائم عشان ماياخدش مساحة) */}
      <button 
        onClick={() => setShowScoreModal(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-40"
      >
        <FaTrophy size={24} />
      </button>

      {/* نافذة التصويت المنبثقة */}
      {/* نافذة التصويت المنبثقة */}
      {showSpyVoteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl border border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.5)] w-full max-w-md text-center">
            <h2 className="text-2xl font-bold text-cyan-300 mb-6">صوّت: مين الجاسوس؟ 🕵️</h2>
            
            {/* --- بداية الكود المطلوب --- */}
            <div className="grid grid-cols-2 gap-3">
              {players && players.length > 0 ? (
                players
                  .filter(p => p.id !== playerId) // بيشيل اسمك أنت من القائمة عشان ما تصوتش لنفسك
                  .map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleVoteSubmit(p.id)}
                      disabled={votedFor !== null}
                      className={`p-3 rounded-lg font-semibold transition-all shadow-md ${
                        votedFor === p.id 
                          ? 'bg-green-500 text-white scale-95' 
                          : votedFor 
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50' 
                            : 'bg-gray-700 hover:bg-cyan-600 text-white active:scale-95'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))
              ) : (
                <p className="col-span-2 text-gray-400 italic">لا يوجد لاعبين متاحين للتصويت حالياً</p>
              )}
            </div>
            {/* --- نهاية الكود المطلوب --- */}

            {votedFor && (
              <div className="mt-4 animate-pulse">
                <p className="text-green-400 font-medium">تم تسجيل تصويتك بنجاح!</p>
                <p className="text-gray-400 text-sm">في انتظار إنهاء الآدمن للتصويت...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* نافذة نتيجة الجاسوس */}
      {/* نافذة نتيجة الجاسوس المحدثة */}
      {spyResult && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className={`bg-gray-900 p-6 rounded-xl border-2 shadow-2xl w-full max-w-md text-center relative max-h-[90vh] overflow-y-auto
            ${spyResult.spyCaught ? 'border-green-500 shadow-green-500/50' : 'border-red-500 shadow-red-500/50'}`}>
            
            {/* زرار القفل اليدوي (لو حابب يقفلها قبل الأدمن) */}
            <button onClick={() => setSpyResult(null)} className="absolute top-3 right-3 text-gray-400 hover:text-white">
              <FaTimes size={20} />
            </button>

            {/* عرض صورة المكسب أو الخسارة */}
            <div className="flex justify-center mb-4">
              <img 
                src={spyResult.spyCaught 
                  ? `${process.env.PUBLIC_URL}/SPYIMAGES/spy-caught.png` 
                  : `${process.env.PUBLIC_URL}/SPYIMAGES/spy-escaped.png`} 
                alt={spyResult.spyCaught ? 'Caught' : 'Escaped'} 
                className="w-[500px] h-[200px] object-contain drop-shadow-lg"
                // لو الصور مش موجودة لسه في مجلد public هيتم إخفاء الخطأ برمجياً
                onError={(e) => e.target.style.display = 'none'} 
              />
            </div>

            {spyResult.spyCaught ? (
              <h2 className="text-3xl font-bold text-green-400 mb-2">الجاسوس اتكشف! 🎉</h2>
            ) : (
              <h2 className="text-3xl font-bold text-red-500 mb-2">الجاسوس هرب! 😈</h2>
            )}

            <p className="text-yellow-300 mt-2 mb-4 text-xl">الجاسوس كان: <span className="font-bold">{players.find(p => p.id === spyResult.spyId)?.name}</span></p>

            {/* مربع ملخص نقاط الجولة */}
            <div className="bg-gray-800 p-4 rounded-xl mt-4 border border-gray-600 text-right">
              <h3 className="text-cyan-300 font-bold mb-3 border-b border-gray-600 pb-2 text-center text-lg">📊 نقاط هذه الجولة</h3>
              <div className="space-y-2">
                {spyResult.roundScores.map((score, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-700/60 p-3 rounded-lg">
                    <span className="text-white font-semibold flex items-center gap-2">
                      {score.isSpy ? '🕵️' : '👨‍💼'} {score.name}
                    </span>
                    <span className={`font-bold px-3 py-1 rounded-md shadow-sm ${
                      score.pointsEarned > 0 ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
                    }`}>
                      {score.pointsEarned > 0 ? '+1 نقطة' : '0 نقطة'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* نافذة السكور المنبثقة */}
      {showScoreModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowScoreModal(false)}>
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-2xl border border-purple-500 shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-2"><FaTrophy /> الترتيب</h2>
              <button onClick={() => setShowScoreModal(false)} className="text-gray-400 hover:text-white"><FaTimes size={24}/></button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {sortedPlayers.map((p, index) => (
                <div key={p.id} className="flex justify-between bg-gray-800/80 p-3 rounded-lg border border-gray-700">
                  <span className="font-bold text-white flex items-center gap-2">
                    {index === 0 && <FaCrown className="text-yellow-400" />} {p.name}
                  </span>
                  <span className="bg-purple-600 text-white px-3 py-1 rounded-md font-bold">{p.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default PlayerScreen;