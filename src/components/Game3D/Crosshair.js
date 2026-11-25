import React from 'react';
import useGameStore from './store/useGameStore';

export default function Crosshair() {
  const hovered = useGameStore((s) => s.hovered);
  const isInteractive = !!hovered;
  const isDoor = hovered?.ui?.type === 'door';

  const color = !isInteractive
    ? 'bg-white/70'
    : isDoor
    ? 'bg-amber-400'
    : 'bg-emerald-400';

  const size = isInteractive ? 'w-3 h-3' : 'w-1.5 h-1.5';

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
      <div
        className={`${size} ${color} rounded-full transition-all duration-150
                    ring-1 ring-black/40`}
      />
    </div>
  );
}