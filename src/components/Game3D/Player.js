import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import audioManager from './audio/audioManager';

const SPEED = 2.2;
const RUN_MULT = 1.6;
const PLAYER_HEIGHT = 1.6;
const PLAYER_RADIUS = 0.3;

export default function Player({
  spawnPosition = [0, PLAYER_HEIGHT / 2, 2],
}) {
  const bodyRef = useRef(null);
  const { camera } = useThree();

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
  });

  const lastFootstepRef = useRef(0);

  // موقع البداية
  useEffect(() => {
    camera.position.set(
      spawnPosition[0],
      spawnPosition[1] + 0.4,
      spawnPosition[2]
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      const k = e.code;
      if (k === 'KeyW' || k === 'ArrowUp') keys.current.forward = true;
      if (k === 'KeyS' || k === 'ArrowDown') keys.current.backward = true;
      if (k === 'KeyA' || k === 'ArrowLeft') keys.current.left = true;
      if (k === 'KeyD' || k === 'ArrowRight') keys.current.right = true;
      if (k === 'ShiftLeft' || k === 'ShiftRight') keys.current.run = true;
    };
    const onKeyUp = (e) => {
      const k = e.code;
      if (k === 'KeyW' || k === 'ArrowUp') keys.current.forward = false;
      if (k === 'KeyS' || k === 'ArrowDown') keys.current.backward = false;
      if (k === 'KeyA' || k === 'ArrowLeft') keys.current.left = false;
      if (k === 'KeyD' || k === 'ArrowRight') keys.current.right = false;
      if (k === 'ShiftLeft' || k === 'ShiftRight') keys.current.run = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!bodyRef.current) return;

    const kb = keys.current;
    const speed = SPEED * (kb.run ? RUN_MULT : 1);

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const move = new THREE.Vector3();
    if (kb.forward) move.add(forward);
    if (kb.backward) move.sub(forward);
    if (kb.right) move.add(right);
    if (kb.left) move.sub(right);

    const isMoving = move.lengthSq() > 0;

    if (isMoving) {
      move.normalize().multiplyScalar(speed);
    }

    const v = bodyRef.current.linvel();
    bodyRef.current.setLinvel({ x: move.x, y: v.y, z: move.z }, true);

    const pos = bodyRef.current.translation();
    camera.position.set(pos.x, pos.y + 0.7, pos.z);

    // صوت الخطوات
    const now = performance.now();
    const interval = kb.run ? 300 : 480;

    if (isMoving && now - lastFootstepRef.current > interval) {
      audioManager.playFootstep();
      lastFootstepRef.current = now;
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      mass={1}
      type="dynamic"
      position={spawnPosition}
      enabledRotations={[false, false, false]}
      linearDamping={8}
      lockRotations
      ccd={true}
      userData={{ isPlayer: true }}
    >
      <CapsuleCollider args={[0.65, 0.3]} />
    </RigidBody>
  );
}