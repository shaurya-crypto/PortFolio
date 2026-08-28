const INTERACTIVE = 'a, button, [data-cursor]';

export function createCursor() {
  if (!window.matchMedia("(pointer: fine)").matches) return null;

  const root = document.getElementById("cursor");
  const labelEl = root.querySelector("[data-cursor-label]");

  let x = -100;
  let y = -100;
  let shownX = x;
  let shownY = y;
  let raf = 0;

  document.addEventListener("pointermove", (event) => {
    x = event.clientX;
    y = event.clientY;
    root.classList.add("is-visible");
  }, { passive: true });

  document.addEventListener("pointerdown", () => root.classList.add("is-down"));
  document.addEventListener("pointerup", () => root.classList.remove("is-down"));

  document.addEventListener("pointerover", (event) => {
    const target = event.target.closest(INTERACTIVE);
    if (target) {
      labelEl.textContent = target.dataset.cursor || "";
      root.classList.add("is-active");
    } else {
      root.classList.remove("is-active");
      labelEl.textContent = "";
    }
  });

  document.addEventListener("pointerleave", () => root.classList.remove("is-visible"));
  document.addEventListener("pointerenter", () => root.classList.add("is-visible"));

  let lastTime = performance.now();
  function tick(now) {
    const dt = Math.min((now - lastTime) / 16.667, 4);
    lastTime = now;
    
    const ease = 0.25;
    const factor = 1 - Math.pow(1 - ease, dt);

    shownX += (x - shownX) * factor;
    shownY += (y - shownY) * factor;
    root.style.transform = `translate3d(${shownX.toFixed(1)}px, ${shownY.toFixed(1)}px, 0)`;
    raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      root.remove();
    },
  };
}
