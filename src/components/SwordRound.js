// components/SwordRound.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  FaCrown, FaBook, FaExpand, FaCompress, FaVolumeUp, FaVolumeMute,
  FaSignOutAlt, FaRedo, FaClock, FaTimes, FaBolt, FaSkull,
} from 'react-icons/fa';
import {
  SOK_REALMS, SOK_CONFIG, SOK_SOUND_PATHS,
  MAP_W, MAP_H, getMapLayout,
} from '../data/swordData';

/* ==================== Animations ==================== */
const AnimCSS = `
@keyframes sokBattleRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes sokFlagWave { 0%, 100% { transform: skewX(0deg); } 50% { transform: skewX(-10deg); } }
@keyframes sokCrownDrop {
  0%   { transform: translateY(-24px) scale(0.4); opacity: 0; }
  60%  { transform: translateY(3px) scale(1.15); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
@keyframes sokFadeIn  { from { opacity: 0; } to { opacity: 1; } }
@keyframes sokScaleIn { 0% { transform: scale(0.82); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes sokLinePulse { 0%, 100% { stroke-opacity: 0.5; } 50% { stroke-opacity: 0.85; } }

@keyframes sokClaimReveal {
  0% { opacity: 0; transform: translateY(-80px) scale(0.4) rotate(-8deg); letter-spacing: 0.8em; filter: blur(15px); }
  55% { opacity: 1; transform: translateY(6px) scale(1.08) rotate(2deg); letter-spacing: 0.2em; filter: blur(0); }
  75% { transform: translateY(-2px) scale(0.98) rotate(-1deg); letter-spacing: 0.08em; }
  100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); letter-spacing: 0.02em; filter: blur(0); }
}
@keyframes sokClaimGlow {
  0%   { filter: drop-shadow(0 0 0 rgba(16,185,129,0)); }
  45%  { filter: drop-shadow(0 0 35px rgba(16,185,129,1)) drop-shadow(0 0 60px rgba(52,211,153,0.6)); }
  100% { filter: drop-shadow(0 0 14px rgba(16,185,129,0.55)); }
}
@keyframes sokShieldSpin {
  0%   { transform: rotate(0deg) scale(0.6); opacity: 0; }
  40%  { transform: rotate(180deg) scale(1.15); opacity: 1; }
  100% { transform: rotate(360deg) scale(1); opacity: 0.9; }
}
@keyframes sokCircleExpand {
  0%   { transform: scale(0.2); opacity: 1; stroke-width: 8; }
  100% { transform: scale(2.6); opacity: 0; stroke-width: 0.5; }
}
@keyframes sokAttackReveal {
  0% { opacity: 0; transform: translateY(80px) scale(1.5) rotate(8deg); letter-spacing: 0.8em; filter: blur(15px); }
  55% { opacity: 1; transform: translateY(-6px) scale(0.95) rotate(-2deg); letter-spacing: 0.2em; filter: blur(0); }
  75% { transform: translateY(3px) scale(1.03) rotate(1deg); letter-spacing: 0.08em; }
  100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); letter-spacing: 0.02em; filter: blur(0); }
}
@keyframes sokAttackGlow {
  0%   { filter: drop-shadow(0 0 0 rgba(239,68,68,0)); }
  45%  { filter: drop-shadow(0 0 35px rgba(239,68,68,1)) drop-shadow(0 0 60px rgba(249,115,22,0.7)); }
  100% { filter: drop-shadow(0 0 14px rgba(239,68,68,0.6)); }
}
@keyframes sokSwordLeft {
  0%   { transform: translateX(-200px) translateY(-40px) rotate(-130deg); opacity: 0; }
  35%  { transform: translateX(-30px) translateY(-10px) rotate(-45deg); opacity: 1; }
  55%  { transform: translateX(0) translateY(0) rotate(-45deg); }
  70%  { transform: translateX(-15px) translateY(-5px) rotate(-50deg); }
  100% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 1; }
}
@keyframes sokSwordRight {
  0%   { transform: translateX(200px) translateY(-40px) rotate(130deg) scaleX(-1); opacity: 0; }
  35%  { transform: translateX(30px) translateY(-10px) rotate(45deg) scaleX(-1); opacity: 1; }
  55%  { transform: translateX(0) translateY(0) rotate(45deg) scaleX(-1); }
  70%  { transform: translateX(15px) translateY(-5px) rotate(50deg) scaleX(-1); }
  100% { transform: translateX(0) translateY(0) rotate(45deg) scaleX(-1); opacity: 1; }
}
@keyframes sokClashFlash {
  0%, 40%   { opacity: 0; transform: scale(0.3); }
  50%       { opacity: 1; transform: scale(1.3); }
  60%       { opacity: 0.9; transform: scale(1); }
  100%      { opacity: 0; transform: scale(2.2); }
}
@keyframes sokSparkFly {
  0%   { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
}
`;

/* ==================== Sound ==================== */
class SoundEngine {
  constructor(paths = {}) { this.ctx=null; this.paths=paths; this.custom={}; this.enabled=true; this._u=false; }
  async unlock() {
    if (this._u) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      this._u = true;
      Object.entries(this.paths).forEach(([k, url]) => {
        const a = new Audio(url); a.preload='auto';
        a.addEventListener('canplaythrough', () => { this.custom[k]=a; }, { once:true });
        a.addEventListener('error', () => {}, { once:true });
      });
    } catch {}
  }
  setEnabled(v) { this.enabled = !!v; }
  play(name) {
    if (!this.enabled || !this.ctx) return;
    const c = this.custom[name];
    if (c) { try { const a=c.cloneNode(); a.volume=0.7; a.play().catch(()=>{}); return; } catch {} }
    this._synth(name);
  }
  _t({ f, d=0.3, t='sine', g=0.15, s=0, a=0.005, r=0.1 }) {
    const c=this.ctx; if (!c) return;
    const t0=c.currentTime+s;
    const o=c.createOscillator(), gg=c.createGain();
    o.type=t; o.frequency.setValueAtTime(f,t0);
    gg.gain.setValueAtTime(0.0001,t0);
    gg.gain.linearRampToValueAtTime(g,t0+a);
    gg.gain.setValueAtTime(g,Math.max(t0+a,t0+d-r));
    gg.gain.linearRampToValueAtTime(0.0001,t0+d);
    o.connect(gg).connect(c.destination);
    o.start(t0); o.stop(t0+d+0.05);
  }
  _n({ d=0.2, g=0.1, f=4000, q=1 }) {
    const c=this.ctx; if (!c) return;
    const t0=c.currentTime;
    const buf=c.createBuffer(1, c.sampleRate*d, c.sampleRate);
    const dat=buf.getChannelData(0);
    for (let i=0;i<dat.length;i++) dat[i]=Math.random()*2-1;
    const src=c.createBufferSource(); src.buffer=buf;
    const flt=c.createBiquadFilter(); flt.type='bandpass'; flt.frequency.value=f; flt.Q.value=q;
    const gg=c.createGain(); gg.gain.setValueAtTime(g,t0);
    gg.gain.exponentialRampToValueAtTime(0.0001,t0+d);
    src.connect(flt).connect(gg).connect(c.destination);
    src.start(t0); src.stop(t0+d+0.05);
  }
  _chime(freqs, gap=0.12, d=0.5) {
    freqs.forEach((f,i) => {
      this._t({ f, d, t:'sine', g:0.11, s:i*gap });
      this._t({ f:f*2, d:d*0.6, t:'sine', g:0.035, s:i*gap });
    });
  }
  _synth(name) {
    try {
      switch (name) {
        case 'swordClash':
          this._n({ d:0.15, g:0.12, f:3500, q:2 });
          this._t({ f:1400, d:0.12, t:'triangle', g:0.1 });
          setTimeout(()=>this._n({ d:0.12, g:0.08, f:5000, q:3 }), 40);
          break;
        case 'victory':
          [523.25, 659.25, 783.99, 1046.5].forEach((f,i)=>this._t({ f, d:0.4, t:'triangle', g:0.14, s:i*0.15 }));
          [523.25, 659.25, 783.99, 1046.5].forEach(f=>this._t({ f, d:1.3, t:'sine', g:0.07, s:0.6 }));
          break;
        case 'defeat':
          [392, 349.23, 311.13, 261.63].forEach((f,i)=>this._t({ f, d:0.35, t:'sawtooth', g:0.11, s:i*0.14 }));
          break;
        case 'claim':    this._chime([523.25, 659.25, 783.99], 0.13, 0.5); break;
        case 'attack':
          { const c=this.ctx; if(!c) break;
            const t0=c.currentTime;
            const o=c.createOscillator(), g=c.createGain();
            o.frequency.setValueAtTime(120, t0);
            o.frequency.exponentialRampToValueAtTime(40, t0+0.2);
            g.gain.setValueAtTime(0.28, t0);
            g.gain.exponentialRampToValueAtTime(0.0001, t0+0.3);
            o.connect(g).connect(c.destination);
            o.start(t0); o.stop(t0+0.35);
            this._n({ d:0.15, g:0.06, f:200, q:1 });
          }
          break;
        case 'tick':      this._t({ f:2000, d:0.03, t:'square', g:0.05 }); break;
        case 'turn':      this._chime([659.25], 0, 0.25); break;
        case 'phaseChange':
          [80, 160, 240, 320, 480].forEach((f,i)=>this._t({ f, d:1.8, t:'sine', g:0.08/(i+1), s:i*0.02 }));
          break;
        case 'correct':   this._chime([783.99, 1046.5], 0.09, 0.35); break;
        case 'wrong':
          this._t({ f:130, d:0.3, t:'square', g:0.1 });
          this._t({ f:110, d:0.3, t:'sawtooth', g:0.07 });
          break;
        case 'deny':
          this._t({ f:200, d:0.15, t:'sawtooth', g:0.12 });
          this._t({ f:150, d:0.25, t:'square', g:0.08, s:0.06 });
          break;
        default: break;
      }
    } catch {}
  }
}

/* ==================== Hooks ==================== */
function useOrientation() {
  const [p, setP] = useState(false);
  useEffect(() => {
    const c = () => {
      const m = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 900;
      setP(m && window.innerHeight > window.innerWidth);
    };
    c(); window.addEventListener('resize', c); window.addEventListener('orientationchange', c);
    return () => { window.removeEventListener('resize', c); window.removeEventListener('orientationchange', c); };
  }, []);
  return p;
}
function useFullscreen() {
  const [isFs, setFs] = useState(false);
  useEffect(() => {
    const h = () => setFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);
  const toggle = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        const el = document.documentElement;
        (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
      } else (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
    } catch {}
  }, []);
  return { isFs, toggle };
}

/* ==================== Utils ==================== */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function makeBlobPath(radius, seed) {
  const rand = mulberry32(seed);
  const N = 12, pts = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const r = radius * (0.82 + rand() * 0.28);
    pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < N; i++) {
    const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d + ' Z';
}
function regionPositions(radius, count = 6) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 - Math.PI / 2;
    out.push({ x: Math.cos(a) * radius * 0.72, y: Math.sin(a) * radius * 0.72 });
  }
  return out;
}

/* ==================== Castle ==================== */
const CastleIcon = ({ color, flagColor, size = 1 }) => (
  <g transform={`scale(${size})`} filter="url(#sokGlow)">
    <path d="M -22 18 L -22 -6 L -16 -6 L -16 -14 L -12 -14 L -12 -6 L -6 -6 L -6 -14 L -2 -14 L -2 -6 L 2 -6 L 2 -14 L 6 -14 L 6 -6 L 12 -6 L 12 -14 L 16 -14 L 16 -6 L 22 -6 L 22 18 Z"
      fill="#1a0f05" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    <rect x="-3" y="2" width="6" height="10" fill={color} opacity="0.9" />
    <rect x="-18" y="-2" width="4" height="6" fill={color} opacity="0.7" />
    <rect x="14" y="-2" width="4" height="6" fill={color} opacity="0.7" />
    <line x1="0" y1="-14" x2="0" y2="-32" stroke={color} strokeWidth="1.5" />
    <g style={{ transformOrigin: '0 -32px', animation: 'sokFlagWave 2.5s ease-in-out infinite' }}>
      <path d="M 0 -32 L 14 -28 L 0 -24 Z" fill={flagColor} stroke={color} strokeWidth="0.8" />
    </g>
  </g>
);

/* ==================== Region Node ==================== */
const RegionNode = ({ r, owner, ownerColor, claimable, attackable, onClick, label }) => {
  const interactive = claimable || attackable;
  return (
    <g transform={`translate(${r.x.toFixed(1)}, ${r.y.toFixed(1)})`}
      style={{ cursor: interactive ? 'pointer' : 'default' }}
      onClick={interactive ? onClick : undefined}>
      <polygon points="0,-24 20,-12 20,12 0,24 -20,12 -20,-12"
        fill={owner ? ownerColor : (claimable ? 'rgba(16,185,129,0.28)' : '#0f172a')}
        opacity={owner ? 0.95 : 1}
        stroke={owner ? 'rgba(212,175,55,0.65)' : 'rgba(100,116,139,0.45)'}
        strokeWidth="1.2"
        style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))' }} />
      {attackable && (
        <circle cx="17" cy="-17" r="4.5" fill="#dc2626" stroke="#fef3c7" strokeWidth="1.2" />
      )}
      <text y="3.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="white"
        pointerEvents="none"
        style={{ paintOrder: 'stroke', stroke: '#000', strokeWidth: 2.4 }}>
        {label}
      </text>
    </g>
  );
};

/* ==================== Crown ==================== */
const CrownSVG = ({ color }) => (
  <g filter="url(#sokGlow)">
    <path d="M -18 8 L -18 -6 L -12 -2 L -6 -12 L 0 -4 L 6 -12 L 12 -2 L 18 -6 L 18 8 Z"
      fill="#d4af37" stroke="#8b6914" strokeWidth="1" strokeLinejoin="round" />
    <circle cy="-14" r="2.5" fill={color || '#d4af37'} />
    <circle cx="-12" cy="-14" r="2" fill={color || '#d4af37'} />
    <circle cx="12" cy="-14" r="2" fill={color || '#d4af37'} />
  </g>
);

/* ==================== Realm Group ==================== */
const RealmGroup = ({
  realm, layout, ownership, players, playerId, myTurn, phase,
  onClaim, onAttackHub, onAttackBase, canAttackBaseFn,
}) => {
  const baseRegion = realm.regions[0];
  const baseOwner = ownership[realm.id]?.[baseRegion.id];
  const getColor = (pid) => players.find(p => p.id === pid)?.color || '#6b7280';

  const blobPath = useMemo(() => makeBlobPath(layout.r, layout.seed || realm.id.length * 13), [layout.r, layout.seed, realm.id]);
  const regionPos = useMemo(() => regionPositions(layout.r), [layout.r]);

  const hubs = realm.regions.slice(1, 7);

  const ownershipCount = useMemo(() => {
    const counts = {};
    realm.regions.forEach(r => {
      const owner = ownership[realm.id]?.[r.id];
      if (owner) counts[owner] = (counts[owner] || 0) + 1;
    });
    return counts;
  }, [ownership, realm.id, realm.regions]);

  const dominantOwner = useMemo(() => {
    const entries = Object.entries(ownershipCount);
    if (!entries.length) return null;
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  }, [ownershipCount]);

  const dominantCount = dominantOwner ? ownershipCount[dominantOwner] : 0;
  const totalRegions = realm.regions.length;
  const intensity = Math.min(0.55, dominantCount / totalRegions);

  const allOwnedByBase = baseOwner
    && hubs.every(r => ownership[realm.id]?.[r.id] === baseOwner);

  const canAttackBase = myTurn && phase === 'attacking' && baseOwner && baseOwner !== playerId && canAttackBaseFn(realm.id);

  return (
    <g transform={`translate(${layout.x}, ${layout.y})`}>
      <path d={blobPath} fill="rgba(0,0,0,0.55)" transform="translate(5,7)" pointerEvents="none" />

      <path d={blobPath}
        fill="url(#sokParchment)"
        stroke={allOwnedByBase ? '#ffd700' : 'rgba(212,175,55,0.55)'}
        strokeWidth={allOwnedByBase ? 3.5 : 1.5} />

      {dominantOwner && (
        <path d={blobPath} fill={getColor(dominantOwner)}
          opacity={intensity} pointerEvents="none" />
      )}

      {hubs.map((r, i) => {
        const owner = ownership[realm.id]?.[r.id];
        const col = (owner && baseOwner && owner === baseOwner)
          ? getColor(owner) : 'rgba(212,175,55,0.35)';
        return (
          <line key={r.id}
            x1="0" y1="0" x2={regionPos[i].x.toFixed(1)} y2={regionPos[i].y.toFixed(1)}
            stroke={col}
            strokeWidth={owner ? 2 : 1}
            strokeDasharray={owner ? '0' : '3 3'}
            pointerEvents="none" />
        );
      })}

      {hubs.map((r, i) => {
        const owner = ownership[realm.id]?.[r.id];
        const claimable = (phase === 'claiming' || phase === 'attacking') && myTurn && !owner;
        const attackable = phase === 'attacking' && myTurn && owner && owner !== playerId;
        return (
          <RegionNode
            key={r.id}
            r={regionPos[i]}
            owner={owner}
            ownerColor={owner ? getColor(owner) : null}
            claimable={claimable}
            attackable={attackable}
            label={r.name.length > 9 ? r.name.slice(0, 8) + '…' : r.name}
            onClick={() => {
              if (claimable) onClaim(realm.id, r.id);
              else if (attackable) onAttackHub(realm.id, r.id);
            }}
          />
        );
      })}

      <g style={{ cursor: canAttackBase ? 'pointer' : 'default' }}
        onClick={() => { if (canAttackBase) onAttackBase(realm.id); }}>
        {canAttackBase && (
          <circle r="34" fill="none" stroke="#facc15" strokeWidth="2" opacity="0.55" />
        )}
        <CastleIcon
          color={baseOwner ? getColor(baseOwner) : '#d4af37'}
          flagColor={baseOwner ? getColor(baseOwner) : '#8b0000'}
          size={1.1} />
      </g>

      <g transform={`translate(0, ${layout.r + 20})`} pointerEvents="none">
        <rect x="-58" y="-10" width="116" height="20" rx="5"
          fill="rgba(10,25,41,0.9)" stroke="#d4af37" strokeWidth="0.9" />
        <rect x="-56" y="-8" width="112" height="16" rx="3"
          fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="0.5" />
        <text textAnchor="middle" y="4" fontSize="10" fontWeight="800" fill="#f4e5a1"
          style={{ paintOrder: 'stroke', stroke: '#000', strokeWidth: 2 }}>
          {realm.icon} {realm.name}
        </text>
      </g>

      {allOwnedByBase && (
        <g transform={`translate(0, ${-layout.r - 10})`}
          style={{ animation: 'sokCrownDrop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>
          <CrownSVG color={getColor(baseOwner)} />
        </g>
      )}
    </g>
  );
};

/* ==================== Map Canvas ==================== */
const MapCanvas = ({
  gameState, players, playerId, myTurn, phase,
  onClaim, onAttackHub, onAttackBase, canAttackBaseFn,
}) => {
  const numPlayers = players.length;
  const activeRealmIds = useMemo(
    () => Object.keys(gameState.ownership || {}),
    [gameState.ownership]
  );
  const realms = useMemo(
    () => SOK_REALMS.filter(r => activeRealmIds.includes(r.id)),
    [activeRealmIds]
  );

  const layout = useMemo(() => {
    const positions = getMapLayout(realms.length);
    return realms.map((realm, i) => ({
      ...positions[i],
      id: realm.id,
      seed: i * 17 + 3,
    }));
  }, [realms]);

  const stars = useMemo(() => Array.from({ length: 60 }).map((_, i) => {
    const r = mulberry32(i * 7 + 3);
    return { x: r() * MAP_W, y: r() * MAP_H, s: 0.4 + r() * 1.1 };
  }), []);

  const imperialLines = useMemo(() => {
    const layoutMap = {};
    layout.forEach(l => { layoutMap[l.id] = l; });

    const homeRealmOf = {};
    Object.entries(gameState.ownership).forEach(([realmId, regions]) => {
      const baseId = SOK_REALMS.find(r => r.id === realmId)?.regions[0].id;
      const owner = regions[baseId];
      if (owner) homeRealmOf[owner] = realmId;
    });

    const externalCount = {};
    Object.entries(gameState.ownership).forEach(([realmId, regions]) => {
      Object.entries(regions).forEach(([regionId, owner]) => {
        if (!owner) return;
        const isBase = SOK_REALMS.find(r => r.id === realmId)?.regions[0].id === regionId;
        const isHome = homeRealmOf[owner] === realmId;
        if (isHome) return;
        const key = `${owner}::${realmId}`;
        externalCount[key] = (externalCount[key] || 0) + 1;
      });
    });

    const lines = [];
    Object.entries(externalCount).forEach(([key, count]) => {
      const [pid, realmId] = key.split('::');
      const homeRealm = homeRealmOf[pid];
      if (!homeRealm) return;
      const from = layoutMap[homeRealm];
      const to = layoutMap[realmId];
      if (!from || !to) return;
      const player = players.find(p => p.id === pid);
      if (!player) return;
      const strength = Math.min(1, count / 6);
      lines.push({
        id: key,
        from: { x: from.x, y: from.y },
        to: { x: to.x, y: to.y },
        color: player.color,
        count,
        strength,
      });
    });
    return lines;
  }, [gameState.ownership, layout, players]);

  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="sokSeaGrad" cx="50%" cy="50%" r="75%">
          <stop offset="0%" stopColor="#241345" />
          <stop offset="55%" stopColor="#120726" />
          <stop offset="100%" stopColor="#04010c" />
        </radialGradient>
        <radialGradient id="sokParchment" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#4a3820" />
          <stop offset="60%" stopColor="#2a1e0f" />
          <stop offset="100%" stopColor="#120a04" />
        </radialGradient>
        <filter id="sokGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect width={MAP_W} height={MAP_H} fill="url(#sokSeaGrad)" />

      <g opacity="0.13" pointerEvents="none">
        {Array.from({ length: 14 }).map((_, i) => (
          <path key={i}
            d={`M -200 ${60 + i*65} Q 100 ${40 + i*65} 400 ${60 + i*65} T 1000 ${60 + i*65} T 1600 ${60 + i*65} T 2200 ${60 + i*65}`}
            fill="none" stroke="#d4af37" strokeWidth="1" />
        ))}
      </g>

      <g pointerEvents="none">
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#f4e5a1" opacity="0.4" />
        ))}
      </g>

      {imperialLines.map(line => (
        <g key={line.id} pointerEvents="none">
          <line
            x1={line.from.x} y1={line.from.y}
            x2={line.to.x} y2={line.to.y}
            stroke={line.color}
            strokeWidth={2 + line.strength * 6}
            opacity={0.12}
            strokeLinecap="round" />
          <line
            x1={line.from.x} y1={line.from.y}
            x2={line.to.x} y2={line.to.y}
            stroke={line.color}
            strokeWidth={1.5 + line.strength * 3.5}
            opacity={0.35 + line.strength * 0.55}
            strokeDasharray={line.count >= 6 ? '0' : '10 6'}
            strokeLinecap="round"
            style={{ animation: 'sokLinePulse 3s ease-in-out infinite' }} />
          <circle
            cx={(line.from.x + line.to.x) / 2}
            cy={(line.from.y + line.to.y) / 2}
            r={2.5 + line.strength * 3}
            fill={line.color}
            opacity={0.85} />
        </g>
      ))}

      {realms.map((realm, i) => {
        const l = layout.find(x => x.id === realm.id) || layout[i];
        if (!l) return null;
        return (
          <RealmGroup
            key={realm.id}
            realm={realm}
            layout={l}
            ownership={gameState.ownership}
            players={players}
            playerId={playerId}
            myTurn={myTurn}
            phase={phase}
            onClaim={onClaim}
            onAttackHub={onAttackHub}
            onAttackBase={onAttackBase}
            canAttackBaseFn={canAttackBaseFn}
          />
        );
      })}

      <g transform={`translate(${MAP_W - 90}, ${MAP_H - 90})`} opacity="0.6" pointerEvents="none">
        <circle r="36" fill="none" stroke="#d4af37" strokeWidth="1" />
        <circle r="27" fill="none" stroke="#d4af37" strokeWidth="0.5" strokeDasharray="2 2" />
        <path d="M 0 -32 L 5 -5 L 32 0 L 5 5 L 0 32 L -5 5 L -32 0 L -5 -5 Z" fill="#d4af37" opacity="0.55" />
        <path d="M 0 -27 L 3.5 -3.5 L 27 0 L 3.5 3.5 L 0 27 L -3.5 3.5 L -27 0 L -3.5 -3.5 Z" fill="#0a1929" />
        <text y="-44" textAnchor="middle" fontSize="13" fill="#d4af37" fontWeight="800">N</text>
      </g>

      {[[30,30,1,1],[MAP_W-30,30,-1,1],[30,MAP_H-30,1,-1],[MAP_W-30,MAP_H-30,-1,-1]].map(([x,y,sx,sy], i) => (
        <g key={i} transform={`translate(${x}, ${y}) scale(${sx}, ${sy})`} opacity="0.55" pointerEvents="none">
          <path d="M 0 0 L 40 0 M 0 0 L 0 40 M 0 0 L 20 20" stroke="#d4af37" strokeWidth="1.5" fill="none" />
          <circle cx="0" cy="0" r="3" fill="#d4af37" />
          <circle cx="40" cy="0" r="2" fill="#d4af37" />
          <circle cx="0" cy="40" r="2" fill="#d4af37" />
        </g>
      ))}
    </svg>
  );
};

/* ==================== Modal ==================== */
const Modal = ({ children }) => (
  <div className="fixed inset-0 z-[980] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    style={{ animation: 'sokFadeIn 0.25s ease-out both' }}>
    <div style={{ animation: 'sokScaleIn 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>
      {children}
    </div>
  </div>
);

const TimerBar = ({ timer, max }) => {
  const pct = Math.max(0, Math.min(100, (timer / max) * 100));
  const d = timer <= 5;
  return (
    <div className="flex items-center gap-2 mb-4">
      <FaClock className={d ? 'text-red-400' : 'text-amber-300'} />
      <div className="flex-1 bg-black/50 rounded-full h-2 overflow-hidden border border-amber-500/20">
        <div className={`h-full rounded-full transition-all duration-1000 ${d ? 'bg-gradient-to-r from-red-600 to-red-400' : 'bg-gradient-to-r from-amber-500 to-yellow-400'}`}
          style={{ width: `${pct}%` }} />
      </div>
      <span className={`font-mono font-bold text-sm w-7 text-right ${d ? 'text-red-400' : 'text-amber-100'}`}>{timer}</span>
    </div>
  );
};

/* ==================== Results Panel ==================== */
const ResultsPanel = ({ results }) => {
  const isMcq = results?.questionType === 'mcq';
  const options = results?.questionOptions;

  return (
    <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/30">
      <p className="text-amber-200 text-base font-bold mb-2 text-center">
        الإجابة الصحيحة: <span className="text-emerald-300 text-lg">{results.correctAnswer}</span>
      </p>

      {results.initiatorId && (
        <p className={`text-center text-sm mb-4 font-bold ${
          results.claimed ? 'text-emerald-400' : 'text-red-400'
        }`}>
          {results.claimed
            ? `✅ صاحب الدور جاوب صح — ${results.answers.find(a => a.isInitiator)?.playerName} خد الإقليم`
            : `❌ صاحب الدور أخطأ — الإقليم اتحرم من الكل`}
        </p>
      )}

      <div className="space-y-2.5 max-h-[55vh] overflow-auto">
        {results.answers?.map((e, i) => {
          const isCorrect = e.isCorrect;
          return (
            <div key={i}
              className={`flex items-center justify-between gap-4 py-3 px-4 rounded-xl border-2 text-base ${
                isCorrect
                  ? 'bg-emerald-600/35 border-emerald-400'
                  : 'bg-red-600/25 border-red-500/70'
              }`}>
              <span className="flex items-center gap-2 font-bold text-white text-base sm:text-lg">
                <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: e.color }} />
                {e.playerName}
                {e.isInitiator && <span className="text-xs text-amber-300 ml-1">🎯</span>}
              </span>
              <span className="font-mono text-white text-base sm:text-lg font-bold">
                {isMcq && options ? options[parseInt(e.answer, 10)] ?? e.answer : e.answer}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ==================== Rules ==================== */
const RulesModal = ({ onClose }) => (
  <div className="fixed inset-0 z-[960] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
    onClick={onClose}>
    <div className="max-w-3xl w-full max-h-[92vh] overflow-y-auto rounded-2xl p-6 sm:p-8 border-2 border-amber-500/50"
      style={{
        background: 'linear-gradient(160deg, #1a0a2e 0%, #0a1929 60%, #2a1a04 100%)',
        animation: 'sokScaleIn 0.3s ease-out both',
        boxShadow: '0 0 60px rgba(212,175,55,0.3)'
      }}
      onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-5 pb-4 border-b border-amber-500/30">
        <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent flex items-center gap-2">
          <FaCrown className="text-amber-300" /> قوانين سيف المعرفة
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition">
          <FaTimes size={22} />
        </button>
      </div>

      <div className="space-y-6 text-amber-100/90 text-[13px] sm:text-sm leading-[1.9] text-right">
        <section className="bg-black/30 rounded-xl p-4 border border-amber-500/20">
          <h3 className="text-lg font-bold text-amber-300 mb-2">🎯 فكرة اللعبة</h3>
          <p>كل لاعب يحكم مملكة واحدة في البداية، وهدفه توسيع إمبراطوريته بالسيطرة على أراضي الخصوم. اللعبة على مرحلتين: <b className="text-amber-200">السيطرة</b> ثم <b className="text-red-300">الهجوم</b>. آخر لاعب يصمد على الخريطة يتوَّج <b className="text-amber-300">ملكاً للمعرفة</b> 👑</p>
        </section>
        <section className="bg-emerald-950/30 rounded-xl p-4 border border-emerald-500/25">
          <h3 className="text-lg font-bold text-emerald-300 mb-2">⚔️ المرحلة الأولى — السيطرة</h3>
          <p className="mb-2">في دورك، اضغط على أي <b className="text-amber-200">إقليم فارغ</b>. يظهر سؤال للجميع. لو جاوبت صح → تاخد الإقليم. لو غلط → الإقليم يفضل فاضي.</p>
        </section>
        <section className="bg-red-950/30 rounded-xl p-4 border border-red-500/25">
          <h3 className="text-lg font-bold text-red-300 mb-2">⚔️ المرحلة الثانية — الهجوم</h3>
          <p>تختار إقليم خصم → مبارزة Best of 3. أول واحد يوصل 2 جولات = يفوز بالمبارزة.</p>
        </section>
        <section className="bg-purple-950/30 rounded-xl p-4 border border-purple-500/25">
          <h3 className="text-lg font-bold text-purple-300 mb-2">👑 شروط الفوز</h3>
          <p>آخر لاعب صامد = يفوز ويتوَّج <b className="text-amber-300">ملكاً للمعرفة</b>.</p>
        </section>
      </div>

      <button onClick={onClose}
        className="mt-6 w-full py-3 rounded-xl font-bold text-base transition hover:brightness-110"
        style={{ background: 'linear-gradient(90deg,#d4af37,#f4e5a1,#d4af37)', color: '#0a1929' }}>
        ⚔️ فهمت، يلا نبدأ المعركة
      </button>
    </div>
  </div>
);

/* ============================================================
   Main Component
   ============================================================ */
const SwordRound = ({ socket, roomCode, playerId, playerName, isAdmin, players, onExit }) => {
  const isPortraitMobile = useOrientation();
  const { isFs, toggle: toggleFs } = useFullscreen();

  const soundRef = useRef(null);
  const [soundReady, setSoundReady] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  const [gameState, setGameState] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [duelQuestion, setDuelQuestion] = useState(null);
  const [duelScores, setDuelScores] = useState(null);
  const [results, setResults] = useState(null);
  const [duelRoundResult, setDuelRoundResult] = useState(null);
  const [gameOver, setGameOver] = useState(null);
  const [timer, setTimer] = useState(SOK_CONFIG.questionTimer);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [myAnswer, setMyAnswer] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [phaseMsg, setPhaseMsg] = useState(null);
  const [pendingStageMsg, setPendingStageMsg] = useState(null);
  const [claimMsg, setClaimMsg] = useState(null);
  const [duelMsg, setDuelMsg] = useState(null);
  const [playerLeftMsg, setPlayerLeftMsg] = useState(null);

  const claimingShownRef = useRef(false);
  const attackModalShownRef = useRef(false);
  const prevPhaseRef = useRef(null);
  const lastTickRef = useRef(null);

  // ✅ مرجع يتتبع إننا لعبنا بالفعل في هذه الجلسة
  const hasPlayedRef = useRef(false);

  useEffect(() => { soundRef.current = new SoundEngine(SOK_SOUND_PATHS); }, []);
  const unlockSound = useCallback(async () => {
    if (!soundRef.current || soundReady) return;
    await soundRef.current.unlock();
    setSoundReady(true);
  }, [soundReady]);
  useEffect(() => { if (soundRef.current) soundRef.current.setEnabled(!soundMuted); }, [soundMuted]);
  const playSound = useCallback((n) => { soundRef.current?.play(n); }, []);

  // ✅ إعادة تعيين كل المراجع عند تغيير الغرفة
  useEffect(() => {
    setGameOver(null);
    setCurrentQuestion(null);
    setDuelQuestion(null);
    setResults(null);
    setDuelRoundResult(null);
    setPhaseMsg(null);
    setClaimMsg(null);
    setDuelMsg(null);
    setPlayerLeftMsg(null);
    hasPlayedRef.current = false;
    claimingShownRef.current = false;
    attackModalShownRef.current = false;
    prevPhaseRef.current = null;
  }, [roomCode]);

  useEffect(() => {
    if (!socket) return;
    socket.emit('sok_init', { roomCode });

    const onState = (state) => {
      // ✅ إذا كانت اللعبة في مرحلة غير منتهية → الجلسة حقيقية
      if (state.phase !== 'ended') {
        hasPlayedRef.current = true;
        setGameOver(null);
      }

      // إشعار بداية مرحلة السيطرة
      if (state.phase === 'claiming' && !claimingShownRef.current) {
        claimingShownRef.current = true;
        setPhaseMsg('claiming');
        playSound('phaseChange');
        setTimeout(() => setPhaseMsg(null), SOK_CONFIG.msgDisplayMs);
      }
      // إشعار بداية مرحلة الهجوم
      if (prevPhaseRef.current !== 'attacking' && state.phase === 'attacking') {
        setPhaseMsg('attacking');
        playSound('phaseChange');
        setTimeout(() => setPhaseMsg(null), SOK_CONFIG.msgDisplayMs);
      }

      prevPhaseRef.current = state.phase;
      setGameState(state);
    };

    const onQuestion = (q) => {
      setCurrentQuestion(q);
      setTimer(SOK_CONFIG.questionTimer);
      setHasAnswered(false); setMyAnswer(''); setResults(null);
      playSound('turn');
    };
    const onClearQuestion = () => setCurrentQuestion(null);
    const onDuelQuestion = (q) => {
      setDuelQuestion(q); setCurrentQuestion(null);
      setTimer(SOK_CONFIG.duelTimer);
      setHasAnswered(false); setMyAnswer('');
      playSound('swordClash');
    };
    const onDuelStatus = (s) => setDuelScores(s.scores);
    const onDuelRoundResult = (data) => {
      setDuelScores(data.scores);
      setDuelRoundResult({
        round: data.round,
        correctAnswer: data.correctAnswer,
        winnerName: data.winnerName || null,
      });
      playSound(data.winner ? 'correct' : 'wrong');
      setTimeout(() => setDuelRoundResult(null), 4000);
    };

    // ✅ لا تعرض شاشة الفوز إلا لو لعبنا فعلًا
    const onGameOver = (d) => {
      if (!hasPlayedRef.current) return;
      setGameOver(d);
      playSound('victory');
    };

    const onRequestDuelQuestion = () => socket.emit('sok_provide_duel_question', { roomCode });
    const onResults = (res) => {
      setResults(res);
      if (res.claimed) playSound('correct');
      else if (res.initiatorCorrect === false && res.denyGained?.includes(playerId)) playSound('deny');
      else playSound('wrong');
      setTimeout(() => setResults(null), SOK_CONFIG.resultsDisplayMs);
    };
    const onClaimStart = (data) => { setClaimMsg(data); playSound('claim'); setTimeout(() => setClaimMsg(null), SOK_CONFIG.msgDisplayMs); };
    const onDuelStart = (data) => { setDuelMsg(data); playSound('attack'); setTimeout(() => setDuelMsg(null), SOK_CONFIG.msgDisplayMs); };
    const onStageChanged = ({ stage }) => {
      if (stage === 'attacking' && !attackModalShownRef.current) {
        attackModalShownRef.current = true;
        setPendingStageMsg('attacking');
      }
    };
    const onError = (err) => console.warn('[SOK]', err?.message || err);

    const onPlayerLeft = (data) => {
      setPlayerLeftMsg(data);
      setTimeout(() => setPlayerLeftMsg(null), 4000);
    };
    socket.on('sok_player_left', onPlayerLeft);

    socket.on('sok_state', onState);
    socket.on('sok_question', onQuestion);
    socket.on('sok_clear_question', onClearQuestion);
    socket.on('sok_duel_question', onDuelQuestion);
    socket.on('sok_duel_status', onDuelStatus);
    socket.on('sok_duel_round_result', onDuelRoundResult);
    socket.on('sok_game_over', onGameOver);
    socket.on('sok_request_duel_question', onRequestDuelQuestion);
    socket.on('sok_results', onResults);
    socket.on('sok_claim_start', onClaimStart);
    socket.on('sok_duel_start', onDuelStart);
    socket.on('sok_stage_changed', onStageChanged);
    socket.on('sok_error', onError);

    return () => {
      socket.off('sok_state', onState);
      socket.off('sok_question', onQuestion);
      socket.off('sok_clear_question', onClearQuestion);
      socket.off('sok_duel_question', onDuelQuestion);
      socket.off('sok_duel_status', onDuelStatus);
      socket.off('sok_duel_round_result', onDuelRoundResult);
      socket.off('sok_game_over', onGameOver);
      socket.off('sok_request_duel_question', onRequestDuelQuestion);
      socket.off('sok_results', onResults);
      socket.off('sok_claim_start', onClaimStart);
      socket.off('sok_duel_start', onDuelStart);
      socket.off('sok_stage_changed', onStageChanged);
      socket.off('sok_error', onError);
      socket.off('sok_player_left', onPlayerLeft);
      socket.emit('sok_cleanup', { roomCode });
    };
    // eslint-disable-next-line
  }, [socket, roomCode]);

  useEffect(() => {
    if (!currentQuestion && !duelQuestion) return;
    if (hasAnswered) return;
    const id = setInterval(() => {
      setTimer(t => {
        const nt = t - 1;
        if (nt === 5 && lastTickRef.current !== 5) { playSound('tick'); lastTickRef.current = 5; }
        return Math.max(0, nt);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [currentQuestion, duelQuestion, hasAnswered, playSound]);

  useEffect(() => {
    if (results || !pendingStageMsg) return;
    const t = setTimeout(() => {
      setPhaseMsg(pendingStageMsg);
      playSound('phaseChange');
      setPendingStageMsg(null);
      setTimeout(() => setPhaseMsg(null), 4500);
    }, 350);
    return () => clearTimeout(t);
  }, [results, pendingStageMsg, playSound]);

  const realPlayers = gameState?.players || [];
  const me = realPlayers.find(p => p.id === playerId);
  const amIEliminated = !!me?.eliminated;
  const myTurn = gameState?.turn === playerId;

  const canAttackBaseFn = (realmId) => {
    if (!gameState) return false;
    const baseId = SOK_REALMS.find(r => r.id === realmId)?.regions[0].id;
    if (!baseId) return false;
    const defenderId = gameState.ownership[realmId]?.[baseId];
    if (!defenderId || defenderId === playerId) return false;
    const defenderHome = Object.keys(gameState.ownership).find(cid =>
      gameState.ownership[cid][SOK_REALMS.find(c => c.id === cid).regions[0].id] === defenderId
    );
    if (!defenderHome) return false;
    const foreign = Object.keys(gameState.ownership).some(cid => {
      if (cid === defenderHome) return false;
      return Object.values(gameState.ownership[cid]).some(o => o === defenderId);
    });
    if (foreign) return false;
    const cont = SOK_REALMS.find(c => c.id === realmId);
    const myHubs = cont.regions.slice(1, 7).filter(r => gameState.ownership[realmId][r.id] === playerId).length;
    return myHubs >= 4;
  };

  const claimRegion = (rid, reg) => {
    if (amIEliminated || !myTurn) return;
    unlockSound(); playSound('claim');
    socket.emit('sok_claim', { roomCode, continentId: rid, regionName: reg, playerId });
  };
  const attackHub = (rid, reg) => {
    if (!myTurn || gameState?.phase !== 'attacking') return;
    unlockSound(); playSound('attack');
    socket.emit('sok_attack_hub', { roomCode, continentId: rid, regionName: reg, attackerId: playerId });
  };
  const attackBase = (rid) => {
    if (!myTurn || gameState?.phase !== 'attacking') return;
    unlockSound(); playSound('attack');
    socket.emit('sok_attack_base', { roomCode, continentId: rid, attackerId: playerId });
  };
  const sendClaimAnswer = () => {
    if (!currentQuestion || hasAnswered || !String(myAnswer).trim()) return;
    socket.emit('sok_claim_answer', { roomCode, playerId, answer: String(myAnswer).trim() });
    setHasAnswered(true);
  };
  const sendDuelAnswer = () => {
    if (!duelQuestion || hasAnswered || !String(myAnswer).trim()) return;
    socket.emit('sok_duel_answer', { roomCode, playerId, answer: String(myAnswer).trim() });
    setHasAnswered(true);
  };

  if (isPortraitMobile) {
    return (
      <>
        <style>{AnimCSS}</style>
        <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center text-center p-6"
          style={{ background: 'radial-gradient(circle at 50% 40%, #4a1e6f 0%, #1a0a2e 60%, #000 100%)' }}>
          <div className="text-7xl mb-4 animate-bounce">📱↻</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-amber-300 mb-2">لف الموبايل بالعرض</h2>
          <p className="text-gray-300 mb-6 max-w-xs">اللعبة مصممة للوضع الأفقي.</p>
          <button onClick={toggleFs} className="px-6 py-3 rounded-xl font-bold"
            style={{ background: 'linear-gradient(90deg,#d4af37,#f4e5a1)', color: '#0a1929' }}>
            <FaExpand className="inline mr-2" /> ملء الشاشة
          </button>
        </div>
      </>
    );
  }
  if (!gameState) {
    return (
      <>
        <style>{AnimCSS}</style>
        <div className="fixed inset-0 z-[999] flex items-center justify-center"
          style={{ background: 'radial-gradient(circle at 50% 40%, #4a1e6f 0%, #1a0a2e 60%, #000 100%)' }}>
          <div className="text-center">
            <div className="text-6xl">⚔️</div>
            <p className="text-amber-300 mt-4 font-bold">جاري تحضير ساحة المعركة...</p>
          </div>
        </div>
      </>
    );
  }

  const { phase, ownership, scores } = gameState;
  const turnPlayer = realPlayers.find(p => p.id === gameState.turn);
  const amIInDuel = gameState.duel && (gameState.duel.attackerId === playerId || gameState.duel.defenderId === playerId);

  return (
    <>
      <style>{AnimCSS}</style>
      <div className="fixed inset-0 z-[900] flex flex-col text-white overflow-hidden"
        style={{ background: 'radial-gradient(circle at 30% 20%, #2a1050 0%, #10061e 55%, #04010a 100%)' }}
        onClick={unlockSound}>

        {/* الشريط العلوي الموحّد */}
        <header
          className="relative z-30 flex items-center gap-2 px-2 py-1 border-b border-amber-500/30 flex-shrink-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(20,8,36,0.98), rgba(60,24,90,0.9), rgba(20,8,36,0.98))',
          }}
        >
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <FaCrown className="text-amber-300 text-sm" />
            <h1 className="font-extrabold text-xs sm:text-sm bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300 bg-clip-text text-transparent whitespace-nowrap">
              سيف المعرفة
            </h1>
          </div>

          <span className="hidden sm:inline text-amber-500/30">|</span>

          <div className="text-[10px] sm:text-xs text-amber-100 whitespace-nowrap flex-shrink-0">
            {phase === 'claiming' && (
              <span>
                🗺️ <b className="text-white">{turnPlayer?.name || '—'}</b>
                <span className="hidden sm:inline"> • جولة <b className="text-amber-300">{(gameState.roundCount || 0) + 1}</b> / {gameState.maxClaimRounds || 8}</span>
              </span>
            )}
            {phase === 'attacking' && (
              <span>⚔️ <b className="text-white">{turnPlayer?.name || '—'}</b></span>
            )}
            {phase === 'duel' && <span className="text-red-300 font-bold">⚡ مبارزة</span>}
            {phase === 'ended' && <span className="text-amber-300 font-bold">🏆 انتهت</span>}
          </div>

          <span className="hidden sm:inline text-amber-500/30">|</span>

          <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">
            {realPlayers.map(p => {
              const isTurn = gameState.turn === p.id && !p.eliminated;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full whitespace-nowrap text-[10px] sm:text-xs border flex-shrink-0 transition-all ${
                    p.eliminated ? 'opacity-40 border-gray-600'
                    : isTurn ? 'border-amber-400 shadow-[0_0_12px_rgba(212,175,55,0.55)]'
                    : 'border-gray-600'
                  }`}
                  style={{
                    background: isTurn ? 'rgba(212,175,55,0.15)' : 'rgba(31,41,55,0.7)',
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  <span
                    className="font-bold"
                    style={{ color: p.id === playerId ? '#f4e5a1' : '#e5e7eb' }}
                  >
                    {p.name}{p.id === playerId ? ' (أنت)' : ''}
                  </span>
                  <span className="text-amber-300">({scores?.[p.id] || 0})</span>
                  {gameState?.skippedPlayers?.[p.id] && <span className="text-red-400">⏭</span>}
                  {p.eliminated && <FaSkull className="text-red-500" size={9} />}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {(currentQuestion || duelQuestion) && !hasAnswered && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-black/40 border border-amber-500/30">
                <FaClock className={timer <= 5 ? 'text-red-400' : 'text-amber-300'} size={11} />
                <span className={`font-mono font-bold text-xs ${timer <= 5 ? 'text-red-400' : 'text-amber-100'}`}>
                  {timer}
                </span>
              </div>
            )}

            <button
              onClick={() => setSoundMuted(m => !m)}
              title="الصوت"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-black/30 border border-amber-500/30 hover:bg-black/50"
            >
              {soundMuted ? <FaVolumeMute className="text-red-400 text-xs" /> : <FaVolumeUp className="text-amber-200 text-xs" />}
            </button>

            <button
              onClick={() => setShowRules(true)}
              title="القواعد"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-black/30 border border-amber-500/30 hover:bg-black/50"
            >
              <FaBook className="text-amber-200 text-xs" />
            </button>

            <button
              onClick={toggleFs}
              title="ملء الشاشة"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-black/30 border border-amber-500/30 hover:bg-black/50"
            >
              {isFs ? <FaCompress className="text-amber-200 text-xs" /> : <FaExpand className="text-amber-200 text-xs" />}
            </button>

            {isAdmin && (
              <button
                onClick={() => socket.emit('sok_reset', { roomCode })}
                title="إعادة"
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-700/60 border border-amber-400/50 hover:bg-amber-700"
              >
                <FaRedo className="text-white text-xs" />
              </button>
            )}

            <button
              onClick={onExit}
              title="خروج"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-800/70 border border-red-400/50 hover:bg-red-700"
            >
              <FaSignOutAlt className="text-white text-xs" />
            </button>
          </div>
        </header>

        {/* البورد */}
        <main className="relative z-10 flex-1 overflow-hidden">
          <MapCanvas
            gameState={gameState}
            players={realPlayers}
            playerId={playerId}
            myTurn={myTurn}
            phase={phase}
            onClaim={claimRegion}
            onAttackHub={attackHub}
            onAttackBase={attackBase}
            canAttackBaseFn={canAttackBaseFn}
          />

          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full text-[11px] sm:text-xs pointer-events-none whitespace-nowrap"
            style={{
              background: 'rgba(8,4,20,0.85)',
              border: '1px solid rgba(212,175,55,0.35)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {myTurn && !amIEliminated && (
              <span className="text-amber-200 font-bold">دورك الآن — اضغط على أي منطقة</span>
            )}
            {!myTurn && !amIEliminated && phase !== 'duel' && phase !== 'ended' && (
              <span className="text-amber-100/70">في انتظار دورك...</span>
            )}
            {amIEliminated && (
              <span className="text-red-400 font-bold">☠️ أنت مشاهد فقط</span>
            )}
          </div>
        </main>

        {/* النوافذ المنبثقة */}
        {phaseMsg && (
          <div className="fixed inset-0 z-[990] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            style={{ animation: 'sokFadeIn 0.3s ease-out both' }}>
            <div style={{ animation: 'sokScaleIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>
              <div className="text-center relative">
                {phaseMsg === 'claiming' ? (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-40 h-40 rounded-full border-2 border-emerald-400/60"
                        style={{ animation: 'sokCircleExpand 1.8s ease-out 0.2s both' }} />
                      <div className="w-40 h-40 rounded-full border-2 border-teal-400/40 absolute"
                        style={{ animation: 'sokCircleExpand 1.8s ease-out 0.5s both' }} />
                    </div>
                    <div className="text-7xl mb-3"
                      style={{ animation: 'sokShieldSpin 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}>
                      🛡️
                    </div>
                    <h2
                      className="text-4xl sm:text-6xl font-extrabold bg-gradient-to-l from-emerald-300 via-teal-200 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg"
                      style={{
                        animation: 'sokClaimReveal 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) both, sokClaimGlow 2.4s ease-in-out 0.9s both',
                      }}>
                      مرحلة السيطرة
                    </h2>
                    <p
                      className="text-emerald-100/85 mt-5 text-base sm:text-lg font-bold tracking-wide"
                      style={{ animation: 'sokFadeIn 0.7s ease-out 1s both' }}>
                      🗺️ ابدأ بتوسيع مملكتك…
                    </p>
                  </>
                ) : (
                  <>
                    <div className="relative h-32 sm:h-40 flex items-center justify-center mb-2">
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-orange-400 blur-2xl"
                          style={{ animation: 'sokClashFlash 2.2s ease-out 0.5s both' }} />
                      </div>
                      <svg width="140" height="140" viewBox="0 0 100 100"
                        className="absolute"
                        style={{ animation: 'sokSwordLeft 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both' }}>
                        <defs>
                          <linearGradient id="sokBladeL" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#94a3b8" />
                            <stop offset="50%" stopColor="#f1f5f9" />
                            <stop offset="100%" stopColor="#cbd5e1" />
                          </linearGradient>
                        </defs>
                        <path d="M 50 8 L 54 70 L 50 78 L 46 70 Z" fill="url(#sokBladeL)"
                          stroke="#475569" strokeWidth="0.8" />
                        <rect x="46" y="78" width="8" height="14" fill="#7c2d12" stroke="#450a0a" strokeWidth="0.6" />
                        <rect x="42" y="82" width="16" height="3" fill="#d4af37" />
                        <circle cx="50" cy="94" r="3" fill="#d4af37" />
                      </svg>
                      <svg width="140" height="140" viewBox="0 0 100 100"
                        className="absolute"
                        style={{ animation: 'sokSwordRight 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both' }}>
                        <defs>
                          <linearGradient id="sokBladeR" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#94a3b8" />
                            <stop offset="50%" stopColor="#f1f5f9" />
                            <stop offset="100%" stopColor="#cbd5e1" />
                          </linearGradient>
                        </defs>
                        <path d="M 50 8 L 54 70 L 50 78 L 46 70 Z" fill="url(#sokBladeR)"
                          stroke="#475569" strokeWidth="0.8" />
                        <rect x="46" y="78" width="8" height="14" fill="#7c2d12" stroke="#450a0a" strokeWidth="0.6" />
                        <rect x="42" y="82" width="16" height="3" fill="#d4af37" />
                        <circle cx="50" cy="94" r="3" fill="#d4af37" />
                      </svg>
                      {[
                        { dx: '-60px', dy: '-40px', delay: '0.55s' },
                        { dx: '60px',  dy: '-40px', delay: '0.55s' },
                        { dx: '-40px', dy: '-70px', delay: '0.6s' },
                        { dx: '40px',  dy: '-70px', delay: '0.6s' },
                        { dx: '-80px', dy: '20px',  delay: '0.65s' },
                        { dx: '80px',  dy: '20px',  delay: '0.65s' },
                      ].map((sp, i) => (
                        <div key={i}
                          className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-yellow-300 shadow-[0_0_12px_rgba(250,204,21,1)]"
                          style={{
                            '--dx': sp.dx, '--dy': sp.dy,
                            animation: `sokSparkFly 0.9s ease-out ${sp.delay} both`,
                          }} />
                      ))}
                    </div>
                    <h2
                      className="text-4xl sm:text-6xl font-extrabold bg-gradient-to-l from-red-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg"
                      style={{
                        animation: 'sokAttackReveal 1.1s cubic-bezier(0.34, 1.56, 0.64, 1) both, sokAttackGlow 2.4s ease-in-out 0.9s both',
                      }}>
                      مرحلة الهجوم
                    </h2>
                    <p
                      className="text-red-100/85 mt-5 text-base sm:text-lg font-bold tracking-wide"
                      style={{ animation: 'sokFadeIn 0.7s ease-out 1s both' }}>
                      ⚔️ الآن… وقت الحسم!
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {claimMsg && (
          <Modal>
            <div className="text-center max-w-md">
              <div className="text-5xl mb-2">🗡️</div>
              <h2 className="text-xl sm:text-2xl font-bold text-emerald-300">{claimMsg.playerName} يحاول السيطرة</h2>
              <p className="text-2xl text-amber-300 mt-2">{claimMsg.regionName}</p>
              <p className="text-amber-100/60 text-sm">({claimMsg.continentName})</p>
            </div>
          </Modal>
        )}

        {duelMsg && (
          <Modal>
            <div className="text-center max-w-md">
              <div className="text-5xl mb-2">⚔️</div>
              <h2 className="text-xl sm:text-2xl font-bold text-red-400">{duelMsg.attackerName} يهاجم {duelMsg.defenderName}</h2>
              <p className="text-lg text-amber-300 mt-2">على {duelMsg.regionName}</p>
            </div>
          </Modal>
        )}

        {(currentQuestion || results) && (phase === 'claiming' || phase === 'attacking') && (
          <Modal>
            <div className="max-w-2xl w-full bg-gradient-to-br from-[#1a0a2e] to-[#0a1929] rounded-2xl p-6 border border-amber-500/40 shadow-[0_0_40px_rgba(212,175,55,0.25)]">
              <TimerBar timer={timer} max={SOK_CONFIG.questionTimer} />
              <h3 className="text-lg sm:text-xl font-bold text-amber-200 mb-4 text-center leading-relaxed">
                {currentQuestion?.text || results?.questionText}
              </h3>
              {results && <ResultsPanel results={results} />}
              {!results && currentQuestion && (
                <>
                  {currentQuestion.type === 'numeric' ? (
                    <div className="flex gap-2">
                      <input type="number" value={myAnswer}
                        onChange={e => setMyAnswer(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendClaimAnswer()}
                        disabled={hasAnswered}
                        className="flex-1 bg-black/40 border border-amber-500/40 rounded-xl px-4 py-3 text-white text-center text-lg outline-none focus:border-amber-400"
                        placeholder="اكتب إجابتك..." />
                      <button onClick={sendClaimAnswer}
                        disabled={hasAnswered || !String(myAnswer).trim()}
                        className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 px-5 py-3 rounded-xl font-bold disabled:opacity-40 whitespace-nowrap">
                        إرسال
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentQuestion.options.map((opt, idx) => (
                        <button key={idx}
                          onClick={() => {
                            if (hasAnswered) return;
                            socket.emit('sok_claim_answer', { roomCode, playerId, answer: String(idx) });
                            setHasAnswered(true);
                          }}
                          disabled={hasAnswered}
                          className="w-full bg-black/40 hover:bg-amber-900/40 border border-amber-500/30 hover:border-amber-400 text-white py-3 px-4 rounded-xl text-right disabled:opacity-40 transition-all">
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                  {hasAnswered && (
                    <p className="text-emerald-400 text-center mt-3 text-sm font-bold">✓ تم الإرسال — بانتظار بقية اللاعبين</p>
                  )}
                </>
              )}
            </div>
          </Modal>
        )}

        {duelQuestion && phase === 'duel' && amIInDuel && !amIEliminated && (
          <Modal>
            <div className="max-w-lg w-full bg-gradient-to-br from-[#3a0a0a] to-[#0a1929] rounded-2xl p-5 border border-red-500/50 shadow-[0_0_40px_rgba(220,38,38,0.35)]">
              <div className="text-center mb-3">
                <FaBolt className="inline text-red-400 text-2xl" />
                <span className="text-red-300 font-bold ml-2">مبارزة — الجولة {gameState.duel?.round}</span>
              </div>
              <TimerBar timer={timer} max={SOK_CONFIG.duelTimer} />
              {duelScores && (
                <div className="flex justify-center gap-3 mb-3 text-xs sm:text-sm">
                  <span className="px-2 py-1 rounded-lg bg-red-900/50 border border-red-500/30">
                    ⚔️ {realPlayers.find(p => p.id === gameState.duel?.attackerId)?.name}: {duelScores[gameState.duel?.attackerId] || 0}
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-blue-900/50 border border-blue-500/30">
                    🛡️ {realPlayers.find(p => p.id === gameState.duel?.defenderId)?.name}: {duelScores[gameState.duel?.defenderId] || 0}
                  </span>
                </div>
              )}
              <h3 className="text-base sm:text-lg font-bold text-amber-200 mb-4 text-center leading-relaxed">{duelQuestion.text}</h3>
              {duelQuestion.type === 'numeric' ? (
                <div className="flex gap-2">
                  <input type="number" value={myAnswer}
                    onChange={e => setMyAnswer(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendDuelAnswer()}
                    disabled={hasAnswered}
                    className="flex-1 bg-black/40 border border-red-500/40 rounded-xl px-4 py-3 text-white text-center text-lg outline-none focus:border-red-400" />
                  <button onClick={sendDuelAnswer}
                    disabled={hasAnswered || !String(myAnswer).trim()}
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 px-5 py-3 rounded-xl font-bold disabled:opacity-40 whitespace-nowrap">
                    إرسال
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {duelQuestion.options.map((opt, idx) => (
                    <button key={idx}
                      onClick={() => {
                        if (hasAnswered) return;
                        socket.emit('sok_duel_answer', { roomCode, playerId, answer: String(idx) });
                        setHasAnswered(true);
                      }}
                      disabled={hasAnswered}
                      className="w-full bg-black/40 hover:bg-red-900/40 border border-red-500/30 hover:border-red-400 text-white py-3 px-4 rounded-xl text-right disabled:opacity-40">
                      {opt}
                    </button>
                  ))}
                </div>
              )}
              {hasAnswered && <p className="text-emerald-400 text-center mt-3 text-sm">✓ تم — بانتظار الخصم</p>}
            </div>
          </Modal>
        )}

        {duelRoundResult && (
          <Modal>
            <div className="max-w-md w-full bg-gradient-to-br from-[#1a0a2e] to-[#0a1929] rounded-2xl p-6 text-center border border-amber-500/50">
              <h3 className="text-xl font-bold text-amber-300 mb-3">نتيجة الجولة {duelRoundResult.round}</h3>
              {duelRoundResult.winnerName ? (
                <p className="text-emerald-400 mb-2 font-bold text-lg">
                  🏆 {duelRoundResult.winnerName} كسب الجولة!
                </p>
              ) : (
                <p className="text-gray-400 mb-2 font-bold text-lg">
                  ⚖️ محدش جاوب صح — الجولة ماحسبتش لحد
                </p>
              )}
              <div className="bg-black/40 rounded-xl p-3 mt-2 border border-amber-500/20">
                <p className="text-amber-100/60 text-xs">الإجابة الصحيحة</p>
                <p className="text-white text-lg font-bold">{duelRoundResult.correctAnswer}</p>
              </div>
            </div>
          </Modal>
        )}

        {phase === 'duel' && !amIInDuel && !gameOver && (
          <Modal>
            <div className="bg-black/60 rounded-2xl p-6 text-center border border-amber-500/30">
              <div className="text-4xl mb-2">⚔️</div>
              <h3 className="text-xl font-bold text-red-300">مبارزة جارية</h3>
              <p className="text-amber-100 mt-2">
                {realPlayers.find(p => p.id === gameState.duel?.attackerId)?.name}
                <span className="text-red-400 mx-2">ضد</span>
                {realPlayers.find(p => p.id === gameState.duel?.defenderId)?.name}
              </p>
            </div>
          </Modal>
        )}

        {gameOver && (
          <Modal>
            <div className="text-center max-w-md">
              <div className="text-7xl mb-4" style={{ animation: 'sokCrownDrop 0.7s ease-out both' }}>👑</div>
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
                {gameOver.name} ملك المعرفة!
              </h2>
              <p className="text-amber-100/80 mt-3">أخضع كل الممالك تحت رايته ⚔️</p>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={() => {
                    setGameOver(null);
                    hasPlayedRef.current = false;
                    socket.emit('sok_reset', { roomCode });
                  }}
                  className="flex-1 px-6 py-3 rounded-xl font-bold"
                  style={{
                    background: 'linear-gradient(90deg,#10b981,#059669)',
                    color: '#ffffff',
                    boxShadow: '0 8px 24px rgba(16,185,129,0.4)',
                  }}>
                  🔄 لعبة جديدة
                </button>
                <button
                  onClick={onExit}
                  className="flex-1 px-6 py-3 rounded-xl font-bold"
                  style={{ background: 'linear-gradient(90deg,#d4af37,#f4e5a1)', color: '#0a1929' }}>
                  🚪 خروج
                </button>
              </div>

              <p className="text-amber-100/50 text-[11px] mt-3">
                "لعبة جديدة" يبدأ من الصفر في نفس الغرفة — "خروج" يخرجك للفئات
              </p>
            </div>
          </Modal>
        )}

        {playerLeftMsg && (
          <Modal>
            <div className="text-center max-w-sm bg-gradient-to-br from-[#1a0a2e] to-[#0a1929] rounded-2xl p-6 border border-amber-500/40">
              <div className="text-5xl mb-2">🚪</div>
              <h3 className="text-xl font-bold text-amber-200 mb-2">
                {playerLeftMsg.playerName} خرج من المعركة
              </h3>
              {playerLeftMsg.releasedRegions > 0 && (
                <p className="text-emerald-300 text-sm">
                  🗺️ تحرر {playerLeftMsg.releasedRegions} إقليم — متاح لأي حد ياخدهم
                </p>
              )}
              {playerLeftMsg.duelCancelled && (
                <p className="text-red-300 text-sm mt-1">⚔️ المبارزة اتلغت</p>
              )}
            </div>
          </Modal>
        )}

        {showRules && <RulesModal onClose={() => setShowRules(false)} />}
      </div>
    </>
  );
};

export default SwordRound;