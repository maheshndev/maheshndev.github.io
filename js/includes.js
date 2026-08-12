// Mounts the header/footer components, wires shared page behaviors
// (theme toggle, mobile menu, footer year), and loads deferred page scripts.
// Markup comes from js/components/*.js (inline JS, works on file:// too).
(function () {
  function init() {
    if (window.mountSiteHeader) window.mountSiteHeader();
    if (window.mountSiteFooter) window.mountSiteFooter();

    initThemeToggle();
    initMobileMenu();
    setYear();

    loadDeferredScripts();
    document.dispatchEvent(new Event('includes:loaded'));
  }

  function initThemeToggle() {
    const iconSun = document.getElementById('icon-sun');
    const iconMoon = document.getElementById('icon-moon');
    const themeToggle = document.getElementById('theme-toggle');
    if (!iconSun || !iconMoon || !themeToggle) return;

    function setIcons(isDark) {
      iconMoon.classList.toggle('hidden', isDark);
      iconSun.classList.toggle('hidden', !isDark);
      themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
    }

    try {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const dark = saved ? saved === 'dark' : prefersDark;
      document.documentElement.classList.toggle('dark', dark);
      setIcons(dark);
    } catch (e) {
      /* ignore storage/theme errors */
    }

    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      try {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
      } catch (e) {}
      setIcons(isDark);
    });
  }

  function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => menu.classList.toggle('hidden'));
  }

  function setYear() {
    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  }

  function loadDeferredScripts() {
    const nodes = Array.from(document.querySelectorAll('script[data-deps="defer-after-includes"]'));
    nodes.forEach((orig) => {
      const src = orig.getAttribute('src');
      const s = document.createElement('script');
      if (src) {
        s.src = src;
        s.defer = true;
      } else {
        s.text = orig.textContent;
      }
      document.body.appendChild(s);
      if (orig.parentNode) orig.parentNode.removeChild(orig);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
