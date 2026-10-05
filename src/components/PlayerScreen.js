import React, { useState, useEffect } from 'react';
import { FaLock, FaSignOutAlt, FaTrophy, FaTimes, FaCrown } from 'react-icons/fa';
import CardGame from './CardGame';
import Timer from './Timer';
import GridGame from './GridGame';
import BracketGame from './BracketGame';
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
  onExitCardGame,
}) => {
  console.log('🎬 PlayerScreen render | category:', currentQuestion?.category, '| full:', currentQuestion);

  const [showReloadWarning, setShowReloadWarning] = useState(false);
  const isActivePlayer = activePlayer === playerId;

  const [showSpyVoteModal, setShowSpyVoteModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [votedFor, setVotedFor] = useState(null);
  const [spyResult, setSpyResult] = useState(null);

  const [crimeHorror, setCrimeHorror] = useState(false);
  const [crimeHeadline, setCrimeHeadline] = useState(null);
  const [crimeStatement, setCrimeStatement] = useState(null);
  const [crimeVotingOpen, setCrimeVotingOpen] = useState(false);
  const [crimeSuspects, setCrimeSuspects] = useState([]);
  const [crimeVote, setCrimeVote] = useState(null);
  const [crimeVotingComplete, setCrimeVotingComplete] = useState(false);
  const [crimeSolution, setCrimeSolution] = useState(null);

  const publicUrl = process.env.PUBLIC_URL || '';
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const isReverseQuestion = currentQuestion?.category === 'reverse';

  useEffect(() => {
    if (!socket) return;

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
          answer: '',
        });
        setGameStatus('playing');
      }
    };

    const handleTicTacToeState = (state) => {
      setCurrentQuestion({
        id: 'tic-tac-toe',
        category: 'tic-tac-toe',
        text: 'Tic Tac Toe',
        answer: '',
      });
      setGameStatus('playing');
    };

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
    };

    socket.on('open_spy_voting', handleOpenSpyVoting);
    socket.on('spy_voting_results', handleSpyVotingResults);

    const handleCrimeHorror = () => {
      setCrimeHorror(true);
      setTimeout(() => setCrimeHorror(false), 4000);
    };
    const handleCrimeHeadline = ({ headline, description }) => setCrimeHeadline({ headline, description });
    const handleCrimeStatement = ({ suspect, statement, number, total }) => setCrimeStatement({ suspect, statement, number, total });
    const handleCrimeVotingOpen = ({ suspects }) => {
      setCrimeSuspects(suspects);
      setCrimeVotingOpen(true);
      setCrimeVote(null);
      setCrimeVotingComplete(false);
    };
    const handleCrimeVotingComplete = () => {
      setCrimeVotingOpen(false);
      setCrimeVotingComplete(true);
    };
    const handleCrimeSolution = ({ solution }) => {
      setCrimeSolution(solution);
      setCrimeVotingComplete(false);
    };

    socket.on('crime_horror_message', handleCrimeHorror);
    socket.on('crime_headline', handleCrimeHeadline);
    socket.on('crime_statement', handleCrimeStatement);
    socket.on('crime_voting_open', handleCrimeVotingOpen);
    socket.on('crime_voting_complete', handleCrimeVotingComplete);
    socket.on('crime_solution', handleCrimeSolution);

    const forceSwitch = (data) => {
      console.log('🚨 لقطت إشارة بدء المحقق الرقمي، هجبر الشاشة تقلب!');
      if (typeof setCurrentQuestion === 'function') {
        setCurrentQuestion({ category: 'digital_detective' });
      }
    };

    socket.on('room_update', forceSwitch);
    socket.on('room_data', forceSwitch);
    socket.on('detective_started', forceSwitch);

    return () => {
      socket.off('player_photo_question', handlePlayerPhotoQuestion);
      socket.off('card_game_state_update', handleCardGameStateUpdate);
      socket.off('tic_tac_toe_state', handleTicTacToeState);
      socket.off('open_spy_voting', handleOpenSpyVoting);
      socket.off('spy_voting_results', handleSpyVotingResults);
      socket.off('crime_horror_message', handleCrimeHorror);
      socket.off('crime_headline', handleCrimeHeadline);
      socket.off('crime_statement', handleCrimeStatement);
      socket.off('crime_voting_open', handleCrimeVotingOpen);
      socket.off('crime_voting_complete', handleCrimeVotingComplete);
      socket.off('crime_solution', handleCrimeSolution);
      socket.off('room_update', forceSwitch);
      socket.off('room_data', forceSwitch);
      socket.off('detective_started', forceSwitch);
    };
  }, [socket, setCurrentQuestion, playerId]);

  useEffect(() => {
    setSpyResult(null);
    setShowSpyVoteModal(false);
    setVotedFor(null);
  }, [currentQuestion]);

  // ============================================================
  // Game-specific fullscreen returns (unchanged)
  // ============================================================
  if (currentQuestion?.category === 'tic-tac-toe') {
    return <TicTacToeRound socket={socket} roomCode={roomCode} players={players} playerId={playerId} isAdmin={false} onLeaveRoom={onLeaveRoom} />;
  }

  if (currentQuestion?.category === 'bingo') {
    return <BingoRound socket={socket} roomCode={roomCode} playerId={playerId} isAdmin={false} onLeaveRoom={onLeaveRoom} />;
  }

  if (currentQuestion?.category === 'grid-game') {
    return <GridGame socket={socket} roomCode={roomCode} playerId={playerId} onLeaveRoom={onLeaveRoom} />;
  }

  if (currentQuestion?.category === 'battleship') {
    return <BattleshipRound socket={socket} roomCode={roomCode} players={players} playerId={playerId} isAdmin={false} onLeaveRoom={onLeaveRoom} />;
  }

  if (currentQuestion?.category === 'hangman') {
    return <HangmanRound socket={socket} roomCode={roomCode} playerId={playerId} playerName={playerName} isAdmin={false} players={players} onExit={onLeaveRoom} />;
  }

  if (currentQuestion?.category === 'mafiosa') {
    return (
      <div className="w-full px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-right">🕵️ مافوزا</h1>
            <p className="text-gray-300 text-right">مرحبًا، {playerName}</p>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl">{roomCode}</span>
          </div>
        </div>
        <MafiosaGame socket={socket} roomCode={roomCode} playerId={playerId} isAdmin={false} />
        <button onClick={onLeaveRoom} className="w-full mt-6 bg-red-600 hover:bg-red-500 py-3 rounded-lg flex items-center justify-center gap-2">
          <FaSignOutAlt /> مغادرة الغرفة
        </button>
      </div>
    );
  }

  if (currentQuestion?.category === 'digital_detective') {
    return (
      <div className="w-full px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-right">🖥️ المحقق الرقمي</h1>
            <p className="text-gray-300 text-right">مرحبًا، {playerName}</p>
          </div>
          <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="font-medium">رمز الغرفة:</span>
            <span className="font-mono text-xl">{roomCode}</span>
          </div>
        </div>
        <DigitalDetectiveGame socket={socket} roomCode={roomCode} playerId={playerId} isAdmin={false} />
        <button onClick={onLeaveRoom} className="w-full mt-6 bg-red-600 hover:bg-red-500 py-3 rounded-lg flex items-center justify-center gap-2">
          <FaSignOutAlt /> مغادرة الغرفة
        </button>
      </div>
    );
  }

  if (currentQuestion?.category === 'music') {
    return <MusicRound currentQuestion={currentQuestion} players={players} playerId={playerId} isAdmin={false} socket={socket} roomCode={roomCode} onLeaveRoom={onLeaveRoom} activePlayer={activePlayer} buzzerLocked={buzzerLocked} onBuzzerPress={onBuzzerPress} />;
  }

  if (currentQuestion?.category === 'reverse-word') {
    return <ReverseRound currentQuestion={currentQuestion} players={players} playerId={playerId} isAdmin={false} socket={socket} roomCode={roomCode} onLeaveRoom={onLeaveRoom} activePlayer={activePlayer} buzzerLocked={buzzerLocked} onBuzzerPress={onBuzzerPress} onResetBuzzer={() => {}} onScoreChange={null} />;
  }

  if (currentQuestion?.category === 'whoami') {
    return <WhoamiRound currentQuestion={currentQuestion} players={players} playerId={playerId} isAdmin={false} socket={socket} roomCode={roomCode} onLeaveRoom={onLeaveRoom} onScoreChange={null} />;
  }

  if (currentQuestion?.category === 'who-said-game') {
    return <WhoSaidRound currentQuestion={currentQuestion} players={players} playerId={playerId} isAdmin={false} socket={socket} roomCode={roomCode} onLeaveRoom={onLeaveRoom} activePlayer={activePlayer} buzzerLocked={buzzerLocked} onBuzzerPress={onBuzzerPress} onResetBuzzer={() => {}} onScoreChange={null} />;
  }

  if (currentQuestion?.category === 'put-word-game') {
    return <PutWordRound currentQuestion={currentQuestion} players={players} playerId={playerId} isAdmin={false} socket={socket} roomCode={roomCode} onLeaveRoom={onLeaveRoom} activePlayer={activePlayer} buzzerLocked={buzzerLocked} onBuzzerPress={onBuzzerPress} onResetBuzzer={() => {}} onScoreChange={null} />;
  }

  if (currentQuestion?.category === 'song-for-game') {
    return <SongForRound currentQuestion={currentQuestion} players={players} playerId={playerId} isAdmin={false} socket={socket} roomCode={roomCode} onLeaveRoom={onLeaveRoom} activePlayer={activePlayer} buzzerLocked={buzzerLocked} onBuzzerPress={onBuzzerPress} onResetBuzzer={() => {}} onScoreChange={null} />;
  }

  if (currentQuestion?.category === 'cinema-game') {
    return <CinemaRound currentQuestion={currentQuestion} players={players} playerId={playerId} isAdmin={false} socket={socket} roomCode={roomCode} onLeaveRoom={onLeaveRoom} activePlayer={activePlayer} buzzerLocked={buzzerLocked} onBuzzerPress={onBuzzerPress} onResetBuzzer={() => {}} onScoreChange={null} />;
  }

  if (currentQuestion?.category === 'flags-game') {
    return <FlagsRound currentQuestion={currentQuestion} players={players} playerId={playerId} isAdmin={false} socket={socket} roomCode={roomCode} onLeaveRoom={onLeaveRoom} activePlayer={activePlayer} buzzerLocked={buzzerLocked} onBuzzerPress={onBuzzerPress} onResetBuzzer={() => {}} onScoreChange={null} />;
  }

  if (currentQuestion?.category === 'whiteboard') {
    return <WhiteboardRound socket={socket} roomCode={roomCode} isAdmin={false} players={players} playerId={playerId} onLeaveRoom={onLeaveRoom} />;
  }

  if (currentQuestion?.category === 'sword-of-knowledge') {
    return <SwordRound socket={socket} roomCode={roomCode} playerId={playerId} playerName={playerName} isAdmin={false} players={players} onExit={onLeaveRoom} />;
  }

  if (currentQuestion?.category === 'card-game' || cardGameState?.gameStarted) {
    const currentPlayer = players.find((p) => p.id === playerId);
    return (
      <div className="w-full px-4 py-4">
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
        <CardGame socket={socket} roomCode={roomCode} players={players} currentPlayer={currentPlayer} isAdmin={false} onExit={onExitCardGame} />
        <button onClick={onLeaveRoom} className="w-full mt-6 bg-indigo-700 hover:bg-indigo-900 py-3 rounded-lg flex items-center justify-center gap-2">
          <FaSignOutAlt /> مغادرة الغرفة
        </button>
      </div>
    );
  }

  // ============================================================
  // MAIN QUIZ VIEW — Golden Noir
  // ============================================================
  const handleVoteSubmit = (targetId) => {
    setVotedFor(targetId);
    socket.emit('submit_spy_vote', { roomCode, voterId: playerId, votedForId: targetId });
  };

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

      <div className="relative z-10 w-full px-4">

        {/* Warning Modal */}
        {showReloadWarning && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div
              className="rounded-3xl p-6 max-w-md w-full relative overflow-hidden"
              style={{ ...GLASS, boxShadow: '0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)' }}
            >
              <span className="pointer-events-none absolute inset-x-8 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.light}80, transparent)` }} />
              <h2 className="text-2xl font-black mb-4 text-center" style={{ color: GOLD.light }}>تحذير!</h2>
              <p className="text-base mb-6 text-center" style={{ color: GOLD.text }}>
                إذا قمت بإعادة تحميل الصفحة، ستخرج وستفقد نقاطك
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowReloadWarning(false); window.location.reload(); }}
                  className="flex-1 py-3 rounded-xl font-black text-sm"
                  style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.5)', color: '#fca5a5' }}
                >
                  خروج على أي حال
                </button>
                <button
                  onClick={() => setShowReloadWarning(false)}
                  className="flex-1 py-3 rounded-xl font-black text-sm"
                  style={BTN_PRIMARY}
                >
                  البقاء في اللعبة
                </button>
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
            <div className="text-2xl" style={{ filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.6))' }}>👤</div>
            <div className="min-w-0">
              <p style={labelStyle}>لاعب</p>
              <p className="text-sm font-black truncate" style={{ color: GOLD.light }}>{playerName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-center">
              <p style={labelStyle}>رمز الغرفة</p>
              <p className="text-lg font-mono font-black tracking-[0.3em]" style={{ color: GOLD.light, textShadow: '0 0 12px rgba(212,175,55,0.5)' }}>
                {roomCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center">
              <p style={labelStyle}>نقاطك</p>
              <p className="text-xl font-black tabular-nums" style={{ color: GOLD.light }}>
                {players.find((p) => p.id === playerId)?.score || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          <div className="lg:col-span-2 space-y-5">

            {gameStatus === 'ended' ? (
              <div
                className="rounded-3xl p-8 text-center relative overflow-hidden"
                style={{ ...GLASS, boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)' }}
              >
                <span className="pointer-events-none absolute inset-x-8 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.light}80, transparent)` }} />

                <div className="flex justify-center mb-4">
                  <FaTrophy className="text-6xl" style={{ color: GOLD.primary, filter: 'drop-shadow(0 0 24px rgba(212,175,55,0.7))' }} />
                </div>
                <h2 className="text-3xl font-black mb-2" style={{ color: GOLD.light }}>انتهت اللعبة!</h2>
                <p className="mb-6" style={{ color: GOLD.textDim }}>أنهى المسؤول المسابقة.</p>

                {sortedPlayers.length > 0 && (
                  <div
                    className="rounded-2xl p-5 mb-6 relative overflow-hidden"
                    style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD.border}` }}
                  >
                    <p style={labelStyle} className="mb-3">الفائز</p>
                    <div className="flex justify-center mb-3">
                      <div
                        className="w-24 h-24 rounded-full flex flex-col items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${GOLD.primary}, ${GOLD.deep})`,
                          boxShadow: '0 0 40px rgba(212,175,55,0.6), inset 0 1px 0 rgba(255,255,255,0.2)',
                        }}
                      >
                        <FaCrown className="text-2xl mb-1" style={{ color: '#1a0f05' }} />
                        <span className="text-xs font-black" style={{ color: '#1a0f05' }}>{sortedPlayers[0].score}</span>
                      </div>
                    </div>
                    <p className="text-xl font-black" style={{ color: GOLD.light }}>
                      {sortedPlayers[0].name}
                    </p>
                  </div>
                )}

                <button
                  onClick={onLeaveRoom}
                  className="px-8 py-3 rounded-xl font-black text-sm"
                  style={BTN_PRIMARY}
                >
                  مغادرة اللعبة
                </button>
              </div>
            ) : (
              <>
                {currentQuestion?.category === 'spy' ? (
                  <SpyRound
                    currentQuestion={currentQuestion}
                    players={players}
                    playerId={playerId}
                    isAdmin={false}
                    socket={socket}
                    roomCode={roomCode}
                    showSpyVoteModal={showSpyVoteModal}
                    votedFor={votedFor}
                    spyResult={spyResult}
                    onVote={handleVoteSubmit}
                    onCloseResult={() => setSpyResult(null)}
                    onNewRound={() => socket.emit('spy_start', { roomCode })}
                    onLeaveRoom={onLeaveRoom}
                  />
                ) : currentQuestion?.image ? (
                  <div
                    className="rounded-3xl p-6 text-center relative overflow-hidden"
                    style={{ ...GLASS, boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                  >
                    <span className="pointer-events-none absolute inset-x-8 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.light}60, transparent)` }} />

                    <div className="mb-4">
                      <h2 className="text-lg font-black mb-1" style={{ color: GOLD.light }}>
                        {currentQuestion.category === 'random-photos' ? `أنا مين: ${currentQuestion.subcategory || ''}` :
                         currentQuestion.category === 'flags' ? 'أعلام الدول' :
                         'سؤال بالصورة'}
                      </h2>
                      <p className="text-xs" style={{ color: GOLD.textMuted }}>
                        {currentQuestion.category === 'random-photos' ? 'صورتك الفريدة لتتعرف عليها' : ''}
                      </p>
                    </div>

                    <div className="mt-4">
                      <img
                        src={`${publicUrl}${currentQuestion.image}`}
                        alt="Question"
                        className="object-contain rounded-xl max-h-[60vh] mx-auto"
                        style={{ border: `2px solid ${GOLD.border}`, boxShadow: '0 10px 40px rgba(0,0,0,0.6)' }}
                      />
                      {currentQuestion.category !== 'flags' && (
                        <div
                          className="mt-4 p-4 rounded-xl"
                          style={{ background: 'rgba(212,175,55,0.10)', border: `1px solid ${GOLD.border}` }}
                        >
                          <p style={labelStyle} className="mb-2">الإجابة</p>
                          <p className="text-3xl font-black" style={{ color: GOLD.light }}>{currentQuestion.answer}</p>
                        </div>
                      )}
                      {currentQuestion.bounc && (
                        <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.4)' }}>
                          <p style={labelStyle} className="mb-2">تلميح</p>
                          <p className="text-lg font-black" style={{ color: '#fca5a5' }}>{currentQuestion.bounc}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : isReverseQuestion ? (
                  <div
                    className="rounded-3xl p-6 relative overflow-hidden"
                    style={{ ...GLASS, boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                  >
                    <span className="pointer-events-none absolute inset-x-8 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.light}60, transparent)` }} />
                    <div className="mb-4 text-center">
                      <h2 className="text-lg font-black" style={{ color: GOLD.light }}>الكلمات المعكوسة</h2>
                      <p className="text-xs mt-1" style={{ color: GOLD.textMuted }}>تحدي الكلمات المعكوسة</p>
                    </div>
                    <div className="p-6 rounded-xl" style={{ background: 'rgba(212,175,55,0.08)', border: `1px solid ${GOLD.border}` }}>
                      <p style={labelStyle} className="mb-2 text-center">السؤال</p>
                      <p className="text-2xl font-black text-center mb-6" style={{ color: GOLD.light }}>{currentQuestion.text}</p>
                      <div className="p-4 rounded-lg" style={{ background: 'rgba(0,0,0,0.35)' }}>
                        <p style={labelStyle} className="mb-2 text-center">تلميح</p>
                        <p className="text-base text-center" style={{ color: GOLD.text }}>{currentQuestion.bounc}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  currentQuestion && (currentQuestion.category === 'who-said' || currentQuestion.category === 'song-for' || currentQuestion.category === 'put-word-in-song') ? (
                    <div
                      className="rounded-3xl p-6 text-center relative overflow-hidden"
                      style={{ ...GLASS, boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                    >
                      <span className="pointer-events-none absolute inset-x-8 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.light}60, transparent)` }} />
                      <div className="mb-4">
                        <h2 className="text-lg font-black mb-1" style={{ color: GOLD.light }}>
                          {currentQuestion.category === 'who-said' ? 'مين قال الجملة دي' :
                           currentQuestion.category === 'song-for' ? 'أغنية لـ' :
                           'حط كلمة في أغنية'}
                        </h2>
                        <p className="text-xs" style={{ color: GOLD.textMuted }}>استمع للسؤال من المسؤول واضغط للجواب</p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="rounded-3xl p-10 text-center relative overflow-hidden"
                      style={{ ...GLASS, boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)' }}
                    >
                      <span className="pointer-events-none absolute inset-x-8 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.light}60, transparent)` }} />
                      <div className="text-5xl mb-4" style={{ filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.5))' }}>⏳</div>
                      <h2 className="text-xl font-black mb-2" style={{ color: GOLD.light }}>في انتظار السؤال</h2>
                      <p className="text-sm" style={{ color: GOLD.textDim }}>سيبدأ المسؤول اللعبة قريبًا...</p>
                    </div>
                  )
                )}

                {currentQuestion?.category !== 'spy' && (
                  <div className="relative p-[2px] rounded-2xl overflow-hidden">
                    {(!buzzerLocked && !activePlayer && gameStatus === 'playing' && currentQuestion) && (
                      <div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background: `linear-gradient(90deg, transparent 0%, ${GOLD.light}80 50%, transparent 100%)`,
                          backgroundSize: '200% 100%',
                          animation: 'goldenShimmer 2s linear infinite',
                        }}
                      />
                    )}
                    <div className="relative rounded-2xl p-[1px]" style={{ background: `linear-gradient(180deg, rgba(212,175,55,0.25), rgba(0,0,0,0.4))` }}>
                      <button
                        onClick={() => {
                          if (!buzzerLocked && currentQuestion && gameStatus === 'playing' && !activePlayer) {
                            const audio = new Audio('/audio/bell.mp3');
                            audio.play().catch((err) => console.error('Buzzer play error:', err));
                          }
                          onBuzzerPress();
                        }}
                        disabled={buzzerLocked || !currentQuestion || gameStatus !== 'playing' || activePlayer}
                        className="w-full py-12 rounded-2xl text-4xl font-black flex flex-col items-center justify-center transition-all"
                        style={
                          isActivePlayer
                            ? {
                                background: `linear-gradient(135deg, ${GOLD.primary}, ${GOLD.deep})`,
                                color: '#1a0f05',
                                cursor: 'not-allowed',
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                              }
                            : activePlayer
                              ? { background: 'rgba(40,40,40,0.6)', color: GOLD.textMuted, cursor: 'not-allowed', border: `1px solid ${GOLD.borderFaint}` }
                              : buzzerLocked || !currentQuestion || gameStatus !== 'playing'
                                ? { background: 'rgba(40,40,40,0.6)', color: GOLD.textMuted, cursor: 'not-allowed', border: `1px solid ${GOLD.borderFaint}` }
                                : {
                                    background: `linear-gradient(135deg, ${GOLD.primary}, ${GOLD.deep})`,
                                    color: '#1a0f05',
                                    boxShadow: `0 0 40px rgba(212,175,55,0.5), inset 0 1px 0 rgba(255,255,255,0.3)`,
                                  }
                        }
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
                          <p className="text-sm" style={{ color: GOLD.text }}>
                            <span className="font-black" style={{ color: GOLD.light }}>
                              {players.find((p) => p.id === activePlayer)?.name || 'لاعب'}
                            </span>{' '}
                            ضغط على الزر!
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
              className="w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2"
              style={BTN_OUTLINE}
            >
              <FaSignOutAlt /> مغادرة الغرفة
            </button>
          </div>

          {/* Sidebar: Score */}
          <div className="hidden lg:block">
            <div
              className="rounded-2xl p-4 relative overflow-hidden sticky top-4"
              style={{ ...GLASS, boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)' }}
            >
              <span className="pointer-events-none absolute inset-x-6 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.light}60, transparent)` }} />

              <div className="flex items-center gap-2 mb-4">
                <FaTrophy style={{ color: GOLD.primary }} />
                <h2 className="text-base font-black" style={{ color: GOLD.light }}>الترتيب</h2>
              </div>

              <div className="space-y-2">
                {sortedPlayers.map((p, index) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2 rounded-lg"
                    style={{
                      background: index === 0 ? 'rgba(212,175,55,0.10)' : 'rgba(0,0,0,0.25)',
                      border: `1px solid ${index === 0 ? GOLD.border : GOLD.borderFaint}`,
                    }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs w-4 font-mono" style={{ color: GOLD.textMuted }}>{index + 1}</span>
                      {index === 0 && <FaCrown className="text-xs" style={{ color: GOLD.primary }} />}
                      <span className="text-sm font-bold truncate" style={{ color: GOLD.text }}>{p.name}</span>
                    </div>
                    <span className="text-sm font-black tabular-nums" style={{ color: GOLD.light }}>{p.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating score button (mobile) */}
        <button
          onClick={() => setShowScoreModal(true)}
          className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-transform hover:scale-110 z-40 lg:hidden"
          style={{
            background: `linear-gradient(135deg, ${GOLD.primary}, ${GOLD.deep})`,
            color: '#1a0f05',
            boxShadow: `0 0 40px rgba(212,175,55,0.6)`,
          }}
        >
          <FaTrophy size={24} />
        </button>

        {showScoreModal && (
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => setShowScoreModal(false)}
          >
            <div
              className="rounded-3xl p-6 max-w-sm w-full relative overflow-hidden"
              style={{ ...GLASS, boxShadow: '0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="pointer-events-none absolute inset-x-8 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.light}80, transparent)` }} />

              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black flex items-center gap-2" style={{ color: GOLD.light }}>
                  <FaTrophy style={{ color: GOLD.primary }} /> الترتيب
                </h2>
                <button onClick={() => setShowScoreModal(false)} className="transition-colors" style={{ color: GOLD.textMuted }}>
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {sortedPlayers.map((p, index) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{
                      background: index === 0 ? 'rgba(212,175,55,0.10)' : 'rgba(0,0,0,0.25)',
                      border: `1px solid ${index === 0 ? GOLD.border : GOLD.borderFaint}`,
                    }}
                  >
                    <span className="flex items-center gap-2 font-bold text-sm" style={{ color: GOLD.text }}>
                      {index === 0 && <FaCrown style={{ color: GOLD.primary }} />} {p.name}
                    </span>
                    <span
                      className="px-3 py-1 rounded-md text-sm font-black tabular-nums"
                      style={{ background: 'rgba(212,175,55,0.18)', color: GOLD.light }}
                    >
                      {p.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes goldenShimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default PlayerScreen;