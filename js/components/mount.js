// Shared mount helpers for site components (header/footer).
window.SiteComponents = {
  // Inject `html` into `containerId` only once (guarded by `attr`).
  mount(containerId, html, attr) {
    const container = document.getElementById(containerId);
    if (container && !container.hasAttribute(attr)) {
      container.innerHTML = html;
      container.setAttribute(attr, '1');
    }
  },
  // Run `fn` when the DOM is ready (immediately if already ready).
  onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  },
};
