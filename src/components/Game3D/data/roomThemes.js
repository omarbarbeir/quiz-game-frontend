/**
 * لوحة ألوان + mood لكل غرفة
 */

export const ROOM_THEMES = {
  karim_apartment: {
    floor: {
      color: '#a89078',
      roughness: 0.85,
      metalness: 0.0,
    },
    wall: {
      color: '#c8b898',
      roughness: 0.9,
      metalness: 0.0,
    },
    ceiling: {
      color: '#d0c8b8',
    },
    fog: {
      color: '#0a0805',
      near: 8,
      far: 28,
    },
    bg: '#0a0805',
  },
};

export const getTheme = (roomId) =>
  ROOM_THEMES[roomId] || ROOM_THEMES.karim_apartment;