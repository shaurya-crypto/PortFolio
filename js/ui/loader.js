/**
 * Editorial loading state: INITIALIZING, a percentage, a hairline.
 * Dismisses as soon as the poster frame and its neighbours are ready,
 * never waits for the whole sequence.
 */

export function createLoader() {
  const root = document.getElementById("loader");
  const percentEl = root.querySelector("[data-loader-percent]");
  const barEl = root.querySelector("[data-loader-bar]");
  const total = 240;
  let dismissed = false;
  let targetPct = 0;
  let currentPct = 0;
  let readyToDismiss = false;
  let startTime = Date.now();

  function tick() {
    if (dismissed) return;
    const elapsed = Date.now() - startTime;
    // Force a 3 second minimum duration for the cinematic feel
    const timePct = Math.min(100, (elapsed / 3000) * 100);
    
    // The displayed percent is the minimum of how much time has passed and how much is actually loaded
    const displayPct = Math.min(timePct, targetPct);
    
    // Smooth lerp for the visual number
    currentPct += (displayPct - currentPct) * 0.1;
    
    const snapPct = Math.round(currentPct);
    percentEl.textContent = String(snapPct).padStart(3, "0");
    barEl.style.transform = `scaleX(${snapPct / 100})`;

    if (snapPct >= 99 && readyToDismiss) {
      showGate();
      return;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function setProgress(loaded, frameTotal) {
    if (dismissed) return;
    targetPct = Math.min(100, Math.round((loaded / (frameTotal || total)) * 100));
  }

  function dismiss() {
    readyToDismiss = true;
  }

  function showGate() {
    if (dismissed) return;
    document.getElementById("loader-progress").hidden = true;
    const gate = document.getElementById("loader-gate");
    gate.hidden = false;
    
    document.getElementById("gate-enter").addEventListener("click", () => enter(true), { once: true });
    document.getElementById("gate-mute").addEventListener("click", () => enter(false), { once: true });
  }

  function enter(withSound) {
    if (dismissed) return;
    dismissed = true;
    root.classList.add("is-done");
    root.setAttribute("aria-hidden", "true");
    setTimeout(() => root.remove(), 900);
    
    document.dispatchEvent(new CustomEvent("gate:enter", { detail: { withSound } }));
  }

  return { setProgress, dismiss, get dismissed() { return dismissed; } };
}
