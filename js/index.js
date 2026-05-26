// ----- Mobile menu toggle
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    mobileBtn?.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Theme toggle is initialized in `js/includes.js` after header partials load.
    // Leave a safe no-op here so other scripts can run without errors.
    (function ensureThemeAvailable(){
      const t = document.getElementById('theme-toggle');
      if (!t) return;
      // includes.js will wire up icons and the click handler; keep this as a sync point.
    })();

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
      const expEl = document.getElementById('experience-years');
      if (expEl) expEl.textContent = label;
    })();


    // ----- Fetch GitHub repos and render (run after includes are loaded)
    async function loadGitHubRepos() {
      const container = document.getElementById('github-projects');
      console.log('loadGitHubRepos: start, container found?', !!container);
      if (!container) return console.warn('loadGitHubRepos: no container found');
      const user = 'maheshndev';
      try {
        // show a loading placeholder so it's obvious something is happening
        container.innerHTML = '<div class="text-sm text-slate-500">Loading GitHub projects…</div>';
        const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=12&sort=updated`);
        console.log('loadGitHubRepos: fetch status', res.status, res.statusText);
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(`GitHub API error: ${res.status} ${res.statusText} ${txt}`);
        }
        const repos = await res.json();
        console.log('loadGitHubRepos: repos received', Array.isArray(repos) ? repos.length : typeof repos);
        if (!Array.isArray(repos)) throw new Error('Unexpected repo data');
        // Build a visible list up to 9 cards:
        // Prefer non-archived, non-forks; if not enough, fill from non-archived forks, then any repo.
        const params = new URLSearchParams(window.location.search || '');
        const showAll = params.get('showAllRepos') === '1' || params.get('showAllRepos') === 'true';
        let visible = [];
        if (showAll) {
          visible = repos.slice();
        } else {
          const nonArchived = repos.filter(r => !r.archived);
          const primary = nonArchived.filter(r => !r.fork);
          const secondary = nonArchived.filter(r => r.fork);
          const tertiary = repos.filter(r => r.archived);
          visible = primary.concat(secondary, tertiary);
        }
        if (!visible.length) {
          container.innerHTML = '<div class="text-sm text-slate-500">No public repositories found.</div>';
          return;
        }
        container.innerHTML = ''; // clear placeholder
        // limit to 9 cards (3x3)
        visible.slice(0, 9).forEach(repo => {
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
                  <span class="flex items-center gap-1">${repo.forks_count || 0}</span>
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
    }

    // Try to load when includes are ready (includes.js dispatches `includes:loaded`), otherwise run immediately
    if (document.getElementById('github-projects')) {
      // If the placeholder exists already, attempt load now
      loadGitHubRepos();
    } else {
      document.addEventListener('includes:loaded', () => {
        // small defer to let includes finish DOM insertion
        setTimeout(loadGitHubRepos, 50);
      });
    }



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

    // ----- Skill filter grid behavior (delegated clicks + visual feedback)
    function initSkillsFilter() {
      const filterButtons = () => Array.from(document.querySelectorAll('.skill-filter-btn'));
      const skillItems = () => Array.from(document.querySelectorAll('.skill-item'));

      function updateFilter(selected) {
        console.log('[skills] updateFilter called with:', selected);
        const buttons = filterButtons();
        const items = skillItems();
        
        console.log('[skills] found', buttons.length, 'buttons and', items.length, 'items');

        buttons.forEach(button => {
          const isActive = button.dataset.filter === selected;
          button.classList.toggle('active', isActive);
          button.setAttribute('aria-pressed', String(isActive));
        });

        items.forEach(item => {
          const categories = (item.dataset.category || '').trim().split(/\s+/).filter(Boolean);
          const shouldShow = selected === 'all' || categories.includes(selected);
          const isHidden = item.classList.contains('hidden');

          if (shouldShow && isHidden) {
            item.classList.remove('hidden');
            item.classList.remove('fade-out');
            requestAnimationFrame(() => item.classList.add('fade-in'));
          }

          if (!shouldShow && !isHidden) {
            item.classList.remove('fade-in');
            item.classList.add('fade-out');
            // Add hidden after transition; fallback timeout in case transitionend doesn't fire for opacity
            const onTransitionEnd = (e) => {
              // accept opacity or transform transition end
              if (e.propertyName !== 'opacity' && e.propertyName !== 'transform') return;
              item.classList.add('hidden');
              item.removeEventListener('transitionend', onTransitionEnd);
              clearTimeout(fallback);
            };
            item.addEventListener('transitionend', onTransitionEnd, { once: true });
            const fallback = setTimeout(() => {
              if (!item.classList.contains('hidden')) item.classList.add('hidden');
              item.removeEventListener('transitionend', onTransitionEnd);
            }, 300);
          }
        });
      }

      // Delegated clicks on filter buttons (attach globally, always works)
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('.skill-filter-btn');
        if (btn) {
          console.log('[skills] filter button clicked:', btn.dataset.filter);
          e.preventDefault();
          e.stopPropagation();
          const f = btn.dataset.filter;
          if (f) {
            console.log('[skills] calling updateFilter:', f);
            updateFilter(f);
          }
        }

        const skill = e.target.closest('.skill-item');
        if (skill) {
          console.log('[skills] skill item clicked:', skill.textContent.trim());
          // Quick visual feedback for skill clicks
          skill.classList.add('clicked');
          setTimeout(() => skill.classList.remove('clicked'), 300);
        }
      });

      // ensure an initial state
      const buttons = filterButtons();
      const items = skillItems();
      if (buttons.length > 0 && items.length > 0) {
        console.log('[skills] initializing with All filter');
        updateFilter('all');
      } else {
        console.warn('[skills] init: buttons or items not found yet');
      }
    }

    // init when DOM + includes ready
    function safeInitSkills() {
      try { initSkillsFilter(); } catch (e) { console.warn('initSkillsFilter failed', e); }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', safeInitSkills);
    } else {
      safeInitSkills();
    }