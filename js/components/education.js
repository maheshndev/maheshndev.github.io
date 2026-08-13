// ============================================================
// EducationSection component
// Renders a vertical alternating timeline with wavy center line
// Usage: <div data-education-group data-src="data/education.json"></div>
// ============================================================
(function () {
  'use strict';

  // Icons8 (3d-fluency) timeline icons, keyed by data/education.json icon name
  const ICONS8 = {
    school: 'school',
    'graduation-cap': 'graduation-cap',
    bracket: 'code',
    master: 'graduation-cap'
  };

  const COLOR_MAP = {
    amber: 'bg-amber-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500'
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  class EducationSection {
    constructor(host, options) {
      this.host = host;
      this.src = options.src || 'data/education.json';
      this.items = [];
      this.renderShell();
      this.load();
    }

    renderShell() {
      this.host.innerHTML = '';
      const wrap = el('div', 'relative');
      const titleWrap = el('div', 'mb-16');
      titleWrap.innerHTML = '<h2 class="text-3xl font-extrabold text-gradient inline-block">Academic Foundation</h2><p class="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl">A journey of learning and growth, step by step.</p>';
      this.host.appendChild(titleWrap);
      wrap.appendChild(this.buildTimelineLine());
      wrap.appendChild(this.buildTimelineContainer());
      this.host.appendChild(wrap);
      this.container = wrap;
    }

    buildTimelineLine() {
      const lineWrap = el('div', 'absolute inset-y-0 left-6 md:left-1/2 -translate-x-1/2 w-0.5 pointer-events-none');
      const mobile = el('div', 'absolute inset-y-0 -left-px w-0.5 bg-slate-300 dark:bg-slate-600 md:hidden');
      const desktop = el('div', 'absolute inset-y-0 -left-px w-0.5 bg-gradient-to-b from-transparent via-slate-300 to-transparent dark:via-slate-600 hidden md:block');
      lineWrap.appendChild(mobile);
      lineWrap.appendChild(desktop);
      return lineWrap;
    }

    buildTimelineContainer() {
      this.timeline = el('div', 'relative');
      return this.timeline;
    }

    async load() {
      try {
        const res = await fetch(this.src, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed: ' + res.status);
        const data = await res.json();
        this.items = Array.isArray(data.education) ? data.education : [];
        this.render();
      } catch (err) {
        console.warn('[EducationSection]', err);
        this.host.innerHTML += '<p class="text-red-500 text-sm">Education data could not be loaded.</p>';
      }
    }

    render() {
      if (!this.timeline) return;
      this.timeline.innerHTML = '';
      const fragment = document.createDocumentFragment();
      this.items.forEach((item, i) => fragment.appendChild(this.buildItem(item, i)));
      this.timeline.appendChild(fragment);
      console.log('[EducationSection] rendered', this.items.length, 'items');
    }

    buildItem(item, index) {
      const isOdd = index % 2 === 1;
      const colorClass = COLOR_MAP[item.color] || 'bg-indigo-500';

      // Mobile: icon at line (left-6); Desktop: centered on the line, card alternates
      const cardDesk = isOdd ? 'md:ml-auto md:pl-12 md:pr-0' : 'md:mr-auto md:pr-12 md:pl-0';

      const row = el('div', 'relative flex items-start mb-6 md:mb-10');

      // Horizontal connector from card to the center line
      const connector = el('div', 'hidden md:block absolute top-1/2 -translate-y-1/2 h-0.5 bg-slate-300 dark:bg-slate-600 ' + (isOdd
        ? 'left-[calc(50%+1.5rem)] w-[calc(8.333%+1.5rem)]'
        : 'right-[calc(50%+1.5rem)] w-[calc(8.333%+1.5rem)]'));
      row.appendChild(connector);

      // Center icon on the line
      const iconBox = el('div', 'relative z-10 flex-shrink-0 w-12 h-12 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 rounded-full border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center ' + colorClass);
      iconBox.appendChild(this.buildIcon(item.icon));
      row.appendChild(iconBox);

      // Card side (left for even items, right for odd items)
      const cardWrap = el('div', 'flex-1 md:flex-none md:w-5/12 pl-8 md:pl-0 ' + cardDesk);
      const card = el('div', 'glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 card-hover tilt-3d gloss-edge text-center w-full');
      card.appendChild(el('div', 'text-lg md:text-xl font-extrabold text-accent-600 tracking-tight leading-tight mb-2', item.period || item.year));
      card.appendChild(el('h3', 'text-lg font-bold text-slate-900 dark:text-white mb-1', item.title));
      card.appendChild(el('p', 'text-xs text-slate-500 dark:text-slate-400', item.subtitle));
      cardWrap.appendChild(card);
      row.appendChild(cardWrap);

      return row;
    }

    buildIcon(iconKey) {
      const name = ICONS8[iconKey] || ICONS8.school;
      const img = document.createElement('img');
      img.className = 'i8 w-8 h-8';
      img.src = `https://img.icons8.com/3d-fluency/96/${name}.png`;
      img.alt = '';
      img.loading = 'lazy';
      return img;
    }
  }

  const registry = {
    mountEducation() {
      document.querySelectorAll('[data-education-group]').forEach((host) => {
        if (host._educationComponent) return;
        const options = {
          src: host.getAttribute('data-src') || 'data/education.json'
        };
        host._educationComponent = new EducationSection(host, options);
      });
    }
  };

  window.EducationSection = EducationSection;
  window.EducationComponentRegistry = registry;

  function init() {
    registry.mountEducation();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
