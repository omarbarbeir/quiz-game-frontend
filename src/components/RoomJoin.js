import React, { useState } from 'react';
import { GOLD, BG_GRADIENT, GLASS, BTN_PRIMARY, BTN_OUTLINE } from '../theme/goldenNoir';

const RoomJoin = ({ onCreateRoom, onJoinRoom }) => {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleCreate = () => {
    if (playerName.trim()) onCreateRoom(playerName.trim());
  };

  const handleJoin = () => {
    if (roomCode && playerName) onJoinRoom(roomCode, playerName);
  };

  const canCreate = !!playerName.trim();
  const canJoin = !!roomCode && !!playerName.trim();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: BG_GRADIENT }}
    >
      {/* هالة ذهبية علوية */}
      <div
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2"
        style={{
          width: '70vw', height: '50vh',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.14) 0%, transparent 65%)',
          filter: 'blur(50px)',
        }}
      />

      <div className="relative w-full max-w-md">

        {/* كارت الـ Glass */}
        <div
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{
            ...GLASS,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* خط ذهبي علوي */}
          <span
            className="pointer-events-none absolute inset-x-8 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${GOLD.light}80, transparent)` }}
          />

          {/* تاج */}
          <div className="text-center mb-2">
            <div style={{ fontSize: 42, filter: 'drop-shadow(0 0 20px rgba(212,175,55,0.6))' }}>👑</div>
          </div>

          {/* العنوان */}
          <h2 className="text-3xl font-black text-center mb-2 tracking-wide">
            <span
              style={{
                background: `linear-gradient(135deg, ${GOLD.light} 0%, ${GOLD.primary} 50%, ${GOLD.deep} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 2px 8px rgba(212,175,55,0.4))',
              }}
            >
              انضم للمسابقة
            </span>
          </h2>

          <p
            className="text-center text-xs tracking-[0.3em] uppercase mb-8"
            style={{ color: GOLD.textMuted }}
          >
            Golden Noir
          </p>

          {/* الاسم */}
          <div className="mb-6">
            <label
              className="block text-[10px] font-bold tracking-[0.25em] uppercase mb-2 text-right"
              style={{ color: GOLD.textMuted }}
            >
              اسمك
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="ادخل اسمك"
              dir="rtl"
              className="w-full rounded-xl px-4 py-3 text-right outline-none transition-all duration-200"
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${GOLD.borderSoft}`,
                color: GOLD.text,
                fontSize: 15,
              }}
              onFocus={(e) => { e.target.style.borderColor = GOLD.primary; e.target.style.boxShadow = `0 0 0 3px rgba(212,175,55,0.15)`; }}
              onBlur={(e) => { e.target.style.borderColor = GOLD.borderSoft; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* زر إنشاء غرفة */}
          <button
            onClick={handleCreate}
            disabled={!canCreate}
            className="w-full py-4 rounded-xl font-black text-base mb-6 transition-all duration-200"
            style={{
              ...(canCreate ? BTN_PRIMARY : {
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${GOLD.borderFaint}`,
                color: GOLD.textMuted,
                cursor: 'not-allowed',
              }),
            }}
            onMouseEnter={(e) => { if (canCreate) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { if (canCreate) e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            👑 إنشاء غرفة جديدة (أدمن)
          </button>

          {/* فاصل */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.borderSoft}, transparent)` }} />
            <span className="text-xs tracking-widest" style={{ color: GOLD.textMuted }}>أو</span>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD.borderSoft}, transparent)` }} />
          </div>

          {/* رمز الغرفة */}
          <div className="mb-4">
            <label
              className="block text-[10px] font-bold tracking-[0.25em] uppercase mb-2 text-right"
              style={{ color: GOLD.textMuted }}
            >
              رمز الغرفة
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ABCD"
              maxLength={6}
              dir="rtl"
              className="w-full rounded-xl px-4 py-3 text-right outline-none transition-all duration-200 tracking-[0.4em] font-mono"
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${GOLD.borderSoft}`,
                color: GOLD.text,
                fontSize: 18,
                fontWeight: 900,
              }}
              onFocus={(e) => { e.target.style.borderColor = GOLD.primary; e.target.style.boxShadow = `0 0 0 3px rgba(212,175,55,0.15)`; }}
              onBlur={(e) => { e.target.style.borderColor = GOLD.borderSoft; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* زر الانضمام */}
          <button
            onClick={handleJoin}
            disabled={!canJoin}
            className="w-full py-4 rounded-xl font-black text-base transition-all duration-200"
            style={{
              ...(canJoin ? {
                background: 'rgba(212,175,55,0.08)',
                border: `1px solid ${GOLD.primary}`,
                color: GOLD.light,
                boxShadow: `0 0 20px rgba(212,175,55,0.20)`,
              } : {
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${GOLD.borderFaint}`,
                color: GOLD.textMuted,
                cursor: 'not-allowed',
              }),
            }}
            onMouseEnter={(e) => { if (canJoin) { e.currentTarget.style.background = 'rgba(212,175,55,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
            onMouseLeave={(e) => { if (canJoin) { e.currentTarget.style.background = 'rgba(212,175,55,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; } }}
          >
            انضم للغرفة
          </button>

          <p
            className="text-[10px] text-center mt-6 tracking-widest"
            style={{ color: GOLD.textMuted }}
          >
            أدخل رمز الغرفة المكون من ٤ حروف
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoomJoin;