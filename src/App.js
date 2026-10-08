import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import AdminPanel from './components/AdminPanel';
import PlayerScreen from './components/PlayerScreen';
import RoomJoin from './components/RoomJoin';
// import Whiteboard from './components/Whiteboard';
import categories from './data/categories';
import questions from './data/questions';
import DigitalDetectiveGame from './components/DigitalDetectiveGame';
import MovieTacToe from './components/MovieTacToe';
import HorrorGame from './components/HorrorGame';
import CivilRegistryGame from './components/CivilRegistryGame';
import './index.css';
import UrbexApp from './components/UrbexApp'
import CourtGame from './components/CourtGame';
import BankElHazGame from './components/BankElHazGame';
import TrapOpponent from './components/TrapOpponent';
import GuessOpponent from './components/GuessOpponent';
import HeadsUp from './components/HeadsUp';
import MovieQuiz from './components/MovieQuiz';
import Investigation from './components/Investigation';
import Codenames from './components/Codenames';
import Taboo from './components/Taboo';
import Basra from './components/Basra';
import Bank from './components/Bank';
import Shayeb from './components/Shayeb';
import Crazy8 from './components/Crazy8';
import Solitaire from './components/Solitaire';
import Spider from './components/Spider';
import MemoryGrid from './components/MemoryGrid';
import Chess from './components/Chess';
import Backgammon from './components/Backgammon';
import SnakesLadders from './components/SnakesLadders';
// import EscapeRoomApp from './components/EscapeRoom/EscapeRoomApp';
import SwordRound from './components/SwordRound';
import BracketRound from './components/BracketRound';
import MainMenu from './components/EscapeRoom/MainMenu';
import StoryGame from './components/EscapeRoom/StoryGame';
import SpyRound from './components/SpyRound';


function LobbyFullscreenButton() {
  const [isFs, setIsFs] = React.useState(false);

  React.useEffect(() => {
    const h = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const toggle = async () => {
    try {
      if (!document.fullscreenElement) {
        const el = document.documentElement;
        (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
      } else {
        (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
      }
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      style={{
        position: 'fixed',
        top: 12,
        right: 12,
        zIndex: 9999,
        padding: '10px 16px',
        borderRadius: 12,
        border: '1px solid rgba(251,191,36,0.5)',
        background: 'linear-gradient(155deg, rgba(251,191,36,0.2), rgba(217,119,6,0.1))',
        color: '#fcd34d',
        fontWeight: 800,
        fontSize: 13,
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
      }}
    >
      {isFs ? '⛶ تصغير' : '⛶ ملء الشاشة'}
    </button>
  );
}

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
  const [currentGame, setCurrentGame] = useState(null);
  const [kotshinaMode, setKotshinaMode] = useState('basra');   // ✅ طور كوتشينة الحالي
  const [selectedStoryId, setSelectedStoryId] = useState(null);

  const [showSpyVoteModal, setShowSpyVoteModal] = useState(false);
  const [votedFor, setVotedFor] = useState(null);
  const [spyResult, setSpyResult] = useState(null);

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
    socket.on('update_players', (updatedPlayers) => {
      setPlayers(updatedPlayers);
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

    const handleRoomCreated = ({ roomCode: code, adminPlayer }) => {
      setRoomCode(code);
      setPlayerId(adminPlayer.id);      // ✅ playerId حقيقي
      setPlayerName(adminPlayer.name);  // ✅ الاسم اللي دخّله
      setIsAdmin(true);
      setGameStatus('lobby');
      setShowJoinScreen(false);
      setPlayers([adminPlayer]);        // ✅ السيرفر بعت adminPlayer
    };
    
    const handlePlayerJoined = (newPlayer) => {
      setPlayers(prev => {
        if (prev.some(p => p.id === newPlayer.id)) return prev;
        return [...prev, newPlayer];
      });
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
      setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    };

    const handleSpyVotingResults = (data) => {
      if (data && data.players) setPlayers(data.players);
      setSpyResult(data);
      setShowSpyVoteModal(false);
    };

    const handleOpenSpyVoting = () => {
      setShowSpyVoteModal(true);
      setVotedFor(null);
    };
    
    const handleResetBuzzer = () => {
      setActivePlayer(null);
      setBuzzerLocked(false);
    };
    
    const handleQuestionChanged = (question) => {
       console.log('🎵 وصل:', {
        category: question?.category,
        hasAudio: !!question?.audio,
        hasAudio2: !!question?.audio2,
        id: question?.id,
      });
      setCurrentQuestion(question);
      setActivePlayer(null);
      setBuzzerLocked(false);
      setGameStatus('playing');
    };
    
    const handleGameEnded = () => setGameStatus('ended');
    
    const handleRoomClosed = () => {
      alert('المسؤول أغلق الغرفة. يلا نرجع للصفحة الرئيسية!');
      resetGame();
      setShowJoinScreen(true);
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

    const handleStartDigitalDetective = () => {
      setCurrentGame('digital_detective');
      setCurrentQuestion({ 
        id: 'digital_detective', 
        category: 'digital_detective', 
        text: 'المحقق الرقمي', 
        answer: '' 
      });
      setGameStatus('playing');
    };

    // ✅ تبديل طور كوتشينة (بصرة ↔ بنك)
    const handleKotshinaModeChanged = ({ mode }) => {
      setKotshinaMode(mode);
    };
    socket.on('kotshina_mode_changed', handleKotshinaModeChanged);

    const handleGameLaunched = ({ gameId }) => {
      // ✅ غرفة الهروب → نفتح بوابة القصص، مش القصة نفسها
      if (gameId === 'escape_room') {
        setCurrentGame('escape_room_hub');
        return;
      }
      setCurrentGame(gameId);
      setGameStatus('playing');
    };
    const handleGameClosed = () => {
      setCurrentGame(null);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setCurrentQuestion(null);
      setCardGameState(null);
      setGameStatus('playing');
      setActivePlayer(null);
      setBuzzerLocked(false);
    };

    socket.on('room_created', handleRoomCreated);
    socket.on('player_joined', handlePlayerJoined);
    socket.on('player_left', handlePlayerLeft);
    socket.on('player_buzzed', handlePlayerBuzzed);
    socket.on('update_score', handleUpdateScore);
    socket.on('spy_voting_results', handleSpyVotingResults);
    socket.on('open_spy_voting', handleOpenSpyVoting);
    socket.on('reset_buzzer', handleResetBuzzer);
    socket.on('question_changed', handleQuestionChanged);
    socket.on('game_ended', handleGameEnded);
    socket.on('room_closed', handleRoomClosed);
    socket.on('player_disconnected', handlePlayerDisconnected);
    socket.on('player_photo_question', handlePlayerPhotoQuestion);
    socket.on('card_game_state_update', handleCardGameStateUpdate);
    socket.on('start_digital_detective', handleStartDigitalDetective);
    socket.on('game_launched', handleGameLaunched);
    socket.on('game_closed', handleGameClosed);
    socket.on('spy_back_to_lobby', handleSpyBackToLobby);

    return () => {
      socket.off('connect'); socket.off('disconnect'); socket.off('connect_error');
      socket.off('room_created', handleRoomCreated);
      socket.off('player_joined', handlePlayerJoined);
      socket.off('player_left', handlePlayerLeft);
      socket.off('player_buzzed', handlePlayerBuzzed);
      socket.off('update_score', handleUpdateScore);
      socket.off('spy_voting_results', handleSpyVotingResults);
      socket.off('open_spy_voting', handleOpenSpyVoting);
      socket.off('reset_buzzer', handleResetBuzzer);
      socket.off('question_changed', handleQuestionChanged);
      socket.off('game_ended', handleGameEnded);
      socket.off('room_closed', handleRoomClosed);
      socket.off('player_disconnected', handlePlayerDisconnected);
      socket.off('player_photo_question', handlePlayerPhotoQuestion);
      socket.off('card_game_state_update', handleCardGameStateUpdate);
      socket.off('start_digital_detective', handleStartDigitalDetective);
      socket.off('game_launched', handleGameLaunched);
      socket.off('game_closed', handleGameClosed);
      socket.off('spy_back_to_lobby', handleSpyBackToLobby);
      socket.off('kotshina_mode_changed', handleKotshinaModeChanged);   // ✅ التنظيف في مكانه الصح
    };
  }, [activePlayer, roomCode, playerId]);

  const createRoom = (adminName) => {
    socket.emit('create_room', { playerName: adminName });
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

  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const handleSpyVote = (targetId) => {
    setVotedFor(targetId);
    socket.emit('submit_spy_vote', { roomCode, voterId: playerId, votedForId: targetId });
  };

  const handleSpyNewRound = () => {
    setSpyResult(null);
    setVotedFor(null);
    setShowSpyVoteModal(false);
    setCurrentQuestion(null);
  };

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

    socket.emit('whoami_start', { roomCode, assignments });

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


  // const handleSpyBackToCategories = () => {
  //   // صفّر حالة الجاسوس في الفرونت
  //   setCurrentQuestion(null);
  //   setShowSpyVoteModal(false);
  //   setVotedFor(null);
  //   setSpyResult(null);
  //   // ✅ مهم: لا ترسل leave_room ولا close_game، فيبقى الجميع في الغرفة
  //   setGameStatus('playing');
  //   setSelectedCategory(null);
  //   setSelectedSubcategory(null);
  // };

  const handleSpyBackToLobby = () => {
    setCurrentQuestion(null);
    setShowSpyVoteModal(false);
    setVotedFor(null);
    setSpyResult(null);
    setGameStatus('playing');
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const playRandomQuestion = () => {
    if (!selectedCategory) return;
    const mainCat = categories.find(c => c.id === selectedCategory);
    if (!mainCat) return;

    if (selectedCategory === 'spy') { startSpyRound(); return; }

    if (selectedCategory === 'whoami') {
      socket.emit('whoami_reset', { roomCode });
      playQuestion({ id: 'whoami', category: 'whoami', text: 'أنا مين', answer: '' });
      return;
    }

    if (selectedCategory === 'grid-game') {
      socket.emit('grid_game_init', { roomCode });
      playQuestion({ id: 'grid-game', category: 'grid-game', text: 'الجدول', answer: '' });
      return;
    }

    if (selectedCategory === 'tic-tac-toe') {
      playQuestion({ id: 'tic-tac-toe', category: 'tic-tac-toe', text: 'Tic Tac Toe', answer: '' });
      return;
    }

    if (selectedCategory === 'bingo') {
      socket.emit('bingo_init', { roomCode, playerId: '' });
      playQuestion({ id: 'bingo', category: 'bingo', text: 'بينجو', answer: '' });
      return;
    }

    if (selectedCategory === 'battleship') {
      socket.emit('battleship_init', { roomCode, playerId: '' });
      playQuestion({ id: 'battleship', category: 'battleship', text: 'حرب السفن', answer: '' });
      return;
    }

    if (selectedCategory === 'digital_detective') {
      setCurrentGame('digital_detective');
      socket.emit('start_digital_detective', { roomCode });
      playQuestion({ id: 'digital_detective', category: 'digital_detective', text: 'المحقق الرقمي', answer: '' });
      return;
    }

    if (selectedCategory === 'movie_tac_toe') { socket.emit('launch_game', { roomCode, gameId: 'movie_tac_toe' }); return; }
    if (selectedCategory === 'horror_game') { socket.emit('launch_game', { roomCode, gameId: 'horror_game' }); return; }
    if (selectedCategory === 'civil_registry') { socket.emit('launch_game', { roomCode, gameId: 'civil_registry' }); return; }
    if (selectedCategory === 'urbex_game') { socket.emit('launch_game', { roomCode, gameId: 'urbex_game' }); return; }
    if (selectedCategory === 'court_game') { socket.emit('launch_game', { roomCode, gameId: 'court_game' }); return; }
    if (selectedCategory === 'bank_el_haz') { socket.emit('launch_game', { roomCode, gameId: 'bank_el_haz' }); return; }
    if (selectedCategory === 'trap_opponent') { socket.emit('launch_game', { roomCode, gameId: 'trap_opponent' }); return; }
    if (selectedCategory === 'guess_opponent') { socket.emit('launch_game', { roomCode, gameId: 'guess_opponent' }); return; }
    if (selectedCategory === 'heads_up') { socket.emit('launch_game', { roomCode, gameId: 'heads_up' }); return; }
    if (selectedCategory === 'movie_quiz') { socket.emit('launch_game', { roomCode, gameId: 'movie_quiz' }); return; }
    if (selectedCategory === 'investigation') { socket.emit('launch_game', { roomCode, gameId: 'investigation' }); return; }
    if (selectedCategory === 'codenames') { socket.emit('launch_game', { roomCode, gameId: 'codenames' }); return; }
    if (selectedCategory === 'taboo') { socket.emit('launch_game', { roomCode, gameId: 'taboo' }); return; }

    // ✅ بصرة وبنك الاتنين بيفتحوا kotshina، بس بـ mode مختلف
    if (selectedCategory === 'basra') {
      setKotshinaMode('basra');
      socket.emit('launch_game', { roomCode, gameId: 'kotshina' });
      return;
    }

    if (selectedCategory === 'memory') {
      socket.emit('launch_game', { roomCode, gameId: 'memory' });
      return;
    }

    if (selectedCategory === 'chess') {
      socket.emit('launch_game', { roomCode, gameId: 'chess' });
      return;
    }

    if (selectedCategory === 'backgammon') {
      socket.emit('launch_game', { roomCode, gameId: 'backgammon' });
      return;
    }

    if (selectedCategory === 'snakes') {
      socket.emit('launch_game', { roomCode, gameId: 'snakes' });
      return;
    }

    // if (selectedCategory === 'escape_room') {
    //   socket.emit('launch_game', { roomCode, gameId: 'escape_room' });
    //   return;
    // }

    if (selectedCategory === 'escape_room') {
      setCurrentGame('escape_room_hub');
      return;
    }

    if (selectedCategory === 'music' || selectedSubcategory === 'music') {
      socket.emit('music_start', { roomCode });
      return;
    }

    if (selectedCategory === 'reverse' || selectedSubcategory === 'reverse') {
      socket.emit('reverse_start', { roomCode });
      return;
    }

    if (selectedCategory === 'who-said' || selectedSubcategory === 'who-said') {
      socket.emit('who_said_start', { roomCode });
      return;
    }

    if (selectedCategory === 'put-word-in-song' || selectedSubcategory === 'put-word-in-song') {
      socket.emit('put_word_start', { roomCode });
      return;
    }

    if (selectedCategory === 'song-for' || selectedSubcategory === 'song-for') {
      socket.emit('song_for_start', { roomCode });
      return;
    }

    if (selectedCategory === 'cinema' && (selectedSubcategory === 'before-2000' || selectedSubcategory === 'after-2000')) {
      const sub = selectedSubcategory === 'before-2000' ? 'history' : 'cinema';
      socket.emit('cinema_start', { roomCode, subcategory: sub });
      return;
    }

    if (selectedCategory === 'flags') {
      socket.emit('flags_start', { roomCode });
      return;
    }

    if (selectedCategory === 'autobis') {
      playQuestion({ id: 'autobis', category: 'autobis', text: 'أتوبيس كومبليت', answer: '' });
      return;
    }

    if (selectedCategory === 'sword-of-knowledge') { 
      socket.emit('launch_game', { roomCode, gameId: 'sword_of_knowledge' }); 
      return; 
    }

    if (selectedCategory === 'hangman') {
      socket.emit('launch_game', { roomCode, gameId: 'hangman' });
      return;
    }

    if (selectedCategory === 'round16') {
      socket.emit('launch_game', { roomCode, gameId: 'round16' });
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

    let questionKey = selectedSubcategory;
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
    setCurrentGame(null);
    setKotshinaMode('basra');   // ✅ إعادة تعيين طور كوتشينة
    sessionStorage.removeItem('quizGameState');
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(prev => prev === categoryId ? null : categoryId);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategoryId) => setSelectedSubcategory(subcategoryId);

  
  // ✅ دالة موحدة لإغلاق أي لعبة — بتصفّر كل حاجة فورًا
  const closeGame = () => {
    socket.emit('close_game', { roomCode });
    setCurrentGame(null);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setCurrentQuestion(null);
    setCardGameState(null);
    setGameStatus('playing');
    setActivePlayer(null);
    setBuzzerLocked(false);
  };
  
  
  const exitCardGame = () => {
    setCardGameState(null);
    setCurrentQuestion(null);
    setGameStatus('playing');
  };

  return (
      <div className="min-h-screen text-white overflow-x-hidden" style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a1410 0%, #0a0a0a 70%)' }}>
        {showJoinScreen && <LobbyFullscreenButton />}
      {showJoinScreen ? (
        <RoomJoin onCreateRoom={createRoom} onJoinRoom={joinRoom} />

      ) : currentGame === 'horror_game' ? (
        <HorrorGame
          socket={socket} roomCode={roomCode} players={players}
          currentPlayer={players.find(p => isAdmin ? p.isAdmin : p.id === playerId)}
          isAdmin={isAdmin}
          onExit={() => socket.emit('close_game', { roomCode })}
        />

      ) : currentGame === 'movie_tac_toe' ? (
        <MovieTacToe
          socket={socket} roomCode={roomCode} players={players}
          currentPlayer={players.find((p) => (isAdmin ? p.isAdmin : p.id === playerId))}
          isAdmin={isAdmin}
          onExit={() => {
            socket.emit('close_game', { roomCode });
            setCurrentGame(null);
            setSelectedCategory(null);       // ✅
            setSelectedSubcategory(null);    // ✅
          }}
        />

      ) : currentGame === 'civil_registry' ? (
        <CivilRegistryGame
          serverUrl={SOCKET_URL}
          onExit={closeGame}
        />

      ) : currentGame === 'urbex_game' ? (
        <UrbexApp onExit={closeGame} />

      ) : currentGame === 'court_game' ? (
        <CourtGame
          socket={socket} roomCode={roomCode}
          playerId={playerId} playerName={playerName}
          onExit={closeGame}
        />

      ) : currentGame === 'bank_el_haz' ? (
        <BankElHazGame
          socket={socket}
          roomCode={roomCode}
          playerId={playerId}
          playerName={playerName}
          isAdmin={isAdmin}
          players={players}
          onExit={() => {
            socket.emit('close_game', { roomCode });
            setCurrentGame(null);
            setSelectedCategory(null);      // ✅ مهم
            setSelectedSubcategory(null);   // ✅ مهم
          }}
        />

      ) : currentGame === 'trap_opponent' ? (
        <TrapOpponent
          socket={socket} roomCode={roomCode}
          playerId={playerId} playerName={playerName}
          isAdmin={isAdmin} players={players}
         onExit={closeGame}
        />

      ) : currentGame === 'guess_opponent' ? (
        <GuessOpponent
          socket={socket} roomCode={roomCode}
          playerId={playerId} playerName={playerName}
          isAdmin={isAdmin} players={players}
          onExit={closeGame}
        />

      ) : currentGame === 'heads_up' ? (
        <HeadsUp
          socket={socket} roomCode={roomCode}
          playerId={playerId} playerName={playerName}
          isAdmin={isAdmin} players={players}
          onExit={closeGame}
        />

      ) : currentGame === 'movie_quiz' ? (
        <MovieQuiz
          socket={socket} roomCode={roomCode}
          playerId={playerId} playerName={playerName}
          isAdmin={isAdmin} players={players}
          onExit={closeGame}
        />

      ) : currentGame === 'investigation' ? (
        <Investigation
          socket={socket} roomCode={roomCode} playerId={playerId}
          playerName={playerName} isAdmin={isAdmin} players={players}
          onExit={closeGame}
        />

      ) : currentGame === 'codenames' ? (
        <Codenames
          socket={socket} roomCode={roomCode}
          playerId={playerId} playerName={playerName}
          isAdmin={isAdmin} players={players}
          onExit={closeGame}
        />

        ) : currentGame === 'memory' ? (
        <MemoryGrid
          socket={socket}
          roomCode={roomCode}
          playerId={playerId}
          playerName={playerName}
          isAdmin={isAdmin}
          players={players}
          onExit={closeGame}
        />

      ) : currentGame === 'taboo' ? (
        <Taboo
          socket={socket} roomCode={roomCode}
          playerId={playerId} playerName={playerName}
          isAdmin={isAdmin} players={players}
          onExit={closeGame}
        />

        ) : currentGame === 'chess' ? (
          <Chess
            socket={socket}
            roomCode={roomCode}
            playerId={playerId}
            playerName={playerName}
            isAdmin={isAdmin}
            players={players}
            onExit={closeGame}
          />

          ) : currentGame === 'backgammon' ? (
            <Backgammon
              socket={socket}
              roomCode={roomCode}
              playerId={playerId}
              playerName={playerName}
              isAdmin={isAdmin}
              players={players}
              onExit={closeGame}
            />

            ) : currentGame === 'snakes' ? (
              <SnakesLadders
                socket={socket}
                roomCode={roomCode}
                playerId={playerId}
                playerName={playerName}
                isAdmin={isAdmin}
                players={players}
                onExit={closeGame}
              />

              ) : currentGame === 'escape_room_hub' ? (
                <MainMenu
                  onExit={(action, storyId) => {
                    if (action === 'start' && storyId) {
                      setSelectedStoryId(storyId);
                      setCurrentGame('escape_room_game');
                    } else {
                      // خروج كامل
                      setCurrentGame(null);
                      setSelectedCategory(null);
                      setSelectedSubcategory(null);
                    }
                  }}
                />

              ) : currentGame === 'escape_room_game' && selectedStoryId ? (
                <StoryGame
                  storyId={selectedStoryId}
                  socket={socket}
                  roomCode={roomCode}
                  playerId={playerId}
                  playerName={playerName}
                  isAdmin={isAdmin}
                  onExit={() => {
                    // رجوع لبوابة القصص
                    setSelectedStoryId(null);
                    setCurrentGame('escape_room_hub');
                  }}
                />

                ) : currentGame === 'sword_of_knowledge' ? (
                <SwordRound
                  socket={socket} roomCode={roomCode}
                  playerId={playerId} playerName={playerName}
                  isAdmin={isAdmin} players={players}
                  onExit={closeGame}
                />

                ) : currentGame === 'round16' ? (
                <BracketRound
                  socket={socket} roomCode={roomCode}
                  playerId={playerId} playerName={playerName}
                  isAdmin={isAdmin} players={players}
                  onExit={() => {
                    socket.emit('close_game', { roomCode });
                    setCurrentGame(null);
                    setSelectedCategory(null);      // ✅ مهم جدًا
                    setSelectedSubcategory(null);   // ✅ مهم جدًا
                  }}
                />

                ) : currentQuestion?.category === 'spy' ? (
                  <SpyRound
                    currentQuestion={currentQuestion}
                    players={players}
                    playerId={playerId}
                    isAdmin={isAdmin}
                    socket={socket}
                    roomCode={roomCode}
                    showSpyVoteModal={showSpyVoteModal}
                    votedFor={votedFor}
                    spyResult={spyResult}
                    onVote={handleSpyVote}
                    onCloseResult={() => setSpyResult(null)}
                    onLeaveRoom={leaveRoom}
                    onNewRound={handleSpyNewRound}
                    onBackToCategories={handleSpyBackToLobby}
                  />

      ) : currentGame === 'kotshina' ? (
        kotshinaMode === 'bank' ? (
          <Bank
            socket={socket} roomCode={roomCode}
            playerId={playerId} playerName={playerName}
            isAdmin={isAdmin}
            players={players}
            onExit={closeGame}
          />
        ) : kotshinaMode === 'shayeb' ? (
          <Shayeb
            socket={socket} roomCode={roomCode}
            playerId={playerId} playerName={playerName}
            isAdmin={isAdmin}
            players={players}
            onExit={closeGame}
          />
        ) : kotshinaMode === 'crazy8' ? (
          <Crazy8
            socket={socket} roomCode={roomCode}
            playerId={playerId} playerName={playerName}
            isAdmin={isAdmin}
            players={players}
            onExit={closeGame}
          />
          ) : kotshinaMode === 'solitaire' ? (
            <Solitaire
              socket={socket} roomCode={roomCode}
              playerId={playerId} playerName={playerName}
              isAdmin={isAdmin}
              onExit={closeGame}
            />
              ) : kotshinaMode === 'spider' ? (
              <Spider
                socket={socket} roomCode={roomCode}
                playerId={playerId} playerName={playerName}
                isAdmin={isAdmin}
                onExit={closeGame}
              />
        ) : (
          <Basra
            socket={socket} roomCode={roomCode}
            playerId={playerId} playerName={playerName}
            isAdmin={isAdmin} players={players}
            onExit={closeGame}
          />
        )

      ) : isAdmin ? (
        <div className="max-w-6xl mx-auto">
          {currentGame === 'digital_detective' ? (
            <DigitalDetectiveGame socket={socket} roomCode={roomCode} playerId={playerId} isAdmin={isAdmin} />
          ) : (
            <AdminPanel
              roomCode={roomCode} players={players} playerId={playerId} playerName={playerName}  activePlayer={activePlayer}
              currentQuestion={currentQuestion} onScoreChange={handleScoreChange}
              onPlayQuestion={playQuestion} onPlayRandomQuestion={playRandomQuestion}
              onResetBuzzer={resetBuzzer} onEndGame={endGame} onLeaveRoom={leaveRoom}
              onAdminBuzzer={handleAdminBuzzer} gameStatus={gameStatus}
              categories={categories} selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory} onCategorySelect={handleCategorySelect}
              onSubcategorySelect={handleSubcategorySelect} socket={socket}
              questions={questions} buzzerLocked={buzzerLocked} isAdmin={true}
              cardGameState={cardGameState} onExit={closeGame}
              onExitCardGame={() => {
                setCardGameState(null);
                setCurrentQuestion(null);
                setGameStatus('playing');
              }}
              setCurrentGame={setCurrentGame}
            />
          )}
        </div>

      ) : (
        <div className="max-w-6xl mx-auto">
          {currentGame === 'digital_detective' ? (
            <DigitalDetectiveGame socket={socket} roomCode={roomCode} playerId={playerId} isAdmin={isAdmin} />
          ) : (
            <PlayerScreen
              playerId={playerId} playerName={playerName} roomCode={roomCode}
              players={players} activePlayer={activePlayer} currentQuestion={currentQuestion}
              onBuzzerPress={handleBuzzer} buzzerLocked={buzzerLocked} onLeaveRoom={leaveRoom}
              gameStatus={gameStatus} socket={socket} isAdmin={false}
              setCurrentQuestion={setCurrentQuestion} setActivePlayer={setActivePlayer}
              setBuzzerLocked={setBuzzerLocked} setGameStatus={setGameStatus}
              cardGameState={cardGameState}
              onExitCardGame={() => {
                setCardGameState(null);
                setCurrentQuestion(null);
                setGameStatus('playing');
              }}
              onExit={closeGame}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;