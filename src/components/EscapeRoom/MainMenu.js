import React, { useState } from 'react';
import { motion } from 'framer-motion';
import stories from '../../data/stories';

/**
 * MainMenu — بوابة اختيار القصص
 */
export default function MainMenu({ onExit }) {
  const [particles] = useState(() => {
    const count = typeof window !== 'undefined' && window.innerWidth < 768 ? 12 : 20;
    return Array.from({ length: count }).map(() => ({
      id: Math.random().toString(36).slice(2),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      duration: 20 + Math.random() * 20,
      delay: Math.random() * 10,
      opacity: 0.08 + Math.random() * 0.15,
    }));
  });

  return (
    <div className="fixed inset-0 overflow-hidden bg-black select-none">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, #1a0f08 0%, #0a0503 60%, #000 100%)',
        }}
      />

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 40% 60%, rgba(80,40,10,0.15), transparent 55%), radial-gradient(ellipse at 70% 30%, rgba(60,20,10,0.12), transparent 50%)',
          filter: 'blur(60px)',
        }}
        animate={{ x: [0, 40, -30, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <motion.span
            key={p.id}
            className="absolute rounded-full bg-amber-100"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              boxShadow: '0 0 6px rgba(255,200,140,0.5)',
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [p.opacity, p.opacity * 0.3, p.opacity],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 80%, rgba(0,0,0,0.95) 100%)',
        }}
      />

      <div className="relative z-10 h-full overflow-y-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center mb-12"
          >
            <p
              className="text-[10px] tracking-[0.5em] text-amber-700/70 mb-3 uppercase"
              style={{ fontFamily: 'serif' }}
            >
              STORIES
            </p>

            <h1
              className="text-5xl sm:text-7xl font-black tracking-wider mb-4"
              style={{
                fontFamily: 'serif',
                color: '#d4a760',
                textShadow: '0 0 40px rgba(212,167,96,0.5), 2px 2px 0 #000',
              }}
            >
              حكايات
            </h1>

            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-700/60" />
              <span className="text-amber-700/80 text-sm">✦</span>
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-700/60" />
            </div>

            <p
              className="text-sm text-neutral-400 max-w-md mx-auto"
              style={{ fontFamily: 'serif' }}
            >
              كل قصة... عالم مختلف
            </p>
          </motion.div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
            {stories.map((story, idx) => (
              <StoryCard
                key={story.id}
                story={story}
                index={idx}
                onClick={() => {
                  if (story.locked) return;
                  // ✅ بعت للـ App: "ابدأ القصة دي"
                  onExit('start', story.id);
                }}
              />
            ))}
          </div>

          {/* Exit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center"
          >
            <button
              onClick={() => onExit('close')}
              className="px-8 py-3 rounded-sm bg-transparent hover:bg-black/40 border border-neutral-800 hover:border-neutral-700 text-neutral-500 hover:text-neutral-400 text-sm transition-all tracking-wider"
              style={{ fontFamily: 'serif' }}
            >
              ✕ خروج
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StoryCard({ story, index, onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
      whileHover={!story.locked ? { scale: 1.03, y: -5 } : {}}
      whileTap={!story.locked ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={story.locked}
      className={`relative overflow-hidden rounded-lg border-2 transition-all text-right ${
        story.locked
          ? 'border-neutral-800 cursor-not-allowed opacity-50'
          : 'border-amber-900/40 hover:border-amber-700/70 cursor-pointer'
      }`}
      style={{
        background:
          'linear-gradient(180deg, rgba(20,15,10,0.95) 0%, rgba(10,5,3,0.98) 100%)',
        boxShadow: story.locked ? 'none' : '0 0 30px rgba(212,167,96,0.1)',
      }}
    >
      <div
        className="h-36 bg-neutral-900 relative overflow-hidden"
        style={{
          backgroundImage: story.cover ? `url(${story.cover})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(10,5,3,0.9) 100%)',
          }}
        />

        {story.locked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-4xl">🔒</span>
          </div>
        )}

        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-sm bg-black/70 backdrop-blur text-[10px] text-amber-400 border border-amber-700/40">
          {story.difficultyLabel}
        </div>
      </div>

      <div className="p-4">
        <h3
          className="text-lg font-bold text-amber-400 mb-1"
          style={{ fontFamily: 'serif' }}
        >
          {story.title}
        </h3>

        <p className="text-[10px] text-neutral-500 mb-3 tracking-widest">
          {story.subtitle}
        </p>

        <p className="text-xs text-neutral-400 leading-relaxed mb-4 line-clamp-2">
          {story.description}
        </p>

        <div className="flex items-center gap-3 text-[10px] text-neutral-500 border-t border-neutral-800 pt-3">
          <span>⏱️ {story.duration}</span>
          <span>🎬 {story.endingsCount} نهايات</span>
        </div>
      </div>
    </motion.button>
  );
}