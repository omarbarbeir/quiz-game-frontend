import React, { useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import ItemPickup from '../ItemPickup';
import InteractiveDoor from '../../InteractiveDoor';

export default function KarimApartment() {
  const { scene } = useGLTF('/models/karim_apartment.glb', true);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
  }, [scene]);

  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={scene} />
      </RigidBody>

      {/* 1. باب الحمام (الأزرق) */}
      <InteractiveDoor
        id="Bath_Door"
        position={[1.5412, 1.0618, 1.607]}
        rotation={[0, -0.05, 0]}
        swingDirection={-1}
      />

      {/* 2. باب غرفة النوم (الأحمر) */}
      <InteractiveDoor
        id="Room_Door"
        position={[-3.6165, 1.061, -2.0495]}
        rotation={[0, 1.568, 0]}
        swingDirection={1}
      />

      {/* 3. الباب الرئيسي (الأخضر) */}
      <InteractiveDoor
        id="Main_Door"
        position={[-10, 1.1, -8.9864]}
        rotation={[0, -0.029, 0]}
        swingDirection={1}
        targetRoom="building_hallway"
        spawnAfterEnter={[0, 0.8, 1]}
      />

      {/* الأدوات */}
      <ItemPickup item={{ id: 'flashlight', name: 'كشاف', icon: '🔦', description: 'كشاف يشتغل بـ F' }} position={[9.42, 1.23, -8.29]} />
      <ItemPickup item={{ id: 'lighter', name: 'ولاعة', icon: '🔥', description: 'تشتغل بـ F' }} position={[9.4233, 1.4, -7.517]} />
    </group>
  );
}

useGLTF.preload('/models/karim_apartment.glb');