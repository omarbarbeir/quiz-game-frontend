class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.enabled = false;

    this.ambientSource = null;
    this.ambientGain = null;
    this.ambientUrl = null;

    this.footstepBuffer = null;
    this.ambientVolume = 0.3;
    this.footstepVolume = 0.4;
  }

  async init() {
    if (this.enabled) return;

    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') await this.ctx.resume();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1;
      this.masterGain.connect(this.ctx.destination);

      // ✅ حمّل صوت الخطوات مرة واحدة
      try {
        const res = await fetch('/audio/sfx/footstep_wood.ogg');
        const arr = await res.arrayBuffer();
        this.footstepBuffer = await this.ctx.decodeAudioData(arr);
      } catch (e) {
        console.warn('Footstep load failed');
      }

      this.enabled = true;
      console.log('✅ AudioManager ready');
    } catch (e) {
      console.warn('AudioManager init failed:', e);
    }
  }

  async playAmbient(url, volume = 0.3, fadeTime = 1.5) {
    if (!this.enabled || !url) return;

    // لو نفس الملف شغال، بس نغيّر الصوت
    if (this.ambientUrl === url && this.ambientSource) {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.linearRampToValueAtTime(volume, now + fadeTime);
      this.ambientVolume = volume;
      return;
    }

    // وقف القديم
    if (this.ambientSource) {
      const old = this.ambientSource;
      const oldGain = this.ambientGain;
      const now = this.ctx.currentTime;
      oldGain.gain.linearRampToValueAtTime(0, now + fadeTime);
      setTimeout(() => {
        try { old.stop(); } catch {}
      }, (fadeTime + 0.2) * 1000);
      this.ambientSource = null;
      this.ambientGain = null;
    }

    // حمّل الجديد
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('Not found: ' + url);
      const arr = await res.arrayBuffer();
      const buf = await this.ctx.decodeAudioData(arr);

      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.loopStart = 0;
      src.loopEnd = buf.duration;

      const g = this.ctx.createGain();
      g.gain.value = 0;
      src.connect(g).connect(this.masterGain);

      const now = this.ctx.currentTime;
      g.gain.linearRampToValueAtTime(volume, now + fadeTime);
      src.start(0);

      this.ambientSource = src;
      this.ambientGain = g;
      this.ambientUrl = url;
      this.ambientVolume = volume;
    } catch (e) {
      console.warn('Ambient load failed:', url);
    }
  }

  stopAmbient(fadeTime = 1.5) {
    if (!this.ambientSource) return;
    const old = this.ambientSource;
    const oldGain = this.ambientGain;
    const now = this.ctx.currentTime;
    oldGain.gain.linearRampToValueAtTime(0, now + fadeTime);
    setTimeout(() => {
      try { old.stop(); } catch {}
    }, (fadeTime + 0.2) * 1000);
    this.ambientSource = null;
    this.ambientGain = null;
    this.ambientUrl = null;
  }

  // ✅ API بسيط للـ App
  applyRoomAudio(audioConfig) {
    if (!this.enabled || !audioConfig) return;

    const layers = audioConfig.layers || [];
    if (layers.length === 0) {
      this.stopAmbient();
      return;
    }

    // بنستخدم أول layer بس
    const layer = layers[0];
    this.playAmbient(layer.url, layer.volume, audioConfig.fadeTime || 1.5);
  }

  stopAll() {
    console.log('🔇 AudioManager: stopAll');

    // وقف الـ ambient
    if (this.ambientSource) {
      try { this.ambientSource.stop(); } catch {}
      this.ambientSource = null;
      this.ambientGain = null;
      this.ambientUrl = null;
    }

    // اقفل الـ AudioContext
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }

    // صفّر الحالة
    this.enabled = false;
    this.footstepBuffer = null;
  }

  playFootstep() {
    if (!this.enabled || !this.footstepBuffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.footstepBuffer;
    const g = this.ctx.createGain();
    g.gain.value = this.footstepVolume;
    src.connect(g).connect(this.masterGain);
    src.start();
  }

  setFootstepVolume(v) { this.footstepVolume = v; }
}

export default new AudioManager();