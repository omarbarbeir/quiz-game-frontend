import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

// Vibrant gradient colours for each category on hover
const categoryHoverGradients = {
  cinema: 'linear-gradient(135deg, #6d28d9 0%, #4338ca 100%)',
  casino: 'linear-gradient(135deg, #dc2626 0%, #ea580c 100%)',
  whoami: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
  'card-game': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  whiteboard: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
  flags: 'linear-gradient(135deg, #ef4444 0%, #3b82f6 100%)',
  spy: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  'grid-game': 'linear-gradient(135deg, #14b8a6 0%, #10b981 100%)',
  'tic-tac-toe': 'linear-gradient(135deg, #eab308 0%, #f97316 100%)',
};

const CategorySelector = ({ 
  categories, 
  selectedCategory,
  selectedSubcategory,
  onSelectCategory, 
  onSelectSubcategory,
  isAdmin 
}) => {
  const [hoveredCat, setHoveredCat] = useState(null);

  const selectedMainCat = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-cyan-500/20">
      {selectedMainCat ? (
        <>
          <button
            onClick={() => {
              onSelectCategory(null);
              onSelectSubcategory(null);
            }}
            className="flex items-center gap-2 text-indigo-300 hover:text-white mb-4"
          >
            <FaArrowLeft /> العودة للفئات الرئيسية
          </button>
          <h2 className="text-xl font-semibold mb-3">
            {selectedMainCat.name} <span className="text-sm">(اختر فئة فرعية)</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {selectedMainCat.subcategories.map(sub => (
              <button
                key={sub.id}
                onClick={() => onSelectSubcategory(sub.id)}
                className={`py-3 px-4 rounded-lg text-center transition-all ${
                  selectedSubcategory === sub.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 transform scale-105'
                    : 'bg-gray-800/80 hover:bg-gray-700/80'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-3">
            {isAdmin ? 'اختر فئة المسابقة' : 'الفئات'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onSelectSubcategory(null);
                }}
                onMouseEnter={() => setHoveredCat(cat.id)}
                onMouseLeave={() => setHoveredCat(null)}
                style={
                  hoveredCat === cat.id && selectedCategory !== cat.id
                    ? { background: categoryHoverGradients[cat.id] || 'linear-gradient(135deg, #6d28d9, #4338ca)' }
                    : {}
                }
                className={`py-4 px-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-600 transform scale-105 shadow-lg shadow-purple-500/20'
                    : 'bg-gray-800/80 hover:shadow-md'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-sm font-medium">{cat.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CategorySelector;