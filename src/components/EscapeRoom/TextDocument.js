import React from 'react';
import { motion } from 'framer-motion';

export default function TextDocument({ item, onClose }) {
  if (!item || !item.viewable) {
    return (
      <div className="p-6 text-center text-neutral-400">
        لا يوجد محتوى
      </div>
    );
  }
  const { viewable } = item;

  return (
    <motion.div
      className="relative w-full max-h-[85vh] overflow-y-auto rounded-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* الخلفية: صورة الورقة القديمة */}
      <div className="relative min-h-[500px]">
        {/* الصورة كخلفية + blur + overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${viewable.image})`,
            filter: 'blur(2px) brightness(0.85)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(240,230,210,0.88) 0%, rgba(230,215,185,0.92) 50%, rgba(220,200,170,0.95) 100%)',
          }}
        />

        {/* المحتوى النصي */}
        <div className="relative z-10 p-8 sm:p-12">
          {/* التاريخ */}
          {viewable.date && (
            <p
              className="text-right text-sm text-amber-900/80 mb-4 font-bold"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              {viewable.date}
            </p>
          )}

          {/* العنوان */}
          {viewable.title && (
            <h2
              className="text-center text-2xl sm:text-3xl text-amber-950 mb-8 font-bold tracking-wide"
              style={{ fontFamily: "'Aref Ruqaa', 'Amiri', serif" }}
            >
              {viewable.title}
            </h2>
          )}

          {/* خط فاصل زخرفي */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-20 h-px bg-amber-900/40" />
            <span className="text-amber-800 text-sm">✦</span>
            <div className="w-20 h-px bg-amber-900/40" />
          </div>

          {/* النص */}
          <div
            className="text-amber-950 leading-loose text-lg whitespace-pre-line"
            style={{
              fontFamily: "'Amiri', serif",
              textAlign: 'right',
              direction: 'rtl',
            }}
          >
            {viewable.content}
          </div>

          {/* توقيع */}
          {viewable.signature && (
            <p
              className="text-left text-amber-900/80 mt-8 italic"
              style={{ fontFamily: "'Aref Ruqaa', serif" }}
            >
              — {viewable.signature}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}