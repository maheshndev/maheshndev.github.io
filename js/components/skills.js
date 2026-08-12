// ============================================================
// SkillsSection component
// ------------------------------------------------------------
// Renders the filter tabs AND the skill grid entirely from data:
//   - tabs  : dropdown of category <button>s the user clicks
//   - grid  : one <button> per skill from JSON
//
// Usage:
//   <div class="skill-component" data-skill-filter-group
//        data-src="data/skills.json"
//        data-categories='["Frontend","Backend","Database & ORM","Cloud & DevOps","OS"]'></div>
//
// The component auto-instantiates via the ComponentRegistry below.
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

  // ============================================================
  // SkillsSection
  // ============================================================
  class SkillsSection {
    constructor(host, options) {
      this.host = host;
      this.src = options.src || 'data/skills.json';
      this.categories = options.categories || [];
      this.skills = [];
      this.currentFilter = 'all';

      this.filters = null;   // container holding the tab buttons
      this.grid = null;      // container holding the skill items

      this.renderShell();
      this.load();
    }

    // ----- build the static skeleton inside the host -----
    renderShell() {
      this.host.classList.add('skill-component');

      this.filters = el('div', 'skill-filter-group mb-8');
      this.host.appendChild(this.filters);

      this.grid = el('div', 'skill-grid');
      this.grid.setAttribute('aria-live', 'polite');
      this.host.appendChild(this.grid);

      // "All" tab is always the first option
      this.addFilterButton('all', 'All', true);

      this.categories.forEach((cat, i) => {
        this.addFilterButton(cat, cat, false);
      });
    }

    addFilterButton(filter, label, isActive) {
      const btn = el('button', 'skill-filter-btn' + (isActive ? ' active' : ''), label);
      btn.type = 'button';
      btn.dataset.filter = filter;
      btn.setAttribute('aria-pressed', String(isActive));
      btn.addEventListener('click', () => this.updateFilter(filter));
      this.filters.appendChild(btn);
    }

    // ----- fetch data from JSON -----
    async load() {
      try {
        const res = await fetch(this.src, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load ${this.src}: ${res.status}`);
        const data = await res.json();
        this.skills = Array.isArray(data.skills) ? data.skills : [];
        this.render();
        this.updateFilter('all');
      } catch (err) {
        console.warn('[SkillsSection] Unable to load skills', err);
        this.grid.innerHTML =
          '<div class="text-sm text-slate-500 col-span-full">Unable to load skills.</div>';
      }
    }

    // ----- render all skill items (respecting current filter) -----
    render() {
      const fragment = document.createDocumentFragment();
      this.skills.forEach(skill => fragment.appendChild(this.createItem(skill)));
      this.grid.innerHTML = '';
      this.grid.appendChild(fragment);
      console.log('[SkillsSection] rendered', this.skills.length, 'skills');
    }

    buildItem(skill) {
      const btn = el('button', 'skill-item fade-in');
      btn.type = 'button';
      btn.dataset.categories = JSON.stringify(skill.category || []);
      btn.dataset.name = skill.name;
      // Build text + icon via DOM to keep escaping safe while matching existing markup
      const iconWrap = el('span', 'skill-item-icon');
      const img = document.createElement('img');
      img.src = skill.icon;
      img.alt = skill.name;
      img.setAttribute('aria-hidden', 'true');
      img.loading = 'lazy';
      iconWrap.appendChild(img);
      btn.appendChild(iconWrap);
      btn.appendChild(document.createTextNode(skill.name));
      return btn;
    }

    createItem(skill) {
      const item = this.buildItem(skill);
      const shouldShow =
        this.currentFilter === 'all' ||
        (skill.category && skill.category.includes(this.currentFilter));
      if (!shouldShow) item.classList.add('hidden');
      return item;
    }

    // ----- change active tab + show/hide items -----
    updateFilter(selected) {
      this.currentFilter = selected;

      // toggle active tabs
      this.filters.querySelectorAll('.skill-filter-btn').forEach((btn) => {
        const isActive = btn.dataset.filter === selected;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      });

      // toggle items
      this.grid.querySelectorAll('.skill-item').forEach((item) => {
        let cat = [];
        try { cat = JSON.parse(item.dataset.categories || '[]'); } catch (err) { cat = []; }
        const shouldShow = selected === 'all' || cat.includes(selected);
        item.classList.toggle('hidden', !shouldShow);
        if (shouldShow) {
          item.classList.remove('fade-out');
          requestAnimationFrame(() => item.classList.add('fade-in'));
        }
      });
    }
  }

  // ============================================================
  // ComponentRegistry — mounts any [data-skill-filter-group]
  // ============================================================
  const registry = {
    mountSkills() {
      document.querySelectorAll('[data-skill-filter-group]').forEach((host) => {
        if (host._skillsComponent) return;
        const options = {
          src: host.getAttribute('data-src') || 'data/skills.json',
          categories: parseJsonAttr(host, 'data-categories', [])
        };
        host._skillsComponent = new SkillsSection(host, options);
      });
    }
  };

  function parseJsonAttr(node, key, fallback) {
    const raw = node.getAttribute(key);
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch (err) { return fallback; }
  }

  // ----- exposure for other scripts (optional API) -----
  window.SkillsSection = SkillsSection;
  window.SkillsComponentRegistry = registry;

  // ----- auto-init once DOM ready (idempotent) -----
  function init() {
    registry.mountSkills();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();