import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { PointerLockControls } from '@react-three/drei';
import { AnimatePresence } from 'framer-motion';

import RoomRenderer from './scene/RoomRenderer';
import DetectionSystem from './DetectionSystem';
import Player from './Player';
import Lighting from './Lighting';
import Crosshair from './Crosshair';
import InteractionPrompt from './InteractionPrompt';
import DocumentModal from './ui/DocumentModal';
import CodeLockModal from './ui/CodeLockModal';
import InventoryPanel from './ui/InventoryPanel';
import Viewmodel from './Viewmodel';
import PerfDebug from './Perfdebug';

import useGameStore from './store/useGameStore';
import audioManager from './audio/audioManager';
import { ROOMS } from './data/rooms3DData';

export default function Game3DApp({ onExit }) {
  const [isLocked, setIsLocked] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  // const [currentRoomId, setCurrentRoomId] = useState('karim_apartment');
  // const [spawnPos, setSpawnPos] = useState(ROOMS.karim_apartment.spawnPosition);
  const [currentRoomId, setCurrentRoomId] = useState('apartment_4b');
  const [spawnPos, setSpawnPos] = useState(ROOMS.apartment_4b.spawnPosition);
  // const [currentRoomId, setCurrentRoomId] = useState('street'); // 🔴 نبدأ في الشارع
  // const [spawnPos, setSpawnPos] = useState(ROOMS.street.spawnPosition);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { activeUI, closeUI } = useGameStore();
  const room = ROOMS[currentRoomId];

  const flashlightOn = useGameStore((s) => s.flashlightOn);
  const toggleFlashlight = useGameStore((s) => s.toggleFlashlight);
  const inventoryOpen = useGameStore((s) => s.inventoryOpen);
  const toggleInventory = useGameStore((s) => s.toggleInventory);

  const equipItem = useGameStore((s) => s.equipItem);
  const toggleLighter = useGameStore((s) => s.toggleLighter);

  useEffect(() => {
    return () => audioManager.stopAll();
  }, []);

  const handleRoomChange = (targetRoomId, targetSpawnPos) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentRoomId(targetRoomId);
      setSpawnPos(targetSpawnPos);
      audioManager.applyRoomAudio(ROOMS[targetRoomId]?.audio);

      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 500);
  };

  // التحكم بالكيبورد
  useEffect(() => {
    const onKey = (e) => {
      if ((e.code === 'KeyI' || e.code === 'Tab') && !activeUI) {
        e.preventDefault();
        toggleInventory();
        if (!isLocked) document.exitPointerLock?.();
        return;
      }

      if (e.code === 'KeyF' && !activeUI && !inventoryOpen) {
        const eqItem = useGameStore.getState().equippedItem;
        if (eqItem === 'flashlight') toggleFlashlight();
        if (eqItem === 'lighter') toggleLighter();
        return;
      }

      if (e.code === 'KeyQ' && isLocked && !activeUI && !inventoryOpen) {
        document.exitPointerLock?.();
      }

      if (e.code === 'Digit1') {
        const hasLighter = useGameStore.getState().inventory.find((i) => i.id === 'lighter');
        if (hasLighter) equipItem('lighter');
      }
      if (e.code === 'Digit2') {
        const hasFlashlight = useGameStore.getState().inventory.find((i) => i.id === 'flashlight');
        if (hasFlashlight) equipItem('flashlight');
      }

      // 🔴 التفاعل (فتح أبواب / التقاط أدوات)
      if (e.code === 'KeyE' && isLocked && !activeUI && !inventoryOpen) {
        const { hovered } = useGameStore.getState();
        if (!hovered?.ui) return;

        if (hovered.ui.type === 'door') {
          const doorId = hovered.ui.doorId;

          if (doorId === 'Main_Door') {
            handleRoomChange('building_hallway', [0, 1.5, 5]); // الخروج للممر
          } else if (doorId === 'door_to_karim') {
            handleRoomChange('karim_apartment', [-9, 1.5, -6]); // الدخول للشقة
          } else if (doorId === 'door_to_sami') {
            handleRoomChange('apartment_4b', [6, 1.5, 1]);
          } else if (doorId === 'door_to_rashdy') {
            alert('🚪 شقة د. رشدي (مقفولة)');
          } else if (doorId === 'Street_Door') {
            handleRoomChange('street', [0, 3, 5]); // 🔴 غيرنا الـ 1.5 لـ 3
          }
        } else if (hovered.ui.type === 'pickup') {
          if (window.__pickupHandlers && window.__pickupHandlers[hovered.id]) {
            window.__pickupHandlers[hovered.id]();
          }
        } else {
          useGameStore.getState().setActiveUI(hovered.ui);
        }
        return;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isLocked, activeUI, inventoryOpen, toggleInventory, toggleFlashlight, currentRoomId, equipItem, isTransitioning]);

  const handleOverlayClick = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.click();
      canvas.requestPointerLock?.();
    }
    audioManager
      .init()
      .then(() => {
        audioManager.applyRoomAudio(room?.audio);
      })
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    if (isLocked) setHasPlayed(true);
  }, [isLocked]);

  return (
    <div className="fixed inset-0 bg-black">
      <button
        onClick={() => {
          audioManager.stopAll();
          onExit();
        }}
        className="absolute top-3 left-3 z-50 px-3 py-2 rounded-lg bg-black/60 text-white text-sm"
      >
        ← خروج
      </button>

      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-1.5 rounded-lg bg-black/60 text-amber-400 text-sm">
        {room?.name}
      </div>

      {/* 🔴 شيلنا prop اسمه shadows: كده الـ shadow map مبقاش بيتعمل خالص */}
      <Canvas
        camera={{ fov: 75, near: 0.1, far: 1000 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={1}
      >
        <color attach="background" args={['#0a0a0a']} />
        <Lighting roomData={room} />

        <PointerLockControls
          makeDefault
          pointerSpeed={2.5}
          onLock={() => setIsLocked(true)}
          onUnlock={() => setIsLocked(false)}
        />

        <Physics key={currentRoomId} gravity={[0, -9.81, 0]}>
          <RoomRenderer currentRoomId={currentRoomId} />
          <Player spawnPosition={spawnPos} />
        </Physics>

        <DetectionSystem
          roomId={currentRoomId}
          doors={room?.doors || []}
          interactions={room?.interactions || []}
        />

        <Viewmodel />
        <PerfDebug />
      </Canvas>

      <Crosshair />
      {isLocked && !activeUI && !inventoryOpen && <InteractionPrompt />}

      {isTransitioning && <div className="absolute inset-0 z-50 bg-black" />}

      {!isLocked && !activeUI && !inventoryOpen && !isTransitioning && (
        <div
          className="absolute inset-0 z-40 flex items-end justify-center pb-24 cursor-pointer select-none"
          onClick={handleOverlayClick}
        >
          <div
            className="absolute inset-0"
            style={{ background: hasPlayed ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.7)' }}
          />
          <div className="relative z-10 text-center">
            {!hasPlayed ? (
              <>
                <div className="text-4xl mb-3">🎮</div>
                <p className="text-xl text-amber-400 font-bold mb-2" style={{ fontFamily: 'serif' }}>
                  اضغط للبدء
                </p>
                <p className="text-sm text-neutral-400 max-w-md mx-auto px-6">
                  WASD للحركة · F للكشاف · I للشنطة · Q لتحرير الماوس
                </p>
              </>
            ) : (
              <div className="px-5 py-2.5 rounded-lg bg-black/70 border border-amber-500/40">
                <p className="text-amber-400 text-xs font-bold">اضغط لتفعيل الماوس</p>
              </div>
            )}
          </div>
        </div>
      )}

      {isLocked && !activeUI && !inventoryOpen && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-lg bg-black/60 text-white text-xs pointer-events-none">
          <b>WASD</b> حركة · <b>Shift</b> جري · <b>E</b> تفاعل · <b>F</b> كشاف · <b>1/2</b> تبديل الأدوات
        </div>
      )}

      {activeUI?.type === 'document' && <DocumentModal data={activeUI} onClose={closeUI} />}
      {activeUI?.type === 'puzzle' && (
        <CodeLockModal puzzleId={activeUI.puzzleId} title="قفل" digits={4} onSolve={closeUI} onClose={closeUI} />
      )}

      <AnimatePresence>{inventoryOpen && <InventoryPanel />}</AnimatePresence>
    </div>
  );
}