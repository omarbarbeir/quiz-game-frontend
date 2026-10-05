// import React from 'react';
// import CodeLock from './CodeLock';
// import SoundSequence from './SoundSequence';
// import PianoSequence from './PianoSequence';
// import puzzlesData from '../../../data/stories/story1_karim/puzzlesData';
// import { useStory } from '../../../data/stories/StoryProvider';

// export default function PuzzleRenderer({ puzzleId, onSubmit, onHint }) {
//   const { puzzlesData } = useStory()
//   const puzzle = puzzlesData[puzzleId];
//   if (!puzzle) return <p className="p-6 text-white">نوع اللغز غير مدعوم</p>;

//   switch (puzzle.type) {
//     case 'code_lock':
//       return <CodeLock puzzle={puzzle} onSubmit={onSubmit} onHint={onHint} />;
//     case 'sound_sequence':
//       return <SoundSequence puzzle={puzzle} onSubmit={onSubmit} onHint={onHint} />;
//     case 'piano_sequence':
//       return <PianoSequence puzzle={puzzle} onSubmit={onSubmit} onHint={onHint} />;
//     default:
//       return <p className="p-6 text-white">نوع اللغز غير مدعوم</p>;
//   }
// }