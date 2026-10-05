import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  const colors = {
    info: 'bg-neutral-800 border-neutral-600 text-white',
    error: 'bg-red-900/90 border-red-500 text-red-100',
    success: 'bg-emerald-900/90 border-emerald-500 text-emerald-100',
    warning: 'bg-amber-900/90 border-amber-500 text-amber-100',
  };

  const icons = {
    info: 'ℹ️',
    error: '🔒',
    success: '✅',
    warning: '⚠️',
  };

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: -60, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl border-2 backdrop-blur-md shadow-2xl font-bold text-sm max-w-[90vw] ${colors[type]}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{icons[type]}</span>
            <span>{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}