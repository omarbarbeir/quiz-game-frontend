import React, { useState, useEffect } from 'react';

export default function EmojiGameScreen({ 
  roomCode, playerId, playerName, emojiGameData, secretPhrase, 
  socket, activePlayer, buzzerLocked, currentGuess, guessStatus 
}) {
  const [typedEmojis, setTypedEmojis] = useState("");
  const [myGuessInput, setMyGuessInput] = useState("");

  const isWiseMan = emojiGameData?.wiseManId === playerId;
  const amIActivePlayer = activePlayer === playerId;

  // 1. الضغط على البوزر
  const handleBuzz = () => {
    if (!buzzerLocked) {
      socket.emit('emoji_clink_buzzer', { roomCode, playerId });
    }
  };

  // 2. إرسال التخمين للشاشة الكبيرة
  const handleSendGuessToEveryone = () => {
    if (!myGuessInput.trim()) return;
    socket.emit('share_player_guess', { roomCode, guess: myGuessInput });
    setMyGuessInput(""); // تصفير الإدخال
  };

  // تحديد لون المربع بناءً على حالة الإجابة (هايلايت)
  const getHighlightClass = () => {
    if (guessStatus === 'correct') return 'border-green-500 bg-green-950/40 text-green-300';
    if (guessStatus === 'wrong') return 'border-red-500 bg-red-950/40 text-red-300';
    return 'border-purple-500 bg-gray-900 text-purple-300'; // البندنج العادي
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-gray-800 rounded-3xl p-6 shadow-2xl border border-gray-700 text-center space-y-6">
        
        <div>
          <h1 className="text-3xl font-black text-purple-400">🔮 حكيم الإيموجي</h1>
          <p className="text-sm text-gray-400 mt-1">الحكيم: <span className="text-yellow-400 font-bold">{emojiGameData?.wiseManName}</span></p>
        </div>

        {/* شاشة عرض الإيموجيز الحالية من الحكيم للكل */}
        <div className="bg-gray-950 p-6 rounded-2xl border border-gray-700 min-h-[90px] flex items-center justify-center">
          {emojiGameData?.currentEmojis ? (
            <span className="text-4xl tracking-widest">{emojiGameData.currentEmojis}</span>
          ) : (
            <span className="text-gray-500 italic text-sm">الحكيم يستعد للشرح... 🤔</span>
          )}
        </div>

        {/* --- المربع السحري لعرض التخمين الحالي (الهايلايت) --- */}
        {currentGuess && (
          <div className={`p-4 rounded-xl border-2 transition-all duration-300 font-bold text-xl ${getHighlightClass()}`}>
            {guessStatus === 'correct' && '✅ إجابة صحيحة: '}
            {guessStatus === 'wrong' && '❌ إجابة خاطئة: '}
            "{currentGuess}"
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* شاشة الحكيم: يشرح ويقيم الإجابات */}
        {isWiseMan ? (
          <div className="space-y-4 pt-2">
            <div className="bg-purple-950/40 p-3 rounded-xl border border-purple-500/30">
              <p className="text-xs text-purple-300">الفيلم المطلوب تشرحه:</p>
              <p className="text-xl font-black text-yellow-300 mt-1">{secretPhrase}</p>
            </div>
            
            <input
              type="text"
              placeholder="اكتب الإيموجيز هنا فقط..."
              value={typedEmojis}
              onChange={(e) => {
                setTypedEmojis(e.target.value);
                socket.emit('send_emoji_update', { roomCode, emojis: e.target.value });
              }}
              className="w-full p-3 bg-gray-750 text-center text-2xl rounded-xl border-2 border-purple-500 focus:outline-none"
            />

            {/* أزرار التحكم (صح وغلط) تظهر للحكيم فقط لما يكون فيه لاعب كاتب تخمين */}
            {currentGuess && guessStatus === 'pending' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={() => socket.emit('verify_emoji_answer', { roomCode, isCorrect: true })}
                  className="bg-green-600 hover:bg-green-500 font-bold py-3 rounded-xl text-lg shadow-lg active:scale-95 transition-transform"
                >
                  صح ✅
                </button>
                <button 
                  onClick={() => socket.emit('verify_emoji_answer', { roomCode, isCorrect: false })}
                  className="bg-red-600 hover:bg-red-500 font-bold py-3 rounded-xl text-lg shadow-lg active:scale-95 transition-transform"
                >
                  غلط ❌
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ----------------------------------------------------------------- */
          /* شاشة باقي اللاعبين: بوزر وتخمين */
          <div className="space-y-4">
            
            {/* 1. حالة البوزر */}
            {!activePlayer ? (
              // زرار البوزر الكبير متاح للضغط
              <button
                onClick={handleBuzz}
                className="w-32 h-32 mx-auto bg-red-600 hover:bg-red-500 active:scale-90 text-white font-black rounded-full border-8 border-red-800 shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center text-xl transition-all"
              >
                BUZZ! 🔔
              </button>
            ) : !amIActivePlayer ? (
              // شخص آخر ضغط البوزر
              <div className="p-4 bg-gray-900 text-gray-400 rounded-xl border border-gray-700 italic text-sm">
                🔒 تم القفل! لاعب آخر يفكر في الإجابة...
              </div>
            ) : (
              // أنا اللي ضغطت البوزر! يفتح لي صندوق الكتابة
              <div className="space-y-3 bg-purple-950/20 p-4 rounded-xl border border-purple-500/40 animate-fade-in">
                <p className="text-xs text-purple-300 font-bold">🎉 دورك الآن! اكتب تخمينك بسرعة:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="اكتب اسم الفيلم الحقيقي..."
                    value={myGuessInput}
                    onChange={(e) => setMyGuessInput(e.target.value)}
                    className="flex-1 p-3 bg-gray-700 rounded-xl text-right focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button 
                    onClick={handleSendGuessToEveryone}
                    className="bg-purple-600 hover:bg-purple-500 font-bold px-4 rounded-xl text-xs"
                  >
                    عرض للكل 🖥️
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}