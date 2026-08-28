/**
 * Sound control: a quiet mono toggle, top-right. Initializes the
 * AudioContext on first interaction, respects autoplay policy.
 */

export function createSoundControl({ audio }) {
  const button = document.getElementById("sound-toggle");
  let on = false; // default to off until gate answers

  function paint() {
    button.textContent = on ? "SOUND ON" : "SOUND OFF";
    button.setAttribute("aria-pressed", String(on));
  }

  let initialized = false;
  async function initAudio() {
    if (initialized) return;
    initialized = true;
    try {
      await audio.enable();
      await audio.primeUiSounds();
    } catch (e) {
      console.error(e);
    }
  }

  document.addEventListener("gate:enter", async (e) => {
    if (e.detail.withSound) {
      on = true;
      paint();
      await initAudio();
    } else {
      on = false;
      paint();
    }
  }, { once: true });

  button.addEventListener("click", async (e) => {
    e.stopPropagation(); // prevent global handler
    
    if (on) {
      audio.disable();
      on = false;
      paint();
    } else {
      button.textContent = "SOUND...";
      on = true;
      await initAudio();
      paint();
    }
  });

  paint();
  return { blip: (kind) => audio.blip(kind) };
}

/** Wires hover and click blips to interactive elements once sound is enabled. */
export function attachHoverBlips(audio) {
  const canHover = window.matchMedia("(hover: hover)").matches;
  
  if (canHover) {
    document.addEventListener("pointerover", (event) => {
      if (event.target.closest("a, button")) audio.blip("hover");
    }, { passive: true });
  }
  
  document.addEventListener("click", () => {
    audio.blip("click");
  }, { passive: true });
}
