import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function SoundSequence({ puzzle, onSubmit, onHint }) {
  const [input, setInput] = useState('');
  const buttons = [1, 2, 3, 4];

  const press = (n) => {
    const next = input + n;
    if (next.length > puzzle.length) return;
    setInput(next);
    if (next.length === puzzle.length) {
      setTimeout(() => {
        onSubmit(next);
        setInput('');
      }, 200);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <h2 className="text-xl font-bold text-amber-400">{puzzle.title}</h2>
      <p className="text-sm text-neutral-400 text-center">
        كرر التسلسل اللي سمعته
      </p>

      <div className="flex justify-center gap-3">
        {Array.from({ length: puzzle.length }).map((_, i) => (
          <div
            key={i}
            className="w-12 h-12 rounded-lg border-2 border-neutral-600 flex items-center justify-center text-xl font-bold text-white"
          >
            {input[i] || ''}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
        {buttons.map((n) => (
          <motion.button
            key={n}
            whileTap={{ scale: 0.92 }}
            onClick={() => press(String(n))}
            className="aspect-square rounded-xl bg-neutral-800 hover:bg-neutral-700 text-2xl font-bold text-white"
          >
            {n}
          </motion.button>
        ))}
      </div>

      <button onClick={onHint} className="w-full text-sm text-amber-400 underline">
        طلب تلميح
      </button>
    </div>
  );
}