// Loads header and footer partials, then injects deferred scripts marked with data-deps="defer-after-includes"
(function(){
  async function loadPartial(id, url){
    try{
      const res = await fetch(url, {cache: 'no-store'});
      if(!res.ok) throw new Error('Failed to load '+url);
      const html = await res.text();
      const container = document.getElementById(id);
      if(container) container.innerHTML = html;
    }catch(err){
      console.error(err);
    }
  }

  async function init(){
    await Promise.all([
      loadPartial('site-header','partials/header.html'),
      loadPartial('site-footer','partials/footer.html')
    ]);

    // Initialize theme toggle (centralized so it works on all pages)
    (function initThemeToggle(){
      const iconSun = document.getElementById('icon-sun');
      const iconMoon = document.getElementById('icon-moon');
      const themeToggle = document.getElementById('theme-toggle');
      console.log('[theme] init: sun?', !!iconSun, 'moon?', !!iconMoon, 'toggle?', !!themeToggle);

      if (iconSun && iconSun.innerHTML.trim() === '') {
        const pathSun = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathSun.setAttribute('stroke-linecap', 'round');
        pathSun.setAttribute('stroke-linejoin', 'round');
        pathSun.setAttribute('stroke-width', '2');
        pathSun.setAttribute('d', 'M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 100 10 5 5 0 000-10z');
        iconSun.appendChild(pathSun);
      }
      if (iconMoon && iconMoon.innerHTML.trim() === '') {
        const pathMoon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathMoon.setAttribute('stroke-linecap', 'round');
        pathMoon.setAttribute('stroke-linejoin', 'round');
        pathMoon.setAttribute('stroke-width', '2');
        pathMoon.setAttribute('d', 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z');
        iconMoon.appendChild(pathMoon);
      }

      function setIcons(isDark){
        if (!iconSun || !iconMoon) return;
        if (isDark) { iconMoon.classList.remove('hidden'); iconSun.classList.add('hidden'); }
        else { iconSun.classList.remove('hidden'); iconMoon.classList.add('hidden'); }
        if (themeToggle) themeToggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      }

      try{
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const dark = saved ? saved === 'dark' : prefersDark;
        document.documentElement.classList.toggle('dark', dark);
        setIcons(dark);
      }catch(e){ console.warn('theme init failed', e); }

      if (themeToggle){
        themeToggle.addEventListener('click', () => {
          console.log('[theme] toggle clicked');
          const isDark = document.documentElement.classList.toggle('dark');
          console.log('[theme] dark mode now:', isDark);
          try{ localStorage.setItem('theme', isDark ? 'dark' : 'light'); }catch(e){}
          setIcons(isDark);
        });
      } else {
        console.warn('[theme] no theme-toggle button found!');
      }
    })();

    // After header/footer inserted, load deferred scripts
    const nodes = Array.from(document.querySelectorAll('script[data-deps="defer-after-includes"]'));
    nodes.forEach(orig => {
      const src = orig.getAttribute('src');
      if(src){
        const s = document.createElement('script');
        s.src = src;
        s.defer = true;
        document.body.appendChild(s);
      } else {
        // inline script: copy text
        const s = document.createElement('script');
        s.text = orig.textContent;
        document.body.appendChild(s);
      }
      orig.parentNode && orig.parentNode.removeChild(orig);
    });
    // dispatch an event for consumers
    document.dispatchEvent(new Event('includes:loaded'));
  }

  // run as early as possible
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
