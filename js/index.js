// ----- Experience years auto-calc -----
(function () {
  // 1. Config: Set your exact career start month and year
  const startMonth = 12; // December
  const startYear = 2023;

  // 2. Get current dates
  const now = new Date();
  const currentYear = now.getFullYear();
  // JS months are 0-11 (Jan=0, Dec=11), so we add 1 to match real-world numbering
  const currentMonth = now.getMonth() + 1;

  // 3. Calculate total months elapsed
  const totalMonths = (currentYear - startYear) * 12 + (currentMonth - startMonth);

  // Guard clause: if the date is somehow set in the future
  if (totalMonths <= 0) {
    const expEl = document.getElementById('experience-years');
    if (expEl) expEl.textContent = '0 months';
    return;
  }

  // 4. Breakdown into Years and remaining Months
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  // 5. Build a clean, dynamic label strings
  let label = '';

  if (years > 0 && months > 0) {
    label = `${years} Year${years > 1 ? 's' : ''} ${months} Month${months > 1 ? 's' : ''}`;
  } else if (years > 0) {
    label = `${years}+ Year${years > 1 ? 's' : ''}`; // Clean integers get the "+"
  } else {
    label = `${months} Month${months > 1 ? 's' : ''}`; // Less than a year old
  }

  // 6. Update the DOM
  const expEl = document.getElementById('experience-years');
  if (expEl) expEl.textContent = label;
})();

// ----- Fetch GitHub repos and render -----
async function loadGitHubRepos() {
  const container = document.getElementById('github-projects');
  if (!container) return;
  const user = 'maheshndev';
  try {
    container.innerHTML = '<div class="text-sm text-slate-500">Loading GitHub projects…</div>';
    const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=12&sort=updated`);
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`GitHub API error: ${res.status} ${res.statusText} ${txt}`);
    }
    const repos = await res.json();
    if (!Array.isArray(repos)) throw new Error('Unexpected repo data');
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
  loadGitHubRepos();
} else {
  document.addEventListener('includes:loaded', () => {
    setTimeout(loadGitHubRepos, 50);
  });
}
