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

  // SVG paths for the two timeline icons used by this section
  const ICONS = {
    briefcase: [
      {
        fillRule: 'evenodd',
        d: 'M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z'
      },
      {
        d: 'M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z'
      }
    ],
    academic: [
      {
        d: 'M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2 .712V17a1 1 0 001 1z'
      }
    ]
  };

  // ============================================================
  // ExperienceSection
  // ============================================================
  class ExperienceSection {
    constructor(host, options) {
      this.host = host;
      this.src = options.src || 'data/experience.json';
      this.title = options.title || 'Work Experience';
      this.items = [];

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

      // timeline container (keeps the original alternating layout)
      this.timeline = el(
        'div',
        'relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent dark:before:via-slate-700'
      );
      this.host.appendChild(this.timeline);
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
      this.items.forEach(item => fragment.appendChild(this.buildItem(item)));
      this.timeline.innerHTML = '';
      this.timeline.appendChild(fragment);
      console.log('[ExperienceSection] rendered', this.items.length, 'positions');
    }

    buildItem(item) {
      // alternating content row (mirrors original markup)
      const row = el(
        'div',
        'relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group' +
        (item.current ? ' is-active' : '')
      );

      // timeline icon node
      const iconBox = el(
        'div',
        'flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2'
      );
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'w-5 h-5 text-accent-600');
      svg.setAttribute('fill', 'currentColor');
      svg.setAttribute('viewBox', '0 0 20 20');
      const paths = ICONS[item.icon] || ICONS.briefcase;
      paths.forEach(p => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        if (p.fillRule) {
          path.setAttribute('fill-rule', p.fillRule);
          path.setAttribute('clip-rule', p.fillRule);
        }
        path.setAttribute('d', p.d);
        svg.appendChild(path);
      });
      iconBox.appendChild(svg);
      row.appendChild(iconBox);

      // content card
      const card = el(
        'div',
        'w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 card-hover'
      );

      const head = el('div', 'flex items-center justify-between space-x-2 mb-1 flex-wrap gap-y-1');
      head.appendChild(el('div', 'font-bold text-slate-900 dark:text-white', item.company));
      const time = el('time', 'font-inter text-xs font-medium text-accent-600 uppercase', item.period);
      head.appendChild(time);
      card.appendChild(head);

      card.appendChild(el('div', 'text-slate-500 dark:text-slate-400 font-semibold text-sm mb-4', item.role));

      const body = el('div', 'text-slate-600 dark:text-slate-400 text-sm');
      const list = el('ul', 'list-disc ml-4 space-y-2');
      (item.points || []).forEach(point => list.appendChild(el('li', null, point)));
      body.appendChild(list);
      card.appendChild(body);

      row.appendChild(card);
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