import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { GOLD, GLASS } from '../theme/goldenNoir';

/* fallback لو الفئة مش عندها ألوان */
const FALLBACK_COLOR = [GOLD.primary, GOLD.deep];

const getColors = (item) => {
  if (Array.isArray(item?.colors) && item.colors.length >= 2) return item.colors;
  return FALLBACK_COLOR;
};

/* ─── glass button صغير (يستخدم لـ الفئات الفرعية) ─── */
const GlassChip = ({ label, isSelected, onClick, colors }) => {
  const [c1, c2] = colors;
  return (
    <button
      onClick={onClick}
      className="py-3 px-4 rounded-xl text-center transition-all duration-300 font-bold text-sm relative overflow-hidden"
      style={{
        background: isSelected
          ? `linear-gradient(145deg, ${c1}38 0%, ${c1}18 35%, ${c2}22 70%, ${c1}28 100%)`
          : 'rgba(0,0,0,0.35)',
        backdropFilter: isSelected ? 'blur(28px) saturate(200%)' : 'blur(10px)',
        WebkitBackdropFilter: isSelected ? 'blur(28px) saturate(200%)' : 'blur(10px)',
        border: isSelected ? `1.5px solid ${c1}` : `1px solid ${GOLD.borderSoft}`,
        color: isSelected ? '#fff' : GOLD.textDim,
        boxShadow: isSelected
          ? `
              inset 0 1px 0 rgba(255,255,255,0.30),
              inset 0 -1px 0 rgba(0,0,0,0.25),
              0 0 24px ${c1}50
            `
          : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = GOLD.border;
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.borderColor = GOLD.borderSoft;
      }}
    >
      <span className="relative z-10">{label}</span>
    </button>
  );
};

/* ─── glass card كبير للفئة الرئيسية ─── */
const GlassCategoryCard = ({ cat, isSelected, isHovered, onEnter, onLeave, onClick }) => {
  const [c1, c2] = getColors(cat);
  const showColor = isSelected || isHovered;

  return (
    <button
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="py-4 px-3 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group"
      style={{
        /* ═══ Liquid Glass Background ═══ */
        background: showColor
          ? `linear-gradient(145deg, ${c1}38 0%, ${c1}18 35%, ${c2}22 70%, ${c1}28 100%)`
          : `linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 50%, rgba(0,0,0,0.25) 100%)`,

        backdropFilter: showColor ? 'blur(28px) saturate(200%)' : 'blur(10px) saturate(140%)',
        WebkitBackdropFilter: showColor ? 'blur(28px) saturate(200%)' : 'blur(10px) saturate(140%)',

        border: isSelected
          ? `1.5px solid ${c1}`
          : isHovered
            ? `1.5px solid ${c1}90`
            : `1px solid rgba(212,175,55,0.12)`,

        boxShadow: showColor
          ? `
              inset 0 1px 0 rgba(255,255,255,0.30),
              inset 0 -1px 0 rgba(0,0,0,0.25),
              inset 0 0 32px ${c1}20,
              inset 0 -12px 24px ${c2}30,
              0 8px 32px -8px ${c1}90,
              0 0 48px ${c1}40
            `
          : `
              inset 0 1px 0 rgba(255,255,255,0.06),
              inset 0 -1px 0 rgba(0,0,0,0.20),
              0 4px 12px rgba(0,0,0,0.30)
            `,

        transform: isSelected
          ? 'scale(1.04) translateY(-2px)'
          : isHovered
            ? 'translateY(-4px) scale(1.02)'
            : 'scale(1)',
      }}
    >
      {/* 1. لمعة diagonal */}
      {showColor && (
        <span
          className="pointer-events-none absolute"
          style={{
            top: '-50%', left: '-50%',
            width: '200%', height: '200%',
            background: `linear-gradient(135deg,
              rgba(255,255,255,0.28) 0%,
              rgba(255,255,255,0.08) 20%,
              transparent 45%)`,
            transform: 'rotate(25deg)',
            filter: 'blur(3px)',
          }}
        />
      )}

      {/* 2. خط لامع علوي */}
      {showColor && (
        <span
          className="pointer-events-none absolute inset-x-3 top-0"
          style={{
            height: '1.5px',
            background: `linear-gradient(90deg,
              transparent 0%,
              ${c1} 20%,
              rgba(255,255,255,0.9) 50%,
              ${c1} 80%,
              transparent 100%)`,
            opacity: 0.9,
            filter: 'blur(0.5px)',
          }}
        />
      )}

      {/* 3. Radial highlight من فوق */}
      {showColor && (
        <span
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background: `radial-gradient(ellipse at 50% -10%,
              rgba(255,255,255,0.22) 0%,
              transparent 55%)`,
          }}
        />
      )}

      {/* 4. Inner glow بلون اللعبة */}
      {showColor && (
        <span
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background: `radial-gradient(circle at 50% 100%,
              ${c2}40 0%,
              transparent 65%)`,
          }}
        />
      )}

      {/* 5. Bottom shadow داخلية */}
      {showColor && (
        <span
          className="pointer-events-none absolute inset-x-2 bottom-0"
          style={{
            height: '40%',
            background: `linear-gradient(0deg, ${c2}25 0%, transparent 100%)`,
            borderRadius: '0 0 12px 12px',
          }}
        />
      )}

      {/* الأيقونة */}
      <span
        className="text-2xl relative z-10 transition-transform duration-300"
        style={{
          filter: showColor
            ? `drop-shadow(0 0 14px ${c1}) drop-shadow(0 0 28px ${c1}80)`
            : 'none',
          transform: isHovered ? 'scale(1.15)' : 'scale(1)',
        }}
      >
        {cat.icon}
      </span>

      {/* الاسم */}
      <span
        className="text-xs font-black tracking-wide relative z-10 transition-all duration-300"
        style={{
          color: isSelected ? '#fff' : isHovered ? '#fff' : GOLD.textDim,
          textShadow: showColor ? `0 0 12px ${c1}` : 'none',
        }}
      >
        {cat.name}
      </span>
    </button>
  );
};

/* ═════════════════════════════════════════════════════ */
const CategorySelector = ({
  categories,
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory,
  isAdmin,
}) => {
  const [hoveredCat, setHoveredCat] = useState(null);
  const selectedMainCat = categories.find((cat) => cat.id === selectedCategory);

  return (
    <div
      className="rounded-2xl p-4 relative overflow-hidden"
      style={{
        ...GLASS,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <span
        className="pointer-events-none absolute inset-x-6 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${GOLD.light}60, transparent)` }}
      />

      {selectedMainCat ? (
        /* ═══ الفئات الفرعية ═══ */
        <>
          <button
            onClick={() => { onSelectCategory(null); onSelectSubcategory(null); }}
            className="flex items-center gap-2 mb-4 text-xs font-bold tracking-widest transition-colors"
            style={{ color: GOLD.textDim }}
            onMouseEnter={(e) => { e.currentTarget.style.color = GOLD.light; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = GOLD.textDim; }}
          >
            <FaArrowLeft /> العودة للفئات الرئيسية
          </button>

          <h2 className="text-lg font-black mb-4" style={{ color: GOLD.light }}>
            {selectedMainCat.name}
            <span className="text-xs font-normal mr-2" style={{ color: GOLD.textMuted }}>
              (اختر فئة فرعية)
            </span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {selectedMainCat.subcategories.map((sub) => {
              const isSelected = selectedSubcategory === sub.id;
              const subColors = getColors(sub).length === 2 ? getColors(sub) : getColors(selectedMainCat);
              return (
                <GlassChip
                  key={sub.id}
                  label={sub.name}
                  isSelected={isSelected}
                  onClick={() => onSelectSubcategory(sub.id)}
                  colors={subColors}
                />
              );
            })}
          </div>
        </>
      ) : (
        /* ═══ الفئات الرئيسية ═══ */
        <>
          <h2 className="text-lg font-black mb-4" style={{ color: GOLD.light }}>
            {isAdmin ? 'اختر فئة المسابقة' : 'الفئات'}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <GlassCategoryCard
                key={cat.id}
                cat={cat}
                isSelected={selectedCategory === cat.id}
                isHovered={hoveredCat === cat.id}
                onEnter={() => setHoveredCat(cat.id)}
                onLeave={() => setHoveredCat(null)}
                onClick={() => { onSelectCategory(cat.id); onSelectSubcategory(null); }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CategorySelector;