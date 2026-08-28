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

import { JOURNEY, SEQUENCE, PORTRAIT_SEQUENCE } from "./config.js";
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
import { initMeteors } from "./ui/meteors.js";

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

// Section 2: Portrait
const portraitEl = document.getElementById("portrait-section");
const portraitCanvas = document.getElementById("portrait-film");
const portraitTitles = document.getElementById("portrait-titles");
const portraitChapters = document.querySelectorAll(".portrait-chapter");

// Initialize Meteors
initMeteors("meteors-container", 30);

// Static poster
const poster = document.getElementById("poster");
const posterImg = new Image();
posterImg.src = `${SEQUENCE.path}frame-${String(JOURNEY.posterFrame).padStart(SEQUENCE.padding, "0")}.${SEQUENCE.extension}`;
posterImg.onload = () => poster.appendChild(posterImg);

// World
renderContent(document.getElementById("world"));
renderBeats(beatLayer);

// First Sequence
const sequence = createSequence(SEQUENCE);
const renderer = createRenderer(canvas, sequence);

// Second Sequence
const pSequence = createSequence(PORTRAIT_SEQUENCE);
const pRenderer = createRenderer(portraitCanvas, pSequence);

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
document.addEventListener("contextmenu", (e) => e.preventDefault());

function resize() {
  renderer.resize();
  pRenderer.resize();
}
window.addEventListener("resize", resize, { passive: true });
resize();

// The single render heartbeat.
const camera = createCamera();
let indicatorHidden = false;
let hasPlayedTurnStart = false;

camera.onChange((smoothY, velocity) => {
  // --- Section 1: House Sequence ---
  const progress1 = journeyProgress(smoothY, journeyEl);
  const frameIndex1 = Math.min(
    sequence.frameCount - 1,
    Math.floor(progress1 * (sequence.frameCount - 1)),
  );

  if (!reduced) {
    renderer.draw(frameIndex1);
    const dolly = 1 + 0.05 * progress1;
    const drift = Math.max(-8, Math.min(8, velocity * 0.05));
    canvas.style.transform = `translate3d(0, ${drift.toFixed(2)}px, 0) scale(${dolly.toFixed(4)})`;
  }
  choreography.apply(progress1);

  const inJourney = smoothY < journeyEl.offsetTop + journeyEl.offsetHeight - window.innerHeight;
  const targetFrame1 = Math.max(1, Math.min(SEQUENCE.frameCount, Math.ceil(progress1 * SEQUENCE.frameCount)));
  renderer.draw(targetFrame1);
  if (audio) audio.updateCues(targetFrame1);
  choreography.applyChapter(progress1, inJourney, chapters.renderChapter);

  // --- Section 2: Portrait Sequence ---
  const progress2 = journeyProgress(smoothY, portraitEl);
  
  // Start section 2 song early (last 3 frames of section 1 = ~0.987)
  if (audio) audio.updateSection2Audio(progress2, progress1);

  if (progress2 >= 0 && progress2 <= 1) {
    const frameIndex2 = Math.min(
      pSequence.frameCount - 1,
      Math.floor(progress2 * (pSequence.frameCount - 1)),
    );

    if (!reduced) {
      pRenderer.draw(frameIndex2);
    }

    let titleOpacity = 0;
    let titleY = 30;
    if (progress2 < 0.05) {
      const p = progress2 / 0.05;
      titleOpacity = p;
      titleY = 30 - 30 * p;
    } else if (progress2 < 0.15) {
      titleOpacity = 1;
      titleY = 0;
    } else if (progress2 < 0.25) {
      const p = (progress2 - 0.15) / 0.10;
      titleOpacity = 1 - p;
      titleY = -30 * p;
    }
    
    if (reduced) {
      portraitTitles.style.opacity = progress2 < 0.25 ? 1 : 0;
      portraitTitles.style.transform = `none`;
    } else {
      portraitTitles.style.opacity = titleOpacity.toFixed(2);
      portraitTitles.style.transform = `translateY(${titleY.toFixed(1)}px)`;
    }

    // Chapters 1 to 6 animations (distributed from 0.3 to 0.95)
    portraitChapters.forEach((chap, i) => {
      const start = 0.3 + i * 0.11;
      const end = start + 0.05;
      const fadeOutStart = end + 0.06;
      const fadeOutEnd = fadeOutStart + 0.03;
      
      let opacity = 0;
      let y = 20;

      if (progress2 >= start && progress2 <= end) {
        const p = (progress2 - start) / (end - start);
        opacity = p;
        y = 20 - 20 * p;
      } else if (progress2 > end && progress2 <= fadeOutStart) {
        opacity = 1;
        y = 0;
      } else if (progress2 > fadeOutStart && progress2 <= fadeOutEnd) {
        const p = (progress2 - fadeOutStart) / (fadeOutEnd - fadeOutStart);
        opacity = 1 - p;
        y = -20 * p;
      }
      
      // Final chapter stays pinned at the end
      if (i === 5 && progress2 > fadeOutStart) {
        opacity = 1;
        y = 0;
      }
      
      if (reduced) {
        chap.style.opacity = (progress2 >= start && (i === 5 || progress2 <= fadeOutStart)) ? 1 : 0;
        chap.style.transform = `none`;
      } else {
        chap.style.opacity = opacity.toFixed(2);
        chap.style.transform = `translateY(${y.toFixed(1)}px)`;
      }
    });

    // Example audio hook for turning
    if (progress2 > 0.15 && !hasPlayedTurnStart && audio) {
      hasPlayedTurnStart = true;
      audio.blip("hover"); // Placeholder until fonk is added
    } else if (progress2 < 0.10) {
      hasPlayedTurnStart = false;
    }
  }

  if (!indicatorHidden) {
    const showIndicator = progress1 < 0.015 && smoothY < 40;
    indicator.classList.toggle("is-hidden", !showIndicator);
    if (!showIndicator) indicatorHidden = true;
  }

  if (debug) debug.update({ progress: progress1, frame: frameIndex1, loaded: sequence.loadedCount });
});

// Progressive loading
sequence.start().then(() => {
  renderer.draw(0);
  if (!reduced) {
    poster.classList.add("is-dimmed");
  } else {
    canvas.classList.add("is-hidden");
  }
  document.body.classList.add("is-ready");
  loader.dismiss();
  
  // Load background for section 1, then queue section 2
  sequence.loadBackground().then(() => {
    pSequence.start().then(() => pSequence.loadBackground());
  });
});

sequence.onProgress(() => {
  loader.setProgress(sequence.loadedCount, sequence.frameCount);
});
loader.setProgress(0, sequence.frameCount);

createReveal();
