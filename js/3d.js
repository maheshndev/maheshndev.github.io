// ============================================================
// 3D helpers — interactive mouse-follow tilt for .tilt-3d
// ------------------------------------------------------------
// Adds a pointer-driven rotateX/rotateY tilt to every element
// carrying the `.tilt-3d` class. Pure CSS custom properties, so
// no layout thrash and it degrades gracefully without JS.
//
// Usage:
//   <div class="glass-card tilt-3d"> ... </div>
//
// The script re-scans the DOM automatically after the async
// site components (projects/skills/gallery/roadmap/...) render.
// ============================================================
(function () {
  'use strict';

  function wireTilt(el) {
    if (el.dataset.tiltBound) return;
    el.dataset.tiltBound = '1';

    const maxDeg = 10; // max tilt on each axis
    let raf = null;
    let leaving = false;

    el.addEventListener('pointermove', (e) => {
      if (raf) return; // coalesce to one update per frame
      leaving = false;
      raf = requestAnimationFrame(() => {
        raf = null;
        if (leaving) return; // pointer already left — skip stale frame
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.setProperty('--ry', (px * maxDeg * 2).toFixed(2) + 'deg');
        el.style.setProperty('--rx', (-py * maxDeg * 2).toFixed(2) + 'deg');
        el.setAttribute('data-tilting', '1');
      });
    });

    el.addEventListener('pointerleave', () => {
      leaving = true;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = null;
      }
      el.removeAttribute('data-tilting');
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  }

  function scan() {
    document.querySelectorAll('.tilt-3d').forEach(wireTilt);
  }

  document.addEventListener('DOMContentLoaded', scan);
  if (document.readyState !== 'loading') scan();
  document.addEventListener('includes:loaded', scan);
  ['infographic:loaded', 'roadmap:loaded'].forEach((ev) =>
    document.addEventListener(ev, scan)
  );

  // Dynamically-rendered components (projects, skills, gallery, ...)
  const observer = new MutationObserver(() => {
    if (document.querySelectorAll('.tilt-3d:not([data-tilt-bound])').length) scan();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
