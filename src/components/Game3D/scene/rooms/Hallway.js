import React, { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';

// 🔴 لمبة بترمش بسرعة جداً بدون تأخير (Flicker سينمائي)
function FlickeringLight({ position }) {
  const lightRef = useRef();

  useFrame((state) => {
    if (!lightRef.current) return;
    const t = state.clock.elapsedTime;
    const flicker = Math.sin(t * 40) * Math.cos(t * 20) * Math.sin(t * 1);
    const threshold = 0.1;
    const maxIntensity = 1;

    lightRef.current.intensity = flicker > threshold ? maxIntensity : 0.1;
  });

  return <pointLight ref={lightRef} position={position} color="#F3A849" distance={2} decay={2} />;
}

export default function Hallway() {
  const { scene } = useGLTF('/models/Hallway.glb', true);

  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = false;
      child.receiveShadow = false;

      const name = child.name.toLowerCase();
      if (name.includes('stairs_collider')) {
        child.visible = false;
        if (child.material) {
          child.material.transparent = true;
          child.material.opacity = 0;
        }
      }
    });
  }, [scene]);

  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh" friction={1}>
        <primitive object={scene} />
      </RigidBody>

      {/* لمبة السلم اللي بترمش في الدور الخامس */}
      <FlickeringLight position={[0.408, 8, 5.1]} />
    </group>
  );
}

useGLTF.preload('/models/Hallway.glb');