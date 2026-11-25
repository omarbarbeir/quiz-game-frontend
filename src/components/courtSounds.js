// courtSounds.js
// 🔔 محرك أصوات المحكمة — يدعم ملفات صوت خارجية

class CourtSoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.7;
    this._unlocked = false;
    this.custom = {};
    this.paths = {};
    this._loaded = false;
  }

  // ══════════════════════════════════════════════
  // Initialize
  // ══════════════════════════════════════════════
  async unlock() {
    if (this._unlocked) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      if (this.ctx.state === "suspended") await this.ctx.resume();
      this._unlocked = true;
    } catch (e) {
      console.warn("[Court Sounds] Unlock failed:", e);
    }
  }

  // ══════════════════════════════════════════════
  // تحميل ملفات الصوت
  // ══════════════════════════════════════════════
  loadSounds(paths) {
    this.paths = paths || {};
    Object.entries(this.paths).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = "auto";
      audio.addEventListener("canplaythrough", () => {
        this.custom[key] = audio;
      }, { once: true });
      audio.addEventListener("error", () => {
        console.warn(`[Court Sounds] Failed to load: ${key} → ${url}`);
      }, { once: true });
    });
    this._loaded = true;
  }

  setEnabled(v) {
    this.enabled = !!v;
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
  }

  // ══════════════════════════════════════════════
  // Play Sound
  // ══════════════════════════════════════════════
  play(name) {
    if (!this.enabled) return;

    // 1) جرّب ملف الصوت الخارجي
    const custom = this.custom[name];
    if (custom) {
      try {
        const clone = custom.cloneNode();
        clone.volume = this.volume;
        clone.play().catch((e) => {
          console.warn(`[Court Sounds] Play failed for ${name}:`, e.message);
        });
        return;
      } catch (e) {
        console.warn(`[Court Sounds] Clone failed for ${name}:`, e.message);
      }
    }

    // 2) لو مفيش ملف → ملاحظة في الكونسول
    console.log(`[Court Sounds] No file for: ${name}`);
  }
}

// ══════════════════════════════════════════════
// Singleton
// ══════════════════════════════════════════════
let instance = null;

export function getCourtSounds() {
  if (!instance) {
    instance = new CourtSoundEngine();
  }
  return instance;
}

export default CourtSoundEngine;