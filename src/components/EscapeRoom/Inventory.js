// import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import useEscapeStore from './store/useEscapeStore';
// import itemsData from '../../data/stories/story1_karim/itemsData';
// import { playVoiceIfFirstTime } from './utils/VoiceClue';
// import storyData from '../../data/stories/story1_karim/storyData';
// import { useStory } from '../../data/stories/StoryProvider';

// export default function Inventory() {
//   const { itemsData } = useStory();
//   const {
//     isInventoryOpen,
//     toggleInventory,
//     inventory,
//     selectedItemId,
//     selectItem,
//     openPopup,
//   } = useEscapeStore();

//   const handleItemClick = (itemId) => {
//     const item = itemsData[itemId];
//     if (!item) return;

//     // لو العنصر عنده "viewable" → افتح الـ Popup علطول
//     if (item.viewable) {
//       openPopup({
//         type: item.viewable.type,
//         content: item.viewable.content,
//         front: item.viewable.front,
//         back: item.viewable.back,
//         item: item,
//       });

//       // شغّل صوت الجد (لو موجود وأول مرة)
//       if (item.hasVoice) {
//         const voice = storyData.voiceClues[itemId];
//         if (voice?.audio) {
//           playVoiceIfFirstTime(itemId, voice.audio);
//         }
//       }
//       return;
//     }

//     // ✅ لو الأداة كشاف → فعّله
//     if (itemId === 'flashlight') {
//       useEscapeStore.getState().setFlashlightOn(true);
//     }

//     // لو مش عنده viewable، اختاره للاستخدام على hotspot
//     const selected = selectedItemId === itemId;
//     selectItem(selected ? null : itemId);
//   };

//   return (
//     <AnimatePresence>
//       {isInventoryOpen && (
//         <>
//           <motion.div
//             className="fixed inset-0 bg-black/50 z-40"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={() => toggleInventory(false)}
//           />
//           <motion.div
//             className="fixed bottom-0 left-0 right-0 z-50 bg-neutral-900 border-t border-neutral-700 rounded-t-3xl max-h-[60vh] overflow-y-auto p-4"
//             initial={{ y: '100%' }}
//             animate={{ y: 0 }}
//             exit={{ y: '100%' }}
//             transition={{ type: 'spring', damping: 25, stiffness: 300 }}
//           >
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-lg font-bold text-amber-400">الحقيبة</h3>
//               <button
//                 onClick={() => toggleInventory(false)}
//                 className="w-8 h-8 rounded-full bg-neutral-800 text-white"
//               >
//                 ✕
//               </button>
//             </div>

//             {inventory.length === 0 ? (
//               <p className="text-neutral-500 text-center py-8">
//                 الحقيبة فاضية
//               </p>
//             ) : (
//               <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
//                 {inventory.map((itemId) => {
//                   const item = itemsData[itemId];
//                   if (!item) return null;
//                   const selected = selectedItemId === itemId;
//                   const isViewable = !!item.viewable;

//                   return (
//                     <motion.button
//                       key={itemId}
//                       whileTap={{ scale: 0.95 }}
//                       onClick={() => handleItemClick(itemId)}
//                       className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center gap-1 p-2 transition-all ${
//                         selected
//                           ? 'border-amber-400 bg-amber-400/10'
//                           : 'border-neutral-700 bg-neutral-800 hover:border-neutral-500'
//                       }`}
//                     >
//                       <span className="text-3xl select-none">{item.emoji}</span>
//                       <span className="text-[10px] text-center leading-tight text-neutral-200">
//                         {item.name}
//                       </span>

//                       {/* شارة صغيرة لو العنصر يتقرأ */}
//                       {isViewable && (
//                         <span className="absolute top-1 right-1 text-[8px] bg-amber-500 text-black px-1 rounded">
//                           اقرأ
//                         </span>
//                       )}
//                     </motion.button>
//                   );
//                 })}
//               </div>
//             )}

//             {selectedItemId && (
//               <p className="mt-4 text-xs text-amber-300 text-center">
//                 اخترت: {itemsData[selectedItemId]?.name} — اضغط على مكان في
//                 الغرفة لاستخدامها
//               </p>
//             )}

//             <p className="mt-3 text-[10px] text-neutral-500 text-center leading-relaxed">
//               💡 اضغط على أي حاجة عشان تقراها. الحاجات اللي عليها شارة "اقرأ"
//               هتفتح على طول.
//             </p>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }