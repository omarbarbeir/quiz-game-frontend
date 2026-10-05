// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import useEscapeStore from './store/useEscapeStore';
// import { playVoiceIfFirstTime } from './utils/VoiceClue';
// import storyData from '../../data/stories/story1_karim/storyData';
// import itemsData from '../../data/stories/story1_karim/itemsData';
// import { useStory } from '../../data/stories/StoryProvider';
// import TextDocument from './TextDocument';
// export default function Popup() {
//   const { activePopup, closePopup } = useEscapeStore();
//   const { itemsData } = useStory();

//   const [isFlipped, setIsFlipped] = useState(false);
//   useEffect(() => {
//     setIsFlipped(false);

//     // شغّل صوت الجد لو الحاجة أول مرة تتفتح
//     if (activePopup && activePopup.givesItem) {
//       const item = itemsData[activePopup.givesItem];
//       if (item && item.hasVoice) {
//         const voice = storyData.voiceClues[activePopup.givesItem];
//         if (voice?.audio) {
//           playVoiceIfFirstTime(activePopup.givesItem, voice.audio);
//         }
//       }
//     }
//   }, [activePopup]);

//   return (
//     <AnimatePresence>
//       {activePopup && (
//         <motion.div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           onClick={closePopup}
//         >
//           <motion.div
//             onClick={(e) => e.stopPropagation()}
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.9, opacity: 0 }}
//             transition={{ type: 'spring', damping: 25, stiffness: 300 }}
//             className="relative max-w-2xl w-full max-h-[90vh] overflow-auto rounded-2xl bg-neutral-900 border border-neutral-700 shadow-2xl"
//           >
//             <button
//               onClick={closePopup}
//               className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white"
//             >
//               ✕
//             </button>

//             {activePopup.type === 'document' && (
//               <img
//                 src={activePopup.content}
//                 alt="document"
//                 className="w-full h-auto rounded-2xl select-none"
//                 draggable={false}
//               />
//             )}

//             {activePopup.type === 'text_document' && (
//               <TextDocument item={activePopup.item} onClose={closePopup} />
//             )}

//             {activePopup.type === 'flippable_document' && (
//               <FlippableDocument
//                 front={activePopup.front}
//                 back={activePopup.back}
//                 isFlipped={isFlipped}
//                 setIsFlipped={setIsFlipped}
//               />
//             )}

//             {activePopup.type === 'container' && (
//               <div className="p-6 space-y-3">
//                 <h3 className="text-xl font-bold text-amber-400">
//                   {activePopup.title || 'الدرج مفتوح'}
//                 </h3>
//                 {activePopup.givesItem && (
//                   <motion.div
//                     initial={{ y: 20, opacity: 0 }}
//                     animate={{ y: 0, opacity: 1 }}
//                     className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300"
//                   >
//                     لقد وجدت: <b>{activePopup.givesItemName}</b>
//                   </motion.div>
//                 )}
//               </div>
//             )}
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }

// function FlippableDocument({ front, back, isFlipped, setIsFlipped }) {
//   return (
//     <div className="flex flex-col">
//       <div
//         className="relative w-full flex items-center justify-center p-4"
//         style={{ perspective: '1400px' }}
//       >
//         <motion.div
//           className="relative w-full"
//           style={{ transformStyle: 'preserve-3d' }}
//           animate={{ rotateY: isFlipped ? 180 : 0 }}
//           transition={{ duration: 0.7, ease: 'easeInOut' }}
//         >
//           <div className="w-full" style={{ backfaceVisibility: 'hidden' }}>
//             <img
//               src={front}
//               alt="front"
//               className="w-full h-auto rounded-2xl select-none"
//               draggable={false}
//             />
//           </div>

//           <div
//             className="absolute top-0 left-0 right-0 w-full"
//             style={{
//               backfaceVisibility: 'hidden',
//               transform: 'rotateY(180deg)',
//             }}
//           >
//             <img
//               src={back}
//               alt="back"
//               className="w-full h-auto rounded-2xl select-none"
//               draggable={false}
//             />
//           </div>
//         </motion.div>
//       </div>

//       <button
//         onClick={() => setIsFlipped((v) => !v)}
//         className="mx-auto mb-4 px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-colors"
//       >
//         🔄 {isFlipped ? 'اقلب للوجه' : 'اقلب للضهر'}
//       </button>
//     </div>
//   );
// }