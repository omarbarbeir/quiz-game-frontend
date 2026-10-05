import React, { useState, useEffect } from 'react';
import { FaCrown, FaRedo, FaSignOutAlt, FaTimes, FaTrophy, FaRandom, FaBell, FaArrowLeft } from 'react-icons/fa';
import CategorySelector from './CategorySelector';
import CardGame from './CardGame';
import GridGame from './GridGame';
import MafiosaGame from './MafiosoGame';
import DigitalDetectiveGame from './DigitalDetectiveGame';
import SpyRound from './SpyRound';
import MusicRound from './MusicRound';
import ReverseRound from './ReverseRound';
import WhoamiRound from './WhoamiRound';
import WhoSaidRound from './WhoSaidRound';
import PutWordRound from './PutWordRound';
import SongForRound from './SongForRound';
import CinemaRound from './CinemaRound';
import FlagsRound from './FlagsRound';
import WhiteboardRound from './WhiteboardRound';
import TicTacToeRound from './TicTacToeRound';
import BingoRound from './BingoRound';
import BattleshipRound from './BattleshipRound';
import SwordRound from './SwordRound';
import HangmanRound from './HangmanRound';
import { GOLD, BG_GRADIENT, GLASS, BTN_PRIMARY, BTN_OUTLINE } from '../theme/goldenNoir';

const labelStyle = {
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  color: GOLD.textMuted,
};

const AdminPanel = ({
  roomCode, players, activePlayer, currentQuestion, onScoreChange, onPlayQuestion,
  onPlayRandomQuestion, onResetBuzzer, onEndGame, onLeaveRoom, onAdminBuzzer,
  gameStatus, categories, selectedCategory, selectedSubcategory, onCategorySelect,
  onSubcategorySelect, socket, questions, buzzerLocked, isAdmin, cardGameState,
  onExitCardGame, playerId, playerName,
}) => {
  const [showReloadWarning, setShowReloadWarning] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);
  const [showSpyVoteModal, setShowSpyVoteModal] = useState(false);
  const [votedFor, setVotedFor] = useState(null);
  const [spyResult, setSpyResult] = useState(null);

  const activePlayerData = players.find(p => p.id === activePlayer);

  const handleNextQuestion = () => {
    setLoadingNext(true);
    onPlayRandomQuestion();
    setTimeout(() => setLoadingNext(false), 1000);
  };

  const handleBackToCategories = () => {
    onCategorySelect(null);
    onSubcategorySelect(null);
  };

  const handleExitMusic = () => { onCategorySelect(null); onSubcategorySelect(null); onPlayQuestion({ id: null, category: null, text: '', answer: '' }); };
  const handleExitReverse = () => { onCategorySelect(null); onSubcategorySelect(null); onPlayQuestion({ id: null, category: null, text: '', answer: '' }); };
  const handleExitWhoami = () => { onCategorySelect(null); onSubcategorySelect(null); onPlayQuestion({ id: null, category: null, text: '', answer: '' }); };
  const handleExitWhoSaid = () => { onCategorySelect(null); onSubcategorySelect(null); onPlayQuestion({ id: null, category: null, text: '', answer: '' }); };
  const handleExitPutWord = () => { onCategorySelect(null); onSubcategorySelect(null); onPlayQuestion({ id: null, category: null, text: '', answer: '' }); };
  const handleExitSongFor = () => { onCategorySelect(null); onSubcategorySelect(null); onPlayQuestion({ id: null, category: null, text: '', answer: '' }); };
  const handleExitCinema = () => { onCategorySelect(null); onSubcategorySelect(null); onPlayQuestion({ id: null, category: null, text: '', answer: '' }); };
  const handleExitFlags = () => { onCategorySelect(null); onSubcategorySelect(null); onPlayQuestion({ id: null, category: null, text: '', answer: '' }); };
  const handleExitWhiteboard = () => { onCategorySelect(null); onSubcategorySelect(null); onPlayQuestion({ id: null, category: null, text: '', answer: '' }); };
  const handleExitSword = () => { onCategorySelect(null); onSubcategorySelect(null); onPlayQuestion({ id: null, category: null, text: '', answer: '' }); };
  const handleExitHangman = () => { onCategorySelect(null); onSubcategorySelect(null); onPlayQuestion({ id: null, category: null, text: '', answer: '' }); };

  // Spy listeners
  useEffect(() => {
    const handleOpenSpyVoting = () => { setShowSpyVoteModal(true); setVotedFor(null); setSpyResult(null); };
    const handleSpyVotingResults = (result) => { setShowSpyVoteModal(false); setSpyResult(result); };
    socket.on('open_spy_voting', handleOpenSpyVoting);
    socket.on('spy_voting_results', handleSpyVotingResults);
    return () => {
      socket.off('open_spy_voting', handleOpenSpyVoting);
      socket.off('spy_voting_results', handleSpyVotingResults);
    };
  }, [socket, roomCode]);

  // Auto-start effects
  useEffect(() => { if (selectedCategory === 'grid-game' && currentQuestion?.category !== 'grid-game') onPlayQuestion({ id: 'grid-game', category: 'grid-game', text: 'الجدول', answer: '' }); }, [selectedCategory, currentQuestion, onPlayQuestion]);
  useEffect(() => { if (selectedCategory === 'bingo' && currentQuestion?.category !== 'bingo') onPlayQuestion({ id: 'bingo', category: 'bingo', text: 'بينجو', answer: '' }); }, [selectedCategory, currentQuestion, onPlayQuestion]);
  useEffect(() => { if (selectedCategory === 'battleship' && currentQuestion?.category !== 'battleship') onPlayQuestion({ id: 'battleship', category: 'battleship', text: 'حرب السفن', answer: '' }); }, [selectedCategory, currentQuestion, onPlayQuestion]);
  useEffect(() => { if (selectedCategory === 'hangman' && currentQuestion?.category !== 'hangman') onPlayQuestion({ id: 'hangman', category: 'hangman', text: 'الرجل المشنوق', answer: '' }); }, [selectedCategory, currentQuestion, socket, roomCode, onPlayQuestion]);
  useEffect(() => { if (selectedCategory === 'mafiosa' && currentQuestion?.category !== 'mafiosa') { onPlayQuestion({ id: 'mafiosa', category: 'mafiosa', text: 'مافوزا', answer: '' }); socket.emit('mafiosa_start', { roomCode }); } }, [selectedCategory, currentQuestion, socket, roomCode, onPlayQuestion]);
  useEffect(() => { const isMusic = selectedCategory === 'music' || selectedSubcategory === 'music'; if (isMusic && currentQuestion?.category !== 'music') socket.emit('music_start', { roomCode }); }, [selectedCategory, selectedSubcategory, currentQuestion, socket, roomCode]);
  useEffect(() => { const isReverse = selectedCategory === 'reverse' || selectedSubcategory === 'reverse'; if (isReverse && currentQuestion?.category !== 'reverse-word') socket.emit('reverse_start', { roomCode }); }, [selectedCategory, selectedSubcategory, currentQuestion, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'whoami' && currentQuestion?.category !== 'whoami') { socket.emit('whoami_reset', { roomCode }); onPlayQuestion({ id: 'whoami', category: 'whoami', text: 'أنا مين', answer: '' }); } }, [selectedCategory, currentQuestion, socket, roomCode, onPlayQuestion]);
  useEffect(() => { const isWhoSaid = selectedCategory === 'who-said' || selectedSubcategory === 'who-said'; if (isWhoSaid && currentQuestion?.category !== 'who-said-game') socket.emit('who_said_start', { roomCode }); }, [selectedCategory, selectedSubcategory, currentQuestion, socket, roomCode]);
  useEffect(() => { const isPutWord = selectedCategory === 'put-word-in-song' || selectedSubcategory === 'put-word-in-song'; if (isPutWord && currentQuestion?.category !== 'put-word-game') socket.emit('put_word_start', { roomCode }); }, [selectedCategory, selectedSubcategory, currentQuestion, socket, roomCode]);
  useEffect(() => { const isSongFor = selectedCategory === 'song-for' || selectedSubcategory === 'song-for'; if (isSongFor && currentQuestion?.category !== 'song-for-game') socket.emit('song_for_start', { roomCode }); }, [selectedCategory, selectedSubcategory, currentQuestion, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'cinema' && currentQuestion?.category !== 'cinema-game') onPlayQuestion({ id: 'cinema', category: 'cinema-game', text: '', answer: '', subcategory: null, actorsRevealed: false, hintRevealed: false, answerRevealed: false }); }, [selectedCategory, currentQuestion, onPlayQuestion]);
  useEffect(() => { if (selectedCategory === 'flags' && currentQuestion?.category !== 'flags-game') socket.emit('flags_start', { roomCode }); }, [selectedCategory, currentQuestion, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'whiteboard' && currentQuestion?.category !== 'whiteboard') onPlayQuestion({ id: 'whiteboard', category: 'whiteboard', text: 'السبورة التعاونية', answer: '' }); }, [selectedCategory, currentQuestion, onPlayQuestion]);
  useEffect(() => { if (selectedCategory === 'autobis' && currentQuestion?.category !== 'autobis') onPlayQuestion({ id: 'autobis', category: 'autobis', text: 'أتوبيس كومبليت', answer: '' }); }, [selectedCategory, currentQuestion, onPlayQuestion]);
  useEffect(() => { if (selectedCategory === 'tic-tac-toe' && currentQuestion?.category !== 'tic-tac-toe') onPlayQuestion({ id: 'tic-tac-toe', category: 'tic-tac-toe', text: 'Tic Tac Toe', answer: '' }); }, [selectedCategory, currentQuestion, onPlayQuestion]);
  useEffect(() => { if (selectedCategory === 'sword-of-knowledge' && currentQuestion?.category !== 'sword-of-knowledge') onPlayQuestion({ id: 'sword-of-knowledge', category: 'sword-of-knowledge', text: 'سيف المعرفة', answer: '' }); }, [selectedCategory, currentQuestion, onPlayQuestion]);
  useEffect(() => { if (selectedCategory === 'round16') socket.emit('launch_game', { roomCode, gameId: 'round16' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'movie_tac_toe') socket.emit('launch_game', { roomCode, gameId: 'movie_tac_toe' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'bank_el_haz') socket.emit('launch_game', { roomCode, gameId: 'bank_el_haz' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'spy' && currentQuestion?.category !== 'spy') onPlayRandomQuestion(); }, [selectedCategory, currentQuestion, onPlayRandomQuestion]);
  useEffect(() => { if (selectedCategory === 'escape_room') socket.emit('launch_game', { roomCode, gameId: 'escape_room' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'snakes') socket.emit('launch_game', { roomCode, gameId: 'snakes' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'backgammon') socket.emit('launch_game', { roomCode, gameId: 'backgammon' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'chess') socket.emit('launch_game', { roomCode, gameId: 'chess' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'memory') socket.emit('launch_game', { roomCode, gameId: 'memory' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'basra') socket.emit('launch_game', { roomCode, gameId: 'kotshina' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'taboo') socket.emit('launch_game', { roomCode, gameId: 'taboo' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'codenames') socket.emit('launch_game', { roomCode, gameId: 'codenames' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'investigation') socket.emit('launch_game', { roomCode, gameId: 'investigation' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'movie_quiz') socket.emit('launch_game', { roomCode, gameId: 'movie_quiz' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'heads_up') socket.emit('launch_game', { roomCode, gameId: 'heads_up' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'guess_opponent') socket.emit('launch_game', { roomCode, gameId: 'guess_opponent' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'trap_opponent') socket.emit('launch_game', { roomCode, gameId: 'trap_opponent' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'horror_game') socket.emit('launch_game', { roomCode, gameId: 'horror_game' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'civil_registry') socket.emit('launch_game', { roomCode, gameId: 'civil_registry' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'urbex_game') socket.emit('launch_game', { roomCode, gameId: 'urbex_game' }); }, [selectedCategory, socket, roomCode]);
  useEffect(() => { if (selectedCategory === 'court_game') socket.emit('launch_game', { roomCode, gameId: 'court_game' }); }, [selectedCategory, socket, roomCode]);

  // ====== Fullscreen game returns (unchanged) ======
  if (currentQuestion?.category === 'sword-of-knowledge') {
    return <SwordRound socket={socket} roomCode={roomCode} playerId={playerId} playerName={playerName} isAdmin={true} players={players} onExit={handleExitSword} />;
  }

  const isMusicActive = selectedCategory === 'music' || selectedSubcategory === 'music';
  if (isMusicActive && currentQuestion?.category === 'music') {
    return <MusicRound currentQuestion={currentQuestion} players={players} playerId={playerId} isAdmin={true} socket={socket} roomCode={roomCode} onLeaveRoom={handleExitMusic} activePlayer={activePlayer} buzzerLocked={buzzerLocked} onBuzzerPress={onAdminBuzzer} onResetBuzzer={onResetBuzzer} onScoreChange={onScoreChange} />;
  }

  if (currentQuestion?.category === 'reverse-word') {
    return <ReverseRound currentQuestion={currentQuestion} players={players} playerId={playerId} isAdmin={true} socket={socket} roomCode={roomCode} onLeaveRoom={handleExitReverse} activePlayer={activePlayer} buzzerLocked={buzzerLocked} onBuzzerPress={onAdminBuzzer} onResetBuzzer={onResetBuzzer} onScoreChange={onScoreChange} />;
  }

  if (currentQuestion?.category === 'whoami') {
    return <WhoamiRound currentQuestion={currentQuestion} players={players} playerId={playerId} isAdmin={true} socket={socket} roomCode={roomCode} onLeaveRoom={handleExitWhoami} onScoreChange={onScoreChange} />;
  }

  if (currentQuestion?.category === 'who-said-game') {
    return <WhoSaidRound currentQuestion={currentQuestion} players={players} playerId={playerId} isAdmin={true} socket={socket} roomCode={roomCode} onLeaveRoom={handleExitWhoSaid} activePlayer={activePlayer} buzzerLocked={buzzerLocked} onBuzzerPress={onAdminBuzzer} onResetBuzzer={onResetBuzzer} onScoreChange={onScoreChange} />;
  }

  if (currentQuestion?.category === 'put-word-game') {
    return <PutWordRound currentQuestion={currentQuestion} players={players} playerId={playerId} isAdmin={true} socket={socket} roomCode={roomCode} onLeaveRoom={handleExitPutWord} activePlayer={activePlayer} buzzerLocked={buzzerLocked} onBuzzerPress={onAdminBuzzer} onResetBuzzer={onResetBuzzer} onScoreChange={onScoreChange} />;
  }

  if (currentQuestion?.category === 'song-for-game') {
    return <SongForRound currentQuestion={currentQuestion} players={players} playerId={playerId} isAdmin={true} socket={socket} roomCode={roomCode} onLeaveRoom={handleExitSongFor} activePlayer={activePlayer} buzzerLocked={buzzerLocked} onBuzzerPress={onAdminBuzzer} onResetBuzzer={onResetBuzzer} onScoreChange={onScoreChange} />;
  }

  if (currentQuestion?.category === 'cinema-game') {
    return <CinemaRound currentQuestion={currentQuestion} players={players} playerId={playerId} isAdmin={true} socket={socket} roomCode={roomCode} onLeaveRoom={handleExitCinema} activePlayer={activePlayer} buzzerLocked={buzzerLocked} onBuzzerPress={onAdminBuzzer} onResetBuzzer={onResetBuzzer} onScoreChange={onScoreChange} />;
  }

  if (currentQuestion?.category === 'flags-game') {
    return <FlagsRound currentQuestion={currentQuestion} players={players} playerId={playerId} isAdmin={true} socket={socket} roomCode={roomCode} onLeaveRoom={handleExitFlags} activePlayer={activePlayer} buzzerLocked={buzzerLocked} onBuzzerPress={onAdminBuzzer} onResetBuzzer={onResetBuzzer} onScoreChange={onScoreChange} />;
  }

  if (currentQuestion?.category === 'whiteboard') {
    return <WhiteboardRound socket={socket} roomCode={roomCode} isAdmin={true} players={players} playerId={playerId} onLeaveRoom={handleExitWhiteboard} />;
  }

  if (selectedCategory === 'tic-tac-toe') {
    return <TicTacToeRound socket={socket} roomCode={roomCode} players={players} playerId={playerId} isAdmin={true} onLeaveRoom={handleBackToCategories} />;
  }

  if (selectedCategory === 'grid-game') {
    return <GridGame socket={socket} roomCode={roomCode} playerId={playerId} onLeaveRoom={handleBackToCategories} />;
  }

  if (selectedCategory === 'bingo') {
    return <BingoRound socket={socket} roomCode={roomCode} playerId={playerId} isAdmin={true} onLeaveRoom={handleBackToCategories} />;
  }

  if (selectedCategory === 'battleship') {
    return <BattleshipRound socket={socket} roomCode={roomCode} players={players} playerId={playerId} isAdmin={true} onLeaveRoom={handleBackToCategories} />;
  }

  if (currentQuestion?.category === 'hangman') {
    return <HangmanRound socket={socket} roomCode={roomCode} playerId={playerId} playerName={playerName} isAdmin={true} players={players} onExit={handleExitHangman} />;
  }

  if (selectedCategory === 'mafiosa') {
    const adminPlayer = players.find(p => p.isAdmin);
    return (
      <div className="w-full px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div className="flex items-center gap-3">
            <FaCrown className="text-yellow-400 text-2xl" />
            <h1 className="text-2xl font-bold">لوحة المسؤول – مافوزا</h1>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl">{roomCode}</span>
          </div>
        </div>
        <button onClick={handleBackToCategories} className="mb-4 bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg flex items-center gap-2">
          <FaArrowLeft /> العودة للفئات
        </button>
        <MafiosaGame socket={socket} roomCode={roomCode} playerId={adminPlayer?.id} isAdmin={true} />
      </div>
    );
  }

  if (selectedCategory === 'digital_detective') {
    const adminPlayer = players.find(p => p.isAdmin);
    return (
      <div className="w-full px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div className="flex items-center gap-3">
            <FaCrown className="text-yellow-400 text-2xl" />
            <h1 className="text-2xl font-bold">لوحة المسؤول – المحقق الرقمي</h1>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl">{roomCode}</span>
          </div>
        </div>
        <button onClick={handleBackToCategories} className="mb-4 bg-gray-700 hover:bg-gray-600 py-2 px-4 rounded-lg flex items-center gap-2">
          <FaArrowLeft /> العودة للفئات
        </button>
        <DigitalDetectiveGame socket={socket} roomCode={roomCode} playerId={adminPlayer?.id} isAdmin={true} />
      </div>
    );
  }

  if (selectedCategory === 'card-game' || cardGameState?.gameStarted) {
    const adminPlayer = players.find(p => p.isAdmin);
    return (
      <div className="w-full px-4 py-4">
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
          <div className="bg-red-600 rounded-xl p-6 text-center">
            <h2 className="text-xl font-bold mb-2">خطأ في تحميل اللعبة</h2>
            <p>لم يتم العثور على بيانات المسؤول. يرجى إعادة تحميل الصفحة.</p>
          </div>
        )}
      </div>
    );
  }

  const handleVoteSubmit = (targetId) => {
    setVotedFor(targetId);
    socket.emit('submit_spy_vote', { roomCode, voterId: playerId, votedForId: targetId });
  };

  // ====== Normal Admin View — GOLDEN NOIR (البورد في النص) ======
  return (
    <div className="relative w-full py-4" style={{ background: BG_GRADIENT, minHeight: '100vh' }}>
      {/* هالة ذهبية علوية */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width: '60vw', height: '30vh',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.12) 0%, transparent 60%)',
          filter: 'blur(50px)',
          zIndex: 0,
        }}
      />

      <div className="relative z-10 w-full px-4 max-w-5xl mx-auto">

        {/* Warning Modal */}
        {showReloadWarning && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div
              className="rounded-3xl p-6 max-w-md w-full relative overflow-hidden"
              style={{ ...GLASS, boxShadow: '0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >
              <span className="pointer-events-none absolute inset-x-8 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.light}80, transparent)` }} />
              <h2 className="text-2xl font-black mb-4 text-center" style={{ color: GOLD.light }}>تحذير!</h2>
              <p className="text-base mb-6 text-center" style={{ color: GOLD.text }}>إعادة التحميل ستنهي اللعبة لجميع اللاعبين</p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowReloadWarning(false); window.location.reload(); }}
                  className="flex-1 py-3 rounded-xl font-black text-sm"
                  style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.5)', color: '#fca5a5' }}
                >خروج على أي حال</button>
                <button
                  onClick={() => setShowReloadWarning(false)}
                  className="flex-1 py-3 rounded-xl font-black text-sm"
                  style={BTN_PRIMARY}
                >متابعة المسؤول</button>
              </div>
            </div>
          </div>
        )}

        {/* HUD */}
        <div
          className="rounded-2xl px-4 py-3 mb-5 flex items-center justify-between gap-4 flex-wrap relative overflow-hidden"
          style={{ ...GLASS, boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}
        >
          <span className="pointer-events-none absolute inset-x-6 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.light}60, transparent)` }} />

          <div className="flex items-center gap-3 min-w-0">
            <FaCrown className="text-2xl" style={{ color: GOLD.primary, filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.6))' }} />
            <div className="min-w-0">
              <p style={labelStyle}>أدمن</p>
              <p className="text-sm font-black truncate" style={{ color: GOLD.light }}>لوحة المسؤول</p>
            </div>
          </div>

          <div className="text-center">
            <p style={labelStyle}>رمز الغرفة</p>
            <p className="text-lg font-mono font-black tracking-[0.3em]" style={{ color: GOLD.light, textShadow: '0 0 12px rgba(212,175,55,0.5)' }}>
              {roomCode}
            </p>
          </div>

          <div className="text-center">
            <p style={labelStyle}>عدد اللاعبين</p>
            <p className="text-xl font-black tabular-nums" style={{ color: GOLD.light }}>{players.length}</p>
          </div>
        </div>

        {/* Back button */}
        {selectedCategory && selectedCategory !== 'card-game' && (
          <button
            onClick={handleBackToCategories}
            className="mb-5 px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2"
            style={BTN_OUTLINE}
          >
            <FaArrowLeft /> العودة للفئات
          </button>
        )}

        {/* ═════ البورد — في النص ═════ */}
        <div className="max-w-3xl mx-auto space-y-5 mb-6">

          {/* Player list */}
          <div
            className="rounded-3xl p-5 relative overflow-hidden"
            style={{ ...GLASS, boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}
          >
            <span className="pointer-events-none absolute inset-x-6 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.light}60, transparent)` }} />

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black" style={{ color: GOLD.light }}>اللاعبون</h2>
              <span
                className="px-3 py-1 rounded-full text-xs font-black"
                style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${GOLD.border}`, color: GOLD.light }}
              >
                {players.length} {players.length === 1 ? 'لاعب' : 'لاعبين'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {players.map((player) => {
                const isActive = activePlayer === player.id;
                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 rounded-xl transition-all"
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(139,111,71,0.10))'
                        : 'rgba(0,0,0,0.25)',
                      border: `1px solid ${isActive ? GOLD.primary : (player.isAdmin ? GOLD.border : GOLD.borderFaint)}`,
                      boxShadow: isActive ? `0 0 30px rgba(212,175,55,0.35)` : 'none',
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black"
                        style={
                          player.isAdmin
                            ? {
                                background: `linear-gradient(135deg, ${GOLD.primary}, ${GOLD.deep})`,
                                color: '#1a0f05',
                                boxShadow: `0 0 16px rgba(212,175,55,0.5)`,
                              }
                            : {
                                background: 'rgba(212,175,55,0.10)',
                                border: `1px solid ${GOLD.border}`,
                                color: GOLD.light,
                              }
                        }
                      >
                        {player.isAdmin ? <FaCrown className="text-sm" /> : player.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black truncate flex items-center gap-2" style={{ color: GOLD.text }}>
                          {player.name}
                        </p>
                        <p className="text-[9px] tracking-[0.2em] uppercase" style={{ color: GOLD.textMuted }}>نقاط</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onScoreChange(player.id, -1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style={{ background: 'rgba(220,38,38,0.18)', border: '1px solid rgba(220,38,38,0.4)', color: '#fca5a5' }}
                      >
                        <FaTimes size={12} />
                      </button>
                      <span className="font-black text-lg min-w-[40px] text-center tabular-nums" style={{ color: GOLD.light }}>
                        {player.score}
                      </span>
                      <button
                        onClick={() => onScoreChange(player.id, 1)}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style={{ background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.4)', color: '#6ee7b7' }}
                      >
                        <FaTimes size={12} className="rotate-45" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active player banner */}
          {activePlayer ? (
            <div
              className="rounded-3xl p-4 relative overflow-hidden"
              style={{
                ...GLASS,
                background: `linear-gradient(135deg, rgba(212,175,55,0.22), rgba(139,111,71,0.08))`,
                border: `1px solid ${GOLD.primary}`,
                boxShadow: `0 0 40px rgba(212,175,55,0.30), inset 0 1px 0 rgba(255,255,255,0.10)`,
              }}
            >
              <span className="pointer-events-none absolute inset-x-6 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.light}80, transparent)` }} />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-black"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD.primary}, ${GOLD.deep})`,
                      color: '#1a0f05',
                      boxShadow: `0 0 20px rgba(212,175,55,0.6)`,
                    }}
                  >
                    {activePlayerData?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-base" style={{ color: GOLD.light }}>
                      {activePlayerData?.name} يجيب!
                    </h3>
                    <p className="text-xs" style={{ color: GOLD.textDim }}>بانتظار قرارك في التصحيح...</p>
                  </div>
                </div>
                <button
                  onClick={onResetBuzzer}
                  className="px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2"
                  style={{
                    background: 'rgba(212,175,55,0.15)',
                    border: `1px solid ${GOLD.primary}`,
                    color: GOLD.light,
                  }}
                >
                  <FaRedo /> إعادة الزر
                </button>
              </div>
            </div>
          ) : (
            <div
              className="rounded-3xl p-4 relative overflow-hidden"
              style={{ ...GLASS, boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}
            >
              <span className="pointer-events-none absolute inset-x-6 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.light}60, transparent)` }} />
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(212,175,55,0.10)', border: `1px solid ${GOLD.border}`, color: GOLD.light }}
                  >
                    <FaBell />
                  </div>
                  <div>
                    <h3 className="font-black text-base" style={{ color: GOLD.light }}>تحكم الزر</h3>
                    <p className="text-xs" style={{ color: GOLD.textDim }}>اضغط للضغط كمسؤول</p>
                  </div>
                </div>
                <button
                  onClick={onAdminBuzzer}
                  disabled={buzzerLocked || !currentQuestion}
                  className="px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all"
                  style={
                    buzzerLocked || !currentQuestion
                      ? {
                          background: 'rgba(40,40,40,0.5)',
                          border: `1px solid ${GOLD.borderFaint}`,
                          color: GOLD.textMuted,
                          cursor: 'not-allowed',
                        }
                      : BTN_PRIMARY
                  }
                >
                  <FaBell /> ضغط المسؤول
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ═════ Category + Game Control (تحت البورد) ═════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Category + Current question (2 cols) */}
          <div className="lg:col-span-2 space-y-5">
            <CategorySelector
              categories={categories}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onSelectCategory={onCategorySelect}
              onSelectSubcategory={onSubcategorySelect}
              isAdmin={isAdmin}
            />

            {selectedCategory && (categories.find(c => c.id === selectedCategory)?.subcategories.length > 0 ? selectedSubcategory : true) && (
              <div
                className="rounded-3xl p-4 relative overflow-hidden"
                style={{ ...GLASS, boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}
              >
                <span className="pointer-events-none absolute inset-x-6 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.light}60, transparent)` }} />

                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
                  <div>
                    <h2 className="text-base font-black" style={{ color: GOLD.light }}>
                      {categories.find(c => c.id === selectedCategory)?.name}
                      {selectedSubcategory && ` - ${categories.find(c => c.id === selectedCategory)?.subcategories.find(s => s.id === selectedSubcategory)?.name}`}
                    </h2>
                    {selectedSubcategory && (
                      <button
                        onClick={() => onSubcategorySelect(null)}
                        className="flex items-center gap-1 text-xs mt-1 transition-colors"
                        style={{ color: GOLD.textDim }}
                      >
                        <FaArrowLeft /> تغيير الفئة الفرعية
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleNextQuestion}
                    disabled={loadingNext}
                    className="mt-3 sm:mt-0 px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all"
                    style={loadingNext
                      ? { background: 'rgba(40,40,40,0.5)', color: GOLD.textMuted, cursor: 'not-allowed', border: `1px solid ${GOLD.borderFaint}` }
                      : BTN_PRIMARY
                    }
                  >
                    <FaRandom /> {loadingNext ? 'جاري التحميل...' : 'السؤال التالي'}
                  </button>
                </div>

                {currentQuestion && (
                  <div className="space-y-3">
                    {selectedCategory === 'flags' ? (
                      <>
                        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${GOLD.borderFaint}` }}>
                          <p className="text-sm font-black" style={{ color: GOLD.textDim }}>صورة العلم مخفية عن المسؤول</p>
                        </div>
                        <div className="p-4 rounded-xl" style={{ background: 'rgba(212,175,55,0.10)', border: `1px solid ${GOLD.border}` }}>
                          <p style={labelStyle} className="mb-2">الإجابة</p>
                          <p className="text-lg font-black" style={{ color: GOLD.light }}>{currentQuestion.answer}</p>
                        </div>
                      </>
                    ) : selectedCategory === 'spy' ? (
                      <SpyRound
                        currentQuestion={currentQuestion}
                        players={players}
                        playerId={playerId}
                        isAdmin={true}
                        socket={socket}
                        roomCode={roomCode}
                        showSpyVoteModal={showSpyVoteModal}
                        votedFor={votedFor}
                        spyResult={spyResult}
                        onVote={handleVoteSubmit}
                        onCloseResult={() => setSpyResult(null)}
                        onNewRound={() => socket.emit('spy_start', { roomCode })}
                        onLeaveRoom={handleBackToCategories}
                      />
                    ) : selectedCategory === 'whoami' ? (
                      <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(212,175,55,0.10)', border: `1px solid ${GOLD.border}` }}>
                        <p className="text-base font-black" style={{ color: GOLD.light }}>{currentQuestion.text}</p>
                      </div>
                    ) : currentQuestion.category === 'whiteboard' ? null : currentQuestion.image ? (
                      <>
                        <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${GOLD.borderFaint}` }}>
                          <img src={`${process.env.PUBLIC_URL}${currentQuestion.image}`} alt="Question" className="object-contain rounded-lg max-h-64 mx-auto" style={{ border: `1px solid ${GOLD.border}` }} />
                        </div>
                        <div className="p-4 rounded-xl" style={{ background: 'rgba(212,175,55,0.10)', border: `1px solid ${GOLD.border}` }}>
                          <p style={labelStyle} className="mb-2">الإجابة</p>
                          <p className="text-lg font-black" style={{ color: GOLD.light }}>{currentQuestion.answer}</p>
                        </div>
                        {currentQuestion.bounc && (
                          <div className="p-4 rounded-xl" style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.4)' }}>
                            <p style={labelStyle} className="mb-2">تلميح</p>
                            <p className="text-base font-black" style={{ color: '#fca5a5' }}>{currentQuestion.bounc}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="p-4 rounded-xl" style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${GOLD.borderFaint}` }}>
                          <p style={labelStyle} className="mb-2">السؤال</p>
                          <p className="text-base" style={{ color: GOLD.text }}>{currentQuestion.text}</p>
                        </div>
                        <div className="p-4 rounded-xl" style={{ background: 'rgba(212,175,55,0.10)', border: `1px solid ${GOLD.border}` }}>
                          <p style={labelStyle} className="mb-2">الإجابة</p>
                          <p className="text-lg font-black" style={{ color: GOLD.light }}>{currentQuestion.answer}</p>
                        </div>
                        {currentQuestion.bounc && (
                          <div className="p-4 rounded-xl" style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.4)' }}>
                            <p style={labelStyle} className="mb-2">تلميح</p>
                            <p className="text-base font-black" style={{ color: '#fca5a5' }}>{currentQuestion.bounc}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Game control */}
          <div>
            <div
              className="rounded-3xl p-4 relative overflow-hidden"
              style={{ ...GLASS, boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}
            >
              <span className="pointer-events-none absolute inset-x-6 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.light}60, transparent)` }} />

              <h2 className="text-base font-black mb-4" style={{ color: GOLD.light }}>تحكم اللعبة</h2>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={onResetBuzzer}
                  className="py-3 rounded-xl flex flex-col items-center justify-center font-black text-xs gap-1"
                  style={{
                    background: 'rgba(212,175,55,0.10)',
                    border: `1px solid ${GOLD.border}`,
                    color: GOLD.light,
                  }}
                >
                  <FaRedo className="text-xl mb-1" />
                  إعادة الزر
                </button>
                <button
                  onClick={onEndGame}
                  className="py-3 rounded-xl flex flex-col items-center justify-center font-black text-xs gap-1"
                  style={{
                    background: 'rgba(220,38,38,0.15)',
                    border: '1px solid rgba(220,38,38,0.5)',
                    color: '#fca5a5',
                  }}
                >
                  <FaTrophy className="text-xl mb-1" />
                  إنهاء اللعبة
                </button>
              </div>

              <button
                onClick={() => setShowReloadWarning(true)}
                className="w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 mb-3"
                style={BTN_OUTLINE}
              >
                <FaRedo /> إعادة تحميل الصفحة
              </button>

              <button
                onClick={onLeaveRoom}
                className="w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2"
                style={{
                  background: 'rgba(220,38,38,0.10)',
                  border: `1px solid ${GOLD.borderSoft}`,
                  color: GOLD.textDim,
                }}
              >
                <FaSignOutAlt /> مغادرة الغرفة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;