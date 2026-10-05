import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function CodeLock({ puzzle, onSubmit, onHint }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const submit = () => {
    if (value.length !== puzzle.digits) return;
    onSubmit(value);
    setError(true);
    setTimeout(() => setError(false), 600);
    setValue('');
  };

  return (
    <div className="p-6 space-y-5">
      <h2 className="text-xl font-bold text-amber-400">{puzzle.title}</h2>

      <motion.div
        animate={error ? { x: [-8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex justify-center gap-3"
      >
        {Array.from({ length: puzzle.digits }).map((_, i) => (
          <div
            key={i}
            className={`w-12 h-16 rounded-lg border-2 flex items-center justify-center text-2xl font-bold text-white ${
              error ? 'border-red-500' : 'border-neutral-600'
            }`}
          >
            {value[i] || ''}
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => value.length < puzzle.digits && setValue(value + n)}
            className="py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-lg font-bold text-white"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => setValue('')}
          className="py-3 rounded-lg bg-red-500/20 text-red-300"
        >
          مسح
        </button>
        <button
          onClick={() => value.length < puzzle.digits && setValue(value + '0')}
          className="py-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-lg font-bold text-white"
        >
          0
        </button>
        <button
          onClick={submit}
          className="py-3 rounded-lg bg-emerald-500/20 text-emerald-300"
        >
          إدخال
        </button>
      </div>

      <button onClick={onHint} className="w-full text-sm text-amber-400 underline">
        طلب تلميح
      </button>
    </div>
  );
}