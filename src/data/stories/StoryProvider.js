import React, { createContext, useContext, useMemo } from 'react';

import hospitalStory from './story1_hospital/storyData';
import hospitalRooms from './story1_hospital/roomsData';
import hospitalPuzzles from './story1_hospital/puzzlesData';
import hospitalItems from './story1_hospital/itemsData';
import hospitalConfig from './story1_hospital/config';

const STORY_REGISTRY = {
  hospital: {
    id: 'hospital',
    storyData: hospitalStory,
    roomsData: hospitalRooms,
    puzzlesData: hospitalPuzzles,
    itemsData: hospitalItems,
    config: hospitalConfig,
  },
};

const StoryContext = createContext(null);

export function StoryProvider({ storyId, children }) {
  const value = useMemo(() => {
    const data = STORY_REGISTRY[storyId];
    if (!data) {
      console.error(`Story "${storyId}" not found`);
      return null;
    }
    return { ...data, storyId };
  }, [storyId]);

  if (!value) {
    return (
      <div className="fixed inset-0 bg-black text-white flex items-center justify-center">
        <p>القصة غير موجودة: {storyId}</p>
      </div>
    );
  }

  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>;
}

export function useStory() {
  const ctx = useContext(StoryContext);
  if (!ctx) throw new Error('useStory must be used inside <StoryProvider>');
  return ctx;
}

export function getStoryRegistry() {
  return STORY_REGISTRY;
}