import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function Flashlight({ on = true, intensity = 5 }) {
  const coreRef = useRef(null);
  const haloRef = useRef(null);
  const targetRef = useRef(null);
  const { camera, scene } = useThree();

  const camPos = useRef(new THREE.Vector3());
  const camDir = useRef(new THREE.Vector3());

  useEffect(() => {
    const core = coreRef.current;
    const halo = haloRef.current;
    const target = targetRef.current;
    if (!core || !halo || !target) return;

    core.target = target;
    halo.target = target;
    scene.add(target);

    return () => scene.remove(target);
  }, [scene]);

  useFrame(() => {
    const core = coreRef.current;
    const halo = haloRef.current;
    const target = targetRef.current;
    if (!core || !halo || !target) return;

    camera.getWorldPosition(camPos.current);
    camDir.current.set(0, 0, -1).applyQuaternion(camera.quaternion);

    core.position.copy(camPos.current);
    halo.position.copy(camPos.current);
    target.position.copy(camPos.current).addScaledVector(camDir.current, 10);

    target.updateMatrixWorld();
    core.updateMatrixWorld();
    halo.updateMatrixWorld();
  });

  return (
    <>
      {/* المركز */}
      <spotLight
        ref={coreRef}
        intensity={on ? intensity : 0}
        color="#fff8e0"
        angle={0.35}
        penumbra={1}
        distance={25}
        decay={0.8}
      />

      {/* الهالة الواسعة */}
      <spotLight
        ref={haloRef}
        intensity={on ? intensity * 0.4 : 0}
        color="#ffd8a0"
        angle={0.7}
        penumbra={1}
        distance={25}
        decay={1}
      />

      <object3D ref={targetRef} />
    </>
  );
}