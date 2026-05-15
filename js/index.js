// ----- Mobile menu toggle
    document.getElementById("year").textContent = new Date().getFullYear();
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileBtn?.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // ----- Theme toggle (auto + save)
    const themeToggle = document.getElementById('theme-toggle');
    const iconSun = document.getElementById('icon-sun');
    const iconMoon = document.getElementById('icon-moon');

    function setIcons(isDark) {
      if (isDark) { iconMoon.classList.remove('hidden'); iconSun.classList.add('hidden'); }
      else { iconSun.classList.remove('hidden'); iconMoon.classList.add('hidden'); }
    }
    (function initTheme() {
      const saved = localStorage.getItem('theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const dark = saved ? saved === 'dark' : prefersDark;
      document.documentElement.classList.toggle('dark', dark);
      setIcons(dark);
    })();
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      setIcons(isDark);
    });

    // ----- Experience years auto-calc -----
    (function () {
      // Set your actual career start date here:
      const careerStart = new Date('2023-12-01'); // change if needed
      const now = new Date();

      const diffMs = now - careerStart;
      const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);

      // Round to one decimal, e.g., 1.9 or 2.1
      const roundedYears = Math.round(diffYears * 10) / 10;

      // Add a '+' if not a clean integer
      const label = roundedYears % 1 === 0 ? `${roundedYears}+ Years` : `${roundedYears}+ Years`;

      // Example: 1.9+ Years or 2+ Years
      document.getElementById('experience-years').textContent = label;
    })();


    // ----- Fetch GitHub repos and render
    (async function loadGitHubRepos() {
      const container = document.getElementById('github-projects');
      const user = 'maheshndev';
      try {
        const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=12&sort=updated`);
        if (!res.ok) throw new Error('GitHub API rate or network issue');
        const repos = await res.json();
        if (!Array.isArray(repos)) throw new Error('Unexpected repo data');
        repos.forEach(repo => {
          const el = document.createElement('article');
          el.className = 'overflow-hidden rounded-2xl glass-card border border-slate-200 dark:border-slate-800 card-hover flex flex-col';
          el.innerHTML = `
            <div class="h-40 overflow-hidden bg-slate-100 dark:bg-slate-700 relative">
              <img src="https://opengraph.githubassets.com/1/${user}/${repo.name}" alt="${repo.name}" class="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" onerror="this.src='https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=400&h=200&auto=format&fit=crop'">
              <div class="absolute top-2 right-2 px-2 py-1 rounded-md glass text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                ${repo.language || 'Code'}
              </div>
            </div>
            <div class="p-5 flex-grow flex flex-col">
              <a href="${repo.html_url}" target="_blank" class="block font-bold text-lg hover:text-accent-600 transition-colors truncate">${repo.name}</a>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 min-h-[2.5rem]">${repo.description || 'Modern web application developed with precision and clean architecture.'}</p>
              <div class="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div class="flex items-center gap-3">
                  <span class="flex items-center gap-1">★ ${repo.stargazers_count}</span>
                  <span class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75.1.797-.222 1.652-.333 2.503-.337.85.004 1.706.115 2.504.337 1.909-1.269 2.747-1 2.747-1 .546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z"/></svg>
                    ${repo.forks_count || 0}
                  </span>
                </div>
                <a href="${repo.html_url}" target="_blank" class="text-accent-600 hover:underline">Code →</a>
              </div>
            </div>
          `;
          container.appendChild(el);
        });
      } catch (err) {
        console.warn('Could not load GitHub repos', err);
        container.innerHTML = '<div class="text-sm text-slate-500">Unable to load GitHub projects right now.</div>';
      }
    })();



    // ----- Smooth highlight active nav link on scroll (basic)
    (function () {
      const links = document.querySelectorAll('a.nav-link');
      const sections = Array.from(links).map(l => document.querySelector(l.getAttribute('href')));
      function onScroll() {
        const scrollPos = window.scrollY + 120;
        for (let i = sections.length - 1; i >= 0; i--) {
          const s = sections[i];
          if (!s) continue;
          if (scrollPos >= s.offsetTop) {
            links.forEach(l => l.classList.remove('text-accent-600', 'font-semibold'));
            const active = [...links].find(l => l.getAttribute('href') === '#' + s.id);
            active?.classList.add('text-accent-600', 'font-semibold');
            break;
          }
        }
      }
      window.addEventListener('scroll', onScroll);
      onScroll();
    })();