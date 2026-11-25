import { create } from 'zustand';

/**
 * Store رئيسي للعبة 3D.
 * كل قصة = عالم جديد، لكن الأدوات والمنطق ثابتين.
 */
const useGameStore = create((set, get) => ({
  // ============ UI State ============
  hovered: null,
  activeUI: null,

  setHovered: (hovered) => set({ hovered }),
  setActiveUI: (activeUI) => set({ activeUI }),
  closeUI: () => set({ activeUI: null }),

  // ============ Inventory ============
  inventory: [],         // [{ id, name, icon, description, type }]
  equippedItem: null,    // id الأداة المستخدمة حالياً
  inventoryOpen: false,

  toggleInventory: () =>
    set((s) => ({ inventoryOpen: !s.inventoryOpen })),

  addItem: (item) =>
    set((s) => {
      if (s.inventory.find((i) => i.id === item.id)) return s;
      return { inventory: [...s.inventory, item] };
    }),

  removeItem: (itemId) =>
    set((s) => ({
      inventory: s.inventory.filter((i) => i.id !== itemId),
      equippedItem: s.equippedItem === itemId ? null : s.equippedItem,
    })),

  hasItem: (itemId) => get().inventory.some((i) => i.id === itemId),

  equipItem: (itemId) =>
    set((s) => ({
      equippedItem: s.equippedItem === itemId ? null : itemId,
    })),

  // ============ Flashlight ============
  flashlightOn: false,
  setFlashlightOn: (v) => set({ flashlightOn: v }),
  toggleFlashlight: () =>
    set((s) => ({ flashlightOn: !s.flashlightOn })),

  // ============ Reset (عند تغيير القصة) ============

  lighterOn: false,
  toggleLighter: () => set((state) => ({ lighterOn: !state.lighterOn })),


  resetStory: () =>
    set({
      inventory: [],
      equippedItem: null,
      flashlightOn: false,
      activeUI: null,
      hovered: null,
      inventoryOpen: false,
    }),
}));

export default useGameStore;