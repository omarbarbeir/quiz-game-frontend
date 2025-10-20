import React from 'react';

const Card = ({ card, onCardClick, canDrag = false, isDragging = false, onDragStart = () => {} }) => {
  const handleClick = () => {
    if (onCardClick) {
      onCardClick(card);
    }
  };

  const handleDragStart = (e) => {
    if (canDrag) {
      e.dataTransfer.setData('text/plain', card.id.toString());
      onDragStart(card);
    }
  };

  // Fallback image if card image is not available
  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextSibling.style.display = 'flex';
  };

  return (
    <div 
      className={`relative w-24 h-36 bg-white rounded-lg shadow-lg cursor-pointer transform transition-transform ${
        isDragging ? 'scale-110 rotate-6 z-50' : 'hover:scale-105'
      } border-2 border-gray-300`}
      onClick={handleClick}
      draggable={canDrag}
      onDragStart={handleDragStart}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-gray-100 rounded-lg"></div>
      
      {/* Card Image */}
      <div className="absolute inset-0 p-2">
        <div className="w-full h-20 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
          {card.image ? (
            <>
              <img 
                src={card.image} 
                alt={card.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
              <div className="text-gray-400 text-xs text-center hidden">
                No Image
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-xs text-center">
              No Image
            </div>
          )}
        </div>
        
        {/* Card Name */}
        <div className="mt-2 text-center">
          <h3 className="text-xs font-bold text-gray-800 leading-tight">
            {card.name}
          </h3>
          <span className="text-xs text-gray-600 mt-1 block">
            {card.type === 'actor' ? 'ممثل' : 
             card.type === 'movie' ? 'فيلم' : 'مخرج'}
          </span>
        </div>
      </div>
      
      {/* Card Corner Design */}
      <div className="absolute top-0 left-0 w-6 h-6 bg-blue-500 rounded-tl-lg rounded-br-lg flex items-center justify-center">
        <span className="text-white text-xs font-bold">
          {card.id}
        </span>
      </div>
    </div>
  );
};

export default Card;