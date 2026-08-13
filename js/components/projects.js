// ============================================================
// ProjectsSection component
// ------------------------------------------------------------
// Renders the featured projects section (header + grid) from data:
//   - header : section title + eyebrow label  (configurable)
//   - grid   : one <article> card per project from JSON
//
// Usage:
//   <div data-projects-group
//        data-src="data/projects.json"
//        data-title="Projects"
//        data-eyebrow="Featured Projects"
//        data-showall-href="projects.html"></div>
//
// The component auto-instantiates via the component registry below.
// ============================================================
(function () {
  'use strict';

  // ----- small helper to create elements safely -----
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // Tag pill color mapping (matches existing Tailwind classes)
  const TAG_COLORS = {
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20',
    green: 'bg-green-500/10 text-green-600 dark:text-green-300 border border-green-500/20',
    rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-300 border border-orange-500/20'
  };

  // ============================================================
  // ProjectsSection
  // ============================================================
  class ProjectsSection {
    constructor(host, options) {
      this.host = host;
      this.src = options.src || 'data/projects.json';
      this.title = options.title || 'Projects';
      this.eyebrow = options.eyebrow || 'Featured Projects';
      this.showAllHref = options.showAllHref || 'projects.html';
      this.showFooter = options.showFooter !== false;
      this.showTitle = options.showTitle !== false;
      this.descLimit = options.descLimit || 140;
      this.activeFilter = 'all';
      this.projects = [];

      this.renderShell();
      this.load();
    }

    // ----- build the section skeleton inside the host -----
    renderShell() {
      // header row (optional)
      if (this.showTitle) {
        const header = el('div', 'flex items-center justify-between');
        header.appendChild(el('h2', 'text-3xl font-extrabold text-gradient', this.title));
        const eyebrow = el('div', 'text-sm font-bold text-slate-500 uppercase tracking-widest hidden sm:block');
        eyebrow.textContent = this.eyebrow;
        header.appendChild(eyebrow);
        this.host.appendChild(header);
      }

      // grid
      this.grid = el('div', 'project-grid mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3 [perspective:1400px]');
      this.grid.setAttribute('aria-live', 'polite');
      this.host.appendChild(this.grid);

      // footer
      if (this.showFooter) {
        this.footer = el('div', 'mt-12 text-center');
        const btn = document.createElement('a');
        btn.className = 'btn-outline-premium btn-3d';
        btn.setAttribute('href', this.showAllHref);
        btn.appendChild(document.createTextNode('View All Projects'));
        const arrow = document.createElement('img');
        arrow.className = 'i8 w-5 h-5 ml-2';
        arrow.src = 'https://img.icons8.com/3d-fluency/96/forward.png';
        arrow.alt = '';
        arrow.loading = 'lazy';
        btn.appendChild(arrow);
        this.footer.appendChild(btn);
        this.host.appendChild(this.footer);
      }
    }

    // ----- fetch data from JSON -----
    async load() {
      try {
        const res = await fetch(this.src, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load ${this.src}: ${res.status}`);
        const data = await res.json();
        this.projects = Array.isArray(data.projects) ? data.projects : [];
        this.render();
      } catch (err) {
        console.warn('[ProjectsSection] Unable to load projects', err);
        this.grid.innerHTML =
          '<div class="text-sm text-slate-500 col-span-full">Unable to load projects.</div>';
      }
    }

    // ----- render: builds cards, shows only those matching activeFilter -----
    render() {
      const fragment = document.createDocumentFragment();
      const visible = this.projects.filter(
        p => this.activeFilter === 'all' || p.filter === this.activeFilter
      );
      visible.forEach(project => fragment.appendChild(this.buildCard(project)));
      this.grid.innerHTML = '';
      this.grid.appendChild(fragment);
      console.log('[ProjectsSection] rendered', visible.length, 'of', this.projects.length, 'projects');
    }

    setFilter(filter) {
      this.activeFilter = filter;
      this.render();
    }

    buildTag(tag) {
      const span = el(
        'span',
        'tag-pill px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ' +
        (TAG_COLORS[tag.color] || TAG_COLORS.indigo),
        tag.label
      );
      return span;
    }

    buildCard(project) {
      // Equal-height card: flex-col + flex-grow sections + mt-auto buttons
      const article = el(
        'article',
        'p-6 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 card-hover tilt-3d gloss-edge flex flex-col h-full preserve-3d'
      );

      // 0) Image header — real image if provided, else light gradient with title text
      const mediaRow = el('div', 'relative w-full aspect-video overflow-hidden rounded-xl mb-4 group');
      if (project.image) {
        const img = document.createElement('img');
        img.src = project.image;
        img.alt = project.title;
        img.loading = 'lazy';
        img.className = 'media-img w-full h-full object-cover transition-transform duration-500';
        img.onerror = () => {
          img.remove();
          mediaRow.appendChild(this.buildFallbackMedia(project));
        };
        mediaRow.appendChild(img);
      } else {
        mediaRow.appendChild(this.buildFallbackMedia(project));
      }
      article.appendChild(mediaRow);

      // 1) Title
      article.appendChild(el('h3', 'font-bold text-lg leading-snug', project.title));

      // 2) Tags (small badges)
      if (project.tags && project.tags.length) {
        const tagBox = el('div', 'flex flex-wrap gap-1.5 mt-3');
        project.tags.forEach(tag => tagBox.appendChild(this.buildTag(tag)));
        article.appendChild(tagBox);
      }

      // 3) Date  |  4) Company
      const meta = el('div', 'mt-3 text-xs leading-relaxed');
      if (project.date) {
        meta.appendChild(el('div', 'font-semibold text-slate-600 dark:text-slate-300', project.date));
      }
      if (project.company) {
        meta.appendChild(el('div', 'text-slate-400 dark:text-slate-500', project.company));
      }
      article.appendChild(meta);

      // 5) Description with Read More / Read Less expand
      const descWrap = el('div', 'relative mt-3 flex-grow');
      const desc = el('p', 'text-sm text-slate-600 dark:text-slate-300');
      desc.textContent = project.description || '';
      const expanded = desc.textContent.length > (this.descLimit || 140);
      desc.classList.add('project-desc');
      if (expanded) desc.classList.add('clamped');
      descWrap.appendChild(desc);

      if (expanded) {
        const toggle = el('button', 'project-read-more mt-1', 'Read More');
        toggle.type = 'button';
        toggle.addEventListener('click', () => this.toggleReadMore(toggle, desc));
        descWrap.appendChild(toggle);
      }
      article.appendChild(descWrap);

      // 6) Action buttons (pinned to bottom for equal card height)
      const actions = el('div', 'mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3');
      const viewBtn = el('a', 'btn-premium', 'View Project');
      viewBtn.setAttribute('href', project.viewUrl || '#');
      viewBtn.setAttribute('target', '_blank');
      actions.appendChild(viewBtn);

      const demoBtn = el('a', 'btn-outline-premium', 'Live Demo');
      demoBtn.setAttribute('href', project.demoUrl || '#');
      demoBtn.setAttribute('target', '_blank');
      actions.appendChild(demoBtn);
      article.appendChild(actions);

      return article;
    }

    toggleReadMore(btn, desc) {
      const isClamped = desc.classList.toggle('clamped');
      btn.textContent = isClamped ? 'Read More' : 'Read Less';
    }

    // Fallback media: light gradient background + title text (label/color from project)
    buildFallbackMedia(project) {
      const box = el('div', 'w-full h-full flex items-center justify-center px-6 ' + (project.bg || 'bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40'));
      const label = el('span', 'font-bold text-xl sm:text-2xl text-center leading-snug break-words ' + (project.textColor || 'text-indigo-600 dark:text-indigo-300'));
      label.textContent = project.title;
      box.appendChild(label);
      return box;
    }
  }

  // ============================================================
  // ComponentRegistry — mounts any [data-projects-group]
  // ============================================================
  const registry = {
    mountProjects() {
      document.querySelectorAll('[data-projects-group]').forEach((host) => {
        if (host._projectsComponent) return;
        const options = {
          src: host.getAttribute('data-src') || 'data/projects.json',
          title: host.getAttribute('data-title') || 'Projects',
          eyebrow: host.getAttribute('data-eyebrow') || 'Featured Projects',
          showAllHref: host.getAttribute('data-showall-href') || 'projects.html',
          showFooter: host.getAttribute('data-show-footer') !== 'false',
          showTitle: host.getAttribute('data-show-title') !== 'false',
          descLimit: parseInt(host.getAttribute('data-desc-limit') || '140', 10)
        };
        host._projectsComponent = new ProjectsSection(host, options);
      });
    }
  };

  // ----- exposure for other scripts (optional API) -----
  window.ProjectsSection = ProjectsSection;
  window.ProjectsComponentRegistry = registry;

  // ----- auto-init once DOM ready (idempotent) -----
  function init() {
    registry.mountProjects();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();