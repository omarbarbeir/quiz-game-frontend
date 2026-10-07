// components/CardGame.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaDice, FaRandom, FaHandPaper, FaTable, FaCheck, FaTimes,
  FaTrophy, FaPlay, FaRedo, FaList, FaStar, FaCircle,
  FaHome, FaBook, FaTimesCircle, FaUserSlash, FaEye,
  FaCrown, FaExchangeAlt, FaUsers, FaUser, FaArrowLeft,
  FaBars, FaCog,
} from 'react-icons/fa';
import PlayingCard, { getTheme } from './PlayingCard';

/* ═══════════ Dice — lighter ═══════════ */
function DiceRoller({ rolling, value }) {
  const [display, setDisplay] = useState(1);
  useEffect(() => {
    if (!rolling) {
      setDisplay(value || 1);
      return;
    }
    const id = setInterval(() => setDisplay(Math.floor(Math.random() * 42) + 1), 80);
    return () => clearInterval(id);
  }, [rolling, value]);

  return (
    <div
      className="w-28 h-28 rounded-2xl flex items-center justify-center"
      style={{
        background: 'linear-gradient(160deg, #fef3c7 0%, #f59e0b 50%, #b45309 100%)',
        border: '2px solid #fcd34d',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 30px rgba(250,204,21,0.4)',
      }}
    >
      <span className="text-5xl font-black text-amber-950">{display}</span>
    </div>
  );
}

/* ═══════════ MAIN ═══════════ */
const CardGame = ({ socket, roomCode, players, currentPlayer, isAdmin, onExit }) => {
  // ═══ STATE — كله زي ما هو ═══
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState('');
  const [draggedCard, setDraggedCard] = useState(null);
  const [playerToken, setPlayerToken] = useState(0);
  const [showCategories, setShowCategories] = useState(false);
  const [showDice, setShowDice] = useState(false);
  const [diceValue, setDiceValue] = useState(0);
  const [myCategory, setMyCategory] = useState(null);
  const [selectedCardForCircle, setSelectedCardForCircle] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [selectedCardForView, setSelectedCardForView] = useState(null);
  const [winner, setWinner] = useState(null);
  const [showShakeSquare, setShowShakeSquare] = useState(false);
  const [shakeInitiator, setShakeInitiator] = useState(null);
  const [shakeActionCard, setShakeActionCard] = useState(null);
  const [shakePlacedCards, setShakePlacedCards] = useState({});
  const [shakeCanComplete, setShakeCanComplete] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [exchangeInitiator, setExchangeInitiator] = useState(null);
  const [exchangeActionCard, setExchangeActionCard] = useState(null);
  const [exchangeSelectedCard, setExchangeSelectedCard] = useState(null);
  const [exchangeTargetCard, setExchangeTargetCard] = useState(null);
  const [exchangeCompleted, setExchangeCompleted] = useState(false);
  const [exchangePhase, setExchangePhase] = useState('waiting');
  const [exchangeWaitingWithCards, setExchangeWaitingWithCards] = useState(false);
  const [exchangePlayerCards, setExchangePlayerCards] = useState([]);
  const [showCollectiveExchangeModal, setShowCollectiveExchangeModal] = useState(false);
  const [collectiveExchangeInitiator, setCollectiveExchangeInitiator] = useState(null);
  const [collectiveExchangeActionCard, setCollectiveExchangeActionCard] = useState(null);
  const [collectiveExchangeSelectedCard, setCollectiveExchangeSelectedCard] = useState(null);
  const [collectiveExchangeTargetCard, setCollectiveExchangeTargetCard] = useState(null);
  const [collectiveExchangePhase, setCollectiveExchangePhase] = useState('waiting');
  const [collectiveExchangeWaitingWithCards, setCollectiveExchangeWaitingWithCards] = useState(false);
  const [collectiveExchangePlayerCards, setCollectiveExchangePlayerCards] = useState([]);
  const [showDiceCategoryBanner, setShowDiceCategoryBanner] = useState(false);
  const [diceCategoryData, setDiceCategoryData] = useState(null);
  const [anyPlayerPlacedCards, setAnyPlayerPlacedCards] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ جديد: الكارت المختار من اليد
  const [selectedHandCard, setSelectedHandCard] = useState(null);

  // ═══ HELPERS — كلها زي ما هي ═══
  const canTakeCardFromTable = (card) => !(!card || card.type === 'action');
  const areButtonsEnabled = () => {
    if (!gameState || !currentPlayer) return false;
    return gameState.playerHasDrawn?.[currentPlayer.id] === true;
  };
  const handleCardImageClick = (card) => setSelectedCardForView(card);
  const handleClosePhotoViewer = () => setSelectedCardForView(null);

  const handleResetGameAnyPlayer = () => {
    setWinner(null);
    setShowShakeSquare(false);
    setShowExchangeModal(false);
    setShowCollectiveExchangeModal(false);
    setAnyPlayerPlacedCards(false);
    socket.emit('card_game_reset_any_player', { roomCode });
  };

  const handleOpenShakeSquare = (data) => {
    setShowShakeSquare(true); setShakeInitiator(data.playerId);
    setShakeActionCard(data.actionCard); setShakePlacedCards({});
    setAnyPlayerPlacedCards(false); setShakeCanComplete(false);
  };

  const handleOpenExchangeChooseCard = (data) => {
    setShowExchangeModal(true); setExchangeInitiator(data.initiatorId);
    setExchangeActionCard(data.actionCard); setExchangeSelectedCard(null);
    setExchangeTargetCard(null); setExchangeCompleted(false);
    setExchangePhase('initiator_choose'); setExchangeWaitingWithCards(false);
    setExchangePlayerCards(data.playerCards || []);
  };

  const handleOpenExchangeWaitingWithCards = (data) => {
    setShowExchangeModal(true); setExchangeInitiator(data.initiatorId);
    setExchangeActionCard(null); setExchangeSelectedCard(null);
    setExchangeTargetCard(null); setExchangeCompleted(false);
    setExchangePhase('waiting'); setExchangeWaitingWithCards(true);
  };

  const handleExchangeInitiatorChosen = (data) => {
    setExchangeSelectedCard(data.initiatorCard);
    if (currentPlayer.id === data.initiatorId) {
      setExchangePhase('waiting_responder'); setExchangeWaitingWithCards(false);
    } else {
      setExchangePhase('responder_choose'); setExchangeWaitingWithCards(false);
    }
  };

  const handleOpenCollectiveExchangeChooseCard = (data) => {
    setShowCollectiveExchangeModal(true); setCollectiveExchangeInitiator(data.initiatorId);
    setCollectiveExchangeActionCard(data.actionCard); setCollectiveExchangeSelectedCard(null);
    setCollectiveExchangeTargetCard(null); setCollectiveExchangePhase('initiator_choose');
    setCollectiveExchangeWaitingWithCards(false); setCollectiveExchangePlayerCards(data.playerCards || []);
  };

  const handleOpenCollectiveExchangeWaitingWithCards = (data) => {
    setShowCollectiveExchangeModal(true); setCollectiveExchangeInitiator(data.initiatorId);
    setCollectiveExchangeActionCard(null); setCollectiveExchangeSelectedCard(null);
    setCollectiveExchangeTargetCard(null); setCollectiveExchangePhase('waiting');
    setCollectiveExchangeWaitingWithCards(true);
  };

  const handleCollectiveExchangeInitiatorChosen = (data) => {
    setCollectiveExchangeSelectedCard(data.initiatorCard);
    if (currentPlayer.id === data.initiatorId) {
      setCollectiveExchangePhase('waiting_responder'); setCollectiveExchangeWaitingWithCards(false);
    } else {
      setCollectiveExchangePhase('responder_choose'); setCollectiveExchangeWaitingWithCards(false);
    }
  };

  const getAllExchangeCards = () => {
    if (!gameState || !currentPlayer) return [];
    const myHand = gameState.playerHands[currentPlayer.id] || [];
    const myCircles = gameState.playerCircles[currentPlayer.id] || [];
    const allCards = [];
    myHand.forEach((card, index) => {
      allCards.push({ ...card, source: 'hand', displayOrder: card.originalHandIndex !== undefined ? card.originalHandIndex : index });
    });
    myCircles.forEach((card, circleIndex) => {
      if (card) allCards.push({ ...card, source: 'circle', displayOrder: card.originalHandIndex !== undefined ? card.originalHandIndex : 1000 + circleIndex });
    });
    allCards.sort((a, b) => a.displayOrder - b.displayOrder);
    return allCards;
  };

  const handleUseExchangeCard = (cardId) => {
    if (gameState.currentTurn === currentPlayer?.id && areButtonsEnabled())
      socket.emit('card_game_use_exchange', { roomCode, playerId: currentPlayer.id, cardId });
  };
  const handleUseCollectiveExchangeCard = (cardId) => {
    if (gameState.currentTurn === currentPlayer?.id && areButtonsEnabled())
      socket.emit('card_game_use_collective_exchange', { roomCode, playerId: currentPlayer.id, cardId });
  };
  const handleInitiatorChooseCard = (card) => {
    if (currentPlayer.id === exchangeInitiator && exchangePhase === 'initiator_choose') {
      socket.emit('card_game_exchange_choose_card', { roomCode, playerId: currentPlayer.id, cardId: card.id, source: card.source });
      setExchangeSelectedCard(card); setExchangePhase('waiting_responder');
    }
  };
  const handleCollectiveInitiatorChooseCard = (card) => {
    if (currentPlayer.id === collectiveExchangeInitiator && collectiveExchangePhase === 'initiator_choose') {
      socket.emit('card_game_collective_exchange_choose_card', { roomCode, playerId: currentPlayer.id, cardId: card.id, source: card.source });
      setCollectiveExchangeSelectedCard(card); setCollectiveExchangePhase('waiting_responder');
    }
  };
  const handleResponderChooseCard = (card) => {
    if (currentPlayer.id !== exchangeInitiator && exchangePhase === 'responder_choose') {
      socket.emit('card_game_exchange_respond', { roomCode, playerId: currentPlayer.id, cardId: card.id, source: card.source });
      setExchangeTargetCard(card); setExchangePhase('completed');
    }
  };
  const handleCollectiveExchangeRespond = (card) => {
    if (currentPlayer.id !== collectiveExchangeInitiator && collectiveExchangePhase === 'responder_choose') {
      socket.emit('card_game_collective_exchange_respond', { roomCode, playerId: currentPlayer.id, cardId: card.id, source: card.source });
      setCollectiveExchangeTargetCard(card); setCollectiveExchangePhase('completed');
    }
  };
  const handleCancelExchange = () => {
    if (currentPlayer.id === exchangeInitiator) {
      socket.emit('card_game_exchange_cancel', { roomCode, playerId: currentPlayer.id });
      setShowExchangeModal(false);
    }
  };
  const handleCancelCollectiveExchange = () => {
    if (currentPlayer.id === collectiveExchangeInitiator) {
      socket.emit('card_game_collective_exchange_cancel', { roomCode, playerId: currentPlayer.id });
      setShowCollectiveExchangeModal(false);
    }
  };
  const handlePlaceAllCardsInShake = () => {
    if (anyPlayerPlacedCards) return;
    setAnyPlayerPlacedCards(true);
    socket.emit('card_game_shake_place_all', { roomCode, playerId: currentPlayer.id });
  };
  const handleCompleteShake = () => {
    if (!shakeCanComplete) return;
    socket.emit('card_game_complete_shake', { roomCode, playerId: currentPlayer.id });
  };
  const handleUseShakeCard = (cardId) => {
    if (gameState.currentTurn === currentPlayer?.id && areButtonsEnabled())
      socket.emit('card_game_use_shake', { roomCode, playerId: currentPlayer.id, cardId });
  };
  const handleUseSkipCard = (cardId) => {
    if (gameState.currentTurn === currentPlayer?.id && areButtonsEnabled())
      socket.emit('card_game_use_skip', { roomCode, playerId: currentPlayer.id, cardId });
  };
  const handleCloseDiceCategoryBanner = () => {
    setShowDiceCategoryBanner(false);
  };

  // ═══ EFFECTS — كلها زي ما هي ═══
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (gameState && currentPlayer) {
      const level = gameState.playerLevels?.[currentPlayer.id] || 1;
      setPlayerToken(level - 1);
    }
  }, [gameState, currentPlayer]);

  useEffect(() => {
    if (gameState && players) {
      if (gameState.winner) {
        const win = players.find(p => p.id === gameState.winner);
        if (win && (!winner || winner.id !== win.id)) setWinner(win);
      } else {
        const win = players.find(p => (gameState.playerLevels?.[p.id] || 1) >= 5);
        if (win && (!winner || winner.id !== win.id)) setWinner(win);
      }
    }
  }, [gameState, players, winner]);

  const initializeGame = () => {
    setError('');
    if (socket) socket.emit('card_game_initialize', { roomCode });
  };

  useEffect(() => {
    if (!socket) return;
    const handleGameUpdate = (s) => { setGameState(s); setError(''); };
    const handleGameError = (e) => setError(e.message);
    const handleDiceRolled = (data) => {
      setDiceValue(data.diceValue);
      setShowDice(true);
      setTimeout(() => {
        setShowDice(false);
        setDiceValue(0);
      }, 3000);
    };
    const handleDiceCategory = (data) => {
      setDiceCategoryData(data.category);
      setMyCategory(data.category);
      setShowDiceCategoryBanner(true);
    };
    const handleGameExited = () => { if (onExit) onExit(); };
    const handleGameReset = () => {
      setWinner(null); setShowShakeSquare(false); setShowExchangeModal(false);
      setShowCollectiveExchangeModal(false); setShakePlacedCards({});
      setShowDiceCategoryBanner(false); setDiceCategoryData(null);
      setAnyPlayerPlacedCards(false); setShakeCanComplete(false);
    };
    const handleWinnerAnnounced = (data) => {
      const wp = players.find(p => p.id === data.playerId);
      if (wp) setWinner(wp);
    };
    const handleShakeAllCardsPlaced = (data) => {
      setShakePlacedCards(prev => ({ ...prev, [data.playerId]: { cards: data.cards, count: data.cardCount } }));
      setAnyPlayerPlacedCards(true); setShakeCanComplete(data.canComplete);
    };
    const handleShakeCompleted = () => {
      setShowShakeSquare(false); setShakeInitiator(null); setShakeActionCard(null);
      setShakePlacedCards({}); setAnyPlayerPlacedCards(false); setShakeCanComplete(false);
    };
    const handleExchangeCompleted = () => {
      setShowExchangeModal(false); setExchangeInitiator(null); setExchangeActionCard(null);
      setExchangeSelectedCard(null); setExchangeTargetCard(null); setExchangeCompleted(false);
      setExchangePhase('waiting'); setExchangeWaitingWithCards(false); setExchangePlayerCards([]);
    };
    const handleExchangeCancelled = () => {
      setShowExchangeModal(false); setExchangeInitiator(null); setExchangeActionCard(null);
      setExchangeSelectedCard(null); setExchangeTargetCard(null); setExchangeCompleted(false);
      setExchangePhase('waiting'); setExchangeWaitingWithCards(false); setExchangePlayerCards([]);
    };
    const handleCollectiveExchangeCompleted = () => {
      setShowCollectiveExchangeModal(false); setCollectiveExchangeInitiator(null);
      setCollectiveExchangeActionCard(null); setCollectiveExchangeSelectedCard(null);
      setCollectiveExchangeTargetCard(null); setCollectiveExchangePhase('waiting');
      setCollectiveExchangeWaitingWithCards(false); setCollectiveExchangePlayerCards([]);
    };
    const handleCollectiveExchangeCancelled = () => {
      setShowCollectiveExchangeModal(false); setCollectiveExchangeInitiator(null);
      setCollectiveExchangeActionCard(null); setCollectiveExchangeSelectedCard(null);
      setCollectiveExchangeTargetCard(null); setCollectiveExchangePhase('waiting');
      setCollectiveExchangeWaitingWithCards(false); setCollectiveExchangePlayerCards([]);
    };

    socket.on('card_game_state_update', handleGameUpdate);
    socket.on('card_game_error', handleGameError);
    socket.on('card_game_dice_rolled', handleDiceRolled);
    socket.on('card_game_dice_category', handleDiceCategory);
    socket.on('card_game_exited', handleGameExited);
    socket.on('card_game_reset', handleGameReset);
    socket.on('card_game_winner_announced', handleWinnerAnnounced);
    socket.on('card_game_open_shake_square', handleOpenShakeSquare);
    socket.on('card_game_shake_all_cards_placed', handleShakeAllCardsPlaced);
    socket.on('card_game_shake_completed', handleShakeCompleted);
    socket.on('card_game_exchange_choose_card', handleOpenExchangeChooseCard);
    socket.on('card_game_exchange_waiting_with_cards', handleOpenExchangeWaitingWithCards);
    socket.on('card_game_exchange_initiator_chosen', handleExchangeInitiatorChosen);
    socket.on('card_game_exchange_completed', handleExchangeCompleted);
    socket.on('card_game_exchange_cancelled', handleExchangeCancelled);
    socket.on('card_game_collective_exchange_choose_card', handleOpenCollectiveExchangeChooseCard);
    socket.on('card_game_collective_exchange_waiting_with_cards', handleOpenCollectiveExchangeWaitingWithCards);
    socket.on('card_game_collective_exchange_initiator_chosen', handleCollectiveExchangeInitiatorChosen);
    socket.on('card_game_collective_exchange_completed', handleCollectiveExchangeCompleted);
    socket.on('card_game_collective_exchange_cancelled', handleCollectiveExchangeCancelled);

    return () => {
      socket.off('card_game_state_update', handleGameUpdate);
      socket.off('card_game_error', handleGameError);
      socket.off('card_game_dice_rolled', handleDiceRolled);
      socket.off('card_game_dice_category', handleDiceCategory);
      socket.off('card_game_exited', handleGameExited);
      socket.off('card_game_reset', handleGameReset);
      socket.off('card_game_winner_announced', handleWinnerAnnounced);
      socket.off('card_game_open_shake_square', handleOpenShakeSquare);
      socket.off('card_game_shake_all_cards_placed', handleShakeAllCardsPlaced);
      socket.off('card_game_shake_completed', handleShakeCompleted);
      socket.off('card_game_exchange_choose_card', handleOpenExchangeChooseCard);
      socket.off('card_game_exchange_waiting_with_cards', handleOpenExchangeWaitingWithCards);
      socket.off('card_game_exchange_initiator_chosen', handleExchangeInitiatorChosen);
      socket.off('card_game_exchange_completed', handleExchangeCompleted);
      socket.off('card_game_exchange_cancelled', handleExchangeCancelled);
      socket.off('card_game_collective_exchange_choose_card', handleOpenCollectiveExchangeChooseCard);
      socket.off('card_game_collective_exchange_waiting_with_cards', handleOpenCollectiveExchangeWaitingWithCards);
      socket.off('card_game_collective_exchange_initiator_chosen', handleCollectiveExchangeInitiatorChosen);
      socket.off('card_game_collective_exchange_completed', handleCollectiveExchangeCompleted);
      socket.off('card_game_collective_exchange_cancelled', handleCollectiveExchangeCancelled);
    };
  }, [socket, currentPlayer?.id, onExit, players]);

  const handleDragStart = (e, card) => {
    if (card.type !== 'action' || ['joker', 'skip', 'shake', 'exchange', 'collective_exchange'].includes(card.subtype)) {
      setDraggedCard(card);
      e.dataTransfer.setData('text/plain', card.id.toString());
    }
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleDropOnCircle = (e, circleIndex) => {
    e.preventDefault();
    if (draggedCard && gameState.currentTurn === currentPlayer?.id && areButtonsEnabled()) {
      socket.emit('card_game_move_to_circle', { roomCode, playerId: currentPlayer.id, circleIndex, cardId: draggedCard.id });
      setDraggedCard(null);
    }
  };
  const handlePlaceInCircle = (circleIndex) => {
    if (selectedCardForCircle && gameState.currentTurn === currentPlayer?.id && areButtonsEnabled()) {
      socket.emit('card_game_move_to_circle', { roomCode, playerId: currentPlayer.id, circleIndex, cardId: selectedCardForCircle.id });
      setSelectedCardForCircle(null);
    }
  };
  const handleSelectCardForCircle = (card) => { if (areButtonsEnabled()) setSelectedCardForCircle(card); };
  const handleCancelCirclePlacement = () => setSelectedCardForCircle(null);

  const handleRollDice = () => {
    setShowDice(true);
    socket.emit('card_game_roll_dice', { roomCode, playerId: currentPlayer.id });
  };
  const handleDrawCard = () => {
    if (gameState.currentTurn === currentPlayer?.id && !gameState.playerHasDrawn?.[currentPlayer.id])
      socket.emit('card_game_draw', { roomCode, playerId: currentPlayer.id });
  };
  const handlePlayToTable = (cardId) => {
    if (gameState.currentTurn === currentPlayer?.id && areButtonsEnabled()) {
      socket.emit('card_game_play_table', { roomCode, playerId: currentPlayer.id, cardId });
    }
    setSelectedHandCard(null);
  };
  const getTopTableCard = () => gameState?.tableCards?.[gameState.tableCards.length - 1] || null;
  const handleResetGame = () => {
    if (isAdmin) {
      setWinner(null); setShowShakeSquare(false); setShowExchangeModal(false);
      setShowCollectiveExchangeModal(false);
      socket.emit('card_game_reset', { roomCode });
    }
  };
  const handleExitToCategories = () => {
    if (!isAdmin) return;
    socket.emit('card_game_exit', { roomCode });
    // إغلاق كل النوافذ المنبثقة قبل الخروج
    setShowRules(false);
    setMenuOpen(false);
    setShowShakeSquare(false);
    setShowExchangeModal(false);
    setShowCollectiveExchangeModal(false);
    setSelectedCardForCircle(null);
    setSelectedCardForView(null);
    setSelectedHandCard(null);
    if (onExit) onExit();
  };
  const handleTakeFromTable = () => {
    const top = getTopTableCard();
    if (top && gameState.currentTurn === currentPlayer?.id && !gameState.playerHasDrawn?.[currentPlayer.id] && canTakeCardFromTable(top)) {
      socket.emit('card_game_take_table', { roomCode, playerId: currentPlayer.id, cardId: top.id });
    }
  };

  // ═══ EARLY RETURNS ═══
  if (!currentPlayer) return <div className="bg-red-600 rounded-xl p-6 text-center"><h2 className="text-xl font-bold">خطأ: لم يتم تحميل بيانات اللاعب</h2></div>;

  if (!gameState || !gameState.gameStarted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl p-8 text-center"
          style={{ background: 'linear-gradient(155deg, rgba(30,27,75,0.8), rgba(15,10,46,0.9))', border: '1px solid rgba(201,168,118,0.25)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
          <div className="text-6xl mb-4">🎴</div>
          <h2 className="text-2xl font-bold mb-2 text-amber-100">لعبة البطاقات</h2>
          <p className="text-amber-200/60 text-sm mb-6">لعبة استراتيجية سينمائية</p>
          {error && <div className="bg-red-900/50 border border-red-700/50 rounded-lg p-3 mb-4 text-red-200 text-sm">{error}</div>}
          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 text-right">
            <p className="text-xs text-amber-200/50 mb-2">تفاصيل الجلسة</p>
            <p className="text-xs text-amber-100/70">الغرفة: <span className="font-mono text-amber-300">{roomCode}</span></p>
            <p className="text-xs text-amber-100/70">اللاعب: <span className="text-amber-300">{currentPlayer.name}</span></p>
            <p className="text-xs text-amber-100/70">اللاعبون: <span className="text-amber-300">{players.length}</span></p>
          </div>
          {isAdmin ? (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={initializeGame}
              className="w-full py-4 rounded-2xl font-bold text-lg text-amber-50"
              style={{ background: 'linear-gradient(155deg, #10b981, #059669)', boxShadow: '0 10px 30px rgba(16,185,129,0.4)' }}>
              <FaPlay className="inline ml-2" /> ابدأ اللعبة
            </motion.button>
          ) : (
            <p className="text-amber-200/50 animate-pulse">بانتظار المسؤول لبدء اللعبة...</p>
          )}
        </div>
      </div>
    );
  }

  // ═══ DERIVED ═══
  const currentTurnPlayer = players.find(p => p.id === gameState.currentTurn);
  const isMyTurn = gameState.currentTurn === currentPlayer?.id;
  const myHand = gameState.playerHands[currentPlayer.id] || [];
  const myCircles = gameState.playerCircles[currentPlayer.id] || [null, null, null, null];
  const filledCircles = myCircles.filter(c => c !== null).length;
  const topTableCard = getTopTableCard();
  const myLevel = gameState.playerLevels?.[currentPlayer.id] || 1;
  const buttonsEnabled = areButtonsEnabled();
  const allExchangeCards = getAllExchangeCards();
  const shakeInitiatorPlayer = players.find(p => p.id === shakeInitiator);
  const exchangeInitiatorPlayer = players.find(p => p.id === exchangeInitiator);
  const collectiveExchangeInitiatorPlayer = players.find(p => p.id === collectiveExchangeInitiator);
  const canPlaceCardsInShake = currentPlayer.id !== shakeInitiator && !anyPlayerPlacedCards && !shakePlacedCards[currentPlayer.id];

  /* ═══ SMALL COMPONENTS ═══ */
  const HeaderBtn = ({ icon, label, onClick, disabled, color = 'slate' }) => {
    const colors = {
      slate: 'bg-slate-800/70 hover:bg-slate-700 border-slate-600/50',
      red: 'bg-red-900/70 hover:bg-red-800 border-red-600/50',
      blue: 'bg-blue-900/70 hover:bg-blue-800 border-blue-600/50',
      yellow: 'bg-amber-900/70 hover:bg-amber-800 border-amber-600/50',
      purple: 'bg-purple-900/70 hover:bg-purple-800 border-purple-600/50',
      emerald: 'bg-emerald-900/70 hover:bg-emerald-800 border-emerald-600/50',
    };
    return (
      <motion.button
        whileHover={disabled ? {} : { scale: 1.04 }}
        whileTap={disabled ? {} : { scale: 0.96 }}
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${colors[color]} text-white transition-colors ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        {icon} <span className="hidden sm:inline">{label}</span>
      </motion.button>
    );
  };

  const ActionBtn = ({ icon, label, onClick, disabled, color = 'from-emerald-500 to-emerald-700' }) => (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
        disabled ? 'bg-slate-700/60 text-slate-400 cursor-not-allowed' : `bg-gradient-to-r ${color} text-white shadow-lg`
      }`}
    >
      {icon} <span className="truncate">{label}</span>
    </motion.button>
  );

  /* ═══ CARD FAN (يد اللاعب) ═══ */
  const renderHandFan = () => {
    const count = myHand.length;

    if (!gameState.dealt) {
      return (
        <div className="h-40 flex flex-col items-center justify-center gap-2">
          <div className="text-5xl animate-pulse">🎴</div>
          <p className="text-amber-200/70 text-sm">
            {isAdmin ? 'اضغط "توزيع" لبدء توزيع الورق' : 'بانتظار توزيع الورق من المسؤول...'}
          </p>
        </div>
      );
    }

    if (count === 0) {
      return (
        <div className="h-40 flex items-center justify-center text-amber-200/40 text-sm">
          لا توجد بطاقات في يدك
        </div>
      );
    }

    // ✅ اكتشاف الجهاز اللمسي أكثر من الاعتماد على العرض فقط
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isSmallScreen = window.innerWidth <= 1024;
    const isMobileNow = isTouch && isSmallScreen;

    // ✅ على الموبايل لما الكروت تكتر → نزّلها تحت بعض في صفوف
    if (isMobileNow && count > 4) {
      return (
        <div
          className="w-full flex flex-wrap justify-center gap-2 py-3"
          style={{ minHeight: 180 }}
        >
          {myHand.map((card) => {
            const isSelected = selectedHandCard?.id === card.id;
            return (
              <div
                key={card.id}
                onClick={() => setSelectedHandCard(isSelected ? null : card)}
                className="cursor-pointer transition-transform duration-150"
                style={{
                  transform: isSelected ? 'translateY(-6px) scale(1.05)' : 'none',
                  filter: isSelected
                    ? 'drop-shadow(0 0 12px rgba(252,211,77,0.9))'
                    : 'none',
                }}
              >
                <PlayingCard card={card} size="sm" selected={isSelected} />
              </div>
            );
          })}
        </div>
      );
    }

    // باقي الحالات → الشكل المروحي المعتاد
    const sizeKey = isMobileNow
      ? (count <= 4 ? 'md' : count <= 7 ? 'sm' : 'xs')
      : (count <= 5 ? 'lg' : count <= 8 ? 'md' : count <= 12 ? 'sm' : 'xs');

    const cardWidths = { xs: 72, sm: 94, md: 118, lg: 148 };
    const cardW = cardWidths[sizeKey];

    const maxSpread = isMobileNow
      ? window.innerWidth - 30
      : Math.min(1200, window.innerWidth - 40);

    const idealSpacing = cardW * 0.82;
    const spacing = Math.min(idealSpacing, maxSpread / Math.max(count, 1));

    return (
      <div
        className="relative flex justify-center items-center"
        style={{ height: isMobileNow ? 200 : 260 }}
      >
        {myHand.map((card, i) => {
          const mid = (count - 1) / 2;
          const offset = i - mid;
          const x = offset * spacing;
          const rot = offset * Math.min(2, 8 / Math.max(count, 1));

          const isSelected = selectedHandCard?.id === card.id;
          const isHovered = hoveredCardId === card.id;

          const baseY = isSelected ? -30 : (isHovered ? -20 : 0);
          const finalRot = isSelected ? 0 : (isHovered ? rot * 0.3 : rot);
          const finalScale = isSelected ? 1.08 : (isHovered ? 1.05 : 1);

          return (
            <div
              key={card.id}
              onMouseEnter={() => setHoveredCardId(card.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              onClick={() => setSelectedHandCard(isSelected ? null : card)}
              className="absolute cursor-pointer"
              style={{
                transform: `translateX(${x}px) translateY(${baseY}px) rotate(${finalRot}deg) scale(${finalScale})`,
                transformOrigin: 'center center',
                zIndex: isSelected ? 50 : (isHovered ? 40 : i),
                transition: 'transform 150ms ease-out, z-index 0ms',
                willChange: 'transform',
              }}
            >
              <PlayingCard card={card} size={sizeKey} selected={isSelected} />
            </div>
          );
        })}
      </div>
    );
  };

  /* ═══ ACTION BAR FOR SELECTED CARD ═══ */
  const renderSelectedCardActions = () => {
    if (!selectedHandCard) return null;
    const card = selectedHandCard;
    const isAction = card.type === 'action';

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="flex flex-wrap gap-2 justify-center mt-3 p-3 rounded-2xl max-w-2xl mx-auto"
        style={{ background: 'rgba(15,10,46,0.85)', border: '1px solid rgba(201,168,118,0.3)' }}
      >
        <div className="w-full text-center text-xs text-amber-200/60 mb-1">
          البطاقة المختارة: <span className="text-amber-300 font-bold">{card.name}</span>
        </div>

        {/* 👁️ عرض الكارت — جديد */}
        <ActionBtn
          icon={<FaEye />}
          label="عرض"
          onClick={() => handleCardImageClick(card)}
          color="from-indigo-500 to-indigo-700"
        />

        {(card.type !== 'action' || card.subtype === 'joker') && (
          <ActionBtn icon={<FaCircle />} label="وضع في الدائرة"
            onClick={() => { handleSelectCardForCircle(card); setSelectedHandCard(null); }}
            disabled={!isMyTurn || !buttonsEnabled}
            color="from-amber-500 to-amber-700" />
        )}

        {isAction && card.subtype === 'skip' ? (
          <ActionBtn icon={<FaUserSlash />} label="تخطي" onClick={() => { handleUseSkipCard(card.id); setSelectedHandCard(null); }}
            disabled={!isMyTurn || !buttonsEnabled} color="from-rose-600 to-red-700" />
        ) : isAction && card.subtype === 'shake' ? (
          <ActionBtn icon={<FaUser />} label="نفض" onClick={() => { handleUseShakeCard(card.id); setSelectedHandCard(null); }}
            disabled={!isMyTurn || !buttonsEnabled} color="from-amber-600 to-orange-700" />
        ) : isAction && card.subtype === 'exchange' ? (
          <ActionBtn icon={<FaExchangeAlt />} label="هات وخد" onClick={() => { handleUseExchangeCard(card.id); setSelectedHandCard(null); }}
            disabled={!isMyTurn || !buttonsEnabled} color="from-teal-600 to-cyan-700" />
        ) : isAction && card.subtype === 'collective_exchange' ? (
          <ActionBtn icon={<FaUsers />} label="الكل يطلع" onClick={() => { handleUseCollectiveExchangeCard(card.id); setSelectedHandCard(null); }}
            disabled={!isMyTurn || !buttonsEnabled} color="from-fuchsia-600 to-purple-700" />
        ) : (
          <ActionBtn icon={<FaTable />} label="لعب للطاولة" onClick={() => handlePlayToTable(card.id)}
            disabled={!isMyTurn || !buttonsEnabled} color="from-emerald-500 to-emerald-700" />
        )}

        <ActionBtn icon={<FaTimes />} label="إلغاء" onClick={() => setSelectedHandCard(null)} color="from-slate-600 to-slate-800" />
      </motion.div>
    );
  };

  /* ═══ RENDER ═══ */
  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(139,92,246,0.08), transparent 60%)' }} />
      </div>

      {error && (
        <div className="mb-4 bg-red-900/60 backdrop-blur-md border border-red-700/50 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaTimesCircle className="text-red-400" />
            <span className="text-red-100">{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-200 hover:text-white px-3 py-1 rounded-lg">
            <FaTimes />
          </button>
        </div>
      )}

      {/* ═══ Menu Modal — للخيارات الإضافية ═══ */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(5,5,20,0.9)', backdropFilter: 'blur(10px)' }}
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="max-w-sm w-full rounded-3xl p-5"
              style={{
                background: 'linear-gradient(155deg, #0f0a1e 0%, #1a0f2e 100%)',
                border: '2px solid rgba(201,168,118,0.4)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2">
                  <FaCog className="text-amber-400" /> خيارات إضافية
                </h2>
                <button onClick={() => setMenuOpen(false)} className="text-amber-200 hover:text-white">
                  <FaTimesCircle size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => { socket.emit('card_game_shuffle', { roomCode }); setMenuOpen(false); }}
                  className="w-full py-3 rounded-xl font-bold text-white flex items-center gap-3 px-4 text-right"
                  style={{
                    background: 'linear-gradient(155deg, rgba(168,85,247,0.35), rgba(139,92,246,0.15))',
                    border: '1px solid rgba(168,85,247,0.5)',
                  }}
                >
                  <FaRandom className="text-purple-300" />
                  <span>خلط الكروت</span>
                </button>

                <button
                  onClick={() => { setShowRules(true); setMenuOpen(false); }}
                  className="w-full py-3 rounded-xl font-bold text-white flex items-center gap-3 px-4 text-right"
                  style={{
                    background: 'linear-gradient(155deg, rgba(59,130,246,0.35), rgba(37,99,235,0.15))',
                    border: '1px solid rgba(59,130,246,0.5)',
                  }}
                >
                  <FaBook className="text-blue-300" />
                  <span>قواعد اللعبة</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      if (window.confirm('إعادة تعيين اللعبة للجميع؟')) {
                        handleResetGame();
                        setMenuOpen(false);
                      }
                    }}
                    className="w-full py-3 rounded-xl font-bold text-white flex items-center gap-3 px-4 text-right"
                    style={{
                      background: 'linear-gradient(155deg, rgba(220,38,38,0.35), rgba(185,28,28,0.15))',
                      border: '1px solid rgba(220,38,38,0.5)',
                    }}
                  >
                    <FaRedo className="text-red-300" />
                    <span>إعادة تعيين اللعبة</span>
                  </button>
                )}

                <button
                  onClick={() => { setMenuOpen(false); if (onExit) onExit(); }}
                  className="w-full py-3 rounded-xl font-bold text-white flex items-center gap-3 px-4 text-right"
                  style={{
                    background: 'linear-gradient(155deg, rgba(100,116,139,0.35), rgba(71,85,105,0.15))',
                    border: '1px solid rgba(100,116,139,0.5)',
                  }}
                >
                  <FaTimes className="text-slate-300" />
                  <span>{isAdmin ? 'مغادرة الغرفة' : 'الخروج من اللعبة'}</span>
                </button>
              </div>

              <p className="text-center text-amber-100/40 text-[10px] mt-4">
                اضغط في أي مكان خارج النافذة للإغلاق
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ═══ Rules Modal ═══ */}
      <AnimatePresence>
        {showRules && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(5,5,20,0.9)', backdropFilter: 'blur(10px)' }}
            onClick={() => setShowRules(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="max-w-2xl w-full rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
              style={{ background: 'linear-gradient(155deg, #0f0a1e 0%, #1a0f2e 100%)', border: '2px solid rgba(201,168,118,0.4)' }}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-amber-100 flex items-center gap-2"><FaBook className="text-amber-400" /> قواعد اللعبة</h2>
                <button onClick={() => setShowRules(false)} className="text-amber-200 hover:text-white text-2xl"><FaTimesCircle /></button>
              </div>
              <div className="space-y-3 text-right text-amber-100/90 leading-relaxed text-sm">
                <p>1. كل لاعب يحصل على 5 بطاقات.</p>
                <p>2. الهدف جمع 3 بطاقات من نفس الفئة في الدوائر.</p>
                <p>3. في دورك: اسحب بطاقة ثم تخلص من بطاقة على الطاولة.</p>
                <p>4. البطاقات الخاصة: جوكر / تخطي / نفض نفسك / هات وخد / كل واحد يطلع.</p>
                <p>5. عند اكتمال 3 بطاقات، أعلن الفئة ليراجعها الجميع.</p>
                <p>6. أول من يصل للمستوى 5 يفوز!</p>
              </div>
              <button onClick={() => setShowRules(false)} className="mt-6 w-full py-3 rounded-xl font-bold text-amber-950 bg-gradient-to-r from-amber-300 to-amber-500">حسناً</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Dice Category Popup (يظهر لما يدوس على بادج فئتك) ═══ */}
      <AnimatePresence>
        {showDiceCategoryBanner && diceCategoryData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(5,5,20,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={handleCloseDiceCategoryBanner}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="max-w-md w-full rounded-3xl p-6 text-center"
              style={{
                background: 'linear-gradient(155deg, rgba(59,7,100,0.95), rgba(30,4,60,0.95))',
                border: '2px solid rgba(251,191,36,0.6)',
                boxShadow: '0 20px 60px rgba(251,191,36,0.3)',
              }}>
              <div className="flex items-center justify-center gap-2 mb-4">
                <FaDice className="text-2xl text-amber-300" />
                <span className="text-amber-100 font-bold text-sm tracking-widest uppercase">فئتك الخاصة</span>
              </div>
              <div className="rounded-2xl p-5 bg-white/5 border border-amber-500/30 mb-4">
                <div className="text-6xl font-black text-amber-300 mb-3" style={{ textShadow: '0 0 20px rgba(251,191,36,0.6)' }}>
                  {diceCategoryData.id}
                </div>
                <div className="text-lg font-bold text-amber-100 mb-1">{diceCategoryData.name}</div>
                <div className="text-sm text-amber-200/70">{diceCategoryData.description}</div>
              </div>
              <p className="text-xs text-amber-300/70 mb-4">🔒 فئتك خاصة بك وحدك</p>
              <button onClick={handleCloseDiceCategoryBanner}
                className="w-full py-3 rounded-xl font-bold text-amber-950 bg-gradient-to-r from-amber-300 to-amber-500">
                إغلاق
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Dice Roller Overlay ═══ */}
      <AnimatePresence>
        {showDice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[55] flex items-center justify-center pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
            <div className="text-center">
              <DiceRoller rolling={showDice && diceValue === 0} value={diceValue} />
              {diceValue > 0 && (
                <p className="mt-4 text-amber-100 text-lg font-bold tracking-widest">فئة {diceValue}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Winner Modal ═══ */}
      <AnimatePresence>
        {winner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)' }}>
            <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-lg w-full rounded-3xl p-8 text-center"
              style={{
                background: 'linear-gradient(155deg, #78350f 0%, #f59e0b 45%, #b45309 100%)',
                border: '3px solid #fcd34d',
                boxShadow: '0 0 80px rgba(251,191,36,0.6)',
              }}>
              <div className="text-7xl mb-4">👑</div>
              <h2 className="text-4xl font-black text-white mb-3">🎉 مبروك! 🎉</h2>
              <p className="text-2xl font-bold text-white mb-6">{winner.name} فاز!</p>
              <div className="bg-white/20 rounded-2xl p-4 mb-6">
                <p className="text-white font-semibold">أكمل 4 فئات ووصل لدائرة الفوز! 🏆</p>
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={handleResetGameAnyPlayer}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                  <FaRedo /> لعبة جديدة
                </button>
                <button onClick={handleExitToCategories}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 border border-white/20">
                  <FaHome /> العودة
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Circle Placement Modal ═══ */}
      <AnimatePresence>
        {selectedCardForCircle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(5,5,20,0.9)', backdropFilter: 'blur(10px)' }}
            onClick={handleCancelCirclePlacement}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="max-w-md w-full rounded-3xl p-6"
              style={{ background: 'linear-gradient(155deg, #0f0a1e, #1a0f2e)', border: '2px solid rgba(201,168,118,0.4)' }}>
              <h2 className="text-xl font-bold text-amber-100 mb-4 text-center">اختر الدائرة</h2>
              <div className="flex justify-center mb-5">
                <PlayingCard card={selectedCardForCircle} size="sm" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[0, 1, 2, 3].map(ci => {
                  const isOccupied = myCircles[ci] !== null;
                  return (
                    <button key={ci}
                      onClick={() => handlePlaceInCircle(ci)} disabled={isOccupied}
                      className={`p-4 rounded-xl text-center ${isOccupied ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700' : 'text-emerald-100 border-2 border-emerald-500/60 bg-emerald-950/40 hover:bg-emerald-900/60'}`}>
                      <div className="font-bold">دائرة {ci + 1}</div>
                      {isOccupied && <div className="text-xs mt-1">محجوزة</div>}
                    </button>
                  );
                })}
              </div>
              <button onClick={handleCancelCirclePlacement}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold">إلغاء</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Photo Viewer ═══ */}
      <AnimatePresence>
        {selectedCardForView && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[800] flex items-center justify-center p-4"
            style={{ background: 'rgba(5,5,20,0.95)', backdropFilter: 'blur(14px)' }}
            onClick={handleClosePhotoViewer}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              onClick={e => e.stopPropagation()}
              className="max-w-2xl w-full rounded-3xl overflow-hidden"
              style={{ background: 'linear-gradient(155deg, #0f0a1e, #1a0f2e)', border: '2px solid rgba(201,168,118,0.5)' }}>
              <div className="flex justify-between items-center p-4 border-b border-amber-500/20">
                <h2 className="text-lg font-bold text-amber-100">{selectedCardForView.name}</h2>
                <button onClick={handleClosePhotoViewer} className="text-amber-200 hover:text-white"><FaTimesCircle size={22} /></button>
              </div>
              <div className="p-3 sm:p-6 flex flex-col items-center">
                {selectedCardForView.image && (
                  <img
                    src={`${process.env.PUBLIC_URL}${selectedCardForView.image}`}
                    alt={selectedCardForView.name}
                    className="rounded-2xl shadow-2xl w-auto max-w-full"
                    style={{
                      maxHeight: '75vh',   // ✅ من 55% لـ 75% من الشاشة
                    }}
                  />
                )}
                <div className="text-center mt-4">
                  <p className="text-xl font-bold text-amber-100">{selectedCardForView.name}</p>
                  <p className="text-sm text-amber-200/60 mt-1">
                    {selectedCardForView.type === 'actor' ? '🎭 ممثل' : selectedCardForView.type === 'movie' ? '🎬 فيلم' : '⚡ إجراء'}
                  </p>
                </div>
              </div>
              <div className="p-4 border-t border-amber-500/20 text-center">
                <button onClick={handleClosePhotoViewer} className="bg-amber-600 hover:bg-amber-500 text-amber-950 px-8 py-2 rounded-xl font-bold">إغلاق</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Challenge Modal ═══ */}
      <AnimatePresence>
        {gameState.challengeInProgress && gameState.declaredCategory && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(5,5,20,0.9)', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="max-w-lg w-full rounded-3xl p-6"
              style={{ background: 'linear-gradient(155deg, #1a0a0a, #2a0a0a)', border: '2px solid rgba(251,191,36,0.5)' }}>
              <h2 className="text-2xl font-bold mb-4 text-center text-amber-100">⚔️ تحدي!</h2>
              <p className="text-base mb-5 text-center text-amber-200/90">
                <span className="font-bold text-amber-300">{gameState.declaredCategory.playerName}</span> يدعي أنه أكمل الفئة
                <span className="font-bold text-amber-400"> {gameState.declaredCategory.category?.id}</span>
              </p>
              <div className="bg-black/30 p-4 rounded-2xl mb-4 border border-amber-500/20">
                <h3 className="font-bold mb-3 text-amber-100 text-sm">البطاقات المقدمة:</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {gameState.declaredCategory.cards.map((card, index) => (
                    <PlayingCard key={index} card={card} size="xs" />
                  ))}
                </div>
              </div>
              <div className="rounded-xl p-3 mb-4 text-center bg-amber-950/40 border border-amber-600/30">
                <p className="text-sm text-amber-200/90">
                  ✅ قبول: <span className="font-bold text-emerald-400">{Object.values(gameState.challengeResponses).filter(v => v === true).length}</span>
                  <span className="mx-3 opacity-40">|</span>
                  ❌ رفض: <span className="font-bold text-rose-400">{Object.values(gameState.challengeResponses).filter(v => v === false).length}</span>
                </p>
              </div>
              {(() => {
                const isDeclarer = currentPlayer.id === gameState.declaredCategory.playerId;
                const alreadyVoted = gameState.challengeRespondedPlayers.includes(currentPlayer.id);
                if (isDeclarer) return <p className="text-center text-amber-200 text-sm animate-pulse">بانتظار رد اللاعبين...</p>;
                if (alreadyVoted) return <p className="text-center text-emerald-300 text-sm">✓ تم تسجيل تصويتك</p>;
                return (
                  <div className="flex gap-3">
                    <button onClick={() => socket.emit('card_game_challenge_response', { roomCode, playerId: currentPlayer.id, accept: true, declaredPlayerId: gameState.declaredCategory.playerId })}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-white">
                      <FaCheck /> قبول
                    </button>
                    <button onClick={() => socket.emit('card_game_challenge_response', { roomCode, playerId: currentPlayer.id, accept: false, declaredPlayerId: gameState.declaredCategory.playerId })}
                      className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl flex items-center justify-center gap-2 font-bold text-white">
                      <FaTimes /> رفض
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Collective Exchange Modal ═══ */}
      <AnimatePresence>
        {showCollectiveExchangeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(5,5,20,0.92)', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="max-w-4xl w-full rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
              style={{ background: 'linear-gradient(155deg, #1a0520, #2e0a2e)', border: '2px solid rgba(240,171,252,0.5)' }}>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-fuchsia-100 mb-1">👥 كل واحد يطلع باللي معاه</h2>
                <p className="text-fuchsia-200/60 text-sm">بدأ بواسطة: {collectiveExchangeInitiatorPlayer?.name}</p>
              </div>
              {collectiveExchangePhase === 'waiting' && collectiveExchangeWaitingWithCards && (
                <div className="text-center">
                  <div className="text-amber-300 text-lg mb-4">⏳ بانتظار {collectiveExchangeInitiatorPlayer?.name}</div>
                  <div className="rounded-2xl p-4 bg-black/30">
                    <div className="flex flex-wrap justify-center gap-2">
                      {allExchangeCards.map(card => <PlayingCard key={card.id} card={card} size="xs" />)}
                    </div>
                  </div>
                </div>
              )}
              {collectiveExchangePhase === 'initiator_choose' && currentPlayer.id === collectiveExchangeInitiator && (
                <div>
                  <div className="text-center mb-4 text-amber-300 text-lg">📝 اختر بطاقة للتبادل</div>
                  <div className="rounded-2xl p-4 bg-black/30 max-h-[50vh] overflow-y-auto">
                    <div className="flex flex-wrap justify-center gap-2">
                      {collectiveExchangePlayerCards.map(card => (
                        <div key={card.id} onClick={() => handleCollectiveInitiatorChooseCard(card)} className="cursor-pointer">
                          <PlayingCard card={card} size="sm" selected={collectiveExchangeSelectedCard?.id === card.id} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={handleCancelCollectiveExchange}
                    className="mt-4 mx-auto block bg-red-600 hover:bg-red-700 px-6 py-2 rounded-xl font-bold text-white">
                    إلغاء
                  </button>
                </div>
              )}
              {collectiveExchangePhase === 'waiting_responder' && currentPlayer.id === collectiveExchangeInitiator && (
                <div className="text-center">
                  <div className="text-emerald-300 text-lg mb-4">✓ اخترت بطاقتك — بانتظار الباقي</div>
                  {collectiveExchangeSelectedCard && (
                    <div className="flex justify-center mb-4"><PlayingCard card={collectiveExchangeSelectedCard} size="sm" /></div>
                  )}
                </div>
              )}
              {collectiveExchangePhase === 'responder_choose' && currentPlayer.id !== collectiveExchangeInitiator && (
                <div>
                  <div className="text-center mb-4 text-amber-300 text-lg">🔄 اختر بطاقة للتبادل</div>
                  <div className="rounded-2xl p-4 bg-black/30 max-h-[50vh] overflow-y-auto">
                    <div className="flex flex-wrap justify-center gap-2">
                      {allExchangeCards.map(card => (
                        <div key={card.id} onClick={() => handleCollectiveExchangeRespond(card)} className="cursor-pointer">
                          <PlayingCard card={card} size="sm" selected={collectiveExchangeTargetCard?.id === card.id} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {collectiveExchangePhase === 'completed' && (
                <div className="text-center text-emerald-300 text-xl">✓ تم التبادل</div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Exchange Modal ═══ */}
      <AnimatePresence>
        {showExchangeModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(5,5,20,0.92)', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="max-w-4xl w-full rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
              style={{ background: 'linear-gradient(155deg, #042a27, #052e2b)', border: '2px solid rgba(94,234,212,0.5)' }}>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-teal-100 mb-1">🔄 هات و خد</h2>
                <p className="text-teal-200/60 text-sm">بدأ بواسطة: {exchangeInitiatorPlayer?.name}</p>
              </div>
              {exchangePhase === 'waiting' && exchangeWaitingWithCards && (
                <div className="text-center">
                  <div className="text-amber-300 text-lg mb-4">⏳ بانتظار {exchangeInitiatorPlayer?.name}</div>
                  <div className="rounded-2xl p-4 bg-black/30">
                    <div className="flex flex-wrap justify-center gap-2">
                      {allExchangeCards.map(card => <PlayingCard key={card.id} card={card} size="xs" />)}
                    </div>
                  </div>
                </div>
              )}
              {exchangePhase === 'initiator_choose' && currentPlayer.id === exchangeInitiator && (
                <div>
                  <div className="text-center mb-4 text-amber-300 text-lg">📝 اختر بطاقة للتبادل</div>
                  <div className="rounded-2xl p-4 bg-black/30 max-h-[50vh] overflow-y-auto">
                    <div className="flex flex-wrap justify-center gap-2">
                      {exchangePlayerCards.map(card => (
                        <div key={card.id} onClick={() => handleInitiatorChooseCard(card)} className="cursor-pointer">
                          <PlayingCard card={card} size="sm" selected={exchangeSelectedCard?.id === card.id} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {exchangePhase === 'waiting_responder' && currentPlayer.id === exchangeInitiator && (
                <div className="text-center">
                  <div className="text-emerald-300 text-lg mb-4">✓ اخترت بطاقتك</div>
                  {exchangeSelectedCard && (
                    <div className="flex justify-center mb-4"><PlayingCard card={exchangeSelectedCard} size="sm" /></div>
                  )}
                  <p className="text-teal-100">⏳ بانتظار اللاعبين</p>
                </div>
              )}
              {exchangePhase === 'responder_choose' && currentPlayer.id !== exchangeInitiator && (
                <div>
                  <div className="text-center mb-4 text-amber-300 text-lg">🔄 اختر بطاقة للتبادل</div>
                  <div className="rounded-2xl p-4 bg-black/30 max-h-[50vh] overflow-y-auto">
                    <div className="flex flex-wrap justify-center gap-2">
                      {allExchangeCards.map(card => (
                        <div key={card.id} onClick={() => handleResponderChooseCard(card)} className="cursor-pointer">
                          <PlayingCard card={card} size="sm" selected={exchangeTargetCard?.id === card.id} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {exchangePhase === 'completed' && (
                <div className="text-center text-emerald-300 text-xl">✓ تم التبادل</div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Shake Square Modal ═══ */}
      <AnimatePresence>
        {showShakeSquare && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(5,5,20,0.92)', backdropFilter: 'blur(10px)' }}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="max-w-4xl w-full rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
              style={{ background: 'linear-gradient(155deg, #3d1e05, #1a0d02)', border: '2px solid rgba(251,191,36,0.5)' }}>
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-amber-100 mb-1">💫 نفض نفسك</h2>
                <p className="text-amber-200/60 text-sm">بدأ بواسطة: {shakeInitiatorPlayer?.name}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl p-4 bg-black/30 border border-amber-500/20">
                  <h3 className="text-lg font-semibold mb-3 text-amber-100">بطاقاتي ({myHand.length})</h3>
                  <div className="flex flex-wrap gap-1 mb-3 max-h-48 overflow-y-auto">
                    {myHand.map(card => <PlayingCard key={card.id} card={card} size="xs" />)}
                  </div>
                  {canPlaceCardsInShake && (
                    <button onClick={handlePlaceAllCardsInShake}
                      className="w-full py-3 rounded-xl font-bold text-white"
                      style={{ background: 'linear-gradient(155deg, #dc2626, #b91c1c)' }}>
                      🎯 ضع كل البطاقات ({myHand.length})
                    </button>
                  )}
                  {shakePlacedCards[currentPlayer.id] && <div className="text-center text-emerald-400 font-bold mt-3">✓ وضعت كل بطاقاتك</div>}
                  {anyPlayerPlacedCards && !shakePlacedCards[currentPlayer.id] && currentPlayer.id !== shakeInitiator && (
                    <div className="text-center text-yellow-400 font-bold mt-3 text-sm">⚠️ لاعب آخر سبقك</div>
                  )}
                  {currentPlayer.id === shakeInitiator && <div className="text-center text-slate-400 font-bold mt-3 text-sm">❌ لا يمكنك وضع بطاقاتك</div>}
                </div>
                <div className="rounded-2xl p-4 bg-black/30 border border-amber-500/20">
                  <h3 className="text-lg font-semibold mb-3 text-amber-100">اللاعبون</h3>
                  <div className="space-y-2">
                    {players.map(player => {
                      const placed = shakePlacedCards[player.id];
                      const isIn = player.id === shakeInitiator;
                      let status, colorCls;
                      if (placed) { status = `✓ ${placed.count} بطاقة`; colorCls = 'bg-emerald-900/40 border-emerald-500/40 text-emerald-100'; }
                      else if (isIn) { status = 'لا يمكنه وضع'; colorCls = 'bg-slate-800/40 border-slate-600/40 text-slate-300'; }
                      else if (anyPlayerPlacedCards) { status = 'مقفل'; colorCls = 'bg-yellow-900/30 border-yellow-600/40 text-yellow-200'; }
                      else { status = 'يمكنه وضع'; colorCls = 'bg-amber-900/30 border-amber-600/40 text-amber-100'; }
                      return (
                        <div key={player.id} className={`p-3 rounded-xl border ${colorCls} text-center text-sm`}>
                          <div className="font-bold">{player.name}</div>
                          <div className="text-xs opacity-75 mt-0.5">{status}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {currentPlayer.id === shakeInitiator && (
                <div className="mt-6 text-center">
                  <button onClick={handleCompleteShake} disabled={!shakeCanComplete}
                    className={`px-8 py-3 rounded-xl font-bold ${shakeCanComplete ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-700 cursor-not-allowed text-slate-400'}`}>
                    {shakeCanComplete ? '✓ إتمام العملية' : '⏳ بانتظار وضع البطاقات...'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          MAIN GAME BOARD
      ══════════════════════════════════════════ */}
      <div className="relative rounded-3xl p-4 overflow-hidden"
        style={{
          background: 'linear-gradient(155deg, rgba(15,10,46,0.7), rgba(30,27,75,0.6))',
          border: '1px solid rgba(201,168,118,0.15)',
        }}>

        {/* ═══ HEADER ═══ */}
        <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-amber-50 flex items-center gap-2">🎴 لعبة البطاقات</h2>
            <div className={`text-sm font-bold mt-1 ${isMyTurn ? 'text-emerald-400 animate-pulse' : 'text-amber-200/60'}`}>
              {isMyTurn ? '🎯 دورك الآن' : `⏳ دور: ${currentTurnPlayer?.name || '...'}`}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-amber-300/80">
              <span>المستوى: <span className="font-bold text-amber-300">{myLevel}/5</span></span>
              {/* بادج الفئة — دايم */}
              {myCategory && (
                <button
                  onClick={() => setShowDiceCategoryBanner(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(155deg, rgba(59,7,100,0.95), rgba(30,4,60,0.95))',
                    border: '2px solid rgba(251,191,36,0.7)',
                    color: '#fcd34d',
                    boxShadow: '0 0 18px rgba(251,191,36,0.35)',
                  }}>
                  🎲 فئتك: <span className="font-mono text-lg text-amber-300">{myCategory.id}</span>
                </button>
              )}
              {isMyTurn && (
                <span className="text-amber-400 font-bold">
                  {!gameState.playerHasDrawn?.[currentPlayer.id] ? '• اسحب بطاقة' : '• تخلص من بطاقة'}
                </span>
              )}
            </div>
          </div>
        <div className="flex flex-wrap items-center gap-1.5 justify-end">
          {/* الزر الأساسي: رجوع / خروج */}
          {isAdmin ? (
            <HeaderBtn onClick={handleExitToCategories} icon={<FaHome />} label="الفئات" />
          ) : (
            <HeaderBtn onClick={() => { if (onExit) onExit(); }} icon={<FaArrowLeft />} label="البازر" />
          )}

          {/* زر التوزيع — يظهر فقط قبل التوزيع */}
          {isAdmin && !gameState.dealt && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => socket.emit('card_game_deal', { roomCode })}
              className="px-3 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 text-amber-950 animate-pulse"
              style={{
                background: 'linear-gradient(155deg, #fcd34d, #f59e0b)',
                border: '2px solid #fcd34d',
                boxShadow: '0 0 20px rgba(251,191,36,0.6)',
              }}
            >
              🎴 <span>توزيع</span>
            </motion.button>
          )}

          {/* النرد — ظاهر دائمًا */}
          <HeaderBtn onClick={handleRollDice} icon={<FaDice />} label="النرد" color="yellow" />

          {/* السحب — ظاهر دائمًا */}
          <HeaderBtn
            onClick={handleDrawCard}
            disabled={!isMyTurn || gameState.playerHasDrawn?.[currentPlayer.id] || gameState.drawPile.length === 0}
            icon={<FaHandPaper />}
            label={`سحب (${gameState.drawPile.length})`}
            color="blue"
          />

          {/* زر القائمة لباقي الأزرار */}
          <HeaderBtn
            onClick={() => setMenuOpen(true)}
            icon={<FaBars />}
            label="المزيد"
            color="purple"
          />
        </div>
        </div>

        {/* ═══ CATEGORIES LIST — بدون animation تقيل ═══ */}
        <div className="mb-4">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-amber-100"
            style={{ background: 'linear-gradient(155deg, rgba(30,27,75,0.6), rgba(15,10,46,0.7))', border: '1px solid rgba(201,168,118,0.3)' }}>
            <FaList /> {showCategories ? 'إخفاء الفئات' : 'عرض الفئات'}
          </button>
          {showCategories && (
            <div className="mt-2 rounded-2xl p-3 bg-black/30 border border-amber-500/20 max-h-56 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {gameState.categories && gameState.categories.map(category => {
                  const isMine = myCategory?.id === category.id;
                  return (
                    <div key={category.id}
                      className={`p-2.5 rounded-lg border text-center text-xs ${isMine ? 'bg-emerald-900/40 border-emerald-500/60 text-emerald-100' : 'bg-slate-800/40 border-slate-700 text-amber-100/70'}`}>
                      <div className="font-bold text-sm">فئة {category.id}</div>
                      <div className="opacity-75 mt-0.5">{category.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ═══ PLAYER HAND — HORIZONTAL FAN ═══ */}
        <div className="relative rounded-2xl p-4"
          style={{ background: 'rgba(30,27,75,0.4)', border: '1px solid rgba(201,168,118,0.15)' }}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-amber-100 text-sm">🎴 بطاقاتي</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
              {myHand.length}
            </span>
          </div>

          {renderHandFan()}

          {/* Selected card actions */}
          <AnimatePresence>
            {selectedHandCard && renderSelectedCardActions()}
          </AnimatePresence>
        </div>

        {/* ═══ TABLE + PLAYERS LIST ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Table — 2 cols */}
          <div className="lg:col-span-2 rounded-2xl p-4"
            style={{ background: 'rgba(30,27,75,0.4)', border: '1px solid rgba(201,168,118,0.15)' }}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-amber-100 text-sm">🎯 الطاولة</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                {gameState.tableCards.length}
              </span>
            </div>

            <div className="relative h-44 flex items-center justify-center">
              {gameState.tableCards.length === 0 ? (
                <div className="text-center opacity-40">
                  <FaTable className="text-3xl text-amber-200/40 mb-2 mx-auto" />
                  <p className="text-xs text-amber-200/60">لا توجد بطاقات</p>
                </div>
              ) : (
                <>
                  {gameState.tableCards.slice(-5, -1).map((card, index) => (
                    <div key={card.id} className="absolute"
                      style={{
                        transform: `translate(${(index - 2) * 20}px, ${(index - 2) * 8}px) rotate(${(index - 2) * 5}deg)`,
                        zIndex: index, opacity: 0.6,
                      }}>
                      <PlayingCard card={card} size="sm" hideImage />
                    </div>
                  ))}
                    {topTableCard && (
                      <motion.div
                        initial={{ scale: 0.8, y: -20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="absolute z-30"
                        style={{ filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.6))' }}
                      >
                      <PlayingCard card={topTableCard} size="md" elevated onImageClick={handleCardImageClick} />
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {topTableCard && (
              <button onClick={handleTakeFromTable}
                disabled={!isMyTurn || gameState.playerHasDrawn?.[currentPlayer.id] || !canTakeCardFromTable(topTableCard)}
                className={`w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${
                  isMyTurn && !gameState.playerHasDrawn?.[currentPlayer.id] && canTakeCardFromTable(topTableCard)
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                }`}>
                <FaTable /> أخذ البطاقة العلوية
              </button>
            )}
          </div>

          {/* Progress + Circles — 1 col */}
          <div className="space-y-4">
            {/* Progress */}
            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(30,27,75,0.4)', border: '1px solid rgba(201,168,118,0.15)' }}>
              <h3 className="font-bold text-amber-100 text-xs mb-3">📊 المستوى {myLevel}/5</h3>
              <div className="relative flex justify-between items-center">
                <div className="absolute top-3.5 left-0 right-0 h-1 bg-slate-700 rounded" />
                <div className="absolute top-3.5 left-0 h-1 rounded bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-300"
                  style={{ width: `${(playerToken / 4) * 100}%` }} />
                  {[0, 1, 2, 3, 4].map(level => {
                    const active = level <= playerToken;
                    const isFinal = level === 4;

                    const stageColors = [
                      { from: '#10b981', to: '#047857', border: '#34d399' },  // 1 — أخضر
                      { from: '#06b6d4', to: '#0e7490', border: '#22d3ee' },  // 2 — أزرق
                      { from: '#8b5cf6', to: '#6d28d9', border: '#a78bfa' },  // 3 — بنفسجي
                      { from: '#f43f5e', to: '#9f1239', border: '#fb7185' },  // 4 — أحمر وردي
                      { from: '#fcd34d', to: '#b45309', border: '#fcd34d' },  // 5 — ذهبي (الفوز)
                    ];
                    const c = stageColors[level];

                    return (
                      <div key={level}
                        className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                        style={{
                          background: active ? `linear-gradient(155deg, ${c.from}, ${c.to})` : 'rgba(30,30,50,0.8)',
                          border: active ? `2px solid ${c.border}` : '2px solid rgba(148,163,184,0.3)',
                          color: active ? '#ffffff' : '#94a3b8',
                          boxShadow: active ? `0 0 10px ${c.border}80` : 'none',
                        }}>
                        {isFinal ? <FaCrown /> : level + 1}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Circles — HORIZONTAL */}
            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(30,27,75,0.4)', border: '1px solid rgba(201,168,118,0.15)' }}>
              <h3 className="font-bold text-amber-100 text-xs mb-3">⭕ دوائري ({filledCircles}/3)</h3>
              <div className="flex gap-2 justify-center">
                {[0, 1, 2, 3].map(ci => {
                  const card = myCircles[ci];
                  const isFilled = card !== null;
                  return (
                    <div key={ci}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnCircle(e, ci)}
                      className="relative flex-1 aspect-[2/3] rounded-lg flex flex-col items-center justify-center"
                      style={{
                        border: isFilled ? '2px solid transparent' : '1.5px dashed rgba(201,168,118,0.35)',
                        background: isFilled ? 'transparent' : 'rgba(255,255,255,0.02)',
                      }}>
                      {isFilled ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <PlayingCard card={card} size="xs" onImageClick={handleCardImageClick} />
                          <button
                            onClick={() => socket.emit('card_game_remove_from_circle', { roomCode, playerId: currentPlayer.id, circleIndex: ci })}
                            disabled={!isMyTurn || !buttonsEnabled}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center border border-red-400 shadow-lg">
                            <FaTimes />
                          </button>
                        </div>
                      ) : (
                        <div className="text-center opacity-40">
                          <FaCircle className="text-lg text-amber-200/40 mb-0.5 mx-auto" />
                          <p className="text-[8px] text-amber-200/60">{ci + 1}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filledCircles >= 3 && isMyTurn && buttonsEnabled && (
                <button onClick={() => socket.emit('card_game_declare', { roomCode, playerId: currentPlayer.id })}
                  className="w-full mt-3 py-2.5 rounded-xl font-bold text-amber-950 flex items-center justify-center gap-2 text-sm"
                  style={{ background: 'linear-gradient(155deg, #fcd34d, #f59e0b)' }}>
                  <FaTrophy /> إعلان اكتمال الفئة!
                </button>
              )}
            </div>
          </div>
        </div>


      </div>
    </div>
  );
};

export default CardGame;