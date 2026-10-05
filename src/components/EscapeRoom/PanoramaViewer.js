import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import * as THREE from 'three';
import useEscapeStore from './store/useEscapeStore';

const FOV_DEFAULT = 75;
const FOV_MIN = 50;
const FOV_MAX = 90;

const PanoramaViewer = forwardRef(function PanoramaViewer(
  {
    panoramaUrl,
    hotspots = [],
    controlMode = 'drag',
    onHotspotClick,
    isDark = false,
    flashlightOn = false,
    hasFlashlight = false,
    children,
  },
  ref
) {
  const mountRef = useRef(null);

  const solvedPuzzles = useEscapeStore((s) => s.solvedPuzzles);
  const solvedPuzzlesKey = Object.keys(solvedPuzzles).sort().join(',');

  // Debug mode
  const [debugMode, setDebugMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      new URLSearchParams(window.location.search).has('debug') ||
      window.erDebug === true
    );
  });

  const stateRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    lon: 0,
    lat: 0,
    fov: FOV_DEFAULT,
    targetFov: FOV_DEFAULT,
    isDragging: false,
    isPinching: false,
    pinchStartDist: 0,
    pinchStartFov: FOV_DEFAULT,
    prevMouse: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    anchorMeshes: [],
    lastTapAt: 0,
    flyAnim: null,
  });

  const [hotspotScreen, setHotspotScreen] = useState([]);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const zoomIndicatorTimeout = useRef(null);

  // ✅ موضع الكشاف على الشاشة (نسبة مئوية)
  const [flashlightScreen, setFlashlightScreen] = useState({ x: 50, y: 50 });

  // استمع لتغيير window.erDebug
  useEffect(() => {
    const check = () => {
      if (window.erDebug && !debugMode) setDebugMode(true);
    };
    window.addEventListener('erDebugToggle', check);
    const interval = setInterval(check, 500);
    return () => {
      window.removeEventListener('erDebugToggle', check);
      clearInterval(interval);
    };
  }, [debugMode]);

  useImperativeHandle(ref, () => ({
    flyTo: ({ lon, lat, fov, duration = 700 }) => {
      const st = stateRef.current;
      st.flyAnim = {
        startLon: st.lon,
        startLat: st.lat,
        startFov: st.fov,
        endLon: lon !== undefined ? lon : st.lon,
        endLat: lat !== undefined ? lat : st.lat,
        endFov: fov !== undefined ? fov : st.fov,
        startTime: performance.now(),
        duration,
      };
      st.velocity = { x: 0, y: 0 };
    },
    setFov: (fov, duration = 500) => {
      const st = stateRef.current;
      st.flyAnim = {
        startLon: st.lon,
        startLat: st.lat,
        startFov: st.fov,
        endLon: st.lon,
        endLat: st.lat,
        endFov: Math.max(FOV_MIN, Math.min(FOV_MAX, fov)),
        startTime: performance.now(),
        duration,
      };
    },
    getFov: () => stateRef.current.fov,
    getLonLat: () => ({
      lon: stateRef.current.lon,
      lat: stateRef.current.lat,
    }),
  }));

  const flashZoomIndicator = () => {
    setShowZoomIndicator(true);
    if (zoomIndicatorTimeout.current) clearTimeout(zoomIndicatorTimeout.current);
    zoomIndicatorTimeout.current = setTimeout(() => {
      setShowZoomIndicator(false);
    }, 1200);
  };

  // ========== Setup Three.js ==========
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV_DEFAULT, width / height, 0.1, 1000);
    camera.position.set(0, 0, 0.1);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const st = stateRef.current;
    st.scene = scene;
    st.camera = camera;
    st.renderer = renderer;

    const loader = new THREE.TextureLoader();
    loader.load(panoramaUrl, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

      const segments = isMobile ? 40 : 64;
      const geo = new THREE.SphereGeometry(500, segments, Math.floor(segments * 0.66));
      geo.scale(-1, 1, 1);
      const mat = new THREE.MeshBasicMaterial({ map: texture });
      scene.add(new THREE.Mesh(geo, mat));
    });

    const solved = useEscapeStore.getState().solvedPuzzles || {};
    const visibleHotspots = hotspots.filter((h) => {
      if (h.requiresPuzzle && !solved[h.requiresPuzzle]) return false;
      return true;
    });

    const anchorMeshes = [];
    visibleHotspots.forEach((h) => {
      const { theta = 0, phi = 90 } = h.position || {};
      const phiRad = (phi * Math.PI) / 180;
      const thetaRad = (theta * Math.PI) / 180;
      const r = 100;
      const x = r * Math.sin(phiRad) * Math.cos(thetaRad);
      const y = r * Math.cos(phiRad);
      const z = r * Math.sin(phiRad) * Math.sin(thetaRad);

      const geo = new THREE.SphereGeometry(8, 8, 8);
      const mat = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.userData.hotspot = h;
      scene.add(mesh);
      anchorMeshes.push(mesh);
    });
    st.anchorMeshes = anchorMeshes;

    let isVisible = !document.hidden;
    const onVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', onVisibility);

    const TARGET_FPS = isMobile ? 30 : 60;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;
    let lastRender = 0;

    const clock = new THREE.Clock();
    let raf;

    const animate = (now = 0) => {
      raf = requestAnimationFrame(animate);
      if (!isVisible) return;
      if (now - lastRender < FRAME_INTERVAL) return;
      lastRender = now;

      const dt = Math.min(clock.getDelta(), 0.1);

      if (st.flyAnim) {
        const { startLon, startLat, startFov, endLon, endLat, endFov, startTime, duration } = st.flyAnim;
        const elapsed = performance.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        st.lon = startLon + (endLon - startLon) * ease;
        st.lat = startLat + (endLat - startLat) * ease;
        st.fov = startFov + (endFov - startFov) * ease;

        if (t >= 1) st.flyAnim = null;
      } else {
        st.lon += st.velocity.x * dt * 60;
        st.lat += st.velocity.y * dt * 60;
        st.velocity.x *= 0.92;
        st.velocity.y *= 0.92;
        st.fov += (st.targetFov - st.fov) * Math.min(1, dt * 8);
      }

      st.lat = Math.max(-85, Math.min(85, st.lat));
      st.fov = Math.max(FOV_MIN, Math.min(FOV_MAX, st.fov));

      if (camera.fov !== st.fov) {
        camera.fov = st.fov;
        camera.updateProjectionMatrix();
      }

      const phiRad = (90 - st.lat) * (Math.PI / 180);
      const thetaRad = st.lon * (Math.PI / 180);
      const target = new THREE.Vector3(
        Math.sin(phiRad) * Math.cos(thetaRad),
        Math.cos(phiRad),
        Math.sin(phiRad) * Math.sin(thetaRad)
      );
      camera.lookAt(target);

      const w = mount.clientWidth;
      const h = mount.clientHeight;
      const screenList = anchorMeshes
        .map((mesh) => {
          const v = mesh.position.clone().project(camera);
          if (v.z > 1) return null;
          return {
            id: mesh.userData.hotspot.id,
            x: ((v.x + 1) / 2) * w,
            y: ((-v.y + 1) / 2) * h,
            data: mesh.userData.hotspot,
          };
        })
        .filter(Boolean);

      setHotspotScreen(screenList);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (o.material.map) o.material.map.dispose();
          o.material.dispose();
        }
      });
    };
  }, [panoramaUrl, hotspots, solvedPuzzlesKey]);

  // ========== Flashlight — Mouse Tracker (Desktop) ==========
  useEffect(() => {
    if (!flashlightOn || !isDark) return;

    const onMouseMove = (e) => {
      if (stateRef.current.isDragging) return;
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setFlashlightScreen({ x, y });
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [flashlightOn, isDark]);

  // ========== Flashlight — Gyroscope (Mobile) ==========
  useEffect(() => {
    if (!flashlightOn || !isDark) return;
    if (!/Mobi|Android/i.test(navigator.userAgent)) return;

    const onGyro = (e) => {
      if (e.gamma == null || e.beta == null) return;
      const x = Math.max(0, Math.min(100, 50 + e.gamma * 1.5));
      const y = Math.max(0, Math.min(100, 50 + (e.beta - 45) * 1.5));
      setFlashlightScreen({ x, y });
    };

    window.addEventListener('deviceorientation', onGyro);
    return () => window.removeEventListener('deviceorientation', onGyro);
  }, [flashlightOn, isDark]);

  // ========== Mouse Drag + Wheel Zoom ==========
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    if (controlMode === 'gyro') return;

    const onDown = (e) => {
      const st = stateRef.current;
      st.isDragging = true;
      st.flyAnim = null;
      const p = e.touches ? e.touches[0] : e;
      st.prevMouse = { x: p.clientX, y: p.clientY };
      st.velocity = { x: 0, y: 0 };
    };

    const onMove = (e) => {
      const st = stateRef.current;
      if (!st.isDragging || st.isPinching) return;
      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - st.prevMouse.x;
      const dy = p.clientY - st.prevMouse.y;
      st.prevMouse = { x: p.clientX, y: p.clientY };

      st.lon -= dx * 0.12;
      st.lat += dy * 0.12;
      st.velocity.x = -dx * 0.05;
      st.velocity.y = dy * 0.05;
    };

    const onUp = () => {
      stateRef.current.isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      const st = stateRef.current;
      st.flyAnim = null;
      const delta = e.deltaY > 0 ? 1 : -1;
      st.targetFov = Math.max(FOV_MIN, Math.min(FOV_MAX, st.targetFov + delta * 4));
      flashZoomIndicator();
    };

    mount.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    mount.addEventListener('touchstart', onDown, { passive: true });
    mount.addEventListener('touchmove', onMove, { passive: true });
    mount.addEventListener('touchend', onUp);
    mount.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      mount.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      mount.removeEventListener('touchstart', onDown);
      mount.removeEventListener('touchmove', onMove);
      mount.removeEventListener('touchend', onUp);
      mount.removeEventListener('wheel', onWheel);
    };
  }, [controlMode]);

  // ========== Pinch + Double Tap ==========
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const getTouchDistance = (touches) => {
      const [a, b] = touches;
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    };

    const onTouchStart = (e) => {
      const st = stateRef.current;

      if (e.touches.length === 2) {
        st.isPinching = true;
        st.isDragging = false;
        st.flyAnim = null;
        st.pinchStartDist = getTouchDistance(e.touches);
        st.pinchStartFov = st.targetFov;
        return;
      }

      if (e.touches.length === 1) {
        const now = Date.now();
        if (now - st.lastTapAt < 300) {
          st.flyAnim = null;
          st.targetFov = st.targetFov > (FOV_DEFAULT + FOV_MIN) / 2 ? FOV_MIN : FOV_DEFAULT;
          flashZoomIndicator();
          st.lastTapAt = 0;
        } else {
          st.lastTapAt = now;
        }
      }
    };

    const onTouchMove = (e) => {
      const st = stateRef.current;
      if (!st.isPinching || e.touches.length < 2) return;
      const dist = getTouchDistance(e.touches);
      const ratio = st.pinchStartDist / dist;
      const newFov = Math.max(FOV_MIN, Math.min(FOV_MAX, st.pinchStartFov * ratio));
      st.targetFov = newFov;
      flashZoomIndicator();
    };

    const onTouchEnd = (e) => {
      if (e.touches.length < 2) {
        stateRef.current.isPinching = false;
      }
    };

    mount.addEventListener('touchstart', onTouchStart, { passive: true });
    mount.addEventListener('touchmove', onTouchMove, { passive: true });
    mount.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      mount.removeEventListener('touchstart', onTouchStart);
      mount.removeEventListener('touchmove', onTouchMove);
      mount.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  // ========== Gyro (للكاميرا) ==========
  useEffect(() => {
    if (controlMode !== 'gyro' && controlMode !== 'both') return;
    const handler = (e) => {
      if (e.alpha == null) return;
      const st = stateRef.current;
      if (st.flyAnim) return;
      st.lon = -e.alpha * 0.8;
      st.lat = (e.beta - 90) * 0.5;
    };
    window.addEventListener('deviceorientation', handler);
    return () => window.removeEventListener('deviceorientation', handler);
  }, [controlMode]);

  // ========== Click Handler ==========
  const handleClick = (e) => {
    const st = stateRef.current;
    if (st.isDragging || st.isPinching) return;

    const mount = mountRef.current;
    if (!mount) return;
    const rect = mount.getBoundingClientRect();
    const p = e.changedTouches ? e.changedTouches[0] : e;
    const cx = p.clientX - rect.left;
    const cy = p.clientY - rect.top;

    if (debugMode) {
      const ndcX = (cx / rect.width) * 2 - 1;
      const ndcY = -(cy / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera({ x: ndcX, y: ndcY }, st.camera);

      const dir = raycaster.ray.direction.clone().normalize();
      const point = dir.multiplyScalar(500);

      const phi = Math.acos(Math.max(-1, Math.min(1, point.y / 500))) * (180 / Math.PI);
      let theta = Math.atan2(point.z, point.x) * (180 / Math.PI);
      if (theta < 0) theta += 360;

      const thetaR = Math.round(theta);
      const phiR = Math.round(phi);

      console.log(
        `%c📍 { theta: ${thetaR}, phi: ${phiR} }`,
        'background:#f59e0b;color:#000;padding:4px 8px;border-radius:4px;font-weight:bold;font-size:14px;'
      );

      const toast = document.createElement('div');
      toast.textContent = `theta: ${thetaR}, phi: ${phiR}`;
      toast.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #f59e0b;
        color: #000;
        padding: 10px 20px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 99999;
        font-size: 16px;
        font-family: monospace;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        pointer-events: none;
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
    }

    let closest = null;
    let minDist = 45;
    hotspotScreen.forEach((h) => {
      const d = Math.hypot(h.x - cx, h.y - cy);
      if (d < minDist) {
        minDist = d;
        closest = h;
      }
    });

    if (closest) {
      onHotspotClick?.(closest.data);
    }
  };

  // ✅ حساب شدة الإضاءة حسب الأداة
  const getFlashlightGradient = () => {
    if (!flashlightOn) return 'rgba(0, 0, 0, 0.95)';

    // كشاف: دايرة كبيرة (14%)
    if (hasFlashlight) {
      return `radial-gradient(
        circle at ${flashlightScreen.x}% ${flashlightScreen.y}%,
        rgba(255, 240, 200, 0.15) 0%,
        transparent 14%,
        rgba(0, 0, 0, 0.45) 30%,
        rgba(0, 0, 0, 0.92) 55%,
        rgba(0, 0, 0, 0.98) 80%
      )`;
    }

    // ولاعة: دايرة صغيرة (6%)
    return `radial-gradient(
      circle at ${flashlightScreen.x}% ${flashlightScreen.y}%,
      rgba(255, 180, 80, 0.2) 0%,
      transparent 6%,
      rgba(0, 0, 0, 0.75) 18%,
      rgba(0, 0, 0, 0.95) 40%,
      rgba(0, 0, 0, 0.98) 70%
    )`;
  };

  return (
    <div
      ref={mountRef}
      onClick={handleClick}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    >
      {children}

      {/* ✅ طبقة الظلام + الكشاف / الولاعة */}
      {isDark && (
        <div
          className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
          style={{
            background: getFlashlightGradient(),
          }}
        />
      )}

      {/* مؤشر الزوم */}
      <div
        className={`absolute bottom-24 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur text-white text-xs font-bold transition-opacity duration-300 pointer-events-none z-20 ${
          showZoomIndicator ? 'opacity-100' : 'opacity-0'
        }`}
      >
        🔍 {Math.round((FOV_DEFAULT / stateRef.current.fov) * 10) / 10}x
      </div>

      {/* Debug Badge */}
      {debugMode && (
        <div className="absolute top-20 right-4 z-50 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold shadow-lg pointer-events-none animate-pulse">
          🎯 DEBUG MODE — اضغط على أي حاجة
        </div>
      )}
    </div>
  );
});

export default PanoramaViewer;