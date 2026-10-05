import React from 'react';
import { motion } from 'framer-motion';

export default function StorySelector({ story, onBack, onStart }) {
  return (
    <div className="fixed inset-0 overflow-hidden bg-black select-none">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, #1a0f08 0%, #0a0503 60%, #000 100%)',
        }}
      />

      {story.cover && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${story.cover})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(20px)',
          }}
        />
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.9) 80%)',
        }}
      />

      <div className="relative z-10 h-full overflow-y-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="mb-8 px-4 py-2 rounded-sm bg-black/60 border border-neutral-800 text-neutral-400 hover:text-amber-400 hover:border-amber-700/40 text-sm transition-all"
            style={{ fontFamily: 'serif' }}
          >
            ← رجوع للقصص
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-right mb-8"
          >
            <p
              className="text-[10px] tracking-[0.4em] text-amber-700/70 mb-2 uppercase"
              style={{ fontFamily: 'serif' }}
            >
              {story.genre}
            </p>
            <h1
              className="text-4xl sm:text-5xl font-black tracking-wider text-amber-400 mb-2"
              style={{
                fontFamily: 'serif',
                textShadow: '0 0 30px rgba(212,167,96,0.4)',
              }}
            >
              {story.title}
            </h1>
            <p className="text-sm text-neutral-500 tracking-widest">
              {story.subtitle}
            </p>
          </motion.div>

          {story.cover && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mb-8 rounded-lg overflow-hidden border border-amber-900/40"
              style={{ boxShadow: '0 0 40px rgba(212,167,96,0.15)' }}
            >
              <img src={story.cover} alt={story.title} className="w-full h-auto" />
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-neutral-300 leading-loose text-base mb-8 text-right"
            style={{ fontFamily: 'serif' }}
          >
            {story.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10"
          >
            <StatBox label="الصعوبة" value={story.difficultyLabel} />
            <StatBox label="المدة" value={story.duration} />
            <StatBox label="الفصول" value={`${story.chaptersCount}`} />
            <StatBox label="النهايات" value={`${story.endingsCount}`} />
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            onClick={() => onStart(story.id)}
            className="w-full py-4 rounded-sm text-black font-bold text-lg transition-all border-2 border-amber-900/60 tracking-wider"
            style={{
              background:
                'linear-gradient(180deg, #e0b060 0%, #b8863c 50%, #8a5f28 100%)',
              fontFamily: 'serif',
              boxShadow: '0 0 30px rgba(212,167,96,0.35)',
            }}
          >
            🚪 ابدأ القصة
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-lg bg-black/50 border border-amber-900/30 p-3 text-center">
      <p className="text-[10px] text-neutral-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-amber-400" style={{ fontFamily: 'serif' }}>
        {value}
      </p>
    </div>
  );
}