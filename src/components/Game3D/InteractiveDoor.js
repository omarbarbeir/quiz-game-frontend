import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import useGameStore from './store/useGameStore';

export default function InteractiveDoor({ id, position, rotation = [0, 0, 0], swingDirection = 1 }) {
  const rigidBodyRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const hovered = useGameStore((s) => s.hovered);
  const isHovered = hovered?.ui?.type === 'door' && hovered?.ui?.doorId === id;
  const currentAngle = useRef(0);

  const modelPath = 
    id === 'Bath_Door' ? '/models/MODELS/door/Bath_Door.glb' :
    id === 'Room_Door' ? '/models/MODELS/door/Room_Door.glb' :
    id === 'Main_Door' ? '/models/MODELS/door/Main_Door.glb' :
    id === 'door_to_karim' ? '/models/MODELS/door/Main_Door.glb' : // ممكن تستخدم نفس باب الشقة من بره
    id === 'door_to_sami' ? '/models/MODELS/door/Main_Door.glb' : // مؤقتاً لحد ما تصدر باب سامي
    id === 'door_to_rashdy' ? '/models/MODELS/door/Main_Door.glb' : // مؤقتاً
    id === 'Street_Door' ? '/models/MODELS/door/Main_Door.glb' : // مؤقتاً (هنعمله بعدين)
    '/models/MODELS/door/Main_Door.glb'; // الافتراضي
  const { scene } = useGLTF(modelPath, true);

  useFrame(() => {
    if (!rigidBodyRef.current) return;
    const targetAngle = isOpen ? (Math.PI / 2) * swingDirection : 0;
    currentAngle.current = THREE.MathUtils.lerp(currentAngle.current, targetAngle, 0.1);
    
    // بنلف الفيزياء (واللي بيحرك الشكل معاها) من المفصلة
    const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), currentAngle.current);
    rigidBodyRef.current.setNextKinematicRotation(quat);
  });

  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === 'KeyE' && isHovered) setIsOpen((prev) => !prev);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isHovered]);

  return (
    <group position={position} rotation={rotation}>
      {/* 
        kinematicPosition: الحاجز الفيزيائي دايماً موجود وشغال
        colliders="hull": بيعمل حاجز على شكل الباب بالظبط عشان ميبقاش فيه فراغات
      */}
      <RigidBody type="kinematicPosition" colliders="hull" ref={rigidBodyRef}>
        <primitive object={scene.clone()} />
      </RigidBody>
    </group>
  );
}