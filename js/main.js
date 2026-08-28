/**
 * Boot sequence.
 *
 *   loader -> poster + neighbour frames -> camera loop starts
 *
 * The camera (shared rAF) is the single heartbeat: it drives the canvas
 * renderer, the beat choreography, the chapter label, the audio cues
 * and the debug overlay. High-frequency state never touches layout or
 * per-element React-style rebinds; everything writes style/canvas
 * directly.
 */

import { JOURNEY, SEQUENCE } from "./config.js";
import { createCamera, journeyProgress, prefersReducedMotion } from "./core/scroll.js";
import { createSequence, createRenderer } from "./core/sequence.js";
import { createChoreography } from "./core/choreo.js";
import { createAudio } from "./core/audio.js";
import { createLoader } from "./ui/loader.js";
import { createChapters } from "./ui/chapters.js";
import { createCursor } from "./ui/cursor.js";
import { createDebug } from "./ui/debug.js";
import { createSoundControl, attachHoverBlips } from "./ui/sound.js";
import { renderContent, renderBeats } from "./ui/content.js";
import { createReveal } from "./ui/reveal.js";

// Always start from the top on page load / refresh
if (window.history.scrollRestoration) {
  window.history.scrollRestoration = "manual";
}
if (window.location.hash) {
  history.replaceState(null, "", window.location.pathname);
}
window.scrollTo(0, 0);

const journeyEl = document.getElementById("journey");
journeyEl.style.height = `${JOURNEY.scrollVh}vh`;
const stageEl = document.getElementById("stage");
const canvas = document.getElementById("film");
const beatLayer = document.getElementById("beats");
const indicator = document.getElementById("scroll-indicator");

// Static poster shown until the first frames decode (and as the
// reduced-motion hero). Same cover-fit math as the canvas.
const poster = document.getElementById("poster");
const posterImg = new Image();
posterImg.src = `${SEQUENCE.path}frame-${String(JOURNEY.posterFrame).padStart(SEQUENCE.padding, "0")}.${SEQUENCE.extension}`;
posterImg.onload = () => poster.appendChild(posterImg);

// Section 2 content and journey beats, all from the data file.
renderContent(document.getElementById("world"));
renderBeats(beatLayer);

const sequence = createSequence();
const renderer = createRenderer(canvas, sequence);
const reduced = prefersReducedMotion();
const choreography = createChoreography({
  stage: stageEl,
  beatEls: beatLayer,
  blackEdge: document.getElementById("black-edge"),
});
const audio = createAudio();
const chapters = createChapters({ audio });
const loader = createLoader();
const sound = createSoundControl({ audio });
const debug = createDebug();
const cursor = createCursor();
if (audio && sound) attachHoverBlips(audio);

// Visual click ripple effect
document.addEventListener("click", (e) => {
  const ripple = document.createElement("div");
  ripple.className = "click-ripple";
  ripple.style.left = e.clientX + "px";
  ripple.style.top = e.clientY + "px";
  document.body.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
});

// Disable right-click context menu
document.addEventListener("contextmenu", (e) => e.preventDefault());

function resize() {
  renderer.resize();
}
window.addEventListener("resize", resize, { passive: true });
resize();

// The single render heartbeat.
const camera = createCamera();
let indicatorHidden = false;

camera.onChange((smoothY, velocity) => {
  const progress = journeyProgress(smoothY, journeyEl);
  const frameIndex = Math.min(
    sequence.frameCount - 1,
    Math.floor(progress * (sequence.frameCount - 1)),
  );

  if (!reduced) {
    renderer.draw(frameIndex);

    // Camera depth: a slow dolly-in across the journey plus a small
    // velocity drift, so the film plane feels like it moves in 3D.
    const dolly = 1 + 0.05 * progress;
    const drift = Math.max(-8, Math.min(8, velocity * 0.05));
    canvas.style.transform = `translate3d(0, ${drift.toFixed(2)}px, 0) scale(${dolly.toFixed(4)})`;
  }
  choreography.apply(progress);

  const inJourney = smoothY < journeyEl.offsetTop + journeyEl.offsetHeight - window.innerHeight;
  const targetFrame = Math.max(1, Math.min(SEQUENCE.frameCount, Math.ceil(progress * SEQUENCE.frameCount)));
  renderer.draw(targetFrame);
  if (audio) audio.updateCues(targetFrame);
  choreography.applyChapter(progress, inJourney, chapters.renderChapter);

  if (!indicatorHidden) {
    const showIndicator = progress < 0.015 && smoothY < 40;
    indicator.classList.toggle("is-hidden", !showIndicator);
    if (!showIndicator) indicatorHidden = true;
  }

  if (debug) debug.update({ progress, frame: frameIndex, loaded: sequence.loadedCount });
});

// Progressive loading: bootstrap frames gate the loader, the rest
// trickle in behind the experience.
sequence.start().then(() => {
  renderer.draw(0);
  if (!reduced) {
    // Composite the poster into the canvas so the handoff is invisible.
    poster.classList.add("is-dimmed");
  } else {
    canvas.classList.add("is-hidden");
  }
  document.body.classList.add("is-ready");
  loader.dismiss();
  sequence.loadBackground();
});

sequence.onProgress(() => {
  loader.setProgress(sequence.loadedCount, sequence.frameCount);
});
loader.setProgress(0, sequence.frameCount);

createReveal();
