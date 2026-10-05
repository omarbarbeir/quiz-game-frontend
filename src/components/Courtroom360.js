import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ══════════════════════════════════════════════
// الـ Hotspots — مواضع على نصف الكرة الأمامي
// phi: زاوية عمودية، theta: أفقية (محدودة ±90°)
// ══════════════════════════════════════════════
const HOTSPOTS = {
  judge: [
    { id: "accused",     phi: 1.65, theta:  0.0,  label: "المتهم",       w: 0.16, h: 0.28 },
    { id: "defense",     phi: 1.58, theta: -0.55, label: "محامي الدفاع", w: 0.13, h: 0.24 },
    { id: "prosecution", phi: 1.58, theta:  0.55, label: "وكيل النيابة", w: 0.13, h: 0.24 },
    { id: "jury",        phi: 1.30, theta:  0.0,  label: "المحلفون",     w: 0.38, h: 0.14 },
  ],
  prosecution: [
    { id: "judge",    phi: 1.42, theta: -0.25, label: "القاضي",       w: 0.15, h: 0.22 },
    { id: "accused",  phi: 1.65, theta:  0.50, label: "المتهم",       w: 0.14, h: 0.26 },
    { id: "defense",  phi: 1.58, theta: -0.60, label: "محامي الدفاع", w: 0.12, h: 0.22 },
    { id: "jury",     phi: 1.35, theta: -0.85, label: "المحلفون",     w: 0.10, h: 0.14 },
  ],
  defense: [
    { id: "judge",       phi: 1.42, theta: -0.25, label: "القاضي",       w: 0.15, h: 0.22 },
    { id: "accused",     phi: 1.65, theta: -0.50, label: "المتهم",       w: 0.14, h: 0.26 },
    { id: "prosecution", phi: 1.58, theta:  0.60, label: "وكيل النيابة", w: 0.12, h: 0.22 },
    { id: "jury",        phi: 1.35, theta:  0.85, label: "المحلفون",     w: 0.10, h: 0.14 },
  ],
  accused: [
    { id: "judge",       phi: 1.38, theta:  0.0,  label: "القاضي",       w: 0.15, h: 0.22 },
    { id: "prosecution", phi: 1.60, theta:  0.50, label: "وكيل النيابة", w: 0.12, h: 0.22 },
    { id: "defense",     phi: 1.60, theta: -0.50, label: "محامي الدفاع", w: 0.12, h: 0.22 },
    { id: "jury",        phi: 1.28, theta:  0.0,  label: "المحلفون",     w: 0.40, h: 0.12 },
  ],
  jury: [
    { id: "judge",       phi: 1.38, theta:  0.0,  label: "القاضي",       w: 0.15, h: 0.22 },
    { id: "accused",     phi: 1.65, theta:  0.58, label: "المتهم",       w: 0.14, h: 0.26 },
    { id: "prosecution", phi: 1.58, theta:  0.90, label: "وكيل النيابة", w: 0.10, h: 0.20 },
    { id: "defense",     phi: 1.58, theta: -0.90, label: "محامي الدفاع", w: 0.10, h: 0.20 },
  ],
};

const PANORAMAS = {
  judge:       "/court/panorama_judge.jpg",
  prosecution: "/court/panorama_prosecution.jpg",
  defense:     "/court/panorama_defense.jpg",
  accused:     "/court/panorama_accused.jpg",
  jury:        "/court/panorama_jury.jpg",
};

const ROLE_AR = {
  judge: "القاضي", prosecution: "وكيل النيابة",
  defense: "محامي الدفاع", accused: "المتهم", jury: "المحلفون",
};

function sphericalToScreen(phi, theta, camera, w, h) {
  const x = Math.sin(phi) * Math.sin(theta);
  const y = Math.cos(phi);
  const z = Math.sin(phi) * Math.cos(theta);
  const vec = new THREE.Vector3(x, y, z);
  vec.project(camera);
  return {
    x: ((vec.x + 1) / 2) * w,
    y: ((-vec.y + 1) / 2) * h,
    visible: vec.z < 1,
  };
}

export default function CourtRoom360({ role, onInteract }) {
  const mountRef    = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef   = useRef(null);
  const sceneRef    = useRef(null);
  const animIdRef   = useRef(null);

  const isDragging  = useRef(false);
  const lastX       = useRef(0);
  const gyroOffset  = useRef(0);
  const gyroCalib   = useRef(false);

  // lon محدود بين -90 و +90 (نصف دائرة)
  const lon         = useRef(0);
  const lat         = useRef(0);

  const [spots, setSpots]         = useState([]);
  const [hoveredId, setHoveredId] = useState(null);
  const [gyroAvail, setGyroAvail] = useState(false);
  const [size, setSize]           = useState({ w: 0, h: 0 });

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth;
    const h = mount.clientHeight;
    setSize({ w, h });

    // Scene
    const scene    = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera   = new THREE.PerspectiveCamera(85, w / h, 0.1, 100);
    camera.position.set(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Sphere — كرة كاملة 360°
    const geo = new THREE.SphereGeometry(50, 64, 64);
    geo.scale(-1, 1, 1);

    const loader = new THREE.TextureLoader();
    const mat    = new THREE.MeshBasicMaterial({ color: 0x1a1008 });
    const sphere = new THREE.Mesh(geo, mat);
    scene.add(sphere);

    const panoUrl = PANORAMAS[role];
    if (panoUrl) {
      loader.load(panoUrl, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        sphere.material = new THREE.MeshBasicMaterial({ map: tex });
      });
    }

    // Animation loop
    const animate = () => {
      animIdRef.current = requestAnimationFrame(animate);

      // تقييد lon بين -90 و +90
      // lon حر 360°
      lat.current = Math.max(-30, Math.min(30, lat.current));

      const phi = THREE.MathUtils.degToRad(90 - lat.current);
      const the = THREE.MathUtils.degToRad(lon.current);
      camera.lookAt(
        Math.sin(phi) * Math.cos(the),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(the)
      );

      renderer.render(scene, camera);

      // تحديث الـ hotspots
      const cw = mount.clientWidth;
      const ch = mount.clientHeight;
      const roleSpots = HOTSPOTS[role] || [];
      setSpots(roleSpots.map(spot => ({
        ...spot,
        ...sphericalToScreen(spot.phi, spot.theta, camera, cw, ch),
        pw: spot.w * cw,
        ph: spot.h * ch,
      })));
    };
    animate();

    // Resize
    const onResize = () => {
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      setSize({ w: nw, h: nh });
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    // Gyro
    if (/Mobi|Android/i.test(navigator.userAgent) && window.DeviceOrientationEvent) {
      setGyroAvail(true);
    }

    return () => {
      cancelAnimationFrame(animIdRef.current);
      window.removeEventListener("resize", onResize);
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [role]);

  // Gyro handler
  useEffect(() => {
    if (!gyroAvail) return;
    const handler = (e) => {
      if (!gyroCalib.current) {
        gyroOffset.current = e.gamma || 0;
        gyroCalib.current  = true;
        return;
      }
      const delta = ((e.gamma || 0) - gyroOffset.current) * 1.4;
      lon.current = delta;
    };
    window.addEventListener("deviceorientation", handler, true);
    return () => window.removeEventListener("deviceorientation", handler, true);
  }, [gyroAvail]);

  // Mouse
  const onMouseDown = (e) => { isDragging.current = true; lastX.current = e.clientX; };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    lon.current -= (e.clientX - lastX.current) * 0.25;
    lastX.current = e.clientX;
  };
  const onMouseUp = () => { isDragging.current = false; };

  // Touch
  const onTouchStart = (e) => {
    if (gyroAvail) return;
    isDragging.current = true;
    lastX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e) => {
    if (!isDragging.current || gyroAvail) return;
    lon.current -= (e.touches[0].clientX - lastX.current) * 0.3;
    lastX.current = e.touches[0].clientX;
  };
  const onTouchEnd = () => { isDragging.current = false; };

  return (
    <div className="relative w-full h-full">
      {/* Canvas */}
      <div
        ref={mountRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={onMouseDown} onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}    onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 80px rgba(0,0,0,0.65)" }} />

      {/* Hotspots */}
      {spots.map(spot => {
        if (!spot.visible) return null;
        const isHover = hoveredId === spot.id;
        return (
          <button
            key={spot.id}
            className="absolute transition-all duration-150"
            style={{
              left:   spot.x - spot.pw / 2,
              top:    spot.y - spot.ph / 2,
              width:  spot.pw,
              height: spot.ph,
              background: isHover ? "rgba(255,255,255,0.07)" : "transparent",
              border: isHover ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent",
              borderRadius: 10,
              zIndex: 10,
            }}
            onMouseEnter={() => setHoveredId(spot.id)}
            onMouseLeave={() => setHoveredId(null)}
            onTouchStart={(e) => { e.stopPropagation(); setHoveredId(spot.id); }}
            onClick={(e) => {
              e.stopPropagation();
              if (spot.id !== role) onInteract?.(spot.id);
            }}
          >
            {isHover && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white/70 text-xs font-bold whitespace-nowrap px-2 py-0.5 rounded-full pointer-events-none"
                style={{ background: "rgba(0,0,0,0.55)" }}>
                {spot.label}
              </span>
            )}
          </button>
        );
      })}

      {/* شريط معلومات */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-between px-3 pointer-events-none">
        <span className="text-white/20 text-xs">{ROLE_AR[role] || ""}</span>
        <span className="text-white/20 text-xs">
          {gyroAvail ? "حرّك الجهاز للالتفاف 360°" : "اسحب للالتفاف 360°"}
        </span>
      </div>

      {/* زر ضبط Gyro */}
      {gyroAvail && (
        <button
          className="absolute bottom-2 left-3 text-white/40 text-xs bg-black/30 px-2 py-1 rounded-lg pointer-events-auto"
          onClick={(e) => { e.stopPropagation(); gyroCalib.current = false; }}
        >🧭</button>
      )}
    </div>
  );
}