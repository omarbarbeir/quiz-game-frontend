import React, { useState } from 'react';
import { FaRedo, FaPlay, FaArrowLeft } from 'react-icons/fa';

const CardGame = ({ 
  isAdmin, 
  roomCode, 
  playerId, 
  cardGameState, 
  socket,
  players 
}) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardsPerPlayer, setCardsPerPlayer] = useState(4);
  
  // Card suits mapping using text symbols
  const suitSymbols = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠'
  };
  
  // Card names for special cards
  const cardNames = {
    'J': 'J',
    'Q': 'Q',
    'K': 'K',
    'A': 'A'
  };

  // Render a single card with improved design
  const renderCard = (card, index, isPlayerCard = false) => {
    if (!card) return null;
    
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const colorClass = isRed ? 'text-red-600' : 'text-black';
    const displayValue = cardNames[card.value] || card.value;
    
    return (
      <div 
        key={index}
        className={`relative w-20 h-28 bg-white rounded-lg shadow-lg flex flex-col justify-between p-2 m-1 cursor-pointer transform transition-all duration-200 ${
          selectedCard === card ? 'ring-4 ring-yellow-400 -translate-y-3' : ''
        } ${
          isPlayerCard && cardGameState.currentPlayer === playerId ? 
            'hover:shadow-xl hover:-translate-y-2' : 'opacity-80'
        }`}
        onClick={() => {
          if (isPlayerCard && cardGameState.currentPlayer === playerId) {
            setSelectedCard(selectedCard === card ? null : card);
          }
        }}
      >
        <div className="flex flex-col items-start">
          <span className={`font-bold text-xl ${colorClass}`}>
            {displayValue}
          </span>
          <span className={`text-2xl ${colorClass}`}>
            {suitSymbols[card.suit]}
          </span>
        </div>
        <div className="flex justify-center">
          <span className={`text-4xl ${colorClass}`}>
            {suitSymbols[card.suit]}
          </span>
        </div>
        <div className="flex flex-col items-end rotate-180">
          <span className={`font-bold text-xl ${colorClass}`}>
            {displayValue}
          </span>
          <span className={`text-2xl ${colorClass}`}>
            {suitSymbols[card.suit]}
          </span>
        </div>
      </div>
    );
  };

  // Handle playing a card to land
  const handlePlayToLand = () => {
    if (selectedCard && cardGameState.currentPlayer === playerId) {
      socket.emit('play_card_to_land', { roomCode, playerId, card: selectedCard });
      setSelectedCard(null);
    }
  };

  // Handle capturing cards
  const handleCapture = () => {
    if (selectedCard && cardGameState.currentPlayer === playerId) {
      socket.emit('capture_cards', { roomCode, playerId, card: selectedCard });
      setSelectedCard(null);
    }
  };

  // Admin controls
  const handleShuffle = () => {
    socket.emit('shuffle_cards', roomCode);
  };

  const handleDeal = () => {
    socket.emit('deal_cards', { 
      roomCode, 
      landCount: cardGameState.landCount || 4,
      cardsPerPlayer
    });
  };

  const handleChangeLandCount = (count) => {
    socket.emit('change_land_count', { roomCode, count });
  };

  const handleStartGame = () => {
    socket.emit('start_card_game', roomCode);
  };

  const handleNextPlayer = () => {
    socket.emit('next_player', roomCode);
  };

  const handleResetGame = () => {
    socket.emit('reset_card_game', roomCode);
  };

  // Get current player name
  const currentPlayerName = players.find(p => p.id === cardGameState.currentPlayer)?.name || '';
  const playerHand = cardGameState.playerHands[playerId] || [];

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">لعبة الورق - الباصرة</h1>
          <div className="bg-indigo-700 px-4 py-2 rounded-lg flex items-center gap-3">
            <span>رمز الغرفة:</span>
            <span className="font-mono text-xl bg-indigo-800 px-3 py-1 rounded">{roomCode}</span>
          </div>
        </div>

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Player List */}
          <div className="lg:col-span-1 bg-indigo-800 rounded-xl p-4">
            <h2 className="text-xl font-semibold mb-4">اللاعبون</h2>
            <div className="space-y-3">
              {players.map(player => (
                <div 
                  key={player.id} 
                  className={`p-3 rounded-lg ${
                    cardGameState.currentPlayer === player.id 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500' 
                      : 'bg-indigo-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      player.isAdmin ? 'bg-yellow-500' : 'bg-indigo-600'
                    }`}>
                      {player.isAdmin ? 'A' : player.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-indigo-300">
                        {cardGameState.playerHands[player.id]?.length || 0} بطاقات
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Admin Controls */}
            {isAdmin && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">تحكم المسؤول</h2>
                
                <div className="mb-4">
                  <label className="block mb-2">بطاقات لكل لاعب:</label>
                  <select
                    value={cardsPerPlayer}
                    onChange={(e) => setCardsPerPlayer(parseInt(e.target.value))}
                    className="w-full bg-indigo-700 border border-indigo-600 rounded p-2"
                  >
                    {[3, 4, 5, 6, 7].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block mb-2">بطاقات الأرض:</label>
                  <div className="flex gap-2">
                    {[3, 4, 5].map(count => (
                      <button
                        key={count}
                        onClick={() => handleChangeLandCount(count)}
                        className={`flex-1 py-2 rounded ${
                          cardGameState.landCount === count 
                            ? 'bg-blue-600' 
                            : 'bg-indigo-700 hover:bg-indigo-600'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <button
                    onClick={handleShuffle}
                    className="bg-indigo-700 hover:bg-indigo-600 py-2 rounded flex items-center justify-center gap-1"
                  >
                    <FaRedo /> خلط
                  </button>
                  <button
                    onClick={handleDeal}
                    className="bg-green-600 hover:bg-green-500 py-2 rounded flex items-center justify-center gap-1"
                  >
                    <FaPlay /> توزيع
                  </button>
                </div>
                
                {!cardGameState.gameStarted ? (
                  <button
                    onClick={handleStartGame}
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 py-2 rounded-lg"
                  >
                    بدء اللعبة
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleNextPlayer}
                      className="bg-blue-600 hover:bg-blue-500 py-2 rounded"
                    >
                      لاعب التالي
                    </button>
                    <button
                      onClick={handleResetGame}
                      className="bg-red-600 hover:bg-red-500 py-2 rounded"
                    >
                      إعادة اللعبة
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Main Game Board */}
          <div className="lg:col-span-3">
            {!cardGameState.gameStarted ? (
              <div className="bg-indigo-800 rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">لعبة الباصرة</h2>
                <p className="text-xl mb-8">اللعبة لم تبدأ بعد. سيبدأها المسؤول قريبًا.</p>
                {isAdmin && (
                  <button
                    onClick={handleStartGame}
                    className="bg-gradient-to-r from-green-600 to-teal-600 px-8 py-3 rounded-lg text-xl"
                  >
                    بدء اللعبة
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Game Status */}
                <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-xl p-4 mb-6 text-center">
                  <p className="text-xl font-bold">
                    {cardGameState.currentPlayer === playerId
                      ? '💡 دورك الآن!'
                      : `⏱️ دور: ${currentPlayerName}`
                    }
                  </p>
                  {cardGameState.lastCapture && (
                    <p className="text-green-300 text-lg mt-2">
                      {cardGameState.lastCapture.playerName} أخذ {cardGameState.lastCapture.count} بطاقة
                    </p>
                  )}
                </div>
                
                {/* Land Cards */}
                <div className="mb-8 bg-indigo-900 bg-opacity-50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 text-center">أوراق الأرض</h3>
                  <div 
                    className="flex flex-wrap min-h-40 bg-indigo-800 rounded-lg p-4 justify-center items-center border-2 border-dashed border-indigo-600"
                    onClick={handlePlayToLand}
                  >
                    {cardGameState.landCards.length > 0 ? (
                      cardGameState.landCards.map((card, index) => renderCard(card, index))
                    ) : (
                      <p className="text-indigo-400 text-lg">
                        {selectedCard 
                          ? 'انقر هنا لإلقاء البطاقة على الأرض' 
                          : 'لا توجد بطاقات على الأرض'}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Player Cards */}
                <div className="bg-indigo-800 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4 text-center">بطاقاتك</h3>
                  
                  {playerHand.length === 0 ? (
                    <p className="text-center text-indigo-300 py-4">لا توجد بطاقات في يدك</p>
                  ) : (
                    <>
                      <div className="flex flex-wrap justify-center">
                        {playerHand.map((card, index) => 
                          renderCard(card, index, true)
                        )}
                      </div>
                      
                      {selectedCard && cardGameState.currentPlayer === playerId && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                          <button
                            onClick={handlePlayToLand}
                            className="bg-blue-600 hover:bg-blue-500 py-3 rounded-lg text-lg flex items-center justify-center"
                          >
                            إلقاء البطاقة على الأرض
                          </button>
                          <button
                            onClick={handleCapture}
                            className="bg-green-600 hover:bg-green-500 py-3 rounded-lg text-lg flex items-center justify-center"
                          >
                            محاولة أخذ البطاقات
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardGame;