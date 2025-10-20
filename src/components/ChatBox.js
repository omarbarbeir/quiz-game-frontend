// components/ChatBox.js
import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaTimes, FaUsers } from 'react-icons/fa';

const ChatBox = ({ players, playerId, playerName, chatMessages, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerList, setShowPlayerList] = useState(false);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);
  
  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(selectedPlayer?.id, message, !selectedPlayer);
      setMessage('');
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Include all players except yourself
  const filteredPlayers = players.filter(player => player.id !== playerId);
  
  return (
    <div className="bg-indigo-800 rounded-xl p-4 shadow-lg h-[600px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">الدردشة</h2>
        <div className="relative">
          <button
            onClick={() => setShowPlayerList(!showPlayerList)}
            className="bg-indigo-700 hover:bg-indigo-600 px-3 py-1 rounded-lg flex items-center gap-2"
          >
            <FaUsers />
            {selectedPlayer ? (selectedPlayer.isAdmin ? 'المسؤول' : selectedPlayer.name) : 'الجميع'}
          </button>
          
          {showPlayerList && (
            <div className="absolute right-0 mt-2 w-48 bg-indigo-700 rounded-lg shadow-lg z-10">
              <div className="p-2">
                <button
                  onClick={() => {
                    setSelectedPlayer(null);
                    setShowPlayerList(false);
                  }}
                  className={`w-full text-right p-2 rounded-lg mb-1 ${
                    !selectedPlayer ? 'bg-indigo-600' : 'hover:bg-indigo-600'
                  }`}
                >
                  الجميع
                </button>
                {filteredPlayers.map(player => (
                  <button
                    key={player.id}
                    onClick={() => {
                      setSelectedPlayer(player);
                      setShowPlayerList(false);
                    }}
                    className={`w-full text-right p-2 rounded-lg mb-1 ${
                      selectedPlayer?.id === player.id ? 'bg-indigo-600' : 'hover:bg-indigo-600'
                    }`}
                  >
                    {player.isAdmin ? 'المسؤول' : player.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {chatMessages.length === 0 ? (
          <div className="text-center text-indigo-300 py-8">
            لا توجد رسائل بعد
          </div>
        ) : (
          chatMessages.map(msg => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg ${
                msg.from === playerId
                  ? 'bg-indigo-600 ml-8'
                  : msg.isBroadcast
                  ? 'bg-purple-600 mr-8'
                  : 'bg-indigo-700 mr-8'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold">
                  {msg.from === playerId 
                    ? 'أنت' 
                    : msg.fromName + (msg.isBroadcast ? ' (للجميع)' : '')
                  }
                </span>
                <span className="text-xs opacity-70">{formatTime(msg.timestamp)}</span>
              </div>
              <p className="text-sm">{msg.message}</p>
              {!msg.isBroadcast && (
                <div className="text-xs opacity-70 mt-1">
                  إلى: {msg.toName || (msg.from === playerId ? (msg.to ? 'الجميع' : 'الجميع') : 'أنت')}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="اكتب رسالتك هنا..."
          className="flex-1 bg-indigo-700 border border-indigo-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg"
        >
          <FaPaperPlane />
        </button>
      </div>
      
      {selectedPlayer && (
        <div className="mt-2 text-xs text-indigo-300 flex items-center">
          <span>إلى: {selectedPlayer.isAdmin ? 'المسؤول' : selectedPlayer.name}</span>
          <button
            onClick={() => setSelectedPlayer(null)}
            className="mr-2 text-indigo-100 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatBox;