/**
 * Smooth scrolling and the shared render loop.
 *
 * Native scroll stays untouched (scrollbar, keyboard, touch all keep
 * working). A lerp on the read side gives the camera its heavy, expensive
 * feel: `smoothY` drifts toward `window.scrollY` every frame and every
 * consumer derives position from `smoothY`, never from raw scroll events.
 */

import { SMOOTH_SCROLL } from "../config.js";

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function createCamera() {
  const listeners = new Set();
  const reduced = prefersReducedMotion();
  let smoothY = window.scrollY;
  let velocity = 0;

  // Initialize Lenis
  const lenis = new window.Lenis({
    lerp: 0.04, // Very smooth, heavy feel
    wheelMultiplier: 0.6, // Scroll slower
    smoothWheel: !reduced,
  });

  lenis.on('scroll', (e) => {
    smoothY = e.scroll;
    velocity = e.velocity;
  });

  function tick(time) {
    lenis.raf(time);
    for (const fn of listeners) fn(smoothY, velocity);
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);

  return {
    reduced,
    get smoothY() {
      return smoothY;
    },
    get velocity() {
      return velocity;
    },
    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

/** Progress of the pinned journey section, 0..1, from a smoothed Y. */
export function journeyProgress(smoothY, journeyEl) {
  const total = journeyEl.offsetHeight - window.innerHeight;
  if (total <= 0) return smoothY > journeyEl.offsetTop ? 1 : 0;
  return Math.min(1, Math.max(0, (smoothY - journeyEl.offsetTop) / total));
}
