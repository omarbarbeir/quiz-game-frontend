import React from 'react';

const CategorySelector = ({ categories, onSelectCategory, selectedCategory }) => {
  return (
    <div className="bg-indigo-800 rounded-xl p-4 shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Categories</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`p-4 rounded-lg text-center transition-all transform hover:scale-105 ${
              selectedCategory === category.id 
                ? `bg-gradient-to-br ${category.color} shadow-lg scale-105` 
                : 'bg-indigo-700 hover:bg-indigo-600'
            }`}
          >
            <div className="text-3xl mb-2">{category.icon}</div>
            <div className="font-medium">{category.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;