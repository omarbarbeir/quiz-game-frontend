// src/theme/goldenNoir.js
export const GOLD = {
  primary:  '#d4af37',
  light:    '#f4d35e',
  deep:     '#8b6f47',
  cream:    '#f5f0e1',
  bg1:      '#0a0a0a',
  bg2:      '#1a1410',
  bg3:      '#251d16',
  border:      'rgba(212,175,55,0.35)',
  borderSoft:  'rgba(212,175,55,0.18)',
  borderFaint: 'rgba(212,175,55,0.08)',
  text:      '#f5f0e1',
  textDim:   'rgba(245,240,225,0.62)',
  textMuted: 'rgba(245,240,225,0.38)',
};

export const BG_GRADIENT = 'radial-gradient(ellipse at 50% 0%, #1a1410 0%, #0a0a0a 70%)';

export const GLASS = {
  background: 'linear-gradient(135deg, rgba(212,175,55,0.10), rgba(212,175,55,0.03))',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${GOLD.border}`,
};

export const BTN_PRIMARY = {
  background: 'linear-gradient(135deg, #d4af37, #8b6f47)',
  border: '1px solid #f4d35e',
  boxShadow: '0 0 24px rgba(212,175,55,0.35), inset 0 1px 0 rgba(255,255,255,0.18)',
  color: '#1a0f05',
};

export const BTN_OUTLINE = {
  background: 'rgba(212,175,55,0.05)',
  border: `1px solid ${GOLD.border}`,
  color: GOLD.light,
};