import React, { useState, useEffect } from 'react';
import { FaDice, FaRandom, FaHandPaper, FaTable, FaCheck, FaTimes, FaTrophy, FaPlay, FaRedo, FaList, FaAngleDown, FaAngleUp, FaStar, FaCircle, FaHome, FaBook, FaTimesCircle, FaUserSlash, FaExpand, FaCrown, FaExchangeAlt, FaUsers, FaTrash, FaUndo, FaUser } from 'react-icons/fa';

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
  
  // Shake card states - IMPROVED
  const [showShakeSquare, setShowShakeSquare] = useState(false);
  const [shakeInitiator, setShakeInitiator] = useState(null);
  const [shakeActionCard, setShakeActionCard] = useState(null);
  const [shakePlacedCards, setShakePlacedCards] = useState({});

  // Dice category banner state
  const [showDiceCategoryBanner, setShowDiceCategoryBanner] = useState(false);
  const [diceCategoryData, setDiceCategoryData] = useState(null);

  // Track if any player has placed cards in shake (global state)
  const [anyPlayerPlacedCards, setAnyPlayerPlacedCards] = useState(false);

  // Check if card can be taken from table (action cards cannot be taken)
  const canTakeCardFromTable = (card) => {
    if (!card) return false;
    if (card.type === 'action') {
      return false;
    }
    return true;
  };

  // Check if buttons should be enabled
  const areButtonsEnabled = () => {
    if (!gameState || !currentPlayer) return false;
    return gameState.playerHasDrawn?.[currentPlayer.id] === true;
  };

  // Handle card image click to open photo viewer
  const handleCardImageClick = (card) => {
    setSelectedCardForView(card);
  };

  // Close photo viewer
  const handleClosePhotoViewer = () => {
    setSelectedCardForView(null);
  };

  // Reset game handler for any player - FIXED: Properly reset winner state
  const handleResetGameAnyPlayer = () => {
    console.log('🔄 Any player requesting game reset');
    setWinner(null); // Clear winner state immediately
    setShowShakeSquare(false);
    setAnyPlayerPlacedCards(false);
    socket.emit('card_game_reset_any_player', { roomCode });
  };

  // Open shake square for ALL players - IMPROVED
  const handleOpenShakeSquare = (data) => {
    console.log('🔄 Opening shake square:', data);
    setShowShakeSquare(true);
    setShakeInitiator(data.playerId);
    setShakeActionCard(data.actionCard);
    setShakePlacedCards({});
    setAnyPlayerPlacedCards(false); // Reset when new shake starts
  };

  // Place ALL cards in shake - FIXED: Only allow one player to click
  const handlePlaceAllCardsInShake = () => {
    if (anyPlayerPlacedCards) {
      console.log('❌ Button already clicked by another player');
      return;
    }
    
    // Immediately disable button for all players
    setAnyPlayerPlacedCards(true);
    
    socket.emit('card_game_shake_place_all', {
      roomCode,
      playerId: currentPlayer.id
    });
  };

  // Complete shake - IMPROVED
  const handleCompleteShake = () => {
    socket.emit('card_game_complete_shake', {
      roomCode,
      playerId: currentPlayer.id
    });
  };

  // Use shake card
  const handleUseShakeCard = (cardId) => {
    if (gameState.currentTurn === currentPlayer?.id && areButtonsEnabled()) {
      console.log('🔄 Using shake card:', cardId);
      socket.emit('card_game_use_shake', {
        roomCode,
        playerId: currentPlayer.id,
        cardId
      });
    }
  };

  // Use skip card
  const handleUseSkipCard = (cardId) => {
    if (gameState.currentTurn === currentPlayer?.id && areButtonsEnabled()) {
      socket.emit('card_game_use_skip', { 
        roomCode, 
        playerId: currentPlayer.id, 
        cardId 
      });
    }
  };

  // Render card image with rectangular shape for all cards in thumbnail
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

  // Render circle image with rectangular shape for all cards in thumbnail
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

  // Render table card image with rectangular shape for all cards
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

  // Render card for shake square - shows "Card" and card name below
  const renderShakeCard = (card, onClick = null, showRemove = false) => {
    return (
      <div className="relative">
        <div 
          className={`p-3 rounded-lg mb-2 transition-all cursor-pointer bg-indigo-600 hover:bg-indigo-500 flex flex-col items-center`}
          onClick={onClick}
        >
          <div className="font-bold text-center text-lg mb-2">Card</div>
          <div className="text-xs text-center opacity-75">
            {card.type === 'actor' ? 'ممثل' : 
             card.type === 'movie' ? 'فيلم' : 
             card.type === 'action' ? 'إجراء' : 'مخرج'}
          </div>
          <div className="text-sm font-semibold text-center mt-2 text-white">
            {card.name}
          </div>
        </div>
      </div>
    );
  };

  // Close dice category banner
  const handleCloseDiceCategoryBanner = () => {
    setShowDiceCategoryBanner(false);
    setDiceCategoryData(null);
  };

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Update player token when game state changes
  useEffect(() => {
    if (gameState && currentPlayer) {
      const playerLevel = gameState.playerLevels?.[currentPlayer.id] || 1;
      setPlayerToken(playerLevel - 1);
    }
  }, [gameState, currentPlayer]);

  // FIXED: Improved winner detection - listen for winner announcement from server
  useEffect(() => {
    if (gameState && players) {
      // Check for winner in game state
      if (gameState.winner) {
        const winnerPlayer = players.find(player => player.id === gameState.winner);
        if (winnerPlayer && (!winner || winner.id !== winnerPlayer.id)) {
          setWinner(winnerPlayer);
        }
      } else {
        // Also check if any player reached level 5
        const gameWinner = players.find(player => {
          const playerLevel = gameState.playerLevels?.[player.id] || 1;
          return playerLevel >= 5;
        });
        if (gameWinner && (!winner || winner.id !== gameWinner.id)) {
          setWinner(gameWinner);
        }
      }
    }
  }, [gameState, players, winner]);

  // Initialize game
  const initializeGame = () => {
    console.log('🎮 Initializing game...', { roomCode, currentPlayer: currentPlayer?.id });
    setError('');
    if (socket) {
      socket.emit('card_game_initialize', { roomCode });
    }
  };

  // Socket listeners - FIXED: Proper winner handling and reset
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
      
      setTimeout(() => {
        setShowDice(false);
      }, 3000);
    };

    const handleDiceCategory = (data) => {
      console.log('🎲 Dice category received:', data);
      setRolledCategory(data.category);
      setDiceCategoryData(data.category);
      setShowDiceCategoryBanner(true);
    };

    const handleGameExited = () => {
      if (onExit) {
        onExit();
      }
    };

    const handleGameReset = () => {
      console.log('🔄 Game reset received - clearing winner state for ALL players');
      setWinner(null); // Clear winner for ALL players when reset is received
      setShowShakeSquare(false);
      setShakePlacedCards({});
      setShowDiceCategoryBanner(false);
      setDiceCategoryData(null);
      setAnyPlayerPlacedCards(false);
    };

    // FIXED: Handle winner announcement properly
    const handleWinnerAnnounced = (data) => {
      console.log('🏆 Winner announced to all players:', data);
      const winnerPlayer = players.find(player => player.id === data.playerId);
      if (winnerPlayer) {
        setWinner(winnerPlayer);
      }
    };

    // Listen for shake square open event
    const handleOpenShakeSquareEvent = (data) => {
      console.log('🔄 Opening shake square for ALL players:', data);
      handleOpenShakeSquare(data);
    };

    // Listen for shake all cards placed - FIXED: Update anyPlayerPlacedCards when any player places cards
    const handleShakeAllCardsPlaced = (data) => {
      console.log('🔄 All cards placed in shake:', data);
      setShakePlacedCards(prev => ({
        ...prev,
        [data.playerId]: {
          cards: data.cards,
          count: data.cardCount
        }
      }));
      
      // CRITICAL FIX: Set anyPlayerPlacedCards to true when ANY player places cards
      setAnyPlayerPlacedCards(true);
    };

    // Listen for shake completion
    const handleShakeCompleted = (data) => {
      console.log('🔄 Shake completed:', data);
      setShowShakeSquare(false);
      setShakeInitiator(null);
      setShakeActionCard(null);
      setShakePlacedCards({});
      setAnyPlayerPlacedCards(false); // Reset when shake completes
    };

    socket.on('card_game_state_update', handleGameUpdate);
    socket.on('card_game_error', handleGameError);
    socket.on('card_game_dice_rolled', handleDiceRolled);
    socket.on('card_game_dice_category', handleDiceCategory);
    socket.on('card_game_exited', handleGameExited);
    socket.on('card_game_reset', handleGameReset);
    socket.on('card_game_winner_announced', handleWinnerAnnounced);
    socket.on('card_game_open_shake_square', handleOpenShakeSquareEvent);
    socket.on('card_game_shake_all_cards_placed', handleShakeAllCardsPlaced);
    socket.on('card_game_shake_completed', handleShakeCompleted);

    return () => {
      socket.off('card_game_state_update', handleGameUpdate);
      socket.off('card_game_error', handleGameError);
      socket.off('card_game_dice_rolled', handleDiceRolled);
      socket.off('card_game_dice_category', handleDiceCategory);
      socket.off('card_game_exited', handleGameExited);
      socket.off('card_game_reset', handleGameReset);
      socket.off('card_game_winner_announced', handleWinnerAnnounced);
      socket.off('card_game_open_shake_square', handleOpenShakeSquareEvent);
      socket.off('card_game_shake_all_cards_placed', handleShakeAllCardsPlaced);
      socket.off('card_game_shake_completed', handleShakeCompleted);
    };
  }, [socket, currentPlayer?.id, onExit, players]);

  // Drag and drop handlers
  const handleDragStart = (e, card) => {
    if (card.type !== 'action' || (card.type === 'action' && (card.subtype === 'joker' || card.subtype === 'skip' || card.subtype === 'shake'))) {
      setDraggedCard(card);
      e.dataTransfer.setData('text/plain', card.id.toString());
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropOnCircle = (e, circleIndex) => {
    e.preventDefault();
    if (draggedCard && gameState.currentTurn === currentPlayer?.id && areButtonsEnabled()) {
      socket.emit('card_game_move_to_circle', { 
        roomCode, 
        playerId: currentPlayer.id, 
        circleIndex, 
        cardId: draggedCard.id 
      });
      setDraggedCard(null);
    }
  };

  // Handle circle placement via button (for mobile)
  const handlePlaceInCircle = (circleIndex) => {
    if (selectedCardForCircle && gameState.currentTurn === currentPlayer?.id && areButtonsEnabled()) {
      socket.emit('card_game_move_to_circle', { 
        roomCode, 
        playerId: currentPlayer.id, 
        circleIndex, 
        cardId: selectedCardForCircle.id 
      });
      setSelectedCardForCircle(null);
    }
  };

  // Select card for circle placement
  const handleSelectCardForCircle = (card) => {
    if (areButtonsEnabled()) {
      setSelectedCardForCircle(card);
    }
  };

  // Cancel circle placement
  const handleCancelCirclePlacement = () => {
    setSelectedCardForCircle(null);
  };

  // Dice roll handler
  const handleRollDice = () => {
    setShowDice(true);
    socket.emit('card_game_roll_dice', { roomCode, playerId: currentPlayer.id });
  };

  // Close category modal
  const handleCloseCategoryModal = () => {
    setRolledCategory(null);
  };

  // Draw card handler
  const handleDrawCard = () => {
    if (gameState.currentTurn === currentPlayer?.id && !gameState.playerHasDrawn?.[currentPlayer.id]) {
      socket.emit('card_game_draw', { roomCode, playerId: currentPlayer.id });
    }
  };

  // Play card to table handler
  const handlePlayToTable = (cardId) => {
    if (gameState.currentTurn === currentPlayer?.id && areButtonsEnabled()) {
      if (!gameState || !roomCode || !currentPlayer?.id) {
        setError('Game state is not ready. Please wait...');
        return;
      }
      
      socket.emit('card_game_play_table', { roomCode, playerId: currentPlayer.id, cardId });
    }
  };

  // Get top card from table (for display)
  const getTopTableCard = () => {
    if (!gameState.tableCards || gameState.tableCards.length === 0) return null;
    return gameState.tableCards[gameState.tableCards.length - 1];
  };

  // Reset game handler (admin only)
  const handleResetGame = () => {
    if (isAdmin) {
      console.log('🔄 Admin requesting game reset');
      setWinner(null);
      setShowShakeSquare(false);
      socket.emit('card_game_reset', { roomCode });
    }
  };

  // Exit to categories handler
  const handleExitToCategories = () => {
    if (isAdmin) {
      socket.emit('card_game_exit', { roomCode });
    }
  };

  // Take card from table handler
  const handleTakeFromTable = () => {
    const topCard = getTopTableCard();
    if (topCard && gameState.currentTurn === currentPlayer?.id && 
        !gameState.playerHasDrawn?.[currentPlayer.id] && canTakeCardFromTable(topCard)) {
      socket.emit('card_game_take_table', { 
        roomCode, 
        playerId: currentPlayer.id, 
        cardId: topCard.id 
      });
    }
  };

  if (!currentPlayer) {
    return (
      <div className="bg-red-600 rounded-xl p-6 text-center">
        <h2 className="text-xl font-bold">خطأ: لم يتم تحميل بيانات اللاعب</h2>
        <p>يرجاء إعادة تحميل الصفحة</p>
      </div>
    );
  }

  if (!gameState || !gameState.gameStarted) {
    return (
      <div className="bg-indigo-800 rounded-xl p-6 shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4">لعبة البطاقات</h2>
        <p className="text-indigo-200 mb-4">انقر لبدء لعبة البطاقات</p>
        
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
        
        <button
          onClick={initializeGame}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-6 py-3 rounded-lg font-bold text-lg"
        >
          بدء اللعبة
        </button>
      </div>
    );
  }

  const currentTurnPlayer = players.find(p => p.id === gameState.currentTurn);
  const isMyTurn = gameState.currentTurn === currentPlayer?.id;
  const myHand = gameState.playerHands[currentPlayer.id] || [];
  const myCircles = gameState.playerCircles[currentPlayer.id] || [null, null, null, null];
  const filledCircles = myCircles.filter(card => card !== null).length;
  const topTableCard = getTopTableCard();
  const myLevel = gameState.playerLevels?.[currentPlayer.id] || 1;
  const buttonsEnabled = areButtonsEnabled();

  // Get shake initiator name
  const shakeInitiatorPlayer = players.find(p => p.id === shakeInitiator);

  // Check if current player can place cards in shake
  // Button disappears for ALL players if any player has placed cards
  const canPlaceCardsInShake = currentPlayer.id !== shakeInitiator && !anyPlayerPlacedCards && !shakePlacedCards[currentPlayer.id];

  return (
    <div className="bg-indigo-800 rounded-xl p-6 shadow-lg">
      {error && (
        <div className="bg-red-600 rounded-lg p-3 mb-4">
          <p className="font-bold">خطأ:</p>
          <p>{error}</p>
          <button
            onClick={() => setError('')}
            className="mt-2 bg-red-700 hover:bg-red-800 py-1 px-3 rounded"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Dice Category Banner - Only shows for player who rolled dice */}
      {showDiceCategoryBanner && diceCategoryData && (
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 relative">
          <button
            onClick={handleCloseDiceCategoryBanner}
            className="absolute top-3 right-3 text-white hover:text-gray-200 text-xl"
            title="إغلاق"
          >
            <FaTimesCircle />
          </button>
          
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
            
            <div className="mt-3 text-yellow-200 text-sm">
              🎲 هذه الفئة خاصة بك فقط ولا يراها اللاعبون الآخرون
            </div>
          </div>
        </div>
      )}

      {/* WINNER MODAL - Copied from old code with reset button for ALL players */}
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

            {/* Reset button available for ALL players */}
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={handleResetGameAnyPlayer}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
              >
                <FaRedo /> لعبة جديدة
              </button>
              
              {/* Exit to categories button still only for admin */}
              {isAdmin && (
                <button
                  onClick={handleExitToCategories}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2"
                >
                  <FaHome /> العودة للفئات
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Shake Square Modal - FIXED: Button properly disabled for all players */}
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

            <div className="grid grid-cols-2 gap-6">
              {/* Left Section: My Cards and Shake Button */}
              <div className="bg-indigo-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 text-center">بطاقاتي</h3>
                
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">بطاقاتك الحالية ({myHand.length}):</h4>
                  <div className="overflow-y-auto h-48">
                    {myHand.map(card => (
                      <div key={card.id} className="mb-2">
                        {renderShakeCard(card)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* SHOW BUTTON ONLY IF NO PLAYER HAS PLACED CARDS YET - FIXED LOGIC */}
                {canPlaceCardsInShake && (
                  <button
                    onClick={handlePlaceAllCardsInShake}
                    className="w-full py-3 rounded-lg font-bold bg-red-600 hover:bg-red-700"
                  >
                    🎯 وضع كل البطاقات ({myHand.length}) وسحب 5 بطاقات جديدة
                  </button>
                )}

                {/* SHOW MESSAGE IF PLAYER HAS ALREADY PLACED CARDS */}
                {shakePlacedCards[currentPlayer.id] && (
                  <div className="text-center text-green-400 font-bold">
                    ✓ لقد وضعت كل بطاقاتك
                  </div>
                )}

                {/* SHOW MESSAGE IF ANOTHER PLAYER HAS PLACED CARDS */}
                {anyPlayerPlacedCards && !shakePlacedCards[currentPlayer.id] && currentPlayer.id !== shakeInitiator && (
                  <div className="text-center text-yellow-400 font-bold">
                    ⚠️ تم وضع البطاقات مسبقاً من قبل لاعب آخر
                  </div>
                )}

                {/* SHOW MESSAGE FOR INITIATOR */}
                {currentPlayer.id === shakeInitiator && (
                  <div className="text-center text-gray-400 font-bold">
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
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold"
                >
                  إتمام العملية
                </button>
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
                      selectedCardForView.subtype === 'shake' ? 'نفض نفسك' : 'إجراء'
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

      {/* Challenge Modal - FIXED: Working like old code */}
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

            {currentPlayer.id !== gameState.declaredCategory.playerId && !isAdmin && (
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
            )}

            {currentPlayer.id === gameState.declaredCategory.playerId && (
              <p className="text-center text-indigo-200">بانتظار رد اللاعبين الآخرين...</p>
            )}

            {isAdmin && (
              <p className="text-center text-yellow-300 mt-2">المشرف لا يشارك في التصويت</p>
            )}
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
          <p className="text-sm text-yellow-300">
            مستواك الحالي: {myLevel} / 5
          </p>
          {isMyTurn && (
            <p className="text-sm text-yellow-300 mt-1">
              {!gameState.playerHasDrawn?.[currentPlayer.id] ? 'يجب عليك سحب بطاقة أولاً' : 'يجب عليك التخلص من بطاقة الآن'}
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <>
              <button
                onClick={handleExitToCategories}
                className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 flex items-center gap-2"
              >
                <FaHome /> العودة للفئات
              </button>
              <button
                onClick={handleResetGame}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 flex items-center gap-2"
              >
                <FaRedo /> إعادة تعيين اللعبة
              </button>
              <button
                onClick={() => setShowRules(true)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <FaBook /> القواعد
              </button>
            </>
          )}
          
          <button
            onClick={handleRollDice}
            className="px-4 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2"
          >
            <FaDice /> رمي النرد
          </button>
          
          <button
            onClick={handleDrawCard}
            disabled={!isMyTurn || gameState.playerHasDrawn?.[currentPlayer.id] || gameState.drawPile.length === 0}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
              isMyTurn && !gameState.playerHasDrawn?.[currentPlayer.id] && gameState.drawPile.length > 0 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            <FaHandPaper /> سحب بطاقة ({gameState.drawPile.length})
          </button>

          <button
            onClick={() => socket.emit('card_game_shuffle', { roomCode })}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaRandom /> خلط البطاقات
          </button>
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
            {myHand.map((card, index) => (
              <div 
                key={card.id} 
                className={`p-4 text-white font-semibold rounded-lg flex flex-col ${
                  card.type === 'action' && card.subtype === 'skip' ? 'bg-gradient-to-r from-[#00b4db] to-[#0083b0]' :
                  card.type === 'action' && card.subtype === 'joker' ? 'bg-gradient-to-r from-[#00b4db] to-[#0083b0]' :
                  card.type === 'action' && card.subtype === 'shake' ? 'bg-gradient-to-r from-[#00b4db] to-[#0083b0]' :
                  card.type === 'actor' ? 'bg-gradient-to-r from-[#499864] to-[#09481d]' :
                  card.type === 'movie' ? ' bg-gradient-to-r ' : 'bg-indigo-600'
                } text-black`}
                draggable={!isMobile && isMyTurn && buttonsEnabled && (card.type !== 'action' || card.subtype === 'joker' || card.subtype === 'skip' || card.subtype === 'shake')}
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
                        card.subtype === 'shake' ? 'نفض نفسك' : card.subtype
                      }` : 
                       card.type === 'actor' ? 'ممثل' :
                       card.type === 'movie' ? 'فيلم' : 'مخرج'}
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
                        isMyTurn && buttonsEnabled ? 'bg-gradient-to-r shadow-md  from-[#6d6027] to-[#ae8902] text-white hover:text-black' : 'bg-gray-400 cursor-not-allowed'
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
            ))}
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
                  
                  {/* Top card (visible) */}
                  {topTableCard && (
                    <div 
                      className={`relative text-white rounded-lg w-24 h-32 shadow-lg transform hover:scale-105 transition-transform z-40 ${
                        topTableCard.type === 'action' && topTableCard.subtype === 'skip' ? 'bg-red-600' :
                        topTableCard.type === 'action' && topTableCard.subtype === 'joker' ? 'bg-cyan-600' :
                        topTableCard.type === 'action' && topTableCard.subtype === 'shake' ? 'bg-red-700' :
                        topTableCard.type === 'actor' ? 'bg-yellow-600' :
                        topTableCard.type === 'movie' ? 'bg-green-600' : 'bg-indigo-600'
                      }`}
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
                              topTableCard.subtype === 'shake' ? 'نفض نفسك' : topTableCard.subtype
                            }` : 
                             topTableCard.type === 'actor' ? 'ممثل' : 
                             topTableCard.type === 'movie' ? 'فيلم' : 'مخرج'}
                          </span>
                        </div>
                      </div>
                    </div>
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