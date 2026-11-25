import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentModal({ data, onClose }) {
  // ✅ Escape للإغلاق
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'KeyE' || e.code === 'Enter' || e.code === 'Space') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* خلفية داكنة */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

        <motion.div
          initial={{ scale: 0.9, rotate: -1, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl max-h-[85vh] overflow-hidden"
          style={{
            background: `
              linear-gradient(180deg, 
                rgba(240,225,190,0.98) 0%, 
                rgba(230,210,170,0.98) 40%,
                rgba(215,195,155,0.98) 100%
              )
            `,
            borderRadius: '4px',
            boxShadow: `
              0 20px 60px rgba(0,0,0,0.8),
              inset 0 0 80px rgba(160,120,60,0.2),
              0 0 0 1px rgba(120,80,40,0.4)
            `,
          }}
        >
          {/* بقع قديمة */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: `
                radial-gradient(circle at 15% 20%, rgba(120,80,40,0.15) 0%, transparent 15%),
                radial-gradient(circle at 85% 60%, rgba(120,80,40,0.12) 0%, transparent 20%),
                radial-gradient(circle at 40% 85%, rgba(100,60,20,0.1) 0%, transparent 18%),
                radial-gradient(circle at 70% 15%, rgba(120,80,40,0.08) 0%, transparent 12%)
              `,
            }}
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 40px rgba(80,40,10,0.35)',
            }}
          />

          <div className="relative p-6 sm:p-10 overflow-y-auto max-h-[85vh]">
            {data.title && (
              <h2
                className="text-3xl text-amber-950 mb-6 text-center tracking-wide"
                style={{
                  fontFamily: "'Aref Ruqaa', 'Amiri', serif",
                  textShadow: '1px 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                {data.title}
              </h2>
            )}

            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-16 h-px bg-amber-900/40" />
              <span className="text-amber-800 text-sm">✦</span>
              <div className="w-16 h-px bg-amber-900/40" />
            </div>

            <div
              className="text-amber-950 leading-loose text-lg whitespace-pre-line"
              style={{
                fontFamily: "'Amiri', serif",
                direction: 'rtl',
                textAlign: 'right',
                textShadow: '0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              {data.content}
            </div>
          </div>

          {/* ✅ تلميح سفلي */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-lg bg-amber-950/70 text-amber-100 text-xs pointer-events-none">
            <span className="font-bold">E</span> أو <span className="font-bold">Esc</span> للإغلاق
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}