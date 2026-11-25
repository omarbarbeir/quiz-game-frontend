import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from './store/useGameStore';

export default function DoorSystem({ doors = [] }) {
  const { camera } = useThree();
  const setHovered = useGameStore((s) => s.setHovered);
  const lastId = useRef(null);

  useFrame(() => {
    let best = null;
    let bestScore = -1;

    doors.forEach((door) => {
      const pos = new THREE.Vector3(...door.position);
      const dist = camera.position.distanceTo(pos);
      if (dist > 3) return;

      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      const toTarget = pos.clone().sub(camera.position).normalize();
      const dot = dir.dot(toTarget);

      if (dot < 0.5) return;

      const score = dot - dist * 0.1;
      if (score > bestScore) {
        bestScore = score;
        best = door;
      }
    });

    const newId = best?.id || null;
    if (lastId.current !== newId) {
      lastId.current = newId;
      setHovered(
        best
          ? {
              id: best.id,
              label: `ادخل ${best.label}`,
              ui: {
                type: 'door',
                targetRoom: best.targetRoom,
                doorId: best.id,
              },
            }
          : null
      );
    }
  });

  return null;
}