import React, { useState, useEffect } from 'react';
import {
  FaDice, FaRandom, FaHandPaper, FaTable, FaCheck, FaTimes,
  FaTrophy, FaPlay, FaRedo, FaList, FaAngleDown, FaAngleUp,
  FaStar, FaCircle, FaHome, FaBook, FaTimesCircle, FaUserSlash,
  FaExpand, FaCrown, FaExchangeAlt, FaUsers, FaTrash, FaUndo,
  FaUser, FaArrowLeft
} from 'react-icons/fa';

// ─── Card colour map (site palette) ────────────────────────────────
const cardGradients = {
  skip:                'from-rose-700 to-pink-700',
  joker:               'from-cyan-600 to-blue-700',
  shake:               'from-amber-600 to-orange-600',
  exchange:            'from-teal-600 to-cyan-700',
  collective_exchange: 'from-fuchsia-600 to-pink-900',   // ← new, brighter magenta
  actor:               'from-gray-800 to-blue-900',       // dark blue‑grey
  movie:               'from-gray-800 to-rose-800',       // dark red‑grey
};

const getCardGradient = (card) => {
  if (card.type === 'action') {
    return cardGradients[card.subtype] || 'from-gray-700 to-gray-800';
  }
  return cardGradients[card.type] || 'from-gray-700 to-gray-800';
};

// ─── Always‑shimmer border for action cards ────────────────────────
const ActionCardWrapper = ({ children, borderGradient }) => (
  <div className="relative p-[1px] rounded-lg overflow-hidden">
    <div
      className={`absolute inset-0 rounded-lg bg-gradient-to-r ${borderGradient} animate-shimmer bg-[length:200%_200%]`}
    />
    <div className="relative rounded-lg">
      {children}
    </div>
  </div>
);



const CardGame = ({ socket, roomCode, players, currentPlayer, isAdmin, onExit }) => {
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
  const [rolledCategory, setRolledCategory] = useState(null);
  const [selectedCardForView, setSelectedCardForView] = useState(null);
  const [winner, setWinner] = useState(null);
  
  // Shake card states
  const [showShakeSquare, setShowShakeSquare] = useState(false);
  const [shakeInitiator, setShakeInitiator] = useState(null);
  const [shakeActionCard, setShakeActionCard] = useState(null);
  const [shakePlacedCards, setShakePlacedCards] = useState({});
  const [shakeCanComplete, setShakeCanComplete] = useState(false);

  // Exchange card states
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [exchangeInitiator, setExchangeInitiator] = useState(null);
  const [exchangeActionCard, setExchangeActionCard] = useState(null);
  const [exchangeSelectedCard, setExchangeSelectedCard] = useState(null);
  const [exchangeTargetCard, setExchangeTargetCard] = useState(null);
  const [exchangeCompleted, setExchangeCompleted] = useState(false);
  const [exchangePhase, setExchangePhase] = useState('waiting');
  const [exchangeWaitingWithCards, setExchangeWaitingWithCards] = useState(false);
  const [exchangePlayerCards, setExchangePlayerCards] = useState([]);

  // Collective exchange card states
  const [showCollectiveExchangeModal, setShowCollectiveExchangeModal] = useState(false);
  const [collectiveExchangeInitiator, setCollectiveExchangeInitiator] = useState(null);
  const [collectiveExchangeActionCard, setCollectiveExchangeActionCard] = useState(null);
  const [collectiveExchangeSelectedCard, setCollectiveExchangeSelectedCard] = useState(null);
  const [collectiveExchangeTargetCard, setCollectiveExchangeTargetCard] = useState(null);
  const [collectiveExchangePhase, setCollectiveExchangePhase] = useState('waiting');
  const [collectiveExchangeWaitingWithCards, setCollectiveExchangeWaitingWithCards] = useState(false);
  const [collectiveExchangePlayerCards, setCollectiveExchangePlayerCards] = useState([]);

  // Dice category banner state
  const [showDiceCategoryBanner, setShowDiceCategoryBanner] = useState(false);
  const [diceCategoryData, setDiceCategoryData] = useState(null);

  // Track if any player has placed cards in shake (global state)
  const [anyPlayerPlacedCards, setAnyPlayerPlacedCards] = useState(false);

  // ---------- Helper functions (all original) ----------
  const canTakeCardFromTable = (card) => !(!card || card.type === 'action');

  const areButtonsEnabled = () => {
    if (!gameState || !currentPlayer) return false;
    return gameState.playerHasDrawn?.[currentPlayer.id] === true;
  };

  const handleCardImageClick = (card) => setSelectedCardForView(card);
  const handleClosePhotoViewer = () => setSelectedCardForView(null);

  const handleResetGameAnyPlayer = () => {
    console.log('🔄 Any player requesting game reset');
    setWinner(null);
    setShowShakeSquare(false);
    setShowExchangeModal(false);
    setShowCollectiveExchangeModal(false);
    setAnyPlayerPlacedCards(false);
    socket.emit('card_game_reset_any_player', { roomCode });
  };

  const handleOpenShakeSquare = (data) => {
    console.log('🔄 Opening shake square:', data);
    setShowShakeSquare(true);
    setShakeInitiator(data.playerId);
    setShakeActionCard(data.actionCard);
    setShakePlacedCards({});
    setAnyPlayerPlacedCards(false);
    setShakeCanComplete(false);
  };

  const handleOpenExchangeChooseCard = (data) => {
    console.log('🔄 Opening exchange choose card for initiator:', data);
    setShowExchangeModal(true);
    setExchangeInitiator(data.initiatorId);
    setExchangeActionCard(data.actionCard);
    setExchangeSelectedCard(null);
    setExchangeTargetCard(null);
    setExchangeCompleted(false);
    setExchangePhase('initiator_choose');
    setExchangeWaitingWithCards(false);
    setExchangePlayerCards(data.playerCards || []);
  };

  const handleOpenExchangeWaitingWithCards = (data) => {
    console.log('🔄 Opening exchange waiting with cards for other players:', data);
    setShowExchangeModal(true);
    setExchangeInitiator(data.initiatorId);
    setExchangeActionCard(null);
    setExchangeSelectedCard(null);
    setExchangeTargetCard(null);
    setExchangeCompleted(false);
    setExchangePhase('waiting');
    setExchangeWaitingWithCards(true);
  };

  const handleExchangeInitiatorChosen = (data) => {
    console.log('🔄 Exchange initiator chosen card:', data);
    setExchangeSelectedCard(data.initiatorCard);
    if (currentPlayer.id === data.initiatorId) {
      setExchangePhase('waiting_responder');
      setExchangeWaitingWithCards(false);
    } else {
      setExchangePhase('responder_choose');
      setExchangeWaitingWithCards(false);
    }
  };

  const handleOpenCollectiveExchangeChooseCard = (data) => {
    console.log('🔄 Opening collective exchange choose card for initiator:', data);
    setShowCollectiveExchangeModal(true);
    setCollectiveExchangeInitiator(data.initiatorId);
    setCollectiveExchangeActionCard(data.actionCard);
    setCollectiveExchangeSelectedCard(null);
    setCollectiveExchangeTargetCard(null);
    setCollectiveExchangePhase('initiator_choose');
    setCollectiveExchangeWaitingWithCards(false);
    setCollectiveExchangePlayerCards(data.playerCards || []);
  };

  const handleOpenCollectiveExchangeWaitingWithCards = (data) => {
    console.log('🔄 Opening collective exchange waiting with cards for other players:', data);
    setShowCollectiveExchangeModal(true);
    setCollectiveExchangeInitiator(data.initiatorId);
    setCollectiveExchangeActionCard(null);
    setCollectiveExchangeSelectedCard(null);
    setCollectiveExchangeTargetCard(null);
    setCollectiveExchangePhase('waiting');
    setCollectiveExchangeWaitingWithCards(true);
  };

  const handleCollectiveExchangeInitiatorChosen = (data) => {
    console.log('🔄 Collective exchange initiator chosen card:', data);
    setCollectiveExchangeSelectedCard(data.initiatorCard);
    if (currentPlayer.id === data.initiatorId) {
      setCollectiveExchangePhase('waiting_responder');
      setCollectiveExchangeWaitingWithCards(false);
    } else {
      setCollectiveExchangePhase('responder_choose');
      setCollectiveExchangeWaitingWithCards(false);
    }
  };

  const getAllExchangeCards = () => {
    if (!gameState || !currentPlayer) return [];
    const myHand = gameState.playerHands[currentPlayer.id] || [];
    const myCircles = gameState.playerCircles[currentPlayer.id] || [];
    const allCards = [];
    myHand.forEach((card, index) => {
      allCards.push({
        ...card,
        source: 'hand',
        displayOrder: card.originalHandIndex !== undefined ? card.originalHandIndex : index
      });
    });
    myCircles.forEach((card, circleIndex) => {
      if (card) {
        allCards.push({
          ...card,
          source: 'circle',
          displayOrder: card.originalHandIndex !== undefined ? card.originalHandIndex : 1000 + circleIndex
        });
      }
    });
    allCards.sort((a, b) => a.displayOrder - b.displayOrder);
    return allCards;
  };

  const handleUseExchangeCard = (cardId) => {
    if (gameState.currentTurn === currentPlayer?.id && areButtonsEnabled()) {
      socket.emit('card_game_use_exchange', { roomCode, playerId: currentPlayer.id, cardId });
    }
  };

  const handleUseCollectiveExchangeCard = (cardId) => {
    if (gameState.currentTurn === currentPlayer?.id && areButtonsEnabled()) {
      socket.emit('card_game_use_collective_exchange', { roomCode, playerId: currentPlayer.id, cardId });
    }
  };

  const handleInitiatorChooseCard = (card) => {
    if (currentPlayer.id === exchangeInitiator && exchangePhase === 'initiator_choose') {
      socket.emit('card_game_exchange_choose_card', { roomCode, playerId: currentPlayer.id, cardId: card.id, source: card.source });
      setExchangeSelectedCard(card);
      setExchangePhase('waiting_responder');
    }
  };

  const handleCollectiveInitiatorChooseCard = (card) => {
    if (currentPlayer.id === collectiveExchangeInitiator && collectiveExchangePhase === 'initiator_choose') {
      socket.emit('card_game_collective_exchange_choose_card', { roomCode, playerId: currentPlayer.id, cardId: card.id, source: card.source });
      setCollectiveExchangeSelectedCard(card);
      setCollectiveExchangePhase('waiting_responder');
    }
  };

  const handleResponderChooseCard = (card) => {
    if (currentPlayer.id !== exchangeInitiator && exchangePhase === 'responder_choose') {
      socket.emit('card_game_exchange_respond', { roomCode, playerId: currentPlayer.id, cardId: card.id, source: card.source });
      setExchangeTargetCard(card);
      setExchangePhase('completed');
    }
  };

  const handleCollectiveExchangeRespond = (card) => {
    if (currentPlayer.id !== collectiveExchangeInitiator && collectiveExchangePhase === 'responder_choose') {
      socket.emit('card_game_collective_exchange_respond', { roomCode, playerId: currentPlayer.id, cardId: card.id, source: card.source });
      setCollectiveExchangeTargetCard(card);
      setCollectiveExchangePhase('completed');
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
    if (gameState.currentTurn === currentPlayer?.id && areButtonsEnabled()) {
      socket.emit('card_game_use_shake', { roomCode, playerId: currentPlayer.id, cardId });
    }
  };

  const handleUseSkipCard = (cardId) => {
    if (gameState.currentTurn === currentPlayer?.id && areButtonsEnabled()) {
      socket.emit('card_game_use_skip', { roomCode, playerId: currentPlayer.id, cardId });
    }
  };

  // ─── Render functions ────────────────────────────────────────────
  const renderCardImage = (card, sizeClass = "w-24 h-24") => {
    if (!card.image) {
      return (
        <div className={`${sizeClass} bg-gray-200 rounded-lg flex items-center justify-center border-1 border-white`}>
          <div className="text-gray-400 text-xs text-center">No Image</div>
        </div>
      );
    }
    return (
      <div className="relative">
        <img
          src={`${process.env.PUBLIC_URL}${card.image}`}
          alt={card.name}
          className={`${sizeClass} object-cover rounded-lg border-1 border-white cursor-pointer hover:opacity-80 transition-opacity`}
          onClick={() => handleCardImageClick(card)}
        />
        <button
          className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded-full text-xs hover:bg-opacity-70 transition-all"
          onClick={() => handleCardImageClick(card)}
          title="تكبير الصورة"
        >
          <FaExpand />
        </button>
      </div>
    );
  };

  const renderCircleImage = (card, sizeClass = "w-24 h-24") => {
    if (!card.image) {
      return (
        <div className={`${sizeClass} bg-gray-200 rounded-lg flex items-center justify-center border-2 border-white mx-auto mb-2`}>
          <div className="text-gray-400 text-xs text-center">No Image</div>
        </div>
      );
    }
    return (
      <div className="relative">
        <img 
          src={`${process.env.PUBLIC_URL}${card.image}`}
          alt={card.name}
          className={`${sizeClass} object-cover rounded-lg border-2 border-white mx-auto mb-2 cursor-pointer hover:opacity-80 transition-opacity`}
          onClick={() => handleCardImageClick(card)}
        />
        <button 
          className="absolute top-1 right-1 bg-black bg-opacity-50 text-white p-1 rounded-full text-xs hover:bg-opacity-70 transition-all"
          onClick={() => handleCardImageClick(card)}
          title="تكبير الصورة"
        >
          <FaExpand />
        </button>
      </div>
    );
  };

  const renderTableCardImage = (card, sizeClass = "w-full h-20") => {
    if (!card.image) {
      return (
        <div className={`${sizeClass} bg-gray-200 rounded-md flex items-center justify-center`}>
          <div className="text-gray-400 text-xs text-center">No Image</div>
        </div>
      );
    }
    return (
      <div 
        className={`${sizeClass} bg-black bg-opacity-20 rounded-md flex items-center justify-center overflow-hidden mb-2 cursor-pointer hover:opacity-80 transition-opacity`}
        onClick={() => handleCardImageClick(card)}
      >
        <img 
          src={`${process.env.PUBLIC_URL}${card.image}`} 
          alt={card.name} 
          className="w-full h-full object-cover rounded-md"
        />
      </div>
    );
  };

  const renderShakeCard = (card, onClick = null, showRemove = false) => (
    <div className="relative">
      <div 
        className={`p-3 rounded-lg mb-2 transition-all cursor-pointer bg-indigo-600 hover:bg-indigo-500 flex flex-col items-center`}
        onClick={onClick}
      >
        <div className="font-bold text-center text-lg mb-2">Card</div>
        <div className="text-xs text-center opacity-75">
          {card.type === 'actor' ? 'ممثل' : card.type === 'movie' ? 'فيلم' : card.type === 'action' ? 'إجراء' : 'مخرج'}
        </div>
        <div className="text-sm font-semibold text-center mt-2 text-white">{card.name}</div>
      </div>
    </div>
  );

  const renderExchangeCard = (card, onClick = null, isSelected = false, isInitiator = false, isDisabled = false) => {
    const isCircleCard = card.source === 'circle';
    return (
      <div className="relative">
        <div 
          className={`p-3 rounded-lg mb-2 transition-all ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${
            isSelected ? 'ring-4 ring-yellow-400' : ''
          } ${isCircleCard ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500'} flex flex-col items-center`}
          onClick={isDisabled ? null : onClick}
        >
          <div className="font-bold text-center text-lg mb-2">Card</div>
          <div className="text-xs text-center opacity-75">
            {card.type === 'actor' ? 'ممثل' : card.type === 'movie' ? 'فيلم' : card.type === 'action' ? 'إجراء' : 'مخرج'}
          </div>
          <div className="text-sm font-semibold text-center mt-2 text-white">{card.name}</div>
          {isCircleCard && <div className="text-xs text-yellow-300 font-bold mt-1">⭕ في الدائرة</div>}
          {isSelected && <div className="text-xs text-yellow-300 font-bold mt-1">{isInitiator ? '✓ مختارة للتبادل' : '✓ مختارة'}</div>}
          {isDisabled && <div className="text-xs text-gray-300 font-bold mt-1">⏳ بانتظار اختيار اللاعب الآخر</div>}
        </div>
      </div>
    );
  };

  const renderCollectiveExchangeCard = (card, onClick = null, isSelected = false, isInitiator = false, isDisabled = false) => {
    const isCircleCard = card.source === 'circle';
    return (
      <div className="relative">
        <div 
          className={`p-3 rounded-lg mb-2 transition-all ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${
            isSelected ? 'ring-4 ring-yellow-400' : ''
          } ${isCircleCard ? 'bg-green-600 hover:bg-green-500' : 'bg-purple-600 hover:bg-purple-500'} flex flex-col items-center`}
          onClick={isDisabled ? null : onClick}
        >
          <div className="font-bold text-center text-lg mb-2">Card</div>
          <div className="text-xs text-center opacity-75">
            {card.type === 'actor' ? 'ممثل' : card.type === 'movie' ? 'فيلم' : card.type === 'action' ? 'إجراء' : 'مخرج'}
          </div>
          <div className="text-sm font-semibold text-center mt-2 text-white">{card.name}</div>
          {isCircleCard && <div className="text-xs text-yellow-300 font-bold mt-1">⭕ في الدائرة</div>}
          {isSelected && <div className="text-xs text-yellow-300 font-bold mt-1">{isInitiator ? '✓ مختارة للتبادل' : '✓ مختارة'}</div>}
          {isDisabled && <div className="text-xs text-gray-300 font-bold mt-1">⏳ بانتظار اختيار اللاعب الآخر</div>}
        </div>
      </div>
    );
  };

  const handleCloseDiceCategoryBanner = () => {
    setShowDiceCategoryBanner(false);
    setDiceCategoryData(null);
  };

  // ---------- Effects ----------
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
    console.log('🎮 Initializing game...', { roomCode, currentPlayer: currentPlayer?.id });
    setError('');
    if (socket) socket.emit('card_game_initialize', { roomCode });
  };

  useEffect(() => {
    if (!socket) return;
    console.log('🔌 Setting up card game listeners...');

    const handleGameUpdate = (newGameState) => {
      console.log('🃏 Game state update received:', newGameState);
      setGameState(newGameState);
      setError('');
    };
    const handleGameError = (errorData) => {
      console.error('❌ Card game error:', errorData);
      setError(errorData.message);
    };
    const handleDiceRolled = (data) => {
      setDiceValue(data.diceValue);
      setShowDice(true);
      setTimeout(() => setShowDice(false), 3000);
    };
    const handleDiceCategory = (data) => {
      setRolledCategory(data.category);
      setDiceCategoryData(data.category);
      setShowDiceCategoryBanner(true);
    };
    const handleGameExited = () => { if (onExit) onExit(); };
    const handleGameReset = () => {
      setWinner(null);
      setShowShakeSquare(false);
      setShowExchangeModal(false);
      setShowCollectiveExchangeModal(false);
      setShakePlacedCards({});
      setShowDiceCategoryBanner(false);
      setDiceCategoryData(null);
      setAnyPlayerPlacedCards(false);
      setShakeCanComplete(false);
    };
    const handleWinnerAnnounced = (data) => {
      const wp = players.find(p => p.id === data.playerId);
      if (wp) setWinner(wp);
    };
    const handleShakeAllCardsPlaced = (data) => {
      setShakePlacedCards(prev => ({ ...prev, [data.playerId]: { cards: data.cards, count: data.cardCount } }));
      setAnyPlayerPlacedCards(true);
      setShakeCanComplete(data.canComplete);
    };
    const handleShakeCompleted = () => {
      setShowShakeSquare(false);
      setShakeInitiator(null);
      setShakeActionCard(null);
      setShakePlacedCards({});
      setAnyPlayerPlacedCards(false);
      setShakeCanComplete(false);
    };
    const handleExchangeCompleted = () => {
      setShowExchangeModal(false);
      setExchangeInitiator(null);
      setExchangeActionCard(null);
      setExchangeSelectedCard(null);
      setExchangeTargetCard(null);
      setExchangeCompleted(false);
      setExchangePhase('waiting');
      setExchangeWaitingWithCards(false);
      setExchangePlayerCards([]);
    };
    const handleExchangeCancelled = () => {
      setShowExchangeModal(false);
      setExchangeInitiator(null);
      setExchangeActionCard(null);
      setExchangeSelectedCard(null);
      setExchangeTargetCard(null);
      setExchangeCompleted(false);
      setExchangePhase('waiting');
      setExchangeWaitingWithCards(false);
      setExchangePlayerCards([]);
    };
    const handleCollectiveExchangeCompleted = () => {
      setShowCollectiveExchangeModal(false);
      setCollectiveExchangeInitiator(null);
      setCollectiveExchangeActionCard(null);
      setCollectiveExchangeSelectedCard(null);
      setCollectiveExchangeTargetCard(null);
      setCollectiveExchangePhase('waiting');
      setCollectiveExchangeWaitingWithCards(false);
      setCollectiveExchangePlayerCards([]);
    };
    const handleCollectiveExchangeCancelled = () => {
      setShowCollectiveExchangeModal(false);
      setCollectiveExchangeInitiator(null);
      setCollectiveExchangeActionCard(null);
      setCollectiveExchangeSelectedCard(null);
      setCollectiveExchangeTargetCard(null);
      setCollectiveExchangePhase('waiting');
      setCollectiveExchangeWaitingWithCards(false);
      setCollectiveExchangePlayerCards([]);
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

  // Drag and drop
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
  };
  const getTopTableCard = () => gameState?.tableCards?.[gameState.tableCards.length - 1] || null;
  const handleResetGame = () => {
    if (isAdmin) {
      setWinner(null);
      setShowShakeSquare(false);
      setShowExchangeModal(false);
      setShowCollectiveExchangeModal(false);
      socket.emit('card_game_reset', { roomCode });
    }
  };
  const handleExitToCategories = () => {
    if (isAdmin) {
      socket.emit('card_game_exit', { roomCode });
      if (onExit) onExit();
    }
  };
  const handleTakeFromTable = () => {
    const top = getTopTableCard();
    if (top && gameState.currentTurn === currentPlayer?.id && !gameState.playerHasDrawn?.[currentPlayer.id] && canTakeCardFromTable(top)) {
      socket.emit('card_game_take_table', { roomCode, playerId: currentPlayer.id, cardId: top.id });
    }
  };

  // ----- WINNER FALLBACK (works even if the event is missed) -----
  useEffect(() => {
    if (gameState && gameState.winner) {
      const winPlayer = players.find(p => p.id === gameState.winner);
      if (winPlayer && (!winner || winner.id !== winPlayer.id)) {
        setWinner(winPlayer);
      }
    }
  }, [gameState, players, winner]);

  if (!currentPlayer) {
    return <div className="bg-red-600 rounded-xl p-6 text-center"><h2 className="text-xl font-bold">خطأ: لم يتم تحميل بيانات اللاعب</h2></div>;
  }

  if (!gameState || !gameState.gameStarted) {
    return (
      <div className="bg-indigo-800 rounded-xl p-6 shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">لعبة البطاقات</h2>
        
        {error && (
          <div className="bg-red-600 rounded-lg p-3 mb-4">
            <p className="font-bold">خطأ:</p>
            <p>{error}</p>
          </div>
        )}
        
        <div className="mb-4 bg-indigo-700 rounded-lg p-4">
          <p className="text-sm">تفاصيل الاتصال:</p>
          <p className="text-xs opacity-75">الغرفة: {roomCode}</p>
          <p className="text-xs opacity-75">اللاعب: {currentPlayer.name}</p>
          <p className="text-xs opacity-75">الاتصال: {socket ? '✅ متصل' : '❌ غير متصل'}</p>
          <p className="text-xs opacity-75">اللاعبون في الغرفة: {players.length}</p>
        </div>

        {/* Only admin sees the start button */}
        {isAdmin ? (
          <button
            onClick={initializeGame}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-6 py-3 rounded-lg font-bold text-lg"
          >
            بدء اللعبة
          </button>
        ) : (
          <p className="text-indigo-200">بانتظار المسؤول لبدء اللعبة...</p>
        )}
      </div>
    );
  }

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

  // ---------- Return JSX (with new player button) ----------
  return (
    <div className="bg-indigo-800 rounded-xl p-6 shadow-lg">
      {error && (
        <div className="bg-red-600 rounded-lg p-3 mb-4">
          <p className="font-bold">خطأ:</p><p>{error}</p>
          <button onClick={() => setError('')} className="mt-2 bg-red-700 hover:bg-red-800 py-1 px-3 rounded">إغلاق</button>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-indigo-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">قواعد اللعبة</h2>
              <button onClick={() => setShowRules(false)} className="text-white text-2xl"><FaTimesCircle /></button>
            </div>
            <div className="space-y-4 text-right text-white">
              <p>1. كل لاعب يحصل على 5 بطاقات.</p>
              <p>2. الهدف هو جمع 3 بطاقات تنتمي لنفس الفئة (ممثلين أو أفلام) في الدوائر.</p>
              <p>3. في دورك، اسحب بطاقة ثم تخلص من بطاقة على الطاولة.</p>
              <p>4. البطاقات الخاصة:
                <br/> - جوكر: يستخدم كأي بطاقة.
                <br/> - تخطي: يتخطى اللاعب التالي.
                <br/> - نفض نفسك: يستطيع لاعب واحد (غير البادئ) وضع كل بطاقاته وسحب 5 جديدة.
                <br/> - هات وخد: تبادل بطاقة مع لاعب آخر.
                <br/> - كل واحد يطلع باللي معاه: تبادل جماعي.
              </p>
              <p>5. عند اكتمال 3 بطاقات في الدوائر، يمكنك إعلان الفئة ويراجعها الجميع.</p>
              <p>6. أول من يصل إلى المستوى 5 يفوز!</p>
            </div>
            <button onClick={() => setShowRules(false)} className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg font-bold">حسناً</button>
          </div>
        </div>
      )}

      {/* Dice Category Banner */}
      {showDiceCategoryBanner && diceCategoryData && (
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 relative">
          <button onClick={handleCloseDiceCategoryBanner} className="absolute top-3 right-3 text-white hover:text-gray-200 text-xl"><FaTimesCircle /></button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <FaDice className="text-3xl text-yellow-300" />
              <h2 className="text-2xl font-bold text-white">الفئة الخاصة بك</h2>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-300 mb-1">الفئة {diceCategoryData.id}</div>
                  <div className="text-white text-sm">رقم الفئة</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-white mb-1">{diceCategoryData.name}</div>
                  <div className="text-white text-sm">اسم الفئة</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">{diceCategoryData.description}</div>
                  <div className="text-white text-sm">وصف الفئة</div>
                </div>
              </div>
            </div>
            <div className="mt-3 text-yellow-200 text-sm">🎲 هذه الفئة خاصة بك فقط ولا يراها اللاعبون الآخرون</div>
          </div>
        </div>
      )}

      {/* Winner Modal */}
      {winner && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl max-w-2xl w-full text-center p-8">
            <div className="mb-6">
              <FaCrown className="text-6xl text-white mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-white mb-4">🎉 تهانينا! 🎉</h2>
              <p className="text-2xl font-bold text-white mb-2">{winner.name}</p>
              <p className="text-xl text-white">فاز باللعبة!</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-6">
              <p className="text-lg font-semibold text-white">لقد أكمل 4 فئات ووصل لدائرة الفوز!</p>
              <p className="text-white mt-2">🎊 أحسنت! 🎊</p>
            </div>
            <div className="flex gap-4 justify-center flex-wrap">
              <button onClick={handleResetGameAnyPlayer} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"><FaRedo /> لعبة جديدة</button>
              <button onClick={handleExitToCategories} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"><FaHome /> العودة للفئات</button>
            </div>
          </div>
        </div>
      )}

      {/* Collective Exchange Modal */}
      {showCollectiveExchangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-purple-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-center text-white">كل واحد يطلع باللي معاه - تبادل جماعي</h2>
              <p className="text-purple-200 text-center">
                بدأ بواسطة: {collectiveExchangeInitiatorPlayer?.name || 'لاعب'}
              </p>
            </div>

            {collectiveExchangePhase === 'waiting' && collectiveExchangeWaitingWithCards && (
              <div className="text-center">
                <div className="text-yellow-300 text-xl mb-4">
                  ⏳ بانتظار {collectiveExchangeInitiatorPlayer?.name || 'اللاعب'} لاختيار بطاقته...
                </div>
                <div className="bg-purple-700 rounded-lg p-4 mb-4">
                  <p className="text-lg">اللاعب الذي بدأ التبادل يحتاج لاختيار بطاقة من يده أو دوائره أولاً</p>
                  <p className="text-sm text-purple-200 mt-2">يمكنك رؤية بطاقاتك لكن لا يمكنك الاختيار حتى يختار اللاعب الآخر</p>
                </div>

                {/* Show player's cards (non-selectable) */}
                <div className="bg-purple-700 rounded-lg p-4 mt-4">
                  <h3 className="text-lg font-semibold mb-4 text-center">بطاقاتي (غير قابلة للاختيار)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                    {allExchangeCards.length === 0 ? (
                      <div className="text-center text-gray-400 p-4">
                        لا توجد بطاقات متاحة
                      </div>
                    ) : (
                      allExchangeCards.map(card => (
                        <div key={card.id}>
                          {renderCollectiveExchangeCard(card, null, false, false, true)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {collectiveExchangePhase === 'initiator_choose' && currentPlayer.id === collectiveExchangeInitiator && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-yellow-300 text-xl mb-2">📝 اختر بطاقة للتبادل الجماعي</div>
                  <p className="text-purple-200">اختر بطاقة من يدك أو دوائرك لتبادلها مع لاعب آخر</p>
                  <p className="text-green-300 text-sm mt-1">⭕ البطاقات الخضراء موجودة في دوائرك</p>
                  <p className="text-yellow-300 text-sm mt-1">📊 البطاقات مرتبة حسب ترتيبها الأصلي في يدك</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-purple-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 text-center">بطاقاتي (اليد والدوائر) بالترتيب الأصلي</h3>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                      {collectiveExchangePlayerCards.length === 0 ? (
                        <div className="text-center text-gray-400 p-4">
                          لا توجد بطاقات متاحة للتبادل
                        </div>
                      ) : (
                        collectiveExchangePlayerCards.map(card => (
                          <div 
                            key={card.id} 
                            className="cursor-pointer transform hover:scale-105 transition-transform"
                            onClick={() => handleCollectiveInitiatorChooseCard(card)}
                          >
                            {renderCollectiveExchangeCard(card, null, collectiveExchangeSelectedCard?.id === card.id, true)}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-purple-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 text-center">تعليمات التبادل الجماعي</h3>
                    <div className="space-y-4">
                      <div className="bg-purple-600 p-3 rounded-lg">
                        <h4 className="font-semibold text-yellow-300">📝 الخطوات:</h4>
                        <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
                          <li>اخنتر لاعب للبتادل معه</li>
                          <li>يجب ان تقول اسم الفيلم او الممثل اللي انت عايزه من اللاعب الآخر</li>
                          <li>اذا كان اللاعب الآخر معاه الكارت سوف يعطيه لك و انت تعطيه كارت من كروتك بإختيارك انت وليس من إختيار اللآعب الآخر</li>
                          <li>اذا لم يكن الكارت الذي قولته مع اللاعب الآخر، سوف تضغط علي زرار إلغاء التبادل و ينتقل الدور للاعب التالي</li>
                        </ol>
                      </div>

                      <div className="bg-yellow-900 bg-opacity-30 p-3 rounded-lg">
                        <h4 className="font-semibold text-yellow-300">⚠️ ملاحظات:</h4>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                          <li>يمكنك تبادل البطاقات من يدك أو دوائرك</li>
                          <li>البطاقات مرتبة حسب ترتيبها الأصلي في يدك</li>
                          <li>اللاعب الآخر سيختار البطاقة التي يعطيك إياها</li>
                          <li>لا يمكنك إلغاء التبادل بعد اختيار البطاقة</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={handleCancelCollectiveExchange}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 mx-auto"
                  >
                    <FaTimes /> إلغاء التبادل
                  </button>
                </div>
              </div>
            )}

            {collectiveExchangePhase === 'waiting_responder' && currentPlayer.id === collectiveExchangeInitiator && (
              <div className="text-center">
                <div className="text-yellow-300 text-xl mb-4">
                  ✅ لقد اخترت بطاقتك
                </div>
                {collectiveExchangeSelectedCard && (
                  <div className="bg-green-600 rounded-lg p-4 mb-4 max-w-md mx-auto">
                    <div className="font-bold text-lg">البطاقة المختارة:</div>
                    <div className="text-xl font-bold mt-2">{collectiveExchangeSelectedCard.name}</div>
                    <div className="text-sm opacity-75">
                      {collectiveExchangeSelectedCard.type === 'actor' ? 'ممثل' : 
                       collectiveExchangeSelectedCard.type === 'movie' ? 'فيلم' : 
                       collectiveExchangeSelectedCard.type === 'action' ? 'إجراء' : 'مخرج'}
                    </div>
                    {collectiveExchangeSelectedCard.source === 'circle' && (
                      <div className="text-xs text-yellow-300 mt-1">⭕ كانت في دائرة</div>
                    )}
                  </div>
                )}
                <div className="bg-purple-700 rounded-lg p-4">
                  <p className="text-lg">⏳ بانتظار اللاعبين الآخرين لاختيار بطاقة للتبادل...</p>
                  <p className="text-sm text-purple-200 mt-2">أول لاعب يختار بطاقة سيكون شريكك في التبادل</p>
                </div>
              </div>
            )}

            {collectiveExchangePhase === 'responder_choose' && currentPlayer.id !== collectiveExchangeInitiator && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-yellow-300 text-xl mb-2">🔄 التبادل الجماعي</div>
                  <p className="text-purple-200">
                    {collectiveExchangeInitiatorPlayer?.name || 'اللاعب'} يريد تبادل بطاقته:
                  </p>
                  {collectiveExchangeSelectedCard && (
                    <div className="bg-purple-600 rounded-lg p-3 mt-2 max-w-md mx-auto">
                      <div className="font-bold text-lg">{collectiveExchangeSelectedCard.name}</div>
                      <div className="text-sm opacity-75">
                        {collectiveExchangeSelectedCard.type === 'actor' ? 'ممثل' : 
                         collectiveExchangeSelectedCard.type === 'movie' ? 'فيلم' : 
                         collectiveExchangeSelectedCard.type === 'action' ? 'إجراء' : 'مخرج'}
                      </div>
                      {collectiveExchangeSelectedCard.source === 'circle' && (
                        <div className="text-xs text-yellow-300 mt-1">⭕ كانت في دائرة</div>
                      )}
                    </div>
                  )}
                  <p className="text-purple-200 mt-4">اختر بطاقة من يدك أو دوائرك للتبادل:</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-purple-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 text-center">اختر بطاقة للتبادل</h3>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                      {allExchangeCards.length === 0 ? (
                        <div className="text-center text-gray-400 p-4">
                          لا توجد بطاقات متاحة للتبادل
                        </div>
                      ) : (
                        allExchangeCards.map(card => (
                          <div 
                            key={card.id} 
                            className="cursor-pointer transform hover:scale-105 transition-transform"
                            onClick={() => handleCollectiveExchangeRespond(card)}
                          >
                            {renderCollectiveExchangeCard(card, null, collectiveExchangeTargetCard?.id === card.id)}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-purple-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 text-center">تفاصيل التبادل</h3>
                    <div className="space-y-4">
                      <div className="bg-purple-600 p-3 rounded-lg">
                        <h4 className="font-semibold text-yellow-300">🔄 ماذا سيحدث:</h4>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                          <li>ستعطي البطاقة المختارة لـ {collectiveExchangeInitiatorPlayer?.name || 'اللاعب'}</li>
                          <li>ستحصل على بطاقة {collectiveExchangeSelectedCard?.name} منه</li>
                          <li>التبادل نهائي ولا يمكن التراجع عنه</li>
                        </ul>
                      </div>

                      <div className="bg-green-900 bg-opacity-30 p-3 rounded-lg">
                        <h4 className="font-semibold text-green-300">💡 نصيحة:</h4>
                        <p className="text-sm mt-2">
                          اختر بطاقة لا تحتاجها أو تريد استبدالها ببطاقة {collectiveExchangeSelectedCard?.type === 'actor' ? 'ممثل' : 'فيلم'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {collectiveExchangePhase === 'completed' && (
              <div className="text-center">
                <div className="text-green-300 text-xl mb-4">
                  ✅ تم إكمال التبادل
                </div>
                <div className="bg-purple-700 rounded-lg p-4">
                  <p className="text-lg">جاري معالجة التبادل...</p>
                  <p className="text-sm text-purple-200 mt-2">سيتم تحديث البطاقات قريباً</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Exchange Modal */}
      {showExchangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-blue-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-center text-white">هات و خد - تبادل البطاقات</h2>
              <p className="text-blue-200 text-center">
                بدأ بواسطة: {exchangeInitiatorPlayer?.name || 'لاعب'}
              </p>
            </div>

            {exchangePhase === 'waiting' && exchangeWaitingWithCards && (
              <div className="text-center">
                <div className="text-yellow-300 text-xl mb-4">
                  ⏳ بانتظار {exchangeInitiatorPlayer?.name || 'اللاعب'} لاختيار بطاقته...
                </div>
                <div className="bg-blue-700 rounded-lg p-4 mb-4">
                  <p className="text-lg">اللاعب الذي بدأ التبادل يحتاج لاختيار بطاقة من يده أو دوائره أولاً</p>
                  <p className="text-sm text-blue-200 mt-2">يمكنك رؤية بطاقاتك لكن لا يمكنك الاختيار حتى يختار اللاعب الآخر</p>
                </div>

                {/* Show player's cards (non-selectable) */}
                <div className="bg-blue-700 rounded-lg p-4 mt-4">
                  <h3 className="text-lg font-semibold mb-4 text-center">بطاقاتي (غير قابلة للاختيار)</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                    {allExchangeCards.length === 0 ? (
                      <div className="text-center text-gray-400 p-4">
                        لا توجد بطاقات متاحة
                      </div>
                    ) : (
                      allExchangeCards.map(card => (
                        <div key={card.id}>
                          {renderExchangeCard(card, null, false, false, true)}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {exchangePhase === 'initiator_choose' && currentPlayer.id === exchangeInitiator && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-yellow-300 text-xl mb-2">📝 اختر بطاقة للتبادل</div>
                  <p className="text-blue-200">اختر بطاقة من يدك أو دوائرك لتبادلها مع لاعب آخر</p>
                  <p className="text-green-300 text-sm mt-1">⭕ البطاقات الخضراء موجودة في دوائرك</p>
                  <p className="text-yellow-300 text-sm mt-1">📊 البطاقات مرتبة حسب ترتيبها الأصلي في يدك</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 text-center">بطاقاتي (اليد والدوائر) بالترتيب الأصلي</h3>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                      {exchangePlayerCards.length === 0 ? (
                        <div className="text-center text-gray-400 p-4">
                          لا توجد بطاقات متاحة للتبادل
                        </div>
                      ) : (
                        exchangePlayerCards.map(card => (
                          <div 
                            key={card.id} 
                            className="cursor-pointer transform hover:scale-105 transition-transform"
                            onClick={() => handleInitiatorChooseCard(card)}
                          >
                            {renderExchangeCard(card, null, exchangeSelectedCard?.id === card.id, true)}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 text-center">تعليمات</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-600 p-3 rounded-lg">
                        <h4 className="font-semibold text-yellow-300">📝 الخطوات:</h4>
                        <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
                          <li>اختر بطاقة من يدك أو دوائرك للتبادل</li>
                          <li>سيتم عرض البطاقة المختارة للاعبين الآخرين</li>
                          <li>يمكن لأي لاعب آخر اختيار بطاقة للتبادل معك</li>
                        </ol>
                      </div>

                      <div className="bg-yellow-900 bg-opacity-30 p-3 rounded-lg">
                        <h4 className="font-semibold text-yellow-300">⚠️ ملاحظات:</h4>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                          <li>يمكنك تبادل البطاقات من يدك أو دوائرك</li>
                          <li>البطاقات مرتبة حسب ترتيبها الأصلي في يدك</li>
                          <li>اللاعب الآخر سيختار البطاقة التي يعطيك إياها</li>
                          <li>لا يمكنك إلغاء التبادل بعد اختيار البطاقة</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  {/* <button
                    onClick={handleCancelExchange}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 mx-auto"
                  >
                    <FaTimes /> إلغاء التبادل
                  </button> */}
                </div>
              </div>
            )}

            {exchangePhase === 'waiting_responder' && currentPlayer.id === exchangeInitiator && (
              <div className="text-center">
                <div className="text-yellow-300 text-xl mb-4">
                  ✅ لقد اخترت بطاقتك
                </div>
                {exchangeSelectedCard && (
                  <div className="bg-green-600 rounded-lg p-4 mb-4 max-w-md mx-auto">
                    <div className="font-bold text-lg">البطاقة المختارة:</div>
                    <div className="text-xl font-bold mt-2">{exchangeSelectedCard.name}</div>
                    <div className="text-sm opacity-75">
                      {exchangeSelectedCard.type === 'actor' ? 'ممثل' : 
                       exchangeSelectedCard.type === 'movie' ? 'فيلم' : 
                       exchangeSelectedCard.type === 'action' ? 'إجراء' : 'مخرج'}
                    </div>
                    {exchangeSelectedCard.source === 'circle' && (
                      <div className="text-xs text-yellow-300 mt-1">⭕ كانت في دائرة</div>
                    )}
                  </div>
                )}
                <div className="bg-blue-700 rounded-lg p-4">
                  <p className="text-lg">⏳ بانتظار اللاعبين الآخرين لاختيار بطاقة للتبادل...</p>
                  <p className="text-sm text-blue-200 mt-2">أول لاعب يختار بطاقة سيكون شريكك في التبادل</p>
                </div>
              </div>
            )}

            {exchangePhase === 'responder_choose' && currentPlayer.id !== exchangeInitiator && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-yellow-300 text-xl mb-2">🔄 تبادل البطاقات</div>
                  {/* <p className="text-blue-200">
                    {exchangeInitiatorPlayer?.name || 'اللاعب'} يريد تبادل بطاقته:
                  </p> */}
                  {/* {exchangeSelectedCard && (
                    <div className="bg-blue-600 rounded-lg p-3 mt-2 max-w-md mx-auto">
                      <div className="font-bold text-lg">{exchangeSelectedCard.name}</div>
                      <div className="text-sm opacity-75">
                        {exchangeSelectedCard.type === 'actor' ? 'ممثل' : 
                         exchangeSelectedCard.type === 'movie' ? 'فيلم' : 
                         exchangeSelectedCard.type === 'action' ? 'إجراء' : 'مخرج'}
                      </div>
                      {exchangeSelectedCard.source === 'circle' && (
                        <div className="text-xs text-yellow-300 mt-1">⭕ كانت في دائرة</div>
                      )}
                    </div>
                  )} */}
                  <p className="text-blue-200 mt-4">اختر بطاقة من يدك أو دوائرك للتبادل:</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 text-center">اختر بطاقة للتبادل</h3>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                      {allExchangeCards.length === 0 ? (
                        <div className="text-center text-gray-400 p-4">
                          لا توجد بطاقات متاحة للتبادل
                        </div>
                      ) : (
                        allExchangeCards.map(card => (
                          <div 
                            key={card.id} 
                            className="cursor-pointer transform hover:scale-105 transition-transform"
                            onClick={() => handleResponderChooseCard(card)}
                          >
                            {renderExchangeCard(card, null, exchangeTargetCard?.id === card.id)}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-700 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4 text-center">تفاصيل التبادل</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-600 p-3 rounded-lg">
                        <h4 className="font-semibold text-yellow-300">🔄 ماذا سيحدث:</h4>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                          <li>ستعطي البطاقة المختارة لـ {exchangeInitiatorPlayer?.name || 'اللاعب'}</li>
                          <li>ستحصل على بطاقة {exchangeSelectedCard?.name} منه</li>
                          <li>التبادل نهائي ولا يمكن التراجع عنه</li>
                        </ul>
                      </div>

                      <div className="bg-green-900 bg-opacity-30 p-3 rounded-lg">
                        <h4 className="font-semibold text-green-300">💡 نصيحة:</h4>
                        <p className="text-sm mt-2">
                          اختر بطاقة لا تحتاجها أو تريد استبدالها ببطاقة {exchangeSelectedCard?.type === 'actor' ? 'ممثل' : 'فيلم'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {exchangePhase === 'completed' && (
              <div className="text-center">
                <div className="text-green-300 text-xl mb-4">
                  ✅ تم إكمال التبادل
                </div>
                <div className="bg-blue-700 rounded-lg p-4">
                  <p className="text-lg">جاري معالجة التبادل...</p>
                  <p className="text-sm text-blue-200 mt-2">سيتم تحديث البطاقات قريباً</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shake Square Modal */}
      {showShakeSquare && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-indigo-800 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-center">نفض نفسك</h2>
              <p className="text-indigo-200 text-center">
                بدأ بواسطة: {shakeInitiatorPlayer?.name || 'لاعب'}
              </p>
              <p className="text-yellow-300 text-center mt-2">
                ⚠️ يمكن للاعب واحد فقط وضع بطاقاته والحصول على 5 بطاقات جديدة
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Section: My Cards and Shake Button */}
              <div className="bg-indigo-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-center">بطاقاتي</h3>
                
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">بطاقاتك الحالية ({myHand.length}):</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {myHand.map(card => (
                      <div key={card.id}>
                        {renderShakeCard(card)}
                      </div>
                    ))}
                  </div>
                </div>

                {canPlaceCardsInShake && (
                  <button
                    onClick={handlePlaceAllCardsInShake}
                    className="w-full py-3 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white"
                  >
                    🎯 وضع كل البطاقات ({myHand.length}) وسحب 5 بطاقات جديدة
                  </button>
                )}

                {shakePlacedCards[currentPlayer.id] && (
                  <div className="text-center text-green-400 font-bold mt-2">
                    ✓ لقد وضعت كل بطاقاتك
                  </div>
                )}

                {anyPlayerPlacedCards && !shakePlacedCards[currentPlayer.id] && currentPlayer.id !== shakeInitiator && (
                  <div className="text-center text-yellow-400 font-bold mt-2">
                    ⚠️ تم وضع البطاقات مسبقاً من قبل لاعب آخر
                  </div>
                )}

                {currentPlayer.id === shakeInitiator && (
                  <div className="text-center text-gray-400 font-bold mt-2">
                    ❌ لا يمكنك وضع بطاقاتك (أنت من بدأ النفض)
                  </div>
                )}
              </div>

              {/* Right Section: Action Card and Players */}
              <div className="space-y-6">
                {/* Action Card */}
                <div className="bg-indigo-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-center">بطاقة الإجراء</h3>
                  {shakeActionCard && (
                    <div className="text-center">
                      <div className="p-4 rounded-lg mb-4 bg-red-600">
                        <div className="font-bold text-xl">نفض نفسك</div>
                        <div className="text-sm opacity-75 mt-2">
                          يمكن للاعب واحد فقط وضع كل بطاقاته والحصول على 5 بطاقات جديدة
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Players List */}
                <div className="bg-indigo-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4 text-center">اللاعبون</h3>
                  <div className="space-y-2">
                    {players.map(player => (
                      <div 
                        key={player.id}
                        className={`p-3 rounded-lg text-center ${
                          shakePlacedCards[player.id] ? 'bg-green-600' : 
                          player.id === shakeInitiator ? 'bg-gray-600' :
                          anyPlayerPlacedCards ? 'bg-yellow-600' : 'bg-indigo-600'
                        }`}
                      >
                        <div className="font-bold">{player.name}</div>
                        <div className="text-sm opacity-75">
                          {shakePlacedCards[player.id] 
                            ? `✓ وضع ${shakePlacedCards[player.id].count} بطاقة` 
                            : player.id === shakeInitiator
                            ? '❌ لا يمكنه وضع بطاقات'
                            : anyPlayerPlacedCards
                            ? '❌ لم يضع بطاقات (مقفل)'
                            : 'يمكنه وضع بطاقات'
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Shake Button (only for initiator) */}
            {currentPlayer.id === shakeInitiator && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleCompleteShake}
                  disabled={!shakeCanComplete}
                  className={`px-6 py-3 rounded-lg font-bold ${
                    shakeCanComplete 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-600 cursor-not-allowed text-gray-300'
                  }`}
                >
                  {shakeCanComplete ? 'إتمام العملية' : '⏳ بانتظار وضع البطاقات...'}
                </button>
                {!shakeCanComplete && (
                  <p className="text-yellow-300 text-sm mt-2">
                    يجب أن يضع أحد اللاعبين بطاقاته أولاً
                  </p>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="mt-6 bg-indigo-900 rounded-lg p-4">
              <h4 className="font-semibold mb-2">تعليمات:</h4>
              <p className="text-sm">
                يمكن للاعب واحد فقط وضع كل بطاقاته على الطاولة والحصول على 5 بطاقات جديدة من المجموعة.
              </p>
              <p className="text-sm mt-2 text-yellow-300">
                ⚠️ يمكن للاعب واحد فقط وضع بطاقاته في كل نفض.
              </p>
              <p className="text-sm mt-2 text-yellow-300">
                ⚠️ اللاعب الذي بدأ النفض لا يمكنه وضع بطاقاته.
              </p>
              <p className="text-sm mt-2 text-green-300">
                اللاعب الذي بدأ النفض يمكنه إنهاء النفض بعد وضع البطاقات.
              </p>
              <p className="text-sm mt-2 text-yellow-300 font-bold">
                ⚠️ لن ينتقل الدور للاعب التالي حتى يتم إكمال النفض
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {selectedCardForView && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold text-gray-800">{selectedCardForView.name}</h2>
              <button
                onClick={handleClosePhotoViewer}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                <FaTimesCircle />
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center">
              {selectedCardForView.image && (
                <div className="flex justify-center">
                  {selectedCardForView.type === 'movie' ? (
                    <div className="w-80 h-80 rounded-xl overflow-hidden  shadow-2xl">
                      <img 
                        src={`${process.env.PUBLIC_URL}${selectedCardForView.image}`}
                        alt={selectedCardForView.name}
                        className="w-full h-full object-fill"
                      />
                    </div>
                  ) : (
                    <img 
                      src={`${process.env.PUBLIC_URL}${selectedCardForView.image}`}
                      alt={selectedCardForView.name}
                      className="max-w-full max-h-[45vh] object-contain rounded-lg shadow-lg"
                    />
                  )}
                </div>
              )}
              
              <div className="mt-4 text-center text-gray-700">
                <p className="text-lg font-semibold">{selectedCardForView.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedCardForView.type === 'actor' ? 'ممثل' : 
                   selectedCardForView.type === 'movie' ? 'فيلم' : 
                   selectedCardForView.type === 'action' ? 'بطاقة إجراء' : 'مخرج'}
                  {selectedCardForView.type === 'action' && selectedCardForView.subtype && (
                    <span> - {
                      selectedCardForView.subtype === 'joker' ? 'جوكر' : 
                      selectedCardForView.subtype === 'skip' ? 'تخطي' :
                      selectedCardForView.subtype === 'shake' ? 'نفض نفسك' : 
                      selectedCardForView.subtype === 'exchange' ? 'هات و خد' : 
                      selectedCardForView.subtype === 'collective_exchange' ? 'كل واحد يطلع باللي معاه' : 'إجراء'
                    }</span>
                  )}
                </p>
                {selectedCardForView.type === 'movie' && (
                  <p className="text-xs text-gray-500 mt-2">
                    🎬 عرض دائري: يمكنك رؤية الفيلم بشكل دائري
                  </p>
                )}
                {selectedCardForView.type !== 'movie' && (
                  <p className="text-xs text-gray-500 mt-2">
                    {selectedCardForView.type === 'actor' ? '👨‍🎤 عرض مستطيل: يمكنك رؤية الممثل بوضوح' : '🃏 بطاقة خاصة'}
                  </p>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t text-center">
              <button
                onClick={handleClosePhotoViewer}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Modal */}
      {gameState.challengeInProgress && gameState.declaredCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-indigo-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center">تحدي!</h2>
            <p className="text-lg mb-4 text-center">
              {gameState.declaredCategory.playerName} يدعي أنه أكمل الفئة: 
              <span className="font-bold text-yellow-400"> الفئة {gameState.declaredCategory.category?.id}</span>
            </p>
            
            <div className="bg-indigo-700 p-4 rounded-lg mb-4">
              <h3 className="font-bold mb-2">البطاقات المقدمة:</h3>
              <div className="space-y-2">
                {gameState.declaredCategory.cards.map((card, index) => (
                  <div key={index} className="bg-white text-gray-800 p-2 rounded flex items-center gap-3">
                    {renderCardImage(card, "w-16 h-16")}
                    <div>
                      <div className="font-bold">{card.name}</div>
                      <div className="text-sm text-gray-600">
                        {card.type === 'actor' ? 'ممثل' : card.type === 'movie' ? 'فيلم' : card.type === 'action' ? 'إجراء' : 'مخرج'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ---- VOTING STATUS ---- */}
            <div className="bg-indigo-900 rounded-lg p-3 mb-4 text-center">
              <p className="text-sm text-indigo-200">
                ✅ قبول: {Object.values(gameState.challengeResponses).filter(v => v === true).length}
                &nbsp;&nbsp;|&nbsp;&nbsp;
                ❌ رفض: {Object.values(gameState.challengeResponses).filter(v => v === false).length}
              </p>
            </div>

            {/* Buttons / waiting messages */}
            {(() => {
              const isDeclarer = currentPlayer.id === gameState.declaredCategory.playerId;
              const alreadyVoted = gameState.challengeRespondedPlayers.includes(currentPlayer.id);

              if (isAdmin) {
                return <p className="text-center text-yellow-300">المشرف لا يشارك في التصويت</p>;
              }

              if (isDeclarer) {
                return <p className="text-center text-indigo-200">بانتظار رد اللاعبين الآخرين...</p>;
              }

              if (alreadyVoted) {
                return <p className="text-center text-green-300">تم تسجيل تصويتك – بانتظار بقية اللاعبين</p>;
              }

              return (
                <div className="flex gap-4">
                  <button
                    onClick={() => socket.emit('card_game_challenge_response', { 
                      roomCode, 
                      playerId: currentPlayer.id, 
                      accept: true, 
                      declaredPlayerId: gameState.declaredCategory.playerId 
                    })}
                    className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    <FaCheck /> قبول
                  </button>
                  <button
                    onClick={() => socket.emit('card_game_challenge_response', { 
                      roomCode, 
                      playerId: currentPlayer.id, 
                      accept: false, 
                      declaredPlayerId: gameState.declaredCategory.playerId 
                    })}
                    className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-lg flex items-center justify-center gap-2"
                  >
                    <FaTimes /> رفض
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Circle Placement Modal */}
      {selectedCardForCircle && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-indigo-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-center">اختر الدائرة لوضع البطاقة</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[0, 1, 2, 3].map(circleIndex => (
                <button
                  key={circleIndex}
                  onClick={() => handlePlaceInCircle(circleIndex)}
                  className={`p-4 rounded-lg text-center ${
                    myCircles[circleIndex] 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  disabled={myCircles[circleIndex] !== null}
                >
                  <div className="font-bold">الدائرة {circleIndex + 1}</div>
                  {myCircles[circleIndex] && (
                    <div className="text-xs mt-1">محجوزة</div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="text-center mb-4">
              <p className="text-indigo-200">البطاقة المختارة:</p>
              <p className="font-bold text-lg">{selectedCardForCircle.name}</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCancelCirclePlacement}
                className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">لعبة البطاقات - جاهزة! ✅</h2>
          <div className={`text-lg font-bold ${isMyTurn ? 'text-green-400 animate-pulse' : 'text-indigo-200'}`}>
            🎯 الدور: {currentTurnPlayer ? currentTurnPlayer.name : 'جاري التحديد...'} {isMyTurn ? '(أنت)' : ''}
          </div>
          <p className="text-sm text-yellow-300">مستواك الحالي: {myLevel} / 5</p>
          {isMyTurn && <p className="text-sm text-yellow-300 mt-1">{!gameState.playerHasDrawn?.[currentPlayer.id] ? 'يجب عليك سحب بطاقة أولاً' : 'يجب عليك التخلص من بطاقة الآن'}</p>}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {isAdmin ? (
            <>
              <button onClick={handleExitToCategories} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 flex items-center gap-2"><FaHome /> العودة للفئات</button>
              <button onClick={handleResetGame} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 flex items-center gap-2"><FaRedo /> إعادة تعيين اللعبة</button>
              <button onClick={() => setShowRules(true)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center gap-2"><FaBook /> القواعد</button>
            </>
          ) : (
            /* NEW BUTTON for non‑admin players to return to buzzer */
            <button onClick={() => { if (onExit) onExit(); }} className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 flex items-center gap-2">
              <FaArrowLeft /> العودة للبازر
            </button>
          )}
          <button onClick={handleRollDice} className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2"><FaDice /> رمي النرد</button>
          <button onClick={handleDrawCard} disabled={!isMyTurn || gameState.playerHasDrawn?.[currentPlayer.id] || gameState.drawPile.length === 0} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${isMyTurn && !gameState.playerHasDrawn?.[currentPlayer.id] && gameState.drawPile.length > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 cursor-not-allowed'}`}><FaHandPaper /> سحب بطاقة ({gameState.drawPile.length})</button>
          <button onClick={() => socket.emit('card_game_shuffle', { roomCode })} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2"><FaRandom /> خلط البطاقات</button>
        </div>
      </div>

      {/* Categories List */}
      <div className="mb-6">
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="w-full bg-indigo-700 hover:bg-indigo-600 py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <FaList />
          {showCategories ? 'إخفاء الفئات' : 'عرض الفئات'}
          {showCategories ? <FaAngleUp /> : <FaAngleDown />}
        </button>

        {showCategories && (
          <div className="mt-4 bg-indigo-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">فئات اللعبة</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
              {gameState.categories && gameState.categories.map(category => (
                <div 
                  key={category.id}
                  className={`p-3 rounded-lg border-2 text-center ${
                    myCategory?.id === category.id 
                      ? 'bg-green-600 border-green-400' 
                      : 'bg-indigo-600 border-indigo-500'
                  }`}
                >
                  <h4 className="font-bold text-lg">الفئة {category.id}</h4>
                  <p className="text-sm text-indigo-200 mt-1">{category.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {myCategory && (
        <div className="bg-green-600 rounded-lg p-4 mb-6 text-center">
          <h3 className="text-xl font-bold">فئتك الحالية</h3>
          <p className="text-2xl font-bold mt-2">الفئة {myCategory.id}</p>
          <p className="text-sm opacity-90 mt-1">{myCategory.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player Hand */}
        <div className="bg-indigo-700 rounded-xl p-4">
          <h3 className="text-lg font-semibold mb-4">بطاقاتي ({myHand.length})</h3>
          <div className="space-y-3 max-h-[540px] overflow-y-auto">

            {myHand.map((card, index) => {
              const gradient = getCardGradient(card);
              const isAction = card.type === 'action';

              const cardContent = (
                <div
                    className={`p-4 text-white font-semibold rounded-lg flex flex-col bg-gradient-to-r ${gradient} ${isAction ? 'animate-shimmer bg-[length:200%_200%]' : ''}`}                  
                    draggable={
                    !isMobile && isMyTurn && buttonsEnabled &&
                    (card.type !== 'action' || ['joker','skip','shake','exchange','collective_exchange'].includes(card.subtype))
                  }
                  onDragStart={(e) => handleDragStart(e, card)}
                >
                  {/* Top section: Image and card info */}
                  <div className="flex items-center gap-4 mb-3">
                    {renderCardImage(card, "w-24 h-24")}
                    <div className="flex-1">
                      <div className="font-bold text-lg text-center">{card.name}</div>
                      <div className="text-base opacity-90 text-center mt-1">
                        {card.type === 'action' ? `إجراء: ${
                          card.subtype === 'joker' ? 'جوكر' :
                          card.subtype === 'skip' ? 'تخطي' :
                          card.subtype === 'shake' ? 'نفض نفسك' :
                          card.subtype === 'exchange' ? 'هات و خد' :
                          card.subtype === 'collective_exchange' ? 'كل واحد يطلع باللي معاه' : card.subtype
                        }` : card.type === 'actor' ? 'ممثل' : card.type === 'movie' ? 'فيلم' : 'مخرج'}
                      </div>
                      {card.type === 'action' && card.subtype === 'joker' && (
                        <div className="text-sm opacity-75 mt-1 text-center">يمكن استخدامها كأي بطاقة</div>
                      )}
                      {card.type === 'action' && card.subtype === 'skip' && (
                        <div className="text-sm opacity-75 mt-1 text-center">تخطي اللاعب التالي تلقائياً</div>
                      )}
                      {card.type === 'action' && card.subtype === 'shake' && (
                        <div className="text-sm opacity-75 mt-1 text-center">يمكن للجميع وضع كل بطاقاتهم</div>
                      )}
                      {card.type === 'action' && card.subtype === 'exchange' && (
                        <div className="text-sm opacity-75 mt-1 text-center">تبادل بطاقة مع لاعب آخر</div>
                      )}
                      {card.type === 'action' && card.subtype === 'collective_exchange' && (
                        <div className="text-sm opacity-75 mt-1 text-center">تبادل جماعي مع لاعب آخر</div>
                      )}
                      {card.type === 'movie' && (
                        <div className="text-sm opacity-75 mt-1 text-center">🎬 انقر للمشاهدة</div>
                      )}
                    </div>
                  </div>

                  {/* Bottom section: Buttons */}
                  <div className="flex gap-2 justify-center">
                    {(isMobile || true) && (card.type !== 'action' || card.subtype === 'joker') && (
                      <button
                        onClick={() => handleSelectCardForCircle(card)}
                        disabled={!isMyTurn || !buttonsEnabled}
                        className={`px-4 py-2 rounded text-lg font-semibold flex items-center gap-1 flex-1 justify-center ${
                          isMyTurn && buttonsEnabled ? 'bg-gradient-to-r shadow-md from-[#6d6027] to-[#ae8902] text-white hover:text-black' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        وضع في الدائرة
                      </button>
                    )}

                    {card.type === 'action' && card.subtype === 'joker' ? (
                      <button
                        onClick={() => handlePlayToTable(card.id)}
                        disabled={!isMyTurn || !buttonsEnabled}
                        className={`px-4 py-2 text-lg rounded flex-1 justify-center ${
                          isMyTurn && buttonsEnabled ? 'bg-gradient-to-r shadow-md from-[#799f0c] to-[#acbb78] text-white hover:text-black font-semibold' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        لعب للطاولة
                      </button>
                    ) : card.type === 'action' && card.subtype === 'skip' ? (
                      <button
                        onClick={() => handleUseSkipCard(card.id)}
                        disabled={!isMyTurn || !buttonsEnabled}
                        className={`px-4 py-2 rounded flex w-full shadow-md gap-x-4 text-lg h-[50px] font-bold items-center justify-center ${
                          isMyTurn && buttonsEnabled ? 'bg-gradient-to-r from-[#8B0000] to-[#FF0000] hover:text-black' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <FaUserSlash /> تخطي التالي
                      </button>
                    ) : card.type === 'action' && card.subtype === 'shake' ? (
                      <button
                        onClick={() => handleUseShakeCard(card.id)}
                        disabled={!isMyTurn || !buttonsEnabled}
                        className={`px-4 py-2 rounded flex w-full shadow-md gap-x-4 text-lg h-[50px] font-bold items-center justify-center ${
                          isMyTurn && buttonsEnabled ? 'bg-gradient-to-r from-[#8B0000] to-[#FF0000] hover:text-black' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <FaUser /> نفض نفسك
                      </button>
                    ) : card.type === 'action' && card.subtype === 'exchange' ? (
                      <button
                        onClick={() => handleUseExchangeCard(card.id)}
                        disabled={!isMyTurn || !buttonsEnabled}
                        className={`px-4 py-2 rounded flex w-full shadow-md gap-x-4 text-lg h-[50px] font-bold items-center justify-center ${
                          isMyTurn && buttonsEnabled ? 'bg-gradient-to-r from-[#8B4513] to-[#D2691E] hover:text-black' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <FaExchangeAlt /> هات و خد
                      </button>
                    ) : card.type === 'action' && card.subtype === 'collective_exchange' ? (
                      <button
                        onClick={() => handleUseCollectiveExchangeCard(card.id)}
                        disabled={!isMyTurn || !buttonsEnabled}
                        className={`px-4 py-2 rounded flex w-full shadow-md gap-x-4 text-lg h-[50px] font-bold items-center justify-center ${
                          isMyTurn && buttonsEnabled ? 'bg-gradient-to-r from-[#6b21a8] to-[#a855f7] hover:text-black' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <FaUsers /> كل واحد يطلع
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePlayToTable(card.id)}
                        disabled={!isMyTurn || !buttonsEnabled}
                        className={`px-4 py-2 text-lg rounded flex-1 justify-center ${
                          isMyTurn && buttonsEnabled ? 'bg-gradient-to-r from-[#799f0c] to-[#acbb78] text-white hover:text-black font-semibold' : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        لعب للطاولة
                      </button>
                    )}
                  </div>
                </div>
              );

              return isAction ? (
                <ActionCardWrapper key={card.id} borderGradient={gradient}>
                  {cardContent}
                </ActionCardWrapper>
              ) : (
                <div key={card.id} className="rounded-lg overflow-hidden">{cardContent}</div>
              );
            })}

          </div>
        </div>

        {/* Player Circles & Progress Track */}
        <div className="space-y-6">
          {/* Progress Track with Circles */}
          <div className="bg-indigo-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">مسار التقدم - المستوى {myLevel}</h3>
            
            {/* Progress Track */}
            <div className="relative mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">المستوى 1</span>
                <span className="text-sm">المستوى 2</span>
                <span className="text-sm">المستوى 3</span>
                <span className="text-sm">المستوى 4</span>
                <span className="text-sm text-yellow-300 font-bold">🎊 الفوز 🎊</span>
              </div>
              <div className="flex justify-between items-center relative">
                {/* Progress Line */}
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-600 z-0"></div>
                <div 
                  className="absolute top-4 left-0 h-1 bg-green-500 z-0 transition-all duration-500"
                  style={{ width: `${(playerToken / 4) * 100}%` }}
                ></div>
                
                {/* Circles */}
                {[0, 1, 2, 3, 4].map(level => (
                  <div 
                    key={level}
                    className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 ${
                      level <= playerToken ? 
                        (level === 4 ? 'bg-yellow-500' : 'bg-green-500') : 
                        'bg-gray-600'
                    }`}
                  >
                    {level === 4 ? (
                      <FaCrown className="text-black text-lg" />
                    ) : (
                      <span className="text-white font-bold">{level + 1}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Level Progress Info */}
            <div className="bg-indigo-600 rounded-lg p-3 mb-4 text-center">
              {myLevel < 5 ? (
                <p className="text-sm">
                  اكمل <span className="text-yellow-300 font-bold">{3 - filledCircles}</span> بطاقات أخرى للفئة للوصول للمستوى {myLevel + 1}
                  {myLevel === 4 && (
                    <span className="block text-yellow-300 font-bold mt-1">🎯 المستوى القادم: الفوز! 🎯</span>
                  )}
                </p>
              ) : (
                <p className="text-green-300 font-bold text-lg">🎉 لقد فزت باللعبة! 🎉</p>
              )}
            </div>

            {/* Card Circles for Category */}
            <h4 className="text-lg font-semibold mb-3">دوائري للفئة ({filledCircles}/3)</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[0, 1, 2, 3].map(circleIndex => (
                <div 
                  key={circleIndex}
                  className={`border-2 border-dashed rounded-lg p-3 text-center min-h-40 flex flex-col items-center justify-center ${
                    myCircles[circleIndex] ? 'border-green-500 bg-green-900 bg-opacity-20' : 'border-gray-500'
                  }`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnCircle(e, circleIndex)}
                >
                  {myCircles[circleIndex] ? (
                    <div className="text-center">
                      {renderCircleImage(myCircles[circleIndex], "w-24 h-24")}
                      <div className="font-bold text-white text-base">{myCircles[circleIndex].name}</div>
                      <div className="text-sm text-gray-300">
                        {myCircles[circleIndex].type === 'actor' ? 'ممثل' : 
                         myCircles[circleIndex].type === 'movie' ? 'فيلم' : 
                         myCircles[circleIndex].type === 'action' ? 'جوكر' : 'مخرج'}
                      </div>
                      <button
                        onClick={() => socket.emit('card_game_remove_from_circle', { 
                          roomCode, 
                          playerId: currentPlayer.id, 
                          circleIndex 
                        })}
                        disabled={!isMyTurn || !buttonsEnabled}
                        className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        إزالة
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      {isMobile ? 'انقر على بطاقة ثم اختر هذه الدائرة' : 'اسحب بطاقة هنا'}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {filledCircles >= 3 && isMyTurn && buttonsEnabled && (
              <button
                onClick={() => socket.emit('card_game_declare', { roomCode, playerId: currentPlayer.id })}
                className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
              >
                <FaTrophy /> إعلان اكتمال الفئة!
              </button>
            )}
          </div>
        </div>

        {/* Table Cards & Players */}
        <div className="space-y-6">
          {/* Table Cards - Stacked Display */}
          <div className="bg-indigo-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">طاولة اللعب ({gameState.tableCards.length})</h3>
            
            {/* Stacked Cards Display */}
            <div className="relative h-40 mb-4 flex items-center justify-center overflow-hidden">
              {gameState.tableCards.length === 0 ? (
                <div className="text-gray-400 text-center">
                  لا توجد بطاقات على الطاولة
                </div>
              ) : (
                <div className="relative" style={{ maxWidth: '120px' }}>
                  {/* Background stacked cards */}
                  {gameState.tableCards.slice(-6, -1).map((card, index) => (
                    <div 
                      key={card.id}
                      className="absolute bg-gray-300 border-2 border-gray-400 rounded-lg w-16 h-24 transform -rotate-6"
                      style={{ 
                        left: `${Math.min(index * 3, 12)}px`,
                        top: `${Math.min(index * 3, 12)}px`,
                        zIndex: index 
                      }}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                        <div className="text-gray-500 text-xs">بطاقة مكدسة</div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Show count if there are more than 6 cards */}
                  {gameState.tableCards.length > 6 && (
                    <div 
                      className="absolute bg-gray-400 border-2 border-gray-500 rounded-lg w-16 h-24 transform -rotate-6 flex items-center justify-center"
                      style={{ 
                        left: `${Math.min(5 * 3, 15)}px`,
                        top: `${Math.min(5 * 3, 15)}px`,
                        zIndex: 5 
                      }}
                    >
                      <div className="text-white text-xs font-bold text-center">
                        +{gameState.tableCards.length - 6}
                      </div>
                    </div>
                  )}
                  
                  {/* Top card (visible) – now with shimmer border */}
                  {topTableCard && (
                    (() => {
                      const gradient = getCardGradient(topTableCard);
                      const isAction = topTableCard.type === 'action';
                      const cardEl = (
                        <div
                          className={`relative text-white rounded-lg w-24 h-32 shadow-lg transform hover:scale-105 transition-transform z-40 bg-gradient-to-r ${gradient} ${isAction ? 'animate-shimmer bg-[length:200%_200%]' : ''}`}
                          style={{ 
                            left: `${Math.min((Math.min(gameState.tableCards.length - 1, 5)) * 3, 15)}px`, 
                            top: `${Math.min((Math.min(gameState.tableCards.length - 1, 5)) * 3, 15)}px` 
                          }}
                        >
                          <div className="w-full h-full rounded-lg p-2">
                            {renderTableCardImage(topTableCard, "w-full h-20")}
                            <div className="text-center">
                              <h3 className="text-sm font-bold text-white leading-tight">
                                {topTableCard.name}
                              </h3>
                              <span className="text-xs text-white opacity-90">
                                {topTableCard.type === 'action' ? `إجراء: ${
                                  topTableCard.subtype === 'joker' ? 'جوكر' :
                                  topTableCard.subtype === 'skip' ? 'تخطي' :
                                  topTableCard.subtype === 'shake' ? 'نفض نفسك' :
                                  topTableCard.subtype === 'exchange' ? 'هات و خد' :
                                  topTableCard.subtype === 'collective_exchange' ? 'كل واحد يطلع باللي معاه' : topTableCard.subtype
                                }` : 
                                 topTableCard.type === 'actor' ? 'ممثل' : 
                                 topTableCard.type === 'movie' ? 'فيلم' : 'مخرج'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                      return isAction ? <ActionCardWrapper borderGradient={gradient}>{cardEl}</ActionCardWrapper> : cardEl;           
                    })()
                  )}
                </div>
              )}
            </div>

            {/* Take from table button */}
            {topTableCard && (
              <button
                onClick={handleTakeFromTable}
                disabled={!isMyTurn || gameState.playerHasDrawn?.[currentPlayer.id] || !canTakeCardFromTable(topTableCard)}
                className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${
                  isMyTurn && !gameState.playerHasDrawn?.[currentPlayer.id] && canTakeCardFromTable(topTableCard) ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <FaTable /> أخذ البطاقة العلوية
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardGame;