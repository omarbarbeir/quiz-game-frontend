import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import AdminPanel from './components/AdminPanel';
import PlayerScreen from './components/PlayerScreen';
import RoomJoin from './components/RoomJoin';
import Whiteboard from './components/Whiteboard';
import categories from './data/categories';
import questions from './data/questions';

// Use relative path for development, absolute for production
const SOCKET_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001' 
  : 'https://ancient-prawn-omarelbarbeir-9282bb8f.koyeb.app';

// ENHANCED: Improved socket configuration with better reconnection and heartbeat
const socketConfig = {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 20, // Increased from Infinity to prevent infinite loops
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000, // Increased from 5000
  timeout: 30000, // Increased from 20000
  secure: true,
  forceNew: true,
  autoConnect: false, // We'll manually connect after setup
  closeOnBeforeunload: false, // Prevent closing on page unload
};

let socket = null;

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
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastSocketId, setLastSocketId] = useState(null);

  // Initialize socket once
  useEffect(() => {
    if (!socket) {
      console.log('🔄 Initializing socket connection...');
      socket = io(SOCKET_URL, socketConfig);
      setLastSocketId(socket.id);
    }

    return () => {
      // Don't disconnect on component unmount, only on page close
    };
  }, []);

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
    if (!socket) return;

    // NEW: Connection status handlers with better logging
    const handleConnect = () => {
      console.log('✅ Connected to backend server. Socket ID:', socket.id);
      setConnectionStatus('connected');
      setReconnectAttempts(0);
      
      // Rejoin room if we have saved state
      const savedState = sessionStorage.getItem('quizGameState');
      if (savedState) {
        const state = JSON.parse(savedState);
        if (state.roomCode && state.playerId && state.playerName) {
          console.log('🔄 Attempting to rejoin room:', state.roomCode);
          socket.emit('rejoin_room', { 
            roomCode: state.roomCode, 
            player: { 
              id: state.playerId, 
              name: state.playerName, 
              score: 0 
            } 
          });
        }
      }
    };

    const handleDisconnect = (reason) => {
      console.log('❌ Disconnected from backend server:', reason);
      setConnectionStatus('disconnected');
      
      // Auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect' || reason === 'transport close') {
        console.log('🔄 Auto-reconnecting after server disconnect...');
        socket.connect();
      }
    };

    const handleConnectError = (error) => {
      console.error('🔌 Connection error:', error);
      setConnectionStatus('error');
      setReconnectAttempts(prev => prev + 1);
    };

    const handleReconnect = (attemptNumber) => {
      console.log(`🔄 Reconnected to server (attempt ${attemptNumber})`);
      setConnectionStatus('connected');
      setReconnectAttempts(0);
    };

    const handleReconnectAttempt = (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
      setConnectionStatus('reconnecting');
      setReconnectAttempts(attemptNumber);
    };

    const handleReconnectFailed = () => {
      console.error('❌ Reconnection failed after all attempts');
      setConnectionStatus('failed');
    };

    const handleReconnectError = (error) => {
      console.error('❌ Reconnection error:', error);
    };

    // Game event handlers
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

    const handlePlayerPhotoQuestion = (photoData) => {
      if (photoData.playerId === playerId) {
        setCurrentQuestion(photoData);
        setActivePlayer(null);
        setBuzzerLocked(false);
        setGameStatus('playing');
      }
    };

    const handleCardGameStateUpdate = (gameState) => {
      console.log('🃏 Card game state updated in App:', gameState);
      setCardGameState(gameState);
      
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
      console.error('Card game error:', errorData);
      if (errorData.message.includes('Game not found') || errorData.message.includes('Room not found')) {
        setCardGameState(null);
        alert('Game session was lost. Please rejoin the room.');
      }
    };

    const handleRejoinSuccess = (roomData) => {
      console.log('✅ Successfully rejoined room:', roomData);
      setPlayers(roomData.players || []);
      if (roomData.cardGame) {
        setCardGameState(roomData.cardGame);
      }
      setConnectionStatus('connected');
    };

    const handleRejoinFailed = () => {
      console.log('❌ Failed to rejoin room, resetting game');
      resetGame();
    };

    // NEW: Ping/pong for connection health monitoring
    const handlePong = () => {
      console.log('❤️ Received pong from server');
    };

    // Register all event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('reconnect', handleReconnect);
    socket.on('reconnect_attempt', handleReconnectAttempt);
    socket.on('reconnect_failed', handleReconnectFailed);
    socket.on('reconnect_error', handleReconnectError);
    socket.on('pong', handlePong);

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
    socket.on('card_game_state_update', handleCardGameStateUpdate);
    socket.on('card_game_error', handleCardGameError);
    socket.on('rejoin_success', handleRejoinSuccess);
    socket.on('rejoin_failed', handleRejoinFailed);

    // Manually connect if not already connected
    if (!socket.connected) {
      console.log('🔌 Manually connecting socket...');
      socket.connect();
    }

    // NEW: Set up heartbeat
    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping');
      }
    }, 15000); // Send ping every 15 seconds

    return () => {
      // Clean up event listeners but don't disconnect socket
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('reconnect', handleReconnect);
      socket.off('reconnect_attempt', handleReconnectAttempt);
      socket.off('reconnect_failed', handleReconnectFailed);
      socket.off('reconnect_error', handleReconnectError);
      socket.off('pong', handlePong);

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
      socket.off('card_game_state_update', handleCardGameStateUpdate);
      socket.off('card_game_error', handleCardGameError);
      socket.off('rejoin_success', handleRejoinSuccess);
      socket.off('rejoin_failed', handleRejoinFailed);

      clearInterval(heartbeatInterval);
    };
  }, [activePlayer, roomCode, playerId, showJoinScreen]);

  const createRoom = () => {
    if (socket && connectionStatus === 'connected') {
      socket.emit('create_room');
    } else {
      alert('Cannot create room: Not connected to server');
    }
  };

  const joinRoom = (code, name) => {
    if (code && name) {
      if (socket && connectionStatus === 'connected') {
        setRoomCode(code);
        setPlayerName(name);
        const id = `player_${Date.now()}`;
        setPlayerId(id);
        socket.emit('join_room', { roomCode: code, player: { id, name, score: 0 } });
        setShowJoinScreen(false);
      } else {
        alert('Cannot join room: Not connected to server');
      }
    }
  };

  const handleBuzzer = () => {
    if (!buzzerLocked && currentQuestion && connectionStatus === 'connected' && socket) {
      socket.emit('buzz', { roomCode, playerId });
    }
  };

  const handleAdminBuzzer = () => {
    if (!buzzerLocked && currentQuestion && connectionStatus === 'connected' && socket) {
      const adminPlayer = players.find(p => p.isAdmin);
      if (adminPlayer) {
        socket.emit('buzz', { roomCode, playerId: adminPlayer.id });
      }
    }
  };

  const handleScoreChange = (playerId, change) => {
    if (connectionStatus !== 'connected' || !socket) return;
    
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
    if (connectionStatus !== 'connected' || !socket) return;
    
    socket.emit('change_question', { roomCode, question });
    setActivePlayer(null);
    setBuzzerLocked(false);
  };

  const playRandomQuestion = () => {
    if (connectionStatus !== 'connected' || !socket) return;
    
    if (selectedCategory === 'whiteboard') {
      playQuestion({
        id: 'whiteboard',
        category: 'whiteboard',
        text: 'السبورة التعاونية',
        answer: ''
      });
    }
    else if (selectedCategory === 'card-game') {
      socket.emit('card_game_initialize', { roomCode });
      playQuestion({
        id: 'card-game',
        category: 'card-game',
        text: 'لعبة البطاقات',
        answer: ''
      });
    }
    else if (selectedCategory === 'random-photos' && selectedSubcategory) {
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
    if (connectionStatus !== 'connected' || !socket) return;
    
    setActivePlayer(null);
    setBuzzerLocked(false);
    socket.emit('reset_buzzer', roomCode);
  };

  const endGame = () => {
    if (connectionStatus !== 'connected' || !socket) return;
    
    socket.emit('end_game', roomCode);
  };

  const leaveRoom = () => {
    if (socket && connectionStatus === 'connected') {
      socket.emit('leave_room', { roomCode, playerId });
    }
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
    setCardGameState(null);
    sessionStorage.removeItem('quizGameState');
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategorySelect = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
  };

  // ENHANCED: Manual reconnection with socket recreation
  const handleReconnect = () => {
    console.log('🔄 Manual reconnection attempt');
    setConnectionStatus('reconnecting');
    
    if (socket) {
      socket.disconnect(); // Clean up old socket
    }
    
    // Create new socket instance
    socket = io(SOCKET_URL, socketConfig);
    socket.connect();
  };

  // NEW: Force refresh when connection is completely stuck
  const handleForceRefresh = () => {
    console.log('🔄 Force refreshing page...');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 text-white p-4">
      {/* Enhanced Connection Status Banner */}
      {connectionStatus !== 'connected' && (
        <div className={`fixed top-0 left-0 right-0 z-50 p-3 text-center font-bold ${
          connectionStatus === 'reconnecting' ? 'bg-yellow-600' : 
          connectionStatus === 'disconnected' ? 'bg-orange-600' : 
          connectionStatus === 'error' ? 'bg-red-600' : 'bg-gray-600'
        }`}>
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <span>
              {connectionStatus === 'reconnecting' && `🔄 جاري إعادة الاتصال... (المحاولة ${reconnectAttempts})`}
              {connectionStatus === 'disconnected' && '❌ الاتصال مقطوع - جاري إعادة المحاولة...'}
              {connectionStatus === 'error' && '❌ خطأ في الاتصال'}
              {connectionStatus === 'failed' && '❌ فشل الاتصال بعد عدة محاولات'}
            </span>
            <div className="flex gap-2">
              <button 
                onClick={handleReconnect}
                className="bg-white text-red-600 px-3 py-1 rounded text-sm font-bold"
              >
                إعادة الاتصال
              </button>
              {connectionStatus === 'failed' && (
                <button 
                  onClick={handleForceRefresh}
                  className="bg-white text-blue-600 px-3 py-1 rounded text-sm font-bold"
                >
                  تحديث الصفحة
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showJoinScreen ? (
        <RoomJoin onCreateRoom={createRoom} onJoinRoom={joinRoom} connectionStatus={connectionStatus} />
      ) : isAdmin ? (
        <div className="max-w-6xl mx-auto">
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
            cardGameState={cardGameState}
            connectionStatus={connectionStatus}
          />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto">
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
            cardGameState={cardGameState}
            connectionStatus={connectionStatus}
          />
        </div>
      )}
    </div>
  );
}

export default App;