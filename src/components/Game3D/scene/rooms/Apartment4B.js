import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

export default function Apartment4B() {
  // تأكد إن الملف موجود في public/models/4B.glb
  const { scene } = useGLTF('/models/4B.glb', true);

  // target للبروجيكتور لازم يكون Object3D حقيقي ومضاف للـ scene
  const projectorTarget = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = false;
      child.receiveShadow = false;

      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => {
        if (!m) return;

        // انعكاسات الـ environment على الخامات
        if ('envMapIntensity' in m) m.envMapIntensity = 1;

        // تحسين وضوح الخامات من الزوايا المائلة
        ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap'].forEach((key) => {
          if (m[key]) m[key].anisotropy = 8;
        });

        m.needsUpdate = true;
      });
    });
  }, [scene]);

  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={scene} />
      </RigidBody>

      {/* البروجيكتور، غيّر الإحداثيات حسب مكان الغرفة في التصميم */}
      <group position={[6, 1.5, 10]}>
        <mesh>
          <boxGeometry args={[0.5, 0.3, 0.5]} />
          <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
        </mesh>

        <spotLight
          position={[0, 0, 0]}
          angle={0.6}
          penumbra={0.5}
          intensity={200}
          color="#88bbff"
          distance={25}
          decay={2}
          target={projectorTarget}
        />
        <primitive object={projectorTarget} position={[0, 0, -5]} />
      </group>
    </group>
  );
}

// التحميل المسبق عشان اللعبة متفصلش
useGLTF.preload('/models/4B.glb');