import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from './store/useGameStore';

const INTERACTABLES = [
  // ✅ درج المكتب
  {
    id: 'desk_drawer',
    label: 'افتح الدرج',
    position: [-1.5, 0.5, -1.5],
    range: 2.5,
    dotThreshold: 0.7,
    ui: { type: 'puzzle', puzzleId: 'office_drawer_code' },
  },
  // ✅ الأوراق
  {
    id: 'desk_papers',
    label: 'اقرأ الأوراق',
    position: [-1.5, 0.85, -1.5],
    range: 2.5,
    dotThreshold: 0.7,
    ui: {
      type: 'document',
      title: 'أوراق على المكتب',
      content: `ورقة قديمة مكتوب عليها بخط يد مضطرب:

"٤ - ٨ - ٧ - ٢

افتكر الترتيب. متنساش.

لو أنا مش موجود، الكود هو ١٥١٠."`,
    },
  },
  // ❌ الدولاب مش موجود — لأنه شكله مقفول ومش منطقي نفتحه في الـ prototype
];

export default function InteractionSystem() {
  const { camera } = useThree();
  const setHovered = useGameStore((s) => s.setHovered);
  const lastHoveredId = useRef(null);

  useFrame(() => {
    let best = null;
    let bestScore = -1;

    for (const item of INTERACTABLES) {
      const targetPos = new THREE.Vector3(...item.position);
      const camPos = camera.position;

      const dist = camPos.distanceTo(targetPos);
      if (dist > item.range) continue;

      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);

      const toTarget = targetPos.clone().sub(camPos).normalize();
      const dot = dir.dot(toTarget);

      if (dot < item.dotThreshold) continue;

      const score = dot - dist * 0.1;
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    }

    const newId = best?.id || null;
    if (lastHoveredId.current !== newId) {
      lastHoveredId.current = newId;
      setHovered(best ? { id: best.id, label: best.label, ui: best.ui } : null);
    }
  });

  return null;
}