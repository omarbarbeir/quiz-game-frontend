import React from 'react';
import { FaPlay, FaPause, FaStop, FaVolumeUp } from 'react-icons/fa';

const QuestionControls = ({ 
  question, 
  isPlaying, 
  onPlay, 
  onPause, 
  onStop, 
  onShowText,
  onReplay,
  disabled
}) => {
  return (
    <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Question Controls</h2>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onPlay}
          disabled={disabled || isPlaying}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            disabled || isPlaying 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          <FaPlay /> Play
        </button>
        
        <button
          onClick={onPause}
          disabled={disabled || !isPlaying}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            disabled || !isPlaying 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-yellow-600 hover:bg-yellow-700'
          }`}
        >
          <FaPause /> Pause
        </button>
        
        <button
          onClick={onStop}
          disabled={disabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            disabled 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          <FaStop /> Stop
        </button>
        
        <button
          onClick={onReplay}
          disabled={disabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            disabled 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <FaVolumeUp /> Replay
        </button>
        
        <button
          onClick={onShowText}
          disabled={disabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            disabled 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          Show Text
        </button>
      </div>
      
      {question && (
        <div className="mt-4 p-3 bg-indigo-700 rounded-lg">
          <h3 className="font-semibold">Question Text:</h3>
          <p className="mt-1">{question.text}</p>
        </div>
      )}
    </div>
  );
};

export default QuestionControls;