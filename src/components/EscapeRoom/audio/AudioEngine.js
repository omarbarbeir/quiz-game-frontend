/**
 * ============================================================
 *  AudioEngine
 *  - Ambient loops (لكل غرفة)
 *  - Random events
 *  - Infrasound (Oscillator < 20Hz)
 *  - SFX
 *  - playTone (للألعاب اللي فيها ألحان)
 * ============================================================
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientSource = null;
    this.ambientGain = null;
    this.infraOsc = null;
    this.infraGain = null;
    this.eventTimer = null;
    this.buffers = {};
    this.unlocked = false;
    this.settings = {
      masterVolume: 0.9,
      ambientVolume: 1.0,
      sfxVolume: 0.9,
      infrasoundEnabled: true,
      eventsEnabled: true,
    };
  }

  // ============================================================
  // Unlock — بيستنى تفاعل المستخدم
  // ============================================================
  async unlock() {
    if (this.unlocked) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') await this.ctx.resume();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.settings.masterVolume;
      this.masterGain.connect(this.ctx.destination);

      this.unlocked = true;
      console.log('✅ AudioEngine unlocked, ctx state:', this.ctx.state);
    } catch (e) {
      console.warn('Audio unlock failed', e);
    }
  }

  // ============================================================
  // Load Buffer
  // ============================================================
  async loadBuffer(url) {
    if (this.buffers[url]) return this.buffers[url];
    const res = await fetch(url);
    const arr = await res.arrayBuffer();
    const buf = await this.ctx.decodeAudioData(arr);
    this.buffers[url] = buf;
    return buf;
  }

  // ============================================================
  // Ambient
  // ============================================================
  async playAmbient(url, volume = 0.5, { loop = true } = {}) {
    if (!this.unlocked || !url) return;

    if (this.ambientSource) {
      const old = this.ambientSource;
      const oldGain = this.ambientGain;
      const now = this.ctx.currentTime;
      oldGain.gain.cancelScheduledValues(now);
      oldGain.gain.setValueAtTime(oldGain.gain.value, now);
      oldGain.gain.linearRampToValueAtTime(0, now + 1.2);
      setTimeout(() => {
        try { old.stop(); } catch {}
      }, 1400);
    }

    let buf;
    try {
      buf = await this.loadBuffer(url);
    } catch (e) {
      console.warn('Ambient load failed:', url, e);
      return;
    }

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = loop;

    const g = this.ctx.createGain();
    g.gain.value = 0;
    src.connect(g).connect(this.masterGain);

    const now = this.ctx.currentTime;
    g.gain.linearRampToValueAtTime(volume * this.settings.ambientVolume, now + 1.2);

    src.start(0);
    this.ambientSource = src;
    this.ambientGain = g;
  }

  // ============================================================
  // Infrasound
  // ============================================================
  setInfrasound(options) {
    if (!this.unlocked) return;

    if (!options) {
      this.stopInfrasound();
      return;
    }

    const { freq, gain } = options;
    if (!freq || !gain) {
      this.stopInfrasound();
      return;
    }

    if (this.infraOsc) {
      const now = this.ctx.currentTime;
      this.infraOsc.frequency.linearRampToValueAtTime(freq, now + 1.5);
      this.infraGain.gain.linearRampToValueAtTime(
        gain * (this.settings.infrasoundEnabled ? 1 : 0),
        now + 1.5
      );
      return;
    }

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const g = this.ctx.createGain();
    g.gain.value = this.settings.infrasoundEnabled ? gain : 0;

    osc.connect(g).connect(this.masterGain);
    osc.start();

    this.infraOsc = osc;
    this.infraGain = g;
  }

  stopInfrasound() {
    if (!this.infraOsc) return;
    const now = this.ctx.currentTime;
    this.infraGain.gain.linearRampToValueAtTime(0, now + 0.8);
    const osc = this.infraOsc;
    setTimeout(() => {
      try { osc.stop(); } catch {}
      this.infraOsc = null;
      this.infraGain = null;
    }, 900);
  }

  pulseInfrasound({ duration = 600, freq = 16, gain = 0.2 } = {}) {
    if (!this.unlocked || !this.settings.infrasoundEnabled) return;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.value = 0;
    osc.connect(g).connect(this.masterGain);
    const now = this.ctx.currentTime;
    g.gain.linearRampToValueAtTime(gain, now + 0.15);
    g.gain.linearRampToValueAtTime(0, now + duration / 1000);
    osc.start();
    osc.stop(now + duration / 1000 + 0.1);
  }

  // ============================================================
  // ✅ playTone — للألعاب اللي فيها ألحان
  // ============================================================
  playTone(freq, duration = 500, volume = 0.25) {
    if (!this.unlocked || !this.ctx) {
      console.warn('playTone: AudioEngine not unlocked yet');
      return;
    }
    try {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.value = 0;
      osc.connect(g).connect(this.masterGain);

      const now = this.ctx.currentTime;
      g.gain.linearRampToValueAtTime(volume, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);

      osc.start();
      osc.stop(now + duration / 1000 + 0.1);
    } catch (e) {
      console.warn('playTone failed:', e);
    }
  }

  // ============================================================
  // Random Events
  // ============================================================
  startRandomEvents(events = []) {
    this.stopRandomEvents();
    if (!this.unlocked || !this.settings.eventsEnabled) return;
    if (!events.length) return;

    const scheduleNext = () => {
      const ev = events[Math.floor(Math.random() * events.length)];
      const delayMs = (ev.min + Math.random() * (ev.max - ev.min)) * 1000;
      this.eventTimer = setTimeout(async () => {
        try { await this.playSfx(ev.sound, 0.7); } catch {}
        scheduleNext();
      }, delayMs);
    };

    scheduleNext();
  }

  stopRandomEvents() {
    if (this.eventTimer) {
      clearTimeout(this.eventTimer);
      this.eventTimer = null;
    }
  }

  // ============================================================
  // SFX
  // ============================================================
  async playSfx(url, volume = 1) {
    if (!this.unlocked || !url) return;
    try {
      const buf = await this.loadBuffer(url);
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const g = this.ctx.createGain();
      g.gain.value = volume * this.settings.sfxVolume;
      src.connect(g).connect(this.masterGain);
      src.start();
    } catch (e) {}
  }

  // ============================================================
  // Settings
  // ============================================================
  setSettings(patch) {
    Object.assign(this.settings, patch);
    if (this.masterGain) {
      this.masterGain.gain.value = this.settings.masterVolume;
    }
    if (this.infraGain) {
      const cur = this.infraGain.gain.value;
      this.infraGain.gain.value = this.settings.infrasoundEnabled
        ? Math.max(cur, 0.05)
        : 0;
    }
    if (!this.settings.eventsEnabled) this.stopRandomEvents();
  }
}

const audioEngine = new AudioEngine();

// ✅ للتشخيص فقط — ممكن تشيله بعدين
if (typeof window !== 'undefined') {
  window.audioEngine = audioEngine;
}

export default audioEngine;