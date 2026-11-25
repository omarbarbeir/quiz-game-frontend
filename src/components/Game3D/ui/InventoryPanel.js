import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store/useGameStore';

export default function InventoryPanel() {
  const inventory = useGameStore((s) => s.inventory);
  const equippedItem = useGameStore((s) => s.equippedItem);
  const equipItem = useGameStore((s) => s.equipItem);
  const close = () => useGameStore.getState().toggleInventory();

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ type: 'spring', damping: 25 }}
      className="absolute top-0 right-0 h-full w-80 z-40 
                 bg-black/85 backdrop-blur-md border-l border-amber-500/30
                 flex flex-col text-white"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-amber-500/20">
        <h2 className="text-amber-400 font-bold text-lg">🎒 الشنطة</h2>
        <button
          onClick={close}
          className="text-neutral-400 hover:text-white text-2xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {inventory.length === 0 ? (
          <p className="text-center text-neutral-500 text-sm mt-8">
            الشنطة فاضية
          </p>
        ) : (
          inventory.map((item) => {
            const isEquipped = equippedItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => equipItem(item.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg border text-right
                  transition-all
                  ${
                    isEquipped
                      ? 'bg-amber-500/20 border-amber-500/60'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
              >
                <div className="text-3xl shrink-0">{item.icon || '📦'}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                      {item.description}
                    </div>
                  )}
                  {isEquipped && (
                    <div className="text-[10px] text-amber-400 mt-1 font-bold">
                      ✦ مُفعّل
                    </div>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-amber-500/20 text-xs text-neutral-500 text-center">
        I / Tab للإغلاق · اضغط على الأداة لتفعيلها
      </div>
    </motion.div>
  );
}