import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import AdminPanel from './components/AdminPanel';
import PlayerScreen from './components/PlayerScreen';
import RoomJoin from './components/RoomJoin';
import categories from './data/categories';
import questions from './data/questions';

// Use relative path for development, absolute for production
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
      const state = {
        roomCode,
        playerName,
        playerId,
        isAdmin,
        showJoinScreen
      };
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

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [showJoinScreen]);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to backend server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from backend server');
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    const handleRoomCreated = (code) => {
      setRoomCode(code);
      setIsAdmin(true);
      setGameStatus('lobby');
      setShowJoinScreen(false);
      
      const adminPlayer = {
        id: `admin_${Date.now()}`,
        name: "Quiz Master",
        score: 0,
        isAdmin: true
      };
      setPlayers([adminPlayer]);
    };
    
    const handlePlayerJoined = (newPlayer) => {
      setPlayers(prev => [...prev, newPlayer]);
    };
    
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
      setPlayers(prev => 
        prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
      );
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
    
    const handleGameEnded = () => {
      setGameStatus('ended');
    };
    
    const handleRoomClosed = () => {
      alert('The room has been closed by the admin.');
      resetGame();
    };
    
    const handlePlayerDisconnected = (data) => {
      alert(`${data.playerName} disconnected from the game`);
    };

    // Handle individual photo questions
    const handlePlayerPhotoQuestion = (photoData) => {
      // Only set the question if it's for this player
      if (photoData.playerId === playerId) {
        setCurrentQuestion(photoData);
        setActivePlayer(null);
        setBuzzerLocked(false);
        setGameStatus('playing');
      }
    };

    socket.on('room_created', handleRoomCreated);
    socket.on('player_joined', handlePlayerJoined);
    socket.on('player_left', handlePlayerLeft);
    socket.on('player_buzzed', handlePlayerBuzzed);
    socket.on('update_score', handleUpdateScore);
    socket.on('reset_buzzer', handleResetBuzzer);
    socket.on('question_changed', handleQuestionChanged);
    socket.on('game_ended', handleGameEnded);
    socket.on('room_closed', handleRoomClosed);
    socket.on('player_disconnected', handlePlayerDisconnected);
    socket.on('player_photo_question', handlePlayerPhotoQuestion);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('room_created', handleRoomCreated);
      socket.off('player_joined', handlePlayerJoined);
      socket.off('player_left', handlePlayerLeft);
      socket.off('player_buzzed', handlePlayerBuzzed);
      socket.off('update_score', handleUpdateScore);
      socket.off('reset_buzzer', handleResetBuzzer);
      socket.off('question_changed', handleQuestionChanged);
      socket.off('game_ended', handleGameEnded);
      socket.off('room_closed', handleRoomClosed);
      socket.off('player_disconnected', handlePlayerDisconnected);
      socket.off('player_photo_question', handlePlayerPhotoQuestion);
    };
  }, [activePlayer, roomCode, playerId]);

  const createRoom = () => {
    socket.emit('create_room');
  };

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
    if (!buzzerLocked && currentQuestion) {
      socket.emit('buzz', { roomCode, playerId });
    }
  };

  const handleAdminBuzzer = () => {
    if (!buzzerLocked && currentQuestion) {
      const adminPlayer = players.find(p => p.isAdmin);
      if (adminPlayer) {
        socket.emit('buzz', { roomCode, playerId: adminPlayer.id });
      }
    }
  };

  const handleScoreChange = (playerId, change) => {
    setPlayers(prev => 
      prev.map(p => 
        p.id === playerId ? {...p, score: p.score + change} : p
      )
    );
    
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

  const playRandomQuestion = () => {
    if (selectedCategory === 'random-photos' && selectedSubcategory) {
      // Use server to handle random photo distribution
      socket.emit('play_random_question', { 
        roomCode, 
        subcategoryId: selectedSubcategory 
      });
    } else if (selectedCategory === 'photos') {
      const subcategories = Object.keys(questions[selectedCategory]);
      if (subcategories.length > 0) {
        const randomSubcat = subcategories[Math.floor(Math.random() * subcategories.length)];
        const subcatQuestions = questions[selectedCategory][randomSubcat];
        if (subcatQuestions && subcatQuestions.length > 0) {
          const randomIndex = Math.floor(Math.random() * subcatQuestions.length);
          const randomQuestion = {
            ...subcatQuestions[randomIndex],
            category: 'photos'
          };
          playQuestion(randomQuestion);
        }
      }
    } else if (selectedCategory && Array.isArray(questions[selectedCategory])) {
      const categoryQuestions = questions[selectedCategory];
      if (categoryQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * categoryQuestions.length);
        const randomQuestion = categoryQuestions[randomIndex];
        playQuestion(randomQuestion);
      }
    } else if (selectedCategory && questions[selectedCategory]) {
      const subcategories = Object.keys(questions[selectedCategory]);
      if (subcategories.length > 0) {
        const randomSubcat = subcategories[Math.floor(Math.random() * subcategories.length)];
        const subcatQuestions = questions[selectedCategory][randomSubcat];
        if (subcatQuestions && subcatQuestions.length > 0) {
          const randomIndex = Math.floor(Math.random() * subcatQuestions.length);
          const randomQuestion = subcatQuestions[randomIndex];
          playQuestion(randomQuestion);
        }
      }
    }
  };

  const resetBuzzer = () => {
    setActivePlayer(null);
    setBuzzerLocked(false);
    socket.emit('reset_buzzer', roomCode);
  };

  const endGame = () => {
    socket.emit('end_game', roomCode);
  };

  const leaveRoom = () => {
    socket.emit('leave_room', { roomCode, playerId });
    resetGame();
  };

  const resetGame = () => {
    setRoomCode('');
    setPlayerName('');
    setPlayerId('');
    setIsAdmin(false);
    setPlayers([]);
    setActivePlayer(null);
    setCurrentQuestion(null);
    setGameStatus('lobby');
    setBuzzerLocked(false);
    setShowJoinScreen(true);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    sessionStorage.removeItem('quizGameState');
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 text-white p-4">
      {showJoinScreen ? (
        <RoomJoin onCreateRoom={createRoom} onJoinRoom={joinRoom} />
      ) : isAdmin ? (
        <AdminPanel 
          roomCode={roomCode}
          players={players}
          activePlayer={activePlayer}
          currentQuestion={currentQuestion}
          onScoreChange={handleScoreChange}
          onPlayQuestion={playQuestion}
          onPlayRandomQuestion={playRandomQuestion}
          onResetBuzzer={resetBuzzer}
          onEndGame={endGame}
          onLeaveRoom={leaveRoom}
          onAdminBuzzer={handleAdminBuzzer}
          gameStatus={gameStatus}
          categories={categories}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onCategorySelect={handleCategorySelect}
          onSubcategorySelect={handleSubcategorySelect}
          socket={socket}
          questions={questions}
          buzzerLocked={buzzerLocked}
          isAdmin={true}
          randomPhotosCategory={categories.find(c => c.id === 'random-photos')}
        />
      ) : (
        <PlayerScreen 
          playerId={playerId}
          playerName={playerName}
          roomCode={roomCode}
          players={players}
          activePlayer={activePlayer}
          currentQuestion={currentQuestion}
          onBuzzerPress={handleBuzzer}
          buzzerLocked={buzzerLocked}
          onLeaveRoom={leaveRoom}
          gameStatus={gameStatus}
          socket={socket}
          isAdmin={false}
          setCurrentQuestion={setCurrentQuestion}
          setActivePlayer={setActivePlayer}
          setBuzzerLocked={setBuzzerLocked}
          setGameStatus={setGameStatus}
        />
      )}
    </div>
  );
}

export default App;