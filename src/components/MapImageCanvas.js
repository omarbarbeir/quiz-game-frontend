// components/MapImageCanvas.jsx
import React, { useMemo } from 'react';
import { MAP_W, MAP_H, MAP_REGIONS, REALM_LABELS } from '../data/mapData';
import { SOK_REALMS } from '../data/swordData';
import SoldierIcon from './SoldierIcon';

// صورة البارشمنت — حطها في public/maps/world_bg.png
const BG_IMAGE = '/maps/world_bg.png';

/**
 * الخريطة الجديدة — صورة بارشمنت + SVG overlay
 */
const MapImageCanvas = ({
  gameState, players, playerId, myTurn, phase,
  onClaim, onAttackHub, onAttackBase, canAttackBaseFn,
}) => {
  const ownership = gameState.ownership;

  const getColor = (pid) => players.find(p => p.id === pid)?.color || '#6b7280';

  // كل مملكة: نشوف هل مرسومة كلها للاعب واحد؟
  const realmStatus = useMemo(() => {
    const out = {};
    SOK_REALMS.forEach(realm => {
      const baseOwner = ownership[realm.id]?.[realm.regions[0].id];
      const allOwned = realm.regions.every(r => ownership[realm.id]?.[r.id] === baseOwner);
      out[realm.id] = { baseOwner, allOwned };
    });
    return out;
  }, [ownership]);

  return (
    <div className="relative w-full h-full">
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* ═══ خلفية البارشمنت ═══ */}
        <image
          href={BG_IMAGE}
          x="0"
          y="0"
          width={MAP_W}
          height={MAP_H}
          preserveAspectRatio="xMidYMid slice"
        />

        {/* ═══ طبقة الـ Overlay — مسارات المناطق ═══ */}
        {Object.entries(MAP_REGIONS).map(([regionId, region]) => {
          // نشوف المنطقة تبع أي مملكة
          const realm = SOK_REALMS.find(r =>
            r.regions.some(rr => rr.id === regionId)
          );
          if (!realm) return null;

          const owner = ownership[realm.id]?.[regionId];
          const ownerColor = owner ? getColor(owner) : null;

          // هل اللاعب يقدر يتفاعل مع المنطقة دي؟
          const isBase = regionId === realm.regions[0].id;
          const myRealm = gameState.playerRealms?.[playerId];
          const canClaimThis = phase === 'claiming'
            && !owner
            && myRealm === realm.id;
          const canAttackHubThis = phase === 'attacking'
            && myTurn
            && owner
            && owner !== playerId
            && !isBase;
          const canAttackBaseThis = phase === 'attacking'
            && myTurn
            && isBase
            && owner
            && owner !== playerId
            && canAttackBaseFn(realm.id);

          const interactive = canClaimThis || canAttackHubThis || canAttackBaseThis;

          // لون الـ fill
          let fill = 'transparent';
          let fillOpacity = 0;
          if (owner) {
            fill = ownerColor;
            fillOpacity = isBase ? 0.75 : 0.55;
          } else if (canClaimThis) {
            fill = '#10b981';
            fillOpacity = 0.18;
          }

          return (
            <g key={regionId}>
              {/* مسار المنطقة */}
              <path
                d={region.d}
                fill={fill}
                fillOpacity={fillOpacity}
                stroke={
                  interactive
                    ? (canAttackHubThis || canAttackBaseThis ? '#ef4444' : '#10b981')
                    : (owner ? 'rgba(212,175,55,0.7)' : 'rgba(212,175,55,0.25)')
                }
                strokeWidth={interactive ? 2.5 : 1}
                strokeLinejoin="round"
                style={{
                  cursor: interactive ? 'pointer' : 'default',
                  transition: 'fill 0.5s ease, fill-opacity 0.5s ease',
                  filter: interactive ? 'drop-shadow(0 0 6px rgba(255,255,255,0.5))' : 'none',
                }}
                onClick={() => {
                  if (canClaimThis) onClaim(realm.id, regionId);
                  else if (canAttackHubThis) onAttackHub(realm.id, regionId);
                  else if (canAttackBaseThis) onAttackBase(realm.id);
                }}
              >
                {interactive && (
                  <animate
                    attributeName="stroke-opacity"
                    values="1;0.4;1"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                )}
              </path>

              {/* ═══ الجندي فوق المنطقة ═══ */}
              {owner && (
                <foreignObject
                  x={region.cx - 20}
                  y={region.cy - 20}
                  width="40"
                  height="40"
                  pointerEvents="none"
                  style={{
                    animation: 'sokSoldierDrop 0.5s ease-out both',
                  }}
                >
                  <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SoldierIcon color={ownerColor} size={36} animate={true} />
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}

        {/* ═══ أسماء الممالك ═══ */}
        {Object.entries(REALM_LABELS).map(([realmId, label]) => (
          <g key={realmId} pointerEvents="none">
            <text
              x={label.cx}
              y={label.cy}
              textAnchor="middle"
              fontSize="14"
              fontWeight="800"
              fill="#f4e5a1"
              style={{
                paintOrder: 'stroke',
                stroke: '#000',
                strokeWidth: 3,
                letterSpacing: '0.05em',
              }}
            >
              {label.text}
            </text>
          </g>
        ))}
      </svg>

      {/* ═══ CSS للحركات ═══ */}
      <style>{`
        @keyframes sokSoldierDrop {
          0%   { transform: translateY(-30px) scale(0.3); opacity: 0; }
          60%  { transform: translateY(3px) scale(1.1); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MapImageCanvas;