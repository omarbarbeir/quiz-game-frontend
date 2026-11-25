import React from 'react';

export default function Door({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      {/* القايم الشمال */}
      <mesh position={[-0.55, 1.05, 0]}>
        <boxGeometry args={[0.1, 2.1, 0.15]} />
        <meshStandardMaterial color="#3a1f0f" roughness={0.9} />
      </mesh>

      {/* القايم اليمين */}
      <mesh position={[0.55, 1.05, 0]}>
        <boxGeometry args={[0.1, 2.1, 0.15]} />
        <meshStandardMaterial color="#3a1f0f" roughness={0.9} />
      </mesh>

      {/* العتبة (فوق) */}
      <mesh position={[0, 2.15, 0]}>
        <boxGeometry args={[1.3, 0.1, 0.15]} />
        <meshStandardMaterial color="#3a1f0f" roughness={0.9} />
      </mesh>

      {/* ضلفة الباب — جوه الإطار */}
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[1, 2.1, 0.08]} />
        <meshStandardMaterial color="#5a3a1a" roughness={0.85} />
      </mesh>

      {/* المقبض */}
      <mesh position={[0.4, 1.05, 0.07]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#c9a961" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}