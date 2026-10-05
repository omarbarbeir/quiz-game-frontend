import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import audioEngine from './audio/AudioEngine';

/**
 * ============================================================
 *  StoryIntro
 *  شاشة تعرض مقدمة/نهاية الفصل
 * ============================================================
 */
export default function StoryIntro({ data, onComplete, type = 'intro' }) {
  const [visible, setVisible] = useState(false);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (!data) return;

    // fade in
    setTimeout(() => setVisible(true), 100);

    // شغّل صوت الراوي (لو موجود)
    if (data.voice) {
      audioEngine.playSfx(data.voice, 0.9).catch(() => {});
    }

    // النص يظهر تدريجيًا
    setTimeout(() => setShowText(true), 800);
  }, [data]);

  const handleComplete = () => {
    setVisible(false);
    setShowText(false);
    setTimeout(() => onComplete(), 400);
  };

  if (!data) return null;

  const isIntro = type === 'intro';
  const accent = isIntro ? 'amber' : 'emerald';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          onClick={handleComplete}
        >
          {/* خلفية ضباب */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background: isIntro
                ? 'radial-gradient(ellipse at center, rgba(120,60,20,0.3), transparent 60%)'
                : 'radial-gradient(ellipse at center, rgba(20,120,60,0.25), transparent 60%)',
              filter: 'blur(60px)',
            }}
          />

          {/* Vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 80%)',
            }}
          />

          <div className="relative z-10 max-w-2xl w-full px-6 text-center">
            {/* عنوان الفصل */}
            {data.title && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={showText ? { opacity: 0.5, y: 0 } : {}}
                transition={{ duration: 0.8 }}
                className={`text-xs tracking-[0.5em] uppercase mb-4 text-${accent}-700/70`}
                style={{ fontFamily: 'serif' }}
              >
                {isIntro ? 'الفصل' : 'النهاية'}
              </motion.p>
            )}

            {data.subtitle && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={showText ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1, delay: 0.2 }}
                className={`text-4xl sm:text-5xl font-black tracking-wider mb-6 text-${accent}-400`}
                style={{
                  fontFamily: 'serif',
                  textShadow: `0 0 30px rgba(${
                    isIntro ? '212,167,96' : '100,200,140'
                  },0.6)`,
                }}
              >
                {data.subtitle}
              </motion.h2>
            )}

            {/* خط فاصل */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={showText ? { opacity: 1, scaleX: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <div className={`w-16 h-px bg-gradient-to-r from-transparent to-${accent}-700/60`} />
              <span className={`text-${accent}-700/80 text-sm`}>✦</span>
              <div className={`w-16 h-px bg-gradient-to-l from-transparent to-${accent}-700/60`} />
            </motion.div>

            {/* النص */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={showText ? { opacity: 1 } : {}}
              transition={{ duration: 1.5, delay: 0.8 }}
              className="text-lg sm:text-xl text-neutral-300 leading-loose whitespace-pre-line mb-12"
              style={{ fontFamily: 'serif' }}
            >
              {data.text}
            </motion.p>

            {/* زر المتابعة */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={showText ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 2 }}
              onClick={handleComplete}
              className={`px-10 py-4 rounded-sm text-black font-bold text-lg transition-all border-2 border-${accent}-900/60 tracking-wider`}
              style={{
                background: isIntro
                  ? 'linear-gradient(180deg, #e0b060 0%, #b8863c 50%, #8a5f28 100%)'
                  : 'linear-gradient(180deg, #6ee7b7 0%, #34d399 50%, #059669 100%)',
                fontFamily: 'serif',
                boxShadow: `0 0 30px rgba(${
                  isIntro ? '212,167,96' : '100,200,140'
                },0.35)`,
              }}
            >
              {isIntro ? 'ابدأ' : 'متابعة'}
            </motion.button>

            {/* اضغط للاستمرار */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0.3, 0.5] }}
              transition={{
                duration: 3,
                delay: 2.5,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-neutral-600 tracking-widest"
              style={{ fontFamily: 'serif' }}
            >
              اضغط في أي مكان للمتابعة
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}