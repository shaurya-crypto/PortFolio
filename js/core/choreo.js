/**
 * Scroll choreography: maps journey progress to typography and effects.
 *
 * Everything is deterministic: progress in, style out. No timers, no
 * random. Beats use translate / opacity / blur so the text feels
 * attached to the camera rather than fading like a website widget.
 */

import { BEATS, CHAPTERS } from "../config.js";

function beatAlpha(progress, beat) {
  const { start, end, fade } = beat;
  if (progress < start - fade || progress > end + fade) return 0;
  if (progress < start) return 1 - (start - progress) / fade;
  if (progress > end) return 1 - (progress - end) / fade;
  return 1;
}

const smoothstep = (t) => t * t * (3 - 2 * t);

export function createChoreography({ stage, beatEls, blackEdge }) {
  const beatStates = BEATS.map((beat) => {
    const el = beatEls.querySelector(`[data-beat="${beat.id}"]`);
    return { beat, el, lastAlpha: -1 };
  });

  let lastChapter = "";

  function apply(progress) {
    for (const state of beatStates) {
      if (!state.el) continue;
      const a = beatAlpha(progress, state.beat);
      if (a === state.lastAlpha) continue;
      state.lastAlpha = a;

      const style = state.el.style;
      if (a <= 0) {
        style.visibility = "hidden";
        style.opacity = "0";
        continue;
      }
      const t = smoothstep(a);
      style.visibility = "visible";
      style.opacity = t.toFixed(3);
      style.transform =
        `perspective(900px) translate3d(0, ${((1 - t) * 18).toFixed(2)}px, ${((1 - t) * -60).toFixed(0)}px)` +
        ` rotateX(${((1 - t) * 4).toFixed(2)}deg)`;
      style.filter = a < 1 ? `blur(${((1 - t) * 5).toFixed(2)}px)` : "none";
      style.letterSpacing = a < 1 ? `${(0.02 * (1 - t)).toFixed(4)}em` : "normal";
    }

    if (blackEdge) {
      // Final handoff: the dark monitor screen swallows the frame and
      // Section 2 begins on the same black. Solid colour, no gradient.
      const edge = progress < 0.93 ? 0 : Math.min(1, (progress - 0.93) / 0.07);
      blackEdge.style.opacity = edge.toFixed(3);
      blackEdge.style.visibility = edge > 0 ? "visible" : "hidden";
    }
  }

  function chapterFor(progress, inJourney) {
    if (!inJourney) return "index";
    const chapter = CHAPTERS.find((c) => progress <= c.until);
    return chapter ? chapter.id : CHAPTERS[CHAPTERS.length - 1].id;
  }

  function applyChapter(progress, inJourney, renderChapter) {
    const id = chapterFor(progress, inJourney);
    if (id === lastChapter) return;
    lastChapter = id;
    renderChapter(id, progress, inJourney);
  }

  return { apply, applyChapter };
}
