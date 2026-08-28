/**
 * Development-only cinematic debug overlay (?debug=1).
 * Shows scroll progress, current frame, loading status and FPS.
 * Never rendered in production builds.
 */

import { SEQUENCE } from "../config.js";

export function createDebug() {
  if (!new URLSearchParams(location.search).has("debug")) return null;

  const root = document.createElement("aside");
  root.className = "debug";
  root.setAttribute("aria-hidden", "true");
  document.body.append(root);

  let frames = 0;
  let fps = 0;
  let last = performance.now();

  function tick(now) {
    frames += 1;
    if (now - last >= 1000) {
      fps = frames;
      frames = 0;
      last = now;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  return {
    update({ progress, frame, loaded }) {
      root.textContent =
        `progress ${(progress * 100).toFixed(1)}%` +
        ` | frame ${frame + 1}/${SEQUENCE.frameCount}` +
        ` | loaded ${loaded}/${SEQUENCE.frameCount}` +
        ` | ${fps} fps`;
    },
  };
}
