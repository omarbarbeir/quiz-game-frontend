import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import AdminPanel from './components/AdminPanel';
import PlayerScreen from './components/PlayerScreen';
import RoomJoin from './components/RoomJoin';
import Whiteboard from './components/Whiteboard';
import categories from './data/categories';
import questions from './data/questions';
import './index.css';

const SOCKET_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : 'https://ancient-prawn-omarelbarbeir-9282bb8f.koyeb.app';

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  secure: true,
});

function App() {
  useEffect(() => {
    const path = window.location.pathname;
    if (path.endsWith('/index.html')) {
      window.location.replace(path.replace('/index.html', ''));
    }
  }, []);
  
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [players, setPlayers] = useState([]);
  const [activePlayer, setActivePlayer] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameStatus, setGameStatus] = useState('lobby');
  const [buzzerLocked, setBuzzerLocked] = useState(false);
  const [showJoinScreen, setShowJoinScreen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [cardGameState, setCardGameState] = useState(null);

  // Session & unload effects...
  useEffect(() => {
    const savedState = sessionStorage.getItem('quizGameState');
    if (savedState) {
      const state = JSON.parse(savedState);
      setRoomCode(state.roomCode || '');
      setPlayerName(state.playerName || '');
      setPlayerId(state.playerId || '');
      setIsAdmin(state.isAdmin || false);
      setShowJoinScreen(state.showJoinScreen !== false);
    }
  }, []);

  useEffect(() => {
    if (!showJoinScreen) {
      const state = { roomCode, playerName, playerId, isAdmin, showJoinScreen };
      sessionStorage.setItem('quizGameState', JSON.stringify(state));
    } else {
      sessionStorage.removeItem('quizGameState');
    }
  }, [roomCode, playerName, playerId, isAdmin, showJoinScreen]);

  useEffect(() => {
    if (!showJoinScreen) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'If you reload this page, you will quit and lose your score';
        return e.returnValue;
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [showJoinScreen]);


  useEffect(() => {
    // استقبال قائمة اللاعبين المحدثة بالنقاط الجديدة من السيرفر
    socket.on('update_players', (updatedPlayers) => {
      setPlayers(updatedPlayers); // هنا setPlayers هتعمل بدون مشاكل
    });

    return () => {
      socket.off('update_players');
    };
  }, [socket]);

  // Socket listeners...
  useEffect(() => {
    socket.on('connect', () => console.log('Connected'));
    socket.on('disconnect', () => console.log('Disconnected'));
    socket.on('connect_error', (error) => console.error('Connection error:', error));

    const handleRoomCreated = (code) => {
      setRoomCode(code);
      setIsAdmin(true);
      setGameStatus('lobby');
      setShowJoinScreen(false);
      setPlayers([{ id: `admin_${Date.now()}`, name: "Quiz Master", score: 0, isAdmin: true }]);
    };
    
    const handlePlayerJoined = (newPlayer) => setPlayers(prev => [...prev, newPlayer]);
    
    const handlePlayerLeft = (leftPlayerId) => {
      setPlayers(prev => prev.filter(p => p.id !== leftPlayerId));
      if (activePlayer === leftPlayerId) {
        setActivePlayer(null);
        setBuzzerLocked(false);
      }
    };
    
    const handlePlayerBuzzed = (playerId) => {
      setActivePlayer(playerId);
      setBuzzerLocked(true);
      socket.emit('pause_audio', roomCode);
    };
    
    const handleUpdateScore = (updatedPlayer) => {
      setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    };

    // 🔥 1. دالة معالجة سكور الجاسوس (جديد)
    const handleSpyVotingResults = (data) => {
      if (data && data.players) {
        setPlayers(data.players); // تحديث وحفظ النقاط لكل اللاعيبة
      }
    };
    
    const handleResetBuzzer = () => {
      setActivePlayer(null);
      setBuzzerLocked(false);
    };
    
    const handleQuestionChanged = (question) => {
      setCurrentQuestion(question);
      setActivePlayer(null);
      setBuzzerLocked(false);
      setGameStatus('playing');
    };
    
    const handleGameEnded = () => setGameStatus('ended');
    
    const handleRoomClosed = () => {
      alert('The room has been closed by the admin.');
      resetGame();
    };
    
    const handlePlayerDisconnected = (data) => {
      alert(`${data.playerName} disconnected from the game`);
    };

    const handlePlayerPhotoQuestion = (photoData) => {
      if (photoData.playerId === playerId) {
        setCurrentQuestion(photoData.question);
        setActivePlayer(null);
        setBuzzerLocked(false);
        setGameStatus('playing');
      }
    };

    const handleCardGameStateUpdate = (gameState) => {
      console.log('🃏 Card game state updated:', gameState);
      setCardGameState(gameState);
      if (gameState && gameState.gameStarted) {
        setCurrentQuestion({ id: 'card-game', category: 'card-game', text: 'لعبة البطاقات', answer: '' });
        setGameStatus('playing');
      }
    };

    

    socket.on('room_created', handleRoomCreated);
    socket.on('player_joined', handlePlayerJoined);
    socket.on('player_left', handlePlayerLeft);
    socket.on('player_buzzed', handlePlayerBuzzed);
    socket.on('update_score', handleUpdateScore);
    // 🔥 2. تشغيل الاستماع لحدث الجاسوس (جديد)
    socket.on('spy_voting_results', handleSpyVotingResults);
    socket.on('reset_buzzer', handleResetBuzzer);
    socket.on('question_changed', handleQuestionChanged);
    socket.on('game_ended', handleGameEnded);
    socket.on('room_closed', handleRoomClosed);
    socket.on('player_disconnected', handlePlayerDisconnected);
    socket.on('player_photo_question', handlePlayerPhotoQuestion);
    socket.on('card_game_state_update', handleCardGameStateUpdate);

    return () => {
      socket.off('connect'); socket.off('disconnect'); socket.off('connect_error');
      socket.off('room_created', handleRoomCreated);
      socket.off('player_joined', handlePlayerJoined);
      socket.off('player_left', handlePlayerLeft);
      socket.off('player_buzzed', handlePlayerBuzzed);
      socket.off('update_score', handleUpdateScore);
      // 🔥 3. تنظيف الحدث عند الخروج (جديد)
      socket.off('spy_voting_results', handleSpyVotingResults);
      socket.off('reset_buzzer', handleResetBuzzer);
      socket.off('question_changed', handleQuestionChanged);
      socket.off('game_ended', handleGameEnded);
      socket.off('room_closed', handleRoomClosed);
      socket.off('player_disconnected', handlePlayerDisconnected);
      socket.off('player_photo_question', handlePlayerPhotoQuestion);
      socket.off('card_game_state_update', handleCardGameStateUpdate);
    };
  }, [activePlayer, roomCode, playerId]);

  const createRoom = () => socket.emit('create_room');

  const joinRoom = (code, name) => {
    if (code && name) {
      setRoomCode(code);
      setPlayerName(name);
      const id = `player_${Date.now()}`;
      setPlayerId(id);
      socket.emit('join_room', { roomCode: code, player: { id, name, score: 0 } });
      setShowJoinScreen(false);
    }
  };

  const handleBuzzer = () => {
    if (!buzzerLocked && currentQuestion) socket.emit('buzz', { roomCode, playerId });
  };

  const handleAdminBuzzer = () => {
    if (!buzzerLocked && currentQuestion) {
      const adminPlayer = players.find(p => p.isAdmin);
      if (adminPlayer) socket.emit('buzz', { roomCode, playerId: adminPlayer.id });
    }
  };

  const handleScoreChange = (playerId, change) => {
    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, score: p.score + change } : p));
    socket.emit('update_score', { roomCode, playerId, change });
    if (activePlayer === playerId) {
      setActivePlayer(null);
      setBuzzerLocked(false);
      socket.emit('reset_buzzer', roomCode);
    }
  };

  const playQuestion = (question) => {
    socket.emit('change_question', { roomCode, question });
    setActivePlayer(null);
    setBuzzerLocked(false);
  };

  // Shuffle helper
  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // ===== WHOAMI ROUND (unique photos) =====
  const startWhoamiRound = (subcategoryId) => {
    const photoQuestions = questions['random-photos']?.[subcategoryId];
    if (!photoQuestions || photoQuestions.length === 0) return;

    const nonAdminPlayers = players.filter(p => !p.isAdmin);
    if (nonAdminPlayers.length === 0) {
      playQuestion({ id: 'whoami', category: 'whoami', text: 'لا يوجد لاعبون', answer: '' });
      return;
    }

    const shuffled = shuffleArray(photoQuestions);
    const assignments = nonAdminPlayers.map((player, index) => ({
      playerId: player.id,
      question: {
        ...shuffled[index % shuffled.length],
        category: 'random-photos',
        subcategory: subcategoryId
      }
    }));

    // Send the whole assignments array to the server
    socket.emit('whoami_start', { roomCode, assignments });

    // Admin summary
    setCurrentQuestion({
      id: 'whoami',
      category: 'whoami',
      text: `تم توزيع صور فريدة على ${nonAdminPlayers.length} لاعبين`,
      answer: '',
      subcategory: subcategoryId
    });
    setGameStatus('playing');
    setActivePlayer(null);
    setBuzzerLocked(false);
    setCardGameState(null);
  };

  // ===== SPY ROUND (admin sees only word) =====
  const startSpyRound = () => {
    const words = questions.spyWords;
    if (!words || words.length === 0) return;
    
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const nonAdminPlayers = players.filter(p => !p.isAdmin);
    if (nonAdminPlayers.length === 0) {
      playQuestion({ id: 'spy', category: 'spy', text: 'لا يوجد لاعبون للجاسوس', answer: '' });
      return;
    }
    const spyPlayer = nonAdminPlayers[Math.floor(Math.random() * nonAdminPlayers.length)];

    const assignments = nonAdminPlayers.map(p => ({
      playerId: p.id,
      question: {
        id: 'spy',
        category: 'spy',
        text: p.id === spyPlayer.id ? 'Spy! You are the spy.' : randomWord,
        answer: '',
      }
    }));

    socket.emit('spy_start', { roomCode, assignments });

    // Admin sees word only
    setCurrentQuestion({
      id: 'spy',
      category: 'spy',
      text: `جولة الجاسوس – الكلمة: "${randomWord}"`,
      answer: '',
      spyWord: randomWord
    });
    setGameStatus('playing');
    setActivePlayer(null);
    setBuzzerLocked(false);
    setCardGameState(null);
  };

  const playRandomQuestion = () => {
    if (!selectedCategory) return;
    const mainCat = categories.find(c => c.id === selectedCategory);
    if (!mainCat) return;

    if (selectedCategory === 'flags') {
      const flagQuestions = questions.flags;
      if (!flagQuestions?.length) return;
      const randomQ = flagQuestions[Math.floor(Math.random() * flagQuestions.length)];
      playQuestion({ ...randomQ, category: 'flags' });
      return;
    }

    if (selectedCategory === 'spy') {
      startSpyRound();
      return;
    }

    if (selectedCategory === 'whoami') {
      if (!selectedSubcategory) return;
      startWhoamiRound(selectedSubcategory);
      return;
    }

    // ---------- GRID GAME ----------
    if (selectedCategory === 'grid-game') {
      socket.emit('grid_game_init', { roomCode });
      playQuestion({ id: 'grid-game', category: 'grid-game', text: 'الجدول', answer: '' });
      return;
    }

    if (selectedCategory === 'tic-tac-toe') {
      // Tic Tac Toe is started from AdminPanel, not here. Just set a placeholder question.
      playQuestion({ id: 'tic-tac-toe', category: 'tic-tac-toe', text: 'Tic Tac Toe', answer: '' });
      return;
    }

    if (selectedCategory === 'bingo') {
      socket.emit('bingo_init', { roomCode, playerId: '' });   // admin init
      playQuestion({ id: 'bingo', category: 'bingo', text: 'بينجو', answer: '' });
      return;
    }

    if (selectedCategory === 'battleship') {
      socket.emit('battleship_init', { roomCode, playerId: '' }); // admin init
      playQuestion({ id: 'battleship', category: 'battleship', text: 'حرب السفن', answer: '' });
      return;
    }

    if (selectedCategory === 'round16') {
      playQuestion({ id: 'round16', category: 'round16', text: 'دور الـ١٦', answer: '' });
      return;
    }

    if (mainCat.subcategories.length === 0) {
      if (selectedCategory === 'whiteboard') {
        playQuestion({ id: 'whiteboard', category: 'whiteboard', text: 'السبورة التعاونية', answer: '' });
      } else if (selectedCategory === 'card-game') {
        socket.emit('card_game_initialize', { roomCode });
        playQuestion({ id: 'card-game', category: 'card-game', text: 'لعبة البطاقات', answer: '' });
      }
      return;
    }
    if (!selectedSubcategory) return;

    let questionKey;
    if (selectedCategory === 'cinema') questionKey = selectedSubcategory;
    else if (selectedCategory === 'casino') questionKey = selectedSubcategory;
    else questionKey = selectedSubcategory;

    const questionList = questions[questionKey];
    if (!questionList?.length) return;
    playQuestion(questionList[Math.floor(Math.random() * questionList.length)]);
  };

  const resetBuzzer = () => {
    setActivePlayer(null);
    setBuzzerLocked(false);
    socket.emit('reset_buzzer', roomCode);
  };

  const endGame = () => socket.emit('end_game', roomCode);

  const leaveRoom = () => {
    socket.emit('leave_room', { roomCode, playerId });
    resetGame();
  };

  const resetGame = () => {
    setRoomCode(''); setPlayerName(''); setPlayerId(''); setIsAdmin(false);
    setPlayers([]); setActivePlayer(null); setCurrentQuestion(null);
    setGameStatus('lobby'); setBuzzerLocked(false); setShowJoinScreen(true);
    setSelectedCategory(null); setSelectedSubcategory(null); setCardGameState(null);
    sessionStorage.removeItem('quizGameState');
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(prev => prev === categoryId ? null : categoryId);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategoryId) => setSelectedSubcategory(subcategoryId);

  const exitCardGame = () => {
    setCardGameState(null);
    setCurrentQuestion(null);
    setGameStatus('playing');
  };

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950 text-white p-4">
      {showJoinScreen ? (
        <RoomJoin onCreateRoom={createRoom} onJoinRoom={joinRoom} />
      ) : isAdmin ? (
        <div className="max-w-6xl mx-auto">
          <AdminPanel 
            roomCode={roomCode} players={players} activePlayer={activePlayer}
            currentQuestion={currentQuestion} onScoreChange={handleScoreChange}
            onPlayQuestion={playQuestion} onPlayRandomQuestion={playRandomQuestion}
            onResetBuzzer={resetBuzzer} onEndGame={endGame} onLeaveRoom={leaveRoom}
            onAdminBuzzer={handleAdminBuzzer} gameStatus={gameStatus}
            categories={categories} selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory} onCategorySelect={handleCategorySelect}
            onSubcategorySelect={handleSubcategorySelect} socket={socket}
            questions={questions} buzzerLocked={buzzerLocked} isAdmin={true}
            cardGameState={cardGameState} onExitCardGame={exitCardGame}
          />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
          <PlayerScreen 
            playerId={playerId} playerName={playerName} roomCode={roomCode}
            players={players} activePlayer={activePlayer} currentQuestion={currentQuestion}
            onBuzzerPress={handleBuzzer} buzzerLocked={buzzerLocked} onLeaveRoom={leaveRoom}
            gameStatus={gameStatus} socket={socket} isAdmin={false}
            setCurrentQuestion={setCurrentQuestion} setActivePlayer={setActivePlayer}
            setBuzzerLocked={setBuzzerLocked} setGameStatus={setGameStatus}
            cardGameState={cardGameState} onExitCardGame={exitCardGame}
          />
        </div>
      )}
    </div>
  );
}

export default App;