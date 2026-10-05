import { create } from 'zustand';

const useEscapeStore = create((set) => ({
  phase: 'lobby',
  currentRoomId: null,
  inventory: [],
  solvedPuzzles: {},
  openedContainers: {},
  hintsUsed: {},
  players: [],

  controlMode: 'drag',
  gyroPermission: 'idle',
  activePopup: null,
  activePuzzle: null,
  isTransitioning: false,
  transitionTarget: null,
  isInventoryOpen: false,
  isSettingsOpen: false,
  isHintOpen: false,
  selectedItemId: null,

  // ✅ الظلام + الكشاف
  darkMode: false,
  flashlightOn: true,
  hasFlashlight: false,
  flashlightPos: { x: 50, y: 50 },

  setPhase: (phase) => set({ phase }),
  setCurrentRoom: (roomId) => set({ currentRoomId: roomId }),

  setStateFromServer: (s) =>
    set({
      phase: s.phase,
      currentRoomId: s.me?.roomId || s.currentRoomId,
      inventory: s.inventory || [],
      solvedPuzzles: s.solvedPuzzles || {},
      openedContainers: s.openedContainers || {},
      hintsUsed: s.hintsUsed || {},
      players: s.players || [],
    }),

  setControlMode: (mode) => set({ controlMode: mode }),
  setGyroPermission: (p) => set({ gyroPermission: p }),

  openPopup: (popup) => set({ activePopup: popup }),
  closePopup: () => set({ activePopup: null }),

  openPuzzle: (puzzle) => set({ activePuzzle: puzzle }),
  closePuzzle: () => set({ activePuzzle: null }),

  beginTransition: (targetRoomId) =>
    set({ isTransitioning: true, transitionTarget: targetRoomId }),
  endTransition: () =>
    set({ isTransitioning: false, transitionTarget: null }),

  toggleInventory: (v) =>
    set((s) => ({ isInventoryOpen: v ?? !s.isInventoryOpen })),
  toggleSettings: (v) =>
    set((s) => ({ isSettingsOpen: v ?? !s.isSettingsOpen })),
  toggleHint: (v) => set((s) => ({ isHintOpen: v ?? !s.isHintOpen })),

  selectItem: (id) => set({ selectedItemId: id }),
  clearSelectedItem: () => set({ selectedItemId: null }),

  // ✅ Dark Mode
  setDarkMode: (v) => set({ darkMode: v }),

  // ✅ Flashlight
  setFlashlightOn: (v) => set({ flashlightOn: v }),
  toggleFlashlight: () => set((s) => ({ flashlightOn: !s.flashlightOn })),

  // ✅ Light mode (weak lighter / strong flashlight)
  setHasFlashlight: (v) => set({ hasFlashlight: v }),

  setFlashlightPos: (pos) => set({ flashlightPos: pos }),
}));

export default useEscapeStore;