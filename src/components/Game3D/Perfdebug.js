import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

// مكوّن تشخيص مؤقت: بيعرض الـ FPS وعدد الـ draw calls والمثلثات والخامات على الشاشة.
// حطه جوه <Canvas> وامسحه بعد ما نخلص.
export default function PerfDebug() {
  const gl = useThree((s) => s.gl);
  const elRef = useRef(null);
  const acc = useRef({ t: 0, frames: 0 });

  useEffect(() => {
    const el = document.createElement('div');
    el.style.cssText =
      'position:fixed;top:60px;left:12px;z-index:9999;padding:6px 10px;' +
      'background:rgba(0,0,0,.7);color:#0f0;font:12px monospace;' +
      'pointer-events:none;white-space:pre;border-radius:6px';
    document.body.appendChild(el);
    elRef.current = el;
    return () => el.remove();
  }, []);

  useFrame((_, delta) => {
    const a = acc.current;
    a.t += delta;
    a.frames += 1;

    if (a.t >= 0.5 && elRef.current) {
      const { render, memory } = gl.info;
      elRef.current.textContent =
        `FPS         ${Math.round(a.frames / a.t)}\n` +
        `Draw calls  ${render.calls}\n` +
        `Triangles   ${render.triangles.toLocaleString()}\n` +
        `Geometries  ${memory.geometries}\n` +
        `Textures    ${memory.textures}`;
      a.t = 0;
      a.frames = 0;
    }
  });

  return null;
}