// ============================================================
// Scroll-reveal helper — reveals elements as they enter the
// viewport using Tailwind animation utilities.
// ------------------------------------------------------------
// Usage:
//   <section data-reveal class="...">          // fade-up (default)
//   <div data-reveal="fade-down" ...>
//   <div data-reveal="zoom-in" data-reveal-delay="150" ...>
//
// The script re-scans the DOM automatically after the async
// site components (projects/skills/gallery/roadmap/...) render.
// Elements keep a fallback state so content stays visible if JS
// or IntersectionObserver is unavailable.
// ============================================================
(function () {
  'use strict';

  const REVEALED = 'is-revealed';
  const ANIM = 'animate-fade-up';

  function reveal(el) {
    if (el.classList.contains(REVEALED)) return;
    const anim = el.dataset.reveal || 'fade-up';
    el.classList.remove('reveal-init');
    el.classList.add(REVEALED, `animate-${anim}`);
  }

  // Fallback: force-reveal everything shortly after load in case
  // IntersectionObserver never fires (avoids permanently hidden content).
  let forced = false;
  function forceRevealAll() {
    if (forced) return;
    forced = true;
    document.querySelectorAll('[data-reveal].reveal-init').forEach(reveal);
  }

  function applyReveal(el) {
    if (el.dataset.revealBound) return;
    el.dataset.revealBound = '1';

    const delay = parseInt(el.dataset.revealDelay || '0', 10) || 0;
    if (delay) el.style.animationDelay = delay + 'ms';

    if (!('IntersectionObserver' in window)) {
      // No observer support: show content immediately, animate later
      reveal(el);
      return;
    }
    el.classList.add('reveal-init');
    io.observe(el);
  }

  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          if (entry.target.dataset.revealOnce === 'false') {
            io.observe(entry.target);
          } else {
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
  }

  function scan() {
    document.querySelectorAll('[data-reveal]:not([data-reveal-bound])').forEach(applyReveal);
  }

  document.addEventListener('DOMContentLoaded', scan);
  if (document.readyState !== 'loading') scan();
  document.addEventListener('includes:loaded', scan);
  ['infographic:loaded', 'roadmap:loaded'].forEach((ev) =>
    document.addEventListener(ev, scan)
  );

  // Dynamically-rendered components (projects, skills, gallery, ...)
  const observer = new MutationObserver(() => {
    if (document.querySelectorAll('[data-reveal]:not([data-reveal-bound])').length) scan();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Safety net: reveal everything after 2.5s regardless of scroll position
  setTimeout(forceRevealAll, 2500);
})();