// components/PlayingCard.jsx
import React from 'react';

export const CARD_THEMES = {
  actor: {
    bg: 'linear-gradient(160deg, #0f1b2e 0%, #24466e 50%, #0d1825 100%)',
    border: '#c9a876', accent: '#f5d896', glow: 'rgba(201,168,118,0.4)',
    label: 'ممثل', icon: '🎭',
  },
  movie: {
    bg: 'linear-gradient(160deg, #2a0808 0%, #8b1f1f 50%, #1c0303 100%)',
    border: '#c9a876', accent: '#ffd9a0', glow: 'rgba(220,120,120,0.4)',
    label: 'فيلم', icon: '🎬',
  },
  joker: {
    bg: 'linear-gradient(160deg, #071e42 0%, #2349bd 50%, #0a1230 100%)',
    border: '#60a5fa', accent: '#93c5fd', glow: 'rgba(96,165,250,0.5)',
    label: 'جوكر', icon: '🃏',
  },
  skip: {
    bg: 'linear-gradient(160deg, #430a0a 0%, #c41f1f 50%, #1c0404 100%)',
    border: '#f87171', accent: '#fca5a5', glow: 'rgba(248,113,113,0.5)',
    label: 'تخطي', icon: '🚫',
  },
  shake: {
    bg: 'linear-gradient(160deg, #431f05 0%, #d4650c 50%, #1c0e02 100%)',
    border: '#fbbf24', accent: '#fde68a', glow: 'rgba(251,191,36,0.5)',
    label: 'نفض نفسك', icon: '💫',
  },
  exchange: {
    bg: 'linear-gradient(160deg, #052e2b 0%, #0fa393 50%, #042a27 100%)',
    border: '#5eead4', accent: '#99f6e4', glow: 'rgba(94,234,212,0.5)',
    label: 'هات و خد', icon: '🔄',
  },
  collective_exchange: {
    bg: 'linear-gradient(160deg, #2e0a2e 0%, #d029e5 50%, #1a0520 100%)',
    border: '#f0abfc', accent: '#fae8ff', glow: 'rgba(240,171,252,0.5)',
    label: 'الكل يطلع', icon: '👥',
  },
};

export const getTheme = (card) => {
  if (!card) return CARD_THEMES.actor;
  if (card.type === 'action') return CARD_THEMES[card.subtype] || CARD_THEMES.joker;
  return CARD_THEMES[card.type] || CARD_THEMES.actor;
};

const SIZES = {
  xs: { w: 72,  h: 108, radius: 10, fontSize: 9,  nameSize: 9  },
  sm: { w: 94,  h: 141, radius: 12, fontSize: 10, nameSize: 10 },
  md: { w: 118, h: 177, radius: 14, fontSize: 11, nameSize: 11 },
  lg: { w: 148, h: 222, radius: 16, fontSize: 13, nameSize: 13 },
};

export default function PlayingCard({
  card,
  size = 'md',
  selected = false,
  elevated = false,
  onClick,
  onImageClick,
  draggable = false,
  onDragStart,
  className = '',
  style = {},
  children,
  compact = false,
}) {
  const theme = getTheme(card);
  const s = SIZES[size];
  const isAction = card?.type === 'action';

  // ✅ حساب scale على الموبايل
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const mobileScale = isMobile ? 0.85 : 1;

  const finalW = s.w * mobileScale;
  const finalH = s.h * mobileScale;
  const padding = 6 * mobileScale;
  const cornerOffset = 4 * mobileScale;
  const typeFontSize = Math.max(6, s.fontSize - 2) * mobileScale;
  const nameFontSize = s.nameSize * mobileScale;
  const iconFontSize = s.fontSize * mobileScale;
  const emptyIconFontSize = (s.fontSize + 10) * mobileScale;
  const frameInset = 2.5 * mobileScale;
  const frameRadius = (s.radius - 3) * mobileScale;

  return (
    <div
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      className={`relative select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        width: finalW,
        height: finalH,
        borderRadius: s.radius,
        background: theme.bg,
        border: `1.5px solid ${theme.border}`,
        boxShadow: selected
          ? `0 0 0 2.5px ${theme.accent}, 0 0 22px ${theme.glow}, 0 10px 22px rgba(0,0,0,0.55)`
          : elevated
            ? `0 0 14px ${theme.glow}, 0 10px 22px rgba(0,0,0,0.5)`
            : `0 3px 10px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)`,
        ...style,
      }}
    >
      {/* Border frame */}
      <div
        className="absolute pointer-events-none"
        style={{
          inset: frameInset,
          borderRadius: frameRadius,
          border: `1px solid ${theme.accent}22`,
        }}
      />

      {/* Action cards subtle glow */}
      {isAction && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: s.radius,
            background: `radial-gradient(circle at 50% 0%, ${theme.accent}22, transparent 50%)`,
          }}
        />
      )}

      {/* Corner icons */}
      <div
        className="absolute pointer-events-none z-10 flex flex-col items-center"
        style={{ top: cornerOffset, left: cornerOffset, color: theme.accent, fontSize: iconFontSize }}
      >
        <span style={{ lineHeight: 1 }}>{theme.icon}</span>
      </div>
      <div
        className="absolute pointer-events-none z-10 rotate-180 flex flex-col items-center"
        style={{ bottom: cornerOffset, right: cornerOffset, color: theme.accent, fontSize: iconFontSize }}
      >
        <span style={{ lineHeight: 1 }}>{theme.icon}</span>
      </div>

      {/* Content */}
      <div
        className="relative z-10 flex flex-col h-full"
        style={{ padding }}
      >
        {/* Type header */}
        <div
          className="text-center uppercase rounded"
          style={{
            color: theme.accent,
            background: `${theme.accent}15`,
            fontSize: typeFontSize,
            letterSpacing: '0.1em',
            padding: '2px 0',
          }}
        >
          {theme.label}
        </div>

        {/* Image */}
        {!compact && (
          <div
            className="relative w-full overflow-hidden rounded mt-1 flex-1"
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: `1px solid ${theme.accent}20`,
            }}
            onClick={onImageClick ? (e) => { e.stopPropagation(); onImageClick(card); } : undefined}
          >
            {card.image ? (
              <img
                src={`${process.env.PUBLIC_URL}${card.image}`}
                alt={card.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center opacity-40"
                style={{ fontSize: emptyIconFontSize, color: theme.accent }}
              >
                {theme.icon}
              </div>
            )}
          </div>
        )}

        {/* Name */}
        <div
          className="font-bold text-center leading-tight mt-1 truncate"
          style={{ fontSize: nameFontSize, color: theme.accent }}
          title={card.name}
        >
          {card.name}
        </div>

        {/* Extra content slot */}
        {children}
      </div>
    </div>
  );
}