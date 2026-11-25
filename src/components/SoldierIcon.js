// components/SoldierIcon.jsx
import React from 'react';

/**
 * جندي كارتوني متحرك
 * @param {string} color - لون الجندي
 * @param {number} size - الحجم بالبكسل
 * @param {boolean} animate - تشغيل الحركة
 */
const SoldierIcon = ({ color = '#ef4444', size = 40, animate = true }) => {
  const dark = shade(color, -40);
  const light = shade(color, 35);
  const skin = '#f5cba7';
  const skinDark = '#d4a373';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      style={{ overflow: 'visible', display: 'block' }}
    >
      <style>{`
        @keyframes sokSoldierIdle {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-1.5px); }
        }
        @keyframes sokFlagWave {
          0%, 100% { transform: skewX(0deg); }
          50%      { transform: skewX(-8deg); }
        }
        @keyframes sokSwordShine {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 1; }
        }
        .sok-sol-body {
          transform-origin: 30px 58px;
          animation: ${animate ? 'sokSoldierIdle 1.8s ease-in-out infinite' : 'none'};
        }
        .sok-sol-flag {
          transform-origin: 40px 12px;
          animation: ${animate ? 'sokFlagWave 1.3s ease-in-out infinite' : 'none'};
        }
        .sok-sol-shine {
          animation: ${animate ? 'sokSwordShine 1.5s ease-in-out infinite' : 'none'};
        }
      `}</style>

      <g className="sok-sol-body">
        {/* الظل */}
        <ellipse cx="30" cy="58" rx="12" ry="2.2" fill="rgba(0,0,0,0.35)" />

        {/* الرجلين */}
        <rect x="24" y="44" width="4.5" height="12" rx="2" fill={dark} />
        <rect x="31.5" y="44" width="4.5" height="12" rx="2" fill={dark} />
        <ellipse cx="26.25" cy="56" rx="3" ry="1.3" fill="#2a1a0a" />
        <ellipse cx="33.75" cy="56" rx="3" ry="1.3" fill="#2a1a0a" />

        {/* الجسم / الدرع الأساسي */}
        <path
          d="M 18 22 Q 18 20 22 20 L 38 20 Q 42 20 42 22 L 42 42 Q 30 46 18 42 Z"
          fill={color}
          stroke={dark}
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* تفاصيل الدرع */}
        <path
          d="M 30 24 L 38 28 L 36 38 L 30 42 L 24 38 L 22 28 Z"
          fill={light}
          opacity="0.9"
          stroke={dark}
          strokeWidth="0.5"
        />
        <path
          d="M 30 28 L 34 30 L 33 36 L 30 38 L 27 36 L 26 30 Z"
          fill="#fff"
          opacity="0.55"
        />

        {/* حزام */}
        <rect x="18" y="38" width="24" height="3" fill={dark} />
        <circle cx="30" cy="39.5" r="1.5" fill="#d4af37" />

        {/* الرأس */}
        <circle cx="30" cy="14" r="8" fill={skin} stroke={skinDark} strokeWidth="0.6" />

        {/* العيون */}
        <circle cx="27" cy="13.5" r="1.2" fill="#1a1a1a" />
        <circle cx="33" cy="13.5" r="1.2" fill="#1a1a1a" />
        <circle cx="27.3" cy="13.2" r="0.4" fill="#fff" />
        <circle cx="33.3" cy="13.2" r="0.4" fill="#fff" />

        {/* الخدود */}
        <circle cx="24.5" cy="16" r="1.3" fill="#e8a9a0" opacity="0.7" />
        <circle cx="35.5" cy="16" r="1.3" fill="#e8a9a0" opacity="0.7" />

        {/* الابتسامة */}
        <path d="M 27 17.5 Q 30 19.5 33 17.5" stroke="#5a2a1a" strokeWidth="0.9" fill="none" strokeLinecap="round" />

        {/* الخوذة */}
        <path
          d="M 21.5 11 Q 21.5 4.5 30 4.5 Q 38.5 4.5 38.5 11 L 38.5 12 L 21.5 12 Z"
          fill={color}
          stroke={dark}
          strokeWidth="1"
        />
        <rect x="20" y="11" width="20" height="2" rx="1" fill={dark} />
        {/* شعار على الخوذة */}
        <path d="M 30 6 L 32 8.5 L 30 10.5 L 28 8.5 Z" fill="#d4af37" />

        {/* الذراع اليمنى + السيف */}
        <g>
          <rect x="40" y="24" width="3.5" height="9" rx="1.5" fill={skin} />
          {/* السيف */}
          <rect x="42.5" y="10" width="2.5" height="18" fill="#e0e0e0" stroke="#888" strokeWidth="0.4" />
          <path d="M 42.5 10 L 43.75 6 L 45 10 Z" fill="#f0f0f0" stroke="#888" strokeWidth="0.4" />
          <rect x="40.5" y="26" width="6.5" height="2" fill="#d4af37" stroke="#8b6914" strokeWidth="0.3" />
          <rect x="43" y="28" width="1.5" height="3" fill="#6b3d0f" />
          {/* لمعة السيف */}
          <rect className="sok-sol-shine" x="43.2" y="11" width="0.7" height="16" fill="#fff" opacity="0.6" />
        </g>

        {/* الذراع اليسرى + العلم */}
        <rect x="16.5" y="24" width="3.5" height="9" rx="1.5" fill={skin} />
        <g className="sok-sol-flag">
          <line x1="18" y1="26" x2="18" y2="6" stroke="#5c3a1a" strokeWidth="1" />
          <path
            d="M 18 6 L 28 8 L 18 11 Z"
            fill={light}
            stroke={dark}
            strokeWidth="0.6"
          />
        </g>
      </g>
    </svg>
  );
};

// تفتيح/تغميق اللون
function shade(hex, percent) {
  if (!hex || typeof hex !== 'string') return hex;
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const num = parseInt(h, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, r + percent));
  g = Math.max(0, Math.min(255, g + percent));
  b = Math.max(0, Math.min(255, b + percent));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

export default SoldierIcon;