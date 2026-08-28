/**
 * Central configuration for the cinematic experience.
 * All timing, sequence and cue constants live here. Nothing animation
 * related should hard-code values that belong in this file.
 */

export const SEQUENCE = {
  path: "assets/sequences/house/",
  frameCount: 240,
  extension: "jpg",
  padding: 4,
};

/** Scroll length of the cinematic journey, in viewport heights. */
export const JOURNEY = {
  scrollVh: 1050,
  /** Poster frame shown before loading completes and under reduced motion. */
  posterFrame: 1,
  /** Frames considered "usable" before the loader dismisses itself. */
  bootstrapFrames: 14,
  /** Parallel image requests during the background phase. */
  backgroundConcurrency: 4,
};

/** Device pixel ratio cap for the canvas renderer. */
export const MAX_DPR = 2;
/** Cap for the canvas backing-store width, keeps 4K screens honest. */
export const MAX_CANVAS_WIDTH = 2560;

/**
 * Narrative beats over journey progress (0..1).
 * Each beat fades in around `start` and out around `end`
 * with `fade` controlling the ramp width.
 */
export const BEATS = [
  { id: "arrival", start: 0.0, end: 0.14, fade: 0.05 },
  { id: "practice", start: 0.18, end: 0.3, fade: 0.05 },
  { id: "craft", start: 0.33, end: 0.43, fade: 0.05 },
  { id: "work", start: 0.47, end: 0.57, fade: 0.05 },
  { id: "portal", start: 0.84, end: 0.99, fade: 0.04 },
];

/** Film-chapter labels shown top-right while inside the journey. */
export const CHAPTERS = [
  { id: "arrival", label: "01 / ARRIVAL", until: 0.3 },
  { id: "threshold", label: "02 / THRESHOLD", until: 0.6 },
  { id: "interior", label: "03 / INTERIOR", until: 0.85 },
  { id: "digital", label: "04 / DIGITAL", until: 1 },
];

/**
 * Audio cue thresholds on specific frames.
 * Plays forwards when crossing forward, and reversed when crossing backwards.
 */
export const AUDIO_CUES = {
  exteriorMove: { frame: 36, file: "street-wind-sweep.wav", volume: 0.5 },
  doorOpen: { frame: 105, file: "heavy-studio-door.wav", volume: 0.7 },
  interiorEntry: { frame: 144, file: "room-reverb-swell.wav", volume: 0.5 },
  workstationReveal: { frame: 201, file: "digital-power-up-chime.wav", volume: 0.5 },
  transition: { frame: 238, file: "deep-bass-impact.wav", volume: 0.6 },
};

export const AUDIO = {
  ambient: "assets/audio/low-frequency-drone.wav",
  ambientVolume: 0.7,
  folder: "assets/audio/",
  hysteresis: 0.025,
};

export const SMOOTH_SCROLL = {
  /** Lerp factor per frame at 60fps. Lower = heavier camera. */
  ease: 0.085,
  /** Below this delta (px) the value snaps, ends the drift. */
  epsilon: 0.1,
};
