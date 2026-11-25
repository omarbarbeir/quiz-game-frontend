import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from './store/useGameStore';

export default function InteractionPrompt() {
  const hovered = useGameStore((s) => s.hovered);

  return (
    <AnimatePresence>
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        >
          <div className="px-4 py-2 rounded-lg bg-black/70 backdrop-blur text-white text-sm flex items-center gap-2 border border-amber-500/40">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-xs font-bold">
              E
            </span>
            <span>{hovered.label}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}