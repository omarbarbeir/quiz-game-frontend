import React, { useState, useEffect } from 'react';

const Connect4GridGame = ({ socket, roomIndex, myTurn }) => {
  // شبكة اللعب 6 صفوف و 7 أعمدة
  const [board, setBoard] = useState(Array(6).fill(null).map(() => Array(7).fill(null)));
  
  // أمثلة للبيانات (يتم جلبها من السيرفر)
  const [topHeaders, setTopHeaders] = useState(['صورة1', 'صورة2', 'صورة3', 'صورة4', 'صورة5', 'صورة6', 'صورة7']);
  const [leftHeaders, setLeftHeaders] = useState(['صورةA', 'صورةB', 'صورةC', 'صورةD', 'صورةE', 'صورةF']);
  
  const [activeQuestion, setActiveQuestion] = useState(null); // { row, col }
  const [answer, setAnswer] = useState("");

  // عند الضغط على عمود
  const handleColumnClick = (colIndex) => {
    if (!myTurn || activeQuestion) return;

    // البحث عن أدنى صف فارغ في العمود المختار
    for (let r = 5; r >= 0; r--) {
      if (!board[r][colIndex]) {
        // تحديد المربع المطلوب تفعيل السؤال له
        setActiveQuestion({ row: r, col: colIndex });
        break;
      }
    }
  };

  const submitAnswer = () => {
    // إرسال الإجابة للسيرفر للتحقق
    socket.emit("submit_connect4_answer", {
      room: roomIndex,
      row: activeQuestion.row,
      col: activeQuestion.col,
      answer: answer
    });
    setAnswer("");
    setActiveQuestion(null);
  };

  // استقبال تحديثات اللوحة من السيرفر
  useEffect(() => {
    socket.on("update_board", (newBoard) => {
      setBoard(newBoard);
    });
    
    return () => socket.off("update_board");
  }, [socket]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="bg-blue-900 p-2 rounded-xl shadow-2xl">
        {/* الصف العلوي للصور */}
        <div className="flex">
          {/* مربع فارغ في الزاوية العلوية اليسرى */}
          <div className="w-16 h-16 md:w-20 md:h-20 m-1"></div>
          {topHeaders.map((header, i) => (
            <div key={`top-${i}`} className="w-16 h-16 md:w-20 md:h-20 m-1 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-center border-2 border-white">
              {header} {/* هنا تضع <img> */}
            </div>
          ))}
        </div>

        {/* باقي الشبكة مع العمود الأيسر */}
        {board.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex">
            {/* الصورة الخاصة بالصف (العمود الأيسر) */}
            <div className="w-16 h-16 md:w-20 md:h-20 m-1 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-center border-2 border-white">
              {leftHeaders[rowIndex]} {/* هنا تضع <img> */}
            </div>
            
            {/* مربعات اللعب */}
            {row.map((cell, colIndex) => (
              <div 
                key={`cell-${rowIndex}-${colIndex}`} 
                onClick={() => handleColumnClick(colIndex)}
                className="w-16 h-16 md:w-20 md:h-20 m-1 bg-blue-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors shadow-inner"
              >
                {/* دائرة اللاعب */}
                {cell && (
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full shadow-md ${cell === 'p1' ? 'bg-red-500' : 'bg-yellow-400'}`}></div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* نافذة الإجابة المنبثقة (Modal) */}
      {activeQuestion && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 text-center">
            <h3 className="text-lg font-bold mb-4">
              ما هو الرابط بين {topHeaders[activeQuestion.col]} و {leftHeaders[activeQuestion.row]}؟
            </h3>
            <input 
              type="text" 
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full border-2 p-2 rounded mb-4"
              placeholder="اكتب الإجابة هنا..."
            />
            <div className="flex gap-2">
              <button onClick={submitAnswer} className="bg-green-500 text-white w-full py-2 rounded">تأكيد</button>
              <button onClick={() => setActiveQuestion(null)} className="bg-red-500 text-white w-full py-2 rounded">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Connect4GridGame;