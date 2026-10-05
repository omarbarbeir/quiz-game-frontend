// components/BracketRound.jsx
// 🏆 دور الـ 16 – واجهة كاملة (Tournament Fullscreen + Gold/Emerald Theme)
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSignOutAlt, FaRedo, FaRandom, FaCrown, FaArrowLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

/* ==================== Animations ==================== */
const AnimCSS = `
@keyframes bkFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes bkScaleIn {
  0%   { transform: scale(0.88); opacity: 0; }
  100% { transform: scale(1);    opacity: 1; }
}
@keyframes bkCrownDrop {
  0%   { transform: translateY(-40px) scale(0.5); opacity: 0; }
  60%  { transform: translateY(6px) scale(1.15); opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
@keyframes bkShimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes bkPulseGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(251,191,36,0.35), inset 0 0 20px rgba(251,191,36,0.08); }
  50%      { box-shadow: 0 0 45px rgba(251,191,36,0.7), inset 0 0 30px rgba(251,191,36,0.15); }
}
@keyframes bkLineGrow {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
`;

const ROUND_NAMES = ['دور الـ 16', 'ربع النهائي', 'نصف النهائي', 'النهائي'];
const ROUND_ICONS = ['⚔️', '🔥', '⚡', '👑'];

/* ==================== Bracket Layout Math ==================== */
const BRACKET_BASE_SLOT = 150;   // طول كل ماتش في دور الـ 16
const BRACKET_CARD_H = 120;      // ارتفاع تقريبي للكارد
const BRACKET_TOTAL_H = 8 * BRACKET_BASE_SLOT;   // = 1200px

// موقع الماتش في كل دور بناءً على شجرة البطولة
function getMatchTop(roundIndex, matchIndex) {
  const slotH = BRACKET_BASE_SLOT * Math.pow(2, roundIndex);
  const centerY = (matchIndex + 0.5) * slotH;
  return centerY - BRACKET_CARD_H / 2;
}

/* ==================== Match Card ==================== */
const MatchCard = ({ match, roundIndex, matchIndex, isActive, hasVoted, onVote, myId }) => {
  const votes = match.votes || {};
  const v1 = votes[match.team1] || 0;
  const v2 = votes[match.team2] || 0;
  const totalVotes = v1 + v2;
  const pct1 = totalVotes > 0 ? (v1 / totalVotes) * 100 : 0;
  const pct2 = totalVotes > 0 ? (v2 / totalVotes) * 100 : 0;

  const w1 = match.winner === match.team1;
  const w2 = match.winner === match.team2;

  return (
    <div
      className="relative rounded-xl p-2.5 transition-all duration-300 h-full"
      style={{
        background: isActive
          ? 'linear-gradient(145deg, rgba(251,191,36,0.12), rgba(180,83,9,0.04))'
          : match.winner
            ? 'linear-gradient(145deg, rgba(16,185,129,0.08), rgba(5,150,105,0.03))'
            : 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.15))',
        backdropFilter: 'blur(14px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.4)',
        border: isActive
          ? '1.5px solid rgba(251,191,36,0.6)'
          : match.winner
            ? '1px solid rgba(16,185,129,0.45)'
            : '1px solid rgba(212,175,55,0.2)',
        boxShadow: isActive
          ? '0 0 24px rgba(251,191,36,0.35), inset 0 1px 1px rgba(255,255,255,0.12)'
          : '0 4px 12px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.05)',
        animation: isActive ? 'bkPulseGlow 2.5s ease-in-out infinite' : 'none',
      }}
    >
      {/* Team 1 */}
      <TeamRow
        name={match.team1}
        votes={v1}
        pct={pct1}
        isWinner={w1}
        isActive={isActive && !hasVoted}
        isLoser={match.winner && !w1}
        onVote={() => onVote(match.team1)}
        accent="amber"
      />

      {/* Divider */}
      <div className="flex items-center justify-center gap-2 my-1.5">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)' }} />
        <span className="text-[10px] font-black tracking-widest"
          style={{ color: 'rgba(251,191,36,0.6)', textShadow: '0 0 6px rgba(251,191,36,0.4)' }}>
          VS
        </span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)' }} />
      </div>

      {/* Team 2 */}
      <TeamRow
        name={match.team2}
        votes={v2}
        pct={pct2}
        isWinner={w2}
        isActive={isActive && !hasVoted}
        isLoser={match.winner && !w2}
        onVote={() => onVote(match.team2)}
        accent="emerald"
      />

      {/* Status */}
      {isActive && hasVoted && (
        <div className="mt-1.5 text-center text-[10px] font-black py-0.5 rounded-lg"
          style={{
            color: '#10b981',
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.4)',
          }}>
          ✓ تم التصويت
        </div>
      )}
    </div>
  );
};

const TeamRow = ({ name, votes, pct, isWinner, isActive, isLoser, onVote, accent }) => {
  const accents = {
    amber:   { rgb: '251,191,36', solid: '#fbbf24' },
    emerald: { rgb: '16,185,129', solid: '#10b981' },
  };
  const a = accents[accent];

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Background progress */}
      <div
        className="absolute inset-y-0 right-0 transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: isWinner
            ? 'linear-gradient(90deg, rgba(16,185,129,0.35), rgba(16,185,129,0.15))'
            : `linear-gradient(90deg, rgba(${a.rgb},0.25), rgba(${a.rgb},0.08))`,
        }}
      />

      <button
        onClick={isActive ? onVote : undefined}
        disabled={!isActive}
        className={`relative w-full flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg text-right transition-all ${
          isActive ? 'cursor-pointer hover:scale-[1.02]' : 'cursor-default'
        }`}
        style={{
          background: isWinner
            ? 'linear-gradient(145deg, rgba(16,185,129,0.28), rgba(5,150,105,0.1))'
            : 'transparent',
          border: isWinner
            ? '1px solid rgba(16,185,129,0.55)'
            : '1px solid transparent',
          opacity: isLoser ? 0.45 : 1,
        }}
      >
        <span className="flex items-center gap-1.5 min-w-0">
          {isWinner && <FaCrown className="text-[10px] shrink-0" style={{ color: '#fbbf24' }} />}
          <span
            className="font-black text-xs truncate"
            style={{
              color: isWinner ? '#d1fae5' : '#fef3c7',
              textShadow: isWinner ? '0 0 8px rgba(16,185,129,0.8)' : '0 1px 2px rgba(0,0,0,0.6)',
            }}
          >
            {name}
          </span>
        </span>
        <span
          className="text-[10px] font-black shrink-0 px-1.5 py-0.5 rounded-md"
          style={{
            color: isWinner ? '#d1fae5' : `rgba(${a.rgb},1)`,
            background: isWinner ? 'rgba(16,185,129,0.35)' : 'rgba(0,0,0,0.35)',
            border: isWinner ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {votes}
        </span>
      </button>
    </div>
  );
};

/* ==================== Round Column ==================== */
const RoundColumn = ({
  round, roundIndex, currentRoundIndex, votedMatches, onVote,
}) => {
  const isCurrent = roundIndex === currentRoundIndex;
  const isPast = roundIndex < currentRoundIndex;
  const isEmpty = round.matches.length === 0;

  return (
    <div className="flex flex-col min-w-[210px] flex-1">
      {/* Round header — ثابت فوق */}
      <div className="text-center mb-3 shrink-0" style={{ height: 30 }}>
        <div
          className="inline-block px-3 py-1 rounded-lg text-[10px] font-black tracking-wider"
          style={{
            background: isCurrent
              ? 'linear-gradient(135deg, rgba(251,191,36,0.35), rgba(180,83,9,0.15))'
              : isPast
                ? 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.1))'
                : 'rgba(255,255,255,0.04)',
            color: isCurrent ? '#fbbf24' : isPast ? '#10b981' : '#8a7653',
            border: isCurrent
              ? '1px solid rgba(251,191,36,0.55)'
              : isPast
                ? '1px solid rgba(16,185,129,0.4)'
                : '1px solid rgba(255,255,255,0.06)',
            textShadow: isCurrent ? '0 0 8px rgba(251,191,36,0.6)' : 'none',
          }}
        >
          {ROUND_ICONS[roundIndex]} {ROUND_NAMES[roundIndex]}
        </div>
      </div>

      {/* Matches — absolute positioning على شجرة البطولة */}
      <div className="relative" style={{ height: BRACKET_TOTAL_H }}>
        {isEmpty ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[10px] italic" style={{ color: 'rgba(138,118,83,0.5)' }}>
              في انتظار الدور السابق
            </p>
          </div>
        ) : (
          round.matches.map((match, mi) => {
            const key = `${roundIndex}-${mi}`;
            const hasVoted = !!votedMatches[key];
            const top = getMatchTop(roundIndex, mi);
            return (
              <div
                key={mi}
                className="absolute left-0 right-0"
                style={{ top, height: BRACKET_CARD_H }}
              >
                <MatchCard
                  match={match}
                  roundIndex={roundIndex}
                  matchIndex={mi}
                  isActive={isCurrent && !match.winner}
                  hasVoted={hasVoted}
                  onVote={(choice) => onVote(roundIndex, mi, choice)}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

/* ==================== Inputs Section ==================== */
const InputsSection = ({ inputs, onInputChange, onRandomize, isAdmin }) => (
  <div className="max-w-3xl mx-auto w-full">
    <div
      className="rounded-2xl p-5 sm:p-6"
      style={{
        background: 'linear-gradient(145deg, rgba(251,191,36,0.08), rgba(10,7,5,0.5))',
        backdropFilter: 'blur(18px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
        border: '1.5px solid rgba(251,191,36,0.4)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.08)',
      }}
    >
      <div className="text-center mb-4">
        <h2
          className="text-2xl sm:text-3xl font-black mb-1"
          style={{
            background: 'linear-gradient(135deg, #fbbf24, #fef3c7, #b45309)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
          }}
        >
          🏆 اكتب أسماء المتنافسين
        </h2>
        <p className="text-xs" style={{ color: 'rgba(254,243,199,0.6)' }}>
          16 فريق · خليها فاضية لو عايز أسماء تلقائية
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {inputs.map((value, idx) => (
          <div key={idx} className="relative">
            <span
              className="absolute top-1 right-1.5 text-[9px] font-black px-1 rounded"
              style={{ color: 'rgba(251,191,36,0.7)', background: 'rgba(0,0,0,0.4)' }}
            >
              {idx + 1}
            </span>
            <input
              type="text"
              value={value}
              onChange={(e) => onInputChange(idx, e.target.value)}
              placeholder={`فريق ${idx + 1}`}
              dir="rtl"
              disabled={!isAdmin}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(0,0,0,0.25))',
                border: '1px solid rgba(212,175,55,0.28)',
                color: '#fef3c7',
              }}
            />
          </div>
        ))}
      </div>

      {isAdmin && (
        <button
          onClick={onRandomize}
          className="w-full py-3.5 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          style={{
            background: 'linear-gradient(135deg, #fbbf24, #b45309)',
            color: '#1a0f05',
            boxShadow: '0 10px 28px rgba(251,191,36,0.35), inset 0 1px 1px rgba(255,255,255,0.3)',
          }}
        >
          <FaRandom /> توزيع عشوائي وابدأ
        </button>
      )}
      {!isAdmin && (
        <p className="text-center text-sm" style={{ color: 'rgba(254,243,199,0.55)' }}>
          في انتظار المُيسّر لبدء الدورة...
        </p>
      )}
    </div>
  </div>
);

/* ==================== Winner Screen ==================== */
const WinnerScreen = ({ winner, isAdmin, onReset }) => {
  const confetti = useMemo(() =>
    Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
      color: ['#fbbf24', '#d97706', '#10b981', '#fef3c7', '#dc2626'][i % 5],
      size: 6 + Math.random() * 8,
      rotate: Math.random() * 360,
    }))
  , []);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes wkFall {
          0%   { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes wkCrownDrop {
          0%   { transform: translateY(-200px) scale(0.2) rotate(-180deg); opacity: 0; }
          60%  { transform: translateY(20px) scale(1.3) rotate(10deg); opacity: 1; }
          80%  { transform: translateY(-8px) scale(1.05) rotate(-5deg); }
          100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes wkNameReveal {
          0%   { transform: scale(0.3); opacity: 0; letter-spacing: 0.5em; filter: blur(10px); }
          60%  { transform: scale(1.15); opacity: 1; letter-spacing: 0.05em; filter: blur(0); }
          100% { transform: scale(1); opacity: 1; letter-spacing: 0.02em; }
        }
        @keyframes wkGlow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(251,191,36,0.6)); }
          50%      { filter: drop-shadow(0 0 60px rgba(251,191,36,1)); }
        }
        @keyframes wkRing {
          from { transform: scale(0.5) rotate(0deg); opacity: 1; }
          to   { transform: scale(2.5) rotate(360deg); opacity: 0; }
        }
        @keyframes wkFadeUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {confetti.map(c => (
        <div key={c.id}
          style={{
            position: 'absolute',
            top: 0,
            left: `${c.left}%`,
            width: c.size,
            height: c.size * 1.6,
            background: c.color,
            borderRadius: 2,
            animation: `wkFall ${c.duration}s linear ${c.delay}s infinite`,
            transform: `rotate(${c.rotate}deg)`,
            boxShadow: `0 0 10px ${c.color}80`,
            pointerEvents: 'none',
          }}
        />
      ))}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(251,191,36,0.25) 0%, transparent 55%)',
        }}
      />

      <div
        className="absolute"
        style={{
          width: 300, height: 300,
          border: '3px solid rgba(251,191,36,0.6)',
          borderRadius: '50%',
          animation: 'wkRing 2s ease-out infinite',
        }}
      />

      <div className="relative z-10 text-center max-w-2xl px-4">
        <div
          className="text-[140px] mb-2 select-none"
          style={{
            animation: 'wkCrownDrop 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) both, wkGlow 2.5s ease-in-out 1.2s infinite',
            filter: 'drop-shadow(0 8px 20px rgba(251,191,36,0.7))',
          }}
        >
          👑
        </div>

        <p
          className="text-xl sm:text-2xl font-black mb-3 tracking-widest"
          style={{
            color: 'rgba(254,243,199,0.75)',
            animation: 'wkFadeUp 0.6s ease-out 0.8s both',
            letterSpacing: '0.3em',
          }}
        >
          ⚔️ بطل دور الـ 16 ⚔️
        </p>

        <h2
          className="text-5xl sm:text-7xl font-black mb-6 leading-tight"
          style={{
            background: 'linear-gradient(135deg, #fbbf24 0%, #fef3c7 40%, #d97706 70%, #fbbf24 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'wkNameReveal 1s cubic-bezier(0.34, 1.56, 0.64, 1) 0.9s both, bkShimmer 3s linear 1.5s infinite',
            filter: 'drop-shadow(0 6px 24px rgba(251,191,36,0.6))',
          }}
        >
          {winner}
        </h2>

        {isAdmin && (
          <button
            onClick={onReset}
            className="px-8 py-4 rounded-2xl font-black text-base transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #fbbf24, #b45309)',
              color: '#1a0f05',
              boxShadow: '0 12px 36px rgba(251,191,36,0.5), inset 0 1px 1px rgba(255,255,255,0.35)',
              animation: 'wkFadeUp 0.7s ease-out 1.6s both',
            }}
          >
            <FaRedo className="inline mr-2" /> دورة جديدة
          </button>
        )}
      </div>
    </div>
  );
};

/* ==================== Main Component ==================== */
const BracketRound = ({ socket, roomCode, playerId, playerName, isAdmin, players, onExit }) => {
  const [gameState, setGameState] = useState(null);
  const [inputs, setInputs] = useState(Array(16).fill(''));
  const [votedMatches, setVotedMatches] = useState({});

  useEffect(() => {
    if (!socket || !roomCode) return;
    socket.emit('bracket_init', { roomCode });

    const onState = (state) => {
      setGameState(state);
    };

    socket.on('bracket_state', onState);
    return () => {
      socket.off('bracket_state', onState);
      socket.emit('bracket_cleanup', { roomCode });
    };
  }, [socket, roomCode]);

  const handleInputChange = useCallback((index, value) => {
    setInputs(prev => {
      const n = [...prev];
      n[index] = value;
      return n;
    });
  }, []);

  const randomize = () => {
    const names = inputs.map((n, i) => n.trim() || `فريق ${i + 1}`);
    socket.emit('bracket_randomize', { roomCode, names });
  };

  const resetBracket = () => {
    if (!window.confirm('إعادة تعيين الدورة؟')) return;
    socket.emit('bracket_reset', { roomCode });
    setInputs(Array(16).fill(''));
    setVotedMatches({});
  };

  const vote = (roundIndex, matchIndex, choice) => {
    const key = `${roundIndex}-${matchIndex}`;
    if (votedMatches[key]) return;
    socket.emit('bracket_vote', {
      roomCode, roundIndex, matchIndex, choice, playerId,
    });
    setVotedMatches(prev => ({ ...prev, [key]: true }));
  };

  const nextRound = () => {
    socket.emit('bracket_next_round', { roomCode });
  };

  // ===== Render: loading =====
  if (!gameState) {
    return (
      <>
        <style>{AnimCSS}</style>
        <div className="fixed inset-0 z-[900] flex items-center justify-center"
          style={{ background: 'radial-gradient(ellipse at 50% 30%, #1a0f05 0%, #0a0705 60%, #000 100%)' }}>
          <div className="text-center">
            <div className="text-6xl mb-3">🏆</div>
            <p className="font-black" style={{ color: '#fbbf24' }}>جاري تجهيز البطولة...</p>
          </div>
        </div>
      </>
    );
  }

  const { rounds, currentRoundIndex, winner } = gameState;
  const hasMatches = rounds[0]?.matches?.length > 0;
  const isFinished = currentRoundIndex >= 4;
  const currentRound = rounds[currentRoundIndex];
  const totalPlayers = players?.length || 0;
  const allMatchesVoted = currentRound?.matches?.length > 0 &&
    currentRound.matches.every(m =>
      m.winner || (m.voters && m.voters.length >= totalPlayers)
    );

  return (
    <>
      <style>{AnimCSS}</style>
      <div
        className="fixed inset-0 z-[900] flex flex-col text-white overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% -10%, #1f150c 0%, #150d08 40%, #0a0705 100%)',
        }}
      >
        {/* خلفية نقاط ذهبية */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.14]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(251,191,36,0.9) 1px, transparent 1px),
                              radial-gradient(circle, rgba(212,175,55,0.5) 1.5px, transparent 1.5px)`,
            backgroundSize: '48px 48px, 96px 96px',
            backgroundPosition: '0 0, 24px 24px',
          }}
        />

        {/* ===== Header ===== */}
        <header
          className="relative z-10 flex items-center justify-between px-3 py-2"
          style={{
            background: 'linear-gradient(90deg, rgba(15,8,6,0.95), rgba(31,21,12,0.7), rgba(15,8,6,0.95))',
            backdropFilter: 'blur(20px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
            borderBottom: '1px solid rgba(212,175,55,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl sm:text-2xl" style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.7))' }}>
              🏆
            </span>
            <h1
              className="font-extrabold text-sm sm:text-lg whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #fef3c7 45%, #b45309 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
              }}
            >
              دور الـ 16
            </h1>
            {hasMatches && !isFinished && (
              <span
                className="hidden sm:inline text-[10px] px-2 py-0.5 rounded-full font-black"
                style={{
                  background: 'rgba(251,191,36,0.15)',
                  color: '#fbbf24',
                  border: '1px solid rgba(251,191,36,0.4)',
                }}
              >
                {ROUND_NAMES[currentRoundIndex]}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {isAdmin && hasMatches && !isFinished && allMatchesVoted && (
              <button
                onClick={nextRound}
                className="px-4 h-10 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all hover:scale-[1.05]"
                style={{
                  background: currentRoundIndex === 3
                    ? 'linear-gradient(135deg, #fbbf24, #b45309, #fbbf24)'
                    : 'linear-gradient(135deg, #10b981, #047857)',
                  color: currentRoundIndex === 3 ? '#1a0f05' : '#fff',
                  border: currentRoundIndex === 3
                    ? '1.5px solid rgba(254,243,199,0.6)'
                    : '1.5px solid rgba(16,185,129,0.4)',
                  boxShadow: currentRoundIndex === 3
                    ? '0 8px 28px rgba(251,191,36,0.55), inset 0 1px 1px rgba(255,255,255,0.4)'
                    : '0 6px 20px rgba(16,185,129,0.45), inset 0 1px 1px rgba(255,255,255,0.25)',
                  textShadow: currentRoundIndex === 3 ? '0 1px 2px rgba(0,0,0,0.15)' : 'none',
                  animation: currentRoundIndex === 3 ? 'bkPulseGlow 2s ease-in-out infinite' : 'none',
                }}
              >
                {currentRoundIndex === 3 ? (
                  <>
                    <FaCrown size={14} /> 🏆 أعلن الفائز
                  </>
                ) : (
                  <>
                    <FaArrowLeft className="rotate-180" /> الدور التالي
                  </>
                )}
              </button>
            )}
            {isAdmin && hasMatches && (
              <button
                onClick={resetBracket}
                title="إعادة تعيين"
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(145deg, rgba(245,158,11,0.35), rgba(245,158,11,0.1))',
                  border: '1.5px solid rgba(245,158,11,0.55)',
                  color: '#fef3c7',
                }}
              >
                <FaRedo size={13} />
              </button>
            )}
            <button
              onClick={onExit}
              title="خروج"
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(145deg, rgba(220,38,38,0.35), rgba(220,38,38,0.1))',
                border: '1.5px solid rgba(220,38,38,0.55)',
                color: '#fef3c7',
              }}
            >
              <FaSignOutAlt size={13} />
            </button>
          </div>
        </header>

        {/* ===== Main ===== */}
        <main className="relative z-10 flex-1 overflow-auto p-3 sm:p-5">

          {isFinished && winner ? (
            <WinnerScreen winner={winner} isAdmin={isAdmin} onReset={resetBracket} />
          ) : !hasMatches ? (
            <div className="flex-1 flex items-center justify-center h-full">
              <InputsSection
                inputs={inputs}
                onInputChange={handleInputChange}
                onRandomize={randomize}
                isAdmin={isAdmin}
              />
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-stretch gap-2 sm:gap-4"
                style={{ minWidth: '1100px', paddingTop: 40, paddingBottom: 20 }}
              >
                {rounds.map((round, ri) => (
                  <RoundColumn
                    key={ri}
                    round={round}
                    roundIndex={ri}
                    currentRoundIndex={currentRoundIndex}
                    votedMatches={votedMatches}
                    onVote={vote}
                  />
                ))}

                {/* Winner column */}
                <div className="flex flex-col min-w-[180px] flex-1">
                  <div className="text-center mb-3 shrink-0" style={{ height: 30 }}>
                    <div
                      className="inline-block px-3 py-1 rounded-lg text-[10px] font-black tracking-wider"
                      style={{
                        background: isFinished
                          ? 'linear-gradient(135deg, rgba(16,185,129,0.35), rgba(5,150,105,0.15))'
                          : 'rgba(255,255,255,0.04)',
                        color: isFinished ? '#10b981' : '#8a7653',
                        border: isFinished
                          ? '1px solid rgba(16,185,129,0.55)'
                          : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      👑 البطل
                    </div>
                  </div>

                  <div className="relative" style={{ height: BRACKET_TOTAL_H }}>
                    <div
                      className="absolute left-0 right-0 flex flex-col items-center justify-center"
                      style={{ top: BRACKET_TOTAL_H / 2 - 70, height: 140 }}
                    >
                      {isFinished && winner ? (
                        <motion.div
                          initial={{ scale: 0.4, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 180, delay: 0.2 }}
                          className="text-center"
                        >
                          <div className="text-6xl mb-2" style={{ animation: 'bkCrownDrop 0.7s ease-out both' }}>
                            👑
                          </div>
                          <p
                            className="text-xl font-black"
                            style={{
                              background: 'linear-gradient(135deg, #fbbf24, #fef3c7)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                            }}
                          >
                            {winner}
                          </p>
                        </motion.div>
                      ) : (
                        <div className="text-5xl opacity-30">❓</div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </main>

        {/* ===== Footer ===== */}
        {hasMatches && !isFinished && (
          <footer
            className="relative z-10 px-4 py-2 text-center text-[10px] sm:text-xs"
            style={{
              background: 'linear-gradient(0deg, rgba(15,8,6,0.9), rgba(15,8,6,0.4))',
              borderTop: '1px solid rgba(212,175,55,0.2)',
              color: 'rgba(254,243,199,0.55)',
            }}
          >
            {allMatchesVoted
              ? (isAdmin
                  ? '✅ كل التصويتات خلصت — اضغط على الزر الأخضر'
                  : 'في انتظار المُيسّر للانتقال للدور التالي...')
              : `في انتظار التصويت على كل مباريات ${ROUND_NAMES[currentRoundIndex]}...`}
          </footer>
        )}
      </div>
    </>
  );
};

export default BracketRound;