import React, { useEffect, useMemo, useState } from 'react';
import { useGLTF, Sparkles, useTexture } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import audioManager from '../../audio/audioManager';
 
useTexture.preload('/hdri/day_sky.jpg');
useTexture.preload('/hdri/night_sky.jpg');
 
// أي ميش اسمه (أو اسم أي أب ليه) فيه واحدة من الكلمات دي بيتخفي ويفضل collider بس
const HIDDEN_COLLIDER_NAMES = ['ramp', 'stairs_collider'];
// ───────────── إعدادات نور الأعمدة (عدّل هنا) ─────────────
const LAMP_HEAD_DROP = 0.9;     // النور بينزل كام تحت نقطة العمود (نفس مكان الـ glow sprite)
const LAMP_ANGLE = 0.9;         // زاوية المخروط بالـ radians (لازم أقل من 1.57). أكبر = بقعة أوسع
const LAMP_PENUMBRA = 0.9;      // نعومة حافة البقعة (من 0 لـ 1)
const LAMP_BRIGHTNESS = 13;      // سطوع النور على الأرض. زوّده لو البقعة خافتة
const LAMP_COLOR = '#ffffff';   // لون النور (أصفر دافي)
const FALLBACK_DROP = 6;        // لو الـ raycast ملقاش أرض، نفترض إنها تحت العمود بـ 6 متر

const LAMPS = [
  [-73.41, 3.14, 4.19],
  [-67.65, 3.12, 4.33],
  [-73.42, 3.14, 9.5],
  [-67.63, 3.13, 12.71],
  [-73.4, 3.11, 15.98],
  [-67.65, 3.14, 20.91],
];
 
const useGlowTexture = () =>
  useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 220, 150, 0.6)');
    gradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);
 
function StreetLamp({ position, groundY, isNight, glowTexture }) {
  // target لازم يكون Object3D حقيقي جوه الـ scene، وإلا السبوت بيشاور على نقطة الأصل (0,0,0)
  const target = useMemo(() => new THREE.Object3D(), []);
 
  const dropToGround = position[1] - groundY;                // من نقطة العمود للأرض
  const h = Math.max(dropToGround - LAMP_HEAD_DROP, 1);      // من النور للأرض
  const radius = h * Math.tan(LAMP_ANGLE);                   // نصف قطر البقعة على الأرض
 
  return (
    <group position={position}>
      {/* 🔴 السبوت لايت موجود دايمًا والنهار شدته 0 (عشان ما يحصلش recompile للـ shaders) */}
      <spotLight
        position={[0, -LAMP_HEAD_DROP, 0]}
        target={target}
        angle={LAMP_ANGLE}
        penumbra={LAMP_PENUMBRA}
        decay={2}
        distance={h * 2.2}
        intensity={isNight ? LAMP_BRIGHTNESS * h * h : 0}
        color={LAMP_COLOR}
      />
      <primitive object={target} position={[0, -dropToGround, 0]} />
 
      {isNight && (
        <>
          {/* وهج اللمبة نفسها */}
          <sprite scale={[5, 6, 1]} position={[0, -LAMP_HEAD_DROP, 0]}>
            <spriteMaterial map={glowTexture} blending={THREE.AdditiveBlending} depthWrite={false} opacity={0.2} />
          </sprite>
 
          {/* هالة دايرية خفيفة على الأرض، على نفس حجم بقعة السبوت */}
          <mesh rotation-x={-Math.PI / 2} position={[0, -dropToGround + 0.04, 0]}>
            <circleGeometry args={[radius * 0.9, 48]} />
            <meshBasicMaterial
              map={glowTexture}
              transparent
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              opacity={0.12}
            />
          </mesh>
 
          <Sparkles
            count={40}
            scale={[radius * 1.2, h, radius * 1.2]}
            size={2}
            speed={0.1}
            color="#ffdd99"
            position={[0, -dropToGround + h / 2, 0]}
            opacity={0.3}
          />
        </>
      )}
    </group>
  );
}
 
export default function Street() {
  const { scene } = useGLTF('/models/street.glb', true);
  const { camera } = useThree();
 
  const [isNight, setIsNight] = useState(false);
  // قيم مبدئية، وبعدين بتتحدث بالقيم الحقيقية (من غير ما عدد الأضواء يتغير)
  const [groundYs, setGroundYs] = useState(() => LAMPS.map(([, y]) => y - FALLBACK_DROP));
 
  const glowTexture = useGlowTexture();
  const daySky = useTexture('/hdri/day_sky.jpg');
  const nightSky = useTexture('/hdri/night_sky.jpg');
 
  // 🔴 إخفاء الـ ramp (سلم المستشفى وأي collider تاني): الميش بيفضل موجود للفيزياء بس مش بيترسم
  useEffect(() => {
    const matchesName = (obj) => {
      // بنشوف اسم الميش واسم أي أب ليه (عشان لو الاسم على الـ group مش الميش)
      let o = obj;
      while (o && o !== scene.parent) {
        const n = (o.name || '').toLowerCase();
        if (HIDDEN_COLLIDER_NAMES.some((key) => n.includes(key))) return true;
        o = o.parent;
      }
      return false;
    };
 
    const hidden = [];
    scene.traverse((child) => {
      if (!child.isMesh) return;
 
      child.castShadow = false;
      child.receiveShadow = false;
 
      if (matchesName(child) && child.material) {
        // clone عشان لو الخامة مشتركة مع ميشات تانية ما نخفيهاش
        const clone = (m) => {
          const c = m.clone();
          c.visible = false;
          return c;
        };
        child.material = Array.isArray(child.material) ? child.material.map(clone) : clone(child.material);
        hidden.push(child.name || '(بدون اسم)');
      }
    });
 
    if (hidden.length) console.log('[Street] hidden ramp meshes:', hidden);
    else console.warn('[Street] ما لقيتش أي ميش اسمه فيه ramp أو stairs_collider');
  }, [scene]);
 
  // 🔴 بنطلع شعاع من كل عمود لتحت مرة واحدة عشان نعرف ارتفاع الأرض الحقيقي تحته
  useEffect(() => {
    scene.updateMatrixWorld(true);
    const raycaster = new THREE.Raycaster();
    raycaster.far = 60;
    const down = new THREE.Vector3(0, -1, 0);
    const normal = new THREE.Vector3();
 
    const ys = LAMPS.map(([x, y, z]) => {
      raycaster.set(new THREE.Vector3(x, y, z), down);
      const hits = raycaster.intersectObject(scene, true);
      // أول سطح أفقي (normal لفوق) بعيد عن العمود نفسه
      const ground = hits.find((hit) => {
        if (hit.distance < 0.5 || !hit.face) return false;
        normal.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
        return normal.y > 0.7;
      });
      return ground ? ground.point.y : y - FALLBACK_DROP;
    });
 
    setGroundYs(ys);
  }, [scene]);
 
  useEffect(() => {
    const t = setTimeout(() => {
      audioManager.applyRoomAudio({
        layers: [{ id: 'day_ambient', url: '/audio/ambient/day_ambient.ogg', volume: 0.4 }],
      });
    }, 1000);
    return () => clearTimeout(t);
  }, [scene]);
 
  useFrame(() => {
    const shouldBeNight = camera.position.z < 32;
 
    if (shouldBeNight !== isNight) {
      setIsNight(shouldBeNight);
 
      if (shouldBeNight) {
        audioManager.applyRoomAudio({
          layers: [{ id: 'night_ambient', url: '/audio/ambient/night_ambient.ogg', volume: 0.6 }],
        });
      } else {
        audioManager.applyRoomAudio({
          layers: [{ id: 'day_ambient', url: '/audio/ambient/day_ambient.ogg', volume: 0.4 }],
        });
      }
    }
  });
 
  return (
    <group>
      {/* قبة السماء */}
      <mesh position={[-70, 0, 0]}>
        <sphereGeometry args={[800, 32, 32]} />
        <meshBasicMaterial
          map={isNight ? nightSky : daySky}
          color={isNight ? '#212121' : '#ffffff'}
          side={THREE.BackSide}
          fog={false}
          toneMapped={false}
        />
      </mesh>
 
      {/* الضباب: النهار 0.015 - الليل 0.035 */}
      <fogExp2
        attach="fog"
        args={[isNight ? '#050505' : '#a0b8d6', isNight ? 0.035 : 0.015]}
      />
 
      <directionalLight
        position={[-100, 80, 20]}
        intensity={isNight ? 0 : 2.0}
        color={isNight ? '#4a6fa5' : '#fff4d4'}
      />
 
      <ambientLight
        intensity={isNight ? 0.01 : 0.3}
        color={isNight ? '#1a1a2e' : '#ffffff'}
      />
 
      <RigidBody type="fixed" colliders="trimesh" friction={1}>
        <primitive object={scene} />
      </RigidBody>
 
      {/* العواميد */}
      {LAMPS.map((pos, i) => (
        <StreetLamp
          key={i}
          position={pos}
          groundY={groundYs[i]}
          isNight={isNight}
          glowTexture={glowTexture}
        />
      ))}
    </group>
  );
}