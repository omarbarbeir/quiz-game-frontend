import React from 'react';
import { CuboidCollider, RigidBody } from '@react-three/rapier';

export default function TriggerZone({ position, size, onEnter, onExit }) {
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider
        args={[size[0] / 2, size[1] / 2, size[2] / 2]}
        position={position}
        sensor
        onIntersectionEnter={(e) => {
          if (e.other.rigidBody?.userData?.isPlayer && onEnter) onEnter();
        }}
        onIntersectionExit={(e) => {
          // 🔴 السطر ده هو اللي بيخلي النور يرجع لما تخرج
          if (e.other.rigidBody?.userData?.isPlayer && onExit) onExit();
        }}
      />
    </RigidBody>
  );
}