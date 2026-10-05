/**
 * ============================================================
 *  VoiceClue.js
 *  نظام تشغيل صوت الجد مرة واحدة فقط لكل دليل
 *  ✅ يدعم قصص متعددة (storyId-based storage)
 * ============================================================
 */

import audioEngine from '../audio/AudioEngine';

const STORAGE_KEY_PREFIX = 'er_played_voice_clues_';

// ============================================================
// Helpers
// ============================================================
function getStorageKey(storyId) {
  return STORAGE_KEY_PREFIX + (storyId || 'default');
}

// ============================================================
// hasPlayedVoice
// ============================================================
export function hasPlayedVoice(storyId, itemId) {
  try {
    const key = getStorageKey(storyId);
    const played = JSON.parse(localStorage.getItem(key) || '{}');
    return !!played[itemId];
  } catch {
    return false;
  }
}

// ============================================================
// markVoiceAsPlayed
// ============================================================
export function markVoiceAsPlayed(storyId, itemId) {
  try {
    const key = getStorageKey(storyId);
    const played = JSON.parse(localStorage.getItem(key) || '{}');
    played[itemId] = Date.now();
    localStorage.setItem(key, JSON.stringify(played));
  } catch {}
}

// ============================================================
// playVoiceIfFirstTime
// ============================================================
export function playVoiceIfFirstTime(storyId, itemId, audioUrl) {
  if (!itemId || !audioUrl) return false;
  if (hasPlayedVoice(storyId, itemId)) return false;

  const audio = new Audio(audioUrl);
  audio.volume = 0.9;
  audio.play().catch((e) => {
    console.warn('Voice play failed:', e);
  });

  markVoiceAsPlayed(storyId, itemId);
  return true;
}

// ============================================================
// resetVoiceClues
// ============================================================
export function resetVoiceClues(storyId) {
  try {
    if (storyId) {
      localStorage.removeItem(getStorageKey(storyId));
    } else {
      // صفّر كل القصص
      Object.keys(localStorage)
        .filter((k) => k.startsWith(STORAGE_KEY_PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    }
  } catch {}
}