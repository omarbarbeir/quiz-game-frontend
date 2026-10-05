import React from 'react';
// import { StoryProvider } from '../data/stories/StoryProvider';
import EscapeRoomApp from './EscapeRoomApp';
import { StoryProvider } from '../../data/stories/StoryProvider';
/**
 * Wrapper لتشغيل قصة معينة
 * بيلف الـ EscapeRoomApp في StoryProvider
 */
export default function StoryGame({ storyId, ...props }) {
  return (
    <StoryProvider storyId={storyId}>
      <EscapeRoomApp storyId={storyId} {...props} />
    </StoryProvider>
  );
}