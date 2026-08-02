/**
 * Pure Web Audio API Sound & Music Synthesizer
 * Zero external audio files required!
 */
const SoundManager = {
  ctx: null,
  muted: false,
  landingAudio: null,
  landingBuffer: null,
  bgmInterval: null,
  bgmStep: 0,

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
    if (!this.landingAudio) {
      const audioSrc = typeof LANDING_SOUND_DATA !== "undefined" ? LANDING_SOUND_DATA : "airplane_landing_sound.mp3";
      if (typeof document !== "undefined" && document.getElementById("landingAudio")) {
        this.landingAudio = document.getElementById("landingAudio");
        if (!this.landingAudio.src || this.landingAudio.src === "about:blank") {
          this.landingAudio.src = audioSrc;
        }
      } else if (typeof Audio !== "undefined") {
        try {
          this.landingAudio = new Audio(audioSrc);
          this.landingAudio.preload = "auto";
        } catch (_) {}
      }
    }
    if (this.ctx && !this.landingBuffer) {
      this.preloadLandingMp3();
    }
    if (this.ctx && !this.muted) {
      this.startBgm();
    }
  },

  startBgm() {
    if (this.muted || this.bgmInterval || !this.ctx) return;
    this.bgmStep = 0;

    // Cozy Ambient Chord Progression (Cmaj7 -> Fmaj7 -> Am7 -> G6)
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [196.00, 246.94, 293.66, 329.63], // G6
    ];
    const melodyNotes = [523.25, 659.25, 783.99, 880.00, 987.77, 1046.50];

    const playStep = () => {
      if (this.muted || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const chordIdx = Math.floor(this.bgmStep / 4) % chords.length;
        const currentChord = chords[chordIdx];

        // 1. Warm Ambient Synth Pad Chord (Every 4 beats)
        if (this.bgmStep % 4 === 0) {
          currentChord.forEach((freq) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, now);

            filter.type = "lowpass";
            filter.frequency.setValueAtTime(600, now);

            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.022, now + 0.4);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 3.4);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 3.5);
          });
        }

        // 2. Soft Lo-Fi Arpeggio Note (Every beat)
        const noteFreq = melodyNotes[(this.bgmStep * 3 + chordIdx * 2) % melodyNotes.length];
        const melOsc = this.ctx.createOscillator();
        const melGain = this.ctx.createGain();

        melOsc.type = "triangle";
        melOsc.frequency.setValueAtTime(noteFreq, now);

        melGain.gain.setValueAtTime(0.012, now);
        melGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.55);

        melOsc.connect(melGain);
        melGain.connect(this.ctx.destination);

        melOsc.start(now);
        melOsc.stop(now + 0.6);

        this.bgmStep += 1;
      } catch (_) {}
    };

    playStep();
    this.bgmInterval = setInterval(playStep, 920); // 920ms tempo (~65 BPM)
  },

  stopBgm() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  },

  preloadLandingMp3() {
    if (typeof fetch === "undefined" || !this.ctx) return;
    const audioSrc = typeof LANDING_SOUND_DATA !== "undefined" ? LANDING_SOUND_DATA : "airplane_landing_sound.mp3";
    fetch(audioSrc)
      .then((res) => {
        if (!res.ok) throw new Error("HTTP error " + res.status);
        return res.arrayBuffer();
      })
      .then((buffer) => {
        if (this.ctx) {
          return this.ctx.decodeAudioData(buffer);
        }
      })
      .then((decoded) => {
        if (decoded) {
          this.landingBuffer = decoded;
        }
      })
      .catch(() => {});
  },

  toggleMute() {
    this.muted = !this.muted;
    const btn = document.getElementById("soundToggle");
    if (btn) {
      btn.textContent = this.muted ? "🔇 Muted" : "🔊 Sound";
    }
    if (this.muted) {
      this.stopBgm();
    } else {
      this.startBgm();
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

      // Soft radio click thud (Not a chirp!)
      osc.type = "sine";
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.03);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.03);
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
      osc.frequency.setValueAtTime(320, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.02);
    } catch (_) {}
  },

  playLandChime() {
    if (this.muted) return;
    this.init();

    // 1. Play decoded Web Audio MP3 Buffer (Zero latency, 100% reliable)
    if (this.ctx && this.landingBuffer) {
      try {
        const source = this.ctx.createBufferSource();
        source.buffer = this.landingBuffer;
        const gainNode = this.ctx.createGain();
        gainNode.gain.value = 0.35;
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(0);
        return;
      } catch (_) {}
    }

    // 2. Play persistent HTML5 Audio element
    if (this.landingAudio) {
      try {
        this.landingAudio.currentTime = 0;
        this.landingAudio.volume = 0.35;
        this.landingAudio.play().catch(() => {});
      } catch (_) {}
    }
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

if (typeof window !== "undefined") {
  const triggerInit = () => {
    SoundManager.init();
  };
  window.addEventListener("DOMContentLoaded", triggerInit, { once: true });
  window.addEventListener("pointerdown", triggerInit, { once: true });
  window.addEventListener("click", triggerInit, { once: true });
}
