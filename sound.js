/**
 * Pure Web Audio API Sound & Music Synthesizer
 * Zero external audio files required!
 */
const SoundManager = {
  ctx: null,
  muted: false,
  bgmNode: null,
  landingAudio: null,

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    if (!this.landingAudio && typeof Audio !== "undefined") {
      try {
        this.landingAudio = new Audio("airplane_landing_sound.mp3");
        this.landingAudio.preload = "auto";
      } catch (_) {}
    }
  },

  toggleMute() {
    this.muted = !this.muted;
    const btn = document.getElementById("soundToggle");
    if (btn) {
      btn.textContent = this.muted ? "🔇 Muted" : "🔊 Sound";
    }
    if (this.muted && this.bgmNode) {
      try { this.bgmNode.stop(); } catch (_) {}
      this.bgmNode = null;
    }
    return this.muted;
  },

  playSelect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (_) {}
  },

  playDrawTick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
    } catch (_) {}
  },

  playLandChime() {
    if (this.muted) return;
    this.init();

    if (this.landingAudio) {
      try {
        const soundClone = this.landingAudio.cloneNode();
        soundClone.volume = 0.85;
        const promise = soundClone.play();
        if (promise !== undefined) {
          promise.catch(() => {
            this.playSyntheticLand();
          });
        }
        return;
      } catch (_) {
        this.playSyntheticLand();
      }
    } else {
      this.playSyntheticLand();
    }
  },

  playSyntheticLand() {
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const squeakOsc = this.ctx.createOscillator();
      const squeakGain = this.ctx.createGain();
      squeakOsc.type = "sine";
      squeakOsc.frequency.setValueAtTime(2600, now);
      squeakOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);

      squeakGain.gain.setValueAtTime(0.25, now);
      squeakGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      squeakOsc.connect(squeakGain);
      squeakGain.connect(this.ctx.destination);

      squeakOsc.start(now);
      squeakOsc.stop(now + 0.12);
    } catch (_) {}
  },

  playWarning() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [0, 0.12].forEach((offset) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "square";
        osc.frequency.setValueAtTime(880, now + offset);

        gain.gain.setValueAtTime(0.08, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.08);
      });
    } catch (_) {}
  },

  playStageClear() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 Fanfare
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.22, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.5);
      });
    } catch (_) {}
  },

  playGameOver() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440.00, 349.23, 293.66]; // A4, F4, D4 Minor Descending
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + idx * 0.18);

        gain.gain.setValueAtTime(0.15, now + idx * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 0.4);
      });
    } catch (_) {}
  }
};
