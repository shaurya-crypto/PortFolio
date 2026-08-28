/**
 * Frame sequence loader and canvas renderer.
 *
 * One canvas, one off-DOM image cache. Loading order:
 *   1. poster frame
 *   2. its nearest neighbours (the first seconds of the journey)
 *   3. the rest of the sequence, low priority, small concurrency
 *
 * The renderer redraws only when the visible frame index changes and
 * falls back to the nearest already-loaded frame whenever a requested
 * one is still in flight, so scrubbing never blanks or blocks.
 */

import { SEQUENCE, JOURNEY, MAX_DPR, MAX_CANVAS_WIDTH } from "../config.js";

export function frameSrc(index, config = SEQUENCE) {
  const n = String(index + 1).padStart(config.padding, "0");
  const prefix = config.prefix || "frame-";
  return `${config.path}${prefix}${n}.${config.extension}`;
}

export function createSequence(config = SEQUENCE) {
  const frames = new Array(config.frameCount).fill(null);
  const listeners = new Set();
  let loadedCount = 0;
  let started = false;

  function notify() {
    for (const fn of listeners) fn();
  }

  function load(index, priorityQueue = false) {
    if (frames[index]) return Promise.resolve(frames[index]);
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        frames[index] = img;
        loadedCount += 1;
        notify();
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`[sequence] frame ${index + 1} failed to load from ${config.path}`);
        resolve(null);
      };
      img.src = frameSrc(index, config);
      if (priorityQueue) img.fetchPriority = "high";
    });
  }

  function loadRange(from, to, priority = false) {
    const jobs = [];
    for (let i = from; i <= to; i += 1) jobs.push(load(i, priority));
    return Promise.all(jobs);
  }

  async function loadBackground() {
    let next = JOURNEY.bootstrapFrames + 1;
    const workers = Array.from(
      { length: Math.min(JOURNEY.backgroundConcurrency, Math.max(1, config.frameCount - next + 1)) },
      async () => {
        while (next <= config.frameCount) {
          const current = next;
          next += 1;
          await load(current);
        }
      },
    );
    await Promise.all(workers);
  }

  function start() {
    if (started) return Promise.resolve();
    started = true;
    return loadRange(0, Math.min(JOURNEY.bootstrapFrames, config.frameCount - 1), true);
  }

  return {
    start,
    loadBackground,
    get frameCount() { return config.frameCount; },
    get loadedCount() { return loadedCount; },
    get(index) { return frames[index]; },
    nearestLoaded(index) {
      if (frames[index]) return index;
      for (let d = 1; d < config.frameCount; d += 1) {
        if (index - d >= 0 && frames[index - d]) return index - d;
        if (index + d < config.frameCount && frames[index + d]) return index + d;
      }
      return -1;
    },
    onProgress(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

export function createRenderer(canvas, sequence) {
  const ctx = canvas.getContext("2d", { alpha: false });
  let currentFrame = -1;
  let cssWidth = 0;
  let cssHeight = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    cssWidth = canvas.clientWidth || window.innerWidth;
    cssHeight = canvas.clientHeight || window.innerHeight;
    const scale = Math.min(1, MAX_CANVAS_WIDTH / (cssWidth * dpr));
    canvas.width = Math.round(cssWidth * dpr * scale);
    canvas.height = Math.round(cssHeight * dpr * scale);
    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";
    currentFrame = -1; 
  }

  function draw(index) {
    const resolved = sequence.nearestLoaded(index);
    if (resolved < 0 || resolved === currentFrame) return;
    const img = sequence.get(resolved);
    if (!img) return;

    const cw = canvas.width;
    const chh = canvas.height;
    const scale = Math.max(cw / img.naturalWidth, chh / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, (cw - dw) / 2, (chh - dh) / 2, dw, dh);
    currentFrame = resolved;
  }

  return { resize, draw, get currentFrame() { return currentFrame; } };
}
