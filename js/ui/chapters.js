/**
 * Chapter system: the fixed name mark top-left, the film-chapter label
 * top-right that turns into an INDEX button once the visitor leaves the
 * journey, and the minimal anchor menu behind it.
 */

import { CHAPTERS } from "../config.js";
import { portfolio } from "../data/portfolio.js";

const INDEX_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Capabilities", href: "#capabilities" },
  { label: "Evidence", href: "#evidence" },
  { label: "Goals", href: "#goals" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function createChapters({ audio }) {
  const label = document.getElementById("chapter-label");
  const toggle = document.getElementById("chapter-toggle");
  const menu = document.getElementById("index-menu");
  const mark = document.getElementById("mark");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  mark.textContent = portfolio.name.toUpperCase();

  function renderChapter(id, progress, inJourney) {
    if (inJourney) {
      const chapter = CHAPTERS.find((c) => c.id === id);
      label.textContent = chapter ? chapter.label : "";
      label.hidden = false;
      toggle.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    } else {
      label.hidden = true;
      toggle.hidden = false;
    }
  }

  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "CLOSE" : "INDEX";
  }

  toggle.addEventListener("click", () => {
    audio.blip("click");
    setMenu(!menu.classList.contains("is-open"));
  });

  menu.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (link) {
      event.preventDefault();
      const targetId = link.getAttribute("href").replace("#", "");
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" });
      }
      setMenu(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
  });

  mark.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  });

  return { renderChapter };
}
