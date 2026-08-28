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
  let enabled = false;

  const reversedBuffers = new Map();
  let lastFrame = 1;

  async function loadCue(id, spec) {
    try {
      const res = await fetch(AUDIO.folder + spec.file);
      if (!res.ok) throw new Error(res.status);
      const buffer = await ctx.decodeAudioData(await res.arrayBuffer());
      buffers.set(id, buffer);

      // Create reversed buffer
      const reversed = ctx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        const dest = reversed.getChannelData(i);
        dest.set(buffer.getChannelData(i));
        dest.reverse();
      }
      reversedBuffers.set(id, reversed);
    } catch {
      // No file, no cue. Stay silent about it in production.
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
    try {
      const res = await fetch(AUDIO.ambient);
      if (res.ok) {
        const buffer = await ctx.decodeAudioData(await res.arrayBuffer());
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const gain = ctx.createGain();
        gain.gain.value = AUDIO.ambientVolume;
        source.connect(gain).connect(master);
        source.start();
        ambient = source;
      }
    } catch {
      ambient = null;
    }
    return true;
  }

  function disable() {
    enabled = false;
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
    if (ambient) {
      try { ambient.stop(ctx.currentTime + 0.3); } catch {}
      ambient = null;
    }
  }

  /** Fire armed cues when crossing their specific frame up or down. */
  function updateCues(frame) {
    if (!enabled) return;
    for (const [id, spec] of Object.entries(AUDIO_CUES)) {
      const target = spec.frame;
      if (lastFrame < target && frame >= target) {
        // Forward cross
        const buffer = buffers.get(id);
        if (buffer) playBuffer(buffer, spec.volume);
      } else if (lastFrame > target && frame <= target) {
        // Backward cross
        const buffer = reversedBuffers.get(id);
        if (buffer) playBuffer(buffer, spec.volume);
      }
    }
    lastFrame = frame;
  }

  /** Small UI blips for hover/click, only while sound is on. */
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

  return {
    enable,
    disable,
    updateCues,
    blip,
    primeUiSounds,
    get enabled() {
      return enabled;
    },
  };
}
