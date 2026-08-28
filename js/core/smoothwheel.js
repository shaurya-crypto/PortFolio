/**
 * Wheel smoothing (Lenis-style): intercepts wheel input on fine-pointer
 * devices and drives window.scrollTo through an eased animation loop,
 * so the whole page glides instead of stepping. Keyboard, scrollbar and
 * touch stay native and resync the target. Disabled for reduced motion.
 */

export function createSmoothWheel() {
  const fine = window.matchMedia("(pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduced) return null;

  let target = window.scrollY;
  let running = false;

  const maxScroll = () =>
    Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  function tick() {
    const diff = target - window.scrollY;
    if (Math.abs(diff) < 0.5) {
      running = false;
      return;
    }
    window.scrollTo(0, window.scrollY + diff * 0.16);
    requestAnimationFrame(tick);
  }

  window.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey) return; // let pinch-zoom through
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 24 : 1; // line mode (Firefox)
      target = Math.min(Math.max(target + event.deltaY * unit, 0), maxScroll());
      if (!running) {
        running = true;
        requestAnimationFrame(tick);
      }
    },
    { passive: false },
  );

  // Any non-wheel scroll (keys, scrollbar drag, anchors) resyncs the target.
  window.addEventListener(
    "scroll",
    () => {
      if (!running) target = window.scrollY;
    },
    { passive: true },
  );

  window.addEventListener("resize", () => {
    target = Math.min(target, maxScroll());
  }, { passive: true });

  return { get target() { return target; } };
}
