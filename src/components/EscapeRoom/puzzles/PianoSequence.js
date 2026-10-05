import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import audioEngine from '../audio/AudioEngine';

// نغمات البنتاتونيك (C D E G A) — جميلة ومريحة للأذن
const NOTES = [
  { freq: 261.63, color: '#3b82f6', label: 'أزرق' },
  { freq: 293.66, color: '#10b981', label: 'أخضر' },
  { freq: 329.63, color: '#f59e0b', label: 'أصفر' },
  { freq: 392.0, color: '#ef4444', label: 'أحمر' },
  { freq: 440.0, color: '#8b5cf6', label: 'بنفسجي' },
];

const MAX_ATTEMPTS = 3;
const LOCK_DURATION = 30;

export default function PianoSequence({ puzzle, onSubmit, onHint }) {
  const sequence = puzzle.sequence || [3, 2, 5, 1, 4];
  const [input, setInput] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [replaysLeft, setReplaysLeft] = useState(2);
  const [status, setStatus] = useState('idle');
  const [countdown, setCountdown] = useState(0);
  const playTimers = useRef([]);

  // شغّل التسلسل عند فتح اللغز
  useEffect(() => {
    setTimeout(() => playSequence(), 500);
    return () => {
      playTimers.current.forEach((t) => clearTimeout(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // عداد القفل
  useEffect(() => {
    if (!isLocked) return;
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setIsLocked(false);
        setAttempts(0);
        setInput([]);
        setReplaysLeft(2);
        setStatus('idle');
        setCountdown(0);
      } else {
        setCountdown(remaining);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isLocked, lockedUntil]);

  const playNote = (noteIndex, duration = 500) => {
    const note = NOTES[noteIndex - 1];
    if (!note) return;
    console.log('🎵 playTone:', note.freq, duration);
    audioEngine.playTone(note.freq, duration);
    setActiveNote(noteIndex);
    setTimeout(() => setActiveNote(null), duration);
  };

  const playSequence = () => {
    if (isPlaying || isLocked) return;
    setIsPlaying(true);
    setActiveNote(null);
    playTimers.current.forEach((t) => clearTimeout(t));
    playTimers.current = [];

    sequence.forEach((note, idx) => {
      const t = setTimeout(() => {
        playNote(note, 450);
      }, idx * 550);
      playTimers.current.push(t);
    });

    const endT = setTimeout(() => {
      setIsPlaying(false);
    }, sequence.length * 550 + 200);
    playTimers.current.push(endT);
  };

  const handleKeyPress = (noteIndex) => {
    if (isPlaying || isLocked || status === 'correct') return;

    playNote(noteIndex, 350);
    const newInput = [...input, noteIndex];
    setInput(newInput);

    const currentPos = newInput.length - 1;
    if (newInput[currentPos] !== sequence[currentPos]) {
      setStatus('wrong');
      setTimeout(() => {
        setInput([]);
        setStatus('idle');
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= MAX_ATTEMPTS) {
          setIsLocked(true);
          setLockedUntil(Date.now() + LOCK_DURATION * 1000);
        }
      }, 600);
      return;
    }

    if (newInput.length === sequence.length) {
      setStatus('correct');
      setTimeout(() => {
        onSubmit(sequence.join(''));
      }, 700);
    }
  };

  const handleReplay = () => {
    if (replaysLeft <= 0 || isPlaying || isLocked) return;
    setReplaysLeft(replaysLeft - 1);
    setInput([]);
    setStatus('idle');
    playSequence();
  };

  return (
    <div className="p-6 space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-amber-400">🎵 {puzzle.title}</h2>
        <p className="text-xs text-neutral-400 mt-2">
          {isLocked
            ? `🔒 اللغز مقفول — استنى ${countdown} ثانية`
            : status === 'wrong'
            ? '❌ نغمة غلط'
            : status === 'correct'
            ? '✅ لحن صحيح!'
            : isPlaying
            ? '🎶 اسمع اللحن...'
            : 'اعزف نفس اللحن'}
        </p>
      </div>

      <div className="flex justify-center gap-3">
        {Array.from({ length: sequence.length }).map((_, i) => {
          const noteIdx = input[i];
          const note = noteIdx ? NOTES[noteIdx - 1] : null;
          return (
            <div
              key={i}
              className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all"
              style={{
                borderColor: note ? note.color : '#525252',
                backgroundColor: note ? note.color + '40' : 'transparent',
              }}
            >
              {noteIdx && (
                <div
                  className="w-5 h-5 rounded-full"
                  style={{ backgroundColor: note.color }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-5 gap-2 max-w-md mx-auto">
        {NOTES.map((note, idx) => {
          const num = idx + 1;
          const isActive = activeNote === num;
          return (
            <motion.button
              key={num}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleKeyPress(num)}
              disabled={isPlaying || isLocked}
              className="aspect-square rounded-xl transition-all flex items-center justify-center relative overflow-hidden"
              style={{
                backgroundColor: note.color,
                opacity: isLocked ? 0.3 : 1,
                boxShadow: isActive
                  ? `0 0 30px ${note.color}, 0 0 60px ${note.color}80`
                  : 'none',
                transform: isActive ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              <span className="text-3xl font-bold text-white/90 drop-shadow-lg">
                {num}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleReplay}
          disabled={replaysLeft <= 0 || isPlaying || isLocked}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            replaysLeft <= 0 || isPlaying || isLocked
              ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
              : 'bg-neutral-800 hover:bg-neutral-700 text-amber-300'
          }`}
        >
          🎧 اسمع تاني ({replaysLeft})
        </button>
        <button
          onClick={() => setInput([])}
          disabled={isPlaying || isLocked || input.length === 0}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
            isPlaying || isLocked || input.length === 0
              ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
              : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
          }`}
        >
          🗑️ مسح
        </button>
      </div>

      <div className="flex justify-center gap-2">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < attempts ? 'bg-red-500' : 'bg-neutral-700'
            }`}
          />
        ))}
      </div>

      <button
        onClick={onHint}
        disabled={isLocked}
        className="w-full text-sm text-amber-400 underline disabled:opacity-40"
      >
        طلب تلميح
      </button>
    </div>
  );
}