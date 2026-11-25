import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from './store/useGameStore';

const APARTMENT_DOORS = [
  { id: 'Bath_Door', position: [1.5412, 1.0618, 1.607], label: 'باب الحمام' },
  { id: 'Room_Door', position: [-3.6165, 1.061, -2.0495], label: 'غرفة النوم' },
  { id: 'Main_Door', position: [-10.047, 1.0891, -8.9864], label: 'الباب الرئيسي' },
];

const HALLWAY_DOORS = [
  { id: 'door_to_karim', position: [-0.5, 1.1, 0.01], label: 'شقة كريم' },
  { id: 'door_to_sami', position: [1.17, 1.1, 5.48], label: 'شقة سامي' },
  { id: 'door_to_rashdy', position: [0.50, 1.11, 10], label: 'شقة رشدي' },
  { id: 'Street_Door', position: [1.336, -4.753, 4.771], label: 'الخروج للشارع' }
];

export default function DetectionSystem({ roomId }) {
  const { camera } = useThree();
  const setHovered = useGameStore((s) => s.setHovered);
  const lastId = useRef(null);

  useFrame(() => {
    let best = null;
    let bestDist = Infinity;
    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir);

    const inventory = useGameStore.getState().inventory;
    const hasFlashlight = inventory.some((i) => i.id === 'flashlight');
    const hasLighter = inventory.some((i) => i.id === 'lighter');

    // 🔴 فحص أبواب الشقة (بس لو إحنا في الشقة)
    if (roomId === 'karim_apartment') {
      APARTMENT_DOORS.forEach((door) => {
        const doorPos = new THREE.Vector3(...door.position);
        const dist = camera.position.distanceTo(doorPos);
        if (dist < 3.0) {
          const toDoor = doorPos.clone().sub(camera.position).normalize();
          const dot = camDir.dot(toDoor);
          if (dot > 0.5 && dist < bestDist) {
            bestDist = dist;
            best = { id: 'door_interaction', label: `افتح ${door.label}`, ui: { type: 'door', doorId: door.id } };
          }
        }
      });

      // فحص الأدوات (في الشقة بس)
      if (!hasFlashlight) {
        const flashlightPos = new THREE.Vector3(9.42, 1.23, -8.29); 
        const distToFlashlight = camera.position.distanceTo(flashlightPos);
        if (distToFlashlight < 2.5) {
          const toFlashlight = flashlightPos.clone().sub(camera.position).normalize();
          const dot = camDir.dot(toFlashlight);
          if (dot > 0.6 && distToFlashlight < bestDist) {
            bestDist = distToFlashlight;
            best = { id: 'pickup_flashlight', label: 'التقط الكشاف', ui: { type: 'pickup' } };
          }
        }
      }

      if (!hasLighter) {
        const lighterPos = new THREE.Vector3(9.4233, 1.4, -7.517); 
        const distToLighter = camera.position.distanceTo(lighterPos);
        if (distToLighter < 2.5) {
          const toLighter = lighterPos.clone().sub(camera.position).normalize();
          const dot = camDir.dot(toLighter);
          if (dot > 0.6 && distToLighter < bestDist) {
            bestDist = distToLighter;
            best = { id: 'pickup_lighter', label: 'التقط الولاعة', ui: { type: 'pickup' } };
          }
        }
      }
    }

    // 🔴 فحص أبواب الممر (بس لو إحنا في الممر)
    if (roomId === 'building_hallway') {
      HALLWAY_DOORS.forEach((door) => {
        const doorPos = new THREE.Vector3(...door.position);
        const dist = camera.position.distanceTo(doorPos);
        if (dist < 3.0) {
          const toDoor = doorPos.clone().sub(camera.position).normalize();
          const dot = camDir.dot(toDoor);
          if (dot > 0.5 && dist < bestDist) {
            bestDist = dist;
            best = { id: 'door_interaction', label: `افتح ${door.label}`, ui: { type: 'door', doorId: door.id } };
          }
        }
      });
    }

    const newId = best?.id || null;
    if (lastId.current !== newId || (best && best.ui?.doorId !== useGameStore.getState().hovered?.ui?.doorId)) {
      lastId.current = newId;
      setHovered(best);
    }
  });

  return null;
}