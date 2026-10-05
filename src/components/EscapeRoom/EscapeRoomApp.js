import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PanoramaViewer from './PanoramaViewer';
import Popup from './Popup';
import Inventory from './Inventory';
import SettingsPanel from './SettingsPanel';
import PuzzleRenderer from './puzzles/PuzzleRenderer';
import HouseMap from './HouseMap';
import StoryIntro from './StoryIntro';
import Toast from './Toast';
import useEscapeStore from './store/useEscapeStore';
import audioEngine from './audio/AudioEngine';
import { useStory } from '../../data/stories/StoryProvider';
import { playVoiceIfFirstTime, resetVoiceClues } from './utils/VoiceClue';

const HOTSPOT_FLY_THRESHOLD = 25;
const HOTSPOT_FLY_DURATION = 600;
const HOTSPOT_FLY_DELAY_BEFORE_POPUP = 500;

export default function EscapeRoomApp({
  socket,
  roomCode,
  playerId,
  playerName,
  isAdmin,
  onExit,
}) {
  const { storyId, storyData, roomsData, puzzlesData, itemsData, config } =
    useStory();

  const {
    phase,
    currentRoomId,
    inventory,
    solvedPuzzles,
    setStateFromServer,
    setCurrentRoom,
    openPopup,
    closePopup,
    activePuzzle,
    openPuzzle,
    closePuzzle,
    isTransitioning,
    beginTransition,
    endTransition,
    toggleInventory,
    toggleSettings,
    isInventoryOpen,
    selectedItemId,
    clearSelectedItem,
    controlMode,
    darkMode,
    flashlightOn,
    hasFlashlight,
    setDarkMode,
    setFlashlightOn,
    toggleFlashlight,
    setHasFlashlight,
  } = useEscapeStore();

  const panoramaRef = useRef(null);
  const stablePlayerIdRef = useRef(
    playerId || `solo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  );
  const stablePlayerNameRef = useRef(playerName || 'المحقق');
  const hasAutoStartedRef = useRef(false);
  const hasShownHintRef = useRef(false);

  const [won, setWon] = useState(false);
  const [wonBy, setWonBy] = useState(null);
  const [toast, setToast] = useState({ message: null, type: 'info' });
  const [showMap, setShowMap] = useState(false);
  const [storyOverlay, setStoryOverlay] = useState(null);
  const [forcedVideo, setForcedVideo] = useState(null);
  const [lightsState, setLightsState] = useState({});

  const [visitedChapters, setVisitedChapters] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(`er_visited_chapters_${storyId}`) || '{}'
      );
    } catch {
      return {};
    }
  });
  const [completedChapters, setCompletedChapters] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem(`er_completed_chapters_${storyId}`) || '{}'
      );
    } catch {
      return {};
    }
  });

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  // =====================================================
  // Join
  // =====================================================
  useEffect(() => {
    socket.emit('er_join', {
      roomCode,
      playerId: stablePlayerIdRef.current,
      playerName: stablePlayerNameRef.current,
    });
  }, [roomCode, socket]);

  // =====================================================
  // Auto-Start
  // =====================================================
  useEffect(() => {
    if (hasAutoStartedRef.current) return;
    if (phase !== 'lobby') return;

    const timer = setTimeout(() => {
      hasAutoStartedRef.current = true;
      socket.emit('er_start', {
        roomCode,
        startRoomId: config?.startRoom || 'karim_apartment',
        storyId,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [phase, roomCode, config, storyId, socket]);

  // =====================================================
  // Listeners
  // =====================================================
  useEffect(() => {
    const onState = (s) => {
      setStateFromServer(s);
      clearSelectedItem();
      if (s.phase === 'won') setWon(true);
      if (s.lightsState) setLightsState(s.lightsState);
    };

    const onWon = ({ byPlayerName }) => {
      setWon(true);
      setWonBy(byPlayerName || null);
      audioEngine.playSfx('/audio/sfx/puzzle_solved.ogg', 1);
    };

    const onOpenPuzzle = ({ puzzleId }) => openPuzzle({ puzzleId });

    const onPuzzleResult = ({ correct }) => {
      if (correct) {
        closePuzzle();
        showToast('✅ تم حل اللغز!', 'success');
      } else {
        showToast('❌ الكود غلط. جرّب تاني.', 'error');
      }
    };

    const onError = ({ message }) => {
      showToast(message || 'حصلت مشكلة', 'error');
      audioEngine.playSfx('/audio/sfx/puzzle_failed.ogg', 0.6);
    };

    const onSfx = ({ sfx }) =>
      audioEngine.playSfx(`/audio/sfx/${sfx}.ogg`, 0.8);

    const onInfraPulse = ({ duration, freq }) =>
      audioEngine.pulseInfrasound({ duration, freq });

    // ✅ قطع الكهرباء
    const onPowerCut = ({ roomId }) => {
      if (currentRoomId === roomId) {
        setDarkMode(true);
        audioEngine.playSfx('/audio/sfx/power_out.ogg', 1);
        showToast('⚡ النور قطع!', 'warning');

        if (!hasShownHintRef.current) {
          hasShownHintRef.current = true;
          setTimeout(() => {
            showToast('🔦 دوروا على الكشاف', 'info');
          }, 3000);
        }
      }
    };

    // ✅ مفتاح النور
    const onLightsToggled = ({ roomId, lightsOn }) => {
      setLightsState((prev) => ({ ...prev, [roomId]: lightsOn }));
    };

    // ✅ الفيديو الإجباري
    const onForcedVideo = ({ videoUrl }) => {
      setForcedVideo({ url: videoUrl });
    };

    const onForcedVideoEnded = ({ nextEvent }) => {
      setForcedVideo(null);
      if (nextEvent === 'scream') {
        audioEngine.playSfx('/audio/events/distant_scream.ogg', 1);
        showToast('🔊 صوت صراخ من شقة الجار!', 'warning');
      }
    };

    socket.on('er_state', onState);
    socket.on('er_won', onWon);
    socket.on('er_open_puzzle', onOpenPuzzle);
    socket.on('er_puzzle_result', onPuzzleResult);
    socket.on('er_error', onError);
    socket.on('er_sfx', onSfx);
    socket.on('er_infrasound_pulse', onInfraPulse);
    socket.on('er_power_cut', onPowerCut);
    socket.on('er_lights_toggled', onLightsToggled);
    socket.on('er_forced_video', onForcedVideo);
    socket.on('er_forced_video_ended', onForcedVideoEnded);

    return () => {
      socket.off('er_state', onState);
      socket.off('er_won', onWon);
      socket.off('er_open_puzzle', onOpenPuzzle);
      socket.off('er_puzzle_result', onPuzzleResult);
      socket.off('er_error', onError);
      socket.off('er_sfx', onSfx);
      socket.off('er_infrasound_pulse', onInfraPulse);
      socket.off('er_power_cut', onPowerCut);
      socket.off('er_lights_toggled', onLightsToggled);
      socket.off('er_forced_video', onForcedVideo);
      socket.off('er_forced_video_ended', onForcedVideoEnded);
    };
  }, [socket, showToast, currentRoomId, setDarkMode]);

  // =====================================================
  // Audio unlock
  // =====================================================
  useEffect(() => {
    const unlock = async () => {
      await audioEngine.unlock();
      window.removeEventListener('pointerdown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  // =====================================================
  // Ambient
  // =====================================================
  useEffect(() => {
    if (won) return;
    if (!currentRoomId) return;
    const room = roomsData?.[currentRoomId];
    if (!room) return;

    audioEngine.playAmbient(room.ambient, room.ambientVolume);
    audioEngine.setInfrasound(room.infrasound);
    audioEngine.startRandomEvents(room.events || []);

    return () => audioEngine.stopRandomEvents();
  }, [currentRoomId, won, roomsData]);

  // =====================================================
  // Dark Mode (from room + lights)
  // =====================================================
  useEffect(() => {
    if (!currentRoomId) return;
    const room = roomsData?.[currentRoomId];
    if (!room) return;

    const lightsOn = lightsState[currentRoomId] || false;
    const isCurrentlyDark = room.isDark && !lightsOn;
    setDarkMode(isCurrentlyDark);
  }, [currentRoomId, roomsData, lightsState, setDarkMode]);

  // =====================================================
  // Story Intro
  // =====================================================
  useEffect(() => {
    if (won) return;
    if (!currentRoomId) return;

    const room = roomsData?.[currentRoomId];
    if (!room || !room.chapter) return;

    const chapter = storyData?.chapters?.[room.chapter];
    if (!chapter) return;
    if (visitedChapters[room.chapter]) return;

    const updated = { ...visitedChapters, [room.chapter]: Date.now() };
    setVisitedChapters(updated);
    localStorage.setItem(
      `er_visited_chapters_${storyId}`,
      JSON.stringify(updated)
    );

    if (chapter.intro) {
      setStoryOverlay({ data: chapter.intro, type: 'intro' });
    }
  }, [currentRoomId, won, visitedChapters, roomsData, storyData, storyId]);

  // =====================================================
  // Chapter Outro
  // =====================================================
  useEffect(() => {
    if (won) return;
    if (!currentRoomId) return;

    const room = roomsData?.[currentRoomId];
    if (!room || !room.chapter) return;

    const chapter = storyData?.chapters?.[room.chapter];
    if (!chapter) return;
    if (completedChapters[room.chapter]) return;

    const requiredPuzzles = chapter.requiredPuzzles || [];
    if (requiredPuzzles.length === 0) return;

    const allSolved = requiredPuzzles.every((pid) => solvedPuzzles[pid]);
    if (!allSolved) return;

    const updated = { ...completedChapters, [room.chapter]: Date.now() };
    setCompletedChapters(updated);
    localStorage.setItem(
      `er_completed_chapters_${storyId}`,
      JSON.stringify(updated)
    );

    if (chapter.outro) {
      setTimeout(() => {
        setStoryOverlay({ data: chapter.outro, type: 'outro' });
      }, 800);
    }
  }, [
    solvedPuzzles,
    currentRoomId,
    won,
    completedChapters,
    roomsData,
    storyData,
    storyId,
  ]);

  // =====================================================
  // Change room
  // =====================================================
  const changeRoom = (targetId) => {
    beginTransition(targetId);
    audioEngine.playSfx('/audio/sfx/door_open.ogg', 0.9);
    setTimeout(() => {
      setCurrentRoom(targetId);
      socket.emit('er_change_room', { roomCode, targetRoomId: targetId });
      setTimeout(() => endTransition(), 800);
    }, 600);
  };

  // =====================================================
  // Hotspot click
  // =====================================================
  const handleHotspotClick = (hotspot) => {
    let needsFly = false;

    if (panoramaRef.current && hotspot.position) {
      const current = panoramaRef.current.getLonLat();
      const targetLon = hotspot.position.theta;
      const targetLat = 90 - hotspot.position.phi;

      let dLon = targetLon - current.lon;
      while (dLon > 180) dLon -= 360;
      while (dLon < -180) dLon += 360;
      const dLat = targetLat - current.lat;

      const distance = Math.hypot(dLon, dLat);

      if (distance > HOTSPOT_FLY_THRESHOLD) {
        needsFly = true;
        panoramaRef.current.flyTo({
          lon: targetLon,
          lat: targetLat,
          duration: HOTSPOT_FLY_DURATION,
        });
      }

      if (hotspot.focusFov) {
        panoramaRef.current.setFov(hotspot.focusFov, HOTSPOT_FLY_DURATION);
      }
    }

    // ✅ light_switch
    if (hotspot.type === 'light_switch') {
      socket.emit('er_toggle_lights', {
        roomCode,
        roomId: currentRoomId,
      });
      audioEngine.playSfx('/audio/sfx/switch_click.ogg', 1);
      return;
    }

    // ✅ tv_remote
    if (hotspot.type === 'tv_remote') {
      socket.emit('er_tv_remote', { roomCode });
      return;
    }

    // ✅ باب للفوز
    if (hotspot.isWin) {
      socket.emit('er_interact', {
        roomCode,
        roomId: currentRoomId,
        hotspotId: hotspot.id,
      });
      if (selectedItemId) clearSelectedItem();
      return;
    }

    // ✅ الأبواب
    if (hotspot.type === 'exit') {
      if (needsFly) {
        setTimeout(() => changeRoom(hotspot.target), HOTSPOT_FLY_DURATION);
      } else {
        changeRoom(hotspot.target);
      }
      return;
    }

    // ✅ hotspot عادي
    socket.emit('er_interact', {
      roomCode,
      roomId: currentRoomId,
      hotspotId: hotspot.id,
      itemId: selectedItemId,
    });

    // ✅ الكشاف
    if (hotspot.givesFlashlight && !hasFlashlight) {
      setHasFlashlight(true);
      setFlashlightOn(true);
      showToast('🔦 أخدت كشاف! اضغط على الزر فوق لتشغيله', 'success');
    }

    if (hotspot.popup) {
      const openPopupNow = () => {
        const item = hotspot.givesItem ? itemsData?.[hotspot.givesItem] : null;
        const viewable = item?.viewable;

        openPopup({
          type: viewable?.type || hotspot.popup.type,
          content: viewable?.content || hotspot.popup.content,
          front: viewable?.front || hotspot.popup.front,
          back: viewable?.back || hotspot.popup.back,
          item: item,
          givesItem: hotspot.givesItem,
          givesItemName: item?.name || null,
        });

        if (hotspot.givesItem) {
          const it = itemsData?.[hotspot.givesItem];
          if (it && it.hasVoice) {
            const voiceData = storyData?.voiceClues?.[hotspot.givesItem];
            if (voiceData?.audio) {
              playVoiceIfFirstTime(storyId, hotspot.givesItem, voiceData.audio);
            }
          }
        }
      };

      if (needsFly) {
        setTimeout(openPopupNow, HOTSPOT_FLY_DELAY_BEFORE_POPUP);
      } else {
        openPopupNow();
      }
    }

    if (selectedItemId) clearSelectedItem();
  };

  const handlePuzzleSubmit = (answer) => {
    socket.emit('er_puzzle_submit', {
      roomCode,
      puzzleId: activePuzzle.puzzleId,
      answer,
    });
  };

  const handleBackToMenu = () => {
    setWon(false);
    setWonBy(null);
    setVisitedChapters({});
    setCompletedChapters({});
    localStorage.removeItem(`er_visited_chapters_${storyId}`);
    localStorage.removeItem(`er_completed_chapters_${storyId}`);
    resetVoiceClues(storyId);

    useEscapeStore.getState().setStateFromServer({
      phase: 'lobby',
      currentRoomId: config?.startRoom || 'karim_apartment',
      inventory: [],
      solvedPuzzles: {},
      openedContainers: {},
      hintsUsed: {},
      players: [],
      me: { roomId: config?.startRoom || 'karim_apartment' },
    });

    useEscapeStore.getState().toggleInventory(false);
    useEscapeStore.getState().toggleSettings(false);

    hasAutoStartedRef.current = false;
    hasShownHintRef.current = false;
    setHasFlashlight(false);
    if (onExit) onExit('back_to_stories');
  };

  const room = currentRoomId ? roomsData?.[currentRoomId] : null;

  // Loading
  if (!room || phase === 'lobby') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-4xl mb-4">🚪</div>
          <p
            className="text-neutral-400 text-sm"
            style={{ fontFamily: 'serif' }}
          >
            جاري تحضير المكان...
          </p>
        </div>
      </div>
    );
  }

  // Won
  if (won) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="text-7xl mb-6">🎬</div>
          <h1
            className="text-4xl font-bold text-amber-400 mb-4"
            style={{ fontFamily: 'serif' }}
          >
            خلصت الرحلة
          </h1>
          <p className="text-neutral-400 mb-8">
            عرفت الحقيقة. سامي مش هيتنسى.
          </p>
          <button
            onClick={handleBackToMenu}
            className="px-8 py-4 rounded-sm text-black font-bold text-lg border-2 border-amber-900/60 tracking-wider"
            style={{
              background:
                'linear-gradient(180deg, #e0b060 0%, #b8863c 50%, #8a5f28 100%)',
              fontFamily: 'serif',
            }}
          >
            🏠 رجوع للقصص
          </button>
        </div>
      </div>
    );
  }

  // Game
  return (
    <div className="fixed inset-0 bg-black overflow-hidden select-none">
      <PanoramaViewer
        ref={panoramaRef}
        panoramaUrl={room.panorama}
        hotspots={room.hotspots}
        controlMode={controlMode}
        onHotspotClick={handleHotspotClick}
        isDark={darkMode}
        flashlightOn={flashlightOn}
        hasFlashlight={hasFlashlight}
      />

      {/* HUD */}
      <div className="absolute top-3 left-3 right-3 z-30 flex justify-between items-center gap-2">
        <button
          onClick={() => onExit && onExit('back_to_stories')}
          className="px-3 py-2 rounded-lg bg-black/60 backdrop-blur text-white text-sm"
        >
          ← القصص
        </button>

        <div className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur text-white text-sm">
          {room.title}
        </div>

        <div className="flex gap-2">
          {/* ✅ زرار الكشاف */}
          {darkMode && (
            <button
              onClick={() => toggleFlashlight()}
              className={`w-10 h-10 rounded-lg backdrop-blur text-white transition-all ${
                flashlightOn ? 'bg-amber-500/70' : 'bg-black/60'
              }`}
              title={hasFlashlight ? 'الكشاف' : 'الولاعة'}
            >
              {flashlightOn ? (hasFlashlight ? '🔦' : '🔥') : '🌑'}
            </button>
          )}

          <button
            onClick={() => setShowMap(true)}
            className="w-10 h-10 rounded-lg bg-black/60 backdrop-blur text-white"
            title="الخريطة"
          >
            🗺️
          </button>
          <button
            onClick={() => toggleSettings()}
            className="w-10 h-10 rounded-lg bg-black/60 backdrop-blur text-white"
          >
            ⚙️
          </button>
          <button
            onClick={() => toggleInventory()}
            className={`w-10 h-10 rounded-lg backdrop-blur text-white ${
              isInventoryOpen ? 'bg-amber-500/70' : 'bg-black/60'
            }`}
          >
            🎒
          </button>
        </div>
      </div>

      {/* Transition overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="absolute inset-0 z-40 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* Panels */}
      <Popup />
      <Inventory />
      <SettingsPanel />

      {showMap && (
        <HouseMap
          onClose={() => setShowMap(false)}
          onNavigate={(targetId) => changeRoom(targetId)}
        />
      )}

      {storyOverlay && (
        <StoryIntro
          data={storyOverlay.data}
          type={storyOverlay.type}
          onComplete={() => setStoryOverlay(null)}
        />
      )}

      {/* ✅ الفيديو الإجباري */}
      <AnimatePresence>
        {forcedVideo && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <video
              src={forcedVideo.url}
              autoPlay
              controls={false}
              className="max-w-full max-h-full"
              onEnded={() => setForcedVideo(null)}
              onError={() => setForcedVideo(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null, type: 'info' })}
      />

      {/* Puzzle modal */}
      <AnimatePresence>
        {activePuzzle && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePuzzle}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-700"
            >
              <PuzzleRenderer
                puzzleId={activePuzzle.puzzleId}
                onSubmit={handlePuzzleSubmit}
                onHint={() => {}}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}