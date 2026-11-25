// import React, { useMemo } from 'react';
// import { RigidBody } from '@react-three/rapier';
// import { useTexture } from '@react-three/drei';
// import * as THREE from 'three';
// import { getTheme } from './data/roomThemes';

// export default function Room({ roomData }) {
//   const WIDTH = roomData.dimensions.width;
//   const DEPTH = roomData.dimensions.depth;
//   const HEIGHT = roomData.dimensions.height;
//   const WALL_THICK = 0.15;

//   const theme = getTheme(roomData.id);

//   // تحميل الـ textures (لو موجودة) — سيبه للـ future
//   const woodFloor = useTexture('/textures/wood_floor/diffuse.jpg');
//   const woodFloorRough = useTexture('/textures/wood_floor/rough.jpg');
//   const concreteWall = useTexture('/textures/concrete_wall/diffuse.jpg');
//   const concreteWallRough = useTexture('/textures/concrete_wall/rough.jpg');

//   useMemo(() => {
//     woodFloor.wrapS = woodFloor.wrapT = THREE.RepeatWrapping;
//     woodFloor.repeat.set(Math.max(1, WIDTH / 1.5), Math.max(1, DEPTH / 1.5));
//     woodFloorRough.wrapS = woodFloorRough.wrapT = THREE.RepeatWrapping;
//     woodFloorRough.repeat.copy(woodFloor.repeat);

//     concreteWall.wrapS = concreteWall.wrapT = THREE.RepeatWrapping;
//     concreteWall.repeat.set(Math.max(1, WIDTH / 2), Math.max(1, HEIGHT / 1.5));
//     concreteWallRough.wrapS = concreteWallRough.wrapT = THREE.RepeatWrapping;
//     concreteWallRough.repeat.copy(concreteWall.repeat);
//   }, [woodFloor, woodFloorRough, concreteWall, concreteWallRough, WIDTH, DEPTH, HEIGHT]);

//   return (
//     <group>
//       {/* ══════ الأرضية ══════ */}
//       <RigidBody type="fixed" colliders="cuboid" position={[0, -0.05, 0]}>
//         <mesh receiveShadow>
//           <boxGeometry args={[WIDTH, 0.1, DEPTH]} />
//           <meshStandardMaterial
//             map={woodFloor}
//             roughnessMap={woodFloorRough}
//             color={theme.floor.color}
//             roughness={theme.floor.roughness}
//             metalness={theme.floor.metalness}
//           />
//         </mesh>
//       </RigidBody>

//       {/* ══════ السقف ══════ */}
//       <RigidBody type="fixed" colliders="cuboid" position={[0, HEIGHT + 0.05, 0]}>
//         <mesh>
//           <boxGeometry args={[WIDTH, 0.1, DEPTH]} />
//           <meshStandardMaterial color={theme.ceiling.color} roughness={1} />
//         </mesh>
//       </RigidBody>

//       {/* ══════ الحيطة الشمالية ══════ */}
//       <RigidBody type="fixed" colliders="cuboid">
//         <mesh position={[0, HEIGHT / 2, -DEPTH / 2]} castShadow receiveShadow>
//           <boxGeometry args={[WIDTH, HEIGHT, WALL_THICK]} />
//           <meshStandardMaterial
//             map={concreteWall}
//             roughnessMap={concreteWallRough}
//             color={theme.wall.color}
//             roughness={theme.wall.roughness}
//             metalness={theme.wall.metalness}
//           />
//         </mesh>
//       </RigidBody>

//       {/* ══════ الحيطة الجنوبية ══════ */}
//       <RigidBody type="fixed" colliders="cuboid">
//         <mesh position={[0, HEIGHT / 2, DEPTH / 2]} castShadow receiveShadow>
//           <boxGeometry args={[WIDTH, HEIGHT, WALL_THICK]} />
//           <meshStandardMaterial
//             map={concreteWall}
//             roughnessMap={concreteWallRough}
//             color={theme.wall.color}
//             roughness={theme.wall.roughness}
//             metalness={theme.wall.metalness}
//           />
//         </mesh>
//       </RigidBody>

//       {/* ══════ الحيطة الشرقية ══════ */}
//       <RigidBody type="fixed" colliders="cuboid">
//         <mesh position={[WIDTH / 2, HEIGHT / 2, 0]} castShadow receiveShadow>
//           <boxGeometry args={[WALL_THICK, HEIGHT, DEPTH]} />
//           <meshStandardMaterial
//             map={concreteWall}
//             roughnessMap={concreteWallRough}
//             color={theme.wall.color}
//             roughness={theme.wall.roughness}
//             metalness={theme.wall.metalness}
//           />
//         </mesh>
//       </RigidBody>

//       {/* ══════ الحيطة الغربية ══════ */}
//       <RigidBody type="fixed" colliders="cuboid">
//         <mesh position={[-WIDTH / 2, HEIGHT / 2, 0]} castShadow receiveShadow>
//           <boxGeometry args={[WALL_THICK, HEIGHT, DEPTH]} />
//           <meshStandardMaterial
//             map={concreteWall}
//             roughnessMap={concreteWallRough}
//             color={theme.wall.color}
//             roughness={theme.wall.roughness}
//             metalness={theme.wall.metalness}
//           />
//         </mesh>
//       </RigidBody>
//     </group>
//   );
// }