import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import useGameStore from '../store/useGameStore';

export default function ItemPickup({ item, position }) {
  const ref = useRef();
  const [collected, setCollected] = useState(false);
  
  const addItem = useGameStore((s) => s.addItem);
  const equipItem = useGameStore((s) => s.equipItem);

  // 🔴 السر هنا: بنختار المسار بناءً على نوع الأداة
  const modelPath = item.id === 'flashlight' 
    ? '/models/flashlight/flash.glb' 
    : '/models/lighter/Lighter.glb';

  const { scene } = useGLTF(modelPath);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    // بنجبر الحجم يبقى 15 سم عشان يبان كويس على الترابيزة
    if (maxDim > 0) clone.scale.setScalar(0.15 / maxDim);
    return clone;
  }, [scene]);

  const handlePick = () => {
    if (collected) return;
    addItem(item);      
    equipItem(item.id); 
    setCollected(true); 
  };

  useEffect(() => {
    window.__pickupHandlers = window.__pickupHandlers || {};
    window.__pickupHandlers[`pickup_${item.id}`] = handlePick;
    return () => {
      delete window.__pickupHandlers?.[`pickup_${item.id}`];
    };
  }, [item.id, handlePick]);

  if (collected) return null;

  return (
    <group ref={ref} position={position}>
      {/* النور الأخضر بتاع التفاعل */}
      <primitive object={clonedScene} />
    </group>
  );
}