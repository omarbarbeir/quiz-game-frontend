import React, { useRef, useMemo, Suspense, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import useGameStore from './store/useGameStore';

// ✅ التعديل 1: تجهيز صورة الشعلة مرة واحدة بس بره المكون عشان متهنجش
const createFlameTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createRadialGradient(32, 42, 2, 32, 32, 30);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 230, 0, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.8)');
  gradient.addColorStop(0.8, 'rgba(255, 0, 0, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

// بننشئها مرة واحدة ونحتفظ بيها
const globalFlameTexture = createFlameTexture();

// 🔥 مكون الشعلة
function BillboardFlame({ isOn }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current || !isOn) return; // لو مقفولة متعملش حركة
    const t = state.clock.elapsedTime;
    
    meshRef.current.position.y = Math.sin(t * 5) * 0.005;
    meshRef.current.scale.set(
      1 + Math.sin(t * 3) * 0.03, 
      1 + Math.cos(t * 2) * 0.03, 
      1
    );
  });

  return (
    <mesh ref={meshRef} visible={isOn}>
      <planeGeometry args={[0.05, 0.16]} />
      <meshBasicMaterial 
        map={globalFlameTexture} 
        transparent={true} 
        blending={THREE.AdditiveBlending}
        depthWrite={false} 
      />
    </mesh>
  );
}

export default function Viewmodel() {
  const groupRef = useRef();
  const lightRef = useRef();
  const targetRef = useRef();

  const equippedItem = useGameStore((s) => s.equippedItem);
  const flashlightOn = useGameStore((s) => s.flashlightOn);
  const lighterOn = useGameStore((s) => s.lighterOn);

  const flashlightGLTF = useGLTF('/models/flashlight/flash.glb');
  const lighterGLTF = useGLTF('/models/lighter/Lighter.glb'); 

  // ⚙️ إعدادات الكشاف (نفس أرقامك بالظبط)
  const FLASHLIGHT_SCALE = 0.38; 
  const FLASHLIGHT_POS_X = 0.26;      
  const FLASHLIGHT_POS_Y = -0.3;      
  const FLASHLIGHT_POS_Z = -0.46;     
  const FLASHLIGHT_ROT_X = 0;         
  const FLASHLIGHT_ROT_Y = Math.PI;   
  const FLASHLIGHT_ROT_Z = 0;         

  // ⚙️ إعدادات الولاعة (نفس أرقامك بالظبط)
  const LIGHTER_SCALE = 0.21; 
  const LIGHTER_POS_X = 0.24;         
  const LIGHTER_POS_Y = -0.21;        
  const LIGHTER_POS_Z = -0.4;         
  const LIGHTER_ROT_X = 0;            
  const LIGHTER_ROT_Y = Math.PI;
  const LIGHTER_ROT_Z = 0;            
  
  // 🔥 إعدادات مكان الشعلة (نفس أرقامك بالظبط)
  const FLAME_POS_X = 0.06;      
  const FLAME_POS_Y = 0.12;   
  const FLAME_POS_Z = 0;      

  const activeModel = useMemo(() => {
    let sceneToUse = null;
    let currentScale = 1;

    if (equippedItem === 'flashlight') {
      sceneToUse = flashlightGLTF.scene;
      currentScale = FLASHLIGHT_SCALE;
    }
    if (equippedItem === 'lighter') {
      sceneToUse = lighterGLTF.scene;
      currentScale = LIGHTER_SCALE; 
    }

    if (!sceneToUse) return null;

    const clone = sceneToUse.clone();
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    clone.position.sub(center);
    
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) clone.scale.setScalar(currentScale / maxDim);
    return clone;
  }, [equippedItem, flashlightGLTF, lighterGLTF]);

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current;
    }
  }, [equippedItem, flashlightOn]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.copy(state.camera.position);
      groupRef.current.quaternion.copy(state.camera.quaternion);

      if (equippedItem === 'flashlight') {
        groupRef.current.translateX(FLASHLIGHT_POS_X);
        groupRef.current.translateY(FLASHLIGHT_POS_Y);
        groupRef.current.translateZ(FLASHLIGHT_POS_Z);
      } else if (equippedItem === 'lighter') {
        groupRef.current.translateX(LIGHTER_POS_X);
        groupRef.current.translateY(LIGHTER_POS_Y);
        groupRef.current.translateZ(LIGHTER_POS_Z);
      }
    }
  });

  if (!equippedItem) return null;

  return (
    <group ref={groupRef}>
      
      <Suspense fallback={null}>
        <primitive 
          object={activeModel} 
          rotation={equippedItem === 'flashlight' ? 
            [FLASHLIGHT_ROT_X, FLASHLIGHT_ROT_Y, FLASHLIGHT_ROT_Z] : 
            [LIGHTER_ROT_X, LIGHTER_ROT_Y, LIGHTER_ROT_Z]
          } 
        />
      </Suspense>

      {/* ✅ التعديل 2: نور الكشاف موجود دايماً، بنتحكم في قوته بس */}
      <object3D ref={targetRef} position={[0, 0, -20]} />
      <spotLight
        ref={lightRef}
        position={[0, 0, 0]}
        intensity={equippedItem === 'flashlight' && flashlightOn ? 8 : 0}          
        angle={0.5}            
        penumbra={0.8}         
        distance={15}          
        decay={1.5}            
      />

      {/* ✅ التعديل 3: الشعلة ونورها موجودين دايماً، بنتحكم في الظهور بس */}
      <group position={[FLAME_POS_X, FLAME_POS_Y, FLAME_POS_Z]}>
        <BillboardFlame isOn={equippedItem === 'lighter' && lighterOn} />
        <pointLight 
          position={[0, 0.05, 0]} 
          distance={4} 
          color="#ff7700" 
          intensity={equippedItem === 'lighter' && lighterOn ? 3 : 0} 
        />
      </group>
      
    </group>
  );
}