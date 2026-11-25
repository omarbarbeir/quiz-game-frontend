import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SOLUTIONS = {
  office_drawer_code: '1510',
};

export default function CodeLockModal({ puzzleId, title, digits, onSolve, onClose }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);
  const [solved, setSolved] = useState(false);

  const submit = () => {
    if (value.length !== digits) return;
    if (value === SOLUTIONS[puzzleId]) {
      setSolved(true);
      setTimeout(() => onSolve(), 700);
    } else {
      setError(true);
      setTimeout(() => setError(false), 600);
      setValue('');
    }
  };

  // ✅ كيبورد
  useEffect(() => {
    const onKey = (e) => {
      if (solved) return;

      if (e.code === 'KeyE') {
        onClose();
        return;
      }
      if (e.code === 'Enter') {
        submit();
        return;
      }
      if (e.code === 'Backspace') {
        e.preventDefault();
        setValue((v) => v.slice(0, -1));
        return;
      }

      // أرقام
      const num = e.key;
      if (/^[0-9]$/.test(num)) {
        if (value.length < digits) setValue(value + num);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [value, solved, digits]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* خلفية داكنة خفيفة */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md overflow-hidden"
          style={{
            background: `linear-gradient(180deg, #2a2520 0%, #1a1510 50%, #0f0a05 100%)`,
            borderRadius: '16px',
            boxShadow: `
              0 20px 60px rgba(0,0,0,0.9),
              inset 0 1px 0 rgba(200,180,140,0.15),
              inset 0 -1px 0 rgba(0,0,0,0.5),
              0 0 0 1px rgba(80,60,40,0.5)
            `,
          }}
        >
          {/* مسامير */}
          {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map(
            (pos, i) => (
              <div
                key={i}
                className={`absolute ${pos} w-2.5 h-2.5 rounded-full`}
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #8a7a6a, #3a2a1a)',
                  boxShadow:
                    'inset 0 1px 1px rgba(255,200,150,0.4), 0 1px 2px rgba(0,0,0,0.8)',
                }}
              />
            )
          )}

          <div className="p-8">
            <h2
              className="text-2xl text-amber-400 mb-2 text-center tracking-wider"
              style={{ fontFamily: "'Aref Ruqaa', serif" }}
            >
              🔒 {title}
            </h2>

            {solved ? (
              <p className="text-center text-emerald-400 text-sm mb-6 mt-3">
                ✅ تم فتح القفل!
              </p>
            ) : (
              <p className="text-center text-neutral-500 text-xs mb-6 mt-1">
                استخدم الكيبورد لكتابة {digits} أرقام
              </p>
            )}

            {/* شاشة الكود */}
            <motion.div
              animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex justify-center gap-3 mb-8 p-4 rounded-xl"
              style={{
                background: 'linear-gradient(180deg, #0a0604 0%, #1a1008 100%)',
                boxShadow:
                  'inset 0 2px 8px rgba(0,0,0,0.9), 0 1px 0 rgba(200,180,140,0.1)',
              }}
            >
              {Array.from({ length: digits }).map((_, i) => (
                <div
                  key={i}
                  className="w-14 h-16 rounded-lg flex items-center justify-center text-3xl font-bold"
                  style={{
                    background: error
                      ? 'linear-gradient(180deg, #4a0a0a, #2a0505)'
                      : solved
                      ? 'linear-gradient(180deg, #0a2a0a, #051505)'
                      : 'linear-gradient(180deg, #1a1a1a, #0a0a0a)',
                    border: error
                      ? '1px solid rgba(255,80,80,0.5)'
                      : solved
                      ? '1px solid rgba(80,255,80,0.5)'
                      : '1px solid rgba(120,100,60,0.3)',
                    color: error ? '#ff8080' : solved ? '#80ff80' : '#e0d0a0',
                    fontFamily: 'monospace',
                    textShadow: error
                      ? '0 0 10px rgba(255,80,80,0.6)'
                      : solved
                      ? '0 0 10px rgba(80,255,80,0.6)'
                      : '0 0 8px rgba(224,208,160,0.3)',
                  }}
                >
                  {value[i] || '·'}
                </div>
              ))}
            </motion.div>

            {/* تعليمات */}
            <div className="flex justify-center gap-4 text-xs text-neutral-500">
              <span>
                <span className="text-amber-500">0-9</span> كتابة
              </span>
              <span>
                <span className="text-amber-500">⌫</span> مسح
              </span>
              <span>
                <span className="text-amber-500">Enter</span> تأكيد
              </span>
              <span>
                <span className="text-amber-500">E</span> إغلاق
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}