/**
 * Audio architecture.
 *
 * Event-based only: cues fire when journey progress crosses their
 * threshold upward, one-shot, re-armed after the visitor retreats past
 * the threshold minus hysteresis. Missing files disable their own cue
 * silently. Nothing audible happens before the visitor enables sound.
 */

import { AUDIO, AUDIO_CUES } from "../config.js";

export function createAudio() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const buffers = new Map();
  const master = ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);

  let ambient = null;
  let ambientGain = null;
  let enabled = false;

  // Section 2: scroll-synced <audio> element
  const s2Audio = new Audio("assets/audio/section2enter_final.mp3");
  s2Audio.preload = "auto";
  s2Audio.loop = false;
  s2Audio.volume = 0;
  let s2Ready = false;
  let s2Active = false;
  s2Audio.addEventListener("canplaythrough", () => { s2Ready = true; }, { once: true });

  const reversedBuffers = new Map();
  let lastFrame = 1;

  async function loadCue(id, spec) {
    try {
      const res = await fetch(AUDIO.folder + spec.file);
      if (!res.ok) throw new Error(res.status);
      const buffer = await ctx.decodeAudioData(await res.arrayBuffer());
      buffers.set(id, buffer);

      const reversed = ctx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        const dest = reversed.getChannelData(i);
        dest.set(buffer.getChannelData(i));
        dest.reverse();
      }
      reversedBuffers.set(id, reversed);
    } catch {
      console.warn(`[audio] cue "${id}" unavailable (${spec.file})`);
    }
  }

  function playBuffer(buffer, volume) {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(master);
    source.start();
    return source;
  }

  let startSoundPlayed = false;

  async function enable() {
    if (enabled) return true;
    await ctx.resume();
    enabled = true;
    master.gain.value = 1;

    if (!startSoundPlayed) {
      startSoundPlayed = true;
      try {
        const res = await fetch(`${AUDIO.folder}starting.wav`);
        if (res.ok) {
          const buffer = await ctx.decodeAudioData(await res.arrayBuffer());
          playBuffer(buffer, 0.8);
        }
      } catch {}
    }

    await Promise.all(Object.entries(AUDIO_CUES).map(([id, spec]) => loadCue(id, spec)));
    
    // Load Section 1 Ambient
    try {
      const res = await fetch(AUDIO.ambient);
      if (res.ok) {
        const buffer = await ctx.decodeAudioData(await res.arrayBuffer());
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        if (buffer.duration > 0.5) {
          source.loopEnd = buffer.duration - 0.5;
        }
        ambientGain = ctx.createGain();
        ambientGain.gain.value = AUDIO.ambientVolume;
        source.connect(ambientGain).connect(master);
        source.start();
        ambient = source;
      }
    } catch {
      ambient = null;
    }

    // Prime section 2 audio
    try { s2Audio.load(); } catch {}

    return true;
  }

  function disable() {
    enabled = false;
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    if (ambient) {
      try { ambient.stop(ctx.currentTime + 0.3); } catch {}
      ambient = null;
    }
    s2Audio.pause();
    s2Audio.volume = 0;
    s2Active = false;
  }

  function updateCues(frame) {
    if (!enabled) return;
    for (const [id, spec] of Object.entries(AUDIO_CUES)) {
      const target = spec.frame;
      if (lastFrame < target && frame >= target) {
        const buffer = buffers.get(id);
        if (buffer) playBuffer(buffer, spec.volume);
      } else if (lastFrame > target && frame <= target) {
        const buffer = reversedBuffers.get(id);
        if (buffer) playBuffer(buffer, spec.volume);
      }
    }
    lastFrame = frame;
  }

  function blip(kind) {
    if (!enabled || !buffers.has(kind)) return;
    playBuffer(buffers.get(kind), 0.25);
  }

  async function primeUiSounds() {
    if (!enabled) return;
    await Promise.all(
      ["hover", "click"].map(async (id) => {
        try {
          const res = await fetch(`${AUDIO.folder}${id}.wav`);
          if (!res.ok) throw new Error(res.status);
          buffers.set(id, await ctx.decodeAudioData(await res.arrayBuffer()));
        } catch {
          /* optional */
        }
      }),
    );
  }

  /**
   * Called every frame from main.js.
   * Starts the song when entering section 2 OR during the last 3 frames
   * of section 1 (progress1 > 0.987). Loops while still inside section 2.
   * Fades out and stops when leaving section 2.
   */
  function updateSection2Audio(progress, progress1) {
    if (!enabled || !s2Ready) return;

    // Should the song be active?
    // YES if inside section 2 (progress > 0 && progress < 1)
    // YES if section 1 is about to end (last 3 frames ≈ progress1 > 0.987)
    const shouldPlay = (progress > 0 && progress < 1) || (progress1 > 0.987 && progress <= 0);

    if (!shouldPlay) {
      if (s2Active) {
        s2Audio.pause();
        s2Audio.currentTime = 0;
        s2Audio.volume = 0;
        s2Active = false;
        // Restore ambient
        if (ambientGain) {
          ambientGain.gain.linearRampToValueAtTime(AUDIO.ambientVolume, ctx.currentTime + 1.5);
        }
      }
      return;
    }

    // Start playing if not already
    if (!s2Active) {
      s2Active = true;
      s2Audio.currentTime = 0;
      s2Audio.loop = true;
      s2Audio.volume = 0;
      s2Audio.play().catch(() => {});
      // Fade ambient down
      if (ambientGain) {
        ambientGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5);
      }
    }

    // Smooth volume ramp up to target
    if (s2Audio.volume < 0.8) {
      s2Audio.volume = Math.min(s2Audio.volume + 0.02, 0.8);
    }

    // Loop 0.5s early
    if (s2Active && s2Audio.duration && s2Audio.currentTime >= s2Audio.duration - 1) {
      s2Audio.currentTime = 0;
    }
  }

  return {
    enable,
    disable,
    updateCues,
    blip,
    primeUiSounds,
    updateSection2Audio,
    get enabled() {
      return enabled;
    },
  };
}
