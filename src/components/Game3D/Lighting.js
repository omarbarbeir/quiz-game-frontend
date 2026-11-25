import React from 'react';
import { Environment, Lightformer } from '@react-three/drei';

export default function Lighting({ roomData }) {
  const L = roomData?.lighting;
  if (!L) return null;

  return (
    <>
      {L.ambient && (
        <ambientLight intensity={L.ambient.intensity} color={L.ambient.color} />
      )}

      {L.hemisphere && (
        <hemisphereLight
          args={[L.hemisphere.sky, L.hemisphere.ground, L.hemisphere.intensity]}
          position={[0, 5, 0]}
        />
      )}

      {/* الـ Environment بيتفعل بس للغرف اللي مكتوب فيها environment في rooms3DData */}
      {L.environment && (
        <Environment resolution={256} environmentIntensity={L.environment.intensity ?? 0.35}>
          <Lightformer form="rect" intensity={2} color="#4a6fa5" position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
          <Lightformer form="rect" intensity={1} color="#2a3b4c" position={[-5, 2, 0]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
          <Lightformer form="rect" intensity={1} color="#2a3b4c" position={[5, 2, 0]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        </Environment>
      )}

      {/* بدون ظلال: مفيش castShadow ولا shadow-map */}
      {L.points?.map((p, i) => (
        <pointLight
          key={i}
          position={p.position}
          intensity={p.intensity}
          color={p.color}
          distance={p.distance || 10}
          decay={p.decay ?? 2}
        />
      ))}
    </>
  );
}