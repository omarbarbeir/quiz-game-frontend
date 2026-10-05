// components/HangmanRound.jsx
// 🔠 الرجل المشنوق – واجهة كاملة (Liquid Glass + Fullscreen + Warm Theme)
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FaSignOutAlt, FaRedo, FaVolumeUp, FaVolumeMute, FaLightbulb,
  FaSkull, FaHeart, FaExpand, FaCompress,
} from 'react-icons/fa';
import {
  HANGMAN_CONFIG, HANGMAN_THEME, HANGMAN_SOUND_PATHS,
} from '../data/hangmanData';

/* ==================== Sound Engine (File-based) ==================== */
class SoundEngine {
  constructor(paths = {}) {
    this.paths = paths;
    this.enabled = true;
    this.volumes = {
      click:   0.5,
      correct: 0.7,
      wrong:   0.7,
      win:     0.85,
      lose:    0.85,
      reset:   0.6,
    };
    // Cache عشان نفس الملف ميحمّلش كل مرة
    this.cache = {};
  }

  setEnabled(v) { this.enabled = !!v; }

  play(name) {
    if (!this.enabled) return;
    const url = this.paths[name];
    if (!url) return;

    try {
      // نعمل نسخة كل مرة عشان لو دوس ورا بعض
      const audio = new Audio(url);
      audio.volume = this.volumes[name] ?? 0.7;
      audio.play().catch(err => {
        console.warn(`[Sound] فشل تشغيل "${name}":`, err.message);
      });
    } catch (e) {
      console.warn(`[Sound] ${name} error:`, e);
    }
  }

  // دالة unlock بقت مش محتاجة، بس نخليها عشان الكود ما يبوظش
  unlock() {}
}

/* ==================== Hooks ==================== */
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

/* ==================== Animations CSS ==================== */
const AnimCSS = `
@keyframes hangFadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes hangScaleIn {
  0%   { transform: scale(0.85); opacity: 0; }
  100% { transform: scale(1);    opacity: 1; }
}
@keyframes hangLetterPop {
  0%   { transform: scale(0.4); opacity: 0; }
  60%  { transform: scale(1.25); opacity: 1; }
  100% { transform: scale(1);    opacity: 1; }
}
@keyframes hangRopeSway {
  0%, 100% { transform: rotate(-0.6deg); }
  50%      { transform: rotate(0.6deg); }
}
@keyframes hangWrongFlash {
  0%, 100% { box-shadow: 0 0 0 rgba(220,38,38,0); }
  50%      { box-shadow: 0 0 60px rgba(220,38,38,0.9), inset 0 0 40px rgba(220,38,38,0.3); }
}
@keyframes hangWinGlow {
  0%, 100% { box-shadow: 0 0 40px rgba(16,185,129,0.5), inset 0 0 30px rgba(16,185,129,0.15); }
  50%      { box-shadow: 0 0 80px rgba(16,185,129,1), inset 0 0 50px rgba(16,185,129,0.3); }
}
@keyframes hangShake {
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-8px); }
  40%      { transform: translateX(8px); }
  60%      { transform: translateX(-5px); }
  80%      { transform: translateX(5px); }
}
@keyframes hangSkullFloat {
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50%      { transform: translateY(-10px) rotate(3deg); }
}
`;

/* ==================== Hangman SVG ==================== */
const HangmanDrawing = ({ attempts, maxAttempts }) => {
  const stage = Math.min(attempts, maxAttempts);

  return (
    <svg viewBox="0 0 320 360" className="w-full h-full max-h-[420px]"
      preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="hangWood" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={HANGMAN_THEME.colors.woodLight} />
          <stop offset="45%" stopColor={HANGMAN_THEME.colors.wood} />
          <stop offset="100%" stopColor={HANGMAN_THEME.colors.woodDark} />
        </linearGradient>
        <linearGradient id="hangWoodH" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={HANGMAN_THEME.colors.woodLight} />
          <stop offset="50%" stopColor={HANGMAN_THEME.colors.wood} />
          <stop offset="100%" stopColor={HANGMAN_THEME.colors.woodDark} />
        </linearGradient>
        <linearGradient id="hangRope" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={HANGMAN_THEME.colors.rope} />
          <stop offset="100%" stopColor={HANGMAN_THEME.colors.ropeDark} />
        </linearGradient>
        <radialGradient id="hangSkin" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="60%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
        <filter id="hangGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <ellipse cx="160" cy="340" rx="150" ry="12" fill="rgba(0,0,0,0.45)" />

      <rect x="30" y="316" width="230" height="18" rx="3" fill="url(#hangWoodH)" />
      <rect x="30" y="316" width="230" height="4" fill="rgba(255,255,255,0.15)" />
      <rect x="30" y="330" width="230" height="4" fill="rgba(0,0,0,0.35)" />

      <rect x="130" y="50" width="22" height="266" fill="url(#hangWoodH)" />
      <rect x="130" y="50" width="5" height="266" fill="rgba(255,255,255,0.13)" />
      <rect x="147" y="50" width="5" height="266" fill="rgba(0,0,0,0.3)" />

      <rect x="130" y="50" width="140" height="20" rx="2" fill="url(#hangWoodH)" />
      <rect x="130" y="50" width="140" height="4" fill="rgba(255,255,255,0.15)" />
      <rect x="130" y="66" width="140" height="4" fill="rgba(0,0,0,0.3)" />

      <line x1="152" y1="130" x2="240" y2="70" stroke="url(#hangWoodH)" strokeWidth="11" strokeLinecap="round" />
      <line x1="152" y1="130" x2="240" y2="70" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />

      <circle cx="141" cy="60" r="2.5" fill="#2a1205" />
      <circle cx="141" cy="316" r="2.5" fill="#2a1205" />
      <circle cx="250" cy="60" r="2.5" fill="#2a1205" />

      {stage >= 1 && (
        <g style={{ animation: 'hangRopeSway 4s ease-in-out infinite', transformOrigin: '250px 70px' }}>
          <line x1="250" y1="70" x2="250" y2="102" stroke="url(#hangRope)" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="250" cy="112" rx="13" ry="15" fill="none"
            stroke="url(#hangRope)" strokeWidth="4" />
          <ellipse cx="250" cy="112" rx="13" ry="15" fill="none"
            stroke="rgba(0,0,0,0.3)" strokeWidth="1" strokeDasharray="2 3" />

          <circle cx="250" cy="112" r="20" fill="url(#hangSkin)" stroke="#78350f" strokeWidth="1.5" />
          <circle cx="243" cy="109" r="2.2" fill="#1c1917" />
          <circle cx="257" cy="109" r="2.2" fill="#1c1917" />
          <circle cx="243.7" cy="108.3" r="0.8" fill="white" />
          <circle cx="257.7" cy="108.3" r="0.8" fill="white" />
          <path d="M 243 122 Q 250 118 257 122" stroke="#7c2d12" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M 232 104 Q 240 92 250 90 Q 260 92 268 104" fill="#3f2410" opacity="0.85" />

          {stage >= 2 && (
            <line x1="250" y1="132" x2="250" y2="210"
              stroke="#fde68a" strokeWidth="6" strokeLinecap="round" />
          )}
          {stage >= 3 && (
            <line x1="250" y1="152" x2="212" y2="186"
              stroke="#fde68a" strokeWidth="5" strokeLinecap="round" />
          )}
          {stage >= 4 && (
            <line x1="250" y1="152" x2="288" y2="186"
              stroke="#fde68a" strokeWidth="5" strokeLinecap="round" />
          )}
          {stage >= 5 && (
            <line x1="250" y1="210" x2="222" y2="270"
              stroke="#fde68a" strokeWidth="5" strokeLinecap="round" />
          )}
          {stage >= 6 && (
            <line x1="250" y1="210" x2="278" y2="270"
              stroke="#fde68a" strokeWidth="5" strokeLinecap="round" />
          )}
        </g>
      )}

      {stage >= 6 && (
        <g filter="url(#hangGlow)">
          <line x1="238" y1="104" x2="248" y2="114" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="248" y1="104" x2="238" y2="114" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="252" y1="104" x2="262" y2="114" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="262" y1="104" x2="252" y2="114" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
};

/* ==================== Liquid Glass Button ==================== */
const GlassButton = ({ char, isGuessed, isNumber, onPress, disabled }) => {
  const accent = isNumber ? HANGMAN_THEME.colors.numbersGlass : HANGMAN_THEME.colors.lettersGlass;

  return (
    <button
      onClick={onPress}
      disabled={disabled || isGuessed}
      className="relative flex items-center justify-center h-12 sm:h-14 md:h-16
                 rounded-2xl font-extrabold text-lg sm:text-xl md:text-2xl
                 transition-all duration-200 select-none
                 active:scale-95 disabled:cursor-not-allowed overflow-hidden"
      style={{
        background: isGuessed
          ? `linear-gradient(145deg, rgba(255,255,255,0.02), rgba(0,0,0,0.15))`
          : `linear-gradient(145deg, rgba(${accent},0.42), rgba(${accent},0.12) 60%, rgba(0,0,0,0.18))`,
        backdropFilter: 'blur(16px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(16px) saturate(1.6)',
        border: isGuessed
          ? `1px solid rgba(255,255,255,0.06)`
          : `1.5px solid rgba(${accent},0.7)`,
        boxShadow: isGuessed
          ? `inset 0 1px 2px rgba(255,255,255,0.03)`
          : `0 10px 24px rgba(0,0,0,0.5),
             inset 0 1px 1px rgba(255,255,255,0.35),
             inset 0 -3px 6px rgba(0,0,0,0.35),
             0 0 16px rgba(${accent},0.35),
             inset 0 0 24px rgba(${accent},0.15)`,
        color: isGuessed ? 'rgba(138,118,83,0.5)' : '#fef3c7',
        textShadow: isGuessed ? 'none' : `0 1px 3px rgba(0,0,0,0.7)`,
        textDecoration: isGuessed ? 'line-through' : 'none',
        opacity: isGuessed ? 0.35 : 1,
      }}
      onMouseEnter={e => {
        if (isGuessed || disabled) return;
        e.currentTarget.style.transform = 'translateY(-3px) scale(1.06)';
        e.currentTarget.style.boxShadow =
          `0 16px 36px rgba(0,0,0,0.55),
           inset 0 1px 1px rgba(255,255,255,0.45),
           inset 0 -3px 6px rgba(0,0,0,0.35),
           0 0 28px rgba(${accent},0.7),
           inset 0 0 30px rgba(${accent},0.25)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = isGuessed
          ? `inset 0 1px 2px rgba(255,255,255,0.03)`
          : `0 10px 24px rgba(0,0,0,0.5),
             inset 0 1px 1px rgba(255,255,255,0.35),
             inset 0 -3px 6px rgba(0,0,0,0.35),
             0 0 16px rgba(${accent},0.35),
             inset 0 0 24px rgba(${accent},0.15)`;
      }}
    >
      {!isGuessed && (
        <span
          className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl pointer-events-none"
          style={{
            background: `linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0) 100%)`,
          }}
        />
      )}
      {!isGuessed && (
        <span
          className="absolute bottom-0 left-0 right-0 h-1/3 rounded-b-2xl pointer-events-none"
          style={{
            background: `linear-gradient(0deg, rgba(${accent},0.18) 0%, rgba(${accent},0) 100%)`,
          }}
        />
      )}
      <span className="relative z-10">{char}</span>
    </button>
  );
};

/* ==================== Glass Icon Button ==================== */
const GlassIconButton = ({ onClick, children, title, accent = 'gold' }) => {
  const accentRGB = {
    gold:  '212,175,55',
    amber: '245,158,11',
    red:   '220,38,38',
    green: '16,185,129',
  }[accent] || '212,175,55';

  return (
    <button
      onClick={onClick}
      title={title}
      className="w-9 h-9 flex items-center justify-center rounded-xl transition-all relative overflow-hidden"
      style={{
        background: `linear-gradient(145deg, rgba(${accentRGB},0.35), rgba(${accentRGB},0.1))`,
        backdropFilter: 'blur(14px) saturate(1.5)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.5)',
        border: `1.5px solid rgba(${accentRGB},0.55)`,
        boxShadow: `0 6px 14px rgba(0,0,0,0.4),
                    inset 0 1px 1px rgba(255,255,255,0.3),
                    inset 0 -2px 3px rgba(0,0,0,0.25),
                    0 0 10px rgba(${accentRGB},0.25)`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow =
          `0 10px 22px rgba(0,0,0,0.5),
           inset 0 1px 1px rgba(255,255,255,0.4),
           inset 0 -2px 3px rgba(0,0,0,0.25),
           0 0 20px rgba(${accentRGB},0.55)`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow =
          `0 6px 14px rgba(0,0,0,0.4),
           inset 0 1px 1px rgba(255,255,255,0.3),
           inset 0 -2px 3px rgba(0,0,0,0.25),
           0 0 10px rgba(${accentRGB},0.25)`;
      }}
    >
      <span
        className="absolute top-0 left-0 right-0 h-1/2 rounded-t-xl pointer-events-none"
        style={{
          background: `linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 100%)`,
        }}
      />
      <span className="relative z-10">{children}</span>
    </button>
  );
};

/* ==================== Main Component ==================== */
const HangmanRound = ({ socket, roomCode, playerId, playerName, isAdmin, players, onExit }) => {
  const { isFs, toggle: toggleFs } = useFullscreen();
  const soundRef = useRef(null);
  const [soundReady, setSoundReady] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  const [state, setState] = useState({
    display: '', guessedLetters: [], attempts: 0, maxAttempts: 6,
    gameOver: false, won: false, word: '', hint: '', remaining: 0,
  });

  const [wrongFlash, setWrongFlash] = useState(false);
  const [winFlash, setWinFlash] = useState(false);
  const prevGuessedRef = useRef([]);

  useEffect(() => { soundRef.current = new SoundEngine(HANGMAN_SOUND_PATHS); }, []);
  // ✅ متزامنة — تشتغل فوراً
  const unlockSound = useCallback(() => {
    soundRef.current?.unlock();
  }, []);
  useEffect(() => {
    if (soundRef.current) soundRef.current.setEnabled(!soundMuted);
  }, [soundMuted]);
  const playSound = useCallback((n) => { soundRef.current?.play(n); }, []);

  // ✅ افتح الصوت على أول تفاعل من المستخدم
  useEffect(() => {
    const unlock = () => unlockSound();
    document.addEventListener('pointerdown', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
    return () => {
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
    };
  }, [unlockSound]);

  useEffect(() => {
    if (!socket || !roomCode) return;

    const onState = (newState) => {
      if (!newState) return;

      const prevGuessed = prevGuessedRef.current;
      const nowGuessed = newState.guessedLetters;
      const newLetter = nowGuessed.find(c => !prevGuessed.includes(c));

      if (newLetter) {
        const correctGuess = newState.display.includes(newLetter);
        if (correctGuess) playSound('correct');
        else {
          playSound('wrong');
          setWrongFlash(true);
          setTimeout(() => setWrongFlash(false), 500);
        }
      }

      if (newState.gameOver && !state.gameOver) {
        if (newState.won) { playSound('win'); setWinFlash(true); setTimeout(() => setWinFlash(false), 2500); }
        else playSound('lose');
      }

      prevGuessedRef.current = nowGuessed;
      setState(newState);
    };

    socket.on('hangman_state', onState);
    socket.emit('hangman_get_state', { roomCode });

    return () => {
      socket.off('hangman_state', onState);
      socket.emit('hangman_cleanup', { roomCode });
    };
    // eslint-disable-next-line
  }, [roomCode, socket]);

  const handleGuess = (char) => {
    if (state.gameOver) return;
    if (state.guessedLetters.includes(char)) return;
    unlockSound();
    playSound('click');
    socket.emit('hangman_guess', { roomCode, letter: char });
  };

  const handleReset = () => {
    unlockSound();
    playSound('reset');
    socket.emit('hangman_reset', { roomCode });
  };

  const wordParts = state.display ? state.display.split('   ') : [];

  return (
    <>
      <style>{AnimCSS}</style>
      <div
        className="fixed inset-0 z-[900] flex flex-col text-white overflow-hidden"
        style={{
          background: `radial-gradient(ellipse at 50% -10%, ${HANGMAN_THEME.colors.bgLight} 0%, ${HANGMAN_THEME.colors.bgMid} 40%, ${HANGMAN_THEME.colors.bgDeep} 100%)`,
        }}
        onClick={unlockSound}
      >
        {/* نقاط ذهبية دافية */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.16]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(245,158,11,0.9) 1px, transparent 1px),
                              radial-gradient(circle, rgba(212,175,55,0.5) 1.5px, transparent 1.5px)`,
            backgroundSize: '42px 42px, 84px 84px',
            backgroundPosition: '0 0, 21px 21px',
          }}
        />

        {/* ===================== Header ===================== */}
        <header
          className="relative z-10 flex items-center justify-between px-3 py-2"
          style={{
            background: 'linear-gradient(90deg, rgba(15,8,6,0.95), rgba(31,21,12,0.7), rgba(15,8,6,0.95))',
            backdropFilter: 'blur(20px) saturate(1.4)',
            WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
            borderBottom: '1px solid rgba(212,175,55,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(245,158,11,0.15)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="text-xl sm:text-2xl"
              style={{ filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.7))' }}
            >🔠</span>
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
              الرجل المشنوق
            </h1>
            <span className="hidden sm:inline text-xs" style={{ color: HANGMAN_THEME.colors.textMuted }}>
              • {state.remaining} حرف متبقي
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* قلوب المحاولات */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.06), rgba(0,0,0,0.3))',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                border: '1px solid rgba(212,175,55,0.28)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)',
              }}
            >
              {Array.from({ length: state.maxAttempts }).map((_, i) => {
                const alive = i < state.maxAttempts - state.attempts;
                return (
                  <FaHeart
                    key={i}
                    size={11}
                    style={{
                      color: alive ? '#f43f5e' : '#3a2a1a',
                      filter: alive ? 'drop-shadow(0 0 4px rgba(244,63,94,0.7))' : 'none',
                      transition: 'all 0.3s',
                    }}
                  />
                );
              })}
            </div>

            <GlassIconButton onClick={() => setSoundMuted(m => !m)} title="الصوت" accent="gold">
              {soundMuted
                ? <FaVolumeMute style={{ color: '#f43f5e' }} />
                : <FaVolumeUp style={{ color: '#fbbf24' }} />}
            </GlassIconButton>

            <GlassIconButton onClick={toggleFs} title="ملء الشاشة" accent="gold">
              {isFs
                ? <FaCompress style={{ color: '#fbbf24' }} />
                : <FaExpand style={{ color: '#fbbf24' }} />}
            </GlassIconButton>

            {isAdmin && (
              <GlassIconButton onClick={handleReset} title="كلمة جديدة" accent="amber">
                <FaRedo style={{ color: '#fef3c7' }} />
              </GlassIconButton>
            )}

            <GlassIconButton onClick={onExit} title="خروج" accent="red">
              <FaSignOutAlt style={{ color: '#fef3c7' }} />
            </GlassIconButton>
          </div>
        </header>

        {/* ===================== Main ===================== */}
        <main className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">

          {/* اليسار: المشنقة */}
          <aside className="lg:w-[38%] w-full flex-shrink-0 flex flex-col p-3 sm:p-4 gap-3
                          overflow-y-auto border-b lg:border-b-0 lg:border-l"
            style={{ borderColor: 'rgba(212,175,55,0.15)' }}>

            <div
              className="flex-1 min-h-[240px] flex items-center justify-center rounded-2xl p-2"
              style={{
                background: `radial-gradient(circle at 50% 90%, rgba(168,113,66,0.18) 0%, rgba(15,8,6,0.55) 60%),
                             linear-gradient(160deg, rgba(255,255,255,0.03), rgba(0,0,0,0.25))`,
                backdropFilter: 'blur(18px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(18px) saturate(1.3)',
                border: '1px solid rgba(212,175,55,0.22)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.06), inset 0 -20px 40px rgba(0,0,0,0.4), 0 10px 30px rgba(0,0,0,0.4)',
              }}>
              <HangmanDrawing attempts={state.attempts} maxAttempts={state.maxAttempts} />
            </div>

            {state.hint && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.22), rgba(180,83,9,0.08))',
                  backdropFilter: 'blur(16px) saturate(1.4)',
                  WebkitBackdropFilter: 'blur(16px) saturate(1.4)',
                  border: '1.5px solid rgba(245,158,11,0.5)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 0 24px rgba(245,158,11,0.12)',
                }}>
                <FaLightbulb className="text-2xl flex-shrink-0"
                  style={{ color: '#fbbf24', filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.8))' }} />
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'rgba(254,243,199,0.65)' }}>
                    تلميح
                  </p>
                  <p className="text-sm sm:text-base font-bold" style={{ color: '#fef3c7' }}>
                    {state.hint}
                  </p>
                </div>
              </div>
            )}

            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
              style={{
                background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(0,0,0,0.25))',
                backdropFilter: 'blur(14px) saturate(1.3)',
                WebkitBackdropFilter: 'blur(14px) saturate(1.3)',
                border: '1px solid rgba(212,175,55,0.25)',
                boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08)',
              }}>
              <span className="text-xs" style={{ color: 'rgba(254,243,199,0.55)' }}>المحاولات:</span>
              <span
                className="font-extrabold text-base"
                style={{
                  background: state.attempts >= state.maxAttempts
                    ? 'linear-gradient(135deg, #f43f5e, #be123c)'
                    : 'linear-gradient(135deg, #fbbf24, #b45309)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                {state.attempts}
              </span>
              <span style={{ color: '#8a7653' }}>/</span>
              <span style={{ color: '#d6c4a0' }}>{state.maxAttempts}</span>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ background: 'rgba(0,0,0,0.5)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(state.attempts / state.maxAttempts) * 100}%`,
                    background: state.attempts >= state.maxAttempts - 1
                      ? 'linear-gradient(90deg, #f43f5e, #be123c)'
                      : 'linear-gradient(90deg, #fbbf24, #d97706)',
                    boxShadow: '0 0 12px rgba(251,191,36,0.6)',
                  }}
                />
              </div>
            </div>
          </aside>

          {/* اليمين: الكلمة + الأزرار */}
          <section className="flex-1 flex flex-col p-3 sm:p-4 gap-3 overflow-y-auto">

            <div
              className="rounded-2xl p-4 sm:p-6"
              style={{
                background: 'linear-gradient(160deg, rgba(31,21,12,0.65), rgba(10,7,5,0.45))',
                backdropFilter: 'blur(18px) saturate(1.4)',
                WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
                border: '1.5px solid rgba(212,175,55,0.28)',
                boxShadow: wrongFlash
                  ? '0 0 60px rgba(220,38,38,0.75), inset 0 0 40px rgba(220,38,38,0.25), 0 12px 30px rgba(0,0,0,0.5)'
                  : winFlash
                    ? '0 0 60px rgba(16,185,129,0.8), inset 0 0 40px rgba(16,185,129,0.25), 0 12px 30px rgba(0,0,0,0.5)'
                    : '0 12px 30px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.08)',
                transition: 'box-shadow 0.3s',
                animation: wrongFlash ? 'hangShake 0.4s ease-in-out' : 'none',
              }}>

              <div className="flex flex-wrap justify-center items-end gap-x-3 gap-y-4" dir="rtl">
                {wordParts.length === 0 ? (
                  <p className="text-lg" style={{ color: 'rgba(254,243,199,0.5)' }}>جاري تحضير الكلمة...</p>
                ) : wordParts.map((wordPart, wordIdx, arr) => (
                  <React.Fragment key={wordIdx}>
                    <div className="flex gap-1 sm:gap-1.5">
                      {wordPart.split(' ').map((c, i) => {
                        const isLetter = c !== '_' && c !== ' ';
                        return (
                          <div key={i} className="flex flex-col items-center">
                            <span
                              className="flex items-center justify-center min-w-[1.8rem] sm:min-w-[2.2rem] h-10 sm:h-12
                                         text-2xl sm:text-3xl font-extrabold"
                              style={{
                                color: isLetter ? '#fef3c7' : 'transparent',
                                textShadow: isLetter ? '0 0 14px rgba(245,158,11,0.9), 0 0 24px rgba(245,158,11,0.5)' : 'none',
                                animation: isLetter ? 'hangLetterPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both' : 'none',
                              }}>
                              {isLetter ? c : '‎'}
                            </span>
                            <div
                              className="h-[3px] sm:h-1 w-full rounded-full mt-0.5"
                              style={{
                                background: isLetter
                                  ? 'linear-gradient(90deg, #fbbf24, #d97706, #fbbf24)'
                                  : 'linear-gradient(90deg, rgba(138,118,83,0.6), rgba(138,118,83,0.3))',
                                boxShadow: isLetter ? '0 0 12px rgba(251,191,36,0.8)' : 'none',
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {wordIdx < arr.length - 1 && (
                      <div className="flex items-end pb-2 font-bold text-2xl select-none"
                        style={{ color: 'rgba(212,175,55,0.4)' }}>
                        /
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {state.gameOver && (
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{
                  background: state.won
                    ? 'linear-gradient(135deg, rgba(52,211,153,0.32), rgba(5,150,105,0.12))'
                    : 'linear-gradient(135deg, rgba(244,63,94,0.32), rgba(190,18,60,0.12))',
                  backdropFilter: 'blur(18px) saturate(1.4)',
                  WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
                  border: `1.5px solid ${state.won ? 'rgba(52,211,153,0.7)' : 'rgba(244,63,94,0.7)'}`,
                  boxShadow: state.won
                    ? '0 0 40px rgba(52,211,153,0.55), inset 0 1px 1px rgba(255,255,255,0.2)'
                    : '0 0 40px rgba(244,63,94,0.55), inset 0 1px 1px rgba(255,255,255,0.2)',
                }}>
                <span
                  className="text-3xl"
                  style={{ animation: state.won ? 'none' : 'hangSkullFloat 2s ease-in-out infinite' }}
                >
                  {state.won ? '🎉' : '💀'}
                </span>
                <div className="text-right flex-1">
                  {state.won ? (
                    <>
                      <p className="font-extrabold text-base sm:text-lg" style={{ color: '#d1fae5' }}>أحسنت! كسبت 🎉</p>
                      <p className="text-xs" style={{ color: 'rgba(209,250,229,0.8)' }}>اكتشفت الكلمة كاملة</p>
                    </>
                  ) : (
                    <>
                      <p className="font-extrabold text-base sm:text-lg" style={{ color: '#ffe4e6' }}>للأسف… خسرت</p>
                      <p className="text-sm" style={{ color: 'rgba(255,228,230,0.9)' }}>
                        الكلمة كانت: <span className="font-extrabold" style={{ color: '#fbbf24' }}>{state.word}</span>
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* لوحة المفاتيح - الحروف */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-center"
                style={{ color: 'rgba(251,191,36,0.65)' }}>
                الحروف
              </p>
              <div className="grid grid-cols-6 sm:grid-cols-7 md:grid-cols-8 gap-2 sm:gap-2.5">
                {HANGMAN_CONFIG.letters.map(char => (
                  <GlassButton
                    key={char}
                    char={char}
                    isGuessed={state.guessedLetters.includes(char)}
                    isNumber={false}
                    onPress={() => handleGuess(char)}
                    disabled={state.gameOver}
                  />
                ))}
              </div>
            </div>

            {/* لوحة المفاتيح - الأرقام */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-center"
                style={{ color: 'rgba(52,211,153,0.65)' }}>
                الأرقام
              </p>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-2.5">
                {HANGMAN_CONFIG.numbers.map(char => (
                  <GlassButton
                    key={char}
                    char={char}
                    isGuessed={state.guessedLetters.includes(char)}
                    isNumber={true}
                    onPress={() => handleGuess(char)}
                    disabled={state.gameOver}
                  />
                ))}
              </div>
            </div>

          </section>
        </main>
      </div>
    </>
  );
};

export default HangmanRound;