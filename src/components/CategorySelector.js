import React from 'react';

const CategorySelector = ({ 
  categories, 
  onSelectCategory,
  selectedCategory,
  isAdmin
}) => {
  return (
    <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
      <h2 className="text-xl font-semibold mb-3">Select a Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories
          // Filter out the 'photos' category for non-admin users
          .filter(cat => cat.id !== 'photos' || isAdmin)
          .map(category => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`py-3 px-4 rounded-lg transition-all text-center ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 transform scale-105'
                  : 'bg-indigo-700 hover:bg-indigo-600'
              }`}
            >
              {category.name}
            </button>
          ))}
      </div>
    </div>
  );
};

export default CategorySelector;