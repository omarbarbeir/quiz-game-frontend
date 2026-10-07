import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import io from 'socket.io-client';


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

// Landscape lock على الموبايل
const LandscapeLock = () => (
  <div style={{
    display:'none',
    position:'fixed',inset:0,zIndex:9999,
    background:'#09091c',
    flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,
  }}
    className="portrait-lock"
  >
    <div style={{fontSize:64}}>📱➡️</div>
    <div style={{color:'#fff',fontWeight:700,fontSize:18,textAlign:'center'}}>لف الموبايل عرضاً</div>
    <div style={{color:'rgba(255,255,255,0.5)',fontSize:13}}>اللعبة بتشتغل landscape بس</div>
  </div>
);

const TILE_POSITIONS = {
  0:  { left:'5.3%',  top:'91.4%' },
  1:  { left:'2.4%',  top:'76.4%' },
  2:  { left:'2.3%',  top:'66.5%' },
  3:  { left:'4.4%',  top:'55.0%' },
  4:  { left:'2.3%',  top:'44.2%' },
  5:  { left:'2.6%',  top:'33.7%' },
  6:  { left:'2.4%',  top:'23.2%' },
  7:  { left:'5.5%',  top:'8.4%'  },
  8:  { left:'15.0%', top:'4.6%'  },
  9:  { left:'22.7%', top:'4.4%'  },
  10: { left:'30.2%', top:'3.7%'  },
  11: { left:'38.1%', top:'4.0%'  },
  12: { left:'49.5%', top:'6.3%'  },
  13: { left:'60.8%', top:'4.4%'  },
  14: { left:'68.6%', top:'6.0%'  },
  15: { left:'76.2%', top:'4.1%'  },
  16: { left:'83.4%', top:'4.8%'  },
  17: { left:'94.0%', top:'8.2%'  },
  18: { left:'97.3%', top:'23.0%' },
  19: { left:'97.6%', top:'33.7%' },
  20: { left:'96.5%', top:'44.3%' },
  21: { left:'97.2%', top:'55.8%' },
  22: { left:'97.4%', top:'66.1%' },
  23: { left:'97.5%', top:'76.8%' },
  24: { left:'94.2%', top:'93.2%' },
  25: { left:'84.9%', top:'95.4%' },
  26: { left:'76.5%', top:'95.4%' },
  27: { left:'68.6%', top:'95.7%' },
  28: { left:'61.1%', top:'95.6%' },
  29: { left:'49.5%', top:'92.9%' },
  30: { left:'38.6%', top:'95.4%' },
  31: { left:'30.6%', top:'95.3%' },
  32: { left:'23.3%', top:'95.3%' },
  33: { left:'14.9%', top:'95.9%' },
};
const getTilePosition = (index) => TILE_POSITIONS[index % 34] || { left:'50%', top:'50%' };

const DENOMS = [
  { value:200, label:'٢٠٠', img:'/bank/Money/200.jpg', fallback:'#5b21b6' },
  { value:100, label:'١٠٠', img:'/bank/Money/100.jpg', fallback:'#b91c1c' },
  { value:50,  label:'٥٠',  img:'/bank/Money/50.jpg',  fallback:'#065f46' },
  { value:20,  label:'٢٠',  img:'/bank/Money/20.jpg',  fallback:'#1d4ed8' },
  { value:10,  label:'١٠',  img:'/bank/Money/10.png',  fallback:'#b45309' },
  { value:5,   label:'٥',   img:'/bank/Money/5.jpg',   fallback:'#374151' },
];

// ─── كومة الكروت على البورد ───
const CardPile = ({ type, count, style, onShuffle, isAdmin }) => {
  const isChance = type === 'chance';
  const accent   = isChance ? '#059669' : '#dc2626';
  const accent2  = isChance ? '#10b981' : '#ef4444';
  const label    = isChance ? 'حظك' : 'محاكمة';
  const icon     = isChance ? '🍀' : '⚖️';
  const layers   = Math.min(Math.max(count, 0), 4);

  return (
    <div style={{ position:'absolute', ...style, display:'flex', flexDirection:'column', alignItems:'center', gap:6, zIndex:8 }}>
      <div style={{ position:'relative', width:54, height:78 }}>
        {layers === 0 ? (
          <div style={{
            width:54, height:78, borderRadius:8,
            border:`2px dashed ${accent}55`,
            display:'flex', alignItems:'center', justifyContent:'center',
            background: 'rgba(0,0,0,0.2)',
          }}>
            <span style={{ fontSize:20, opacity:0.35 }}>—</span>
          </div>
        ) : (
          Array.from({ length:layers }).map((_,i) => (
            <div key={i} style={{
              position:'absolute', top:-i*2, left:i*1,
              width:54, height:78, borderRadius:8,
              background: `linear-gradient(145deg, ${accent}, ${accent}cc 50%, ${accent2})`,
              border:'2px solid rgba(255,215,120,0.45)',
              boxShadow: `0 ${2+i}px 8px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.2)`,
              display:'flex', alignItems:'center', justifyContent:'center',
              overflow: 'hidden',
            }}>
              <div style={{
                position:'absolute', inset:4,
                border:'1px solid rgba(255,215,120,0.35)',
                borderRadius:5,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <span style={{
                  color:'rgba(255,245,215,0.95)', fontSize:18, fontWeight:900,
                  textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                }}>{icon}</span>
              </div>
            </div>
          ))
        )}
        {count > 0 && (
          <div style={{
            position:'absolute', top:-10, right:-10,
            background:`linear-gradient(145deg, ${accent2}, ${accent})`,
            color:'#fff', width:22, height:22, borderRadius:'50%',
            fontSize:11, fontWeight:900,
            display:'flex', alignItems:'center', justifyContent:'center',
            border:'2px solid #f4d35e',
            boxShadow: `0 2px 8px ${accent}aa`,
            zIndex:2,
          }}>{count}</div>
        )}
      </div>
      <div style={{
        fontSize:10, fontWeight:900, color:'#f4d35e',
        background:`linear-gradient(135deg, ${accent}ee, ${accent}aa)`,
        padding:'3px 10px', borderRadius:8,
        border:`1px solid rgba(255,215,120,0.5)`,
        backdropFilter:'blur(6px)',
        textShadow: '0 1px 2px rgba(0,0,0,0.5)',
        letterSpacing: 0.5,
      }}>{label}</div>
      {isAdmin && (
        <motion.button
          whileTap={{ scale:0.88, rotate:180 }}
          onClick={() => onShuffle(type)}
          style={{
            marginTop:2,
            background:`linear-gradient(145deg, ${accent}66, ${accent}33)`,
            border:`1px solid ${accent2}99`,
            color:'#f4d35e', borderRadius:8,
            padding:'3px 8px', fontSize:9, fontWeight:700, cursor:'pointer',
          }}
        >🔀 خلط</motion.button>
      )}
    </div>
  );
};

// ─── كارت واحد بـ flip (يُستخدم في Overlay الفردي والمزدوج) ───
const SingleFlipCard = ({ card, pileType, width = 260, height = 380, flipDelay = 500 }) => {
  const [flipped, setFlipped] = useState(false);
  const isChance = pileType === 'chance';
  const accent   = isChance ? '#059669' : '#dc2626';
  const accent2  = isChance ? '#10b981' : '#ef4444';
  const label    = isChance ? 'حظك' : 'محاكمة';
  const icon     = isChance ? '🍀' : '⚖️';

  useEffect(() => {
    setFlipped(false);
    const t = setTimeout(() => setFlipped(true), flipDelay);
    return () => clearTimeout(t);
  }, [card, flipDelay]);

  const scale = width / 260;
  const titleSize  = Math.round(16 * scale);
  const labelSize  = Math.round(16 * scale);
  const textSize   = Math.round(16 * scale);
  const amountSize = Math.round(20 * scale);
  const iconSize   = Math.round(56 * scale);

  return (
    <motion.div
      initial={{ y: -200, opacity: 0, rotateZ: -8, scale: 0.7 }}
      animate={{ y: 0, opacity: 1, rotateZ: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      style={{ perspective: 1200, width, height, pointerEvents: 'none' }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 0 : 180 }}
        transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}
      >
        {/* ظهر الكارت */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 18,
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: `linear-gradient(145deg, #1a0f08, #2a1810, #1a0f08)`,
          border: `4px solid ${accent}`,
          boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 40px ${accent}55, inset 0 0 40px rgba(0,0,0,0.6)`,
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 8, borderRadius: 12,
            background: `repeating-linear-gradient(45deg, ${accent}18 0px, ${accent}18 8px, transparent 8px, transparent 16px)`,
            border: `1px solid rgba(212,175,55,0.3)`,
          }} />
          <div style={{
            position: 'absolute', inset: 14, borderRadius: 10,
            border: `2px solid rgba(212,175,55,0.5)`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 12,
          }}>
            <div style={{ fontSize: iconSize, filter: `drop-shadow(0 0 20px ${accent})` }}>{icon}</div>
            <div style={{
              color: '#f4d35e', fontSize: labelSize, fontWeight: 900,
              letterSpacing: 2, textShadow: '0 0 12px rgba(212,175,55,0.8)',
            }}>{label}</div>
          </div>
        </div>

        {/* وجه الكارت */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 18,
          backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          background: `linear-gradient(160deg, #fbf3dd 0%, #f0e2b8 50%, #e8d69a 100%)`,
          border: `4px solid ${accent}`,
          boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 40px ${accent}44`,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{
            background: `linear-gradient(180deg, ${accent2}, ${accent})`,
            padding: `${12 * scale}px ${14 * scale}px`,
            borderBottom: `2px solid #d4af37`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ color: '#fff5d6', fontSize: 20 * scale }}>{icon}</div>
            <div style={{
              color: '#fff5d6', fontSize: titleSize, fontWeight: 900, letterSpacing: 2,
              textShadow: '0 2px 4px rgba(0,0,0,0.4)',
            }}>{label}</div>
            <div style={{ color: '#fff5d6', fontSize: 20 * scale }}>{icon}</div>
          </div>

          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: `${20 * scale}px ${18 * scale}px`, position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: 14,
              border: `1px solid ${accent}55`, borderRadius: 8,
            }} />
            <p style={{
              color: '#2a1810', fontSize: textSize, fontWeight: 700,
              lineHeight: 1.8, textAlign: 'center', direction: 'rtl', margin: 0,
              position: 'relative', zIndex: 1,
            }}>{card.text}</p>
          </div>

          {card.amount != null && card.amount !== 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.9 }}
              style={{
                margin: `0 ${16 * scale}px ${14 * scale}px`,
                padding: `${10 * scale}px 0`, borderRadius: 12, textAlign: 'center',
                background: card.amount > 0
                  ? 'linear-gradient(145deg, #d1fae5, #a7f3d0)'
                  : 'linear-gradient(145deg, #fee2e2, #fecaca)',
                border: `2px solid ${card.amount > 0 ? '#10b981' : '#ef4444'}`,
                color: card.amount > 0 ? '#065f46' : '#991b1b',
                fontWeight: 900, fontSize: amountSize,
              }}>
              {card.amount > 0 ? '+' : ''}{card.amount} جنيه
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Overlay لكارت واحد ───
const DrawnCardOverlay = ({ card, onDismiss, onConfirm, pid }) => {
  const isChance = card?.pileType === 'chance' || card?.type === 'chance';
  const pileType = card?.pileType || card?.type || 'chance';
  const label = isChance ? 'حظك' : 'محاكمة';

  return (
    <AnimatePresence>
      {card && (
        <>
          <motion.div key="cd-bg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={card.drawerId === pid ? (onConfirm || onDismiss) : undefined}
            style={{
              position: 'fixed', inset: 0, zIndex: 150,
              background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.6), rgba(0,0,0,0.92))',
              backdropFilter: 'blur(8px)',
              cursor: card.drawerId === pid ? 'pointer' : 'default',
            }}
          />
          <motion.div key="cd-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 151,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 24, pointerEvents: 'none',
            }}
          >
            {card.drawerName && (
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 24 }}
                style={{
                  color: '#f4d35e', fontSize: 14, fontWeight: 700,
                  background: 'rgba(212,175,55,0.12)',
                  border: '1px solid rgba(212,175,55,0.4)',
                  padding: '6px 22px', borderRadius: 999,
                  backdropFilter: 'blur(12px)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                }}
              >
                {card.drawerName} سحب كارت {label}
              </motion.div>
            )}

            <SingleFlipCard card={card} pileType={pileType} />

            {card.drawerId === pid ? (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, type: 'spring', stiffness: 280 }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { if (onConfirm) onConfirm(); else onDismiss(); }}
                style={{
                  pointerEvents: 'auto',
                  background: `linear-gradient(145deg, #f4d35e, #d4af37)`,
                  border: '2px solid #fff5d6', color: '#2a1810',
                  padding: '12px 44px', borderRadius: 999,
                  fontWeight: 900, fontSize: 16, cursor: 'pointer',
                  boxShadow: `0 8px 32px rgba(212,175,55,0.55)`,
                }}
              >✓ تمام</motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                style={{
                  color: 'rgba(244,211,94,0.6)', fontSize: 13,
                  background: 'rgba(212,175,55,0.08)',
                  padding: '8px 26px', borderRadius: 999,
                  border: '1px solid rgba(212,175,55,0.25)',
                }}
              >في انتظار {card.drawerName}...</motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── Overlay لكارتين جنب بعض (حظك ومحاكمة) ───
const MultiCardOverlay = ({ cards, onDismiss, onConfirm, pid }) => {
  // cards = [{ ...cardData, pileType, drawerId, drawerName }, ...]
  if (!cards || cards.length === 0) return null;
  const drawer = cards[0]?.drawerName || '';
  const drawerId = cards[0]?.drawerId;

  return (
    <AnimatePresence>
      {cards && (
        <>
          <motion.div key="mc-bg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={drawerId === pid ? (onConfirm || onDismiss) : undefined}
            style={{
              position: 'fixed', inset: 0, zIndex: 150,
              background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.7), rgba(0,0,0,0.95))',
              backdropFilter: 'blur(8px)',
              cursor: drawerId === pid ? 'pointer' : 'default',
            }}
          />
          <motion.div key="mc-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 151,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 18, pointerEvents: 'none', padding: 20,
            }}
          >
            {drawer && (
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 280, damping: 24 }}
                style={{
                  color: '#f4d35e', fontSize: 14, fontWeight: 700,
                  background: 'rgba(212,175,55,0.12)',
                  border: '1px solid rgba(212,175,55,0.4)',
                  padding: '6px 22px', borderRadius: 999,
                  backdropFilter: 'blur(12px)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                }}
              >
                🍀 {drawer} سحب كارت حظك وكارت محاكمة
              </motion.div>
            )}

            <div style={{
              display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center',
              flexWrap: 'nowrap',
            }}>
              {cards.map((c, i) => (
                <SingleFlipCard
                  key={i}
                  card={c}
                  pileType={c.pileType}
                  width={210}
                  height={307}
                  flipDelay={500 + i * 250}
                />
              ))}
            </div>

            {drawerId === pid ? (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, type: 'spring', stiffness: 280 }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { if (onConfirm) onConfirm(); else onDismiss(); }}
                style={{
                  pointerEvents: 'auto',
                  background: `linear-gradient(145deg, #f4d35e, #d4af37)`,
                  border: '2px solid #fff5d6', color: '#2a1810',
                  padding: '12px 44px', borderRadius: 999,
                  fontWeight: 900, fontSize: 16, cursor: 'pointer',
                  boxShadow: `0 8px 32px rgba(212,175,55,0.55)`,
                  marginTop: 4,
                }}
              >✓ تمام</motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                style={{
                  color: 'rgba(244,211,94,0.6)', fontSize: 13,
                  background: 'rgba(212,175,55,0.08)',
                  padding: '8px 26px', borderRadius: 999,
                  border: '1px solid rgba(212,175,55,0.25)',
                }}
              >في انتظار {drawer}...</motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── النرد ───
const DieFace = ({ value, size=60 }) => {
  const dots={1:[[50,50]],2:[[28,28],[72,72]],3:[[28,28],[50,50],[72,72]],
    4:[[28,28],[72,28],[28,72],[72,72]],5:[[28,28],[72,28],[50,50],[28,72],[72,72]],
    6:[[28,22],[72,22],[28,50],[72,50],[28,78],[72,78]]}[value]||[];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs><linearGradient id="dg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fff"/><stop offset="100%" stopColor="#e0e7ff"/>
      </linearGradient></defs>
      <rect x="5" y="5" width="90" height="90" rx="16" fill="url(#dg)"/>
      <rect x="5" y="5" width="90" height="90" rx="16" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
      {dots.map(([cx,cy],i)=><circle key={i} cx={cx} cy={cy} r="8" fill="#1e1b4b"/>)}
    </svg>
  );
};

const RollingDice = ({ rolling, values, onForceStop }) => {
  const [display, setDisplay] = useState(1);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (rolling) {
      intervalRef.current = setInterval(() => {
        setDisplay(Math.ceil(Math.random()*6));
      }, 100);
    } else {
      clearInterval(intervalRef.current);
      if (values) setDisplay(values[0]);
    }
    return () => clearInterval(intervalRef.current);
  }, [rolling, values]);

  return (
    <div style={{ display:'flex', alignItems:'center', gap:16 }}>
      <motion.div
        animate={rolling
          ? { rotate:[0,10,-10,15,-15,0], y:[0,-8,3,-6,2,0] }
          : { rotate:0, y:0 }
        }
        transition={rolling
          ? { duration:0.3, repeat:Infinity }
          : { type:'spring', stiffness:300, damping:20 }
        }
      >
        <DieFace value={display} size={88}/>
      </motion.div>

      {!rolling && values && (
        <motion.div
          initial={{ opacity:0, scale:0.5 }}
          animate={{ opacity:1, scale:1 }}
          transition={{ type:'spring', stiffness:260, damping:18 }}
          style={{
            background:`linear-gradient(145deg, #f4d35e, #d4af37)`,
            color:'#2a1810',
            fontWeight:900, fontSize:32,
            padding:'8px 24px', borderRadius:18,
            border:'2px solid #fff5d6',
            boxShadow:`0 6px 24px rgba(212,175,55,0.55), inset 0 1px 0 rgba(255,255,255,0.5)`,
            textShadow:'0 1px 0 rgba(255,255,255,0.4)',
          }}
        >
          {values[0]}
        </motion.div>
      )}
    </div>
  );
};

// ─── شيت الفلوس ───
const MoneySheet = ({ open, onClose, money, players, myPlayerId, onPay }) => {
  const breakdown = { 200:0, 100:0, 50:0, 20:0, 10:0, 5:0 };
  let rem = money || 0;
  if (rem > 0) {
    if (rem < 50) {
      [200,100,50,20,10,5].forEach(d => {
        breakdown[d] = Math.floor(rem / d);
        rem -= breakdown[d] * d;
      });
    } else {
      // ندي كل فئة صغيرة لحد ورقتين الأول
      [100, 50, 20, 10, 5].forEach(d => {
        const take = Math.min(2, Math.floor(rem / d));
        breakdown[d] = take;
        rem -= take * d;
      });
      // الباقي نحطه في فئة 200
      breakdown[200] = Math.floor(rem / 200);
      rem -= breakdown[200] * 200;
      // لو فضل باقي، نوزعه على الفئات الصغيرة
      [100, 50, 20, 10, 5].forEach(d => {
        const extra = Math.floor(rem / d);
        if (extra > 0) {
          breakdown[d] += extra;
          rem -= extra * d;
        }
      });
    }
  }
  return (
    <AnimatePresence>
      {open&&(
        <>
          <motion.div key="mb" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={onClose}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:100,backdropFilter:'blur(4px)'}}
          />
          <motion.div key="ms" initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}
            transition={{type:'spring',stiffness:340,damping:34}}
            style={{
              position:'fixed',bottom:0,left:0,right:0,zIndex:101,
              background:'linear-gradient(180deg,#111827 0%,#09091c 100%)',
              borderTop:'1px solid rgba(99,102,241,0.35)',
              borderRadius:'24px 24px 0 0',
              boxShadow:'0 -8px 48px rgba(0,0,0,0.5)',
              paddingBottom:32,maxHeight:'80vh',overflowY:'auto',
            }}
          >
            <div style={{display:'flex',justifyContent:'center',padding:'12px 0 4px'}}>
              <div style={{width:40,height:4,borderRadius:99,background:'rgba(255,255,255,0.2)'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 24px 12px'}}>
              <span style={{color:'#fff',fontWeight:700,fontSize:18}}>محفظتك</span>
              <span style={{color:'#fbbf24',fontWeight:900,fontSize:26,textShadow:'0 0 16px rgba(251,191,36,0.4)'}}>
                {(money||0).toLocaleString('ar-EG')} ج
              </span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,padding:'0 16px 16px'}}>
              {DENOMS.map(({value,label,img,fallback},idx)=>{
                const count=breakdown[value]||0;
                return (
                  <motion.div key={value}
                    initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
                    transition={{delay:idx*0.06,type:'spring',stiffness:280,damping:22}}
                    style={{
                      background:fallback,borderRadius:14,overflow:'hidden',
                      opacity:count===0?0.3:1,
                      boxShadow:count>0?'0 4px 16px rgba(0,0,0,0.4)':'none',
                      display:'flex',flexDirection:'column',
                    }}
                  >
                    <div style={{
                      width:'100%',aspectRatio:'16/9',
                      backgroundImage:`url('${(process.env.PUBLIC_URL || '') + img}')`,backgroundSize:'cover',
                      backgroundPosition:'center',backgroundColor:fallback,minHeight:56,
                    }}/>
                    <div style={{padding:'6px 8px',textAlign:'center'}}>
                      <div style={{color:'#fff',fontWeight:900,fontSize:18}}>{label}</div>
                      <div style={{color:'rgba(255,255,255,0.5)',fontSize:10,marginBottom:4}}>جنيه</div>
                      <div style={{background:'rgba(0,0,0,0.4)',borderRadius:8,padding:'2px 0',
                        color:count>0?'#fff':'rgba(255,255,255,0.3)',fontWeight:700,fontSize:13}}>×{count}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ── ألوان البلاد ──
const LAND_COLORS = {
  'القدس':'#1e3a8a','غزة':'#1e3a8a',
  'بيروت':'#065f46','الرياض':'#065f46','بغداد':'#065f46',
  'بني غازي':'#991b1b','عدن':'#991b1b','البحرين':'#991b1b','الدار البيضاء':'#991b1b',
  'تونس':'#b45309','الجزائر':'#b45309',
  'الإسكندرية':'#c2410c','حلب':'#c2410c',
  'أسوان':'#6d28d9','دمشق':'#6d28d9','القاهرة':'#6d28d9',
  'الخرطوم':'#854d0e','عمان':'#854d0e','بور سعيد':'#854d0e',
  'الأقصر':'#e2e8f0',
  'صنعاء':'#451a03','الكويت':'#451a03','قطر':'#451a03',
};

// ── كارت البلد ──
const LandCard = ({ tile, onBuild, onAuction }) => {
  const color   = LAND_COLORS[tile.name] || '#6366f1';
  const isLight = ['#e2e8f0','#c8a96e'].includes(color);
  const textCol = isLight ? '#1a1a1a' : '#fff';
  const level = tile.buildingLevel || 0;

  const baseR = tile.baseRent ?? Math.floor(tile.price / 8);
  const currentRent = tile.currentRent ?? baseR;

  return (
    <div style={{
      borderRadius:20, overflow:'hidden', width:'min(210px, 60vw)', flexShrink:0,
      background:'linear-gradient(160deg, #fbf3dd 0%, #f0e2b8 100%)',
      boxShadow:`0 8px 28px rgba(0,0,0,0.5), 0 0 0 1px ${color}40`,
      border:`3px solid ${color}`,
      fontFamily:'Arial,sans-serif', direction:'rtl',
      position:'relative',
    }}>
      <div style={{
        height:6,
        background:`repeating-linear-gradient(90deg, ${color} 0px, ${color} 10px, ${color}cc 10px, ${color}cc 20px)`,
      }}/>

      <div style={{
        background: color,
        padding:'12px 14px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
        borderBottom:`2px solid rgba(212,175,55,0.5)`,
      }}>
        <span style={{
          color:textCol, fontWeight:900, fontSize:17,
          textShadow:'0 1px 3px rgba(0,0,0,0.4)',
          letterSpacing:0.5,
        }}>{tile.name}</span>
        <span style={{
          background:'rgba(255,255,255,0.25)',
          border:'1.5px solid rgba(255,255,255,0.4)',
          color:textCol,
          borderRadius:8, padding:'3px 9px',
          fontWeight:900, fontSize:13,
          backdropFilter:'blur(4px)',
        }}>{tile.price} ج</span>
      </div>

      <div style={{ padding:'10px 12px', background:'transparent' }}>
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'6px 10px', borderRadius:10,
          background:'rgba(255,255,255,0.5)',
          border:'1px dashed rgba(0,0,0,0.15)',
          marginBottom:8,
        }}>
          <span style={{ color:'#444', fontSize:11, fontWeight:700 }}>💵 إيجار مرور</span>
          <span style={{ color:'#1a1a1a', fontWeight:900, fontSize:14 }}>
            {baseR} ج
          </span>
        </div>

        <div style={{
          borderRadius:10, overflow:'hidden',
          border:'1px solid rgba(0,0,0,0.1)',
          marginBottom:8,
        }}>
          {[
            { level:1, icon:'🏕️', label:'استراحة', rent:baseR*2 },
            { level:2, icon:'🏗️', label:'جراج',    rent:baseR*4 },
            { level:3, icon:'🏪', label:'سوق',     rent:baseR*8 },
          ].map((row, i) => {
            const isActive = level === row.level;
            const isDone = level >= row.level;
            return (
              <div key={i} style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'6px 10px',
                background: isActive
                  ? `linear-gradient(90deg, ${color}40, ${color}20)`
                  : isDone ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.3)',
                borderBottom: i < 2 ? '1px solid rgba(0,0,0,0.08)' : 'none',
                fontSize:11,
              }}>
                <span style={{ color:'#333', fontWeight:700, display:'flex', alignItems:'center', gap:4 }}>
                  <span>{row.icon}</span>
                  <span>{row.label}</span>
                  {isDone && <span style={{color:'#059669', fontSize:10}}>✓</span>}
                </span>
                <span style={{ color:'#1a1a1a', fontWeight:900, fontSize:12 }}>
                  {row.rent} ج
                </span>
              </div>
            );
          })}
        </div>

        <div style={{
          textAlign:'center',
          background: level > 0
            ? `linear-gradient(135deg, ${color}40, ${color}20)`
            : 'rgba(0,0,0,0.06)',
          border: level > 0 ? `1.5px solid ${color}` : '1.5px solid rgba(0,0,0,0.1)',
          borderRadius:10, padding:'6px 0', fontSize:11,
          color: '#1a1a1a', fontWeight:900,
        }}>
          {level === 0
            ? '⚪ بدون بناء'
            : `✨ إيجار حالي: ${currentRent} ج`}
        </div>
      </div>

      <div style={{ padding:'6px 10px 12px', display:'flex', flexDirection:'column', gap:6 }}>
        {level < 3 && (
          <button
            onClick={() => onBuild(tile.id)}
            style={{
              background:`linear-gradient(135deg, ${color}, ${color}cc)`,
              color:textCol,
              border:`2px solid rgba(255,255,255,0.4)`,
              borderRadius:10, padding:'8px 0',
              fontWeight:900, fontSize:12, cursor:'pointer',
              boxShadow:`0 4px 12px ${color}66`,
              textShadow:'0 1px 2px rgba(0,0,0,0.3)',
              display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            }}>
            🏗️ ابنِ {level === 0 ? 'استراحة' : level === 1 ? 'جراج' : 'سوق'}
          </button>
        )}
        <button
          onClick={() => onAuction(tile)}
          style={{
            background:'linear-gradient(135deg, #fbbf24, #d97706)',
            color:'#1a0f05',
            border:'2px solid #fde68a',
            borderRadius:10, padding:'8px 0',
            fontWeight:900, fontSize:12, cursor:'pointer',
            boxShadow:'0 4px 12px rgba(251,191,36,0.5)',
            textShadow:'0 1px 0 rgba(255,255,255,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          }}>
          🔨 بيع في مزاد
        </button>
      </div>
    </div>
  );
};

// ─── بانيل البلاد ───
const PropsPanel = ({ open, onClose, myPlayer, gameState, onBuild, onAuction }) => {
  const [selectedTile, setSelectedTile] = useState(null);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="pb"
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={() => { onClose(); setSelectedTile(null); }}
            style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:100,backdropFilter:'blur(4px)'}}
          />
          <motion.div key="pp"
            initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}
            transition={{type:'spring',stiffness:300,damping:30}}
            style={{
              position:'fixed',bottom:0,left:0,right:0,zIndex:101,
              background:'rgba(15,10,40,0.97)',
              borderTop:'1px solid rgba(99,102,241,0.25)',
              borderRadius:'24px 24px 0 0',
              boxShadow:'0 -8px 40px rgba(0,0,0,0.5)',
              backdropFilter:'blur(24px)',
            }}
          >
            <div style={{display:'flex',justifyContent:'center',padding:'10px 0 4px'}}>
              <div style={{width:40,height:4,borderRadius:99,background:'rgba(255,255,255,0.2)'}}/>
            </div>
            <div style={{
              display:'flex',justifyContent:'space-between',alignItems:'center',
              padding:'8px 20px 12px',
            }}>
              <div>
                <div style={{color:'#fff',fontWeight:700,fontSize:17}}>بلادك</div>
                <div style={{color:'#818cf8',fontSize:12}}>{myPlayer?.properties?.length||0} بلد</div>
              </div>
              <button onClick={() => { onClose(); setSelectedTile(null); }} style={{
                width:32,height:32,borderRadius:'50%',border:'none',
                background:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.6)',
                cursor:'pointer',fontSize:16,
              }}>✕</button>
            </div>

            {!myPlayer?.properties?.length ? (
              <div style={{textAlign:'center',padding:'32px 0 40px',color:'rgba(255,255,255,0.35)'}}>
                <div style={{fontSize:40,marginBottom:8}}>🏚️</div>
                <div style={{fontSize:13}}>ما عندكش بلاد لسه</div>
              </div>
            ) : (
                <div style={{
                  display:'flex',gap:12,overflowX:'auto',
                  padding:'0 16px 28px',
                  scrollSnapType:'x mandatory',
                  WebkitOverflowScrolling:'touch',
                  direction: 'rtl',
                  scrollPaddingInlineStart: 16,
                }}>
                {myPlayer.properties.map((tid, idx) => {
                  const tile = gameState?.board?.find(t=>t.id===tid);
                  if (!tile) return null;
                  return (
                    <motion.div key={tid}
                      initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
                      transition={{delay:idx*0.06}}
                      style={{scrollSnapAlign:'start',flexShrink:0,cursor:'pointer', maxWidth: '72vw'}}
                      onClick={() => setSelectedTile(tile)}
                    >
                      <LandCard tile={tile} onBuild={onBuild} onAuction={onAuction}/>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {selectedTile && (
              <>
                <motion.div key="cp-bg"
                  initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                  onClick={() => setSelectedTile(null)}
                  style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.75)'}}
                />
                <motion.div key="cp"
                  initial={{opacity:0,scale:0.8,y:40}}
                  animate={{opacity:1,scale:1,y:0}}
                  exit={{opacity:0,scale:0.85,y:20}}
                  transition={{type:'spring',stiffness:300,damping:26}}
                  style={{
                    position:'fixed',inset:0,zIndex:201,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    pointerEvents:'none',
                  }}
                >
                  <div style={{pointerEvents:'auto',transform:'scale(1.25)'}}>
                    <LandCard
                      tile={selectedTile}
                      onBuild={(id) => { onBuild(id); setSelectedTile(null); }}
                      onAuction={(t) => { onAuction(t); setSelectedTile(null); onClose(); }}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

// ─── عرض البناء على الخانات ───
const TileBuildings = ({ board, players }) => {
  return (
    <>
      {board.map(tile => {
        if (!tile.owner || tile.type !== 'land') return null;
        const owner = players.find(p => p.id === tile.owner);
        if (!owner) return null;
        const pos = getTilePosition(tile.id);
        const level = tile.buildingLevel || 0;
        const icons = ['', '🏕️', '🏗️', '🏪'];

        return (
          <div
            key={`tb-${tile.id}`}
            style={{
              position:'absolute',
              left: pos.left,
              top: pos.top,
              transform:'translate(-50%, -50%)',
              zIndex: 7,
              pointerEvents:'none',
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              gap:1,
            }}
          >
            <div style={{
              width:8, height:8, borderRadius:'50%',
              background: owner.color,
              border:'1.5px solid #fff',
              boxShadow:`0 0 6px ${owner.color}`,
            }}/>
            {level > 0 && (
              <div style={{
                fontSize:11,
                filter:`drop-shadow(0 0 3px ${owner.color})`,
                lineHeight:1,
              }}>
                {icons[level]}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

// ─── توست الإشعارات ───
const NotifToasts = ({ notifs }) => (
  <div style={{
    position:'fixed', top:60, right:16, zIndex:80,
    display:'flex', flexDirection:'column', gap:8,
    pointerEvents:'none', maxWidth:'min(300px, 40vw)',
  }}>
    <AnimatePresence>
      {notifs.map(n => {
        const colors = {
          info:    { bg:'rgba(9,9,28,0.95)',    border:'rgba(99,102,241,0.5)' },
          success: { bg:'rgba(6,78,59,0.95)',   border:'rgba(16,185,129,0.5)' },
          warning: { bg:'rgba(120,53,15,0.95)', border:'rgba(251,191,36,0.5)' },
          error:   { bg:'rgba(127,29,29,0.95)', border:'rgba(239,68,68,0.5)'  },
          card:    { bg:'rgba(76,29,149,0.95)', border:'rgba(167,139,250,0.5)'},
        };
        const c = colors[n.type] || colors.info;
        return (
          <motion.div
            key={n.id}
            initial={{ opacity:0, x:100, scale:0.85 }}
            animate={{ opacity:1, x:0, scale:1 }}
            exit={{ opacity:0, x:100, scale:0.85 }}
            transition={{ type:'spring', stiffness:280, damping:24 }}
            style={{
              background:c.bg,
              border:`1.5px solid ${c.border}`,
              borderRadius:14, padding:'min(10px,1.6vh) min(14px,2vh)',
              color:'#fff', fontSize:'min(12.5px, 2vh)', fontWeight:600,
              boxShadow:'0 6px 24px rgba(0,0,0,0.5)',
              backdropFilter:'blur(12px)',
              textAlign:'right', direction:'rtl',
              lineHeight:1.5,
            }}
          >
            {n.text}
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
);

// ============================================================
// الكومبوننت الرئيسي
// ============================================================
const BankElHazGame = ({ roomId, playerId, playerName, serverUrl, onExit, socket: extSocket, roomCode, isAdmin }) => {
  const [gameState,       setGameState]       = useState(null);
  const [myPlayer,        setMyPlayer]        = useState(null);
  const [rolling,         setRolling]         = useState(false);
  const [diceValues,      setDiceValues]      = useState(null);
  const [showDice,        setShowDice]        = useState(false);
  const [showMoney,       setShowMoney]       = useState(false);
  const [showProps,       setShowProps]       = useState(false);
  const [notifs,          setNotifs]          = useState([]);
  const [buyOffer,        setBuyOffer]        = useState(null);
  const [rentOffer,       setRentOffer]       = useState(null);
  const [clubOffer,       setClubOffer]       = useState(null);
  const [interactiveCard, setInteractiveCard] = useState(null);
  const [drawnCard,       setDrawnCard]       = useState(null);
  const [drawnCards,      setDrawnCards]      = useState(null);  // ✅ كروت متعددة
  const [players,         setPlayers]         = useState([]);
  const [initialPhase,    setInitialPhase]    = useState(false);
  const [initialRolls,    setInitialRolls]    = useState({});
  const [myInitialRolled, setMyInitialRolled] = useState(false);
  const [winner,          setWinner]          = useState(null);
  const [showBankrupt,    setShowBankrupt]    = useState(false);
  const [auction,         setAuction]         = useState(null);
  const [myBid,           setMyBid]           = useState('');
  const [auctionResult,   setAuctionResult]   = useState(null);
  const [showTurnOrder,   setShowTurnOrder]   = useState(false);
  const [turnOrderData,   setTurnOrderData]   = useState([]);
  const [paymentRequest,  setPaymentRequest]  = useState(null);

  const { isFs, toggle: toggleFs } = useFullscreen();

  const sockRef = useRef(null);
  const rid = roomId || roomCode;
  const pid = playerId;

  const addNotif = useCallback((text, type='info') => {
    console.log(`[Bank][${type}] ${text}`);
    const id = Date.now() + Math.random();
    setNotifs(prev => [...prev.slice(-4), { id, text, type }]);
    setTimeout(() => {
      setNotifs(prev => prev.filter(n => n.id !== id));
    }, 3500);
  }, []);

  useEffect(() => {
    const sock = extSocket || io(serverUrl || 'http://localhost:3001');
    sockRef.current = sock;
    sock.emit('bank_join', { roomId: rid, playerId: pid, playerName, isAdmin });

    const onState = s => {
      setGameState(s);
      setPlayers(s.players || []);
      setMyPlayer(s.players.find(p => p.id === pid));
    };

    const onDice = ({ playerId:rp, dice1 }) => {
      setRolling(true);
      setDiceValues(null);
      setShowDice(true);
      setTimeout(() => {
        setRolling(false);
        setDiceValues([dice1]);
        if (rp === pid) addNotif(`🎲 رميت ${dice1}`, 'info');
      }, 1600);
    };

    const onMove = () => {
      setTimeout(() => setShowDice(false), 900);
    };

    const onBuy = ({ tileId, price, canAfford, isClub, currentOwners }) => {
      setTimeout(() => { setBuyOffer({ tileId, price, canAfford, isClub, currentOwners }); }, 500);
    };

    const onRentOffer = ({ tileId, tileName, ownerName, ownerId, rent, canAfford, isClub }) => {
      setTimeout(() => { setRentOffer({ tileId, tileName, ownerName, ownerId, rent, canAfford, isClub }); }, 500);
    };

    const onClubOffer = (data) => {
      setTimeout(() => { setClubOffer(data); }, 500);
    };

    // ✅ كارت واحد (حظك أو محاكمة)
    const onCardDrawn = ({ playerId:rp, card, type }) => {
      const interactiveTypes = ['choose_city_or_money', 'choose_city_and_collect'];
      setPlayers(cur => {
        const drawer = cur.find(p => p.id === rp);
        const fullCard = { ...card, pileType: type, drawerName: drawer?.name || '', drawerId: rp };
        setDrawnCard(fullCard);
        if (interactiveTypes.includes(card.type) && rp === pid) {
          setTimeout(() => setInteractiveCard(fullCard), 2000);
        }
        return cur;
      });
      addNotif(`${type === 'chance' ? '🍀' : '⚖️'} ${card.text}`, 'card');
    };

    // ✅ كارت من كل كومة (حظك ومحاكمة)
    const onCardsDrawn = ({ playerId:rp, cards }) => {
      const interactiveTypes = ['choose_city_or_money', 'choose_city_and_collect'];
      setPlayers(cur => {
        const drawer = cur.find(p => p.id === rp);
        const drawerName = drawer?.name || '';
        const fullCards = cards.map(c => ({
          ...c.card,
          pileType: c.pileType,
          drawerName,
          drawerId: rp,
        }));
        setDrawnCards(fullCards);
        // لو في كارت تفاعلي، نعرضه بعد ما الكروت تتقفل
        const interactiveOne = fullCards.find(c => interactiveTypes.includes(c.type));
        if (interactiveOne && rp === pid) {
          setTimeout(() => setInteractiveCard(interactiveOne), 3000);
        }
        return cur;
      });
      const texts = cards.map(c => `${c.pileType === 'chance' ? '🍀' : '⚖️'} ${c.card.text}`).join(' | ');
      addNotif(texts, 'card');
    };

    const onCardDismissed = ({ drawerId: rid2 } = {}) => {
      setDrawnCard(cur => {
        if (!cur) return null;
        if (!rid2 || cur.drawerId === rid2) return null;
        return cur;
      });
      setDrawnCards(cur => {
        if (!cur) return null;
        if (!rid2 || cur[0]?.drawerId === rid2) return null;
        return cur;
      });
    };

    const onNotif = ({ text, type }) => addNotif(text, type);
    const onErr   = ({ message })   => addNotif(`❌ ${message}`, 'error');

    const onOver = ({ winnerId }) => {
      setPlayers(cur => {
        const w = cur.find(p => p.id === winnerId);
        setWinner({ id: winnerId, name: w?.name || 'لاعب' });
        return cur;
      });
    };

    const onStart = ({ turnOrder }) => {
      setInitialPhase(false);
      setMyInitialRolled(false);
      setInitialRolls({});
      if (turnOrder && turnOrder.length > 0) {
        setTurnOrderData(turnOrder);
        setShowTurnOrder(true);
        setTimeout(() => setShowTurnOrder(false), 6000);
      }
    };

    const onIRoll = ({ message }) => {
      setInitialPhase(true);
      addNotif(message, 'info');
    };

    const onTie = ({ players: tiedPlayers, message }) => {
      if (tiedPlayers?.some(p => p.id === pid)) {
        setMyInitialRolled(false);
      }
      setInitialRolls(prev => {
        const next = { ...prev };
        (tiedPlayers || []).forEach(p => { delete next[p.id]; });
        return next;
      });
      addNotif(message, 'warning');
    };

    const onInitialResult = ({ playerId:rp, value }) => {
      setInitialRolls(prev => ({ ...prev, [rp]: value }));
    };

    const onPaymentRequest = (data) => {
      if (data.fromId === pid) setPaymentRequest(data);
    };

    const onAuctionStart = ({ tile, duration }) => {
      setAuction({ tile, bids:{}, timeLeft: duration || 30 });
      setMyBid('');
    };
    const onAuctionBid = ({ playerId:rp, amount }) => {
      setAuction(prev => prev ? { ...prev, bids:{ ...prev.bids, [rp]: amount } } : prev);
    };
    const onAuctionEnd = ({ winnerId, amount, tileId }) => {
      setPlayers(cur => {
        const w = cur.find(p => p.id === winnerId);
        setAuctionResult({ winnerName: w?.name || 'لاعب', amount, tileId });
        return cur;
      });
      setAuction(null);
      setTimeout(() => setAuctionResult(null), 4000);
    };
    const onAuctionTick = ({ timeLeft }) => {
      setAuction(prev => prev ? { ...prev, timeLeft } : prev);
    };

    sock.on('bank_state_update',        onState);
    sock.on('bank_dice_rolled',         onDice);
    sock.on('bank_player_moved',        onMove);
    sock.on('bank_offer_buy',           onBuy);
    sock.on('bank_offer_rent',          onRentOffer);
    sock.on('bank_offer_club',          onClubOffer);
    sock.on('bank_card_dismissed',      onCardDismissed);
    sock.on('bank_card_drawn',          onCardDrawn);
    sock.on('bank_cards_drawn',         onCardsDrawn);  // ✅ جديد
    sock.on('bank_notification',        onNotif);
    sock.on('bank_error',               onErr);
    sock.on('bank_game_over',           onOver);
    sock.on('bank_game_started',        onStart);
    sock.on('bank_initial_roll_phase',  onIRoll);
    sock.on('bank_initial_roll_tie',    onTie);
    sock.on('bank_initial_roll_result', onInitialResult);
    sock.on('bank_payment_request',     onPaymentRequest);
    sock.on('bank_auction_start',       onAuctionStart);
    sock.on('bank_auction_bid',         onAuctionBid);
    sock.on('bank_auction_end',         onAuctionEnd);
    sock.on('bank_auction_tick',        onAuctionTick);

    return () => {
      ['bank_state_update','bank_dice_rolled','bank_offer_buy','bank_card_drawn','bank_cards_drawn',
       'bank_notification','bank_error','bank_game_over','bank_game_started',
       'bank_initial_roll_phase','bank_initial_roll_tie','bank_initial_roll_result',
       'bank_auction_start','bank_auction_bid','bank_auction_end','bank_auction_tick',
       'bank_offer_rent','bank_offer_club','bank_card_dismissed',
       'bank_card_action','bank_player_moved','bank_payment_request'
      ].forEach(e => sock.off(e));
      if (!extSocket) sock.disconnect();
    };
  }, [rid, pid, extSocket, serverUrl, playerName, addNotif]);

  const emit = (ev, data) => sockRef.current?.emit(ev, data);
  const isMyTurn = () => gameState?.turnOrder?.[gameState.currentTurnIndex] === pid && !gameState?.gameOver;
  const myTurn = isMyTurn();

  const handleRoll = () => {
    if (rolling) return;
    setRolling(true);
    setDiceValues(null);
    setShowDice(true);
    emit('bank_roll', { roomId: rid, playerId: pid });
  };

  const handleForceStop = () => {
    setRolling(false);
    setShowDice(false);
  };

  const handlePay = (toId, amount) => {
    emit('bank_manual_pay', { roomId: rid, fromId: pid, toId, amount });
    addNotif(`💸 دفعت ${amount} جنيه`, 'info');
    setShowMoney(false);
  };

  const handleShuffle = (type) => {
    emit('bank_shuffle_cards', { roomId: rid, type });
    addNotif(`🔀 تم خلط كروت ${type === 'chance' ? 'الحظ' : 'المحاكمة'}`, 'success');
  };

  const handleStartAuction = (tile) => {
    emit('bank_auction_start', { roomId: rid, playerId: pid, tileId: tile.id });
  };

  const handleSubmitBid = () => {
    const amt = parseInt(myBid, 10);
    if (!amt || amt <= 0 || !auction) return;
    emit('bank_auction_bid', { roomId: rid, playerId: pid, amount: amt });
    setMyBid('');
    addNotif(`📢 عرضت ${amt} جنيه`, 'info');
  };

  const handleInitialRoll = () => {
    if (myInitialRolled) return;
    setMyInitialRolled(true);
    emit('bank_roll_initial', { roomId: rid, playerId: pid });
  };

  const handleDeclareBankruptcy = () => {
    emit('bank_declare_bankruptcy', { roomId: rid, playerId: pid });
    setShowBankrupt(false);
    addNotif('💔 أعلنت إفلاسك', 'error');
  };

  const handlePaymentConfirm = () => {
    if (!paymentRequest) return;
    emit('bank_payment_response', {
      roomId: rid,
      reqId: paymentRequest.reqId,
      playerId: pid,
    });
    setPaymentRequest(null);
  };

  // ✅ دالة موحدة لإغلاق الكروت
  const dismissDrawnCards = () => {
    sockRef.current?.emit('bank_dismiss_card', { roomId: rid, playerId: pid });
    const interactiveTypes = ['choose_city_or_money', 'choose_city_and_collect'];
    // لو في كارت تفاعلي
    const cardToCheck = drawnCard || (drawnCards && drawnCards[0]);
    if (cardToCheck && interactiveTypes.includes(cardToCheck.type) && cardToCheck.drawerId === pid) {
      const cardToUse = { ...cardToCheck };
      setDrawnCard(null);
      setDrawnCards(null);
      setTimeout(() => setInteractiveCard(cardToUse), 250);
    } else {
      setDrawnCard(null);
      setDrawnCards(null);
    }
  };

  const chanceCount    = gameState?.chanceDeckCount    ?? 0;
  const communityCount = gameState?.communityDeckCount ?? 0;

  const currentPlayer = gameState?.players?.find(
    p => p.id === gameState?.turnOrder?.[gameState?.currentTurnIndex]
  );

  // ── شاشة المزاد ──
  const AuctionScreen = () => {
    if (!auction) return null;
    const color = LAND_COLORS[auction.tile?.name] || '#6366f1';
    const sortedBids = Object.entries(auction.bids || {}).sort((a, b) => b[1] - a[1]);
    const topBid = sortedBids[0];
    const topBidder = topBid ? players.find(p => p.id === topBid[0]) : null;

    return (
      <motion.div
        initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        style={{
          position:'fixed', inset:0, zIndex:400,
          background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)',
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', gap:16, padding:20,
        }}
      >
        <div style={{
          background:'rgba(255,255,255,0.08)',
          backdropFilter:'blur(20px)',
          border:'1px solid rgba(255,255,255,0.2)',
          borderRadius:20, padding:'20px 28px',
          width:'100%', maxWidth:340, textAlign:'center',
        }}>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', marginBottom:4 }}>مزاد علني</div>
          <div style={{
            background:color, borderRadius:12,
            padding:'8px 16px', display:'inline-block',
            color:'#fff', fontWeight:900, fontSize:20, marginBottom:12,
          }}>{auction.tile?.name}</div>

          <div style={{
            fontSize:36, fontWeight:900,
            color: auction.timeLeft <= 10 ? '#ef4444' : '#fbbf24',
            marginBottom:8,
          }}>{auction.timeLeft}s</div>

          {topBidder ? (
            <div style={{
              background:'rgba(255,255,255,0.06)',
              border:'1px solid rgba(255,255,255,0.12)',
              borderRadius:12, padding:'8px 16px',
            }}>
              <div style={{ color:'rgba(255,255,255,0.5)', fontSize:11 }}>أعلى عرض</div>
              <div style={{ color:'#6ee7b7', fontWeight:900, fontSize:22 }}>{topBid[1]} ج</div>
              <div style={{ color:'rgba(255,255,255,0.7)', fontSize:12 }}>من {topBidder.name}</div>
            </div>
          ) : (
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:13 }}>لا يوجد عروض بعد</div>
          )}
        </div>

        {sortedBids.length > 0 && (
          <div style={{ width:'100%', maxWidth:340, display:'flex', flexDirection:'column', gap:6 }}>
            {sortedBids.map(([pid2, amt], i) => {
              const p = players.find(pl => pl.id === pid2);
              return (
                <div key={pid2} style={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  background: i === 0 ? 'rgba(110,231,183,0.15)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${i === 0 ? 'rgba(110,231,183,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius:12, padding:'8px 14px',
                }}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    {i === 0 && <span style={{fontSize:16}}>🥇</span>}
                    <div style={{width:20,height:20,borderRadius:'50%',background:p?.color||'#6366f1'}}/>
                    <span style={{color:'#fff',fontSize:13,fontWeight:600}}>{p?.name||'لاعب'}</span>
                  </div>
                  <span style={{color: i === 0 ? '#6ee7b7' : '#fff', fontWeight:700, fontSize:15}}>{amt} ج</span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display:'flex', gap:8, width:'100%', maxWidth:340 }}>
          <input
            type="number"
            placeholder="عرضك بالجنيه"
            value={myBid}
            onChange={e => setMyBid(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmitBid()}
            style={{
              flex:1, background:'rgba(255,255,255,0.1)',
              border:'1px solid rgba(255,255,255,0.2)',
              borderRadius:14, padding:'12px 16px',
              color:'#fff', fontSize:16, fontWeight:700,
              outline:'none', textAlign:'center',
            }}
          />
          <motion.button
            whileTap={{scale:0.93}}
            onClick={handleSubmitBid}
            disabled={!myBid || parseInt(myBid) <= 0}
            style={{
              padding:'12px 20px', borderRadius:14,
              background: myBid && parseInt(myBid) > 0
                ? 'linear-gradient(135deg,#fbbf24,#f59e0b)'
                : 'rgba(255,255,255,0.08)',
              color: myBid && parseInt(myBid) > 0 ? '#000' : 'rgba(255,255,255,0.3)',
              border:'none', fontWeight:700, fontSize:14, cursor:'pointer',
            }}
          >📢 عرض</motion.button>
        </div>
      </motion.div>
    );
  };

  const AuctionResultToast = () => (
    <AnimatePresence>
      {auctionResult && (
        <motion.div
          initial={{opacity:0,scale:0.8,y:30}}
          animate={{opacity:1,scale:1,y:0}}
          exit={{opacity:0,scale:0.9,y:-20}}
          style={{
            position:'fixed', inset:0, zIndex:402,
            display:'flex', alignItems:'center', justifyContent:'center',
            pointerEvents:'none',
          }}
        >
          <div style={{
            background:'rgba(255,255,255,0.12)',
            backdropFilter:'blur(24px)',
            border:'1px solid rgba(255,255,255,0.25)',
            borderRadius:24, padding:'24px 32px',
            textAlign:'center',
            boxShadow:'0 8px 40px rgba(0,0,0,0.3)',
          }}>
            <div style={{fontSize:40,marginBottom:8}}>🔨</div>
            <div style={{color:'#fbbf24',fontWeight:900,fontSize:20}}>{auctionResult.winnerName}</div>
            <div style={{color:'#fff',fontSize:15,marginTop:4}}>
              اشترى البلد بـ {auctionResult.amount} جنيه
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const InitialRollScreen = () => (
    <div style={{
      position:'fixed', inset:0, zIndex:500,
      background:'rgba(9,9,28,0.97)',
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:24,
    }}>
      <div style={{ fontSize:48 }}>🎲</div>
      <div style={{ color:'#fff', fontWeight:900, fontSize:22, textAlign:'center' }}>
        ارموا النرد عشان نحدد مين يبدأ
      </div>
      <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13 }}>الأعلى رقم هيبدأ</div>

      <div style={{ display:'flex', flexDirection:'column', gap:8, width:'100%', maxWidth:280 }}>
        {players.filter(p => !p.eliminated).map(p => (
          <div key={p.id} style={{
            display:'flex', alignItems:'center', justifyContent:'space-between',
            background:'rgba(255,255,255,0.06)',
            border:`1px solid ${initialRolls[p.id] ? p.color : 'rgba(255,255,255,0.1)'}`,
            borderRadius:12, padding:'10px 16px',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{
                width:24, height:24, borderRadius:'50%', background:p.color || '#6366f1',
                display:'flex', alignItems:'center', justifyContent:'center',
                color:'#fff', fontSize:11, fontWeight:700,
              }}>{p.name.charAt(0)}</div>
              <span style={{ color:'#fff', fontWeight:600, fontSize:14 }}>{p.name}</span>
            </div>
            <div style={{
              color: initialRolls[p.id] ? '#fbbf24' : 'rgba(255,255,255,0.3)',
              fontWeight:900, fontSize:22,
            }}>
              {initialRolls[p.id] ?? '—'}
            </div>
          </div>
        ))}
      </div>

      {!myInitialRolled ? (
        <motion.button
          whileTap={{ scale:0.93 }}
          onClick={handleInitialRoll}
          style={{
            background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
            border:'none', color:'#fff',
            padding:'14px 40px', borderRadius:999,
            fontWeight:700, fontSize:16, cursor:'pointer',
            boxShadow:'0 4px 20px rgba(79,70,229,0.4)',
          }}
        >🎲 ارمِ النرد</motion.button>
      ) : (
        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:14 }}>
          انتظر باقي اللاعبين...
        </div>
      )}
    </div>
  );

  const WinScreen = () => (
    <AnimatePresence>
      {winner && (
        <motion.div
          key="win"
          initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
          style={{
            position:'fixed', inset:0, zIndex:500,
            background:'rgba(9,9,28,0.96)',
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', gap:20,
          }}
        >
          <motion.div
            initial={{ scale:0 }} animate={{ scale:1 }}
            transition={{ type:'spring', stiffness:260, damping:18, delay:0.2 }}
            style={{ fontSize:80 }}
          >🏆</motion.div>

          <motion.div
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:0.5 }}
            style={{ textAlign:'center' }}
          >
            <div style={{ color:'#fbbf24', fontWeight:900, fontSize:28, marginBottom:8 }}>
              {winner.name}
            </div>
            <div style={{ color:'rgba(255,255,255,0.7)', fontSize:16 }}>
              فاز باللعبة! 🎉
            </div>
          </motion.div>

          <div style={{ display:'flex', flexDirection:'column', gap:6, width:'100%', maxWidth:260, marginTop:8 }}>
            {[...players].sort((a, b) => (b.money || 0) - (a.money || 0)).map((p, i) => (
              <div key={p.id} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                background: p.id === winner.id ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)',
                border:`1px solid ${p.id === winner.id ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius:10, padding:'8px 14px',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>#{i + 1}</span>
                  <div style={{ width:20, height:20, borderRadius:'50%', background:p.color || '#6366f1' }}/>
                  <span style={{ color:'#fff', fontSize:13, fontWeight:600 }}>{p.name}</span>
                </div>
                <span style={{ color:'#6ee7b7', fontWeight:700, fontSize:13 }}>
                  {(p.money || 0).toLocaleString('ar-EG')} ج
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { emit('close_game', { roomCode: rid }); onExit?.(); }}
            style={{
              marginTop:8,
              background:'rgba(255,255,255,0.08)',
              border:'1px solid rgba(255,255,255,0.15)',
              color:'rgba(255,255,255,0.7)',
              padding:'10px 28px', borderRadius:999,
              fontWeight:600, fontSize:14, cursor:'pointer',
            }}
          >خروج</button>

          <button
            onClick={toggleFs}
            style={{
              position:'absolute',
              top:'min(12px,2vh)', right:'min(16px,2.4vh)', zIndex:20,
              background:'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
              backdropFilter:'blur(16px) saturate(180%)',
              WebkitBackdropFilter:'blur(16px) saturate(180%)',
              border:'1px solid rgba(255,255,255,0.2)',
              color:'rgba(255,255,255,0.85)',
              padding:'min(6px,1vh) min(14px,2vh)',borderRadius:12,
              cursor:'pointer',fontSize:'min(13px,2vh)',fontWeight:600,
              boxShadow:'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.3)',
            }}
          >{isFs ? '✕' : '⛶'}</button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const BankruptModal = () => (
    <AnimatePresence>
      {showBankrupt && (
        <>
          <motion.div key="bk-bg"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={() => setShowBankrupt(false)}
            style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.7)' }}
          />
          <motion.div key="bk-modal"
            initial={{ opacity:0, scale:0.85, y:30 }}
            animate={{ opacity:1, scale:1, y:0 }}
            exit={{ opacity:0, scale:0.9 }}
            transition={{ type:'spring', stiffness:300, damping:26 }}
            style={{
              position:'fixed', inset:0, zIndex:301,
              display:'flex', alignItems:'center', justifyContent:'center',
              pointerEvents:'none',
            }}
          >
            <div style={{
              background:'#0f172a',
              border:'2px solid rgba(239,68,68,0.4)',
              borderRadius:20, padding:28,
              width:'100%', maxWidth:300,
              display:'flex', flexDirection:'column', alignItems:'center', gap:16,
              pointerEvents:'auto',
              boxShadow:'0 8px 40px rgba(239,68,68,0.2)',
            }}>
              <div style={{ fontSize:48 }}>💔</div>
              <div style={{ color:'#fff', fontWeight:900, fontSize:18, textAlign:'center' }}>
                إعلان الإفلاس
              </div>
              <div style={{ color:'rgba(255,255,255,0.6)', fontSize:13, textAlign:'center', lineHeight:1.6 }}>
                لما تعلن إفلاسك هتخرج من اللعبة وكل بلادك هترجع للبنك
              </div>
              <div style={{ color:'#fca5a5', fontWeight:700, fontSize:14, textAlign:'center' }}>
                رصيدك الحالي: {(myPlayer?.money || 0).toLocaleString('ar-EG')} جنيه
              </div>
              <div style={{ display:'flex', gap:10, width:'100%' }}>
                <button
                  onClick={handleDeclareBankruptcy}
                  style={{
                    flex:1, padding:'12px 0', borderRadius:12,
                    background:'rgba(185,28,28,0.9)',
                    border:'1px solid rgba(239,68,68,0.4)',
                    color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer',
                  }}
                >💔 أعلن الإفلاس</button>
                <button
                  onClick={() => setShowBankrupt(false)}
                  style={{
                    flex:1, padding:'12px 0', borderRadius:12,
                    background:'rgba(255,255,255,0.06)',
                    border:'1px solid rgba(255,255,255,0.1)',
                    color:'rgba(255,255,255,0.7)', fontWeight:700, fontSize:14, cursor:'pointer',
                  }}
                >إلغاء</button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <style>{`
        @media screen and (orientation: portrait) and (max-width: 1024px) {
          .portrait-lock { display: flex !important; }
          .game-root { display: none !important; }
        }
      `}</style>

      {/* شاشة "لف الموبايل" */}
      <div className="portrait-lock" style={{
        display:'none',
        position:'fixed',inset:0,zIndex:9999,
        background:'#09091c',
        flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,
      }}>
        <div style={{fontSize:64}}>📱</div>
        <motion.div
          animate={{rotate:[0,90,90,0]}}
          transition={{duration:2,repeat:Infinity,ease:'easeInOut'}}
          style={{fontSize:48}}
        >➡️</motion.div>
        <div style={{color:'#fff',fontWeight:700,fontSize:18,textAlign:'center'}}>لف الموبايل عرضاً</div>
        <div style={{color:'rgba(255,255,255,0.5)',fontSize:13}}>اللعبة بتشتغل landscape بس</div>
      </div>

      {/* اللعبة */}
      <div className="game-root" style={{
        position:'fixed',inset:0,overflow:'hidden',
        background:'radial-gradient(ellipse at 30% 20%,#0d1b2a 0%,#0a0f1e 50%,#050a14 100%)',
      }}>
        <div style={{ position:'absolute', inset:0, background:'#0a0a14' }}/>

        {/* البورد */}
        <div style={{
          position:'absolute', inset:0,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <div
            id="board-container"
            style={{
              position:'relative',
              width: '100%',
              height: '100%',
              maxWidth: `min(100vw, calc(100vh * 1240 / 930))`,
              maxHeight: `min(100vh, calc(100vw * 930 / 1240))`,
            }}
          >
            <img
              src={`${process.env.PUBLIC_URL || ''}/bank/board.png`}
              alt="board"
              style={{
                position:'absolute', inset:0,
                width:'100%', height:'100%',
                objectFit:'fill',
                opacity:0.95,
              }}
            />
            <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.1)' }}/>

            {/* كروت حظك — النزول تحت */}
            <CardPile
              type="chance" count={chanceCount}
              style={{ top:'28%', left:'18%' }}
              isAdmin={isAdmin} onShuffle={handleShuffle}
            />
            {/* كروت محاكمة */}
            <CardPile
              type="community" count={communityCount}
              style={{ top:'28%', left:'74%' }}
              isAdmin={isAdmin} onShuffle={handleShuffle}
            />

            {/* البناء على الخانات */}
            {gameState?.board && (
              <TileBuildings board={gameState.board} players={players} />
            )}

            {/* اللاعبون */}
            {(() => {
              const byPosition = {};
              gameState?.players?.filter(p => !p.eliminated).forEach(player => {
                const pos = player.position || 0;
                if (!byPosition[pos]) byPosition[pos] = [];
                byPosition[pos].push(player);
              });

              return Object.entries(byPosition).map(([posStr, playersAtPos]) => {
                const position = parseInt(posStr);
                const tilePos  = getTilePosition(position);

                return playersAtPos.map((player, idx) => {
                  const isMe    = player.id === pid;
                  const total   = playersAtPos.length;
                  const offsetX = total > 1 ? (idx - (total - 1) / 2) * 14 : 0;

                  return (
                    <motion.div
                      key={player.id}
                      style={{
                        position:'absolute',
                        left: tilePos.left,
                        top:  tilePos.top,
                        transform:`translate(calc(-50% + ${offsetX}px), -100%)`,
                        zIndex: 10 + idx,
                      }}
                      animate={{
                        left: tilePos.left,
                        top:  tilePos.top,
                      }}
                      transition={{ type:'spring', stiffness:180, damping:22 }}
                    >
                    <motion.div
                      style={{
                        width:'min(28px, 5vh)', height:'min(28px, 5vh)', borderRadius:'50%',
                        background: `linear-gradient(145deg, ${player.color}ee 0%, ${player.color}99 40%, ${player.color}55 70%, ${player.color}aa 100%)`,
                        backdropFilter: 'blur(8px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(8px) saturate(180%)',
                        border: '1.5px solid rgba(255,255,255,0.5)',
                        boxShadow: `
                          inset 0 1px 0 rgba(255,255,255,0.6),
                          inset 0 -1px 0 rgba(0,0,0,0.2),
                          inset 0 0 12px rgba(255,255,255,0.15),
                          0 2px 8px rgba(0,0,0,0.5),
                          0 0 16px ${player.color}99,
                          0 0 32px ${player.color}55
                        `,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        color:'#fff', fontWeight:900,
                        fontSize:'min(12px, 2.2vh)',
                        textShadow:'0 1px 3px rgba(0,0,0,0.8)',
                        cursor:'default',
                        position:'relative',
                        overflow:'hidden',
                      }}
                      animate={isMe && myTurn ? {
                        y: [0, -4, 0],
                        scale: [1, 1.08, 1],
                      } : {}}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      title={player.name}
                    >
                      <div style={{
                        position:'absolute',
                        top:'10%', left:'15%', right:'15%',
                        height:'30%',
                        borderRadius:'50%',
                        background:'linear-gradient(180deg, rgba(255,255,255,0.5), transparent)',
                        pointerEvents:'none',
                      }}/>
                      {player.name?.charAt(0)}
                    </motion.div>
                    </motion.div>
                  );
                });
              });
            })()}

            {/* ✅ لوحة التحكم في وسط البورد - Liquid Glass */}
            <div style={{
              position:'absolute',
              top:'50%', left:'50%',
              transform:'translate(-50%, -50%)',
              zIndex: 15,
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              gap: 'min(8px, 1.3vh)',
              pointerEvents:'none',
              width: 'min(320px, 42vh)',
              maxWidth: '44vw',
            }}>
              {/* إشعارات السجن */}
              <AnimatePresence>
                {myPlayer?.inJail && myTurn && (
                  <motion.div
                    initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                    style={{
                      display:'flex',flexDirection:'column',gap:6,alignItems:'center',
                      pointerEvents:'auto', width:'100%',
                    }}
                  >
                    <div style={{
                      color:'#fbbf24',
                      fontSize:'min(11px,1.8vh)',fontWeight:700,
                      background:'linear-gradient(135deg, rgba(120,53,15,0.6), rgba(120,53,15,0.3))',
                      backdropFilter:'blur(16px) saturate(160%)',
                      WebkitBackdropFilter:'blur(16px) saturate(160%)',
                      border:'1px solid rgba(251,191,36,0.5)',
                      padding:'min(5px,0.9vh) min(16px,2.6vh)',
                      borderRadius:99,
                      textAlign:'center',
                      boxShadow:'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 16px rgba(0,0,0,0.3)',
                    }}>
                      {myPlayer.jailFromCard
                        ? `⛓️ في السجن — ادفع ٥٠ أو استخدم بطاقة`
                        : `⛓️ محتاج تجيب ${myPlayer.jailRollNeeded} للخروج`}
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <button
                        onClick={() => emit('bank_leave_jail', { roomId: rid, playerId: pid, payFine: true })}
                        style={{
                          background:'linear-gradient(135deg, rgba(220,38,38,0.7), rgba(153,27,27,0.5))',
                          backdropFilter:'blur(16px) saturate(160%)',
                          WebkitBackdropFilter:'blur(16px) saturate(160%)',
                          color:'#fff',border:'1px solid rgba(252,165,165,0.5)',
                          padding:'min(7px,1.2vh) min(14px,2.2vh)',
                          borderRadius:12,
                          fontWeight:700,fontSize:'min(11px,1.8vh)',
                          cursor:'pointer',
                          boxShadow:'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 12px rgba(220,38,38,0.3)',
                        }}
                      >💸 ادفع ٥٠</button>
                      {myPlayer.getOutOfJailCards > 0 && (
                        <button
                          onClick={() => emit('bank_leave_jail', { roomId: rid, playerId: pid, payFine: false })}
                          style={{
                            background:'linear-gradient(135deg, rgba(109,40,217,0.7), rgba(76,29,149,0.5))',
                            backdropFilter:'blur(16px) saturate(160%)',
                            WebkitBackdropFilter:'blur(16px) saturate(160%)',
                            color:'#fff',border:'1px solid rgba(167,139,250,0.5)',
                            padding:'min(7px,1.2vh) min(14px,2.2vh)',
                            borderRadius:12,
                            fontWeight:700,fontSize:'min(11px,1.8vh)',
                            cursor:'pointer',
                            boxShadow:'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 12px rgba(109,40,217,0.3)',
                          }}
                        >🃏 ({myPlayer.getOutOfJailCards})</button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* إشعار الإفلاس */}
              <AnimatePresence>
                {myPlayer && !myPlayer.eliminated && (myPlayer.money <= 0) && (
                  <motion.button
                    initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                    onClick={() => setShowBankrupt(true)}
                    style={{
                      pointerEvents:'auto',
                      background:'linear-gradient(135deg, rgba(185,28,28,0.75), rgba(127,29,29,0.5))',
                      backdropFilter:'blur(16px) saturate(160%)',
                      WebkitBackdropFilter:'blur(16px) saturate(160%)',
                      border:'1px solid rgba(252,165,165,0.5)',
                      color:'#fff',
                      padding:'min(7px,1.2vh) min(20px,3vh)',
                      borderRadius:12,
                      fontWeight:700, fontSize:'min(12px,1.9vh)',
                      cursor:'pointer',
                      boxShadow:'inset 0 1px 0 rgba(255,255,255,0.25), 0 4px 16px rgba(185,28,28,0.4)',
                    }}
                  >💔 إعلان إفلاس</motion.button>
                )}
              </AnimatePresence>

              {/* ✅ اللوحة الأساسية — Liquid Glass */}
              <div style={{
                background:'linear-gradient(135deg, rgba(139,92,246,0.22) 0%, rgba(99,102,241,0.12) 35%, rgba(255,255,255,0.06) 50%, rgba(99,102,241,0.12) 65%, rgba(139,92,246,0.22) 100%)',
                backdropFilter:'blur(36px) saturate(190%)',
                WebkitBackdropFilter:'blur(36px) saturate(190%)',
                borderRadius:'min(28px, 4.5vh)',
                padding:'min(12px, 2vh) min(16px, 2.5vh)',
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                gap:'min(8px, 1.3vh)',
                pointerEvents:'auto',
                width:'100%',
                border:'1px solid rgba(255,255,255,0.22)',
                boxShadow:`
                  inset 0 1px 0 rgba(255,255,255,0.4),
                  inset 0 -1px 0 rgba(0,0,0,0.15),
                  0 12px 48px rgba(0,0,0,0.5),
                  0 0 60px rgba(99,102,241,0.25),
                  0 0 0 1px rgba(255,255,255,0.05)
                `,
                position:'relative',
                overflow:'hidden',
              }}>
                {/* لمعة علوية */}
                <div style={{
                  position:'absolute',
                  top:0, left:0, right:0,
                  height:'50%',
                  background:'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 100%)',
                  pointerEvents:'none',
                  borderTopLeftRadius:'inherit',
                  borderTopRightRadius:'inherit',
                }}/>

                {/* عرض الرصيد */}
                <div style={{
                  background: `linear-gradient(135deg, 
                    rgba(251,191,36,0.4) 0%, 
                    rgba(251,191,36,0.15) 50%, 
                    rgba(251,191,36,0.3) 100%)`,
                  backdropFilter: 'blur(16px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                  border: '2px solid rgba(251,191,36,0.7)',
                  color: '#fbbf24',
                  padding: 'min(8px, 1.4vh) min(24px, 4vh)',
                  borderRadius: 999,
                  fontSize: 'min(20px, 3.5vh)',
                  fontWeight: 900,
                  textShadow: '0 0 20px rgba(251,191,36,0.8), 0 2px 4px rgba(0,0,0,0.6)',
                  letterSpacing: 1.5,
                  boxShadow: `
                    inset 0 1px 0 rgba(255,255,255,0.5),
                    inset 0 -1px 0 rgba(0,0,0,0.2),
                    0 4px 20px rgba(251,191,36,0.5),
                    0 0 40px rgba(251,191,36,0.3),
                    0 0 80px rgba(251,191,36,0.15)
                  `,
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position:'absolute',
                    top:0, left:0, right:0,
                    height:'50%',
                    background:'linear-gradient(180deg, rgba(255,255,255,0.25), transparent)',
                    pointerEvents:'none',
                  }}/>
                  💰 {(myPlayer?.money || 0).toLocaleString('ar-EG')} جنيه
                </div>

                {/* الأزرار الثلاثة */}
                <div style={{ display:'flex', gap:'min(10px,1.6vh)', alignItems:'stretch', position:'relative' }}>
                  <motion.button
                    whileTap={{scale:0.88}}
                    whileHover={{scale:1.05}}
                    onClick={() => setShowMoney(true)}
                    style={{
                      background:'linear-gradient(135deg, rgba(251,191,36,0.35), rgba(251,191,36,0.1))',
                      backdropFilter:'blur(16px) saturate(180%)',
                      WebkitBackdropFilter:'blur(16px) saturate(180%)',
                      border:'1px solid rgba(251,191,36,0.5)',
                      borderRadius:'min(18px,3vh)',
                      padding:'min(9px,1.5vh) min(12px,1.9vh)',
                      cursor:'pointer',
                      display:'flex',flexDirection:'column',alignItems:'center',gap:2,
                      minWidth:'min(58px, 10vh)',
                      boxShadow:'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 16px rgba(251,191,36,0.2)',
                    }}
                  >
                    <span style={{fontSize:'min(20px,3.4vh)', filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}>💰</span>
                    <span style={{color:'#fbbf24',fontSize:'min(9px,1.5vh)',fontWeight:700,textShadow:'0 1px 2px rgba(0,0,0,0.4)'}}>فلوس</span>
                  </motion.button>

                  <motion.button
                    whileTap={!rolling ? { scale:0.88 } : {}}
                    whileHover={myTurn && !rolling && !myPlayer?.skipNextTurn ? {scale:1.05} : {}}
                    onClick={handleRoll}
                    disabled={rolling || !myTurn || myPlayer?.skipNextTurn}
                    style={{
                      width:'min(64px, 11.5vh)',
                      height:'min(64px, 11.5vh)',
                      borderRadius:'50%',
                      cursor: (rolling || !myTurn || myPlayer?.skipNextTurn) ? 'not-allowed' : 'pointer',
                      border: myTurn && !rolling && !myPlayer?.skipNextTurn
                        ? '1.5px solid rgba(199,210,254,0.7)'
                        : '1px solid rgba(255,255,255,0.15)',
                      background: rolling
                        ? 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))'
                        : myPlayer?.skipNextTurn
                          ? 'linear-gradient(135deg, rgba(120,53,15,0.7), rgba(120,53,15,0.4))'
                          : myTurn
                            ? 'linear-gradient(135deg, rgba(99,102,241,0.85), rgba(124,58,237,0.75))'
                            : 'linear-gradient(135deg, rgba(9,9,28,0.9), rgba(9,9,28,0.6))',
                      backdropFilter:'blur(16px) saturate(180%)',
                      WebkitBackdropFilter:'blur(16px) saturate(180%)',
                      display:'flex', flexDirection:'column',
                      alignItems:'center', justifyContent:'center', gap:1,
                      flexShrink:0,
                      boxShadow: myTurn && !rolling && !myPlayer?.skipNextTurn
                        ? 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(0,0,0,0.2), 0 8px 32px rgba(99,102,241,0.5), 0 0 24px rgba(124,58,237,0.4)'
                        : 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 16px rgba(0,0,0,0.3)',
                    }}
                  >
                    <span style={{ fontSize:'min(22px, 3.8vh)', filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                      {myPlayer?.skipNextTurn ? '⏭️' : '🎲'}
                    </span>
                    <span style={{
                      fontSize:'min(8px, 1.4vh)', fontWeight:700,
                      color: (myTurn && !rolling && !myPlayer?.skipNextTurn) ? '#fff' : 'rgba(255,255,255,0.4)',
                      textAlign:'center',
                      textShadow:'0 1px 2px rgba(0,0,0,0.4)',
                    }}>
                      {rolling ? '...' :
                       myPlayer?.skipNextTurn ? 'متخطي' :
                       myTurn ? 'ارمِ' : 'النرد'}
                    </span>
                  </motion.button>

                  <motion.button
                    whileTap={{scale:0.88}}
                    whileHover={{scale:1.05}}
                    onClick={() => setShowProps(true)}
                    style={{
                      background:'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(99,102,241,0.1))',
                      backdropFilter:'blur(16px) saturate(180%)',
                      WebkitBackdropFilter:'blur(16px) saturate(180%)',
                      border:'1px solid rgba(165,180,252,0.5)',
                      borderRadius:'min(18px,3vh)',
                      padding:'min(9px,1.5vh) min(12px,1.9vh)',
                      cursor:'pointer',
                      display:'flex',flexDirection:'column',alignItems:'center',gap:2,
                      minWidth:'min(58px, 10vh)',
                      position:'relative',
                      boxShadow:'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.1), 0 4px 16px rgba(99,102,241,0.2)',
                    }}
                  >
                    {(myPlayer?.properties?.length || 0) > 0 && (
                      <div style={{
                        position:'absolute',top:-5,right:-5,
                        width:'min(16px, 2.8vh)',height:'min(16px, 2.8vh)',borderRadius:'50%',
                        background:'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color:'#fff',
                        fontSize:'min(9px, 1.5vh)',fontWeight:700,
                        display:'flex',alignItems:'center',justifyContent:'center',
                        border:'1.5px solid rgba(255,255,255,0.5)',
                        boxShadow:'0 2px 8px rgba(99,102,241,0.6)',
                      }}>{myPlayer.properties.length}</div>
                    )}
                    <span style={{fontSize:'min(20px,3.4vh)', filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'}}>🏠</span>
                    <span style={{color:'#a5b4fc',fontSize:'min(9px,1.5vh)',fontWeight:700,textShadow:'0 1px 2px rgba(0,0,0,0.4)'}}>بلاد</span>
                  </motion.button>
                </div>

                {/* مؤشر اللاعب الحالي */}
                <div style={{
                  display:'flex',alignItems:'center',gap:6,
                  background:'linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.25))',
                  backdropFilter:'blur(12px)',
                  WebkitBackdropFilter:'blur(12px)',
                  border:'1px solid rgba(255,255,255,0.15)',
                  padding:'min(3px,0.5vh) min(10px,1.6vh)',
                  borderRadius:99,
                  fontSize:'min(11px,1.8vh)',
                  boxShadow:'inset 0 1px 0 rgba(255,255,255,0.1)',
                  position:'relative',
                }}>
                  <div style={{
                    width:'min(7px,1.2vh)',height:'min(7px,1.2vh)',borderRadius:'50%',
                    background:currentPlayer?.color||'#6366f1',
                    boxShadow:`0 0 8px ${currentPlayer?.color||'#6366f1'}`,
                  }}/>
                  <span style={{color:'rgba(255,255,255,0.9)',fontWeight:600}}>
                    {currentPlayer?.name||'...'}
                  </span>
                  {myTurn && <span style={{color:'#fbbf24',fontWeight:700}}>(دورك)</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* زر الخروج */}
        <button
          onClick={() => { emit('close_game', { roomCode: rid }); onExit?.(); }}
          style={{
            position:'absolute',
            top:'min(12px,2vh)', left:'min(16px,2.4vh)', zIndex:20,
            background:'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04))',
            backdropFilter:'blur(16px) saturate(180%)',
            WebkitBackdropFilter:'blur(16px) saturate(180%)',
            border:'1px solid rgba(255,255,255,0.2)',
            color:'rgba(255,255,255,0.85)',
            padding:'min(6px,1vh) min(14px,2vh)',borderRadius:12,
            cursor:'pointer',fontSize:'min(13px,2vh)',fontWeight:600,
            boxShadow:'inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.3)',
          }}
        >✕ خروج</button>

        {/* أوفرلاي النرد */}
        <AnimatePresence>
          {showDice && (
            <motion.div key="dice"
              initial={{opacity:0,scale:0.6,y:40}} animate={{opacity:1,scale:1,y:0}}
              exit={{opacity:0,scale:0.75,y:-30}}
              transition={{type:'spring',stiffness:300,damping:24}}
              style={{position:'absolute',inset:0,zIndex:30,display:'flex',alignItems:'center',justifyContent:'center',pointerEvents:'none'}}
            >
              <div style={{
                background:'linear-gradient(135deg, rgba(9,9,28,0.9), rgba(15,10,40,0.85))',
                backdropFilter:'blur(30px) saturate(180%)',
                WebkitBackdropFilter:'blur(30px) saturate(180%)',
                border:'1px solid rgba(255,255,255,0.2)',
                borderRadius:24,
                padding:'min(28px,4vh) min(36px,5vh)',
                display:'flex',flexDirection:'column',
                alignItems:'center',gap:'min(16px,2.4vh)',
                boxShadow:'inset 0 1px 0 rgba(255,255,255,0.25), 0 8px 40px rgba(0,0,0,0.5)',
              }}>
                <span style={{color:'rgba(255,255,255,0.5)',fontSize:'min(13px,2vh)'}}>
                  {rolling ? 'جاري الرمي...' : 'نتيجة النرد'}
                </span>
                <RollingDice rolling={rolling} values={diceValues} onForceStop={handleForceStop}/>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* كارت واحد */}
        <DrawnCardOverlay
          card={drawnCard}
          pid={pid}
          onDismiss={() => { setDrawnCard(null); }}
          onConfirm={dismissDrawnCards}
        />

        {/* كارتين */}
        <MultiCardOverlay
          cards={drawnCards}
          pid={pid}
          onDismiss={() => { setDrawnCards(null); }}
          onConfirm={dismissDrawnCards}
        />

        <MoneySheet
          open={showMoney} onClose={() => setShowMoney(false)}
          money={myPlayer?.money} players={players}
          myPlayerId={pid} onPay={handlePay}
        />
        <PropsPanel
          open={showProps} onClose={() => setShowProps(false)}
          myPlayer={myPlayer} gameState={gameState}
          onBuild={t => emit('bank_build', { roomId: rid, playerId: pid, tileId: t })}
          onSell={t  => emit('bank_sell_property', { roomId: rid, playerId: pid, tileId: t })}
          onAuction={tile => handleStartAuction(tile)}
        />

        {/* popup عرض الشراء */}
        <AnimatePresence>
        {buyOffer && (() => {
            const tile = gameState?.board?.find(t => t.id === buyOffer.tileId);
            const tileColor = tile ? (LAND_COLORS[tile.name] || '#6366f1') : '#6366f1';
            const isClub = buyOffer.isClub;
            const isStation = tile?.type === 'station';
            return (
            <>
                <motion.div key="buy-bg"
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                transition={{duration:0.3}}
                style={{
                    position:'fixed', inset:0, zIndex:300,
                    background:`radial-gradient(ellipse at 50% 50%, ${tileColor}22 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.95) 100%)`,
                    backdropFilter:'blur(10px)',
                }}
                />
                <motion.div key="buy-popup"
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                style={{
                    position:'fixed',inset:0,zIndex:301,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    pointerEvents:'none', padding:20,
                }}
                >
                <motion.div
                    initial={{scale:0.6, y:50, opacity:0, rotateX:-20}}
                    animate={{scale:1, y:0, opacity:1, rotateX:0}}
                    exit={{scale:0.85, y:-30, opacity:0}}
                    transition={{type:'spring', stiffness:260, damping:22}}
                    style={{
                    pointerEvents:'auto',
                    background: `linear-gradient(160deg, ${tileColor}30 0%, #0f0a05 45%, #050302 100%)`,
                    backdropFilter:'blur(28px)',
                    border:`3px solid ${tileColor}`,
                    borderRadius:28,
                    padding:'32px 28px 26px',
                    width:'100%', maxWidth:340,
                    display:'flex',flexDirection:'column',alignItems:'center',gap:16,
                    boxShadow:`0 30px 80px rgba(0,0,0,0.7), 0 0 60px ${tileColor}55, inset 0 1px 0 rgba(255,255,255,0.15)`,
                    direction:'rtl',
                    position:'relative',
                    overflow:'hidden',
                    }}
                >
                    <div style={{
                    position:'absolute', inset:0,
                    background:`repeating-linear-gradient(135deg, ${tileColor}0a 0px, ${tileColor}0a 2px, transparent 2px, transparent 14px)`,
                    pointerEvents:'none',
                    }} />

                    <motion.div
                    initial={{y:-30, opacity:0}}
                    animate={{y:0, opacity:1}}
                    transition={{delay:0.15, type:'spring', stiffness:300}}
                    style={{
                        position:'absolute', top:-2, left:'50%', transform:'translateX(-50%)',
                        background:`linear-gradient(135deg, ${tileColor}, ${tileColor}cc)`,
                        color:'#fff', fontSize:11, fontWeight:900, letterSpacing:2,
                        padding:'4px 18px', borderRadius:'0 0 12px 12px',
                        textShadow:'0 1px 2px rgba(0,0,0,0.5)',
                        boxShadow:`0 4px 12px ${tileColor}66`,
                        zIndex:2,
                    }}>
                    {isClub ? 'النادي' : isStation ? 'محطة' : 'فرصة شراء'}
                    </motion.div>

                    <motion.div
                    initial={{ scale:0, rotate:-180 }}
                    animate={{ scale:1, rotate:0 }}
                    transition={{ delay:0.2, type:'spring', stiffness:200, damping:14 }}
                    style={{
                        width:92, height:92, borderRadius:'50%',
                        background: `radial-gradient(circle at 30% 25%, ${tileColor}, ${tileColor}aa 70%)`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:46,
                        border:`3px solid rgba(255,255,255,0.55)`,
                        boxShadow:`0 0 45px ${tileColor}90, inset 0 4px 8px rgba(255,255,255,0.45), inset 0 -6px 10px rgba(0,0,0,0.3)`,
                        marginTop:6,
                        position:'relative', zIndex:1,
                    }}>
                    {isClub ? '🎰' : isStation ? '⛽' : '🏙️'}
                    </motion.div>

                    <motion.div
                    initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}
                    transition={{delay:0.3}}
                    style={{
                        color:'rgba(255,255,255,0.7)', fontSize:13,
                        fontWeight:600, letterSpacing:1,
                        position:'relative', zIndex:1,
                    }}>
                    {isClub
                        ? (buyOffer.currentOwners?.length === 0
                            ? 'تريد شراء النادي؟'
                            : 'تريد أن تصبح شريكاً؟')
                        : 'هل تريد شراء'}
                    </motion.div>

                    <motion.div
                    initial={{opacity:0, scale:0.7}} animate={{opacity:1, scale:1}}
                    transition={{delay:0.35, type:'spring', stiffness:260}}
                    style={{
                        color:'#fff', fontSize:26, fontWeight:900,
                        textAlign:'center', lineHeight:1.2,
                        textShadow:`0 0 20px ${tileColor}, 0 2px 4px rgba(0,0,0,0.8)`,
                        position:'relative', zIndex:1,
                        marginTop:-4,
                    }}>
                    {isClub ? 'النادي' : (tile?.name || 'بلد')}
                    </motion.div>

                    <motion.div
                    initial={{opacity:0, scale:0.5}} animate={{opacity:1, scale:1}}
                    transition={{delay:0.45, type:'spring', stiffness:220, damping:14}}
                    style={{
                        background:`linear-gradient(145deg, rgba(212,175,55,0.25), rgba(212,175,55,0.08))`,
                        border:'2px solid #d4af37',
                        borderRadius:18,
                        padding:'14px 34px',
                        display:'flex', alignItems:'center', gap:10,
                        boxShadow:`0 0 30px rgba(212,175,55,0.35), inset 0 1px 0 rgba(255,255,255,0.2)`,
                        position:'relative', zIndex:1,
                    }}>
                    <motion.span
                        animate={{rotate:[0, -10, 10, -10, 0]}}
                        transition={{duration:1.5, repeat:Infinity, repeatDelay:1}}
                        style={{fontSize:24}}>
                        💰
                    </motion.span>
                    <div style={{display:'flex', alignItems:'baseline', gap:4}}>
                        <span style={{
                        color:'#f4d35e', fontSize:34, fontWeight:900,
                        textShadow:'0 0 16px rgba(212,175,55,0.8)',
                        fontVariantNumeric:'tabular-nums',
                        }}>{buyOffer.price}</span>
                        <span style={{
                        color:'rgba(244,211,94,0.6)', fontSize:13, fontWeight:700,
                        }}>جنيه</span>
                    </div>
                    </motion.div>

                    <div style={{
                    color:'rgba(255,255,255,0.45)', fontSize:12,
                    position:'relative', zIndex:1,
                    display:'flex', alignItems:'center', gap:6,
                    }}>
                    <span>رصيدك:</span>
                    <span style={{
                        color: buyOffer.canAfford ? '#6ee7b7' : '#fca5a5',
                        fontWeight:700,
                    }}>{(myPlayer?.money || 0).toLocaleString('ar-EG')} ج</span>
                    </div>

                    <div style={{display:'flex',gap:10,width:'100%',marginTop:4,position:'relative',zIndex:1}}>
                    {buyOffer.canAfford ? (
                        <motion.button
                        whileHover={{scale:1.04, y:-2}} whileTap={{scale:0.95}}
                        initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}
                        transition={{delay:0.55, type:'spring', stiffness:300}}
                        onClick={() => { emit('bank_buy', { roomId: rid, playerId: pid, tileId: buyOffer.tileId }); setBuyOffer(null); }}
                        style={{
                            flex:1.3,padding:'15px 0',borderRadius:16,
                            background:`linear-gradient(145deg, #10b981, #047857)`,
                            color:'#fff',border:'2px solid #6ee7b7',
                            fontWeight:900,fontSize:15,cursor:'pointer',
                            boxShadow:'0 10px 28px rgba(16,185,129,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
                            textShadow:'0 1px 2px rgba(0,0,0,0.4)',
                            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                        }}
                        >✓ اشتري</motion.button>
                    ) : (
                        <motion.div
                        initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}}
                        transition={{delay:0.55, type:'spring', stiffness:300}}
                        style={{
                            flex:1.3, padding:'15px 0', borderRadius:16, textAlign:'center',
                            background:'linear-gradient(145deg, rgba(220,38,38,0.3), rgba(220,38,38,0.1))',
                            border:'2px solid rgba(220,38,38,0.6)',
                            color:'#fca5a5', fontSize:13, fontWeight:800,
                            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                        }}
                        >🚫 ما معكش فلوس كافية</motion.div>
                    )}
                    <motion.button
                        whileHover={{scale:1.04, y:-2}} whileTap={{scale:0.95}}
                        initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}
                        transition={{delay:0.6, type:'spring', stiffness:300}}
                        onClick={() => setBuyOffer(null)}
                        style={{
                        flex:1, padding:'15px 0', borderRadius:16,
                        background:'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
                        color:'rgba(255,255,255,0.75)',
                        border:'1.5px solid rgba(255,255,255,0.2)',
                        fontWeight:800,fontSize:15,cursor:'pointer',
                        textShadow:'0 1px 2px rgba(0,0,0,0.5)',
                        }}
                    >✕ لا</motion.button>
                    </div>
                </motion.div>
                </motion.div>
            </>
            );
        })()}
        </AnimatePresence>

        {/* popup الإيجار */}
        <AnimatePresence>
        {rentOffer && (() => {
            const tile = gameState?.board?.find(t => t.id === rentOffer.tileId);
            const tileColor = tile ? (LAND_COLORS[tile.name] || '#6366f1') : '#6366f1';
            const owner = players.find(p => p.id === rentOffer.ownerId);
            const ownerColor = owner?.color || '#f59e0b';
            return (
            <>
                <motion.div key="rent-bg"
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                transition={{duration:0.3}}
                style={{
                    position:'fixed', inset:0, zIndex:300,
                    background:`radial-gradient(ellipse at 50% 50%, rgba(220,38,38,0.22) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.95) 100%)`,
                    backdropFilter:'blur(10px)',
                }}
                />
                <motion.div key="rent-popup"
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                style={{
                    position:'fixed',inset:0,zIndex:301,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    pointerEvents:'none', padding:20,
                }}
                >
                <motion.div
                    initial={{scale:0.6, y:50, opacity:0, rotateX:-20}}
                    animate={{scale:1, y:0, opacity:1, rotateX:0}}
                    exit={{scale:0.85, y:-30, opacity:0}}
                    transition={{type:'spring', stiffness:260, damping:22}}
                    style={{
                    pointerEvents:'auto',
                    background:`linear-gradient(160deg, rgba(220,38,38,0.18) 0%, #1a0505 45%, #050202 100%)`,
                    backdropFilter:'blur(28px)',
                    border:`3px solid #dc2626`,
                    borderRadius:28,
                    padding:'32px 28px 26px',
                    width:'100%', maxWidth:360,
                    display:'flex',flexDirection:'column',alignItems:'center',gap:16,
                    boxShadow:`0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(220,38,38,0.4), inset 0 1px 0 rgba(255,255,255,0.15)`,
                    direction:'rtl',
                    position:'relative',
                    overflow:'hidden',
                    }}
                >
                    <div style={{
                    position:'absolute', inset:0,
                    background:`repeating-linear-gradient(135deg, rgba(220,38,38,0.05) 0px, rgba(220,38,38,0.05) 2px, transparent 2px, transparent 14px)`,
                    pointerEvents:'none',
                    }} />

                    <motion.div
                    initial={{y:-30, opacity:0}} animate={{y:0, opacity:1}}
                    transition={{delay:0.15, type:'spring', stiffness:300}}
                    style={{
                        position:'absolute', top:-2, left:'50%', transform:'translateX(-50%)',
                        background:`linear-gradient(135deg, #dc2626, #991b1b)`,
                        color:'#fff', fontSize:11, fontWeight:900, letterSpacing:2,
                        padding:'4px 18px', borderRadius:'0 0 12px 12px',
                        textShadow:'0 1px 2px rgba(0,0,0,0.5)',
                        boxShadow:`0 4px 12px rgba(220,38,38,0.6)`,
                        zIndex:2,
                    }}>
                    ⚠️ مطلوب دفع
                    </motion.div>

                    <motion.div
                    initial={{ scale:0, rotate:-180 }}
                    animate={{ scale:1, rotate:0 }}
                    transition={{ delay:0.2, type:'spring', stiffness:200, damping:14 }}
                    style={{
                        width:92, height:92, borderRadius:'50%',
                        background: `radial-gradient(circle at 30% 25%, #dc2626, #7f1d1d 70%)`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:46,
                        border:`3px solid rgba(252,165,165,0.6)`,
                        boxShadow:`0 0 45px rgba(220,38,38,0.7), inset 0 4px 8px rgba(255,255,255,0.35), inset 0 -6px 10px rgba(0,0,0,0.35)`,
                        marginTop:6,
                        position:'relative', zIndex:1,
                    }}>
                    💸
                    </motion.div>

                    <motion.div
                    initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}
                    transition={{delay:0.3}}
                    style={{
                        color:'rgba(255,255,255,0.75)', fontSize:13, fontWeight:600,
                        textAlign:'center', position:'relative', zIndex:1,
                    }}>
                    إيجار <span style={{color: tileColor, fontWeight:800}}>{rentOffer.tileName}</span>
                    </motion.div>

                    <motion.div
                    initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}}
                    transition={{delay:0.35, type:'spring', stiffness:260}}
                    style={{
                        display:'flex', alignItems:'center', gap:10,
                        background:'rgba(0,0,0,0.35)',
                        padding:'8px 18px', borderRadius:99,
                        border:`1.5px solid ${ownerColor}80`,
                        position:'relative', zIndex:1,
                    }}>
                    <div style={{
                        width:26, height:26, borderRadius:'50%',
                        background:`linear-gradient(145deg, ${ownerColor}, ${ownerColor}cc)`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        color:'#fff', fontSize:11, fontWeight:900,
                        border:'2px solid #fff',
                        boxShadow:`0 0 12px ${ownerColor}90`,
                    }}>{rentOffer.ownerName?.charAt(0)}</div>
                    <span style={{color:'#fff', fontSize:13, fontWeight:700}}>
                        {rentOffer.ownerName}
                    </span>
                    </motion.div>

                    <motion.div
                    initial={{opacity:0, scale:0.5}} animate={{opacity:1, scale:1}}
                    transition={{delay:0.45, type:'spring', stiffness:220, damping:14}}
                    style={{
                        background:`linear-gradient(145deg, rgba(220,38,38,0.3), rgba(220,38,38,0.08))`,
                        border:'2px solid #dc2626',
                        borderRadius:18,
                        padding:'14px 34px',
                        display:'flex', alignItems:'center', gap:10,
                        boxShadow:`0 0 30px rgba(220,38,38,0.5), inset 0 1px 0 rgba(255,255,255,0.2)`,
                        position:'relative', zIndex:1,
                    }}>
                    <motion.span
                        animate={{
                        x: [0, 6, 0],
                        filter: ['drop-shadow(0 0 4px rgba(252,165,165,0.8))', 'drop-shadow(0 0 12px rgba(252,165,165,1))', 'drop-shadow(0 0 4px rgba(252,165,165,0.8))'],
                        }}
                        transition={{duration:1.2, repeat:Infinity}}
                        style={{fontSize:24}}>
                        💸
                    </motion.span>
                    <div style={{display:'flex', alignItems:'baseline', gap:4}}>
                        <span style={{
                        color:'#fca5a5', fontSize:38, fontWeight:900,
                        textShadow:'0 0 20px rgba(220,38,38,0.9)',
                        fontVariantNumeric:'tabular-nums',
                        }}>{rentOffer.rent}</span>
                        <span style={{color:'rgba(252,165,165,0.6)', fontSize:13, fontWeight:700}}>
                        جنيه
                        </span>
                    </div>
                    </motion.div>

                    <div style={{
                    color:'rgba(255,255,255,0.45)', fontSize:12,
                    position:'relative', zIndex:1,
                    display:'flex', alignItems:'center', gap:6,
                    }}>
                    <span>رصيدك:</span>
                    <span style={{
                        color: rentOffer.canAfford ? '#6ee7b7' : '#fca5a5',
                        fontWeight:700,
                    }}>{(myPlayer?.money || 0).toLocaleString('ar-EG')} ج</span>
                    </div>

                    {rentOffer.canAfford ? (
                    <motion.button
                        whileHover={{scale:1.03, y:-2}} whileTap={{scale:0.95}}
                        initial={{opacity:0, y:20}} animate={{opacity:1, y:0}}
                        transition={{delay:0.55, type:'spring', stiffness:300}}
                        onClick={() => {
                        emit('bank_pay_rent', { roomId: rid, playerId: pid, tileId: rentOffer.tileId });
                        setRentOffer(null);
                        }}
                        style={{
                        width:'100%', padding:'16px 0', borderRadius:16,
                        background:`linear-gradient(145deg, #dc2626, #991b1b)`,
                        color:'#fff', border:'2px solid #fca5a5',
                        fontWeight:900, fontSize:16, cursor:'pointer',
                        boxShadow:'0 10px 28px rgba(220,38,38,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
                        textShadow:'0 1px 2px rgba(0,0,0,0.5)',
                        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                        marginTop:4, position:'relative', zIndex:1,
                        }}
                    >💸 ادفع الإيجار</motion.button>
                    ) : (
                    <div style={{
                        display:'flex', flexDirection:'column', gap:10,
                        width:'100%', position:'relative', zIndex:1, marginTop:4,
                    }}>
                        <motion.div
                        initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}}
                        transition={{delay:0.55, type:'spring', stiffness:300}}
                        style={{
                            padding:'14px 0', borderRadius:16, textAlign:'center',
                            background:'linear-gradient(145deg, rgba(220,38,38,0.3), rgba(220,38,38,0.1))',
                            border:'2px solid rgba(220,38,38,0.6)',
                            color:'#fca5a5', fontSize:14, fontWeight:800,
                            display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                        }}
                        >🚫 ما معكش فلوس كافية!</motion.div>

                        <motion.button
                        whileHover={{scale:1.03, y:-2}} whileTap={{scale:0.95}}
                        initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}
                        transition={{delay:0.6, type:'spring', stiffness:300}}
                        onClick={() => { setRentOffer(null); setShowBankrupt(true); }}
                        style={{
                            width:'100%', padding:'14px 0', borderRadius:16,
                            background:'rgba(185,28,28,0.9)',
                            border:'1px solid rgba(239,68,68,0.5)',
                            color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer',
                            boxShadow:'0 6px 20px rgba(185,28,28,0.4)',
                        }}
                        >💔 أعلن الإفلاس</motion.button>

                        <motion.button
                        whileHover={{scale:1.03}} whileTap={{scale:0.95}}
                        initial={{opacity:0, y:10}} animate={{opacity:1, y:0}}
                        transition={{delay:0.65, type:'spring', stiffness:300}}
                        onClick={() => setRentOffer(null)}
                        style={{
                            width:'100%', padding:'12px 0', borderRadius:16,
                            background:'rgba(255,255,255,0.06)',
                            border:'1px solid rgba(255,255,255,0.12)',
                            color:'rgba(255,255,255,0.7)',
                            fontWeight:700, fontSize:13, cursor:'pointer',
                        }}
                        >حسنًا</motion.button>
                    </div>
                    )}
                </motion.div>
                </motion.div>
            </>
            );
        })()}
        </AnimatePresence>

        {/* popup النادي */}
        <AnimatePresence>
          {clubOffer && (
            <>
              <motion.div key="club-bg"
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                onClick={() => setClubOffer(null)}
                style={{position:'fixed',inset:0,zIndex:300,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(6px)'}}
              />
              <motion.div key="club-popup"
                initial={{opacity:0,scale:0.85,y:30}}
                animate={{opacity:1,scale:1,y:0}}
                exit={{opacity:0,scale:0.9}}
                transition={{type:'spring',stiffness:300,damping:26}}
                style={{
                  position:'fixed',inset:0,zIndex:301,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  pointerEvents:'none',
                }}
              >
                <div style={{
                  pointerEvents:'auto',
                  background:'rgba(15,10,40,0.96)',
                  backdropFilter:'blur(24px)',
                  border:'1px solid rgba(234,179,8,0.3)',
                  borderRadius:24, padding:'28px 32px',
                  width:'100%', maxWidth:320,
                  display:'flex', flexDirection:'column', alignItems:'center', gap:14,
                  boxShadow:'0 8px 40px rgba(234,179,8,0.15)',
                  direction:'rtl',
                }}>
                  <div style={{fontSize:40}}>🎰</div>
                  <div style={{color:'#fbbf24',fontWeight:900,fontSize:20}}>النادي</div>

                  {clubOffer.currentOwners?.length === 0 ? (
                    <>
                      <div style={{color:'rgba(255,255,255,0.6)',fontSize:13,textAlign:'center'}}>
                        اختار طريقة الشراء
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:8,width:'100%'}}>
                        {clubOffer.canAffordFull && (
                          <button
                            onClick={() => {
                              emit('bank_buy', { roomId: rid, playerId: pid, tileId: clubOffer.tileId, buyFull: true });
                              setClubOffer(null);
                            }}
                            style={{
                              padding:'12px 0', borderRadius:14,
                              background:'linear-gradient(135deg,#eab308,#a16207)',
                              color:'#000', border:'none', fontWeight:700, fontSize:14, cursor:'pointer',
                            }}
                          >👑 اشتري بالكامل — {clubOffer.fullPrice} جنيه</button>
                        )}
                        {clubOffer.canAffordHalf && (
                          <button
                            onClick={() => {
                              emit('bank_buy', { roomId: rid, playerId: pid, tileId: clubOffer.tileId, buyFull: false });
                              setClubOffer(null);
                            }}
                            style={{
                              padding:'12px 0', borderRadius:14,
                              background:'rgba(234,179,8,0.2)',
                              color:'#fbbf24', border:'1px solid rgba(234,179,8,0.4)',
                              fontWeight:700, fontSize:14, cursor:'pointer',
                            }}
                          >🤝 اشتري نص — {clubOffer.halfPrice} جنيه</button>
                        )}
                        {!clubOffer.canAffordFull && !clubOffer.canAffordHalf && (
                          <div style={{color:'#fca5a5',textAlign:'center',fontSize:13}}>ما معكش فلوس كافية!</div>
                        )}
                        <button onClick={() => setClubOffer(null)} style={{
                          padding:'10px 0', borderRadius:14,
                          background:'rgba(255,255,255,0.06)',
                          color:'rgba(255,255,255,0.5)',
                          border:'1px solid rgba(255,255,255,0.1)',
                          fontWeight:600, fontSize:13, cursor:'pointer',
                        }}>لا شكراً</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{color:'rgba(255,255,255,0.6)',fontSize:13,textAlign:'center'}}>
                        المالك: {clubOffer.ownerName}
                      </div>
                      <div style={{display:'flex',flexDirection:'column',gap:8,width:'100%'}}>
                        {clubOffer.canAffordHalf && (
                          <button
                            onClick={() => {
                              emit('bank_buy', { roomId: rid, playerId: pid, tileId: clubOffer.tileId, buyFull: false });
                              setClubOffer(null);
                            }}
                            style={{
                              padding:'12px 0', borderRadius:14,
                              background:'linear-gradient(135deg,#eab308,#a16207)',
                              color:'#000', border:'none', fontWeight:700, fontSize:14, cursor:'pointer',
                            }}
                          >🤝 انضم شريك — {clubOffer.halfPrice} جنيه</button>
                        )}
                        <button
                          onClick={() => {
                            emit('bank_pay_rent', { roomId: rid, playerId: pid, tileId: clubOffer.tileId });
                            setClubOffer(null);
                          }}
                          style={{
                            padding:'12px 0', borderRadius:14,
                            background:'rgba(239,68,68,0.2)',
                            color:'#fca5a5', border:'1px solid rgba(239,68,68,0.3)',
                            fontWeight:700, fontSize:14, cursor:'pointer',
                          }}
                        >💸 ادفع إيجار — {clubOffer.rent} جنيه</button>
                        <button onClick={() => setClubOffer(null)} style={{
                          padding:'10px 0', borderRadius:14,
                          background:'rgba(255,255,255,0.06)',
                          color:'rgba(255,255,255,0.5)',
                          border:'1px solid rgba(255,255,255,0.1)',
                          fontWeight:600, fontSize:13, cursor:'pointer',
                        }}>لاحقاً</button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* popup الكروت التفاعلية */}
        <AnimatePresence>
          {interactiveCard && (
            <>
              <motion.div key="ic-bg"
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                style={{position:'fixed',inset:0,zIndex:400,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(8px)'}}
              />
              <motion.div key="ic-popup"
                initial={{opacity:0,scale:0.85,y:30}}
                animate={{opacity:1,scale:1,y:0}}
                exit={{opacity:0,scale:0.9}}
                transition={{type:'spring',stiffness:300,damping:26}}
                style={{
                  position:'fixed',inset:0,zIndex:401,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  pointerEvents:'none',
                }}
              >
                <div style={{
                  pointerEvents:'auto',
                  background:'rgba(15,10,40,0.97)',
                  backdropFilter:'blur(24px)',
                  border:'1px solid rgba(255,255,255,0.15)',
                  borderRadius:24, padding:'24px 28px',
                  width:'100%', maxWidth:340,
                  display:'flex', flexDirection:'column', gap:14,
                  direction:'rtl',
                  boxShadow:'0 8px 40px rgba(0,0,0,0.5)',
                }}>
                  <div style={{color:'#fff',fontWeight:900,fontSize:17,textAlign:'center',lineHeight:1.5}}>
                    {interactiveCard.text}
                  </div>

                  {interactiveCard.type === 'choose_city_or_money' && (() => {
                    const available = gameState?.board?.filter(t =>
                      t.type === 'land' && t.owner === null && t.price <= interactiveCard.cityMaxPrice
                    ) || [];
                    return (
                      <div style={{display:'flex',flexDirection:'column',gap:8}}>
                        <div style={{color:'rgba(255,255,255,0.5)',fontSize:12,textAlign:'center'}}>
                          اختار مدينة مجاناً (سعرها ≤ {interactiveCard.cityMaxPrice} ج) أو خذ الفلوس
                        </div>
                        <div style={{maxHeight:180,overflowY:'auto',display:'flex',flexDirection:'column',gap:6}}>
                          {available.map(t => (
                            <button key={t.id} onClick={() => {
                              emit('bank_card_action', { roomId: rid, playerId: pid, action: 'take_city', data: { cityName: t.name } });
                              setInteractiveCard(null);
                            }} style={{
                              padding:'10px 14px',borderRadius:12,cursor:'pointer',
                              background:'rgba(99,102,241,0.2)',
                              border:'1px solid rgba(99,102,241,0.4)',
                              color:'#fff',fontWeight:700,fontSize:13,
                              display:'flex',justifyContent:'space-between',
                            }}>
                              <span>🏙️ {t.name}</span>
                              <span style={{color:'#a5b4fc'}}>{t.price} ج</span>
                            </button>
                          ))}
                          {available.length === 0 && (
                            <div style={{color:'rgba(255,255,255,0.4)',fontSize:12,textAlign:'center'}}>
                              مفيش مدن متاحة بالسعر ده
                            </div>
                          )}
                        </div>
                        <button onClick={() => {
                          emit('bank_card_action', { roomId: rid, playerId: pid, action: 'take_money', data: { amount: interactiveCard.amount } });
                          setInteractiveCard(null);
                        }} style={{
                          padding:'12px 0',borderRadius:14,cursor:'pointer',
                          background:'linear-gradient(135deg,#059669,#047857)',
                          color:'#fff',border:'none',fontWeight:700,fontSize:15,
                        }}>💰 خذ {interactiveCard.amount} جنيه من البنك</button>
                      </div>
                    );
                  })()}

                  {interactiveCard.type === 'choose_city_and_collect' && (
                    <div style={{display:'flex',flexDirection:'column',gap:8}}>
                      <div style={{color:'rgba(255,255,255,0.5)',fontSize:12,textAlign:'center'}}>
                        اختار مدينة تروح ليها وخذ {interactiveCard.amount} جنيه
                      </div>
                      {(interactiveCard.cities || []).map(cityName => (
                        <button key={cityName} onClick={() => {
                          emit('bank_card_action', { roomId: rid, playerId: pid, action: 'move_to_chosen_city', data: { cityName, amount: interactiveCard.amount } });
                          setInteractiveCard(null);
                        }} style={{
                          padding:'12px 14px',borderRadius:12,cursor:'pointer',
                          background:'rgba(99,102,241,0.2)',
                          border:'1px solid rgba(99,102,241,0.4)',
                          color:'#fff',fontWeight:700,fontSize:14,
                        }}>✈️ {cityName}</button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* شاشة المزاد */}
        <AnimatePresence>{auction && <AuctionScreen />}</AnimatePresence>
        <AuctionResultToast />

        {/* شاشة الرمية الأولية */}
        {initialPhase && <InitialRollScreen />}

        {/* شاشة الفوز */}
        <WinScreen />

        {/* مودال الإفلاس */}
        <BankruptModal />

        {/* توست الإشعارات */}
        <NotifToasts notifs={notifs} />

        {/* Popup ترتيب اللعب */}
        <AnimatePresence>
          {showTurnOrder && turnOrderData.length > 0 && (
            <>
              <motion.div
                key="to-bg"
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                style={{
                  position:'fixed', inset:0, zIndex:600,
                  background:'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.6), rgba(0,0,0,0.92))',
                  backdropFilter:'blur(8px)',
                }}
              />
              <motion.div
                key="to-wrap"
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                style={{
                  position:'fixed', inset:0, zIndex:601,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  padding:20, pointerEvents:'none',
                }}
              >
                <motion.div
                  initial={{scale:0.7, y:-40, opacity:0}}
                  animate={{scale:1, y:0, opacity:1}}
                  exit={{scale:0.9, y:-20, opacity:0}}
                  transition={{type:'spring', stiffness:240, damping:22}}
                  style={{
                    pointerEvents:'auto',
                    background:'linear-gradient(160deg, #1a0f08, #0a0705)',
                    border:'3px solid #d4af37',
                    borderRadius:24,
                    padding:'28px 32px',
                    width:'100%', maxWidth:380,
                    boxShadow:'0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(212,175,55,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
                    direction:'rtl',
                  }}
                >
                  <div style={{textAlign:'center', marginBottom:18}}>
                    <div style={{fontSize:52, marginBottom:8, filter:'drop-shadow(0 0 20px rgba(212,175,55,0.7))'}}>🎲</div>
                    <div style={{
                      color:'#f4d35e', fontWeight:900, fontSize:22, letterSpacing:1,
                      textShadow:'0 0 12px rgba(212,175,55,0.6)',
                    }}>ترتيب اللعب</div>
                    <div style={{color:'rgba(244,211,94,0.6)', fontSize:12, marginTop:4}}>
                      الأعلى رقم يبدأ أول
                    </div>
                  </div>

                  <div style={{display:'flex', flexDirection:'column', gap:8}}>
                    {turnOrderData.map((p, i) => (
                      <motion.div
                        key={p.id}
                        initial={{opacity:0, x:-20}}
                        animate={{opacity:1, x:0}}
                        transition={{delay:0.15 + i*0.08, type:'spring', stiffness:280}}
                        style={{
                          display:'flex', alignItems:'center', justifyContent:'space-between',
                          background: i === 0
                            ? 'linear-gradient(145deg, rgba(212,175,55,0.28), rgba(212,175,55,0.08))'
                            : 'rgba(255,255,255,0.04)',
                          border: `1.5px solid ${i === 0 ? '#d4af37' : 'rgba(255,255,255,0.08)'}`,
                          borderRadius:14, padding:'10px 16px',
                          boxShadow: i === 0 ? '0 0 24px rgba(212,175,55,0.35)' : 'none',
                        }}
                      >
                        <div style={{display:'flex', alignItems:'center', gap:10}}>
                          <span style={{
                            width:28, height:28, borderRadius:'50%',
                            background: i === 0
                              ? 'linear-gradient(145deg, #f4d35e, #d4af37)'
                              : 'rgba(255,255,255,0.06)',
                            color: i === 0 ? '#2a1810' : 'rgba(255,255,255,0.5)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontWeight:900, fontSize:13,
                            border: i === 0 ? '1px solid #fff5d6' : '1px solid rgba(255,255,255,0.1)',
                          }}>{i + 1}</span>
                          <span style={{
                            color: i === 0 ? '#f4d35e' : '#fff',
                            fontWeight:700, fontSize:15,
                          }}>{p.name}</span>
                          {i === 0 && <span style={{fontSize:16}}>👑</span>}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.8}}
                    whileHover={{scale:1.03}} whileTap={{scale:0.97}}
                    onClick={() => setShowTurnOrder(false)}
                    style={{
                      marginTop:20, width:'100%',
                      background:'linear-gradient(145deg, #f4d35e, #d4af37)',
                      border:'2px solid #fff5d6',
                      color:'#2a1810',
                      padding:'12px 0', borderRadius:14,
                      fontWeight:900, fontSize:15, cursor:'pointer',
                      boxShadow:'0 8px 24px rgba(212,175,55,0.5), inset 0 1px 0 rgba(255,255,255,0.5)',
                      textShadow:'0 1px 0 rgba(255,255,255,0.4)',
                    }}
                  >يلا نبدأ! ⚔️</motion.button>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Popup طلب الدفع */}
        <AnimatePresence>
          {paymentRequest && (
            <>
              <motion.div
                key="pay-req-bg"
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                style={{
                  position:'fixed', inset:0, zIndex:700,
                  background:'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.6), rgba(0,0,0,0.92))',
                  backdropFilter:'blur(8px)',
                }}
              />
              <motion.div
                key="pay-req-wrap"
                initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                style={{
                  position:'fixed', inset:0, zIndex:701,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  padding:20, pointerEvents:'none',
                }}
              >
                <motion.div
                  initial={{scale:0.75, y:-30, opacity:0}}
                  animate={{scale:1, y:0, opacity:1}}
                  exit={{scale:0.85, y:-20, opacity:0}}
                  transition={{type:'spring', stiffness:240, damping:22}}
                  style={{
                    pointerEvents:'auto',
                    background:'linear-gradient(160deg, #1a0f08, #0a0705)',
                    border:'3px solid #dc2626',
                    borderRadius:24,
                    padding:'28px 32px',
                    width:'100%', maxWidth:360,
                    boxShadow:'0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(220,38,38,0.25)',
                    direction:'rtl',
                    textAlign:'center',
                  }}
                >
                  <div style={{fontSize:52, marginBottom:8, filter:'drop-shadow(0 0 20px rgba(220,38,38,0.7))'}}>💸</div>
                  <div style={{
                    color:'#fca5a5', fontWeight:900, fontSize:20, marginBottom:6,
                    textShadow:'0 0 12px rgba(220,38,38,0.5)',
                  }}>مطلوب منك دفع</div>
                  <div style={{
                    color:'rgba(255,255,255,0.75)', fontSize:13, marginBottom:18,
                    lineHeight:1.7,
                  }}>
                    {paymentRequest.reason}
                  </div>
                  <div style={{
                    background:'linear-gradient(145deg, rgba(220,38,38,0.2), rgba(220,38,38,0.05))',
                    border:'1.5px solid rgba(220,38,38,0.4)',
                    borderRadius:16, padding:'16px 0',
                    marginBottom:20,
                  }}>
                    <div style={{color:'rgba(255,255,255,0.5)', fontSize:11, marginBottom:4}}>المبلغ</div>
                    <div style={{
                      color:'#fca5a5', fontWeight:900, fontSize:32,
                      textShadow:'0 0 16px rgba(220,38,38,0.6)',
                    }}>{paymentRequest.amount} ج</div>
                    <div style={{color:'rgba(255,255,255,0.6)', fontSize:12, marginTop:4}}>
                      لـ <span style={{color:'#f4d35e', fontWeight:700}}>{paymentRequest.toName}</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{scale:1.03}} whileTap={{scale:0.96}}
                    onClick={handlePaymentConfirm}
                    style={{
                      width:'100%',
                      background:'linear-gradient(145deg, #dc2626, #991b1b)',
                      border:'2px solid #fca5a5',
                      color:'#fff',
                      padding:'14px 0', borderRadius:14,
                      fontWeight:900, fontSize:16, cursor:'pointer',
                      boxShadow:'0 8px 24px rgba(220,38,38,0.5), inset 0 1px 0 rgba(255,255,255,0.25)',
                      textShadow:'0 1px 2px rgba(0,0,0,0.5)',
                    }}
                  >💸 ادفع</motion.button>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default BankElHazGame;