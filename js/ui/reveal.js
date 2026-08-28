/**
 * Scroll reveal: adds .is-visible to .reveal elements as they enter
 * the viewport. One-shot, staggered via the --d delay set in content.js.
 */

export function createReveal() {
  const els = Array.from(document.querySelectorAll(".reveal"));
  if (!("IntersectionObserver" in window)) {
    for (const el of els) el.classList.add("is-visible");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
  );

  for (const el of els) observer.observe(el);
}
