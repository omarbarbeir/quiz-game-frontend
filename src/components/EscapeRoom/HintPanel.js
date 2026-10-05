import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useEscapeStore from './store/useEscapeStore';
import roomsData from '../../data/stories/story1_karim/roomsData';
import puzzlesData from '../../data/stories/story1_karim/puzzlesData';
import audioEngine from './audio/AudioEngine';
import { useStory } from '../../data/stories/StoryProvider';

const MAX_HINTS_PER_PUZZLE = 3;

export default function HintPanel({ socket, roomCode }) {
  const { roomsData, puzzlesData } = useStory();
  const {
    isHintOpen,
    toggleHint,
    currentRoomId,
    solvedPuzzles,
    hintsUsed,
    activePuzzle,
  } = useEscapeStore();

  const [toast, setToast] = useState(null);

  useEffect(() => {
    const onHint = ({ puzzleId, hint, level }) => {
      setToast({ puzzleId, hint, level });
      setTimeout(() => setToast(null), 4000);
    };
    socket.on('er_hint', onHint);
    return () => socket.off('er_hint', onHint);
  }, [socket]);

  const roomPuzzles = useMemo(() => {
    const room = roomsData[currentRoomId];
    if (!room) return [];
    const ids = new Set();
    room.hotspots.forEach((h) => {
      if (h.puzzleId) ids.add(h.puzzleId);
    });
    return Array.from(ids)
      .map((id) => puzzlesData[id])
      .filter(Boolean)
      .filter((p) => !solvedPuzzles[p.id]);
  }, [currentRoomId, solvedPuzzles]);

  const requestHint = (puzzleId) => {
    const used = hintsUsed[puzzleId] || 0;
    const puzzle = puzzlesData[puzzleId];
    if (!puzzle) return;
    if (used >= MAX_HINTS_PER_PUZZLE) return;
    socket.emit('er_request_hint', { roomCode, puzzleId });
    audioEngine.playSfx('/audio/sfx/hint.ogg', 0.5);
  };

  const stats = useMemo(
    () => ({
      solved: Object.keys(solvedPuzzles).length,
      totalHints: Object.values(hintsUsed).reduce((a, b) => a + b, 0),
    }),
    [solvedPuzzles, hintsUsed]
  );

  return (
    <>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-amber-500 text-black px-4 py-2 rounded-xl text-sm font-bold shadow-lg max-w-[90vw]"
          >
            💡 {toast.hint}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHintOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleHint(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-neutral-900 border border-neutral-700 p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-amber-400">💡 التلميحات</h3>
                <button
                  onClick={() => toggleHint(false)}
                  className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-neutral-800 p-3">
                  <p className="text-2xl font-bold text-emerald-400">
                    {stats.solved}
                  </p>
                  <p className="text-xs text-neutral-400">ألغاز محلولة</p>
                </div>
                <div className="rounded-xl bg-neutral-800 p-3">
                  <p className="text-2xl font-bold text-amber-400">
                    {stats.totalHints}
                  </p>
                  <p className="text-xs text-neutral-400">تلميحات مستخدمة</p>
                </div>
              </div>

              {roomPuzzles.length === 0 ? (
                <p className="text-neutral-500 text-center py-6 text-sm">
                  مفيش ألغاز محتاجة تلميح هنا حاليًا 👌
                </p>
              ) : (
                <div className="space-y-3">
                  {roomPuzzles.map((puzzle) => (
                    <PuzzleHintRow
                      key={puzzle.id}
                      puzzle={puzzle}
                      used={hintsUsed[puzzle.id] || 0}
                      isActive={activePuzzle?.puzzleId === puzzle.id}
                      onRequest={() => requestHint(puzzle.id)}
                    />
                  ))}
                </div>
              )}

              <p className="text-[11px] text-neutral-500 text-center leading-relaxed">
                كل تلميح بيقلل من تقييم الفريق في النهاية، ففكروا قبل ما تطلبوا.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function PuzzleHintRow({ puzzle, used, isActive, onRequest }) {
  const maxHints = MAX_HINTS_PER_PUZZLE;
  const isExhausted = used >= maxHints;

  return (
    <div
      className={`rounded-xl border p-3 transition-colors ${
        isActive
          ? 'border-amber-400 bg-amber-400/5'
          : 'border-neutral-700 bg-neutral-800/60'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="font-bold text-sm text-neutral-100">{puzzle.title}</p>
        <div className="flex gap-1">
          {Array.from({ length: maxHints }).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < used ? 'bg-amber-400' : 'bg-neutral-700'
              }`}
            />
          ))}
        </div>
      </div>

      {!isExhausted ? (
        <button
          onClick={onRequest}
          className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-colors"
        >
          {used === 0 ? 'اطلب تلميح' : `اطلب تلميح (${used}/${maxHints})`}
        </button>
      ) : (
        <p className="text-center text-xs text-neutral-500 py-2">
          استنفدت كل التلميحات لهذا اللغز
        </p>
      )}
    </div>
  );
}