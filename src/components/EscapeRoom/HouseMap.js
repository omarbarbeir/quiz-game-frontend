// import React from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import useEscapeStore from './store/useEscapeStore';
// import roomsData from '../../data/stories/story1_karim/roomsData';
// import { useStory } from '../../data/stories/StoryProvider';

// /**
//  * ============================================================
//  *  HouseMap
//  *  خريطة البيت — تعرض الغرف والتنقل بينهم
//  * ============================================================
//  */

// // إحداثيات كل غرفة على الخريطة (نسبة من عرض/طول الشاشة)
// const MAP_POSITIONS = {
//   living:    { x: 50, y: 50, label: 'الصالة',   icon: '🛋️' },
//   library:   { x: 15, y: 35, label: 'المكتبة',  icon: '📚' },
//   kitchen:   { x: 85, y: 35, label: 'المطبخ',   icon: '🍳' },
//   bedroom:   { x: 22, y: 75, label: 'غرفة النوم', icon: '🛏️' },
//   bathroom:  { x: 15, y: 90, label: 'الحمام',   icon: '🚿' },
//   workshop:  { x: 75, y: 75, label: 'الورشة',   icon: '🔧' },
//   basement:  { x: 65, y: 92, label: 'القبو',    icon: '🕳️' },
//   garage:    { x: 92, y: 92, label: 'الجراج',   icon: '🚗' },
//   rooftop:   { x: 50, y: 12, label: 'السطح',    icon: '🌙' },
// };

// // الروابط بين الغرف
// const MAP_CONNECTIONS = [
//   ['living', 'library'],
//   ['living', 'kitchen'],
//   ['living', 'bedroom'],
//   ['living', 'workshop'],
//   ['living', 'rooftop'],
//   ['bedroom', 'bathroom'],
//   ['workshop', 'basement'],
//   ['workshop', 'garage'],
// ];

// export default function HouseMap({ onClose, onNavigate }) {
//   const { roomsData } = useStory();
//   const { currentRoomId, solvedPuzzles } = useEscapeStore();

//   const currentRoom = roomsData[currentRoomId];

//   // الغرف اللي اللاعب يقدر يوصلها من الغرفة الحالية
//   const accessibleRooms = new Set(
//     (currentRoom?.connections || []).map((c) => c.to)
//   );
//   accessibleRooms.add(currentRoomId); // الغرفة الحالية

//   // الغرف اللي اتزارت (نعتبرها اللي فيها hotspots مفتوحة أو اللاعب فيها)
//   const visitedRooms = new Set([currentRoomId]);

//   return (
//     <AnimatePresence>
//       <motion.div
//         className="fixed inset-0 z-[55] bg-black/90 backdrop-blur-md flex items-center justify-center"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         exit={{ opacity: 0 }}
//         onClick={onClose}
//       >
//         <motion.div
//           onClick={(e) => e.stopPropagation()}
//           initial={{ scale: 0.9, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.9, opacity: 0 }}
//           transition={{ type: 'spring', damping: 25, stiffness: 300 }}
//           className="w-[95vw] max-w-4xl h-[85vh] rounded-2xl bg-neutral-950 border-2 border-amber-900/40 overflow-hidden relative"
//           style={{
//             boxShadow: '0 0 60px rgba(0,0,0,0.9), inset 0 0 100px rgba(212,167,96,0.05)',
//           }}
//         >
//           {/* Header */}
//           <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20 bg-gradient-to-b from-neutral-950 to-transparent">
//             <h3
//               className="text-xl font-bold text-amber-400"
//               style={{ fontFamily: 'serif' }}
//             >
//               🗺️ خريطة البيت
//             </h3>
//             <button
//               onClick={onClose}
//               className="w-9 h-9 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white"
//             >
//               ✕
//             </button>
//           </div>

//           {/* الخريطة */}
//           <div className="relative w-full h-full p-8 pt-16">
//             {/* SVG للروابط */}
//             <svg
//               className="absolute inset-0 w-full h-full pointer-events-none"
//               style={{ padding: '4rem 2rem' }}
//             >
//               {MAP_CONNECTIONS.map(([a, b]) => {
//                 const posA = MAP_POSITIONS[a];
//                 const posB = MAP_POSITIONS[b];
//                 if (!posA || !posB) return null;

//                 const isActive =
//                   (a === currentRoomId && accessibleRooms.has(b)) ||
//                   (b === currentRoomId && accessibleRooms.has(a));

//                 return (
//                   <line
//                     key={`${a}-${b}`}
//                     x1={`${posA.x}%`}
//                     y1={`${posA.y}%`}
//                     x2={`${posB.x}%`}
//                     y2={`${posB.y}%`}
//                     stroke={isActive ? '#d4a760' : '#3f3f46'}
//                     strokeWidth={isActive ? 2 : 1}
//                     strokeDasharray={isActive ? '0' : '4 4'}
//                     opacity={isActive ? 0.8 : 0.4}
//                   />
//                 );
//               })}
//             </svg>

//             {/* الغرف */}
//             {Object.entries(MAP_POSITIONS).map(([roomId, pos]) => {
//               const isCurrent = roomId === currentRoomId;
//               const isAccessible = accessibleRooms.has(roomId);
//               const room = roomsData[roomId];

//               return (
//                 <motion.button
//                   key={roomId}
//                   onClick={() => {
//                     if (isCurrent || !isAccessible) return;
//                     // ابحث عن connection
//                     const conn = (currentRoom?.connections || []).find(
//                       (c) => c.to === roomId
//                     );
//                     if (conn) {
//                       onNavigate(roomId);
//                       onClose();
//                     }
//                   }}
//                   disabled={!isAccessible || isCurrent}
//                   className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all"
//                   style={{
//                     left: `${pos.x}%`,
//                     top: `${pos.y}%`,
//                     cursor: isAccessible && !isCurrent ? 'pointer' : 'default',
//                   }}
//                 >
//                   {/* الدايرة */}
//                   <div
//                     className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center transition-all ${
//                       isCurrent
//                         ? 'border-amber-400 bg-amber-500/30'
//                         : isAccessible
//                         ? 'border-amber-600/70 bg-neutral-900 hover:bg-amber-900/40'
//                         : 'border-neutral-700 bg-neutral-900/50'
//                     }`}
//                     style={{
//                       boxShadow: isCurrent
//                         ? '0 0 30px rgba(212,167,96,0.7)'
//                         : isAccessible
//                         ? '0 0 15px rgba(212,167,96,0.3)'
//                         : 'none',
//                     }}
//                   >
//                     <span
//                       className={`text-2xl sm:text-3xl ${
//                         isAccessible ? '' : 'opacity-30 grayscale'
//                       }`}
//                     >
//                       {pos.icon}
//                     </span>

//                     {isCurrent && (
//                       <motion.div
//                         className="absolute -inset-1 rounded-full border border-amber-400/50"
//                         animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
//                         transition={{ duration: 2, repeat: Infinity }}
//                       />
//                     )}

//                   </div>

//                   {/* الاسم */}
//                   <span
//                     className={`text-[10px] sm:text-xs font-bold tracking-wide whitespace-nowrap ${
//                       isCurrent
//                         ? 'text-amber-400'
//                         : isAccessible
//                         ? 'text-neutral-300'
//                         : 'text-neutral-600'
//                     }`}
//                     style={{ fontFamily: 'serif' }}
//                   >
//                     {pos.label}
//                   </span>

//                   {isCurrent && (
//                     <span className="text-[8px] text-amber-500/80">أنت هنا</span>
//                   )}
//                 </motion.button>
//               );
//             })}
//           </div>

//           {/* Footer */}
//           <div className="absolute bottom-0 left-0 right-0 p-3 text-center text-xs text-neutral-500 bg-gradient-to-t from-neutral-950 to-transparent">
//             اضغط على أي غرفة للتنقل · الغرف المقفولة تظهر بالرمادي
//           </div>
//         </motion.div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }