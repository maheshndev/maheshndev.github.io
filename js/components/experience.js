// ============================================================
// ExperienceSection component
// ------------------------------------------------------------
// Renders a vertical alternating timeline from JSON:
//   - company, role, period, bullet points
//
// Usage:
//   <div data-experience-group
//        data-src="data/experience.json"
//        data-title="Work Experience"></div>
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

  // Icons8 (3d-fluency) timeline icons, keyed by data/experience.json icon name
  const ICONS8 = {
    briefcase: 'briefcase',
    academic: 'graduation-cap'
  };

  // ============================================================
  // ExperienceSection
  // ============================================================
  class ExperienceSection {
    constructor(host, options, index) {
      this.host = host;
      this.src = options.src || 'data/experience.json';
      this.title = options.title || 'Work Experience';
      this.items = [];
      this.index = index;

      this.renderShell();
      this.load();
    }

    // ----- build the section skeleton inside the host -----
    renderShell() {
      if (this.title) {
        const titleWrap = el('div', 'mb-12');
        titleWrap.appendChild(el('h2', 'text-3xl font-extrabold text-gradient inline-block', this.title));
        this.host.appendChild(titleWrap);
      }

      const wrap = el('div', 'relative');
      wrap.appendChild(this.buildTimelineLine());

      // timeline container (keeps the original alternating layout)
      this.timeline = el(
        'div',
        'relative [perspective:1400px]'
      );
      wrap.appendChild(this.timeline);
      this.host.appendChild(wrap);
    }

    buildTimelineLine() {
      const lineWrap = el('div', 'absolute inset-y-0 left-6 md:left-1/2 -translate-x-1/2 w-0.5 pointer-events-none');
      const mobile = el('div', 'absolute inset-y-0 -left-px w-0.5 bg-slate-300 dark:bg-slate-600 md:hidden');
      const desktop = el('div', 'absolute inset-y-0 -left-px w-0.5 bg-gradient-to-b from-transparent via-slate-300 to-transparent dark:via-slate-600 hidden md:block');
      lineWrap.appendChild(mobile);
      lineWrap.appendChild(desktop);
      return lineWrap;
    }

    // ----- fetch data from JSON -----
    async load() {
      try {
        const res = await fetch(this.src, { cache: 'no-store' });
        if (!res.ok) throw new Error(`Failed to load ${this.src}: ${res.status}`);
        const data = await res.json();
        this.items = Array.isArray(data.experience) ? data.experience : [];
        this.render();
      } catch (err) {
        console.warn('[ExperienceSection] Unable to load experience', err);
        this.timeline.innerHTML = '<div class="text-sm text-slate-500">Unable to load experience.</div>';
      }
    }

    // ----- render all timeline items -----
    render() {
      const fragment = document.createDocumentFragment();
      this.items.forEach((item, index) => fragment.appendChild(this.buildItem(item, index)));
      this.timeline.innerHTML = '';
      this.timeline.appendChild(fragment);
      console.log('[ExperienceSection] rendered', this.items.length, 'positions');
    }

buildItem(item, index) {
    const isOdd = index % 2 === 1;

    // Desktop: card alternates left/right, icon centered on the line
    const cardWrapCls = isOdd ? 'md:order-3 md:ml-auto md:pl-12 md:pr-0' : 'md:order-1 md:mr-auto md:pr-12 md:pl-0';
    const yearWrapCls = isOdd ? 'md:order-1 md:mr-auto md:pr-12 md:pl-0 md:text-right' : 'md:order-3 md:ml-auto md:pl-12 md:pr-0 md:text-left';

    const row = el('div', 'relative flex flex-col md:flex-row items-center md:items-center mb-6 md:mb-10');

    // Horizontal connector from card to the center line
    const connector = el('div', 'hidden md:block absolute top-1/2 -translate-y-1/2 h-0.5 bg-slate-300 dark:bg-slate-600 ' + (isOdd
      ? 'left-[calc(50%+1.5rem)] w-[calc(8.333%+1.5rem)]'
      : 'right-[calc(50%+1.5rem)] w-[calc(8.333%+1.5rem)]'));
    row.appendChild(connector);

    // Timeline icon — on the left line (mobile) / centered on the line (desktop)
    const iconColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500'];
    const iconBox = el('div', 'absolute z-10 top-0 left-6 -translate-x-1/2 md:relative md:top-auto md:left-auto md:translate-x-0 md:order-2 flex-shrink-0 w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 shadow-lg flex items-center justify-center ' + iconColors[index % iconColors.length]);
    const name = ICONS8[item.icon] || ICONS8.briefcase;
    const img = document.createElement('img');
    img.className = 'i8 w-8 h-8';
    img.src = `https://img.icons8.com/3d-fluency/96/${name}.png`;
    img.alt = '';
    img.loading = 'lazy';
    iconBox.appendChild(img);
    row.appendChild(iconBox);

    // Card side
    const cardWrapper = el('div', 'w-full md:w-5/12 pl-16 md:pl-0 ' + cardWrapCls);
    const card = el('div', 'glass-card p-5 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 card-hover tilt-3d gloss-edge text-left w-full');
    card.appendChild(el('div', 'font-bold text-slate-900 dark:text-white', item.company));
    card.appendChild(el('time', 'font-inter text-[10px] font-medium text-accent-600 uppercase block mt-1', item.period));
    card.appendChild(el('div', 'text-slate-500 dark:text-slate-400 font-semibold text-sm mt-2', item.role));
    const body = el('div', 'text-slate-600 dark:text-slate-400 text-xs mt-2');
    const list = el('ul', 'list-disc ml-3 space-y-1');
    (item.points || []).forEach(point => list.appendChild(el('li', null, point)));
    body.appendChild(list);
    card.appendChild(body);
    cardWrapper.appendChild(card);
    row.appendChild(cardWrapper);

    // Year side (opposite the card)
    const yearText = item.period || item.year || '';
    const yearBox = el('div', 'hidden md:block md:w-5/12 ' + yearWrapCls);
    const yearInner = el('div', '');
    yearInner.appendChild(el('span', 'text-lg md:text-xl font-extrabold text-accent-600 tracking-tight leading-tight', yearText));
    if (item.current) {
      const currentBadge = el('span', 'inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800');
      currentBadge.textContent = 'CURRENT';
      yearInner.appendChild(currentBadge);
    }
    yearBox.appendChild(yearInner);
    row.appendChild(yearBox);

    return row;
  }
  }

  // ============================================================
  // ComponentRegistry — mounts any [data-experience-group]
  // ============================================================
  const registry = {
    mountExperience() {
      document.querySelectorAll('[data-experience-group]').forEach((host) => {
        if (host._experienceComponent) return;
        const options = {
          src: host.getAttribute('data-src') || 'data/experience.json',
          title: host.getAttribute('data-title') != null ? host.getAttribute('data-title') : 'Work Experience'
        };
        host._experienceComponent = new ExperienceSection(host, options);
      });
    }
  };

  // ----- exposure for other scripts (optional API) -----
  window.ExperienceSection = ExperienceSection;
  window.ExperienceComponentRegistry = registry;

  // ----- auto-init once DOM ready (idempotent) -----
  function init() {
    registry.mountExperience();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();