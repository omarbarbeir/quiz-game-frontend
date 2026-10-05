import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// ثوابت
// ═══════════════════════════════════════════════════════════════
const IMAGES_BASE = "/urbex/images/";
const AUDIO_BASE  = "/urbex/audio/";

const PING_TYPES = {
  attention:  { icon: "📍", color: "#c9a84c", labelAr: "انتبه هنا",    labelEn: "Attention here"  },
  found_clue: { icon: "🔍", color: "#4caf50", labelAr: "لقيت دليل",    labelEn: "Found a clue"    },
  need_help:  { icon: "❗", color: "#ef4444", labelAr: "محتاج مساعدة", labelEn: "Need help"       },
};

const TOOL_ICONS = {
  flashlight: "🔦",
  uv_light:   "💜",
  crowbar:    "🔧",
  metal_detector: "📡",
};

// ═══════════════════════════════════════════════════════════════
// Ambient Sound Manager
// ═══════════════════════════════════════════════════════════════
class SoundManager {
  constructor() {
    this.ctx      = null;
    this.current  = null;
    this.gainNode = null;
  }
  init() {
    if (!this.ctx) {
      this.ctx      = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
    }
  }
  async play(url, loop = true) {
    try {
      this.init();
      if (this.current) { this.current.stop(); this.current = null; }
      const res  = await fetch(AUDIO_BASE + url);
      const buf  = await res.arrayBuffer();
      const decoded = await this.ctx.decodeAudioData(buf);
      const src  = this.ctx.createBufferSource();
      src.buffer = decoded;
      src.loop   = loop;
      src.connect(this.gainNode);
      src.start();
      this.current = src;
    } catch (_) {}
  }
  fadeOut() {
    if (!this.gainNode || !this.ctx) return;
    this.gainNode.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
    setTimeout(() => {
      if (this.current) { try { this.current.stop(); } catch(_){} this.current = null; }
      if (this.gainNode) this.gainNode.gain.setTargetAtTime(0.7, this.ctx.currentTime, 0.1);
    }, 1200);
  }
  playInfrasound() {
    try {
      this.init();
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.frequency.value = 18.98;
      gain.gain.value     = 0.25;
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      setTimeout(() => { try { osc.stop(); } catch(_){} }, 8000);
    } catch (_) {}
  }
  playClick() {
    try {
      this.init();
      const buf  = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.05, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++)
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.01)) * 0.3;
      const src = this.ctx.createBufferSource();
      src.buffer = buf; src.connect(this.ctx.destination); src.start();
    } catch (_) {}
  }
}
const soundMgr = new SoundManager();

// ═══════════════════════════════════════════════════════════════
// 360° Panorama Viewer
// ═══════════════════════════════════════════════════════════════
function PanoramaView({ imageUrl, hotspots, onHotspotClick, activeTool, children }) {
  const containerRef = useRef(null);
  const [angle,    setAngle]    = useState(0);         // −180 .. 180 (yaw)
  const [pitchAng, setPitch]    = useState(0);         // −30  ..  30 (pitch)
  const [dragging, setDragging] = useState(false);
  const startRef   = useRef({ x: 0, y: 0, angle: 0, pitch: 0 });
  const gyroRef    = useRef({ alpha: null, enabled: false });

  // ── Gyroscope ──────────────────────────────────────────────
  useEffect(() => {
    const handler = e => {
      if (!gyroRef.current.enabled) return;
      const yaw   = e.alpha || 0;
      const pitch = (e.beta  || 0) - 90;
      setAngle((-yaw + 180) % 360 - 180);
      setPitch(Math.max(-35, Math.min(35, pitch)));
    };
    if ("DeviceOrientationEvent" in window) {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        // iOS 13+
      } else {
        gyroRef.current.enabled = true;
        window.addEventListener("deviceorientation", handler);
      }
    }
    return () => window.removeEventListener("deviceorientation", handler);
  }, []);

  const requestGyro = async () => {
    if (typeof DeviceOrientationEvent?.requestPermission === "function") {
      const perm = await DeviceOrientationEvent.requestPermission();
      if (perm === "granted") {
        gyroRef.current.enabled = true;
        window.addEventListener("deviceorientation", e => {
          const yaw   = e.alpha || 0;
          const pitch = (e.beta || 0) - 90;
          setAngle((-yaw + 180) % 360 - 180);
          setPitch(Math.max(-35, Math.min(35, pitch)));
        });
      }
    }
  };

  // ── Mouse / Touch ──────────────────────────────────────────
  const onPointerDown = e => {
    if (gyroRef.current.enabled) return;
    setDragging(true);
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    startRef.current = { x: cx, y: cy, angle, pitch: pitchAng };
  };
  const onPointerMove = useCallback(e => {
    if (!dragging || gyroRef.current.enabled) return;
    const cx   = e.touches ? e.touches[0].clientX : e.clientX;
    const cy   = e.touches ? e.touches[0].clientY : e.clientY;
    const dx   = cx - startRef.current.x;
    const dy   = cy - startRef.current.y;
    setAngle(a => {
      const next = startRef.current.angle + dx * 0.25;
      return Math.max(-180, Math.min(180, next));
    });
    setPitch(Math.max(-35, Math.min(35, startRef.current.pitch - dy * 0.15)));
  }, [dragging]);
  const onPointerUp = () => setDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove",  onPointerMove);
    window.addEventListener("mouseup",    onPointerUp);
    window.addEventListener("touchmove",  onPointerMove, { passive: true });
    window.addEventListener("touchend",   onPointerUp);
    return () => {
      window.removeEventListener("mousemove",  onPointerMove);
      window.removeEventListener("mouseup",    onPointerUp);
      window.removeEventListener("touchmove",  onPointerMove);
      window.removeEventListener("touchend",   onPointerUp);
    };
  }, [onPointerMove]);

  // ── تحويل الزاوية لموضع CSS ───────────────────────────────
  // نحوّل الصورة البانورامية لـ translateX
  // الصورة عرضها 300% — تمشي من 0% لـ 66%
  const pct = ((angle + 180) / 360) * 66.67;

  // ── فلتر الأداة النشطة ────────────────────────────────────
  const toolFilter = {
    flashlight:  "brightness(1.6) contrast(1.1)",
    uv_light:    "hue-rotate(270deg) saturate(1.8) brightness(0.7)",
    crowbar:     "none",
    default:     "brightness(0.85) contrast(1.05)",
  };
  const activeFilter = activeTool ? (toolFilter[activeTool] || "none") : toolFilter.default;

  // ── رسم الـ Hotspots ──────────────────────────────────────
  // كل hotspot له موضع x,y (%) نحوّله حسب الزاوية الحالية
  const visibleHotspots = hotspots?.filter(h => {
    const hAngle = (h.x / 100) * 360 - 180;
    const diff   = Math.abs(hAngle - angle);
    return diff < 90 || diff > 270;
  }) || [];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
      onMouseDown={onPointerDown}
      onTouchStart={onPointerDown}
    >
      {/* ── الصورة البانورامية ── */}
      <div
        className="absolute top-0 h-full"
        style={{
          width: "300%",
          left: `-${pct}%`,
          top:  `${pitchAng * 0.8}%`,
          transition: dragging ? "none" : "left 0.05s linear, top 0.1s linear",
          willChange: "left, top",
        }}
      >
        {imageUrl ? (
          <img
            src={IMAGES_BASE + imageUrl}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: activeFilter, userSelect: "none", pointerEvents: "none" }}
            draggable={false}
          />
        ) : (
          /* Placeholder جميل لما الصورة مش موجودة */
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: "radial-gradient(ellipse at 40% 40%, #1a1008 0%, #0a0704 60%, #050302 100%)",
              filter: activeFilter,
            }}
          >
            <div className="text-center opacity-20">
              <p className="text-[#c9a84c] text-6xl mb-4">🌲</p>
              <p className="text-[#c9a84c] text-sm tracking-widest">LOADING SCENE...</p>
            </div>
          </div>
        )}
      </div>

      {/* ── تأثير حواف الشاشة ── */}
      <div className="pointer-events-none absolute inset-0"
        style={{ boxShadow: "inset 0 0 80px rgba(0,0,0,0.7)", zIndex: 2 }} />

      {/* ── طبقة UV ── */}
      {activeTool === "uv_light" && (
        <div className="pointer-events-none absolute inset-0 z-3"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(100,0,150,0.15) 0%, rgba(80,0,120,0.05) 60%, transparent 100%)" }} />
      )}

      {/* ── Hotspots ── */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {visibleHotspots.map(h => {
          // حساب موضع الـ hotspot على الشاشة
          const hAngle = (h.x / 100) * 360 - 180;
          const relAngle = hAngle - angle;
          const screenX  = 50 + (relAngle / 90) * 50;
          const screenY  = h.y + (pitchAng * -0.5);
          if (screenX < 2 || screenX > 98) return null;

          const needsTool = h.requiresTool && h.requiresTool !== activeTool;
          const icon = h.type === "navigate" ? "→"
            : h.requiresTool === "flashlight" ? "🔦"
            : h.requiresTool === "uv_light"   ? "💜"
            : h.requiresTool === "crowbar"     ? "🔧"
            : h.type === "puzzle"              ? "⚙"
            : "◉";

          // حجم الـ hotspot — أكبر على الموبايل
          const btnSize = window.innerWidth < 640 ? "w-14 h-14" : "w-10 h-10";
          const iconSize = window.innerWidth < 640 ? "text-lg" : "text-sm";

          return (
            <button
              key={h.id}
              className="pointer-events-auto absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${screenX}%`, top: `${screenY}%` }}
              onClick={e => { e.stopPropagation(); if (!needsTool) onHotspotClick?.(h); soundMgr.playClick(); }}
            >
              {/* لو hidden — منطقة ضغط شفافة بدون مؤشر */}
              {h.hidden ? (
                <div className="w-16 h-16 rounded-full opacity-0 hover:opacity-5 hover:bg-white transition-opacity duration-300" />
              ) : (
                <>
                  {/* الحلقة الخارجية */}
                  <div className={`
                    relative ${btnSize} rounded-full flex items-center justify-center
                    border transition-all duration-300
                    ${needsTool
                      ? "border-[#5a4a3a]/40 bg-[#0d0a06]/40 opacity-50"
                      : h.type === "navigate"
                        ? "border-[#c9a84c]/60 bg-[#c9a84c]/10 hover:bg-[#c9a84c]/20 hover:scale-110 animate-pulse-slow"
                        : h.type === "puzzle"
                          ? "border-[#8b5cf6]/60 bg-[#8b5cf6]/10 hover:bg-[#8b5cf6]/20 hover:scale-110"
                          : "border-[#4caf50]/60 bg-[#4caf50]/10 hover:bg-[#4caf50]/20 hover:scale-110"
                    }
                  `}>
                    <span className={`${iconSize} ${needsTool ? "opacity-40" : ""}`}>{icon}</span>

                    {/* نبض */}
                    {!needsTool && (
                      <span className="absolute inset-0 rounded-full animate-ping opacity-20"
                        style={{ border: `1px solid ${h.type === "navigate" ? "#c9a84c" : h.type === "puzzle" ? "#8b5cf6" : "#4caf50"}` }} />
                    )}
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                    <div className="bg-[#0d0a06]/95 border border-[#2a1f14] px-2 py-1 text-xs text-[#e8d9b0] tracking-wide">
                      {needsTool ? (TOOL_ICONS[h.requiresTool] + " مطلوب") : (h.labelAr || h.labelEn || "")}
                    </div>
                  </div>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* زرار الجايروسكوب (iOS) */}
      {!gyroRef.current.enabled && typeof DeviceOrientationEvent?.requestPermission === "function" && (
        <button
          onClick={requestGyro}
          className="absolute top-4 left-4 z-20 text-xs border border-[#2a1f14] bg-[#0d0a06]/80 text-[#5a4a3a] hover:text-[#c9a84c] px-2 py-1 tracking-wider"
        >
          🔄 تفعيل الجايروسكوب
        </button>
      )}

      {/* المحتوى الإضافي */}
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Puzzle Overlays
// ═══════════════════════════════════════════════════════════════

// ── رقم سري ──
function NumberPadPuzzle({ puzzle, lang, onSolve, onClose }) {
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const isRtl = lang === "ar";

  const press = v => {
    if (input.length >= 6) return;
    setInput(p => p + v);
  };
  const del = () => setInput(p => p.slice(0, -1));
  const submit = () => {
    if (input === puzzle.code) { onSolve(input); }
    else { setShake(true); setTimeout(() => { setShake(false); setInput(""); }, 600); }
  };

  return (
    <PuzzleWrapper title={isRtl ? puzzle.titleAr : puzzle.titleEn} onClose={onClose}>
      <p className="text-[#8a7a6a] text-xs text-center mb-4 leading-relaxed">
        {isRtl ? puzzle.descriptionAr : puzzle.descriptionEn}
      </p>

      {/* العرض */}
      <div className={`flex justify-center gap-2 mb-6 transition-all ${shake ? "animate-shake" : ""}`}>
        {Array.from({ length: puzzle.code?.length || 4 }).map((_, i) => (
          <div key={i} className="w-10 h-12 border border-[#3a2812] bg-[#0d0a06] flex items-center justify-center">
            <span className="text-[#c9a84c] text-xl font-mono">{input[i] || "·"}</span>
          </div>
        ))}
      </div>

      {/* لوحة الأرقام */}
      <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
        {[1,2,3,4,5,6,7,8,9].map(n => (
          <button key={n} onClick={() => press(String(n))}
            className="h-11 border border-[#2a1f14] bg-[#0d0a06]/80 text-[#e8d9b0] text-lg font-mono hover:border-[#c9a84c]/40 hover:bg-[#c9a84c]/5 transition-all">
            {n}
          </button>
        ))}
        <button onClick={del}
          className="h-11 border border-[#2a1f14] bg-[#0d0a06]/80 text-[#8a7a6a] hover:text-[#c97070] transition-all text-sm">
          ⌫
        </button>
        <button onClick={() => press("0")}
          className="h-11 border border-[#2a1f14] bg-[#0d0a06]/80 text-[#e8d9b0] text-lg font-mono hover:border-[#c9a84c]/40 hover:bg-[#c9a84c]/5 transition-all">
          0
        </button>
        <button onClick={submit}
          className="h-11 border border-[#c9a84c]/40 bg-[#c9a84c]/10 text-[#c9a84c] text-sm hover:bg-[#c9a84c]/20 transition-all">
          ✓
        </button>
      </div>

      <p className="text-[#5a4a3a] text-xs text-center mt-4 italic">
        {isRtl ? `💡 ${puzzle.hintAr}` : `💡 ${puzzle.hintEn}`}
      </p>
    </PuzzleWrapper>
  );
}

// ── بوصلة ──
function CompassPuzzle({ puzzle, lang, onSolve, onClose }) {
  const [steps, setSteps]   = useState([]);
  const [shake, setShake]   = useState(false);
  const isRtl = lang === "ar";
  const dirs  = ["N","E","S","W"];
  const dirLabels = { N: isRtl ? "ش" : "N", E: isRtl ? "م" : "E", S: isRtl ? "ج" : "S", W: isRtl ? "غ" : "W" };
  const angles    = { N: 0, E: 90, S: 180, W: 270 };
  const angle     = steps.length > 0 ? angles[steps[steps.length - 1]] : 0;

  const pressDir = d => {
    const next = [...steps, d];
    setSteps(next);
    if (next.length === puzzle.sequence.length) {
      if (JSON.stringify(next) === JSON.stringify(puzzle.sequence)) onSolve(next);
      else { setShake(true); setTimeout(() => { setShake(false); setSteps([]); }, 700); }
    }
  };

  return (
    <PuzzleWrapper title={isRtl ? puzzle.titleAr : puzzle.titleEn} onClose={onClose}>
      <p className="text-[#8a7a6a] text-xs text-center mb-6 leading-relaxed">
        {isRtl ? puzzle.descriptionAr : puzzle.descriptionEn}
      </p>

      {/* البوصلة */}
      <div className="flex justify-center mb-6">
        <div className={`relative w-32 h-32 rounded-full border-2 border-[#3a2812] bg-[#0d0a06]/80 flex items-center justify-center ${shake ? "animate-shake" : ""}`}>
          {/* شرفات البوصلة */}
          {dirs.map(d => (
            <span key={d} className="absolute text-[#5a4a3a] text-xs font-bold"
              style={{
                top:    d === "N" ? "8px"  : d === "S" ? "auto" : "50%",
                bottom: d === "S" ? "8px"  : "auto",
                left:   d === "W" ? "8px"  : d === "E" ? "auto" : "50%",
                right:  d === "E" ? "8px"  : "auto",
                transform: (d === "N" || d === "S") ? "translateX(-50%)" : "translateY(-50%)",
              }}>
              {dirLabels[d]}
            </span>
          ))}

          {/* الإبرة */}
          <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500"
            style={{ transform: `rotate(${angle}deg)` }}>
            <div className="w-0.5 h-12 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0"
                style={{ borderLeft:"4px solid transparent", borderRight:"4px solid transparent", borderBottom:"24px solid #ef4444" }} />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0"
                style={{ borderLeft:"4px solid transparent", borderRight:"4px solid transparent", borderTop:"24px solid #e8d9b0" }} />
            </div>
          </div>
          <div className="absolute w-3 h-3 rounded-full bg-[#c9a84c] z-10" />
        </div>
      </div>

      {/* الخطوات */}
      <div className="flex justify-center gap-1 mb-4 flex-wrap">
        {puzzle.sequence.map((_, i) => (
          <div key={i} className={`w-6 h-6 border text-xs flex items-center justify-center font-bold ${
            steps[i] ? "border-[#c9a84c]/60 text-[#c9a84c]" : "border-[#2a1f14] text-[#3a2812]"
          }`}>
            {steps[i] ? dirLabels[steps[i]] : "·"}
          </div>
        ))}
      </div>

      {/* أزرار الاتجاهات */}
      <div className="grid grid-cols-3 gap-1 max-w-[130px] mx-auto">
        <div /><button onClick={() => pressDir("N")} className="compassBtn">{dirLabels.N}</button><div />
        <button onClick={() => pressDir("W")} className="compassBtn">{dirLabels.W}</button>
        <button onClick={() => setSteps([])} className="compassBtn text-[#5a4a3a] text-xs">↺</button>
        <button onClick={() => pressDir("E")} className="compassBtn">{dirLabels.E}</button>
        <div /><button onClick={() => pressDir("S")} className="compassBtn">{dirLabels.S}</button><div />
      </div>

      <style>{`.compassBtn{height:36px;border:1px solid #2a1f14;background:#0d0a06cc;color:#e8d9b0;font-weight:700;font-size:13px;transition:all .2s}.compassBtn:hover{border-color:#c9a84c44;background:#c9a84c0d}`}</style>
      <p className="text-[#5a4a3a] text-xs text-center mt-4 italic">
        {isRtl ? `💡 ${puzzle.hintAr}` : `💡 ${puzzle.hintEn}`}
      </p>
    </PuzzleWrapper>
  );
}

// ── تسلسل الرموز ──
function SymbolComboPuzzle({ puzzle, lang, onSolve, onClose }) {
  const [selected, setSelected] = useState([]);
  const [shake, setShake]       = useState(false);
  const isRtl = lang === "ar";

  const pressSymbol = (idx) => {
    if (selected.length >= puzzle.correctSequence.length) return;
    const next = [...selected, idx];
    setSelected(next);
    if (next.length === puzzle.correctSequence.length) {
      if (JSON.stringify(next) === JSON.stringify(puzzle.correctSequence)) onSolve(next);
      else { setShake(true); setTimeout(() => { setShake(false); setSelected([]); }, 700); }
    }
  };

  return (
    <PuzzleWrapper title={isRtl ? puzzle.titleAr : puzzle.titleEn} onClose={onClose}>
      <p className="text-[#8a7a6a] text-xs text-center mb-4">{isRtl ? puzzle.descriptionAr : puzzle.descriptionEn}</p>

      {/* العرض */}
      <div className={`flex justify-center gap-2 mb-6 ${shake ? "animate-shake" : ""}`}>
        {Array.from({ length: puzzle.correctSequence.length }).map((_, i) => (
          <div key={i} className="w-10 h-10 border border-[#3a2812] bg-[#0d0a06] flex items-center justify-center text-xl">
            {selected[i] !== undefined ? puzzle.symbols[selected[i]] : "·"}
          </div>
        ))}
      </div>

      {/* الرموز */}
      <div className="flex justify-center gap-3 flex-wrap">
        {puzzle.symbols.map((sym, i) => (
          <button key={i} onClick={() => pressSymbol(i)}
            className="w-12 h-12 border border-[#2a1f14] bg-[#0d0a06]/80 text-2xl hover:border-[#c9a84c]/40 hover:bg-[#c9a84c]/5 transition-all">
            {sym}
          </button>
        ))}
      </div>

      <button onClick={() => setSelected([])} className="block mx-auto mt-3 text-[#5a4a3a] text-xs hover:text-[#c97070] transition-colors">
        {isRtl ? "إعادة" : "Reset"}
      </button>
      <p className="text-[#5a4a3a] text-xs text-center mt-2 italic">
        {isRtl ? `💡 ${puzzle.hintAr}` : `💡 ${puzzle.hintEn}`}
      </p>
    </PuzzleWrapper>
  );
}

// ── لغز الكتب ──
function BookSeqPuzzle({ puzzle, lang, onSolve, onClose }) {
  const [pressed, setPressed] = useState([]);
  const [shake, setShake]     = useState(false);
  const isRtl = lang === "ar";
  const correct = puzzle.books.filter(b => b.correct).sort((a,b) => a.order - b.order).map(b => b.id);

  const pressBook = id => {
    if (pressed.includes(id)) { setPressed(p => p.filter(x => x !== id)); return; }
    const next = [...pressed, id];
    setPressed(next);
    if (next.length === correct.length) {
      if (JSON.stringify(next) === JSON.stringify(correct)) onSolve(next);
      else { setShake(true); setTimeout(() => { setShake(false); setPressed([]); }, 700); }
    }
  };

  return (
    <PuzzleWrapper title={isRtl ? puzzle.titleAr : puzzle.titleEn} onClose={onClose}>
      <p className="text-[#8a7a6a] text-xs text-center mb-4">{isRtl ? puzzle.descriptionAr : puzzle.descriptionEn}</p>

      <div className={`flex flex-col gap-2 ${shake ? "animate-shake" : ""}`}>
        {puzzle.books.map((b, i) => {
          const isPressed = pressed.includes(b.id);
          const order     = pressed.indexOf(b.id) + 1;
          return (
            <button key={b.id} onClick={() => pressBook(b.id)}
              className={`flex items-center gap-3 p-3 border transition-all text-left ${
                isPressed ? "border-[#c9a84c]/60 bg-[#c9a84c]/8" : "border-[#2a1f14] bg-[#0d0a06]/60 hover:border-[#3a2812]"
              }`}>
              <span className="text-lg">📚</span>
              <span className="text-[#e8d9b0] text-xs flex-1 tracking-wide">
                {isRtl ? b.titleAr : b.titleEn}
              </span>
              {isPressed && <span className="text-[#c9a84c] text-xs font-bold w-5 text-center">{order}</span>}
            </button>
          );
        })}
      </div>
      <p className="text-[#5a4a3a] text-xs text-center mt-4 italic">
        {isRtl ? `💡 ${puzzle.hintAr}` : `💡 ${puzzle.hintEn}`}
      </p>
    </PuzzleWrapper>
  );
}

// ── لغز الظل ──
function ShadowPuzzle({ puzzle, lang, onSolve, onClose }) {
  const [pos, setPos]   = useState("center");
  const [solved, setSolved] = useState(false);
  const isRtl = lang === "ar";

  useEffect(() => {
    if (pos === "center" && !solved) {
      setSolved(true);
      setTimeout(() => onSolve("center"), 800);
    }
  }, [pos]);

  const positions = ["left","center","right"];
  const labels = { left: isRtl ? "يسار" : "Left", center: isRtl ? "وسط" : "Center", right: isRtl ? "يمين" : "Right" };

  return (
    <PuzzleWrapper title={isRtl ? puzzle.titleAr : puzzle.titleEn} onClose={onClose}>
      <p className="text-[#8a7a6a] text-xs text-center mb-6">{isRtl ? puzzle.descriptionAr : puzzle.descriptionEn}</p>

      {/* محاكاة الظل */}
      <div className="relative h-32 bg-[#0d0a06]/80 border border-[#2a1f14] mb-4 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <div className={`transition-all duration-500 w-0 h-0 opacity-60`}
            style={{
              borderLeft: "30px solid transparent",
              borderRight: "30px solid transparent",
              borderBottom: "80px solid #2a1f14",
              transform: pos === "left" ? "translateX(-40px) rotate(-15deg)"
                : pos === "right" ? "translateX(40px) rotate(15deg)" : "none",
            }} />
        </div>
        {pos === "center" && (
          <p className="relative z-10 text-[#c9a84c] text-2xl font-bold font-mono animate-fadeIn">
            {puzzle.revealedCode}
          </p>
        )}
        {/* الشمعة */}
        <div className="absolute top-2 text-xl transition-all duration-500"
          style={{ left: pos === "left" ? "20%" : pos === "right" ? "75%" : "50%", transform: "translateX(-50%)" }}>
          🕯️
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        {positions.map(p => (
          <button key={p} onClick={() => setPos(p)}
            className={`px-4 py-2 border text-xs transition-all tracking-wider ${
              pos === p ? "border-[#c9a84c]/60 text-[#c9a84c] bg-[#c9a84c]/8" : "border-[#2a1f14] text-[#8a7a6a] hover:border-[#3a2812]"
            }`}>
            {labels[p]}
          </button>
        ))}
      </div>
      <p className="text-[#5a4a3a] text-xs text-center mt-4 italic">
        {isRtl ? `💡 ${puzzle.hintAr}` : `💡 ${puzzle.hintEn}`}
      </p>
    </PuzzleWrapper>
  );
}

// ── Wrapper مشترك للـ Puzzles ──
function PuzzleWrapper({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,3,2,0.92)", backdropFilter: "blur(6px)" }}>
      <div className="w-full max-w-sm border border-[#2a1f14] bg-[#0d0a06]/95 p-6"
        style={{ boxShadow: "0 0 60px #00000088, inset 0 0 20px #c9a84c05" }}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-[#c9a84c] text-sm tracking-[0.2em] uppercase font-bold">{title}</h3>
          <button onClick={onClose} className="text-[#5a4a3a] hover:text-[#c97070] transition-colors text-lg">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Item Inspector — تدوير الغرض
// ═══════════════════════════════════════════════════════════════
function ItemInspector({ item, lang, onClose }) {
  const [rotY, setRotY]  = useState(0);
  const [rotX, setRotX]  = useState(0);
  const startRef = useRef({ x:0, y:0, rotY:0, rotX:0, dragging:false });
  const isRtl = lang === "ar";

  const onDown = e => {
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    startRef.current = { x: cx, y: cy, rotY, rotX, dragging: true };
  };
  const onMove = e => {
    if (!startRef.current.dragging) return;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    setRotY(startRef.current.rotY + (cx - startRef.current.x) * 0.8);
    setRotX(startRef.current.rotX - (cy - startRef.current.y) * 0.5);
  };
  const onUp = () => { startRef.current.dragging = false; };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,3,2,0.95)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-md border border-[#2a1f14] bg-[#0d0a06]/98 p-5"
        style={{ boxShadow: "0 0 80px #00000099" }}>

        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-[#c9a84c] text-sm tracking-[0.2em] font-bold">
              {isRtl ? item.nameAr : item.nameEn}
            </h3>
            <p className="text-[#5a4a3a] text-xs mt-0.5 tracking-wider">
              {isRtl ? "اسحب لتدوير الغرض" : "Drag to rotate"}
            </p>
          </div>
          <button onClick={onClose} className="text-[#5a4a3a] hover:text-[#c97070] transition-colors text-lg">✕</button>
        </div>

        {/* منطقة التدوير */}
        <div
          className="relative h-48 border border-[#1a1208] bg-gradient-to-b from-[#0d0a06] to-[#050302] flex items-center justify-center mb-4 cursor-grab overflow-hidden"
          onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp}
          onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
        >
          {/* الغرض المدوَّر */}
          <div
            className="w-28 h-28 flex items-center justify-center text-6xl select-none"
            style={{
              transform: `rotateY(${rotY}deg) rotateX(${rotX}deg)`,
              transition: "none",
              filter: "drop-shadow(0 0 20px #c9a84c22)",
            }}
          >
            {item.type === "document" ? "📜" : item.type === "tool" ? "🔧"
              : item.type === "evidence" ? "🔍" : item.type === "clue" ? "🗝️"
              : item.icon || "📦"}
          </div>

          {/* محاور التدوير */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-0 top-1/2 h-px bg-[#c9a84c]/5" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-[#c9a84c]/5" />
          </div>
        </div>

        {/* الوصف */}
        <div className="border border-[#1a1208] bg-[#080603]/60 p-4 max-h-36 overflow-y-auto">
          <p className="text-[#c9a84c]/70 text-xs tracking-wider mb-2 uppercase">
            {isRtl ? "الوصف" : "Description"}
          </p>
          <p className="text-[#b8a88a] text-xs leading-relaxed whitespace-pre-line"
            dir={isRtl ? "rtl" : "ltr"}>
            {isRtl ? item.descriptionAr : item.descriptionEn}
          </p>
        </div>

        {item.isClue && (
          <div className="mt-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4caf50]" />
            <p className="text-[#4caf50]/70 text-xs tracking-wider">
              {isRtl ? "تمت إضافته لملف التحقيق" : "Added to investigation file"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HUD — واجهة اللاعب
// ═══════════════════════════════════════════════════════════════
function GameHUD({ nodeData, lang, inventory, activeTools, onToolToggle, onPing, onOpenBook, players, pings, solvedPuzzles }) {
  const [showInventory, setShowInventory] = useState(false);
  const [showPingMenu,  setShowPingMenu]  = useState(false);
  const isRtl = lang === "ar";

  return (
    <>
      {/* ── الأعلى: اسم المكان + اللاعبين ── */}
      <div className="absolute top-0 inset-x-0 z-20 pointer-events-none">
        <div className="flex justify-between items-start p-3">
          {/* اسم المكان */}
          <div className="border border-[#2a1f14] bg-[#0d0a06]/80 px-3 py-1.5 backdrop-blur-sm">
            <p className="text-[#c9a84c] text-xs tracking-[0.2em] font-semibold">
              {isRtl ? nodeData?.nameAr : nodeData?.nameEn}
            </p>
          </div>

          {/* اللاعبين */}
          <div className="flex gap-1.5">
            {players?.map(p => (
              <div key={p.id} className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold ${
                p.currentNode === nodeData?.id ? "border-[#c9a84c] bg-[#c9a84c]/20 text-[#c9a84c]" : "border-[#3a2812] bg-[#0d0a06]/60 text-[#5a4a3a]"
              }`} title={p.name}>
                {p.name?.[0]?.toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── الـ Pings الواردة ── */}
      <div className="absolute top-16 left-3 z-20 flex flex-col gap-2 pointer-events-none">
        {pings?.slice(-3).map((ping, i) => (
          <div key={i} className="border border-[#2a1f14] bg-[#0d0a06]/90 px-3 py-1.5 flex items-center gap-2 animate-fadeIn">
            <span>{PING_TYPES[ping.pingType]?.icon || "📍"}</span>
            <div>
              <p className="text-[#e8d9b0] text-xs">{ping.fromPlayer}</p>
              <p className="text-[#5a4a3a] text-xs">{isRtl ? ping.nodeNameAr : ping.nodeNameEn}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── الأسفل: الأدوات + الحقيبة ── */}
      <div className="absolute bottom-0 inset-x-0 z-20 p-3">
        <div className="flex justify-between items-end gap-2">

          {/* الأدوات */}
          <div className="flex gap-2">
            {Object.entries(TOOL_ICONS).map(([id, icon]) => {
              const owned  = inventory?.includes(id);
              const active = activeTools?.includes(id);
              if (!owned) return null;
              return (
                <button key={id} onClick={() => onToolToggle?.(id)}
                  className={`w-10 h-10 border flex items-center justify-center text-lg transition-all ${
                    active ? "border-[#c9a84c]/70 bg-[#c9a84c]/15 shadow-[0_0_10px_#c9a84c33]" : "border-[#2a1f14] bg-[#0d0a06]/80 opacity-60 hover:opacity-90"
                  }`}>
                  {icon}
                </button>
              );
            })}
          </div>

          {/* الأزرار المركزية */}
          <div className="flex gap-2">
            {/* زرار الكشاف */}
            <button onClick={() => onToolToggle?.("flashlight")}
              className={`border px-3 py-2 text-xs tracking-wider transition-all ${
                activeTools?.includes("flashlight")
                  ? "border-[#c9a84c]/70 bg-[#c9a84c]/15 text-[#c9a84c] shadow-[0_0_10px_#c9a84c22]"
                  : "border-[#2a1f14] bg-[#0d0a06]/80 text-[#5a4a3a] hover:text-[#c9a84c] hover:border-[#c9a84c]/30"
              }`}>
              🔦 {isRtl
                ? activeTools?.includes("flashlight") ? "إطفاء" : "إضاءة"
                : activeTools?.includes("flashlight") ? "Off"    : "On"
              }
            </button>

            {/* الكتاب */}
            <button onClick={onOpenBook}
              className="border border-[#2a1f14] bg-[#0d0a06]/80 px-3 py-2 text-[#8a7a6a] hover:text-[#c9a84c] hover:border-[#c9a84c]/40 transition-all text-xs tracking-wider">
              📖 {isRtl ? "الكتاب" : "Book"}
            </button>

            {/* Ping */}
            <div className="relative">
              <button onClick={() => setShowPingMenu(p => !p)}
                className="border border-[#2a1f14] bg-[#0d0a06]/80 px-3 py-2 text-[#8a7a6a] hover:text-[#c9a84c] hover:border-[#c9a84c]/40 transition-all text-xs tracking-wider">
                📍 {isRtl ? "إشارة" : "Ping"}
              </button>
              {showPingMenu && (
                <div className="absolute bottom-full mb-2 left-0 border border-[#2a1f14] bg-[#0d0a06]/95 p-2 flex flex-col gap-1 min-w-max">
                  {Object.entries(PING_TYPES).map(([type, p]) => (
                    <button key={type} onClick={() => { onPing?.(type); setShowPingMenu(false); }}
                      className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#8a7a6a] hover:text-[#e8d9b0] hover:bg-[#1a1208] transition-all text-left">
                      <span>{p.icon}</span>
                      <span>{isRtl ? p.labelAr : p.labelEn}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* الحقيبة */}
          <button onClick={() => setShowInventory(p => !p)}
            className={`w-10 h-10 border flex items-center justify-center text-lg transition-all ${
              showInventory ? "border-[#c9a84c]/70 bg-[#c9a84c]/10" : "border-[#2a1f14] bg-[#0d0a06]/80"
            }`}>
            🎒
          </button>
        </div>
      </div>

      {/* ── الحقيبة ── */}
      {showInventory && (
        <div className="absolute bottom-16 right-3 z-30 border border-[#2a1f14] bg-[#0d0a06]/95 w-64 max-h-72 overflow-y-auto"
          style={{ boxShadow: "0 0 30px #00000088" }}>
          <div className="border-b border-[#1a1208] px-3 py-2 flex justify-between items-center">
            <p className="text-[#c9a84c]/70 text-xs tracking-widest uppercase">{isRtl ? "الحقيبة" : "Inventory"}</p>
            <button onClick={() => setShowInventory(false)} className="text-[#5a4a3a] hover:text-[#c97070] text-sm">✕</button>
          </div>
          {inventory?.length === 0 ? (
            <p className="text-[#3a2812] text-xs text-center p-4 tracking-wider">{isRtl ? "فارغة" : "Empty"}</p>
          ) : (
            <div className="p-2 flex flex-col gap-1">
              {inventory?.map(id => (
                <div key={id} className="flex items-center gap-2 px-2 py-2 hover:bg-[#1a1208] transition-colors border border-transparent hover:border-[#2a1f14]">
                  <span className="text-sm">{id.includes("tool") || Object.keys(TOOL_ICONS).includes(id) ? TOOL_ICONS[id] || "🔧" : "🗝️"}</span>
                  <span className="text-[#b8a88a] text-xs">{id.replace("item_", "").replace(/_/g, " ")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// UrbexGameEngine — المحرك الرئيسي
// ═══════════════════════════════════════════════════════════════
export default function UrbexGameEngine({ socket, gameData, onExit }) {
  const {
    chapterId, chapter, startNode, startNodeData,
    roomState, playerName, playerId, language = "ar", isHost,
  } = gameData || {};

  const isRtl = language === "ar";

  // ── State ──────────────────────────────────────────────────
  const [currentNode,    setCurrentNode]    = useState(startNode);
  const [currentNodeData,setCurrentNodeData]= useState(startNodeData);
  const [inventory,      setInventory]      = useState(["flashlight"]); // ← الكشاف في الحقيبة من الأول
  const [activeTools,    setActiveTools]    = useState(["flashlight"]); // ← شغال من الأول
  const [solvedPuzzles,  setSolvedPuzzles]  = useState([]);
  const [players,        setPlayers]        = useState(roomState?.players || []);
  const [pings,          setPings]          = useState([]);
  const [activePuzzle,   setActivePuzzle]   = useState(null);
  const [inspectedItem,  setInspectedItem]  = useState(null);
  const [showBook,       setShowBook]       = useState(false);
  const [notification,   setNotification]   = useState(null);
  const [transitioning,  setTransitioning]  = useState(false);
  const [chapterComplete,setChapterComplete]= useState(null);
  const [chapterData,    setChapterData]    = useState(null);
  const [puzzleSuccess,  setPuzzleSuccess]  = useState(null); // feedback حل اللغز
  const [isReconnecting, setIsReconnecting] = useState(false); // reconnect state

  // كشف الموبايل
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // جلب بيانات الفصل
  useEffect(() => {
    if (!chapterId) return;
    // هنا في التطبيق الحقيقي هتجيب البيانات من السيرفر
    // دلوقتي بنفترض إنها موجودة في الـ gameData
    if (chapter) setChapterData(chapter);
  }, [chapterId, chapter]);

  // ── إشعار مؤقت ───────────────────────────────────────────
  const notify = useCallback((msg, type = "info", dur = 3000) => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), dur);
  }, []);

  // ── WebSocket Events ──────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.on("urbex_player_moved", ({ playerId: pid, playerName: pname, node, nodeName }) => {
      setPlayers(prev => prev.map(p => p.id === pid ? { ...p, currentNode: node } : p));
      notify(`${pname} → ${language === "ar" ? nodeName?.ar : nodeName?.en}`, "move");
    });

    socket.on("urbex_clue_found", ({ playerName: pname, itemNameAr, itemNameEn }) => {
      notify(`${pname}: ${language === "ar" ? itemNameAr : itemNameEn}`, "clue");
    });

    socket.on("urbex_puzzle_unlocked", ({ solvedBy, nodeNameAr, nodeNameEn }) => {
      notify(`${solvedBy} ${language === "ar" ? "فتح لغز في" : "solved puzzle in"} ${language === "ar" ? nodeNameAr : nodeNameEn}`, "puzzle");
    });

    socket.on("urbex_ping_received", (ping) => {
      setPings(prev => [...prev.slice(-4), ping]);
      setTimeout(() => setPings(prev => prev.filter(p => p !== ping)), 6000);
    });

    socket.on("urbex_item_inspected", ({ item, inventory: inv, activeTools: tools }) => {
      setInventory(inv || []);
      if (tools) setActiveTools(tools);
    });

    socket.on("urbex_navigated", ({ node, nodeData: nd, inventory: inv, activeTools: tools, ambientSound, infrasound }) => {
      setTransitioning(false);
      setCurrentNode(node);
      setCurrentNodeData(nd);
      if (inv) setInventory(inv);
      if (tools) setActiveTools(tools);
      if (ambientSound) soundMgr.play(ambientSound);
      if (infrasound)   soundMgr.playInfrasound();
    });

    socket.on("urbex_puzzle_solved", ({ inventory: inv, activeTools: tools, rewardItem, solvedPuzzles: solved }) => {
      if (inv)    setInventory(inv);
      if (tools)  setActiveTools(tools);
      if (solved) setSolvedPuzzles(solved);
      if (rewardItem) notify(
        language === "ar" ? `✦ وجدت: ${rewardItem.nameAr}` : `✦ Found: ${rewardItem.nameEn}`,
        "reward", 4000
      );
      setActivePuzzle(null);
    });

    socket.on("urbex_puzzle_wrong", ({ hintAr, hintEn }) => {
      notify(language === "ar" ? `❌ ${hintAr}` : `❌ ${hintEn}`, "error");
    });

    socket.on("urbex_tool_required", ({ messageAr, messageEn }) => {
      notify(language === "ar" ? messageAr : messageEn, "warning");
    });

    socket.on("urbex_navigation_blocked", ({ missingItemAr, missingItemEn }) => {
      setTransitioning(false);
      notify(
        language === "ar" ? `محتاج: ${missingItemAr}` : `Need: ${missingItemEn}`,
        "warning"
      );
    });

    socket.on("urbex_chapter_complete", (data) => setChapterComplete(data));
    socket.on("urbex_player_joined",    ({ playerName: pname }) => notify(pname + (language === "ar" ? " انضم" : " joined"), "info"));

    return () => {
      socket.off("urbex_player_moved");   socket.off("urbex_clue_found");
      socket.off("urbex_puzzle_unlocked");socket.off("urbex_ping_received");
      socket.off("urbex_item_inspected"); socket.off("urbex_navigated");
      socket.off("urbex_puzzle_solved");  socket.off("urbex_puzzle_wrong");
      socket.off("urbex_tool_required");  socket.off("urbex_navigation_blocked");
      socket.off("urbex_chapter_complete");socket.off("urbex_player_joined");
    };
  }, [socket, language, notify]);

  // ── الانتقال بين العُقد ───────────────────────────────────
  const navigate = useCallback((targetNode) => {
    if (!socket || transitioning) return;
    setTransitioning(true);
    soundMgr.fadeOut();
    socket.emit("urbex_navigate", { roomId: roomState?.roomId, playerId, targetNode });
  }, [socket, transitioning, roomState, playerId]);

  // ── التفاعل مع Hotspot ────────────────────────────────────
  const handleHotspot = useCallback((hotspot) => {
    soundMgr.playClick();
    if (hotspot.type === "navigate") { navigate(hotspot.target); return; }
    if (hotspot.type === "inspect")  { handleInspect(hotspot.itemId); return; }
    if (hotspot.type === "puzzle")   { handleOpenPuzzle(hotspot.puzzleId); return; }
  }, [navigate]);

  const handleInspect = useCallback((itemId) => {
    if (!socket) return;
    socket.emit("urbex_inspect_item", { roomId: roomState?.roomId, playerId, itemId });
    // نفتح الـ inspector محلياً مباشرة (السيرفر هيرد بالتفاصيل)
    socket.once("urbex_item_inspected", ({ item }) => setInspectedItem(item));
  }, [socket, roomState, playerId]);

  const handleOpenPuzzle = useCallback((puzzleId) => {
    // نبحث عن اللغز في البيانات المحلية
    const node = currentNodeData;
    if (node?.puzzle?.id === puzzleId) setActivePuzzle(node.puzzle);
  }, [currentNodeData]);

  // ── حل لغز ───────────────────────────────────────────────
  const handleSolvePuzzle = useCallback((answer) => {
    if (!socket || !activePuzzle) return;
    socket.emit("urbex_solve_puzzle", { roomId: roomState?.roomId, playerId, puzzleId: activePuzzle.id, answer });
  }, [socket, activePuzzle, roomState, playerId]);

  // ── تبديل الأداة ──────────────────────────────────────────
  const handleToolToggle = useCallback((toolId) => {
    if (!socket) return;
    socket.emit("urbex_activate_tool", { roomId: roomState?.roomId, playerId, toolId });
    setActiveTools(prev => prev.includes(toolId)
      ? prev.filter(t => t !== toolId)
      : [...prev, toolId]
    );
  }, [socket, roomState, playerId]);

  // ── Ping ──────────────────────────────────────────────────
  const handlePing = useCallback((pingType) => {
    if (!socket) return;
    socket.emit("urbex_ping", { roomId: roomState?.roomId, playerId, nodeId: currentNode, pingType });
  }, [socket, roomState, playerId, currentNode]);

  // ── حفظ ───────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !isHost) return;
    const id = setInterval(() => {
      socket.emit("urbex_save_progress", { roomId: roomState?.roomId, playerId });
    }, 60000);
    return () => clearInterval(id);
  }, [socket, isHost, roomState, playerId]);

  // ── Reconnect Logic ───────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleDisconnect = () => {
      setIsReconnecting(true);
      notify(isRtl ? "انقطع الاتصال... جاري إعادة الاتصال" : "Disconnected... reconnecting", "warning", 99999);
    };

    const handleReconnect = () => {
      setIsReconnecting(false);
      setNotification(null);
      // إعادة الانضمام للغرفة بعد الاتصال
      socket.emit("urbex_join_room", {
        roomId:     roomState?.roomId,
        playerId,
        playerName,
        language,
      });
      notify(isRtl ? "✓ عاد الاتصال" : "✓ Reconnected", "clue", 2000);
    };

    const handleReconnectFailed = () => {
      setIsReconnecting(false);
      notify(isRtl ? "فشل الاتصال — تحقق من النت" : "Connection failed — check internet", "error", 99999);
    };

    socket.on("disconnect",         handleDisconnect);
    socket.on("connect",            handleReconnect);
    socket.io?.on("reconnect_failed", handleReconnectFailed);

    return () => {
      socket.off("disconnect",   handleDisconnect);
      socket.off("connect",      handleReconnect);
      socket.io?.off("reconnect_failed", handleReconnectFailed);
    };
  }, [socket, roomState, playerId, playerName, language, isRtl]);

  // ── Puzzle Success Feedback ───────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const handleSolved = (data) => {
      // إظهار شاشة النجاح
      setPuzzleSuccess({
        rewardItem:        data.rewardItem,
        revealedMessage:   isRtl ? data.revealedMessage   : data.revealedMessageEn,
        solvedPuzzles:     data.solvedPuzzles,
      });
      setTimeout(() => setPuzzleSuccess(null), 3500);
    };
    socket.on("urbex_puzzle_solved", handleSolved);
    return () => socket.off("urbex_puzzle_solved", handleSolved);
  }, [socket, isRtl]);

  // ── الأداة النشطة حالياً ──────────────────────────────────
  const activeTool = activeTools[activeTools.length - 1] || null;

  // ── Notification color ────────────────────────────────────
  const notifColors = {
    info:    "#c9a84c", clue: "#4caf50", puzzle: "#8b5cf6",
    error:   "#ef4444", warning: "#f59e0b", reward: "#c9a84c", move: "#5a4a3a",
  };

  return (
    <div className="fixed inset-0 z-40 bg-black overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>

      {/* ── Panorama ── */}
      <div className={`absolute inset-0 transition-opacity duration-700 ${transitioning ? "opacity-0" : "opacity-100"}`}>
        <PanoramaView
          imageUrl={currentNodeData?.image}
          hotspots={currentNodeData?.hotspots}
          onHotspotClick={handleHotspot}
          activeTool={activeTool}
        >
          {/* Vignette الانتقال */}
          {transitioning && (
            <div className="absolute inset-0 bg-black z-50 animate-fadeIn" />
          )}
        </PanoramaView>
      </div>

      {/* ── HUD ── */}
      <GameHUD
        nodeData={currentNodeData}
        lang={language}
        inventory={inventory}
        activeTools={activeTools}
        onToolToggle={handleToolToggle}
        onPing={handlePing}
        onOpenBook={() => setShowBook(true)}
        players={players}
        pings={pings}
        solvedPuzzles={solvedPuzzles}
      />

      {/* ── الإشعارات ── */}
      {notification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-fadeIn">
          <div className="border px-4 py-2 text-xs tracking-wider bg-[#0d0a06]/95 backdrop-blur-sm"
            style={{ borderColor: `${notifColors[notification.type]}44`, color: notifColors[notification.type] }}>
            {notification.msg}
          </div>
        </div>
      )}

      {/* ── زرار الخروج ── */}
      <button onClick={onExit}
        className="absolute top-3 right-3 z-30 text-[#3a2812] hover:text-[#c97070] transition-colors text-xs border border-[#1a1208] bg-[#0d0a06]/80 px-2 py-1">
        ✕
      </button>

      {/* ── الألغاز ── */}
      {activePuzzle && (() => {
        const props = { puzzle: activePuzzle, lang: language, onSolve: handleSolvePuzzle, onClose: () => setActivePuzzle(null) };
        switch (activePuzzle.type) {
          case "number_pad":        return <NumberPadPuzzle    {...props} />;
          case "compass":           return <CompassPuzzle      {...props} />;
          case "symbol_combination":return <SymbolComboPuzzle  {...props} />;
          case "book_sequence":     return <BookSeqPuzzle      {...props} />;
          case "shadow_angle":      return <ShadowPuzzle       {...props} />;
          default: return null;
        }
      })()}

      {/* ── الفحص ── */}
      {inspectedItem && (
        <ItemInspector item={inspectedItem} lang={language} onClose={() => setInspectedItem(null)} />
      )}

      {/* ── الكتاب ── */}
      {showBook && (() => {
        const UrbexMythBook = require("./UrbexMythBook").default;
        return <UrbexMythBook lang={language} chapterId={chapterId} onClose={() => setShowBook(false)} />;
      })()}

      {/* ── اكتمال الفصل ── */}
      {chapterComplete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4"
          style={{ background: "rgba(5,3,2,0.97)", backdropFilter: "blur(10px)" }}>
          <div className="max-w-sm w-full border border-[#c9a84c]/30 bg-[#0d0a06]/98 p-8 text-center"
            style={{ boxShadow: "0 0 80px #c9a84c22" }}>

            <p className="text-[#c9a84c]/60 text-xs tracking-[0.4em] uppercase mb-4">
              {isRtl ? "الحقيقة انكشفت" : "The Truth Revealed"}
            </p>
            <h2 className="text-[#e8d9b0] text-xl font-bold mb-6" style={{ fontFamily: "Georgia,serif" }}>
              {isRtl ? chapterComplete.revelation?.titleAr : chapterComplete.revelation?.titleEn}
            </h2>
            <p className="text-[#8a7a6a] text-sm leading-loose mb-6 whitespace-pre-line">
              {isRtl ? chapterComplete.revelation?.textAr : chapterComplete.revelation?.textEn}
            </p>

            {/* الإحصاءات */}
            <div className="grid grid-cols-3 gap-3 border border-[#1a1208] p-3 mb-6">
              {[
                { label: isRtl ? "أدلة" : "Clues",   val: chapterComplete.stats?.itemsCollected },
                { label: isRtl ? "ألغاز" : "Puzzles", val: chapterComplete.stats?.puzzlesSolved  },
                { label: isRtl ? "وقت"  : "Time",    val: Math.round((chapterComplete.stats?.timeTakenMs||0)/60000) + "m" },
              ].map((s,i) => (
                <div key={i} className="text-center">
                  <p className="text-[#c9a84c] text-lg font-bold">{s.val}</p>
                  <p className="text-[#5a4a3a] text-xs tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>

            {chapterComplete.revelation?.nextChapterHintAr && (
              <div className="border border-[#2a1f14] p-3 mb-6 text-left">
                <p className="text-[#c9a84c]/50 text-xs tracking-wider mb-1">
                  {isRtl ? "الخيط التالي" : "Next Thread"}
                </p>
                <p className="text-[#8a7a6a] text-xs leading-relaxed whitespace-pre-line">
                  {isRtl ? chapterComplete.revelation?.nextChapterHintAr : chapterComplete.revelation?.nextChapterHintEn}
                </p>
              </div>
            )}

            <button onClick={onExit}
              className="w-full border border-[#c9a84c]/40 text-[#c9a84c] text-sm tracking-widest py-3 hover:bg-[#c9a84c]/10 transition-all">
              {isRtl ? "العودة للقائمة" : "Back to Menu"}
            </button>
          </div>
        </div>
      )}

      {/* ── Puzzle Success Overlay ── */}
      {puzzleSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3 animate-fadeIn">
            {/* دائرة النجاح */}
            <div className="w-20 h-20 rounded-full border-2 border-[#4caf50] bg-[#0d0a06]/95 flex items-center justify-center"
              style={{ boxShadow: "0 0 40px #4caf5055" }}>
              <span className="text-3xl">✦</span>
            </div>
            {/* النص */}
            <div className="border border-[#4caf50]/40 bg-[#0d0a06]/95 px-6 py-3 text-center"
              style={{ boxShadow: "0 0 20px #4caf5033" }}>
              <p className="text-[#4caf50] text-xs tracking-[0.3em] uppercase mb-1">
                {isRtl ? "اتحل اللغز" : "Puzzle Solved"}
              </p>
              {puzzleSuccess.rewardItem && (
                <p className="text-[#c9a84c] text-sm">
                  {isRtl ? `✦ وجدت: ${puzzleSuccess.rewardItem.nameAr}` : `✦ Found: ${puzzleSuccess.rewardItem.nameEn}`}
                </p>
              )}
              {puzzleSuccess.revealedMessage && (
                <p className="text-[#8a7a6a] text-xs mt-1 italic">
                  "{puzzleSuccess.revealedMessage}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Reconnect Overlay ── */}
      {isReconnecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(5,3,2,0.85)", backdropFilter: "blur(4px)" }}>
          <div className="flex flex-col items-center gap-4 border border-[#2a1f14] bg-[#0d0a06]/95 p-8 text-center">
            {/* دوائر التحميل */}
            <div className="flex gap-1.5">
              {[0,1,2,3].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-[#c9a84c]/60 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}/>
              ))}
            </div>
            <p className="text-[#c9a84c] text-xs tracking-[0.3em]">
              {isRtl ? "جاري إعادة الاتصال..." : "Reconnecting..."}
            </p>
            <p className="text-[#5a4a3a] text-xs">
              {isRtl ? "اللعبة محفوظة — لا تغلق التطبيق" : "Game saved — don't close the app"}
            </p>
          </div>
        </div>
      )}

      {/* Global Animations */}
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
        @keyframes shake  { 0%,100%{transform:none} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        @keyframes ping   { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.2);opacity:0} }
        .animate-fadeIn { animation: fadeIn .3s ease forwards }
        .animate-shake  { animation: shake .6s ease }
        .animate-ping   { animation: ping 1.5s ease-out infinite }
        .animate-pulse-slow { animation: ping 2s ease-out infinite }
      `}</style>
    </div>
  );
}