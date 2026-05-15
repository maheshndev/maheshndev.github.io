document.getElementById("year").textContent = new Date().getFullYear();

    // Mobile menu
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileBtn?.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const iconSun = document.getElementById('icon-sun');
    const iconMoon = document.getElementById('icon-moon');

    function setIcons(isDark) {
      if (isDark) { iconMoon.classList.remove('hidden'); iconSun.classList.add('hidden'); }
      else { iconSun.classList.remove('hidden'); iconMoon.classList.add('hidden'); }
    }

    (function initTheme() {
      const saved = localStorage.getItem('theme');
      const dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', dark);
      setIcons(dark);
    })();

    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      setIcons(isDark);
    });

    // Filtering
    const filters = document.querySelectorAll('.filter-btn');
    const projects = document.querySelectorAll('#projects-grid article');

    filters.forEach(btn => {
      btn.addEventListener('click', () => {
        filters.forEach(f => f.classList.remove('active', 'bg-accent-600', 'text-white'));
        btn.classList.add('active', 'bg-accent-600', 'text-white');

        const filter = btn.getAttribute('data-filter');
        projects.forEach(card => {
          if (filter === 'all' || card.classList.contains(filter)) {
            card.style.display = 'block';
            card.classList.add('animate-fade-in');
          } else {
            card.style.display = 'none';
          }
        });
      });
    });