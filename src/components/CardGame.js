import React, { useState, useEffect } from 'react';
import { FaDice, FaRandom, FaHandPaper, FaTable, FaCheck, FaTimes, FaTrophy, FaPlay, FaRedo, FaList, FaAngleDown, FaAngleUp, FaStar, FaCircle, FaHome, FaBook, FaTimesCircle, FaUserSlash } from 'react-icons/fa';

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
  const [rolledCategory, setRolledCategory] = useState(null); // Store rolled category

  // NEW: Check if card can be taken from table (action cards cannot be taken)
  const canTakeCardFromTable = (card) => {
    if (!card) return false;
    // Action cards cannot be taken from table
    if (card.type === 'action') {
      return false;
    }
    // All other card types (actor, movie, series) can be taken
    return true;
  };

  // NEW: Check if buttons should be enabled
  const areButtonsEnabled = () => {
    if (!gameState || !currentPlayer) return false;
    
    // Buttons are enabled only if player has drawn a card this turn
    return gameState.playerHasDrawn?.[currentPlayer.id] === true;
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
      // Convert level (1-4) to token position (0-3)
      setPlayerToken(playerLevel - 1);
    }
  }, [gameState, currentPlayer]);

  // Initialize game
  const initializeGame = () => {
    console.log('🎮 Initializing game...', { roomCode, currentPlayer: currentPlayer?.id });
    setError('');
    if (socket) {
      socket.emit('card_game_initialize', { roomCode });
    }
  };

  // Socket listeners
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

    // UPDATED: Dice rolled event - only for the player who rolled
    const handleDiceRolled = (data) => {
      setDiceValue(data.diceValue);
      setShowDice(true);
      
      setTimeout(() => {
        setShowDice(false);
      }, 3000);
    };

    // NEW: Handle dice category event - only shown to the player who rolled
    const handleDiceCategory = (data) => {
      console.log('🎲 Dice category received:', data);
      setRolledCategory(data.category);
    };

    const handleGameExited = () => {
      if (onExit) {
        onExit();
      }
    };

    socket.on('card_game_state_update', handleGameUpdate);
    socket.on('card_game_error', handleGameError);
    socket.on('card_game_dice_rolled', handleDiceRolled);
    socket.on('card_game_dice_category', handleDiceCategory);
    socket.on('card_game_exited', handleGameExited);

    return () => {
      socket.off('card_game_state_update', handleGameUpdate);
      socket.off('card_game_error', handleGameError);
      socket.off('card_game_dice_rolled', handleDiceRolled);
      socket.off('card_game_dice_category', handleDiceCategory);
      socket.off('card_game_exited', handleGameExited);
    };
  }, [socket, currentPlayer?.id, onExit]);

  // Drag and drop handlers
  const handleDragStart = (e, card) => {
    if (card.type !== 'action' || (card.type === 'action' && (card.subtype === 'joker' || card.subtype === 'skip'))) {
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

  // Close category banner
  const handleCloseCategoryBanner = () => {
    setRolledCategory(null);
  };

  // Draw card handler
  const handleDrawCard = () => {
    if (gameState.currentTurn === currentPlayer?.id && !gameState.playerHasDrawn?.[currentPlayer.id]) {
      socket.emit('card_game_draw', { roomCode, playerId: currentPlayer.id });
    }
  };

  // Play card to table handler - WITH ERROR HANDLING
  const handlePlayToTable = (cardId) => {
    if (gameState.currentTurn === currentPlayer?.id && areButtonsEnabled()) {
      // Validate game state before sending
      if (!gameState || !roomCode || !currentPlayer?.id) {
        setError('Game state is not ready. Please wait...');
        return;
      }
      
      socket.emit('card_game_play_table', { roomCode, playerId: currentPlayer.id, cardId });
    }
  };

  // SIMPLIFIED: Use skip card - automatically skips next player
  const handleUseSkipCard = (cardId) => {
    if (gameState.currentTurn === currentPlayer?.id && areButtonsEnabled()) {
      socket.emit('card_game_use_skip', { 
        roomCode, 
        playerId: currentPlayer.id, 
        cardId 
      });
    }
  };

  // Get top card from table (for display)
  const getTopTableCard = () => {
    if (!gameState.tableCards || gameState.tableCards.length === 0) return null;
    return gameState.tableCards[gameState.tableCards.length - 1];
  };

  // Reset game handler
  const handleResetGame = () => {
    if (isAdmin) {
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

  // Use joker card handler - NEW: Allow multiple jokers in same turn
  const handleUseJokerCard = (cardId) => {
    if (gameState.currentTurn === currentPlayer?.id && areButtonsEnabled()) {
      socket.emit('card_game_use_joker', { 
        roomCode, 
        playerId: currentPlayer.id, 
        cardId 
      });
    }
  };

  if (!currentPlayer) {
    return (
      <div className="bg-red-600 rounded-xl p-6 text-center">
        <h2 className="text-xl font-bold">خطأ: لم يتم تحميل بيانات اللاعب</h2>
        <p>يرجى إعادة تحميل الصفحة</p>
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

  // FIXED: Properly get current turn player
  const currentTurnPlayer = players.find(p => p.id === gameState.currentTurn);
  const isMyTurn = gameState.currentTurn === currentPlayer?.id;
  const myHand = gameState.playerHands[currentPlayer.id] || [];
  const myCircles = gameState.playerCircles[currentPlayer.id] || [null, null, null, null];
  const filledCircles = myCircles.filter(card => card !== null).length;
  const topTableCard = getTopTableCard();
  const myLevel = gameState.playerLevels?.[currentPlayer.id] || 1;
  const buttonsEnabled = areButtonsEnabled();

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

      {/* NEW: Category Banner - Only shown to player who rolled dice */}
      {rolledCategory && (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 mb-6 text-center animate-pulse">
          <div className="flex justify-between items-center">
            <div className="flex-1 text-right">
              <h3 className="text-xl font-bold text-white">الفئة الخاصة بك!</h3>
              <p className="text-white text-lg">{rolledCategory.name}</p>
              <p className="text-white text-sm">{rolledCategory.description}</p>
            </div>
            <button
              onClick={handleCloseCategoryBanner}
              className="bg-white text-orange-500 hover:bg-gray-100 px-4 py-2 rounded-lg font-bold ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-indigo-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">قواعد لعبة البطاقات</h2>
              <button
                onClick={() => setShowRules(false)}
                className="text-red-500 hover:text-red-400 text-2xl"
              >
                <FaTimesCircle />
              </button>
            </div>
            
            <div className="space-y-4 text-right">
              <div className="bg-indigo-700 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-300 mb-2">هدف اللعبة</h3>
                <p>اكتمال 4 مستويات عن طريق جمع 3 بطاقات في الدوائر لكل فئة</p>
              </div>
              
              <div className="bg-indigo-700 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-300 mb-2">طريقة اللعب</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>كل لاعب يبدأ بـ 5 بطاقات</li>
                  <li>في دورك: اسحب بطاقة من المجموعة أو خذ البطاقة العلوية من الطاولة</li>
                  <li>بعد السحب: تخلص من بطاقة بوضعها على الطاولة</li>
                  <li>يمكنك وضع البطاقات في دوائرك الأربعة لتحضير الفئة</li>
                  <li>عند اكتمال 3 دوائر: أعلن اكتمال الفئة</li>
                  <li>بعد اكتمال الفئة: تسحب 3 بطاقات جديدة ثم تتخلص من بطاقة</li>
                </ul>
              </div>
              
              <div className="bg-indigo-700 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-300 mb-2">البطاقات الخاصة</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li><strong>بطاقة الجوكر:</strong> يمكن استخدامها كأي نوع من البطاقات</li>
                  <li><strong>بطاقة التخطي:</strong> تتيح لك تخطي دور اللاعب التالي تلقائياً</li>
                </ul>
              </div>
              
              <div className="bg-indigo-700 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-300 mb-2">الفئات والتحدي</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>عند الإعلان: يدخل اللاعبون الآخرون في تحدي</li>
                  <li>إذا وافق الجميع: يكمل اللاعب الفئة ويرتفع مستواه</li>
                  <li>إذا اعترض أحد: يفشل الإعلان ويفقد اللاعب دوره</li>
                  <li>كل فئة تحتاج 3 بطاقات من نوع معين</li>
                </ul>
              </div>
              
              <div className="bg-indigo-700 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-300 mb-2">أنواع البطاقات</h3>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>بطاقات الممثلين (أصفر)</li>
                  <li>بطاقات الأفلام (أخضر)</li>
                  <li>بطاقات الجوكر (تركواز) - يمكن استخدامها كأي نوع</li>
                  <li>بطاقات التخطي (أحمر) - لتخطي دور اللاعب التالي تلقائياً</li>
                </ul>
              </div>
              
              <div className="bg-indigo-700 p-4 rounded-lg">
                <h3 className="text-xl font-bold text-yellow-300 mb-2">الفوز</h3>
                <p>أول لاعب يصل للمستوى الرابع (يكمل 4 فئات) يفوز باللعبة!</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowRules(false)}
              className="w-full mt-6 bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold"
            >
              إغلاق القواعد
            </button>
          </div>
        </div>
      )}

      {/* Circle Placement Modal for Mobile */}
      {selectedCardForCircle && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-indigo-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center">اختر الدائرة</h2>
            <p className="text-center mb-4">اختر الدائرة لوضع البطاقة: <strong>{selectedCardForCircle.name}</strong></p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[0, 1, 2, 3].map(circleIndex => (
                <button
                  key={circleIndex}
                  onClick={() => handlePlaceInCircle(circleIndex)}
                  disabled={myCircles[circleIndex] !== null || !isMyTurn || !buttonsEnabled}
                  className={`p-4 rounded-lg text-center flex flex-col items-center justify-center ${
                    myCircles[circleIndex] === null && isMyTurn && buttonsEnabled
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  <FaCircle className="text-xl mb-2" />
                  <span>دائرة {circleIndex + 1}</span>
                  {myCircles[circleIndex] && (
                    <span className="text-xs text-red-300 mt-1">مشغولة</span>
                  )}
                </button>
              ))}
            </div>
            
            <button
              onClick={handleCancelCirclePlacement}
              className="w-full bg-red-600 hover:bg-red-700 py-3 rounded-lg"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Dice Modal - Only shown to player who rolled */}
      {showDice && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-indigo-800 rounded-xl p-8 max-w-sm w-full mx-4 text-center">
            <h2 className="text-2xl font-bold mb-4">رمي النرد</h2>
            <div className="text-6xl mb-6">🎲</div>
            {diceValue > 0 && (
              <div className="text-4xl font-bold text-yellow-400 mb-4">
                {diceValue}
              </div>
            )}
            <button
              onClick={() => setShowDice(false)}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-lg"
            >
              إغلاق
            </button>
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
                    {card.image && (
                      <img 
                        src={`${process.env.PUBLIC_URL}${card.image}`}
                        alt={card.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
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

            {currentPlayer.id !== gameState.declaredCategory.playerId && (
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
          </div>
        </div>
      )}

      {/* FIXED: Game Header - Now properly shows player names */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">لعبة البطاقات - جاهزة! ✅</h2>
          
          {/* FIXED: Always show current player's name with proper fallback */}
          <div className={`text-lg font-bold ${isMyTurn ? 'text-green-400 animate-pulse' : 'text-indigo-200'}`}>
            🎯 الدور: {currentTurnPlayer ? currentTurnPlayer.name : 'جاري التحديد...'} {isMyTurn ? '(أنت)' : ''}
          </div>
          
          <p className="text-sm text-yellow-300">
            مستواك الحالي: {myLevel} / 4
          </p>
          {isMyTurn && (
            <p className="text-sm text-yellow-300 mt-1">
              {!gameState.playerHasDrawn?.[currentPlayer.id] ? 'يجب عليك سحب بطاقة أولاً' : 'يجب عليك التخلص من بطاقة الآن'}
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Admin Controls */}
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
          
          {/* INDEPENDENT DICE BUTTON - Always available */}
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
                className={`p-4 rounded-lg flex justify-between items-center ${
                  card.type === 'action' && card.subtype === 'skip' ? 'bg-red-600' :
                  card.type === 'action' && card.subtype === 'joker' ? 'bg-cyan-600' :
                  card.type === 'actor' ? 'bg-yellow-500' :
                  // card.type === 'series' ? 'bg-pink-600' :
                  card.type === 'movie' ? 'bg-emerald-600' : 'bg-indigo-600'
                } text-black`}
                draggable={!isMobile && isMyTurn && buttonsEnabled && (card.type !== 'action' || card.subtype === 'joker' || card.subtype === 'skip')}
                onDragStart={(e) => handleDragStart(e, card)}
              >
                <div className="flex justify-center items-center flex-col gap-4">
                  {/* Card Image - Increased size */}
                  {card.image && (
                    <img 
                      src={`${process.env.PUBLIC_URL}${card.image}`}
                      alt={card.name}
                      className="w-24 h-24 object-fill rounded-lg border-1 border-white"
                    />
                  )}
                  <div>
                    <div className="font-bold flex justify-center items-center text-lg">{card.name}</div>
                    <div className="text-base opacity-90">
                      {card.type === 'action' ? `إجراء: ${card.subtype}` : 
                       card.type === 'actor' ? 'ممثل' :
                       card.type === 'movie' ? 'فيلم' : 'مخرج'}
                    </div>
                    {card.type === 'action' && card.subtype === 'joker' && (
                      <div className="text-sm opacity-75 mt-1">يمكن استخدامها كأي بطاقة</div>
                    )}
                    {card.type === 'action' && card.subtype === 'skip' && (
                      <div className="text-sm opacity-75 mt-1">تخطي اللاعب التالي تلقائياً</div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-col">
                  {/* Place in Circle Button - Show on mobile or always as alternative */}
                  {(isMobile || true) && (card.type !== 'action' || card.subtype === 'joker') && (
                    <button
                      onClick={() => handleSelectCardForCircle(card)}
                      disabled={!isMyTurn || !buttonsEnabled}
                      className={`px-4 py-2 rounded text-md font-semibold flex items-center gap-1 ${
                        isMyTurn && buttonsEnabled ? 'bg-purple-600 hover:bg-white text-white hover:text-black' : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      وضع في الدائرة
                    </button>
                  )}
                  
                  {card.type === 'action' && card.subtype === 'joker' ? (
                    <button
                      onClick={() => handleUseJokerCard(card.id)}
                      disabled={!isMyTurn || !buttonsEnabled}
                    >
                    </button>
                  ) : card.type === 'action' && card.subtype === 'skip' ? (
                    <button
                      onClick={() => handleUseSkipCard(card.id)}
                      disabled={!isMyTurn || !buttonsEnabled}
                      className={`px-4 py-2 rounded ${
                        isMyTurn && buttonsEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <FaUserSlash /> تخطي التالي
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePlayToTable(card.id)}
                      disabled={!isMyTurn || !buttonsEnabled}
                      className={`px-4 py-2 rounded ${
                        isMyTurn && buttonsEnabled ? 'bg-orange-600 hover:bg-white text-white hover:text-black font-semibold' : 'bg-gray-400 cursor-not-allowed'
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
              </div>
              <div className="flex justify-between items-center relative">
                {/* Progress Line */}
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-600 z-0"></div>
                <div 
                  className="absolute top-4 left-0 h-1 bg-green-500 z-0 transition-all duration-500"
                  style={{ width: `${(playerToken / 3) * 100}%` }}
                ></div>
                
                {/* Circles */}
                {[0, 1, 2, 3].map(level => (
                  <div 
                    key={level}
                    className={`w-10 h-10 rounded-full flex items-center justify-center relative z-10 ${
                      level <= playerToken ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <span className="text-white font-bold">{level + 1}</span>
                  </div>
                ))}
                
                {/* Automatic Token - No longer draggable */}
                <div 
                  className={`absolute top-2 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isMyTurn ? 'animate-pulse' : ''
                  }`}
                  style={{ left: `${(playerToken / 3) * 100}%`, transform: 'translateX(-50%)' }}
                >
                  <span className="text-black font-bold">أنت</span>
                </div>
              </div>
            </div>

            {/* Level Progress Info */}
            <div className="bg-indigo-600 rounded-lg p-3 mb-4 text-center">
              <p className="text-sm">
                {myLevel < 4 ? (
                  <>اكمل <span className="text-yellow-300 font-bold">{3 - filledCircles}</span> بطاقات أخرى للفئة للوصول للمستوى {myLevel + 1}</>
                ) : (
                  <span className="text-green-300 font-bold">🎉 لقد وصلت لأعلى مستوى! 🎉</span>
                )}
              </p>
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
                      {myCircles[circleIndex].image && (
                        <img 
                          src={`${process.env.PUBLIC_URL}${myCircles[circleIndex].image}`}
                          alt={myCircles[circleIndex].name}
                          className="w-24 h-24 object-cover rounded-lg mx-auto mb-2 border-2 border-white"
                        />
                      )}
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
            
            {/* Stacked Cards Display - Fixed container height */}
            <div className="relative h-40 mb-4 flex items-center justify-center overflow-hidden">
              {gameState.tableCards.length === 0 ? (
                <div className="text-gray-400 text-center">
                  لا توجد بطاقات على الطاولة
                </div>
              ) : (
                <div className="relative" style={{ maxWidth: '120px' }}>
                  {/* Background stacked cards - Limited to show only 5 cards maximum */}
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
                      className={`relative text-white rounded-lg w-24 h-32 shadow-lg transform hover:scale-105 transition-transform z-50 ${
                        topTableCard.type === 'action' && topTableCard.subtype === 'skip' ? 'bg-red-600' :
                        topTableCard.type === 'action' && topTableCard.subtype === 'joker' ? 'bg-cyan-600' :
                        topTableCard.type === 'actor' ? 'bg-yellow-600' :
                        topTableCard.type === 'movie' ? 'bg-green-600' : 'bg-indigo-600'
                      }`}
                      style={{ 
                        left: `${Math.min((Math.min(gameState.tableCards.length - 1, 5)) * 3, 15)}px`, 
                        top: `${Math.min((Math.min(gameState.tableCards.length - 1, 5)) * 3, 15)}px` 
                      }}
                    >
                      <div className="w-full h-full rounded-lg p-2">
                        {topTableCard.image && (
                          <div className="w-full h-20 bg-black bg-opacity-20 rounded-md flex items-center justify-center overflow-hidden mb-2">
                            <img 
                              src={`${process.env.PUBLIC_URL}${topTableCard.image}`} 
                              alt={topTableCard.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="text-center">
                          <h3 className="text-sm font-bold text-white leading-tight">
                            {topTableCard.name}
                          </h3>
                          <span className="text-xs text-white opacity-90">
                            {topTableCard.type === 'action' ? `إجراء: ${topTableCard.subtype}` : 
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